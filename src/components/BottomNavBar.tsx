import React from 'react';
import { Camera, History as HistoryIcon, Sparkles, Settings } from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { ActiveTab } from '../types';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useDocumentContext();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'scan', label: 'Scan', icon: <Camera className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <HistoryIcon className="w-5 h-5" /> },
    { id: 'insights', label: 'Insights', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg rounded-t-2xl px-4 py-2 flex justify-around items-center transition-colors">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[64px] rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="relative flex items-center justify-center">
              {tab.icon}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </div>
            <span className="text-xs mt-1.5 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
