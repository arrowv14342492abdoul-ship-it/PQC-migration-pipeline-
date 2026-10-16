export type LiboqsKemAlgorithm =
  | 'ML-KEM-512'
  | 'ML-KEM-768'
  | 'ML-KEM-1024'
  | 'FrodoKEM-640-AES'
  | 'FrodoKEM-976-AES'
  | 'BIKE-L1'
  | 'BIKE-L3'
  | 'Classic-McEliece-348864';

export type LiboqsSigAlgorithm =
  | 'ML-DSA-44'
  | 'ML-DSA-65'
  | 'ML-DSA-87'
  | 'Falcon-512'
  | 'Falcon-1024'
  | 'SPHINCS+-SHA2-128s-robust'
  | 'SPHINCS+-SHA2-192s-robust';

export interface DecoyTlsEndpoint {
  id: string;
  name: string;
  port: number;
  bindHost: string;
  subsystemRole: string;
  protocol: 'TLS 1.3 / Post-Quantum Draft' | 'Tactical TLS / IFDL LPI' | 'Mil-Std Optical TLS';
  kemPrimitive: LiboqsKemAlgorithm;
  sigPrimitive: LiboqsSigAlgorithm;
  cipherSuite: string;
  decoyCertSubject: string;
  decoyCertIssuer: string;
  status: 'LISTENING_ACTIVE' | 'TRIPPED_CONTAINED' | 'STANDBY';
  dummyKeyStats: {
    publicKeyBytes: number;
    secretKeyBytes: number;
    ciphertextBytes: number;
    signatureBytes: number;
    claimedSecurityCategory: 1 | 3 | 5;
  };
  totalProbesTrapped: number;
  lastProbeTimestamp?: string;
  activeExploitAlerts: number;
  description: string;
}

export type ExploitPatternId =
  | 'SIG-PQC-DOWNGRADE-01'
  | 'SIG-LATTICE-POISON-02'
  | 'SIG-IFDL-ROGUE-F35-03'
  | 'SIG-TLS-FUZZ-OVERFLOW-04'
  | 'SIG-HEARTBEAT-LEAK-05'
  | 'SIG-TIMING-PROBE-06';

export interface HoneypotExploitSignature {
  patternId: ExploitPatternId;
  name: string;
  category:
    | 'Protocol Downgrade'
    | 'Lattice Parameter Poisoning'
    | 'Tactical Node Impersonation'
    | 'Buffer Fuzzing'
    | 'Memory Disclosure'
    | 'Side-Channel';
  cveReference?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  detectionRule: string;
  f22AvionicsResponse: string;
}

export interface HoneypotSecurityLog {
  id: string;
  timestamp: string;
  endpointId: string;
  endpointPort: number;
  endpointName: string;
  clientIp: string;
  clientPort: number;
  simulatedHandshake: {
    clientOfferedCiphers: string[];
    clientSupportedGroups: string[];
    negotiatedKem: LiboqsKemAlgorithm;
    negotiatedSig: LiboqsSigAlgorithm;
    handshakeDurationMs: number;
    dummyCiphertextSnippet: string;
  };
  detectedSignature?: HoneypotExploitSignature;
  threatLevel: 'DEFCON_1_CRITICAL' | 'TACTICAL_HIGH' | 'PROBE_INTERCEPTED' | 'NORMAL_DECOY_TRAFFIC';
  rawPayloadSnippet: string;
  containmentAction: string;
  f22AvionicsTelemetryInjected: {
    cip1CpuDeltaPercent: number;
    trngEntropyDrawGbps: number;
    busChannelAlert: 'CH-A (MIL-1553B)' | 'CH-B (MIL-1553B)' | 'FC-OPTICAL-1';
    busOpcode: string;
    hudWarningMessage: string;
    missionImpact: string;
  };
}

export interface HoneypotTelemetrySummary {
  totalDecoyEndpoints: number;
  totalConnectionsIntercepted: number;
  criticalExploitsBlocked: number;
  downgradeAttemptsTrapped: number;
  f22TelemetryStreamSynced: boolean;
  averageHandshakeLatencyMs: number;
  lastExploitSignature?: string;
}
