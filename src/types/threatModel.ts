export interface AttackKillChainStep {
  phase: string;
  title: string;
  description: string;
  technicalDetail: string;
}

export interface DreadScores {
  damage: number;
  reproducibility: number;
  exploitability: number;
  affectedUsers: number;
  discoverability: number;
  total: number;
}

export interface QuantumAttackVector {
  id: string;
  name: string;
  vulnerablePrimitive: string;
  targetCodeLocation: string;
  quantumMechanism: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  feasibility: 'IMMEDIATE_HARVEST_NOW' | 'CRQC_AVAILABLE' | 'THEORETICAL';
  impact: string;
  mitreTechnique: {
    id: string;
    name: string;
  };
  adversaryKillChain: AttackKillChainStep[];
  dreadScores: DreadScores;
  recommendedRemediation: string;
  remediationCodeSnippet: string;
}

export interface ThreatModelCbomItem {
  primitive: string;
  currentSpec: string;
  quantumRisk: string;
  fipsReplacement: string;
  cweMapping?: string;
}

export interface ThreatDefenseAction {
  priority: 'IMMEDIATE' | 'PHASE_1' | 'PHASE_2';
  title: string;
  action: string;
  timeline: string;
}

export interface ThreatComplianceCheck {
  standard: string;
  status: 'NON_COMPLIANT' | 'NEEDS_MIGRATION' | 'COMPLIANT';
  details: string;
}

export interface QuantumThreatModelResult {
  summary: string;
  fileName: string;
  overallRiskScore: number; // 0 to 100
  quantumReadiness: 'CRITICAL_EXPOSURE' | 'HIGH_RISK' | 'PARTIALLY_AGILE' | 'QUANTUM_RESISTANT';
  hndlExposure: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    retentionRiskYears: number;
    rationale: string;
  };
  crqcBreachTimeline: string;
  threatActorProfile: string;
  attackVectors: QuantumAttackVector[];
  cbomInventory: ThreatModelCbomItem[];
  defenseActionPlan: ThreatDefenseAction[];
  complianceStatus: ThreatComplianceCheck[];
  fallbackUsed?: boolean;
  quotaExceeded?: boolean;
  metadata: {
    model: string;
    generatedAt: string;
    analysisDurationMs?: number;
  };
}

export interface ThreatModelRequestOptions {
  model?: string;
  threatActorProfile?: string;
  targetYear?: number;
  complianceTarget?: string;
}
