import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Vite reads .env.local automatically, but the Express process does not.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });
dotenv.config({ quiet: true });

const app = express();
app.use(express.json({ limit: "35mb" }));

function pcmToWavBase64(base64Pcm: string, sampleRate = 24000) {
  const pcm = Buffer.from(base64Pcm, "base64");
  const wav = Buffer.alloc(44 + pcm.length);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + pcm.length, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(pcm.length, 40);
  pcm.copy(wav, 44);
  return wav.toString("base64");
}

async function withGeminiRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const retryable = error?.status === 429 || error?.status === 503;
      if (!retryable || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * 2 ** attempt));
    }
  }
  throw lastError;
}

// Helper to get GoogleGenAI instance safely
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "DocWise",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API: Analyze Document
app.post("/api/analyze-document", async (req, res) => {
  try {
    const { text, fileData, mimeType, fileName, outputLanguage } = req.body;
    const languageName = outputLanguage?.name || "English";

    if (!text && !fileData) {
      return res.status(400).json({ error: "Document text or file is required" });
    }

    const ai = getAI();

    const parts: any[] = [];

    if (fileData && mimeType) {
      parts.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType,
        },
      });
    }

    const promptText = `
Analyze the following document or document excerpt for legal, contractual, or financial jargon.
Translate complex language into clear, everyday language, highlight key takeaways, and flag any potentially risky or restrictive clauses (red flags).

File Name: ${fileName || "Uploaded Document"}
${text ? `Document Text:\n"""\n${text}\n"""` : ""}

Please provide a concise document title, classify into a category (Contracts, Leases, Insurance, Financial), give a clear 1-line verdict, an overall risk level ('clear', 'warning', or 'high'), a list of 3-5 everyday-language key takeaways, and a list of red flags with titles, clear explanations, severity ('high', 'medium', or 'low'), and the exact or approximate source clause snippet from the document.

Write the title, verdict, takeaways, red-flag titles, explanations, and documentContext in ${languageName}. Keep category, overallRisk, and severity enum values in English exactly as specified. Preserve every sourceClause in its original document language; do not translate quotations. Preserve names, dates, section numbers, and monetary amounts exactly.
`;

    parts.push({ text: promptText });

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction:
          `You are a careful document explainer called DocWise. Analyze the supplied document and return strict JSON in ${languageName}, except for fixed enum values and original source quotations. Never include extra prose outside the JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A clear, concise title for the document.",
            },
            category: {
              type: Type.STRING,
              description: "Category of document: Contracts, Leases, Insurance, or Financial.",
            },
            verdict: {
              type: Type.STRING,
              description: "A 1-2 sentence plain-English verdict on the overall document safety.",
            },
            overallRisk: {
              type: Type.STRING,
              description: "Overall risk level: 'clear', 'warning', or 'high'.",
            },
            takeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-5 plain-English key takeaway bullet points.",
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Short bold title for the red flag clause.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "One-line plain-English explanation of why this clause poses a risk.",
                  },
                  severity: {
                    type: Type.STRING,
                    description: "Severity level: 'high', 'medium', or 'low'.",
                  },
                  sourceClause: {
                    type: Type.STRING,
                    description: "The original legal clause text snippet from the document.",
                  },
                },
                required: ["title", "explanation", "severity", "sourceClause"],
              },
              description: "List of red flag clauses found in the document.",
            },
            documentContext: {
              type: Type.STRING,
              description: "A detailed, faithful plain-text outline of the document's parties, obligations, dates, amounts, definitions, restrictions, and important clauses for later follow-up questions.",
            },
          },
          required: ["title", "category", "verdict", "overallRisk", "takeaways", "redFlags", "documentContext"],
        },
      },
    }));

    const jsonText = response.text ? response.text.trim() : "";
    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", jsonText);
      return res.status(500).json({ error: "Failed to parse analysis response from AI." });
    }

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error("Error analyzing document:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while analyzing the document.",
    });
  }
});

app.post("/api/translate-analysis", async (req, res) => {
  try {
    const { analysis, outputLanguage } = req.body;
    if (!analysis || !outputLanguage?.name) {
      return res.status(400).json({ error: "Analysis and output language are required" });
    }

    const ai = getAI();
    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Translate this existing document analysis into ${outputLanguage.name}. Translate title, verdict, takeaways, red-flag titles and explanations, and documentContext. Keep severity values in English. Preserve every sourceClause exactly in its original language. Preserve names, dates, monetary amounts, and section numbers. Return no facts that are not present in the input.\n\n${JSON.stringify(analysis)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verdict: { type: Type.STRING },
            takeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  sourceClause: { type: Type.STRING },
                },
                required: ["title", "explanation", "severity", "sourceClause"],
              },
            },
            documentContext: { type: Type.STRING },
          },
          required: ["title", "verdict", "takeaways", "redFlags", "documentContext"],
        },
      },
    }));

    return res.json({ success: true, data: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("Error translating analysis:", error);
    return res.status(error?.status === 503 ? 503 : 500).json({
      error: error?.status === 503 ? "The translation service is busy. Please try again shortly." : error.message || "Translation failed",
    });
  }
});

// API: Ask Questions about Document
app.post("/api/ask-document", async (req, res) => {
  try {
    const {
      documentTitle,
      documentText,
      documentFileData,
      documentMimeType,
      documentAnalysis,
      question,
      conversationHistory,
      outputLanguage,
    } = req.body;
    const languageName = outputLanguage?.name || "English";

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const ai = getAI();

    const historyPrompt = Array.isArray(conversationHistory)
      ? conversationHistory
          .map((m: any, index: number) =>
            `[Message ${index + 1} — ${m.role === "user" ? "User" : "DocWise"}]\n${m.text}`
          )
          .join("\n")
      : "";

    const promptText = `You are answering a follow-up question about one specific document.

DOCUMENT TITLE
${documentTitle || "Document"}

SAVED ANALYSIS
${documentAnalysis ? JSON.stringify(documentAnalysis, null, 2) : "No saved analysis available."}

${documentText ? `EXTRACTED DOCUMENT TEXT\n---\n${documentText}\n---\n` : "The original uploaded file is attached to this request. Read it directly before answering.\n"}
FULL CONVERSATION HISTORY (oldest to newest)
${historyPrompt || "No previous messages."}

CURRENT USER QUESTION
${question}

Answer the current question in clear, everyday language using the original document, saved analysis, and all relevant prior messages. Resolve references such as “it”, “that clause”, and “the previous point” from the conversation history. Do not claim the document is missing when an original file is attached. Never treat placeholder text such as “Document file scanned” as document content. If the document truly does not contain the answer, say exactly what is absent.
Write the answer and highlightChips in ${languageName}, regardless of the language used in the question. Keep sourceQuote in the original document language and preserve names, dates, amounts, and section numbers exactly.
Return a structured JSON object containing:
- "answer": plain English response explaining the answer clearly.
- "highlightChips": string array of 1-3 short key highlights or warnings (e.g. ["Requires 60-day notice", "Penalty applies"]).
- "sourceQuote": optional original clause snippet quoted from the document if relevant.
`;

    const parts: any[] = [];
    if (documentFileData && documentMimeType) {
      parts.push({ inlineData: { data: documentFileData, mimeType: documentMimeType } });
    }
    parts.push({ text: promptText });

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction:
          `You are DocWise, a careful document explainer. Maintain continuity across the complete supplied conversation, ground every factual claim in the supplied document or saved analysis, and respond in ${languageName}. Return strict JSON with answer, highlightChips array, and optional sourceQuote.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "Clear plain-English answer to the user's question.",
            },
            highlightChips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short key highlight or warning pills.",
            },
            sourceQuote: {
              type: Type.STRING,
              description: "Optional original clause snippet quoted from the text.",
            },
          },
          required: ["answer", "highlightChips"],
        },
      },
    }));

    const jsonText = response.text ? response.text.trim() : "";
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      data = {
        answer: response.text || "Here is what I found regarding your question.",
        highlightChips: [],
      };
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Error asking document:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while getting an answer.",
    });
  }
});

// API: Text-to-Speech audio walkthrough
app.post("/api/tts", async (req, res) => {
  try {
    const { text, outputLanguage } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS" });
    }

    const ai = getAI();
    const languageName = outputLanguage?.name || "English";
    const languageCode = outputLanguage?.code || "en-IN";
    let speechText = text;

    if (languageCode !== "en-IN") {
      const translation = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Translate the following document summary into ${languageName}. Preserve names, dates, monetary amounts, and section numbers exactly. Return only the translation, with no introduction:\n\n${text}`,
      }));
      speechText = translation.text?.trim() || text;
    }

    const response = await withGeminiRetry(() => ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Speak this ${languageName} document summary clearly in a warm, professional voice. Read only the summary:\n${speechText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          languageCode,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    }));

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = audioData?.data;
    if (base64Audio) {
      const isRawPcm = audioData?.mimeType?.toLowerCase().includes("l16");
      return res.json({
        success: true,
        audioBase64: isRawPcm ? pcmToWavBase64(base64Audio) : base64Audio,
        mimeType: isRawPcm ? "audio/wav" : audioData?.mimeType || "audio/wav",
      });
    } else {
      return res.status(500).json({ error: "Audio generation returned empty result" });
    }
  } catch (error: any) {
    console.error("Error generating TTS:", error);
    return res.status(500).json({ error: error.message || "Failed to generate audio walkthrough" });
  }
});

export default app;
