export type PipelineStep = 'audit' | 'architect' | 'implement';

export type MigrationMode = 'hybrid-x25519-mlkem768' | 'pure-pqc-fips203-204';

export interface CycloneDxCryptoProperties {
  assetType: 'algorithm' | 'certificate' | 'key' | 'protocol';
  oid?: string;
  algorithmProperties?: {
    primitive: 'kem' | 'signature' | 'pke' | 'hash' | 'ae' | 'block-cipher';
    parameterSetIdentifier?: string;
    executionEnvironment?: 'software-plain-ram' | 'hardware-tpm' | 'f22-avionics-fpga';
    nistQuantumSecurityLevel: 0 | 1 | 2 | 3 | 4 | 5;
  };
}

export interface CbomItem {
  id: string;
  bomRef: string;
  primitive: string; // e.g., "RSA-2048", "ECDSA-P256", "AES-128-GCM"
  fileLocation: string;
  lineNumber: number;
  quantumVulnerability: 'shor-critical' | 'grover-moderate' | 'quantum-safe';
  nistReplacement: string; // e.g., "ML-KEM-768 (FIPS 203)", "ML-DSA-65 (FIPS 204)"
  hybridRecommendation: string; // e.g., "X25519MLKEM768"
  estimatedCycleOverheadPct: number;
  pubkeySizeBytes: number;
  ciphertextOrSigSizeBytes: number;
  cycloneDx: CycloneDxCryptoProperties;

  // Backward compatibility / UI display convenience aliases
  algorithm?: string;
  vulnerability?: string;
  riskTier?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SECURE';
  fipsStandard?: string;
  locations?: string;
  classicalKeySize?: string;
  postQuantumKeySize?: string;
}

export interface AuditLedgerEntry {
  id: number;
  action: string;
  actorUid: string;
  payloadHash: string;
  prevHash: string;
  mlDsaSignature: string;
  createdAt: string;
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

export interface PipelineOptions {
  model: string;
  nistLevel: 'Level 1 (ML-KEM-512 / ML-DSA-44)' | 'Level 3 (ML-KEM-768 / ML-DSA-65)' | 'Level 5 (ML-KEM-1024 / ML-DSA-87)';
  library: 'liboqs-python (Open Quantum Safe)' | 'cryptography >= 43.0 (Python Standard)' | 'pqcrypto (Pure bindings)';
  hybridMode: 'Dual-KEM Composite (KDF Combiner)' | 'Concatenated Signatures' | 'Pure PQC Only';
  migrationMode?: MigrationMode;
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
