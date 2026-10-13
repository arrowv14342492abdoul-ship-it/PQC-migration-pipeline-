export interface CbomItem {
  algorithm: string;
  primitive: string;
  vulnerability: string;
  riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SECURE';
  fipsStandard: string;
  nistReplacement: string;
  locations: string;
  classicalKeySize?: string;
  postQuantumKeySize?: string;
}

export interface PipelineResult {
  audit: string;
  plan: string;
  code: string;
  rawCode?: string;
  cbom?: CbomItem[];
  fallbackUsed?: boolean;
  quotaExceeded?: boolean;
  fallbackReason?: string;
  metadata?: {
    model: string;
    timestamp: string;
  };
}

export type PipelineStep = 'audit' | 'architect' | 'implement';

export interface PipelineOptions {
  model: string;
  nistLevel: 'Level 1 (ML-KEM-512 / ML-DSA-44)' | 'Level 3 (ML-KEM-768 / ML-DSA-65)' | 'Level 5 (ML-KEM-1024 / ML-DSA-87)';
  library: 'liboqs-python (Open Quantum Safe)' | 'cryptography >= 43.0 (Python Standard)' | 'pqcrypto (Pure bindings)';
  hybridMode: 'Dual-KEM Composite (KDF Combiner)' | 'Concatenated Signatures' | 'Pure PQC Only';
}

export interface TestCase {
  name: string;
  status: 'PASSED' | 'FAILED' | 'NOT_APPLICABLE';
  detail: string;
}

export interface SimulationResult {
  status: string;
  executionTimeMs: number;
  testCases: TestCase[];
  cryptographicOverhead: {
    classicalPubKeyBytes: number;
    pqcPubKeyBytes: number;
    classicalCiphertextBytes: number;
    pqcCiphertextBytes: number;
    quantumSecurityLevel: string;
    standardCompliance: string[];
  };
}

export interface PresetSample {
  id: string;
  title: string;
  subtitle: string;
  primitiveType:
    | 'Asymmetric Encryption'
    | 'Digital Signature'
    | 'Key Exchange'
    | 'Envelope Encryption'
    | 'Industrial Control Signature';
  code: string;
  quantumRisk: 'CRITICAL' | 'HIGH';
  targetFips: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description?: string;
  savedAt: string;
  updatedAt: string;
  legacyCode: string;
  result: PipelineResult | null;
  options: PipelineOptions;
  tags?: string[];
  primitiveSummary?: string;
}
