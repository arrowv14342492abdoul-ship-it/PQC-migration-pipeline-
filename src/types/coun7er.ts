// CISA COUN7ER Database & Eviction Strategies Tool Type Definitions

export type Coun7erPhase =
  | 'phase-1-preparation'
  | 'phase-2-containment'
  | 'phase-3-eviction'
  | 'phase-4-post-hardening';

export type Coun7erCategory =
  | 'Cryptographic Remediation'
  | 'Network Isolation'
  | 'Identity & Credential Reset'
  | 'Session & Token Purge'
  | 'Avionics & Bus Hardening'
  | 'Endpoint & Process Termination'
  | 'OT / SCADA Quarantine'
  | 'Forensic Triage';

export type TargetEnvironment =
  | 'Avionics (F-22 / F-35 / B-21)'
  | 'Enterprise Active Directory & Cloud'
  | 'Critical Infrastructure OT/ICS'
  | 'Defense Sensor-to-Shooter'
  | 'Financial SWIFT & Core Banking'
  | 'Telecom & High-Speed Optical Backbones';

export type CountermeasureStatus =
  | 'pending'
  | 'preparing'
  | 'executing'
  | 'verified'
  | 'failed'
  | 'skipped';

export interface MitreAttackRef {
  id: string; // e.g. "T1552.004"
  name: string; // e.g. "Private Keys"
  tactic: string; // e.g. "Credential Access"
  url?: string;
}

export interface MitreD3fendRef {
  id: string; // e.g. "D3-CKR"
  name: string; // e.g. "Certificate Revocation"
  defensiveTactic?: string; // e.g. "Credential Hardening"
  tactic?: string;
  url?: string;
}

export interface Coun7erCountermeasure {
  id: string; // e.g. "CNTR-001"
  title: string;
  category: Coun7erCategory;
  phase: Coun7erPhase;
  phaseOrder: number;
  mitreAttack: MitreAttackRef[];
  mitreD3fend: MitreD3fendRef[];
  cwe: string[]; // e.g. ["CWE-327", "CWE-295"]
  intendedOutcome: string;
  preparatorySteps: string[];
  executionProcedure: {
    commandType: 'bash' | 'powershell' | 'openssl' | 'python' | 'nginx-sidecar' | 'avionics-bus';
    script: string;
    explanation: string;
  };
  operationalRisks: string[];
  validationSteps: string[];
  pqcRemediationAlignment: {
    fipsStandard: string; // e.g. "NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)"
    hybridProtocol?: string; // e.g. "RFC 9370 X25519MLKEM768"
    quantumThreatCountered: 'Shor Algorithm Discrete Log' | 'Harvest-Now-Decrypt-Later (HNDL)' | 'Quantum Forgery' | 'Classical Post-Compromise';
    replacementPrimitive: string;
  };
  targetEnvironments: TargetEnvironment[];
  cisaAdvisoryRef: string; // e.g. "CISA Alert AA24-109A (Volt Typhoon)"
  status: CountermeasureStatus;
  executionTimestamp?: string;
  auditSignature?: string;
  logs?: string[];
}

export interface Coun7erCampaignPreset {
  id: string;
  name: string;
  threatActor: string; // e.g. "Volt Typhoon (PRC State-Sponsored)"
  description: string;
  cisaAlertId: string;
  observedTTPs: string[];
  recommendedCountermeasureIds: string[];
  targetEnvironment: TargetEnvironment;
  criticality: 'CRITICAL' | 'HIGH' | 'EMERGENCY';
  quantumRiskFactor: 'HIGH - ACTIVE HNDL' | 'MEDIUM - CREDENTIAL EXFIL' | 'IMMINENT - ZERO-DAY';
}

export interface Coun7erEvictionPlan {
  id: string;
  planName: string;
  createdAt: string;
  threatScenario: string;
  targetEnvironment: TargetEnvironment;
  countermeasures: Coun7erCountermeasure[];
  estimatedExecutionTimeMinutes: number;
  pqcShieldActive: boolean;
  complianceAttestations: string[];
}

export interface CisaPlaybookNgExport {
  schemaVersion: '1.2.0';
  tool: 'CISA Eviction Strategies Tool - COUN7ER & Playbook-NG';
  exportedAt: string;
  classification: 'UNCLASSIFIED // TLP:CLEAR // CISA DEFENSE OPS';
  playbook: {
    id: string;
    title: string;
    description: string;
    targetEnvironment: string;
    phases: {
      phaseId: string;
      phaseTitle: string;
      actions: {
        countermeasureId: string;
        title: string;
        category: string;
        mitreAttackIds: string[];
        mitreD3fendIds: string[];
        procedure: string;
        risks: string[];
        validation: string[];
        pqcStandard: string;
        status: string;
      }[];
    }[];
  };
  cryptographicAuditProof: {
    algorithm: 'ML-DSA-65 (FIPS 204)';
    sha384Digest: string;
    ledgerBlockIndex: number;
  };
}

export interface Coun7erStats {
  totalCountermeasures: number;
  totalAttackTTPsCovered: number;
  totalD3fendTacticsMapped: number;
  pqcHardenedPercent: number;
  evictionSuccessRate: number;
  activeCampaignsCount: number;
  executedCount: number;
  verifiedCount: number;
}
