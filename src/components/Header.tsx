import React from 'react';
import { ArrowLeft, Shield, History as HistoryIcon, Moon, Sun, Share2 } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC<{
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showShare?: boolean;
  onShare?: () => void;
}> = ({ title, showBack, onBack, showShare, onShare }) => {
  const { isDarkMode, toggleDarkMode, setActiveTab } = useDocumentContext();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center w-full px-5 h-16 sticky top-0 z-40 transition-colors shadow-xs">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div
            onClick={() => setActiveTab('scan')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="max-[379px]:hidden text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              DocWise
            </span>
          </div>
        )}

        {title && (
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs ml-2">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <LanguageSelector compact />
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {showShare && onShare ? (
          <button
            onClick={onShare}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('history')}
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="History"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white items-center justify-center border border-blue-200 dark:border-blue-800 shadow-xs" aria-label="DocWise profile">
              <span className="text-[11px] font-extrabold tracking-tight">DW</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
