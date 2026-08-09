import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Shield,
  RotateCcw,
  Database,
  Check,
  Trash2,
  HardDrive,
  Languages,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { LanguageSelector } from './LanguageSelector';
import { getLanguage } from '../data/languages';

export const SettingsView: React.FC = () => {
  const { documents, isDarkMode, toggleDarkMode, resetSampleData, clearDocuments, selectedLanguage } = useDocumentContext();
  const [resetDone, setResetDone] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleReset = () => {
    resetSampleData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearDocuments();
    setConfirmClear(false);
  };

  return (
    <div className="flex-1 px-5 pb-28 pt-4 max-w-2xl mx-auto w-full flex flex-col gap-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          App preferences & privacy controls.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dark Theme Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust app colors for night reading
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            role="switch"
            aria-checked={isDarkMode}
            aria-label="Toggle dark theme"
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Language & Voice</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-none">
            <Languages className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explanation Language</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Results, answers, and audio use {getLanguage(selectedLanguage).nativeName}</p>
          </div>
        </div>
        <LanguageSelector />
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Original clause quotations remain in the document's source language to prevent meaning from being altered.</p>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Local Data
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Restore Sample Documents
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore demos without removing your uploads
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
          >
            {resetDone ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Restored</span>
              </>
            ) : (
              <span>Restore</span>
            )}
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center flex-none">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear Document History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Remove {documents.length} saved {documents.length === 1 ? 'document' : 'documents'} from this browser</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
            disabled={documents.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-none disabled:opacity-40 ${confirmClear ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950'}`}
          >
            {confirmClear ? 'Confirm' : 'Clear'}
          </button>
        </div>
      </section>

      {/* Privacy & AI Info */}
      <section className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Privacy & Processing
          </h2>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
          <p className="flex gap-2"><HardDrive className="w-4 h-4 flex-none text-blue-600" /><span><strong>Saved on this device:</strong> Documents, analyses, and conversations are stored in this browser using IndexedDB so History and Insights survive refreshes.</span></p>
          <p className="flex gap-2"><Database className="w-4 h-4 flex-none text-violet-600" /><span><strong>AI processing:</strong> Submitted content is sent to the configured Gemini service for analysis. Avoid uploading information you are not authorized to share.</span></p>
          <p className="flex gap-2"><Shield className="w-4 h-4 flex-none text-emerald-600" /><span><strong>No app database:</strong> This project does not send your document history to its own database. Clearing browser site data will also clear the local cache.</span></p>
        </div>
      </section>
    </div>
  );
};
