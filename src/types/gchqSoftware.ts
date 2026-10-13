export interface GCHQRepository {
  id: string;
  name: string;
  repoName: string;
  githubUrl: string;
  description: string;
  category:
    | 'Cyber Swiss Army Knife'
    | 'Graph Analytics'
    | 'Audit & Event Logging'
    | 'Data Governance'
    | 'AI & ML Governance'
    | 'Core Libraries';
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
    run: string;
  };
  gchqMissionContext: string;
  liveDemoUrl?: string;
}

export type CyberChefOpName =
  | 'To Base64'
  | 'From Base64'
  | 'To Hex'
  | 'From Hex'
  | 'URL Encode'
  | 'URL Decode'
  | 'ROT13'
  | 'Defang IP'
  | 'Defang URL'
  | 'Reverse'
  | 'SHA-256'
  | 'SHA-512'
  | 'MD5'
  | 'Calculate Entropy'
  | 'Magic (Auto-Detect)'
  | 'To Binary'
  | 'From Binary'
  | 'XOR';

export interface CyberChefRecipeStep {
  id: string;
  op: CyberChefOpName;
  args?: Record<string, any>;
  enabled: boolean;
}

export interface CyberChefBakeResult {
  recipe: string[];
  inputLength: number;
  outputLength: number;
  output: string;
  executionTimeMs: number;
  steps: {
    stepIndex: number;
    op: CyberChefOpName;
    outputSnippet: string;
    durationMs: number;
  }[];
  entropy?: number;
  magicDetections?: {
    format: string;
    confidence: number;
    description: string;
  }[];
}

export interface GafferNode {
  id: string;
  label: string;
  group: 'Threat Actor' | 'C2 Server' | 'Malware' | 'Vulnerability' | 'Target Entity' | 'Indicator';
  properties: Record<string, any>;
}

export interface GafferEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'OPERATES' | 'RESOLVES_TO' | 'EXPLOITS' | 'TARGETS' | 'DROPS' | 'BEACONS_TO';
  weight: number;
  confidence: number;
}

export interface GafferGraphData {
  nodes: GafferNode[];
  edges: GafferEdge[];
  summary: {
    totalEntities: number;
    totalRelationships: number;
    subgraphDensity: string;
    riskCluster: string;
  };
}
