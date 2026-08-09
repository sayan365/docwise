import React, { useState } from 'react';
import { DocumentProvider, useDocumentContext } from './context/DocumentContext';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { ScanView } from './components/ScanView';
import { ResultsView } from './components/ResultsView';
import { HistoryView } from './components/HistoryView';
import { AskView } from './components/AskView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const { activeTab, setActiveTab, setActiveDocId, isDataReady } = useDocumentContext();

  const [currentScreen, setCurrentScreen] = useState<'main' | 'results' | 'ask'>('main');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Navigate to results for a document
  const handleNavigateToResults = (docId: string) => {
    setSelectedDocId(docId);
    setActiveDocId(docId);
    setCurrentScreen('results');
  };

  // Navigate to ask chat for a document
  const handleNavigateToAsk = (docId: string) => {
    setSelectedDocId(docId);
    setActiveDocId(docId);
    setCurrentScreen('ask');
  };

  // Navigate back to main views
  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  if (!isDataReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="w-9 h-9 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <span className="text-sm font-semibold">Loading your documents…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col antialiased">
      {/* View routing */}
      {currentScreen === 'results' && selectedDocId ? (
        <ResultsView
          docId={selectedDocId}
          onBack={handleBackToMain}
          onAsk={(id) => handleNavigateToAsk(id)}
        />
      ) : currentScreen === 'ask' && selectedDocId ? (
        <AskView
          docId={selectedDocId}
          onBack={() => setCurrentScreen('results')}
        />
      ) : (
        <>
          <Header />

          <main className="flex-1 flex flex-col">
            {activeTab === 'scan' && (
              <ScanView onNavigateToResults={handleNavigateToResults} />
            )}

            {activeTab === 'history' && (
              <HistoryView
                onSelectDoc={handleNavigateToResults}
                onNavigateToScan={() => setActiveTab('scan')}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsView onNavigateToScan={() => setActiveTab('scan')} />
            )}

            {activeTab === 'settings' && <SettingsView />}
          </main>

          <BottomNavBar />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <AppContent />
    </DocumentProvider>
  );
}
