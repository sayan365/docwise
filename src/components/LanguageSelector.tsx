import React from 'react';
import { Languages } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../data/languages';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { selectedLanguage, setSelectedLanguage } = useDocumentContext();
  const current = SUPPORTED_LANGUAGES.find((language) => language.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <label className="relative flex items-center text-slate-600 dark:text-slate-300" title="Explanation language">
      <Languages className="w-4 h-4 absolute left-2.5 pointer-events-none text-blue-600 dark:text-blue-400" />
      <select
        value={selectedLanguage}
        onChange={(event) => setSelectedLanguage(event.target.value as LanguageCode)}
        aria-label="Explanation language"
        className={`appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-8 pr-2 py-2 text-xs font-bold focus:outline-none ${compact ? 'w-[92px]' : 'w-full'}`}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {compact ? `${language.short} · ${language.nativeName}` : `${language.nativeName} — ${language.name}`}
          </option>
        ))}
      </select>
    </label>
  );
};
