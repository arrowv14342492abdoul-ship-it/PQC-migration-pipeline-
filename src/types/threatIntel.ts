export type CveSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CveAttackVector = 'NETWORK' | 'ADJACENT_RF' | 'LOCAL' | 'PHYSICAL';

export type CveExploitStatus =
  | 'ACTIVE_EXPLOIT'
  | 'WEAPONIZED'
  | 'UNPATCHED_ZERO_DAY'
  | 'VENDOR_ADVISORY';

export interface ThreatIntelCve {
  id: string; // e.g., "CVE-2026-38291"
  title: string;
  targetEnvironmentIds: string[]; // matches STRIKE_TARGETS id or 'ALL'
  targetCategory:
    | 'Radar & RF A2/AD'
    | 'Subterranean C4I'
    | 'Maritime Fleet / SAG'
    | 'Mobile TEL Battery'
    | 'Industrial SCADA & Power Grid'
    | 'Multi-Domain Tactical / Avionics';
  cvssScore: number; // e.g. 9.8
  cvssSeverity: CveSeverity;
  epssScore: number; // Exploit Prediction Scoring System 0.00 - 1.00
  cisaKev: boolean; // CISA Known Exploited Vulnerabilities catalog
  zeroDay: boolean;
  publishedDate: string;
  affectedComponents: string[];
  attackVector: CveAttackVector;
  attackComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  mitreTechnique: string;
  mitreTactic: string;
  description: string;
  impact: string;
  tacticalRelevance: string;
  pqcRelevance?: {
    vulnerableCrypto: string;
    pqcFix: string;
    harvestNowRisk: boolean;
  };
  suggestedCyberPayloadId?: string;
  exploitStatus: CveExploitStatus;
  feedSource: 'CISA-KEV' | 'DOD-CYBERCOM' | 'NSA-GHIDRA' | 'NVD-LIVE' | 'PALANTIR-INTEL' | 'DEFENSE-SIGINT';
}

export interface TickerFilterOptions {
  searchQuery: string;
  severityFilter: 'ALL' | CveSeverity;
  cisaKevOnly: boolean;
  zeroDayOnly: boolean;
  pqcFlawsOnly: boolean;
  targetOnly: boolean;
}
