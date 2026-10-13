export type OffensiveWeaponType =
  | 'Hypersonic Boost-Glide Weapon'
  | 'Hypersonic Air-Breathing Cruise Missile'
  | 'Stealth Penetrating Strike Aircraft & Collaborative Combat Aircraft (CCA)'
  | 'Long-Range Anti-Ship Standoff Missile'
  | 'Deep-Strike Surface-to-Surface Missile'
  | 'Autonomous Collaborative Strike Swarm'
  | 'Stand-in Attack Munition (SiAW)';

export type OffensiveSoftwareDomain =
  | 'Algorithmic Weaponeering & Target Pairing'
  | 'Offensive Cyber Operations & SCADA Sabotage'
  | 'Cognitive Electronic Attack & Radar Deception'
  | 'Autonomous Swarm Collaborative Strike'
  | 'Automated F2T2EA Strike Kill Chain'
  | 'Hypersonic Trajectory Optimization';

export interface OffensiveWeapon {
  id: string;
  name: string;
  designation: string;
  contractor: string;
  weaponType: OffensiveWeaponType;
  speedMach: number;
  rangeKm: number;
  flightProfile: string;
  guidanceSystem: string;
  warheadType: string;
  platforms: string[];
  quantumCryptoLink: {
    status: 'PQC_PROTECTED' | 'TRANSITIONING';
    standard: string;
    antiTamperKeyId: string;
    description: string;
  };
  readinessStatus: 'ARMED_READY' | 'STANDBY_ALERT' | 'PREFLIGHT' | 'IN_FLIGHT';
  circularErrorProbableMeters: number;
  specs: {
    lengthMeters: number;
    weightKg: number;
    propulsion: string;
  };
}

export interface OffensiveSoftware {
  id: string;
  name: string;
  codeName: string;
  agencyOrContractor: string;
  classification: 'SECRET // NOFORN' | 'TOP SECRET // SCI // EXCLUSIVE' | 'CUI // REL TO NATO';
  domain: OffensiveSoftwareDomain;
  description: string;
  capabilities: string[];
  apiEndpoint: string;
  pqcSecurityProtocol: string;
  readiness: 'ACTIVE_DEPLOYED' | 'ARMED' | 'STANDBY';
  telemetry: {
    cycleTimeMs: number;
    targetThroughputPerSec: number;
    solutionCertaintyPct: number;
  };
}

export interface StrikeTarget {
  id: string;
  designation: string;
  targetType: string;
  locationName: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
    mgrs: string;
  };
  defenses: string;
  hardenedTier: 'DEEP_UNDERGROUND_BUNKER' | 'HEAVILY_DEFENDED_A2AD' | 'MOBILE_RELOCATABLE' | 'MARITIME_EXPEDITIONARY';
  priority: 'CRITICAL_STRATEGIC' | 'THEATER_HIGH' | 'OPERATIONAL';
  collateralDamageRisk: string;
  recommendedWeaponId: string;
  recommendedSoftwareId: string;
  calculatedKillProbability: number;
  bdaCompleted: boolean;
}

export interface OffensiveCyberPayload {
  id: string;
  name: string;
  targetInfrastructure: string;
  deliveryVector: string;
  operationalEffect: string;
  stealthDurationSec: number;
  status: 'ARMED_READY' | 'TRANSMITTING' | 'EFFECT_OBSERVED' | 'STANDBY';
  exploitType: string;
}

export type KillChainPhase =
  | 'FIND'
  | 'FIX'
  | 'TRACK'
  | 'TARGET'
  | 'ENGAGE'
  | 'ASSESS';

export interface StrikeMissionExecution {
  targetId: string;
  weaponId: string;
  softwareId: string;
  kineticOrCyber: 'KINETIC' | 'NON_KINETIC_CYBER' | 'DUAL_SPECTRUM_STRIKE';
  roeApproved: boolean;
  pqcAuthenticationVerified: boolean;
  currentPhase: KillChainPhase;
  phaseProgressPct: number;
  timeToImpactSeconds: number;
  telemetryLogs: string[];
  bdaDamageScorePct: number | null;
  status: 'IDLE' | 'STRIKE_DISPATCHED' | 'MIDCOURSE_HOMING' | 'TERMINAL_MANEUVER' | 'TARGET_NEUTRALIZED' | 'ABORTED';
}
