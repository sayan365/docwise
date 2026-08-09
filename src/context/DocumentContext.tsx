import React, { createContext, useContext, useState, useEffect } from 'react';
import { DocumentItem, ActiveTab, DocCategory, ChatMessage } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/samples';
import { loadStoredDocuments, storeDocuments } from '../data/documentStorage';

interface DocumentContextType {
  documents: DocumentItem[];
  activeDocId: string | null;
  activeDoc: DocumentItem | null;
  activeTab: ActiveTab;
  isAnalyzing: boolean;
  analysisStep: string;
  isDarkMode: boolean;
  searchQuery: string;
  filterCategory: string;
  isDataReady: boolean;
  setActiveDocId: (id: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  toggleDarkMode: () => void;
  scanSample: (sampleId: string) => Promise<string>;
  scanDocumentText: (title: string, text: string, category?: DocCategory) => Promise<string>;
  scanDocumentFile: (file: File) => Promise<string>;
  askQuestion: (docId: string, question: string) => Promise<void>;
  deleteDocument: (id: string) => void;
  resetSampleData: () => void;
  clearDocuments: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Initial default pre-analyzed documents so history is rich on launch
const INITIAL_DOCUMENTS: DocumentItem[] = SAMPLE_DOCUMENTS.map((sample) => ({
  id: sample.id,
  title: sample.sampleAnalysis.title,
  category: sample.sampleAnalysis.category,
  scannedDate: 'Scanned Oct 12, 2023',
  verdict: sample.sampleAnalysis.verdict,
  overallRisk: sample.sampleAnalysis.overallRisk,
  sourceText: sample.rawText,
  takeaways: sample.sampleAnalysis.takeaways,
  redFlags: sample.sampleAnalysis.redFlags,
  redFlagsCount: sample.sampleAnalysis.redFlags.length,
  chatThread: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Hi! I'm ready to answer questions about ${sample.sampleAnalysis.title}. What would you like to know?`,
      timestamp: 'Ready',
    },
  ],
}));

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedTab = localStorage.getItem('jargonbuster-active-tab') as ActiveTab | null;
    return savedTab && ['scan', 'history', 'insights', 'settings'].includes(savedTab) ? savedTab : 'scan';
  });
  const [isDataReady, setIsDataReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('jargonbuster-theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    let cancelled = false;
    loadStoredDocuments()
      .then((storedDocuments) => {
        if (cancelled) return;
        const restoredDocuments = storedDocuments ?? INITIAL_DOCUMENTS;
        setDocuments(restoredDocuments);
        setActiveDocId(restoredDocuments[0]?.id || null);
      })
      .catch((error) => {
        console.warn('Could not load the local document cache:', error);
        if (!cancelled) {
          setDocuments(INITIAL_DOCUMENTS);
          setActiveDocId(INITIAL_DOCUMENTS[0]?.id || null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsDataReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDataReady) return;
    void storeDocuments(documents).catch((error) =>
      console.warn('Could not save the local document cache:', error)
    );
  }, [documents, isDataReady]);

  useEffect(() => {
    localStorage.setItem('jargonbuster-active-tab', activeTab);
  }, [activeTab]);

  // Toggle dark mode class on HTML document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('jargonbuster-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Function to analyze text using Express backend -> Gemini API
  const analyzeWithAI = async (
    title: string,
    text: string,
    fileData?: string,
    mimeType?: string,
    suggestedCategory?: DocCategory
  ): Promise<DocumentItem> => {
    setIsAnalyzing(true);
    setAnalysisStep('Uploading & extracting document text...');

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisStep('Scanning fine print with Gemini AI...');

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fileData,
          mimeType,
          fileName: title,
        }),
      });

      setAnalysisStep('Categorizing clauses & calculating risk score...');
      await new Promise((r) => setTimeout(r, 300));

      if (!response.ok) {
        throw new Error('Server returned an error while analyzing');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to process document');
      }

      const data = result.data;
      const newDocId = `doc-${Date.now()}`;
      const now = new Date();
      const dateStr = `Scanned ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      const newDoc: DocumentItem = {
        id: newDocId,
        title: data.title || title || 'Scanned Document',
        category: (data.category as DocCategory) || suggestedCategory || 'Contracts',
        scannedDate: dateStr,
        verdict: data.verdict || 'Analysis complete.',
        overallRisk: (data.overallRisk as any) || 'warning',
        sourceText: text || '',
        fileData,
        fileName: title,
        fileMimeType: mimeType,
        analysisContext: data.documentContext || [
          data.verdict,
          ...(data.takeaways || []),
          ...(data.redFlags || []).flatMap((flag: { title?: string; explanation?: string; sourceClause?: string }) =>
            [flag.title, flag.explanation, flag.sourceClause].filter(Boolean)
          ),
        ].filter(Boolean).join('\n'),
        takeaways: data.takeaways || ['No specific key takeaways detected.'],
        redFlags: (data.redFlags || []).map((rf: any, index: number) => ({
          id: `rf-${newDocId}-${index}`,
          title: rf.title || 'Risk Clause',
          explanation: rf.explanation || 'Potential legal risk detected.',
          severity: rf.severity || 'medium',
          sourceClause: rf.sourceClause || 'Source text unavailable',
        })),
        redFlagsCount: (data.redFlags || []).length,
        chatThread: [
          {
            id: `msg-welcome-${newDocId}`,
            role: 'assistant',
            text: `Hi! I've finished analyzing ${data.title || title}. What would you like to ask about this document?`,
            timestamp: 'Just now',
          },
        ],
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    } catch (err) {
      console.error('Document analysis failed:', err);
      throw new Error('We could not analyze this document. Check your connection and API configuration, then try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Sample scanner
  const scanSample = async (sampleId: string): Promise<string> => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return '';

    // Check if we already have this sample in documents
    const existing = documents.find((d) => d.id === sample.id);
    if (existing) {
      setActiveDocId(existing.id);
      return existing.id;
    }

    const newDoc = await analyzeWithAI(
      sample.sampleAnalysis.title,
      sample.rawText,
      undefined,
      undefined,
      sample.category
    );
    setActiveDocId(newDoc.id);
    return newDoc.id;
  };

  // Direct text scan
  const scanDocumentText = async (title: string, text: string, category?: DocCategory): Promise<string> => {
    const newDoc = await analyzeWithAI(title, text, undefined, undefined, category);
    setActiveDocId(newDoc.id);
    return newDoc.id;
  };

  // File upload scan (read as Base64 or Text)
  const scanDocumentFile = async (file: File): Promise<string> => {
    const maxFileSize = 20 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new Error('This file is larger than 20 MB. Choose a smaller document.');
    }

    setIsAnalyzing(true);
    setAnalysisStep(`Reading ${file.name}...`);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        setIsAnalyzing(false);
        setAnalysisStep('');
        reject(new Error('The file could not be read. Please try another file.'));
      };

      // If text file
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const newDoc = await analyzeWithAI(file.name, content, undefined, undefined, 'Contracts');
            setActiveDocId(newDoc.id);
            resolve(newDoc.id);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      } else {
        // Image or PDF read as base64
        reader.onload = async (e) => {
          try {
            const base64Data = (e.target?.result as string).split(',')[1];
            const newDoc = await analyzeWithAI(file.name, '', base64Data, file.type, 'Contracts');
            setActiveDocId(newDoc.id);
            resolve(newDoc.id);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Ask question about document
  const askQuestion = async (docId: string, question: string) => {
    const targetDoc = documents.find((d) => d.id === docId);
    if (!targetDoc) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistically update user message
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              chatThread: [...d.chatThread, userMsg],
            }
          : d
      )
    );

    try {
      const res = await fetch('/api/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: targetDoc.title,
          documentText: targetDoc.sourceText,
          documentFileData: targetDoc.fileData,
          documentMimeType: targetDoc.fileMimeType,
          documentAnalysis: {
            verdict: targetDoc.verdict,
            overallRisk: targetDoc.overallRisk,
            takeaways: targetDoc.takeaways,
            redFlags: targetDoc.redFlags,
            analysisContext: targetDoc.analysisContext,
          },
          question,
          conversationHistory: targetDoc.chatThread,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const json = await res.json();

      const aiData = json.data;
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: aiData.answer || 'Here is what I found.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        highlightChips: aiData.highlightChips || [],
        sourceQuote: aiData.sourceQuote,
      };

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                chatThread: [...d.chatThread, aiMsg],
              }
            : d
        )
      );
    } catch {
      const normalizedQuestion = question.toLowerCase();
      const keywordGroups = normalizedQuestion.includes('renew')
        ? ['renew', 'notice']
        : normalizedQuestion.includes('cancel') || normalizedQuestion.includes('terminat')
          ? ['cancel', 'terminat', 'notice', 'early']
          : normalizedQuestion.includes('fee') || normalizedQuestion.includes('cost') || normalizedQuestion.includes('pay')
            ? ['fee', 'cost', 'payment', 'pay', '$', 'charge']
            : normalizedQuestion.includes('liab') || normalizedQuestion.includes('penalty')
              ? ['liab', 'indemni', 'penalty', 'responsib']
              : normalizedQuestion.includes('risk')
                ? ['risk']
                : [];
      const matchingFlags = targetDoc.redFlags.filter((flag) => {
        const searchable = `${flag.title} ${flag.explanation} ${flag.sourceClause}`.toLowerCase();
        return keywordGroups.some((keyword) => searchable.includes(keyword));
      });
      const matchingTakeaways = targetDoc.takeaways.filter((takeaway) =>
        keywordGroups.some((keyword) => takeaway.toLowerCase().includes(keyword))
      );
      const bestFlag = matchingFlags[0] || (normalizedQuestion.includes('risk') ? targetDoc.redFlags[0] : undefined);
      const groundedPoints = [bestFlag?.explanation, ...matchingTakeaways].filter(Boolean).slice(0, 2) as string[];

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: groundedPoints.length
          ? `Based on the saved analysis: ${groundedPoints.join(' ')}`
          : `I couldn't reach the AI service, and the saved analysis does not contain enough information to answer that question reliably.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        highlightChips: bestFlag ? [`${bestFlag.severity.toUpperCase()} risk: ${bestFlag.title}`] : [],
        sourceQuote: bestFlag?.sourceClause,
      };

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                chatThread: [...d.chatThread, aiMsg],
              }
            : d
        )
      );
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  };

  const resetSampleData = () => {
    setDocuments((currentDocuments) => {
      const sampleIds = new Set(INITIAL_DOCUMENTS.map((document) => document.id));
      const userDocuments = currentDocuments.filter((document) => !sampleIds.has(document.id));
      return [...userDocuments, ...INITIAL_DOCUMENTS];
    });
    setActiveDocId(INITIAL_DOCUMENTS[0].id);
  };

  const clearDocuments = () => {
    setDocuments([]);
    setActiveDocId(null);
    setSearchQuery('');
    setFilterCategory('All');
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocId,
        activeDoc,
        activeTab,
        isAnalyzing,
        analysisStep,
        isDarkMode,
        searchQuery,
        filterCategory,
        isDataReady,
        setActiveDocId,
        setActiveTab,
        setSearchQuery,
        setFilterCategory,
        toggleDarkMode,
        scanSample,
        scanDocumentText,
        scanDocumentFile,
        askQuestion,
        deleteDocument,
        resetSampleData,
        clearDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};
