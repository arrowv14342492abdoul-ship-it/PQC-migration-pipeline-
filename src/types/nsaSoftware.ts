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
}

export interface WalkoffActionNode {
  id: string;
  title: string;
  app: 'Ghidra Headless' | 'Timely Metrics' | 'SIMP Hardening' | 'SOAR Containment' | 'NiFi Pipeline';
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
