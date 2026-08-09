import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ArrowUp,
  HelpCircle,
  Flag,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export const AskView: React.FC<{
  docId: string;
  onBack: () => void;
}> = ({ docId, onBack }) => {
  const { documents, askQuestion } = useDocumentContext();
  const doc = documents.find((d) => d.id === docId);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What happens if I cancel early?',
    'Are there any hidden fees?',
    'Explain the auto-renewal clause',
    'What is my liability or penalty?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [doc?.chatThread, isSending]);

  if (!doc) {
    return (
      <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Document not found.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-sm"
        >
          Return to History
        </button>
      </div>
    );
  }

  const handleSend = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || isSending) return;

    setInputQuestion('');
    setIsSending(true);

    try {
      await askQuestion(doc.id, text);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputQuestion);
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
            Ask JargonBuster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
            {doc.title}
          </p>
        </div>

        <button
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Messages Canvas */}
      <main className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        {/* Timestamp Header */}
        <div className="flex justify-center my-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-3 py-1 rounded-full">
            {doc.chatThread[0]?.timestamp || 'Today'}
          </span>
        </div>

        {/* Message Thread */}
        {doc.chatThread.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 max-w-[88%] sm:max-w-[82%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-1">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-[0_2px_4px_rgba(0,0,0,0.04)] ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={index}>{part.slice(2, -2)}</strong>
                      : <React.Fragment key={index}>{part}</React.Fragment>
                  )}
                </p>

                {/* Inline Highlight Chips */}
                {msg.highlightChips && msg.highlightChips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {msg.highlightChips.map((chip, idx) => {
                      const isDanger =
                        chip.toLowerCase().includes('notice') ||
                        chip.toLowerCase().includes('penalty') ||
                        chip.toLowerCase().includes('fee') ||
                        chip.toLowerCase().includes('required') ||
                        chip.toLowerCase().includes('high risk') ||
                        chip.toLowerCase().includes('unavailable');
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isDanger
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isDanger ? (
                            <Flag className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          <span>{chip}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Quoted Source Clause */}
                {msg.sourceQuote && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 italic">
                    "{msg.sourceQuote}"
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex items-end gap-2.5 max-w-[80%] self-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mb-1">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-xs border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing document context...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Sticky Input Area */}
      <div className="flex-none w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 z-40">
        <div className="max-w-2xl mx-auto w-full px-5">
          {/* Suggested Question Chips */}
          <div className="w-full overflow-x-auto no-scrollbar pb-2 flex gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isSending}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 pl-4 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
          >
            <input
              type="text"
              placeholder="Ask about this document..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 py-1"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isSending}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
