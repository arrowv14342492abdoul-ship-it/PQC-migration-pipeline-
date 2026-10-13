// Check Point Security Types
export interface CheckPointGateway {
  id: string;
  name: string;
  ipAddress: string;
  version: string; // e.g. R81.20 Quantum Titan
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  location: string;
  quantumVpnStatus: 'ENFORCED' | 'PERMISSIVE' | 'DISABLED';
  activeTunnels: number;
  throughputGbps: number;
  threatCloudAi: 'ACTIVE' | 'UPDATING';
  sslInspectionMode: 'TLS_1_3_STRICT_PQC' | 'HYBRID' | 'LEGACY';
}

export interface CheckPointVpnTunnel {
  id: string;
  peerName: string;
  peerIp: string;
  ikeVersion: 'IKEv2 (FIPS 203 ML-KEM)' | 'IKEv2 (Classical ECDH)' | 'IKEv1';
  kemAlgorithm: string; // e.g. ML-KEM-768 / Kyber
  encryptionCipher: string; // e.g. AES-256-GCM
  status: 'ESTABLISHED' | 'NEGOTIATING' | 'DOWN';
  uptimeHours: number;
}

export interface CheckPointSecurityStatus {
  connected: boolean;
  managementServer: string; // e.g. 10.240.0.10 (SmartConsole R81.20)
  apiKeyMasked: string;
  lastPolicyInstall: string;
  quantumDefenseLevel: 'TITAN_FIPS_203' | 'HYBRID' | 'LEGACY';
  gateways: CheckPointGateway[];
  tunnels: CheckPointVpnTunnel[];
  metrics: {
    totalInspectedPacketsM: number;
    blockedThreatsToday: number;
    quantumSafeTunnelsPercent: number;
  };
}

// Snowflake Data Warehouse Types
export interface SnowflakeTableAudit {
  database: string;
  schema: string;
  table: string;
  rowCount: number;
  sizeMb: number;
  encryptionType: 'TRI_SECRET_AES_256' | 'STANDARD_ENCRYPTED' | 'UNENCRYPTED_STAGE';
  quantumSafeMargin: '128_BIT_GROVER_RESILIENT' | 'LEGACY_VULNERABLE';
  columnMaskingActive: boolean;
  maskedColumns: string[];
  lastAccessed: string;
}

export interface SnowflakeStatus {
  connected: boolean;
  account: string; // e.g. acme-corp.snowflakecomputing.com
  warehouse: string; // e.g. COMPUTE_WH_PQC
  database: string;
  user: string;
  role: string;
  triSecretSecureEnabled: boolean;
  cmkKeyArn: string;
  tables: SnowflakeTableAudit[];
  metrics: {
    totalTables: number;
    quantumCompliantTables: number;
    activeMaskingPolicies: number;
    avgQueryLatencyMs: number;
  };
}

// Elasticsearch SIEM & Telemetry Types
export interface ElasticLogEvent {
  id: string;
  timestamp: string;
  index: string;
  logLevel: 'INFO' | 'WARN' | 'ERROR' | 'ALERT';
  sourceComponent: string;
  message: string;
  cryptoPrimitive?: string;
  quantumRiskTier?: 'CRITICAL' | 'HIGH' | 'SECURE';
  fipsCompliance?: string;
  details?: Record<string, any>;
}

export interface ElasticsearchStatus {
  connected: boolean;
  clusterName: string; // e.g. pqc-elastic-siem-cluster
  clusterHealth: 'GREEN' | 'YELLOW' | 'RED';
  nodeCount: number;
  totalIndices: number;
  totalDocuments: number;
  storageGb: number;
  activeShards: number;
  version: string;
  recentLogs: ElasticLogEvent[];
}

// -------------------------------------------------------------------------
// NEW ENTERPRISE INTEGRATION TYPES
// -------------------------------------------------------------------------

export interface EnterpriseConnectorStatus {
  id: string;
  name: string;
  vendor: string;
  category: string;
  connected: boolean;
  endpoint: string;
  version: string;
  pqcAlgorithm: string;
  nistStandard: string;
  health: 'HEALTHY' | 'WARNING' | 'SYNCING';
  latencyMs: number;
  lastSync: string;
  metrics: Record<string, string | number>;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    meta: string;
    status: 'ACTIVE' | 'PENDING' | 'PROTECTED' | 'FLAGGED';
  }>;
  auditLogs: Array<{
    id: string;
    time: string;
    event: string;
    level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT';
    primitive: string;
  }>;
}

