export type KaliToolCategory =
  | 'Information Gathering'
  | 'Vulnerability Analysis'
  | 'Web Application Analysis'
  | 'Database Assessment'
  | 'Password Attacks'
  | 'Wireless Attacks'
  | 'Reverse Engineering'
  | 'Exploitation & Verification'
  | 'Forensics & Incident Response'
  | 'Sniffing & Spoofing'
  | 'Post-Exploitation'
  | 'Reporting & Compliance';

export interface KaliTool {
  id: string;
  name: string;
  category: KaliToolCategory;
  packageName: string;
  binaryPath: string;
  version: string;
  license: string;
  metapackage: 'kali-linux-default' | 'kali-linux-large' | 'kali-linux-everything';
  summary: string;
  defensiveUseCase: string;
  pqcRelevance: string;
  defaultCommand: string;
  supportedFlags: {
    flag: string;
    description: string;
    example: string;
  }[];
  sampleOutput: string;
  remediationCodeSnippet?: string;
}

export interface KaliTerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'error' | 'success' | 'system' | 'banner';
  content: string;
  timestamp?: string;
}

export interface KaliAuditScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  targetEnvironment: string;
  toolsUsed: string[];
  simulatedCommand: string;
  pqcRemediationAvailable: boolean;
  expectedFindings: string[];
}

export interface KaliSystemStatus {
  distribution: string;
  kernelVersion: string;
  architecture: string;
  uptime: string;
  memoryUsageMb: number;
  totalMemoryMb: number;
  packagesInstalled: number;
  activeInterface: string;
  ipAddress: string;
  metapackageStatus: string;
}
