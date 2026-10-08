export type RiskLevel = 'high' | 'medium' | 'low';

export type Verdict = 'potential_scam' | 'suspicious' | 'no_obvious_indicators';

export interface WarningSign {
  id: string;
  category: 'urgency' | 'credentials' | 'financial' | 'impersonation' | 'links' | 'threat' | 'syntax';
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  evidence?: string;
}

export interface SafeAction {
  id: string;
  action: string;
  why: string;
  priority: 'must_do' | 'recommended' | 'optional';
}

export interface ActionableSafetyStep {
  id: string;
  priority: 'critical' | 'high' | 'recommended' | 'general';
  titleEn: string;
  titleTe: string; // Telugu translation
  descriptionEn: string;
  descriptionTe: string; // Telugu translation
  actionType: 'password_reset' | 'bank_freeze' | 'file_delete' | 'block_sender' | 'verify_channel' | 'enable_mfa' | 'low_risk_caution';
  badgeEn: string;
  badgeTe: string;
}

export interface MessageAnalysisResult {
  verdict: Verdict;
  riskScore: number; // 0 - 100
  verdictLabel: string;
  verdictDescription: string;
  warningSigns: WarningSign[];
  safeNextSteps: SafeAction[];
  actionableSteps?: ActionableSafetyStep[];
  analysisEngine: 'ai' | 'heuristic';
  aiExplanation?: string;
  detectedEntities: {
    urlsFound: string[];
    phoneNumbersFound: string[];
    emailsFound: string[];
    requestsSensitiveInfo: boolean;
  };
  executionTimeMs?: number;
  isCached?: boolean;
  timestamp: number;
}

export interface UrlCheckFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  explanation: string;
  detail: string;
}

export interface UrlAnalysisResult {
  url: string;
  normalizedUrl: string;
  protocol: string;
  hostname: string;
  port?: string;
  pathname: string;
  search: string;
  isHttps: boolean;
  isIpAddress: boolean;
  isUrlShortener: boolean;
  hasSuspiciousTld: boolean;
  hasTyposquatting: boolean;
  brandImpersonationTarget?: string;
  hasUnusualCharacters: boolean;
  hasSuspiciousFileExtension: boolean;
  riskScore: number; // 0 - 100
  verdict: 'malicious_or_high_risk' | 'suspicious_characteristics' | 'standard_patterns';
  verdictLabel: string;
  verdictDescription: string;
  findings: UrlCheckFinding[];
  safeRecommendations: string[];
  actionableSteps?: ActionableSafetyStep[];
  executionTimeMs?: number;
  isCached?: boolean;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningModule {
  id: string;
  title: string;
  category: 'General' | 'Web Security' | 'Identity' | 'Network' | 'Data Protection';
  iconName: string;
  summary: string;
  definition: string;
  realWorldScenario: string;
  preventionTips: string[];
  quiz: QuizQuestion[];
}

export interface HistoryItem {
  id: string;
  type: 'message' | 'url';
  inputSnippet: string;
  fullLength: number;
  verdictLabel: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: number;
  engine: 'ai' | 'heuristic' | 'url_analyzer';
}

export interface SessionStats {
  totalScans: number;
  highRiskScans: number;
  suspiciousScans: number;
  lowRiskScans: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
}
