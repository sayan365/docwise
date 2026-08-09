export type RiskLevel = 'clear' | 'warning' | 'high';
export type SeverityLevel = 'high' | 'medium' | 'low';
export type DocCategory = 'Contracts' | 'Leases' | 'Insurance' | 'Financial';
export type ActiveTab = 'scan' | 'history' | 'insights' | 'settings';

export interface RedFlag {
  id: string;
  title: string;
  explanation: string;
  severity: SeverityLevel;
  sourceClause: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  highlightChips?: string[];
  sourceQuote?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: DocCategory;
  scannedDate: string;
  verdict: string;
  overallRisk: RiskLevel;
  sourceText: string;
  /** Base64 file contents kept only in browser memory for contextual follow-up questions. */
  fileData?: string;
  fileName?: string;
  fileMimeType?: string;
  analysisContext?: string;
  takeaways: string[];
  redFlags: RedFlag[];
  redFlagsCount: number;
  chatThread: ChatMessage[];
}

export interface SampleDocument {
  id: string;
  title: string;
  category: DocCategory;
  icon: string;
  rawText: string;
  sampleAnalysis: {
    title: string;
    category: DocCategory;
    verdict: string;
    overallRisk: RiskLevel;
    takeaways: string[];
    redFlags: RedFlag[];
  };
}
