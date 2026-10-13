export type F35RadarMode =
  | 'AESA Multi-Mode Search'
  | 'High-Res SAR Ground Map'
  | 'GMTI Moving Target Track'
  | 'Passive ESM Barracuda';

export type F35FlightMode = 'Stealth' | 'Combat' | 'Training';

export interface F35PqcSecurityParams {
  profileName: string;
  kemAlgorithm: string;
  signatureAlgorithm: string;
  securityLevel: 'Category 5 (Top Secret)' | 'Category 3 (Secret)' | 'Category 1 / Range Test';
  rekeyIntervalSeconds: number;
  emconLevel: 'EMCON 1 (VLO Stealth Silence)' | 'EMCON 3 (MADL High-Speed Mesh)' | 'EMCON 5 (Open Test / ACMI)';
  madlEncryptionMode: string;
  quantumResistanceScore: number;
  hsmCryptoCore: string;
  burstLatencyMs: number;
  antiJamStatus: string;
  ephemeralEntropySource: string;
  flightFormationSync: string;
  activeCiphersuite: string;
  rcsModifierExplanation: string;
}

export interface F35WeaponSystem {
  id: string;
  name: string;
  category: 'Air-to-Air' | 'Air-to-Surface' | 'Nuclear' | 'Anti-Radiation' | 'Hypersonic' | 'Internal Gun';
  guidance: string;
  rangeKm: string;
  warhead: string;
  weightKg: number;
  maxCarriedInternal: number;
  maxCarriedExternal: number;
  releaseEnvelope: string;
  busInterface: string;
  cryptoArmingProtocol: string;
  description: string;
  defaultBay: 'Left Internal Bay' | 'Right Internal Bay' | 'Internal Gun' | 'External Beast Pylon';
  readyCount: number;
  status: 'READY' | 'LOADED' | 'ARMED' | 'EXPENDED';
}

export interface F35FlightState {
  flightMode: F35FlightMode;
  pqcSecurity: F35PqcSecurityParams;
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
  radarMode: F35RadarMode;
  eotsMode: 'FLIR Target Track' | 'Laser Designation' | 'Wide Search' | 'Standby';
  dasActive: boolean;
  weaponBayDoors: 'CLOSED' | 'OPEN' | 'TRANSIT';
  beastModeExternalPylons: boolean;
  selectedWeaponId: string;
  weaponsInventory: {
    slot: string;
    weaponId: string;
    name: string;
    count: number;
    guidance: string;
    status: 'READY' | 'LOADED' | 'EXPENDED';
  }[];
  masterArm: boolean;
  autopilotMode: 'ALT_HOLD' | 'TERRAIN_FOLLOW' | 'NAV_STEER' | 'COMBAT_AUTOTRACK' | 'OFF';
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE' | 'CLASSICAL_RESTRICTED' | 'REKEYING';
}

export interface F35AvionicsSubsystem {
  id: string;
  name: string;
  acronym: string;
  category:
    | 'Integrated Core Processor (ICP)'
    | 'Radar & Electronic Warfare'
    | 'Electro-Optical / Infrared'
    | 'Communications, Navigation & IFF (CNI)'
    | 'Vehicle Systems & Flight Control'
    | 'Weapons Bay & Mission Management';
  icpDomain: 'ICP-Core 1' | 'ICP-Core 2' | 'AESA Dedicated Beamformer' | 'VMS Quad Computer';
  softwareLanguage: 'C++' | 'Ada 95 / 2012' | 'C / C++ Real-Time' | 'Rust / Microkernel';
  linesOfCode: number;
  busInterface: 'IEEE-1394B FireWire' | 'Fibre Channel (FC-AV 2 Gbps)' | 'MIL-STD-1553B' | 'Gigabit Ethernet OMS';
  criticalityLevel: 'DO-178C Level A (Safety-Critical)' | 'Level B' | 'Level C';
  pqcCompliance: string;
  description: string;
  sourceFile: string;
  codeSnippet: string;
}

export interface F35BusFrame {
  id: string;
  timestamp: string;
  busChannel: 'FC-AV (Fibre Channel)' | 'IEEE-1394B (FireWire)' | 'MIL-1553B (Weapons Bus)' | 'OMS-ETH-1';
  remoteTerminal: string;
  subAddress: string;
  wordCount: number;
  hexPayload: string;
  decodedMeaning: string;
  status: 'VALID' | 'ACK' | 'PQC_ENCRYPTED';
}

export interface F35RadarTrack {
  id: string;
  callsign: string;
  type: '5th Gen Stealth Fighter' | 'AWACS Target' | 'SAM Battery (S-400)' | 'Naval Destroyer' | 'Friendly Flight';
  bearing: number;
  rangeNm: number;
  altitudeFeet: number;
  mach: number;
  iffStatus: 'HOSTILE' | 'FRIEND' | 'UNKNOWN';
  aspect: string;
  sensorSource: 'APG-81 AESA' | 'EOTS Optical' | 'DAS 360° IR' | 'Barracuda ESM';
  lockStatus: 'TRACKING' | 'SEARCH' | 'LPI_LOCKED';
}

export interface F35KeyNegotiationLatencySample {
  timestamp: string;
  cycle: number;
  kemEncapMs: number;
  kemDecapMs: number;
  madlRttMs: number;
  totalNegotiationMs: number;
  classicalEcdhMs: number;
  algorithm: string;
  flightMode: F35FlightMode;
  jitterMicrosec: number;
  handshakeStatus: 'SUCCESS' | 'RATCHETED' | 'RESYNC';
}

export interface F35FormationNode {
  callsign: string;
  tailNumber: string;
  role: 'Flight Lead' | 'Wingman 1' | 'Sensor Scout' | 'CCA Loyal Wingman (YQ-58A)';
  distanceNm: number;
  linkStatus: 'CONNECTED' | 'MADL_DIRECTIONAL' | 'STANDBY';
  latencyMs: number;
  kemAlgorithm: string;
  rssiDb: number;
  packetLossPercent: number;
  lastRatchet: string;
}

export interface F35IcpPerformanceMetrics {
  icp1CpuUtilization: number;
  icp2CpuUtilization: number;
  fibreChannelThroughputGbps: number;
  firewire1394BThroughputMbps: number;
  cryptoCoreTempC: number;
  trngEntropyRateGbps: number;
  opticalBusJitterNs: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  cyclicExecutionRateHz: number;
}
