export type B21RadarMode =
  | 'Broadband AESA LPI'
  | 'SAR All-Weather Strike'
  | 'Global ESM Surveillance'
  | 'Total Emission Silence';

export type B21FlightMode = 'Stealth' | 'Combat' | 'Training';

export interface B21PqcSecurityParams {
  profileName: string;
  kemAlgorithm: string;
  signatureAlgorithm: string;
  securityLevel: 'Category 5 (Top Secret)' | 'Category 3 (Secret)' | 'Category 1 / Range Test';
  rekeyIntervalSeconds: number;
  emconLevel: 'EMCON 1 (VLO Broadband Silence)' | 'EMCON 3 (Protected Standoff SATCOM)' | 'EMCON 5 (Strategic Test / Range)';
  datalinkEncryptionMode: string;
  quantumResistanceScore: number;
  hsmCryptoCore: string;
  burstLatencyMs: number;
  antiJamStatus: string;
  ephemeralEntropySource: string;
  strikePackageSync: string;
  activeCiphersuite: string;
  rcsModifierExplanation: string;
  nc3AuthorizationStatus: string;
}

export interface B21WeaponSystem {
  id: string;
  name: string;
  category: 'Strategic Nuclear' | 'Standoff Hypersonic' | 'Super-Heavy Penetrator' | 'Autonomous CCA Swarm' | 'Maritime Strike' | 'Smart Munitions';
  guidance: string;
  rangeKm: string;
  warhead: string;
  yield?: string;
  weightKg: number;
  maxPayloadCount: number;
  releaseEnvelope: string;
  busInterface: string;
  cryptoArmingProtocol: string;
  description: string;
  defaultBay: 'Rotary Launcher Alpha' | 'Rotary Launcher Bravo' | 'Internal Heavy Bay' | 'CCA Swarm Bay';
  readyCount: number;
  status: 'READY' | 'LOADED' | 'ARMED' | 'EXPENDED';
}

export interface B21FlightState {
  flightMode: B21FlightMode;
  pqcSecurity: B21PqcSecurityParams;
  airspeedKnots: number;
  mach: number;
  altitudeFeet: number;
  throttlePercent: number;
  rangeRemainingNm: number;
  fuelPercent: number;
  gForce: number;
  aoaDegrees: number;
  heading: number;
  pitch: number;
  roll: number;
  verticalSpeedFpm: number;
  stealthRcsSqm: number;
  radarMode: B21RadarMode;
  thermalSuppressionActive: boolean;
  weaponBayDoors: 'CLOSED' | 'OPEN' | 'TRANSIT';
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
  palCodeAuthorized: boolean;
  autopilotMode: 'GLOBAL_STEER' | 'TERRAIN_AVOIDANCE' | 'PENETRATION_PROFILE' | 'OFF';
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE' | 'CLASSICAL_RESTRICTED' | 'REKEYING';
}

export interface B21AvionicsSubsystem {
  id: string;
  name: string;
  acronym: string;
  category:
    | 'Open Mission Systems (OMS) Core'
    | 'DevSecOps Containerized Infrastructure'
    | 'Multifunction Sensors & Electronic Warfare'
    | 'NC3 Resilient Cryptoprocessor'
    | 'CCA Swarm Command & MUM-T'
    | 'Fly-By-Wire Flying Wing Flight Control';
  omsDomain: 'OMS Main Compute Cluster' | 'NC3 Nuclear Safety Enclave' | 'Sensor Mesh Backplane' | 'Flight Safety VMS';
  softwareLanguage: 'Ada 2012' | 'C++20' | 'Rust' | 'Ada 2012 / Rust Hybrid';
  linesOfCode: number;
  busInterface: 'High-Speed Optical OMS Fabric' | 'Time-Triggered Ethernet (TTEthernet)' | 'MIL-STD-1760 Weapons Bus' | 'Fibre Channel';
  criticalityLevel: 'DO-178C Level A (Safety-Critical)' | 'Level B' | 'Level C';
  pqcCompliance: string;
  description: string;
  sourceFile: string;
  codeSnippet: string;
}

export interface B21BusFrame {
  id: string;
  timestamp: string;
  busChannel: 'OMS-OPTICAL-FABRIC' | 'TTEthernet-Safety' | 'MIL-1760-ROTARY' | 'NC3-CRYPTO-BUS';
  remoteTerminal: string;
  subAddress: string;
  wordCount: number;
  hexPayload: string;
  decodedMeaning: string;
  status: 'VALID' | 'ACK' | 'PQC_ENCRYPTED';
}

export interface B21StrategicTrack {
  id: string;
  callsign: string;
  type: 'Strategic Air Defense (S-500)' | 'Over-the-Horizon Radar' | 'Hostile Interceptor' | 'Underground Command Facility' | 'Friendly Tanker (KC-46)';
  bearing: number;
  rangeNm: number;
  altitudeFeet: number;
  mach: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MONITOR' | 'FRIENDLY';
  lockStatus: 'STANDOFF_TRACK' | 'PENETRATING_VLO' | 'TARGET_DESIGNATED';
}

export interface B21KeyNegotiationLatencySample {
  timestamp: string;
  cycle: number;
  kemEncapMs: number;
  kemDecapMs: number;
  satcomRttMs: number;
  totalNegotiationMs: number;
  classicalEcdhMs: number;
  algorithm: string;
  flightMode: B21FlightMode;
  jitterMicrosec: number;
  handshakeStatus: 'SUCCESS' | 'RATCHETED' | 'RESYNC';
}

export interface B21StrikePackageNode {
  callsign: string;
  tailNumber: string;
  role: 'Raider Lead (Ghost 01)' | 'Raider Element (Ghost 02)' | 'CCA Autonomous Loyal Wingman (Vanguard 1)' | 'CCA Swarm Scout (Vanguard 2)' | 'Milstar / AEHF SATCOM Gateway';
  distanceNm: number;
  linkStatus: 'CONNECTED' | 'LPI_DIRECTIONAL' | 'STANDBY';
  latencyMs: number;
  kemAlgorithm: string;
  rssiDb: number;
  packetLossPercent: number;
  lastRatchet: string;
}

export interface B21OmsPerformanceMetrics {
  omsCpuUtilization: number;
  nc3CryptoCoresUtilization: number;
  opticalFabricThroughputGbps: number;
  tteWordRatePerSec: number;
  cryptoCoreTempC: number;
  cryogenicTrngEntropyRateGbps: number;
  busJitterNs: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  cyclicExecutionRateHz: number;
}
