export interface WhiteRabbitFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cwe: string;
  cvssScore: number;
  location: string;
  exploitAnalysis: string;
  attackVector: string;
  defenseRecommendation: string;
  patchCode: string;
  verifiedByGemini?: boolean;
}

export interface WhiteRabbitStatus {
  connected: boolean;
  endpoint: string;
  activeModel: string;
  availableModels: string[];
  apiKeyMasked: string;
  operationalMode: string;
  guardrailProfile: string;
  contextTokens: number;
  temperature: number;
  metrics: {
    scansCompletedToday: number;
    vulnerabilitiesDetected: number;
    patchesGenerated: number;
    avgLatencyMs: number;
    quantumWeaknessesFound: number;
  };
}

export interface WhiteRabbitAuditResult {
  scanId: string;
  timestamp: string;
  targetFile: string;
  analyzedLines: number;
  riskScore: number;
  executiveSummary: string;
  findings: WhiteRabbitFinding[];
  dualConsensus?: {
    geminiAgreementPercent: number;
    consensusSummary: string;
    verifiedCount: number;
  };
}
