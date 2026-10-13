export type DefensePrimeId =
  | 'palantir'
  | 'lockheed'
  | 'northrop'
  | 'raytheon'
  | 'anduril'
  | 'generaldynamics'
  | 'l3harris'
  | 'baesystems';

export type ClassificationLevel =
  | 'UNCLASSIFIED'
  | 'CUI // REL TO NATO'
  | 'SECRET // NOFORN'
  | 'TOP SECRET // SCI';

export type DefenseDomain =
  | 'Multi-Domain C2 (JADC2)'
  | 'Air & Missile Defense'
  | 'Autonomous Swarms & AI'
  | 'Avionics & Open Mission Systems'
  | 'High-Assurance Crypto & EW'
  | 'Geospatial & Targeting Intelligence'
  | 'Naval Combat & Undersea Warfare';

export interface DefenseSoftwareProduct {
  id: string;
  contractorId: DefensePrimeId;
  contractorName: string;
  name: string;
  acronym: string;
  category: DefenseDomain;
  classification: ClassificationLevel;
  tagline: string;
  description: string;
  coreCapabilities: string[];
  interoperabilityStandards: string[];
  quantumResistance: {
    status: 'TRANSITIONING_CNSA_2_0' | 'PQC_NATIVE' | 'COMPENSATING_CONTROLS_ACTIVE';
    targetAlgorithm: string;
    fipsCompliance: string;
  };
  deploymentEnvironment: string;
  apiEndpointSimulated: string;
  status: 'OPERATIONAL' | 'MISSION_READY' | 'ACTIVE_DEFENSE';
  telemetry: {
    activeNodes: number;
    latencyMs: number;
    throughputGbps: number;
    zeroTrustVerificationsSec: number;
  };
}

export interface DefensePrimeInfo {
  id: DefensePrimeId;
  name: string;
  ticker: string;
  hqLocation: string;
  defenseFocus: string;
  flagshipPrograms: string[];
  accentColor: string;
  badgeBg: string;
  borderColor: string;
}

export interface SensorToShooterTrack {
  id: string;
  designation: string;
  threatType: 'Hypersonic Glide Vehicle' | 'Ballistic Missile (MRBM)' | 'Low-RCS Cruise Missile' | 'Autonomous Drone Swarm' | 'Uncrewed Surface Vessel';
  rangeKm: number;
  altitudeMeters: number;
  velocityMach: number;
  iffStatus: 'HOSTILE' | 'UNKNOWN_EVALUATING' | 'FRIENDLY';
  detectingSensor: string;
  fusionSystem: string;
  recommendedShooter: string;
  status: 'DETECTED' | 'TRACK_FORMED' | 'FIRE_SOLUTION_COMPUTED' | 'PQC_COMMAND_DISPATCHED' | 'INTERCEPTED';
}

export interface PalantirAIPPromptLog {
  id: string;
  timestamp: string;
  prompt: string;
  operatorClearance: ClassificationLevel;
  ontologyEntities: string[];
  guardrailChecks: {
    lawOfArmedConflict: 'PASSED' | 'REVIEW_REQUIRED';
    rulesOfEngagement: 'AUTHORIZED' | 'CONDITIONAL';
    pqcAttestation: 'FIPS_204_VERIFIED' | 'PENDING';
  };
  recommendedAction: string;
  auditHash: string;
}

export interface DefenseMissionSuiteStage {
  stage: number;
  name: string;
  description: string;
  telemetryMetric: string;
  status: 'PENDING' | 'INITIALIZING' | 'ACTIVE' | 'LOCKED';
}

export interface DefenseMissionSuite {
  id: string;
  codeName: string;
  name: string;
  contractorId: DefensePrimeId;
  contractorName: string;
  classification: ClassificationLevel;
  theater: string;
  objective: string;
  integratedSoftware: string[];
  operationalRole: string;
  readinessLevel: string;
  quantumCryptoConfig: {
    keyExchange: string;
    signatureAuth: string;
    cryptoLevel: string;
  };
  stages: DefenseMissionSuiteStage[];
  activeThreatScenario: string;
  tacticalOutput: string;
  telemetryGauges: {
    latencyMs: number;
    bandwidthGbps: number;
    nodeSyncPct: number;
    quantumAssurancePct: number;
  };
}
