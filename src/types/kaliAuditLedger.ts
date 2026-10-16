export type ModificationStatus = 'APPLIED' | 'ROLLED_BACK';

export type ModificationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CodeDiff {
  fileName: string;
  before: string;
  after: string;
}

export interface SecurityModification {
  id: string;
  toolSource: string;
  targetComponent: string;
  kaliCategory: string;
  severity: ModificationSeverity;
  status: ModificationStatus;
  title: string;
  description: string;
  cwe: string;
  owaspCategory: string;
  sha256Hash: string;
  codeDiff: CodeDiff;
  rollbackInstructions: string;
  pqcRelevance: string;
  timestamp: string;
}

export interface KaliAuditSummary {
  activeRemediationsCount: number;
  totalVulnerabilitiesIdentified: number;
  rolledBackCount: number;
  featuresEvaluated: number;
  cnsa2CompliancePercent: number;
  classicalCryptoExposureScore: number;
  overallSecurityScore: number;
  lastAuditTimestamp: string;
}
