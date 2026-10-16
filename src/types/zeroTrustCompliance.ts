export type SubnetClassification =
  | 'INTERNAL_INSIDER_LAB'
  | 'TACTICAL_AVIONICS_MESH'
  | 'PUBLIC_INTERNET_SCANNER'
  | 'TOR_ANONYMIZED_NODE'
  | 'CROSS_DOMAIN_GATEWAY';

export type ConnectionVerdict =
  | 'ALLOWED_ZERO_TRUST'
  | 'HONEYPOT_TRIPPED'
  | 'QUARANTINED_ANOMALOUS'
  | 'SEVERED_BLOCKED';

export type AttestationStatus =
  | 'VALID_FIPS204_ML_DSA'
  | 'MISSING_CLIENT_CERT'
  | 'FORGED_ATTRIBUTION_TOKEN'
  | 'REVOKED_INSIDER_HARDWARE'
  | 'DOWNGRADE_REJECTED';

export interface AnomalySignature {
  patternId: string;
  name: string;
  category:
    | 'Quantum Downgrade'
    | 'Lattice Parameter Poisoning'
    | 'Deserialization Exploit'
    | 'Tactical Impersonation'
    | 'Canary File Tamper'
    | 'Egress Exfiltration'
    | 'Side-Channel Timing Probe';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  anomalyScore: number; // 0 - 100
  mitreAttackTechnique: string;
  mitreDefendTactic: string;
  cveOrStandardReference?: string;
  ruleTriggered: string;
  payloadFingerprint: string;
  containmentEnforced: string;
}

export interface IncomingConnectionAttempt {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort: number;
  sourceGeo: string;
  sourceAsnOrOrg: string;
  subnetClass: SubnetClassification;
  targetEndpoint: string;
  targetPort: number;
  protocol:
    | 'TLS 1.3 / ML-KEM-1024'
    | 'TLS 1.3 / ML-KEM-768'
    | 'Legacy TLS 1.2 / RSA-2048'
    | 'Java RMI / Decoy Registry'
    | 'Tactical IFDL LPI'
    | 'DNS / Port 53 Egress'
    | 'PQC API Gateway';
  requestedCipherSuite: string;
  verdict: ConnectionVerdict;
  honeypotDecoyHit?: {
    honeypotId: string;
    honeypotName: string;
    decoyType: string;
  };
  anomalySignature?: AnomalySignature;
  ja4Fingerprint: string;
  clientAttestationStatus: AttestationStatus;
  latencyMs: number;
  rawPayloadSnippet: string;
  isSevered: boolean;
}

export interface ZeroTrustComplianceOverview {
  globalComplianceScore: number; // e.g. 98.4
  nistSp800207Alignment: number; // e.g. 99.1
  dodZta20Alignment: number; // e.g. 97.8
  cnsa20Readiness: number; // e.g. 100.0
  totalConnections24h: number;
  allowedCount: number;
  honeypotTrippedCount: number;
  quarantinedCount: number;
  severedCount: number;
  continuousVerificationsSec: number;
  activeHoneypotsListening: number;
  totalSignaturesCataloged: number;
  lastAnomalyDetectedAt: string;
  pillarAuditScores: {
    pillar: 'Identity' | 'Device' | 'Network' | 'Application' | 'Data' | 'Visibility';
    score: number;
    status: 'COMPLIANT' | 'HARDENED' | 'WARNING';
    description: string;
  }[];
}
