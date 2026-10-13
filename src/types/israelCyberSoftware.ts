export interface IsraelCyberRepository {
  id: string;
  name: string;
  repoName: string;
  githubUrl: string;
  description: string;
  category:
    | 'National Cyber Defense'
    | 'Threat Intelligence & CERT'
    | 'ICS & Critical Infrastructure'
    | 'Runtime eBPF Security'
    | 'IaC & Compliance'
    | 'Post-Quantum Research';
  stars: number;
  forks: number;
  license: string;
  primaryLanguage: string;
  status: 'Official Sovereign' | 'Flagship' | 'Active';
  officialTagline: string;
  keyFeatures: string[];
  architectureOverview: string;
  quickStartCommands: {
    clone: string;
    docker?: string;
    run: string;
  };
  incdRole: string;
  documentationUrl?: string;
}

export interface CdmControlItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  status: 'IMPLEMENTED' | 'IN_PROGRESS' | 'GAP_DETECTED';
  pqcRelevance: string;
  remediationSnippet: string;
}

export interface CertIlThreatAlert {
  id: string;
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  targetSector: string;
  date: string;
  mitreTactic: string;
  description: string;
  mitigation: string;
  iocs: string[];
  quantumRisk: string;
}

export interface TraceeEbpfEvent {
  id: string;
  timestamp: string;
  processName: string;
  syscall: string;
  probeType: 'kprobe' | 'tracepoint' | 'raw_syscall';
  description: string;
  verdict: 'BLOCKED' | 'FLAGGED' | 'VERIFIED';
  cryptoPrimitive: string;
}
