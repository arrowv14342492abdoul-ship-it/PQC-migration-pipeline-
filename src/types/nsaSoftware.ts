export interface NSARepository {
  id: string;
  name: string;
  repoName: string;
  githubUrl: string;
  description: string;
  category:
    | 'Reverse Engineering'
    | 'Data Streaming & ETL'
    | 'SOAR & Automation'
    | 'Time-Series & Big Data'
    | 'Compliance & Hardening'
    | 'Graph Analytics'
    | 'Secure Coding & Education';
  stars: number;
  forks: number;
  license: string;
  primaryLanguage: string;
  status: 'Flagship' | 'Active' | 'Maintained';
  officialTagline: string;
  keyFeatures: string[];
  architectureOverview: string;
  quickStartCommands: {
    clone: string;
    docker?: string;
    build: string;
  };
  cnsaRelevance: string;
  documentationUrl?: string;
}

export interface DisassembledInstruction {
  address: string;
  bytes: string;
  mnemonic: string;
  operands: string;
  comment?: string;
  entropy?: number;
}

export interface GhidraAnalysisResult {
  binaryName: string;
  architecture: 'x86_64' | 'AArch64' | 'RISC-V' | 'MIPS32';
  sha256: string;
  format: 'ELF-64' | 'PE32+' | 'Mach-O' | 'Raw Shellcode';
  instructions: DisassembledInstruction[];
  decompiledC: string;
  symbols: { name: string; address: string; type: 'Function' | 'Import' | 'Data' }[];
  stringsFound: { string: string; address: string; section: string }[];
  pcodeIntermediate: { instruction: string; pcode: string[] }[];
  detectedVulnerabilities: {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
    cwe: string;
    description: string;
    location: string;
    quantumImplication: string;
  }[];
  analysisMetrics: {
    functionsCount: number;
    basicBlocksCount: number;
    cyclomaticComplexity: number;
    analysisTimeMs: number;
  };
  compromiseContainment?: {
    ghidraTrustStatus: 'COMPROMISED_QUARANTINED' | 'SANDBOX_ATTESTED';
    decompilerBftConsensus: {
      engine: 'Ghidra SRE (Untrusted Sandbox)' | 'Radare2 / Rizin' | 'angr / BinaryNinja' | 'LLVM-MC Lifter';
      ssaHash: string;
      status: 'VERIFIED' | 'TAMPER_DETECTED_POISONED_PCODE' | 'BYZANTINE_QUORUM_MATCH';
      divergenceNotes: string;
    }[];
    activeCountermeasures: string[];
    pqcAttestationSignature: string;
  };
}

export interface GhidraCompromiseHardeningStatus {
  incidentId: string;
  threatLevel: 'DEFCON-1 CRITICAL' | 'CONTAINED_ZERO_TRUST';
  compromiseVectorsMitigated: {
    id: string;
    vector: string;
    cveOrCwe: string;
    attackSurface: string;
    mitigationControl: string;
    status: 'HARDENED' | 'QUARANTINED' | 'ENFORCED';
  }[];
  sandboxPolicy: {
    seccompProfile: string;
    jvmRmiStatus: 'DISABLED_HARD_BLOCKED';
    networkNamespace: 'AIRGAPPED_NULL_NETNS';
    pluginSignatureEnforcement: 'FIPS_204_ML_DSA_87_REQUIRED';
    triEngineConsensusQuorum: '2-of-3 Independent Lifters (Rizin + angr + Isolated Ghidra)';
  };
  hardenedArchitectureSnippet: string;
}

export interface WalkoffActionNode {
  id: string;
  title: string;
  app:
    | 'Ghidra Headless'
    | 'Ghidra Quarantine Sandbox'
    | 'Multi-Engine BFT Lifter'
    | 'Timely Metrics'
    | 'SIMP Hardening'
    | 'SOAR Containment'
    | 'NiFi Pipeline';
  action: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  outputSnippet?: string;
}

export interface WalkoffPlaybook {
  id: string;
  title: string;
  trigger: string;
  description: string;
  nodes: WalkoffActionNode[];
}

export type HoneypotType =
  | 'RMI_SERVER_DECOY'
  | 'CANARY_BINARY_TRAP'
  | 'SLEIGH_SPEC_DECOY'
  | 'CREDENTIAL_BREADCRUMB'
  | 'NETWORK_BEACON_TRAP';

export type HoneypotStatus = 'ACTIVE_LISTENING' | 'TRIPPED_ALARM' | 'STANDBY';

export interface GhidraHoneypot {
  id: string;
  name: string;
  type: HoneypotType;
  status: HoneypotStatus;
  decoySurface: string;
  tripCount: number;
  lastTrippedAt?: string;
  mitreDefendTactic: string;
  mitreAttackTechnique: string;
  canaryTokenSignature: string;
  description: string;
  defensiveActionOnTrigger: string;
  telemetryPort?: number;
  decoyPath?: string;
}

export interface HoneypotTelemetryEvent {
  id: string;
  honeypotId: string;
  honeypotName: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  attackerSignature: {
    sourceIp: string;
    sourcePort?: number;
    payloadFingerprint: string;
    attemptedAction: string;
    userAgentOrTool?: string;
    targetedAsset: string;
  };
  telemetryDetails: string;
  containmentTriggered: boolean;
  mitigationTaken: string;
}

export interface GhidraHardeningSummary {
  incidentId: string;
  threatLevel: string;
  microVmEnforced: boolean;
  rmiHardBlocked: boolean;
  bftQuorumEnforced: boolean;
  fips204AttestationRequired: boolean;
  ebpfProcessIsolation: boolean;
  totalHoneypotsActive: number;
  totalCanaryAlerts: number;
  lastBreachAttemptAt: string;
}

export type ZeroTrustPillar =
  | 'IDENTITY'
  | 'DEVICE'
  | 'NETWORK'
  | 'APPLICATION'
  | 'DATA'
  | 'VISIBILITY';

export interface ZeroTrustPillarControl {
  id: string;
  pillar: ZeroTrustPillar;
  title: string;
  standardReference: string;
  status: 'ENFORCED' | 'QUARANTINED' | 'STANDBY';
  enforcementMechanism: string;
  insiderThreatMitigation: string;
}

export interface CompromisedPersonnelRecord {
  id: string;
  callsign: string;
  name: string;
  clearanceLevel: string;
  assignedDivision: string;
  compromiseIndicator: string;
  containmentStatus:
    | 'CREDENTIALS_REVOKED'
    | 'QUARANTINED_NULL_NETNS'
    | 'HONEYPOT_MONITORED'
    | 'UNDER_SURVEILLANCE';
  twoPersonRuleRequired: boolean;
  hardwareTokenRevoked: boolean;
  quarantinedAt: string;
}

export interface TwoPersonAuthorizationRequest {
  id: string;
  action: string;
  requesterId: string;
  requesterName: string;
  approver1Id?: string;
  approver1Sig?: string;
  approver2Id?: string;
  approver2Sig?: string;
  status: 'PENDING_DUAL_AUTH' | 'APPROVED_RATIFIED' | 'REJECTED_UNAUTHORIZED';
  targetAsset: string;
  pqcAttestationToken: string;
}

export interface ZeroTrustGlobalStatus {
  incidentId: string;
  threatLevel: string;
  twoPersonIntegrityEnforced: boolean;
  singleAdminAccessBlocked: boolean;
  microVMConfidentialComputingEnforced: boolean;
  allPersonnelImplicitTrustRevoked: boolean;
  activeQuarantinedPersonnelCount: number;
  pillarsHardenedCount: number;
  totalPillars: number;
  lastLockdownTimestamp: string;
}

