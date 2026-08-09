import React, { useState } from 'react';
import {
  CheckCircle,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  PlayCircle,
  Calendar,
  CreditCard,
  Copyright,
  FileText,
  AlertTriangle,
  RotateCcw,
  Scale,
  Share2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { AudioPlayerModal } from './AudioPlayerModal';
import { LanguageSelector } from './LanguageSelector';
import { getLanguage } from '../data/languages';

export const ResultsView: React.FC<{
  docId: string;
  onBack: () => void;
  onAsk: (docId: string) => void;
}> = ({ docId, onBack, onAsk }) => {
  const { documents, selectedLanguage, translatingDocId, translateDocument } = useDocumentContext();
  const doc = documents.find((d) => d.id === docId);

  const [expandedFlagIds, setExpandedFlagIds] = useState<Record<string, boolean>>({});
  const [showShareToast, setShowShareToast] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  if (!doc) {
    return (
      <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-4">Document not found.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-sm"
        >
          Return to Scan
        </button>
      </div>
    );
  }

  const toggleFlagExpand = (flagId: string) => {
    setExpandedFlagIds((prev) => ({
      ...prev,
      [flagId]: !prev[flagId],
    }));
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: doc.title, text: doc.verdict });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      }
    }
  };

  // Determine top summary card styling based on overallRisk
  const isClear = doc.overallRisk === 'clear';
  const isWarning = doc.overallRisk === 'warning';
  const isHighRisk = doc.overallRisk === 'high';

  const cardBgClass = isClear
    ? 'bg-[#DCFCE7] dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    : isWarning
    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    : 'bg-[#FEE2E2] dark:bg-red-950/60 border-red-200 dark:border-red-800';

  const headlineText = isClear
    ? 'This document is mostly standard'
    : isWarning
    ? 'This document has mixed terms & risks'
    : 'High Risk Clauses Detected';

  const headlineColorClass = isClear
    ? 'text-[#166534] dark:text-emerald-300'
    : isWarning
    ? 'text-amber-900 dark:text-amber-200'
    : 'text-[#991B1B] dark:text-red-300';

  const bodyTextColorClass = isClear
    ? 'text-[#14532D] dark:text-emerald-200'
    : isWarning
    ? 'text-amber-800 dark:text-amber-300'
    : 'text-[#7F1D1D] dark:text-red-200';

  const iconColorClass = isClear
    ? 'text-[#16A34A]'
    : isWarning
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-[#DC2626]';

  return (
    <div className="flex-1 px-5 pb-36 pt-2 max-w-2xl mx-auto w-full flex flex-col gap-5">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
          Summary link copied to clipboard!
        </div>
      )}

      {/* Document Header Bar */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate px-2 text-center max-w-[105px] sm:max-w-[220px]">
          {doc.title}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Share Document"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {(doc.analysisLanguage || 'en-IN') !== selectedLanguage && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-3 flex items-center justify-between gap-3">
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            This analysis is in another language. Translate it to <strong>{getLanguage(selectedLanguage).nativeName}</strong> without changing original clause quotations.
          </p>
          <button
            onClick={() => void translateDocument(doc.id)}
            disabled={translatingDocId === doc.id}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 flex-none disabled:opacity-60"
          >
            {translatingDocId === doc.id && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {translatingDocId === doc.id ? 'Translating' : 'Translate'}
          </button>
        </div>
      )}

      {/* Top Summary Verdict Card */}
      <section className={`rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border ${cardBgClass}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            {isClear ? (
              <CheckCircle className={`w-6 h-6 ${iconColorClass}`} />
            ) : (
              <ShieldAlert className={`w-6 h-6 ${iconColorClass}`} />
            )}
          </div>
          <div>
            <h2 className={`text-lg font-bold leading-snug ${headlineColorClass}`}>
              {headlineText}
            </h2>
            <p className={`text-sm mt-1.5 leading-relaxed ${bodyTextColorClass}`}>
              {doc.verdict}
            </p>
          </div>
        </div>
      </section>

      {/* Key Takeaways Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Takeaways</h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {doc.takeaways.map((takeaway, idx) => {
            // Assign icons based on takeaway content keywords
            const isDate = takeaway.toLowerCase().includes('notice') || takeaway.toLowerCase().includes('days') || takeaway.toLowerCase().includes('date');
            const isPay = takeaway.toLowerCase().includes('payment') || takeaway.toLowerCase().includes('fee') || takeaway.toLowerCase().includes('cost') || takeaway.toLowerCase().includes('$');
            const isProp = takeaway.toLowerCase().includes('ownership') || takeaway.toLowerCase().includes('property') || takeaway.toLowerCase().includes('intellectual');

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-[16px] p-4 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700/80 flex items-start gap-3"
              >
                <div className="mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {isDate ? (
                    <Calendar className="w-5 h-5" />
                  ) : isPay ? (
                    <CreditCard className="w-5 h-5" />
                  ) : isProp ? (
                    <Copyright className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{takeaway}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Red Flags Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-base font-bold text-red-600 dark:text-red-400">Red Flags</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 ml-auto">
            {doc.redFlags.length} {doc.redFlags.length === 1 ? 'Clause' : 'Clauses'}
          </span>
        </div>

        {doc.redFlags.length === 0 ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>No critical red flags or high-risk clauses were detected in this text.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {doc.redFlags.map((flag) => {
              const isExpanded = !!expandedFlagIds[flag.id];
              return (
                <div
                  key={flag.id}
                  className="bg-[#FEE2E2] dark:bg-red-950/40 rounded-[18px] p-4 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-red-200 dark:border-red-900/50 flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#DC2626] dark:text-red-400 flex-shrink-0">
                      {flag.title.toLowerCase().includes('renew') ? (
                        <RotateCcw className="w-5 h-5" />
                      ) : flag.title.toLowerCase().includes('indemni') || flag.title.toLowerCase().includes('legal') ? (
                        <Scale className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-base font-bold text-[#991B1B] dark:text-red-300">
                        {flag.title}
                      </h4>
                      <p className="text-sm text-[#7F1D1D] dark:text-red-200 mt-1 leading-relaxed">
                        {flag.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Expand / View in document Toggle */}
                  <div className="flex flex-col border-t border-red-300/60 dark:border-red-800/60 pt-2.5 mt-1">
                    <button
                      onClick={() => toggleFlagExpand(flag.id)}
                      className="flex items-center justify-end gap-1 text-xs font-bold text-[#DC2626] dark:text-red-400 hover:opacity-80 transition-opacity self-end"
                    >
                      <span>{isExpanded ? 'Hide clause text' : 'View in document'}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/60 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed italic animate-in fade-in slide-in-from-top-1">
                        "{flag.sourceClause}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 shadow-[0_-4px_15px_rgba(0,0,0,0.06)] z-40 flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => onAsk(doc.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-2 text-base font-bold shadow-md transition-all"
        >
          <HelpCircle className="w-5 h-5 fill-white text-blue-600" />
          <span>Ask DocWise</span>
        </button>

        <button
          onClick={() => setShowAudioModal(true)}
          aria-label="Listen to audio walkthrough"
          className="w-12 h-12 flex-shrink-0 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all shadow-xs border border-blue-200 dark:border-blue-800"
          title="Audio Walkthrough"
        >
          <PlayCircle className="w-7 h-7 fill-blue-600 text-blue-50 dark:text-slate-900" />
        </button>
      </div>

      {/* Audio Walkthrough Modal */}
      <AudioPlayerModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        title={doc.title}
        verdict={doc.verdict}
        takeaways={doc.takeaways}
      />
    </div>
  );
};
