import React, { useState, useRef } from 'react';
import { Camera, FileText, Upload, Sparkles, AlertCircle, RefreshCw, ScanLine } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { SAMPLE_DOCUMENTS } from '../data/samples';

export const ScanView: React.FC<{ onNavigateToResults: (docId: string) => void }> = ({
  onNavigateToResults,
}) => {
  const {
    scanSample,
    scanDocumentFile,
    scanDocumentText,
    isAnalyzing,
    analysisStep,
  } = useDocumentContext();

  const [isDragging, setIsDragging] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSampleClick = async (sampleId: string) => {
    try {
      setErrorMessage('');
      const docId = await scanSample(sampleId);
      if (docId) onNavigateToResults(docId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze sample document.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage('');
      const docId = await scanDocumentFile(file);
      if (docId) onNavigateToResults(docId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to scan document file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setErrorMessage('');
      const docId = await scanDocumentFile(file);
      if (docId) onNavigateToResults(docId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process dropped file.');
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    try {
      setErrorMessage('');
      setShowPasteModal(false);
      const title = pastedTitle.trim() || 'Pasted Agreement';
      const docId = await scanDocumentText(title, pastedText);
      setPastedText('');
      setPastedTitle('');
      if (docId) onNavigateToResults(docId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze pasted text.');
    }
  };

  return (
    <div className="flex-1 px-5 pb-28 pt-4 flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Hero Section */}
      <section className="text-center pt-2 pb-1 flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Decode Any Document in Seconds
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-md leading-relaxed">
          Snap a photo or upload a PDF to uncover hidden terms, costs, and key takeaways.
        </p>
      </section>

      {/* Loading Overlay State */}
      {isAnalyzing ? (
        <div className="bg-white dark:bg-slate-800 rounded-[20px] p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center animate-pulse py-12">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Analyzing Document with Gemini AI
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {analysisStep || 'Scanning clauses and translating legalese...'}
          </p>
          <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-blue-600 h-full animate-[shimmer_1.5s_infinite] w-3/4 rounded-full" />
          </div>
        </div>
      ) : (
        /* Drop Zone Card */
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`bg-white dark:bg-slate-800/90 rounded-[20px] shadow-[0_4px_6px_rgba(0,0,0,0.05)] border-2 border-dashed p-6 sm:p-8 flex flex-col items-center text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'
          }`}
        >
          {/* Scanner Illustration */}
          <div className="w-28 h-28 mb-5 relative flex items-center justify-center bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
            <ScanLine className="w-14 h-14 text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-x-3 top-1/2 h-[2px] bg-blue-600 dark:bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full sm:w-auto sm:px-10 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Camera className="w-5 h-5" />
            <span>Scan Document</span>
          </button>

          {/* Secondary Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline underline-offset-4 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF / Image from Files</span>
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
            <button
              onClick={() => setShowPasteModal(true)}
              className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-slate-200 underline underline-offset-4 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Paste Text</span>
            </button>
          </div>
        </section>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Start Sample Pills */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">
            Or Try a Sample Document
          </h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Click to demo
          </span>
        </div>

        <div className="flex overflow-x-auto gap-2.5 pb-2 -mx-5 px-5 no-scrollbar scroll-smooth">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              disabled={isAnalyzing}
              className="whitespace-nowrap bg-white dark:bg-slate-800 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700/80 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <span className="text-lg">{sample.icon}</span>
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Paste Text Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="paste-dialog-title" onMouseDown={(e) => e.target === e.currentTarget && setShowPasteModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 id="paste-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Paste Agreement or Contract Text
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Paste fine print, lease clauses, terms of service, or agreement text below.
            </p>
            <form onSubmit={handlePasteSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Document Title (e.g. Storage Agreement)"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <textarea
                rows={6}
                placeholder="Paste original document text here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Text
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
