export type AikidoSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AikidoScannerType =
  | 'SAST'
  | 'SCA'
  | 'SECRETS'
  | 'IAC'
  | 'CONTAINER'
  | 'CLOUD';

export type ReachabilityStatus = 'REACHABLE' | 'NOT_REACHABLE' | 'UNKNOWN';

export type FindingStatus = 'OPEN' | 'IN_TRIAGE' | 'RESOLVED' | 'IGNORED';

export interface AikidoFinding {
  id: string;
  title: string;
  description: string;
  scanner: AikidoScannerType;
  severity: AikidoSeverity;
  reachability: ReachabilityStatus;
  status: FindingStatus;
  cveId?: string;
  cweId?: string;
  filePath: string;
  lineRange?: string;
  introducedDate: string;
  autoTriageReason?: string;
  remediationSummary: string;
  isPqcRelated?: boolean;
  affectedCodeSnippet?: string;
  remediationPatch?: {
    diff: string;
    resolutionNotes: string;
    resolvedAt?: string;
  };
  resolvedAt?: string;
}

export interface AikidoIntegrationStatus {
  connected: boolean;
  apiKeyMasked: string;
  workspaceName: string;
  workspaceId: string;
  repository: string;
  defaultBranch: string;
  lastScanTimestamp: string;
  securityScore: number; // 0 - 100
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  gateStatus: 'PASSED' | 'FAILED' | 'WARNING';
  webhookStatus: 'HEALTHY' | 'PENDING' | 'ERROR';
  scannersEnabled: Record<AikidoScannerType, boolean>;
  counts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    reachable: number;
    pqcRelevant: number;
  };
}
