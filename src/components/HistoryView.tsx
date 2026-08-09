import React, { useState } from 'react';
import {
  Search,
  FileText,
  Shield,
  Briefcase,
  Receipt,
  HeartPulse,
  Trash2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';
import { DocCategory } from '../types';

export const HistoryView: React.FC<{
  onSelectDoc: (docId: string) => void;
  onNavigateToScan: () => void;
}> = ({ onSelectDoc, onNavigateToScan }) => {
  const {
    documents,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    deleteDocument,
  } = useDocumentContext();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories: string[] = ['All', 'Contracts', 'Leases', 'Insurance', 'Financial'];

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      filterCategory === 'All' || doc.category === filterCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.verdict.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: DocCategory) => {
    switch (category) {
      case 'Insurance':
        return <HeartPulse className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
      case 'Contracts':
        return <Briefcase className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
      case 'Financial':
        return <Receipt className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
      case 'Leases':
      default:
        return <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />;
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId === id) {
      deleteDocument(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  return (
    <div className="flex-1 px-5 pb-28 pt-4 max-w-2xl mx-auto w-full flex flex-col gap-4">
      {/* Title & Search header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Your Documents
        </h1>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar -mx-5 px-5">
        {categories.map((cat) => {
          const isActive = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Document List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[20px] p-8 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Documents Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
            {searchQuery || filterCategory !== 'All'
              ? 'Try adjusting your search query or filter category.'
              : 'You haven\'t scanned any contracts or agreements yet.'}
          </p>
          <button
            onClick={onNavigateToScan}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Scan New Document
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredDocs.map((doc) => {
            const hasRedFlags = doc.redFlagsCount > 0;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="bg-white dark:bg-slate-800 rounded-[16px] p-3.5 flex items-center gap-3.5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700/80 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] group relative"
              >
                {/* Category Icon */}
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 transition-colors">
                  {getCategoryIcon(doc.category)}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {doc.scannedDate}
                  </p>
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasRedFlags ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] dark:bg-red-950/80 dark:text-red-300">
                      {doc.redFlagsCount} {doc.redFlagsCount === 1 ? 'Red Flag' : 'Red Flags'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/80 dark:text-emerald-300">
                      Clear
                    </span>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className={`h-8 rounded-full flex items-center justify-center transition-all ${deletingId === doc.id ? 'px-3 bg-red-600 text-white text-xs font-bold' : 'w-8 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'}`}
                    title={deletingId === doc.id ? 'Click again to confirm deletion' : 'Delete document'}
                    aria-label={deletingId === doc.id ? `Confirm deletion of ${doc.title}` : `Delete ${doc.title}`}
                  >
                    {deletingId === doc.id ? 'Confirm' : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
