import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Scale,
  DollarSign,
} from 'lucide-react';
import { useDocumentContext } from '../context/DocumentContext';

export const InsightsView: React.FC<{ onNavigateToScan: () => void }> = ({
  onNavigateToScan,
}) => {
  const { documents } = useDocumentContext();

  const totalDocs = documents.length;
  const totalRedFlags = documents.reduce((acc, d) => acc + d.redFlagsCount, 0);
  const clearDocs = documents.filter((d) => d.overallRisk === 'clear').length;
  const warningDocs = documents.filter((d) => d.overallRisk === 'warning').length;
  const highRiskDocs = documents.filter((d) => d.overallRisk === 'high').length;

  const healthScore = totalDocs > 0 ? Math.round((clearDocs / totalDocs) * 100) : 100;

  const commonRisks = [
    {
      title: 'Auto-Renewal Clauses',
      count: documents.filter((d) =>
        d.redFlags.some((f) => f.title.toLowerCase().includes('renew'))
      ).length,
      icon: <RotateCcw className="w-5 h-5 text-amber-600" />,
      desc: 'Extends terms automatically unless cancelled 30–60 days prior.',
    },
    {
      title: 'Broad Indemnification',
      count: documents.filter((d) =>
        d.redFlags.some((f) => f.title.toLowerCase().includes('indemni'))
      ).length,
      icon: <Scale className="w-5 h-5 text-red-600" />,
      desc: 'Requires you to cover legal fees and liabilities for disputes.',
    },
    {
      title: 'Early Termination Fees',
      count: documents.filter((d) =>
        d.redFlags.some((f) => f.title.toLowerCase().includes('terminat'))
      ).length,
      icon: <DollarSign className="w-5 h-5 text-red-600" />,
      desc: 'Steep penalties for cancelling prior to contract end date.',
    },
  ];

  return (
    <div className="flex-1 px-5 pb-28 pt-4 max-w-2xl mx-auto w-full flex flex-col gap-5">
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Contract Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Portfolio analysis of your scanned documents & legal risk trends.
        </p>
      </div>

      {/* Health Score Overview */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[22px] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Contract Safety Index
            </span>
            <h2 className="text-3xl font-black mt-1">{healthScore}% Safe</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/10">
          <div>
            <span className="text-blue-200 block">Scanned</span>
            <strong className="text-base text-white">{totalDocs}</strong>
          </div>
          <div>
            <span className="text-blue-200 block">Red Flags</span>
            <strong className="text-base text-red-300">{totalRedFlags}</strong>
          </div>
          <div>
            <span className="text-blue-200 block">Clear Terms</span>
            <strong className="text-base text-emerald-300">{clearDocs}</strong>
          </div>
        </div>
      </section>

      {/* Risk Distribution Breakdown */}
      <section className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Document Risk Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {clearDocs}
            </span>
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
              Clear / Low Risk
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {warningDocs}
            </span>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
              Warning / Review
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {highRiskDocs}
            </span>
            <p className="text-[11px] font-semibold text-red-800 dark:text-red-300 mt-0.5">
              High Risk
            </p>
          </div>
        </div>
      </section>

      {/* Top Recurring Legal Risks */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Most Common Red Flags
        </h3>
        <div className="flex flex-col gap-2.5">
          {commonRisks.map((risk, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700">
                  {risk.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {risk.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {risk.desc}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {risk.count} {risk.count === 1 ? 'doc' : 'docs'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
