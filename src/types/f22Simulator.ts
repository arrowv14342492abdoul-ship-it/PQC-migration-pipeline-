export type RadarMode =
  | 'LPI Search'
  | 'Track-While-Scan'
  | 'SAR Ground Map'
  | 'Passive Silent';

export type F22FlightMode = 'Stealth' | 'Combat' | 'Training';

export interface F22PqcSecurityParams {
  profileName: string;
  kemAlgorithm: string;
  signatureAlgorithm: string;
  securityLevel: 'Category 5 (Top Secret)' | 'Category 3 (Secret)' | 'Category 1 / Range Test';
  rekeyIntervalSeconds: number;
  emconLevel: 'EMCON 1 (Strict RF Silence)' | 'EMCON 3 (Tactical Mesh)' | 'EMCON 5 (Open Training / ACMI)';
  ifdlEncryptionMode: string;
  quantumResistanceScore: number;
  hsmCryptoCore: string;
  burstLatencyMs: number;
  antiJamStatus: string;
  ephemeralEntropySource: string;
  flightFormationSync: string;
  activeCiphersuite: string;
  rcsModifierExplanation: string;
}

export interface F22FlightState {
  flightMode: F22FlightMode;
  pqcSecurity: F22PqcSecurityParams;
  airspeedKnots: number;
  mach: number;
  altitudeFeet: number;
  throttlePercent: number;
  afterburner: boolean;
  supercruise: boolean;
  gForce: number;
  aoaDegrees: number;
  heading: number;
  pitch: number;
  roll: number;
  verticalSpeedFpm: number;
  stealthRcsSqm: number;
  radarMode: RadarMode;
  thrustVectorAngle: number;
  weaponBayDoors: 'CLOSED' | 'OPEN' | 'TRANSIT';
  selectedWeapon: string;
  weaponsInventory: {
    slot: string;
    name: string;
    count: number;
    guidance: string;
    status: 'READY' | 'LOADED' | 'EXPENDED';
  }[];
  masterArm: boolean;
  autopilotMode: 'ALT_HOLD' | 'TERRAIN_FOLLOW' | 'NAV_STEER' | 'COMBAT_AUTOTRACK' | 'OFF';
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE' | 'CLASSICAL_RESTRICTED' | 'REKEYING';
}

export interface F22AvionicsSubsystem {
  id: string;
  name: string;
  acronym: string;
  category:
    | 'Common Integrated Processor (CIP)'
    | 'Radar & Sensors'
    | 'Electronic Warfare'
    | 'Flight Controls & VMS'
    | 'Communications & Datalink'
    | 'Weapons Integration';
  cipHost: 'CIP 1' | 'CIP 2' | 'Distributed VMS' | 'AESA Dedicated Array';
  softwareLanguage: 'Ada 95' | 'C++' | 'VHDL / Microcode' | 'Ada 95 / C++ Hybrid';
  linesOfCode: number;
  busInterface: 'Fibre Channel (400 Mbps)' | 'MIL-STD-1553B' | 'IEEE-1394B FireWire' | 'High-Speed Optical Bus';
  criticalityLevel: 'DO-178C Level A (Safety-Critical)' | 'Level B' | 'Level C';
  pqcCompliance: string;
  description: string;
  sourceFile: string;
  codeSnippet: string;
}

export interface MilStd1553Frame {
  id: string;
  timestamp: string;
  busChannel: 'CH-A (MIL-1553B)' | 'CH-B (MIL-1553B)' | 'FC-OPTICAL-1';
  remoteTerminal: string;
  subAddress: string;
  wordCount: number;
  hexPayload: string;
  decodedMeaning: string;
  status: 'VALID' | 'ACK' | 'PQC_ENCRYPTED';
}

export interface F22RadarTrack {
  id: string;
  callsign: string;
  type: 'Hostile Fighter' | 'AWACS Target' | 'Surface Radar' | 'Friendly Flight';
  bearing: number;
  rangeNm: number;
  altitudeFeet: number;
  mach: number;
  iffStatus: 'HOSTILE' | 'FRIEND' | 'UNKNOWN';
  aspect: string;
  lockStatus: 'TRACKING' | 'SEARCH' | 'LPI_LOCKED';
}

export interface KeyNegotiationLatencySample {
  timestamp: string;
  cycle: number;
  kemEncapMs: number;
  kemDecapMs: number;
  ifdlRttMs: number;
  totalNegotiationMs: number;
  classicalEcdhMs: number;
  algorithm: string;
  flightMode: F22FlightMode;
  jitterMicrosec: number;
  handshakeStatus: 'SUCCESS' | 'RATCHETED' | 'RESYNC';
}

export interface MultiShipFormationNode {
  callsign: string;
  tailNumber: string;
  role: 'Flight Lead' | 'Wingman 1' | 'Element Lead' | 'Wingman 2';
  distanceNm: number;
  linkStatus: 'CONNECTED' | 'LPI_BURST' | 'STANDBY';
  latencyMs: number;
  kemAlgorithm: string;
  rssiDb: number;
  packetLossPercent: number;
  lastRatchet: string;
}

export interface CIPPerformanceMetrics {
  cip1CpuUtilization: number;
  cip2CpuUtilization: number;
  fibreChannelThroughputMbps: number;
  mil1553WordsPerSec: number;
  cryptoCoreTempC: number;
  trngEntropyRateGbps: number;
  opticalBusJitterNs: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  cyclicExecutionRateHz: number;
}
