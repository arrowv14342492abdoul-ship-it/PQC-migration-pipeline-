import {
  F22FlightState,
  F22FlightMode,
  F22PqcSecurityParams,
  F22AvionicsSubsystem,
  MilStd1553Frame,
  F22RadarTrack,
  KeyNegotiationLatencySample,
  MultiShipFormationNode,
  CIPPerformanceMetrics,
} from '../types/f22Simulator';

export const F22_PQC_MODE_PRESETS: Record<F22FlightMode, F22PqcSecurityParams> = {
  Stealth: {
    profileName: 'CNSA 2.0 Ultra-High Assurance Stealth Ingress',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 + Kyber-1024 (Level 5)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-87 (Security Category 5)',
    securityLevel: 'Category 5 (Top Secret)',
    rekeyIntervalSeconds: 30,
    emconLevel: 'EMCON 1 (Strict RF Silence)',
    ifdlEncryptionMode: 'LPI/LPD Directional Optical & Narrow-Beam Lattice Ratchet',
    quantumResistanceScore: 100,
    hsmCryptoCore: 'CIP 1 Tamper-Proof Cryogenic L2 Key Storage (FIPS 140-3 L4)',
    burstLatencyMs: 0.12,
    antiJamStatus: 'Adaptive Null-Steering & Frequency Agility (LPI Active)',
    ephemeralEntropySource: 'True Quantum Hardware TRNG (FIPS 140-3 L4)',
    flightFormationSync: 'Pre-shared lattice key schedule with intra-flight quantum hashes',
    activeCiphersuite: 'ML-KEM-1024 / AES-256-GCM / ML-DSA-87 / SHA-3-512',
    rcsModifierExplanation: 'Pure Low Observable 0.0001 m² (Stealth RAM coating, doors sealed, no RF emissions)',
  },
  Combat: {
    profileName: 'Tactical BVR & Dogfight High-Throughput Formation Mesh',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 + X25519 (Fast Cycle Level 3)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-65 (Rapid Datalink Guidance)',
    securityLevel: 'Category 3 (Secret)',
    rekeyIntervalSeconds: 120,
    emconLevel: 'EMCON 3 (Tactical Mesh)',
    ifdlEncryptionMode: 'High-Bandwidth 50 Hz Cyclic Multi-Ship Intra-Flight Link',
    quantumResistanceScore: 99.4,
    hsmCryptoCore: 'Dual CIP 1 & CIP 2 Accelerated Vector Cryptoprocessor',
    burstLatencyMs: 0.08,
    antiJamStatus: 'High-PRF Spread-Spectrum Frequency Hopping (Link-16 Gateway Active)',
    ephemeralEntropySource: 'Continuous High-Entropy Vector Hardware Pool',
    flightFormationSync: 'Dynamic 4-Ship Raptor Cell Mesh Handshake',
    activeCiphersuite: 'ML-KEM-768 / ChaCha20-Poly1305 / ML-DSA-65 / SHA-384',
    rcsModifierExplanation: 'Standard Combat Stealth 0.0001 m² (Spikes to 0.024 m² only during weapons release)',
  },
  Training: {
    profileName: 'Range Sortie / Red Flag Aggressor / ACMI Pod Telemetry',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-512 + Classical Fallback (ACMI Pod)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-44 + Dual ECDSA P-256',
    securityLevel: 'Category 1 / Range Test',
    rekeyIntervalSeconds: 600,
    emconLevel: 'EMCON 5 (Open Training / ACMI)',
    ifdlEncryptionMode: 'Synthetic Range-Certified Red/Blue Simulation Link',
    quantumResistanceScore: 88.0,
    hsmCryptoCore: 'CIP Instrumentation & Range Debriefing Module (Unclassified)',
    burstLatencyMs: 0.35,
    antiJamStatus: 'Standard Range-Safety Test Protocol (FAA Mode 5 Active)',
    ephemeralEntropySource: 'Standard Cryptographic PRNG (Deterministic Range Seeds)',
    flightFormationSync: 'Nellis AFB Range Control Telemetry Sync',
    activeCiphersuite: 'ML-KEM-512 / AES-128-GCM / ECDSA P-256 (Declassifiable Telemetry)',
    rcsModifierExplanation: 'Simulated 0.1500 m² (Luneburg Lens Radar Reflectors physically bolted for ATC/Safety tracking)',
  },
};

export const INITIAL_F22_FLIGHT_STATE: F22FlightState = {
  flightMode: 'Stealth',
  pqcSecurity: F22_PQC_MODE_PRESETS['Stealth'],
  airspeedKnots: 940,
  mach: 1.62,
  altitudeFeet: 48500,
  throttlePercent: 82,
  afterburner: false,
  supercruise: true,
  gForce: 1.0,
  aoaDegrees: 3.2,
  heading: 275,
  pitch: 1.8,
  roll: 0.0,
  verticalSpeedFpm: 0,
  stealthRcsSqm: 0.0001,
  radarMode: 'LPI Search',
  thrustVectorAngle: 0.0,
  weaponBayDoors: 'CLOSED',
  selectedWeapon: 'AIM-120D AMRAAM',
  weaponsInventory: [
    {
      slot: 'MAIN-BAY-1',
      name: 'AIM-120D AMRAAM',
      count: 2,
      guidance: 'Two-Way Datalink + Active Radar Terminal + PQC GPS',
      status: 'READY',
    },
    {
      slot: 'MAIN-BAY-2',
      name: 'AIM-120D AMRAAM',
      count: 2,
      guidance: 'Two-Way Datalink + Active Radar Terminal + PQC GPS',
      status: 'READY',
    },
    {
      slot: 'MAIN-BAY-3',
      name: 'AIM-120D AMRAAM',
      count: 2,
      guidance: 'Two-Way Datalink + Active Radar Terminal + PQC GPS',
      status: 'READY',
    },
    {
      slot: 'SIDE-BAY-L',
      name: 'AIM-9X Block II Sidewinder',
      count: 1,
      guidance: 'High Off-Boresight Imaging Infrared (IIR)',
      status: 'READY',
    },
    {
      slot: 'SIDE-BAY-R',
      name: 'AIM-9X Block II Sidewinder',
      count: 1,
      guidance: 'High Off-Boresight Imaging Infrared (IIR)',
      status: 'READY',
    },
    {
      slot: 'INTERNAL-GUN',
      name: 'M61A2 20mm Vulcan Cannon',
      count: 480,
      guidance: 'High-Rate Rotary Gatling (6,000 rpm)',
      status: 'READY',
    },
  ],
  masterArm: true,
  autopilotMode: 'NAV_STEER',
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE',
};

export const F22_AVIONICS_SUBSYSTEMS: F22AvionicsSubsystem[] = [
  {
    id: 'isf-fusion',
    name: 'Integrated Sensor Fusion Core',
    acronym: 'ISF Core',
    category: 'Common Integrated Processor (CIP)',
    cipHost: 'CIP 1',
    softwareLanguage: 'Ada 95 / C++ Hybrid',
    linesOfCode: 850000,
    busInterface: 'Fibre Channel (400 Mbps)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Compliant (CNSA 2.0 ML-KEM Key Exchange integration)',
    description:
      'The central situational awareness engine of the Raptor. Automatically correlates tracks from the AN/APG-77 radar, AN/ALR-94 EW suite, CNI, and IFDL datalink into unified tracks, presenting a single, un-cluttered picture on the pilot tactical display.',
    sourceFile: 'f22_sensor_fusion.adb',
    codeSnippet: `-- F-22 Raptor Avionics Mission Software
-- Package: F22_Sensor_Fusion_Engine
-- Specification: DO-178C Level A Real-Time Cyclic Execution (50 Hz)

with F22_Types; use F22_Types;
with F22_Radar_Tracks;
with F22_ALR94_EW;
with F22_PQC_Crypto;

package body F22_Sensor_Fusion_Engine is

   procedure Correlate_Sensor_Tracks (
      Radar_In   : in  F22_Radar_Tracks.Track_Buffer;
      EW_In      : in  F22_ALR94_EW.Emitter_Buffer;
      Fused_Out  : out F22_Types.Tactical_Track_Array
   ) is
      Kalman_Gain   : Float;
      Pos_Residual  : Vector_3D;
   begin
      -- Process all APG-77 active radar reflections
      for I in Radar_In'Range loop
         if Radar_In(I).Signal_Quality > Threshold_LPI then
            -- Cross-correlate with passive ALR-94 electronic emission bearings
            Pos_Residual := Compute_Residual (Radar_In(I), EW_In);
            if Length (Pos_Residual) < Correlation_Gate_NM then
               -- Synthesize single God's-Eye track with kinematic vector
               Fused_Out(I).Track_ID    := Radar_In(I).Track_ID;
               Fused_Out(I).IFF_Status  := Evaluate_IFF_Mode_5 (Radar_In(I));
               Fused_Out(I).Threat_Rank := Compute_Priority (Radar_In(I), EW_In);
            end if;
         end if;
      end loop;
   end Correlate_Sensor_Tracks;

end F22_Sensor_Fusion_Engine;`,
  },
  {
    id: 'apg77-radar',
    name: 'AN/APG-77 AESA Radar Processing Engine',
    acronym: 'APG-77 Radar',
    category: 'Radar & Sensors',
    cipHost: 'CIP 1',
    softwareLanguage: 'Ada 95',
    linesOfCode: 520000,
    busInterface: 'High-Speed Optical Bus',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'CNSA 2.0 Frequency Schedule Hardened',
    description:
      'Active Electronically Scanned Array comprising 1,956 solid-state transmit/receive modules. Executes agile beam steering in nanoseconds, pseudo-random frequency hopping, and low-power spread-spectrum waveforms that prevent enemy RWR systems from detecting radar radiation.',
    sourceFile: 'apg77_beam_steering.adb',
    codeSnippet: `-- AN/APG-77 AESA Radar Beam Steering & Waveform Synthesis
-- File: apg77_beam_steering.adb
-- Architecture: Low Probability of Intercept (LPI) Microsecond Frequency Hopping

package body APG77_Beam_Steering is

   procedure Execute_Agile_Scan (
      Azimuth_Bounds   : in Angle_Range;
      Elevation_Bounds : in Angle_Range;
      LPI_Mode         : in Boolean
   ) is
      Hop_Freq : Frequency_Hz;
   begin
      -- Generate pseudo-random agile frequency schedule
      Hop_Freq := F22_TRNG.Get_Hardware_Random_Frequency;
      
      -- Beam steering phase shift calculation for 1,956 T/R elements
      for Element_Idx in 1 .. Total_TR_Modules loop
         Set_Module_Phase (
            Element  => Element_Idx,
            Phase_Rad => Compute_Phase_Offset (Element_Idx, Azimuth_Bounds, Hop_Freq),
            Atten_DB  => (if LPI_Mode then 18.5 else 0.0)
         );
      end loop;
      
      -- Pulse Doppler burst transmission
      Emit_LPI_Waveform (Hop_Freq, Pulse_Width_Microsec => 4.2);
   end Execute_Agile_Scan;

end APG77_Beam_Steering;`,
  },
  {
    id: 'ifdl-cnsa2',
    name: 'Intra-Flight Data Link & PQC Crypto Wrapper',
    acronym: 'IFDL PQC',
    category: 'Communications & Datalink',
    cipHost: 'CIP 2',
    softwareLanguage: 'Ada 95 / C++ Hybrid',
    linesOfCode: 380000,
    busInterface: 'MIL-STD-1553B',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'NIST FIPS 203 (ML-KEM-768) & FIPS 204 (ML-DSA-65)',
    description:
      'Directional low-probability-of-detection stealth datalink linking 4-ship Raptor flights. Upgraded under the F-22 RACR program with a post-quantum cryptographic hybrid wrapper that prevents quantum-capable adversaries from decrypting harvested inter-flight tactical telemetry.',
    sourceFile: 'ifdl_pqc_hybrid.adb',
    codeSnippet: `-- Intra-Flight Data Link (IFDL) CNSA 2.0 Post-Quantum Session Wrapper
-- File: ifdl_pqc_hybrid.adb
-- Integrates NIST FIPS 203 ML-KEM-768 with classical X25519 for dual-layer stealth comms

with Interfaces.C; use Interfaces.C;
with Liboqs_Bindings;

package body IFDL_PQC_Hybrid is

   function Establish_Flight_Mesh_Session (
      Wingman_Classical_Pub : in Byte_Array_32;
      Wingman_MLKEM_Pub     : in Byte_Array_1184
   ) return Flight_Session_Key is
      PQC_Ciphertext  : Byte_Array_1088;
      PQC_Shared_Key  : Byte_Array_32;
      Classical_Key   : Byte_Array_32;
      Master_Mesh_Key : Byte_Array_64;
   begin
      -- 1. Encapsulate Post-Quantum Shared Secret via ML-KEM-768 (FIPS 203)
      Liboqs_Bindings.OQS_KEM_Encap (
         Alg_Name   => "ML-KEM-768",
         Public_Key => Wingman_MLKEM_Pub,
         Ciphertext => PQC_Ciphertext,
         Shared_Sec => PQC_Shared_Key
      );

      -- 2. Classical Diffie-Hellman Secret (X25519)
      Classical_Key := Compute_X25519_ECDH (Wingman_Classical_Pub);

      -- 3. NIST SP 800-56C Dual KDF Combiner
      Master_Mesh_Key := Derive_HKDF_SHA384 (
         Entropy => Classical_Key & PQC_Shared_Key,
         Context => "F22-RAPTOR-IFDL-PQC-MESH-V2"
      );

      return Flight_Session_Key (Master_Mesh_Key);
   end Establish_Flight_Mesh_Session;

end IFDL_PQC_Hybrid;`,
  },
  {
    id: 'fcs-thrust-vec',
    name: 'Vehicle Management System & 2D Thrust Vectoring',
    acronym: 'VMS / TVC',
    category: 'Flight Controls & VMS',
    cipHost: 'Distributed VMS',
    softwareLanguage: 'Ada 95',
    linesOfCode: 640000,
    busInterface: 'MIL-STD-1553B',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Hardened Triple-Redundant Bus',
    description:
      'Quadruplex digital fly-by-wire flight control laws commanding aerodynamic surfaces and the Pratt & Whitney F119 2D convergent-divergent pitch-axis vectoring nozzles (±20° deflection at 20°/sec), enabling controlled flight beyond 60° angle of attack.',
    sourceFile: 'thrust_vectoring_control.adb',
    codeSnippet: `-- F-22 Vehicle Management System - Thrust Vectoring Actuation Control
-- File: thrust_vectoring_control.adb
-- Safety Classification: Quad-Redundant DO-178C Level A

package body Thrust_Vectoring_Control is

   procedure Compute_Pitch_Nozzle_Deflection (
      Stick_Pitch_Input : in  Float;
      Current_AoA       : in  Float;
      Dynamic_Pressure  : in  Float;
      Nozzle_Angle_Deg  : out Float
   ) is
      Desired_Pitch_Rate : Float;
      Max_Vector_Limit   : constant Float := 20.0; -- +/- 20 degrees
   begin
      -- Blend aerodynamic flaperons with engine nozzle pitch vectoring
      if Current_AoA > 28.0 or Dynamic_Pressure < Min_Aero_Authority_Q then
         -- Pure thrust-vector authority at post-stall angles of attack
         Desired_Pitch_Rate := Stick_Pitch_Input * 1.45;
         Nozzle_Angle_Deg   := Clamp (Desired_Pitch_Rate * 12.0, -Max_Vector_Limit, Max_Vector_Limit);
      else
         -- High-speed aero blend for Mach 1.82 Supercruise efficiency
         Nozzle_Angle_Deg   := Clamp (Stick_Pitch_Input * 3.5, -6.0, 6.0);
      end if;
   end Compute_Pitch_Nozzle_Deflection;

end Thrust_Vectoring_Control;`,
  },
  {
    id: 'alr94-ew',
    name: 'AN/ALR-94 Passive Radar Warning & EW Suite',
    acronym: 'ALR-94 EW',
    category: 'Electronic Warfare',
    cipHost: 'CIP 1',
    softwareLanguage: 'Ada 95',
    linesOfCode: 420000,
    busInterface: 'Fibre Channel (400 Mbps)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Protected Threat Library Digest',
    description:
      'Completely passive radar warning and emitter detection system with over 30 antennas embedded flush into the wings, nose, and fuselage, providing 360° spherical coverage and passive range estimation exceeding 250 nautical miles.',
    sourceFile: 'alr94_passive_tracker.adb',
    codeSnippet: `-- AN/ALR-94 Passive Emitter Geolocation & Threat Classification
package body ALR94_Passive_Tracker is

   procedure Geolocate_Emitter (
      Sensor_Phased_Inputs : in Antenna_Array_30;
      Identified_Threat    : out Threat_Emitter_Record
   ) is
      Phase_Interferometry_Bearing : Float;
   begin
      -- Differential Time of Arrival (DTOA) across wingtip and nose antennas
      Phase_Interferometry_Bearing := Compute_DTOA_Angle (Sensor_Phased_Inputs);
      
      -- Match RF pulse repetition frequency against sovereign classified emitter database
      Identified_Threat := Lookup_Threat_Library (
         Center_Freq => Sensor_Phased_Inputs.Frequency,
         PRF_Hz      => Sensor_Phased_Inputs.Pulse_Repetition_Freq
      );
      Identified_Threat.Azimuth := Phase_Interferometry_Bearing;
   end Geolocate_Emitter;

end ALR94_Passive_Tracker;`,
  },
  {
    id: 'racr-oms',
    name: 'Raptor Agile Capability Release (RACR) OMS Runtime',
    acronym: 'RACR OMS',
    category: 'Common Integrated Processor (CIP)',
    cipHost: 'CIP 2',
    softwareLanguage: 'C++',
    linesOfCode: 290000,
    busInterface: 'IEEE-1394B FireWire',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 203/204 Enforced Container Signatures',
    description:
      'Open Mission Systems (OMS) architectural container layer enabling rapid deployment of third-party tactical capabilities, AI autonomous collaborative combat aircraft (CCA) wingman coordination, and rapid crypto algorithm upgrades.',
    sourceFile: 'racr_oms_manager.cpp',
    codeSnippet: `// Raptor Agile Capability Release (RACR) - OMS Container Runtime
// Standards: Open Mission Systems (OMS) v3.1 / UCI Message Framework
#include <f22_racr/oms_kernel.hpp>
#include <f22_crypto/fips203_validator.hpp>

namespace f22::racr {

bool VerifyAndDeployTacticalApp(const std::vector<uint8_t>& container_image,
                                const std::vector<uint8_t>& mldsa_signature) {
    // Enforce NIST FIPS 204 ML-DSA-87 sovereign signature verification
    if (!f22::crypto::VerifyMlDsa87(container_image, mldsa_signature, SOVEREIGN_ROOT_CA)) {
        LOG_SECURITY_ALERT("RACR: Signature verification failed. Container rejected.");
        return false;
    }
    
    // Spawn hard real-time partitioned container on CIP 2
    return CIP2_Kernel::SpawnPartition("CCA_AUTONOMOUS_WINGMAN_V3", container_image);
}

} // namespace f22::racr`,
  },
];

export const SAMPLE_MIL_1553_FRAMES: MilStd1553Frame[] = [
  {
    id: 'frm-001',
    timestamp: '19:46:10.020',
    busChannel: 'CH-A (MIL-1553B)',
    remoteTerminal: 'RT-03 (FCS Pitch Actuator)',
    subAddress: 'SA-04 (VMS Laws)',
    wordCount: 16,
    hexPayload: '48F2 0A14 0003 7B12 0000 892C',
    decodedMeaning: 'Pitch Vectoring Command: +3.2° Nozzle Deflection (Supercruise trim)',
    status: 'VALID',
  },
  {
    id: 'frm-002',
    timestamp: '19:46:10.040',
    busChannel: 'CH-B (MIL-1553B)',
    remoteTerminal: 'RT-08 (CNI Key Vault)',
    subAddress: 'SA-11 (CNSA Crypto Key)',
    wordCount: 32,
    hexPayload: 'FIPS 203 ML-KEM-768 SESSION KEY',
    decodedMeaning: 'IFDL Rekeying Handshake: ML-KEM-768 ciphertext verified from Raptor 02',
    status: 'PQC_ENCRYPTED',
  },
  {
    id: 'frm-003',
    timestamp: '19:46:10.060',
    busChannel: 'FC-OPTICAL-1',
    remoteTerminal: 'CIP-1 (AESA Radar Track)',
    subAddress: 'SA-01 (Track Fusion)',
    wordCount: 64,
    hexPayload: '001A 4F82 11E3 90C4 0001 0000',
    decodedMeaning: 'Target Track T-104: Bearing 284°, Range 48 NM, Mach 0.94 (LPI Locked)',
    status: 'ACK',
  },
  {
    id: 'frm-004',
    timestamp: '19:46:10.080',
    busChannel: 'CH-A (MIL-1553B)',
    remoteTerminal: 'RT-12 (Main Weapon Bay)',
    subAddress: 'SA-02 (Hydraulic Interlock)',
    wordCount: 8,
    hexPayload: '0000 0000 0000 0001',
    decodedMeaning: 'Bay Doors Status: CLOSED (Stealth RCS 0.0001 m² Maintained)',
    status: 'VALID',
  },
];

export const SAMPLE_RADAR_TRACKS: F22RadarTrack[] = [
  {
    id: 'TRK-01',
    callsign: 'BANDIT-01 (Su-57 Felon)',
    type: 'Hostile Fighter',
    bearing: 284,
    rangeNm: 48,
    altitudeFeet: 36000,
    mach: 0.94,
    iffStatus: 'HOSTILE',
    aspect: 'Hot (Nose-On)',
    lockStatus: 'LPI_LOCKED',
  },
  {
    id: 'TRK-02',
    callsign: 'RADAR-02 (Mainstay A-50)',
    type: 'AWACS Target',
    bearing: 312,
    rangeNm: 112,
    altitudeFeet: 29000,
    mach: 0.72,
    iffStatus: 'HOSTILE',
    aspect: 'Flank (Right Orbit)',
    lockStatus: 'TRACKING',
  },
  {
    id: 'TRK-03',
    callsign: 'RAPTOR-02 (Wingman)',
    type: 'Friendly Flight',
    bearing: 260,
    rangeNm: 14,
    altitudeFeet: 48500,
    mach: 1.62,
    iffStatus: 'FRIEND',
    aspect: 'Trail (Tactical Spread)',
    lockStatus: 'SEARCH',
  },
];

export const INITIAL_CIP_METRICS: CIPPerformanceMetrics = {
  cip1CpuUtilization: 48.2,
  cip2CpuUtilization: 52.6,
  fibreChannelThroughputMbps: 312.4,
  mil1553WordsPerSec: 18450,
  cryptoCoreTempC: 41.3,
  trngEntropyRateGbps: 2.45,
  opticalBusJitterNs: 1.8,
  memoryUsedMb: 1420,
  memoryTotalMb: 2048,
  cyclicExecutionRateHz: 50.0,
};

export const INITIAL_LATENCY_HISTORY: KeyNegotiationLatencySample[] = [
  {
    timestamp: '19:45:00',
    cycle: 1,
    kemEncapMs: 0.046,
    kemDecapMs: 0.052,
    ifdlRttMs: 0.021,
    totalNegotiationMs: 0.119,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 1.2,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:45:15',
    cycle: 2,
    kemEncapMs: 0.044,
    kemDecapMs: 0.051,
    ifdlRttMs: 0.020,
    totalNegotiationMs: 0.115,
    classicalEcdhMs: 0.063,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 0.9,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '19:45:30',
    cycle: 3,
    kemEncapMs: 0.047,
    kemDecapMs: 0.053,
    ifdlRttMs: 0.022,
    totalNegotiationMs: 0.122,
    classicalEcdhMs: 0.065,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 1.4,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:45:45',
    cycle: 4,
    kemEncapMs: 0.045,
    kemDecapMs: 0.050,
    ifdlRttMs: 0.021,
    totalNegotiationMs: 0.116,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 1.1,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:46:00',
    cycle: 5,
    kemEncapMs: 0.048,
    kemDecapMs: 0.054,
    ifdlRttMs: 0.023,
    totalNegotiationMs: 0.125,
    classicalEcdhMs: 0.066,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 1.6,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '19:46:15',
    cycle: 6,
    kemEncapMs: 0.044,
    kemDecapMs: 0.049,
    ifdlRttMs: 0.020,
    totalNegotiationMs: 0.113,
    classicalEcdhMs: 0.062,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 0.8,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:46:30',
    cycle: 7,
    kemEncapMs: 0.028,
    kemDecapMs: 0.033,
    ifdlRttMs: 0.019,
    totalNegotiationMs: 0.080,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.6,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:46:45',
    cycle: 8,
    kemEncapMs: 0.027,
    kemDecapMs: 0.032,
    ifdlRttMs: 0.018,
    totalNegotiationMs: 0.077,
    classicalEcdhMs: 0.063,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.5,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '19:47:00',
    cycle: 9,
    kemEncapMs: 0.029,
    kemDecapMs: 0.034,
    ifdlRttMs: 0.019,
    totalNegotiationMs: 0.082,
    classicalEcdhMs: 0.065,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.7,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:47:15',
    cycle: 10,
    kemEncapMs: 0.026,
    kemDecapMs: 0.031,
    ifdlRttMs: 0.018,
    totalNegotiationMs: 0.075,
    classicalEcdhMs: 0.062,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.5,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:47:30',
    cycle: 11,
    kemEncapMs: 0.030,
    kemDecapMs: 0.035,
    ifdlRttMs: 0.020,
    totalNegotiationMs: 0.085,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.8,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '19:47:45',
    cycle: 12,
    kemEncapMs: 0.027,
    kemDecapMs: 0.032,
    ifdlRttMs: 0.019,
    totalNegotiationMs: 0.078,
    classicalEcdhMs: 0.063,
    algorithm: 'ML-KEM-768',
    flightMode: 'Combat',
    jitterMicrosec: 0.6,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:48:00',
    cycle: 13,
    kemEncapMs: 0.018,
    kemDecapMs: 0.021,
    ifdlRttMs: 0.311,
    totalNegotiationMs: 0.350,
    classicalEcdhMs: 0.065,
    algorithm: 'ML-KEM-512',
    flightMode: 'Training',
    jitterMicrosec: 3.4,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:48:15',
    cycle: 14,
    kemEncapMs: 0.019,
    kemDecapMs: 0.022,
    ifdlRttMs: 0.308,
    totalNegotiationMs: 0.349,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-512',
    flightMode: 'Training',
    jitterMicrosec: 3.1,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '19:48:30',
    cycle: 15,
    kemEncapMs: 0.018,
    kemDecapMs: 0.020,
    ifdlRttMs: 0.314,
    totalNegotiationMs: 0.352,
    classicalEcdhMs: 0.066,
    algorithm: 'ML-KEM-512',
    flightMode: 'Training',
    jitterMicrosec: 3.7,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '19:48:45',
    cycle: 16,
    kemEncapMs: 0.045,
    kemDecapMs: 0.052,
    ifdlRttMs: 0.021,
    totalNegotiationMs: 0.118,
    classicalEcdhMs: 0.064,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 1.0,
    handshakeStatus: 'SUCCESS',
  },
];

export const INITIAL_FORMATION_NODES: MultiShipFormationNode[] = [
  {
    callsign: 'RAPTOR-01 (HOST AIRFRAME)',
    tailNumber: 'AF-04-0017',
    role: 'Flight Lead',
    distanceNm: 0.0,
    linkStatus: 'CONNECTED',
    latencyMs: 0.0,
    kemAlgorithm: 'FIPS 203 ML-KEM-1024',
    rssiDb: -32,
    packetLossPercent: 0.0,
    lastRatchet: '0.4s ago',
  },
  {
    callsign: 'RAPTOR-02 (WINGMAN 1)',
    tailNumber: 'AF-04-0019',
    role: 'Wingman 1',
    distanceNm: 8.4,
    linkStatus: 'CONNECTED',
    latencyMs: 0.082,
    kemAlgorithm: 'FIPS 203 ML-KEM-1024',
    rssiDb: -84,
    packetLossPercent: 0.0,
    lastRatchet: '1.2s ago',
  },
  {
    callsign: 'RAPTOR-03 (ELEMENT LEAD)',
    tailNumber: 'AF-04-0022',
    role: 'Element Lead',
    distanceNm: 18.2,
    linkStatus: 'CONNECTED',
    latencyMs: 0.089,
    kemAlgorithm: 'FIPS 203 ML-KEM-1024',
    rssiDb: -92,
    packetLossPercent: 0.0,
    lastRatchet: '2.1s ago',
  },
  {
    callsign: 'RAPTOR-04 (WINGMAN 2)',
    tailNumber: 'AF-04-0025',
    role: 'Wingman 2',
    distanceNm: 26.5,
    linkStatus: 'LPI_BURST',
    latencyMs: 0.098,
    kemAlgorithm: 'FIPS 203 ML-KEM-1024',
    rssiDb: -101,
    packetLossPercent: 0.01,
    lastRatchet: '3.4s ago',
  },
];
