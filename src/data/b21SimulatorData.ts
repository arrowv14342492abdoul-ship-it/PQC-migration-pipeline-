import {
  B21FlightState,
  B21FlightMode,
  B21PqcSecurityParams,
  B21WeaponSystem,
  B21AvionicsSubsystem,
  B21BusFrame,
  B21StrategicTrack,
  B21KeyNegotiationLatencySample,
  B21StrikePackageNode,
  B21OmsPerformanceMetrics,
} from '../types/b21Simulator';

export const B21_MAJOR_WEAPONS_SYSTEMS: B21WeaponSystem[] = [
  {
    id: 'agm-181-lrso',
    name: 'AGM-181 LRSO (Long-Range Standoff Cruise Missile)',
    category: 'Strategic Nuclear',
    guidance: 'Ultra-Low Observable Airframe + PQC Inertial Navigation + Optical Terrain Matching',
    rangeKm: '2,500+ km Standoff (Mach 0.85)',
    warhead: 'W80-4 Variable-Yield Nuclear Warhead',
    yield: '5 kt to 150 kt Selectable',
    weightKg: 1350,
    maxPayloadCount: 16, // Carried on dual internal rotary launchers
    releaseEnvelope: 'Alt: 5,000 - 55,000 ft | Intercontinental Standoff Penetration',
    busInterface: 'MIL-STD-1760 Class I Nuclear Arming Bus / Optical OMS Fabric',
    cryptoArmingProtocol: 'USAF Permissive Action Link (PAL Category F) + FIPS 204 ML-DSA-87 Release Order',
    description:
      'Next-generation stealth nuclear cruise missile replacing the AGM-86B ALCM, designed to penetrate advanced anti-access air defense environments to hold high-value strategic targets at risk from extreme standoff distances.',
    defaultBay: 'Rotary Launcher Alpha',
    readyCount: 8,
    status: 'READY',
  },
  {
    id: 'b61-12-lep',
    name: 'B61-12 Life Extension Program Thermonuclear Bomb',
    category: 'Strategic Nuclear',
    guidance: 'Precision Tail-Kit Assembly + Dual Anti-Jam GPS/INS + Spin-Rocket Stabilization',
    rangeKm: 'Internal High-Altitude Guided Glide',
    warhead: 'Thermonuclear Earth-Penetrating Warhead',
    yield: '0.3 kt / 1.5 kt / 10 kt / 50 kt Dial-a-Yield',
    weightKg: 375,
    maxPayloadCount: 16,
    releaseEnvelope: 'Alt: 200 - 55,000 ft | Subsonic VLO High-Altitude Drop',
    busInterface: 'MIL-STD-1760 Nuclear Weapons Bus',
    cryptoArmingProtocol: 'Two-Man Rule Cryptographic Key Card + Permissive Action Link PAL Category F',
    description:
      'Guided tactical and strategic nuclear gravity bomb capable of earth-penetration for neutralizing deeply buried command bunkers and mobile strategic nuclear missile silos with minimal collateral fallout.',
    defaultBay: 'Rotary Launcher Bravo',
    readyCount: 8,
    status: 'READY',
  },
  {
    id: 'gbu-57-mop',
    name: 'GBU-57 Massive Ordnance Penetrator (MOP - 30,000 lb)',
    category: 'Super-Heavy Penetrator',
    guidance: 'Anti-Jam PQC GPS Guidance Kit + Reinforced Steel Ingress Casing',
    rangeKm: 'High-Altitude Kinetic Penetration (Reaches terminal velocity)',
    warhead: 'Hardened BLU-127 High Explosive Blast Penetrator (2,400 kg HE)',
    yield: '5,300 lb AFX-757 High Explosive (Penetrates 60m / 200 ft of reinforced concrete)',
    weightKg: 13600, // 30,000 lbs
    maxPayloadCount: 2, // The B-21 can carry heavy internal bunker busters
    releaseEnvelope: 'Alt: 40,000 - 55,000 ft | High-Mach Level Release directly over bunker complex',
    busInterface: 'Heavy Munitions Mechanical Ejector Bus & Telemetry',
    cryptoArmingProtocol: 'Hardened Target Fuze Cryptographic Depth Programmer',
    description:
      'Massive 30,000 lb bunker buster weapon engineered to penetrate up to 60 meters (200 feet) of 5,000 psi reinforced concrete before detonating, neutralizing deeply buried underground enrichment facilities.',
    defaultBay: 'Internal Heavy Bay',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'agm-158d-jassm-xr',
    name: 'AGM-158D JASSM-XR (Extreme Range Standoff Missile)',
    category: 'Smart Munitions',
    guidance: 'VLO Composite Airframe + Directional Weapon-to-Weapon Datalink + IIR Terminal Correlator',
    rangeKm: '1,900+ km Standoff (Intercontinental reach)',
    warhead: 'Hardened Penetrating Blast-Fragmentation Warhead (450 kg / 1000 lb)',
    weightKg: 1400,
    maxPayloadCount: 16,
    releaseEnvelope: 'Alt: 10,000 - 50,000 ft | Autonomous Low-Altitude Ingress',
    busInterface: 'Optical OMS Armament Fabric / MIL-STD-1760',
    cryptoArmingProtocol: 'FIPS 203 ML-KEM-1024 Intra-Swarm Target Sharing Key',
    description:
      'Extreme-range variant of the stealth cruise missile featuring an upgraded wing package, higher fuel capacity, and dynamic in-flight re-targeting against relocatable strategic leadership targets.',
    defaultBay: 'Rotary Launcher Alpha',
    readyCount: 8,
    status: 'READY',
  },
  {
    id: 'gbu-72-a5k',
    name: 'GBU-72 Advanced 5,000 lb Penetrator (A5K)',
    category: 'Super-Heavy Penetrator',
    guidance: 'Modified Heavy JDAM GPS/INS Guidance Kit + Smart Depth-Sensing Fuze',
    rangeKm: '32 km High-Altitude Glide',
    warhead: 'BLU-138 Deep Penetration High-Strength Casing (2,268 kg / 5,000 lb)',
    yield: 'High-Density Insensitive Munition (Destroys hardened mountain tunnels)',
    weightKg: 2270,
    maxPayloadCount: 6,
    releaseEnvelope: 'Alt: 25,000 - 52,000 ft | Supersonic toss or level release',
    busInterface: 'MIL-STD-1760 Class I Interface',
    cryptoArmingProtocol: 'Smart Buried Target Delay Void-Counting Cryptographic Fuze',
    description:
      'Medium-heavy 5,000 lb penetrator providing bunker destruction lethality significantly exceeding the older GBU-28, with smart void-sensing fuzes that count floors before detonating in the command bunker.',
    defaultBay: 'Internal Heavy Bay',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'hacm-hypersonic',
    name: 'Hypersonic Attack Cruise Missile (HACM)',
    category: 'Standoff Hypersonic',
    guidance: 'Scramjet Hydrocarbon Engine (Mach 6+) + Multi-Spectral Hypersonic Seeker',
    rangeKm: '1,200+ km (Hypersonic Dash under 10 minutes)',
    warhead: 'High-Kinetic Energy Focused Lethality Warhead',
    yield: 'Extreme Kinetic Transfer + High-Explosive Core',
    weightKg: 1200,
    maxPayloadCount: 8,
    releaseEnvelope: 'Alt: 45,000 - 55,000 ft | High-altitude supersonic separation',
    busInterface: 'High-Speed Optical OMS Armament Bus',
    cryptoArmingProtocol: 'PQC Lattice Arming Certificate + Microsecond Trajectory Sync',
    description:
      'Air-breathing hypersonic scramjet cruise missile capable of traveling Mach 6+ to strike time-critical, heavily defended fleeting targets before hostile forces can relocate or initiate countermeasures.',
    defaultBay: 'Rotary Launcher Bravo',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'cca-loyal-wingman-bay',
    name: 'Collaborative Combat Aircraft (CCA) Autonomous Swarm Bay',
    category: 'Autonomous CCA Swarm',
    guidance: 'Distributed Autonomous AI Mesh + Directional Low-Observable Datalink',
    rangeKm: '3,000+ km Mission Radius',
    warhead: 'Modular: Electronic Attack Jammer, Forward Sensor Scout, or Kinetic Weapons',
    weightKg: 2500,
    maxPayloadCount: 4, // 2-4 air-launched loyal wingman airframes or micro-drone racks
    releaseEnvelope: 'Alt: 20,000 - 50,000 ft | In-flight launch and command-and-control',
    busInterface: 'OMS Cloud-Native Kubernetes Swarm Control Backplane',
    cryptoArmingProtocol: 'Zero-Trust Multi-Agent Decentralized PQC Ratchet (Falcon-1024)',
    description:
      'Internal carriage and air-launch deployment bay for autonomous Collaborative Combat Aircraft (CCA) and micro-drone swarms, providing forward sensor scouting, decoy dispersal, and coordinated stand-in jamming.',
    defaultBay: 'CCA Swarm Bay',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'siaw-b21',
    name: 'Stand-in Attack Weapon (SiAW - Heavy Air Force Variant)',
    category: 'Smart Munitions',
    guidance: 'Solid Rocket Booster (Mach 3.5+) + Multi-Domain Anti-Radiation / Optical Seeker',
    rangeKm: '350+ km Penetration',
    warhead: 'Penetrating Blast-Fragmentation Multi-Effects Warhead',
    weightKg: 450,
    maxPayloadCount: 16,
    releaseEnvelope: 'Alt: 10,000 - 52,000 ft | SEAD/DEAD and Coastal Defense Strike',
    busInterface: 'Universal Armament Interface (UAI) / MIL-STD-1760',
    cryptoArmingProtocol: 'CNSA 2.0 Level 5 Zero-Knowledge Arming Hash',
    description:
      'High-speed strike missile specifically engineered to engage theater ballistic missile transporter-erector-launchers (TELs), anti-ship cruise missile batteries, and GPS jammers inside dense A2/AD zones.',
    defaultBay: 'Rotary Launcher Alpha',
    readyCount: 8,
    status: 'READY',
  },
  {
    id: 'quicksink-maritime',
    name: 'Quicksink Maritime Heavy Surface Strike Munition',
    category: 'Maritime Strike',
    guidance: 'All-Weather Maritime Optical Seeker + GPS/INS Precision Anti-Ship Guidance',
    rangeKm: '35 km High-Altitude Glide',
    warhead: 'BLU-109 Hardened Naval Penetrator (907 kg / 2,000 lb)',
    yield: 'Instant Keel-Breaking Torpedo-Equivalent Lethality',
    weightKg: 950,
    maxPayloadCount: 16,
    releaseEnvelope: 'Alt: 20,000 - 45,000 ft | Neutralization of heavy naval surface combatants',
    busInterface: 'MIL-STD-1760 Class I Naval Strike Bus',
    cryptoArmingProtocol: 'Maritime Target Classification Cryptographic Key (PQC Validated)',
    description:
      'Air-delivered heavy weapon designed to hit surface warships at the waterline, breaking the ship keel with torpedo-like lethality at a fraction of the cost of a heavyweight submarine torpedo.',
    defaultBay: 'Internal Heavy Bay',
    readyCount: 6,
    status: 'READY',
  },
  {
    id: 'pcaw-defense',
    name: 'Next-Gen Penetrating Counterair Weaponry (PCAW Self-Defense)',
    category: 'Smart Munitions',
    guidance: 'Micro-Interception Hit-to-Kill Kinetic Seeker + 360° Threat Correlator',
    rangeKm: '40 km Intercept Zone (Mach 4.0)',
    warhead: 'Directional Focused Micro-Blast Countermeasure',
    weightKg: 45,
    maxPayloadCount: 24, // Internal defensive counter-missile rack
    releaseEnvelope: 'All-Aspect 360° defensive hard-kill protection against incoming AAMs and SAMs',
    busInterface: 'VMS Emergency Defensive Fire Control Bus',
    cryptoArmingProtocol: 'Automated Threat Intercept Authorization Token (Sub-Millisecond)',
    description:
      'Miniature hit-to-kill defensive interceptors launched backwards and laterally from the B-21 to physically destroy incoming enemy surface-to-air and air-to-air missiles targeting the bomber.',
    defaultBay: 'Internal Heavy Bay',
    readyCount: 12,
    status: 'READY',
  },
  {
    id: 'gbu-38-54-smart-rack',
    name: 'GBU-38 / GBU-54 Smart Bomb High-Density Rack (48 Weapons)',
    category: 'Smart Munitions',
    guidance: 'Laser / GPS Dual-Mode JDAM Guidance',
    rangeKm: '24 km',
    warhead: 'MK-82 High Explosive Blast (227 kg / 500 lb)',
    weightKg: 250,
    maxPayloadCount: 48, // Carried on dense multi-station rotary carriage
    releaseEnvelope: 'Alt: 10,000 - 45,000 ft | Ripple release across 48 individual tactical targets',
    busInterface: 'High-Density MIL-STD-1760 Multiplex Bus',
    cryptoArmingProtocol: 'Batch Cryptographic Fuze Target Coordinate Ratchet',
    description:
      'High-capacity rotary rack configuration allowing the B-21 to individually target and eliminate up to 48 separate tactical military objectives in a single penetrating strike run.',
    defaultBay: 'Rotary Launcher Bravo',
    readyCount: 24,
    status: 'READY',
  },
  {
    id: 'b83-1-strategic',
    name: 'B83-1 Megaton Strategic Thermonuclear Bomb',
    category: 'Strategic Nuclear',
    guidance: 'Uncompromising Hardened Steel Casing + Heavy Ribbon Parachute Retardation',
    rangeKm: 'Low-Level High-Speed Laydown Delivery (Mach 0.85)',
    warhead: 'Strategic Multistage Thermonuclear Weapon',
    yield: 'Variable Yield up to 1.2 Megatons (1,200 kt TNT equivalent)',
    weightKg: 1090,
    maxPayloadCount: 4,
    releaseEnvelope: 'Alt: 150 - 50,000 ft | Extreme survivability shock mitigation',
    busInterface: 'MIL-STD-1760 Nuclear Weapons Bus',
    cryptoArmingProtocol: 'Emergency Action Message (EAM) Authenticated Cryptographic Release Order',
    description:
      'United States highest-yield nuclear gravity bomb, reserved for deepest underground mountain command centers and hard rock missile silos that cannot be eliminated by sub-megaton weapons.',
    defaultBay: 'Internal Heavy Bay',
    readyCount: 2,
    status: 'LOADED',
  },
];

export const B21_PQC_MODE_PRESETS: Record<B21FlightMode, B21PqcSecurityParams> = {
  Stealth: {
    profileName: 'CNSA 2.0 Ultra-VLO Deep Penetration Ingress',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 + Kyber-1024 (Category 5 Top Secret)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-87 (CNSA 2.0 Category 5)',
    securityLevel: 'Category 5 (Top Secret)',
    rekeyIntervalSeconds: 30,
    emconLevel: 'EMCON 1 (VLO Broadband Silence)',
    datalinkEncryptionMode: 'Directional Low-Probability-of-Interception Optical/Ku Crosslink',
    quantumResistanceScore: 100,
    hsmCryptoCore: 'Cryogenic Liquid-Cooled NC3 Tamper-Proof Cryptoprocessor (FIPS 140-3 L4)',
    burstLatencyMs: 0.11,
    antiJamStatus: 'Broadband RF Suppression + Frequency Hopping Optical Transmission',
    ephemeralEntropySource: 'Quantum Vacuum Fluctuations True Random Generator (TRNG)',
    strikePackageSync: 'Pre-shared lattice key schedule with Milstar/AEHF QKD satellite anchor',
    activeCiphersuite: 'ML-KEM-1024 / AES-256-GCM / ML-DSA-87 / SHA-3-512',
    rcsModifierExplanation:
      'Ultra Low Observable 0.00001 m² (Continuous flying wing, radar absorbent composite, zero RF signature, active thermal exhaust cooling)',
    nc3AuthorizationStatus: 'NC3 CODE SECURE: Two-Man Rule cryptographically verified',
  },
  Combat: {
    profileName: 'Strategic Standoff Strike & CCA Swarm Command',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 + X25519 (Fast Cycle Category 3)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-65 (Rapid Target Broadcast)',
    securityLevel: 'Category 3 (Secret)',
    rekeyIntervalSeconds: 120,
    emconLevel: 'EMCON 3 (Protected Standoff SATCOM)',
    datalinkEncryptionMode: 'High-Bandwidth 100 Hz Cyclic Protected Tactical SATCOM (PTS) & Swarm Mesh',
    quantumResistanceScore: 99.5,
    hsmCryptoCore: 'Dual OMS Accelerated Post-Quantum Vector Matrix Co-Processor',
    burstLatencyMs: 0.07,
    antiJamStatus: 'Multi-Beam Null-Steering Array & Protected Tactical Enterprise Service (PTES)',
    ephemeralEntropySource: 'Continuous Multi-Ring Oscillator High-Entropy Pool',
    strikePackageSync: 'Autonomous Collaborative Combat Aircraft (CCA) Swarm Lattice Mesh',
    activeCiphersuite: 'ML-KEM-768 / ChaCha20-Poly1305 / ML-DSA-65 / SHA-384',
    rcsModifierExplanation:
      'Standoff VLO 0.00001 m² (Spikes momentarily to 0.015 m² during heavy rotary launcher door cycling)',
    nc3AuthorizationStatus: 'CONVENTIONAL / NUCLEAR SELECTIVE: Permissive Action Link Armed',
  },
  Training: {
    profileName: 'Ellsworth / Whiteman AFB Strategic Deterrence Sortie',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-512 + Classical Fallback (Range Test)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-44 + Dual ECDSA P-256',
    securityLevel: 'Category 1 / Range Test',
    rekeyIntervalSeconds: 600,
    emconLevel: 'EMCON 5 (Strategic Test / Range)',
    datalinkEncryptionMode: 'FAA & DoD Joint Range Safety Telemetry Link',
    quantumResistanceScore: 88.5,
    hsmCryptoCore: 'OMS Unclassified Flight Test Instrumentation Partition',
    burstLatencyMs: 0.32,
    antiJamStatus: 'Standard Range-Safety Test Protocol (FAA Mode 5 Active)',
    ephemeralEntropySource: 'Cryptographic Deterministic Range Random Seed Generator',
    strikePackageSync: 'Global Strike Command Ground Debriefing Link',
    activeCiphersuite: 'ML-KEM-512 / AES-128-GCM / ECDSA P-256 (Declassifiable Telemetry)',
    rcsModifierExplanation:
      'Simulated 0.3500 m² (Luneburg Lens Radar Reflectors physically attached for civilian ATC surveillance)',
    nc3AuthorizationStatus: 'TRAINING / EXERCISE ONLY: Nuclear Release Inhibited by Hardware Lockout',
  },
};

export const INITIAL_B21_FLIGHT_STATE: B21FlightState = {
  flightMode: 'Stealth',
  pqcSecurity: B21_PQC_MODE_PRESETS['Stealth'],
  airspeedKnots: 520,
  mach: 0.88,
  altitudeFeet: 52000,
  throttlePercent: 74,
  rangeRemainingNm: 6420,
  fuelPercent: 88,
  gForce: 1.0,
  aoaDegrees: 2.8,
  heading: 345,
  pitch: 1.2,
  roll: 0.0,
  verticalSpeedFpm: 0,
  stealthRcsSqm: 0.00001,
  radarMode: 'Broadband AESA LPI',
  thermalSuppressionActive: true,
  weaponBayDoors: 'CLOSED',
  selectedWeaponId: 'agm-181-lrso',
  weaponsInventory: [
    {
      slot: 'ROTARY-A-1',
      weaponId: 'agm-181-lrso',
      name: 'AGM-181 LRSO Cruise Missile',
      count: 8,
      guidance: 'VLO Composite + PQC INS + Optical Terrain Correlator',
      status: 'READY',
    },
    {
      slot: 'ROTARY-B-1',
      weaponId: 'b61-12-lep',
      name: 'B61-12 Thermonuclear Bomb',
      count: 8,
      guidance: 'Precision Guided Tail-Kit + Earth Penetrator',
      status: 'READY',
    },
    {
      slot: 'HEAVY-BAY-1',
      weaponId: 'gbu-57-mop',
      name: 'GBU-57 MOP (30,000 lb)',
      count: 2,
      guidance: 'Anti-Jam PQC GPS + Hardened Steel Kinetic Ingress',
      status: 'READY',
    },
    {
      slot: 'SWARM-BAY-1',
      weaponId: 'cca-loyal-wingman-bay',
      name: 'CCA Autonomous Swarm Core',
      count: 4,
      guidance: 'Distributed Autonomous AI Mesh + Directional LPI Datalink',
      status: 'READY',
    },
  ],
  masterArm: true,
  palCodeAuthorized: true,
  autopilotMode: 'PENETRATION_PROFILE',
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE',
};

export const B21_AVIONICS_SUBSYSTEMS: B21AvionicsSubsystem[] = [
  {
    id: 'b21-oms',
    name: 'Open Mission Systems (OMS) Modular Core Architecture',
    acronym: 'OMS Core',
    category: 'Open Mission Systems (OMS) Core',
    omsDomain: 'OMS Main Compute Cluster',
    softwareLanguage: 'Ada 2012 / Rust Hybrid',
    linesOfCode: 11200000,
    busInterface: 'High-Speed Optical OMS Fabric',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 203 ML-KEM-1024 + FIPS 204 ML-DSA-87 Hardware Integrated',
    description:
      'Next-generation open architecture computing fabric separating flight-critical safety kernels from rapid-upgrade tactical mission services, allowing rapid plug-and-play insertion of new sensors, weapons, and cryptographic algorithms.',
    sourceFile: 'avionics/b21/oms/modular_core_router.rs',
    codeSnippet: `// Northrop Grumman B-21 Raider - Open Mission Systems (OMS) Core
// DO-178C Level A / Memory-Safe Real-Time Microkernel Fabric
use b21_crypto::pqc::{LatticeKem1024, MlDsa87Signer};
use b21_oms_network::optical_fabric::FrameRouter;

pub struct OmsMissionRouter {
    crypto_enclave: LatticeKem1024,
    signer: MlDsa87Signer,
    optical_router: FrameRouter,
}

impl OmsMissionRouter {
    pub fn dispatch_tactical_telemetry(&mut self, payload: &[u8]) -> Result<(), OmsError> {
        // Enforce CNSA 2.0 Level 5 cryptographic isolation
        let shared_session_key = self.crypto_enclave.encapsulate_ephemeral_key()?;
        let digital_signature = self.signer.sign_message(payload)?;
        
        let encrypted_envelope = self.crypto_enclave.encrypt_aes256_gcm(
            payload,
            &shared_session_key,
            &digital_signature
        )?;
        
        self.optical_router.transmit_lpi_burst(&encrypted_envelope);
        Ok(())
    }
}`,
  },
  {
    id: 'b21-devsecops',
    name: 'Cloud-Native Containerized DevSecOps Avionics Infrastructure',
    acronym: 'DevSecOps Mesh',
    category: 'DevSecOps Containerized Infrastructure',
    omsDomain: 'OMS Main Compute Cluster',
    softwareLanguage: 'Rust',
    linesOfCode: 4500000,
    busInterface: 'Time-Triggered Ethernet (TTEthernet)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Cryptographic Container Signature Verification (Notary PQC)',
    description:
      'Airborne edge microservice environment running secure containerized software modules with microsecond deterministic guarantees, enabling in-flight updates of electronic warfare threat libraries and weapon release algorithms.',
    sourceFile: 'avionics/b21/devsecops/airborne_container_manager.rs',
    codeSnippet: `// B-21 Airborne DevSecOps Secure Microservice Host
use b21_security::notary::PqcSignatureVerifier;

pub struct AirborneContainerHost {
    verifier: PqcSignatureVerifier,
}

impl AirborneContainerHost {
    pub fn mount_tactical_service(&self, image_manifest: &ContainerManifest) -> bool {
        // Enforce hardware-attested cryptographic verification
        if !self.verifier.verify_ml_dsa_87(&image_manifest.digest, &image_manifest.signature) {
            log_security_alert("REJECTED: Container signature failed PQC audit");
            return false;
        }
        
        allocate_deterministic_core_slice(image_manifest.resource_envelope);
        true
    }
}`,
  },
  {
    id: 'b21-nc3',
    name: 'NC3 Resilient Cryptoprocessor & Permissive Action Link Enclave',
    acronym: 'NC3 Crypto',
    category: 'NC3 Resilient Cryptoprocessor',
    omsDomain: 'NC3 Nuclear Safety Enclave',
    softwareLanguage: 'Ada 2012',
    linesOfCode: 1950000,
    busInterface: 'MIL-STD-1760 Weapons Bus',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'NSA CNSA 2.0 Category 5 Ultra-High Security Certification',
    description:
      'Isolated tamper-proof nuclear command, control, and communications (NC3) security module executing two-man rule cryptographic validation, Milstar/AEHF protected communications, and weapon permissive action links.',
    sourceFile: 'avionics/b21/nc3/pal_crypto_enclave.adb',
    codeSnippet: `-- B-21 Raider NC3 Nuclear Safety Enclave & Permissive Action Link (PAL)
package body NC3_Crypto_Enclave is

   function Validate_Pal_Code (
      Aircraft_Commander_Key : in Cryptographic_Card;
      Mission_Commander_Key  : in Cryptographic_Card;
      National_Command_EAM   : in Emergency_Action_Message
   ) return Authorization_Result is
   begin
      -- Enforce Two-Man Rule hardware verification
      if not Hardware_Tokens_Present(Aircraft_Commander_Key, Mission_Commander_Key) then
         return AUTHORIZATION_DENIED_TWO_MAN_VIOLATION;
      end if;

      -- Validate EAM digital signature with NIST FIPS 204 ML-DSA-87
      if not Verify_PQC_Signature(National_Command_EAM.Signature, CNSA_Level_5_Key) then
         return AUTHORIZATION_DENIED_SIGNATURE_INVALID;
      end if;

      Enable_Rotary_Launcher_Arming_Circuits;
      return AUTHORIZATION_GRANTED_WEAPONS_LIVE;
   end Validate_Pal_Code;

end NC3_Crypto_Enclave;`,
  },
  {
    id: 'b21-sensors',
    name: 'Multifunction Broadband Sensor Array & Electronic Warfare',
    acronym: 'Broadband AESA',
    category: 'Multifunction Sensors & Electronic Warfare',
    omsDomain: 'Sensor Mesh Backplane',
    softwareLanguage: 'C++20',
    linesOfCode: 5800000,
    busInterface: 'High-Speed Optical OMS Fabric',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 203 Kyber-1024 Spread-Spectrum Waveform Modulation',
    description:
      'Conformal radar and electronic warfare apertures embedded flush along the flying-wing leading edges and underside, providing long-range all-weather targeting, electronic jamming, and total passive threat localization.',
    sourceFile: 'avionics/b21/sensors/conformal_sensor_array.cpp',
    codeSnippet: `// B-21 Conformal Broadband AESA & Electronic Warfare Array
#include <b21/sensors/conformal_mesh.hpp>

void ConformalArrayController::synthesizeLowObservableBeam(BeamVector& vector) {
    // Inject ultra-wideband phase shifts to prevent hostile ESM interception
    vector.applyBroadbandPhaseAgility();
    vector.suppressSidelobesUnderMinus70dB();
    
    // Low Probability of Interception (LPI) energy dispersal
    m_opticalTransceiver.modulateWithPqcEntropy(m_quantumHsm.getEntropyStream());
}`,
  },
  {
    id: 'b21-cca',
    name: 'Collaborative Combat Aircraft (CCA) Swarm Orchestration Engine',
    acronym: 'CCA Swarm Core',
    category: 'CCA Swarm Command & MUM-T',
    omsDomain: 'OMS Main Compute Cluster',
    softwareLanguage: 'Rust',
    linesOfCode: 3600000,
    busInterface: 'Time-Triggered Ethernet (TTEthernet)',
    criticalityLevel: 'Level B',
    pqcCompliance: 'Decentralized Multi-Agent Swarm PQC Handshake (Falcon-1024)',
    description:
      'Manned-Unmanned Teaming (MUM-T) core coordinating swarms of autonomous Collaborative Combat Aircraft (CCA) operating 100+ miles ahead of the bomber to map radar gaps, suppress defenses, and conduct forward strikes.',
    sourceFile: 'avionics/b21/cca/swarm_orchestrator.rs',
    codeSnippet: `// Autonomous Collaborative Combat Aircraft (CCA) Swarm Orchestrator
use b21_cca::swarm::{DroneNode, SwarmCommandPlan};

pub struct SwarmDirector {
    active_drones: Vec<DroneNode>,
}

impl SwarmDirector {
    pub fn assign_standoff_sead_ingress(&mut self, threat_coordinates: Coordinates) {
        for drone in &mut self.active_drones {
            if drone.role == Role::ForwardJammer {
                drone.transmit_directional_tasking(SwarmCommandPlan {
                    target_waypoint: threat_coordinates,
                    rf_emission_mode: EmissionMode::ElectronicAttackPqcSync,
                });
            }
        }
    }
}`,
  },
  {
    id: 'b21-flybywire',
    name: 'Relaxed Static Stability Flying Wing Flight Control Laws',
    acronym: 'Fly-By-Wire VMS',
    category: 'Fly-By-Wire Flying Wing Flight Control',
    omsDomain: 'Flight Safety VMS',
    softwareLanguage: 'Ada 2012',
    linesOfCode: 3100000,
    busInterface: 'Time-Triggered Ethernet (TTEthernet)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Cryptographically Verified Quad-Redundant Actuator Loop',
    description:
      'Quadruplex-redundant digital flight control system executing complex multi-axis control laws for the tailless flying-wing planform, utilizing split drag rudders, elevons, and thrust pitch trim for aerodynamically seamless stability.',
    sourceFile: 'avionics/b21/flight/flying_wing_vms.adb',
    codeSnippet: `-- B-21 Tailless Flying-Wing Digital Flight Control Laws
package body Flying_Wing_VMS is

   procedure Compute_Aerodynamic_Surfaces (
      Inertial_State   : in  Inertial_Navigation_Data;
      Target_Mach      : in  Mach_Number;
      Surface_Commands : out Elevon_And_Rudder_Array
   ) is
   begin
      -- Tailless yaw control via differential split drag rudders
      Surface_Commands.Split_Rudders := Compute_Differential_Drag(
         Sideslip_Beta => Inertial_State.Sideslip_Angle,
         Yaw_Rate      => Inertial_State.Yaw_Rate
      );

      -- Pitch and roll moment synthesis via trailing-edge elevons
      Surface_Commands.Elevons := Compute_Elevon_Deflection(
         Pitch_Demand => Inertial_State.Pitch_Rate,
         Roll_Demand  => Inertial_State.Roll_Rate
      );
   end Compute_Aerodynamic_Surfaces;

end Flying_Wing_VMS;`,
  },
];

export const SAMPLE_B21_BUS_FRAMES: B21BusFrame[] = [
  {
    id: 'b21-bus-1',
    timestamp: '14:26:01.204',
    busChannel: 'OMS-OPTICAL-FABRIC',
    remoteTerminal: 'OMS Core Router (Cluster 1)',
    subAddress: 'SA-01 (Tactical Backplane)',
    wordCount: 256,
    hexPayload: 'F001 AA55 9900 C812 PQC_FIPS203_KEM1024',
    decodedMeaning: 'Conformal Sensor Stream fused into Global Tactical Situation Display over 10 Gbps Optical Fabric',
    status: 'PQC_ENCRYPTED',
  },
  {
    id: 'b21-bus-2',
    timestamp: '14:26:01.220',
    busChannel: 'NC3-CRYPTO-BUS',
    remoteTerminal: 'NC3 Safety Enclave',
    subAddress: 'SA-09 (PAL Authorization Status)',
    wordCount: 64,
    hexPayload: '0001 0002 0005 03E8 TWO_MAN_RULE_VERIFIED',
    decodedMeaning: 'Permissive Action Link (PAL Category F) verified; Dual Cryptographic Tokens Confirmed Armed',
    status: 'PQC_ENCRYPTED',
  },
  {
    id: 'b21-bus-3',
    timestamp: '14:26:01.236',
    busChannel: 'MIL-1760-ROTARY',
    remoteTerminal: 'Rotary Launcher Alpha',
    subAddress: 'SA-14 (AGM-181 LRSO Status)',
    wordCount: 128,
    hexPayload: '03E8 0008 0001 00C8 LRSO_STRIKE_PACKAGE_RDY',
    decodedMeaning: 'Rotary Launcher Alpha: 8x AGM-181 LRSO Cruise Missiles Armed; Pre-Launch GPS/INS Initialized',
    status: 'VALID',
  },
  {
    id: 'b21-bus-4',
    timestamp: '14:26:01.252',
    busChannel: 'TTEthernet-Safety',
    remoteTerminal: 'VMS Flight Control Quad',
    subAddress: 'SA-04 (Split Drag Rudders)',
    wordCount: 32,
    hexPayload: '0010 0020 0030 0040 YAW_TRIM_STABILITY_OK',
    decodedMeaning: 'Time-Triggered Ethernet deterministic loop verified (1000 Hz cycle, zero jitter detected)',
    status: 'ACK',
  },
  {
    id: 'b21-bus-5',
    timestamp: '14:26:01.268',
    busChannel: 'OMS-OPTICAL-FABRIC',
    remoteTerminal: 'CCA Swarm Mesh Gateway',
    subAddress: 'SA-18 (Loyal Wingman Telemetry)',
    wordCount: 128,
    hexPayload: '0055 0122 0044 0088 CCA_SWARM_FORWARD_MAPPED',
    decodedMeaning: 'CCA Vanguard 1 reports S-500 radar azimuth located; Forward Electronic Attack jamming null engaged',
    status: 'PQC_ENCRYPTED',
  },
];

export const SAMPLE_B21_STRATEGIC_TRACKS: B21StrategicTrack[] = [
  {
    id: 'STRAT-01',
    callsign: 'TARGET-ALPHA (Underground Command Bunker)',
    type: 'Underground Command Facility',
    bearing: 15,
    rangeNm: 185.0,
    altitudeFeet: -120, // 120 ft underground
    mach: 0.0,
    threatLevel: 'CRITICAL',
    lockStatus: 'TARGET_DESIGNATED',
  },
  {
    id: 'STRAT-02',
    callsign: 'SAM-GRID-01 (S-500 Prometheus Battery)',
    type: 'Strategic Air Defense (S-500)',
    bearing: 42,
    rangeNm: 120.0,
    altitudeFeet: 650,
    mach: 0.0,
    threatLevel: 'HIGH',
    lockStatus: 'STANDOFF_TRACK',
  },
  {
    id: 'STRAT-03',
    callsign: 'EARLY-WARNING-01 (Container OTH Radar)',
    type: 'Over-the-Horizon Radar',
    bearing: 310,
    rangeNm: 340.0,
    altitudeFeet: 200,
    mach: 0.0,
    threatLevel: 'MONITOR',
    lockStatus: 'PENETRATING_VLO',
  },
  {
    id: 'STRAT-04',
    callsign: 'SUPPORT-01 (Friendly KC-46 Pegasus Tanker)',
    type: 'Friendly Tanker (KC-46)',
    bearing: 195,
    rangeNm: 85.0,
    altitudeFeet: 28000,
    mach: 0.8,
    threatLevel: 'FRIENDLY',
    lockStatus: 'STANDOFF_TRACK',
  },
];

export const INITIAL_B21_OMS_METRICS: B21OmsPerformanceMetrics = {
  omsCpuUtilization: 38.6,
  nc3CryptoCoresUtilization: 24.2,
  opticalFabricThroughputGbps: 8.92,
  tteWordRatePerSec: 250000,
  cryptoCoreTempC: 38.4,
  cryogenicTrngEntropyRateGbps: 4.8,
  busJitterNs: 0.85,
  memoryUsedMb: 28500,
  memoryTotalMb: 65536,
  cyclicExecutionRateHz: 1000,
};

export const INITIAL_B21_LATENCY_HISTORY: B21KeyNegotiationLatencySample[] = [
  {
    timestamp: '14:26:00',
    cycle: 1,
    kemEncapMs: 0.038,
    kemDecapMs: 0.042,
    satcomRttMs: 0.082,
    totalNegotiationMs: 0.162,
    classicalEcdhMs: 0.295,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 3.2,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:26:02',
    cycle: 2,
    kemEncapMs: 0.036,
    kemDecapMs: 0.04,
    satcomRttMs: 0.078,
    totalNegotiationMs: 0.154,
    classicalEcdhMs: 0.298,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 2.8,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:26:04',
    cycle: 3,
    kemEncapMs: 0.039,
    kemDecapMs: 0.043,
    satcomRttMs: 0.085,
    totalNegotiationMs: 0.167,
    classicalEcdhMs: 0.292,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 3.8,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:26:06',
    cycle: 4,
    kemEncapMs: 0.035,
    kemDecapMs: 0.039,
    satcomRttMs: 0.076,
    totalNegotiationMs: 0.15,
    classicalEcdhMs: 0.296,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 2.6,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '14:26:08',
    cycle: 5,
    kemEncapMs: 0.037,
    kemDecapMs: 0.041,
    satcomRttMs: 0.08,
    totalNegotiationMs: 0.158,
    classicalEcdhMs: 0.294,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 3.0,
    handshakeStatus: 'SUCCESS',
  },
];

export const INITIAL_B21_STRIKE_PACKAGE_NODES: B21StrikePackageNode[] = [
  {
    callsign: 'GHOST-01 (This Ship)',
    tailNumber: 'B21-21-0001',
    role: 'Raider Lead (Ghost 01)',
    distanceNm: 0.0,
    linkStatus: 'CONNECTED',
    latencyMs: 0.01,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -28,
    packetLossPercent: 0.0,
    lastRatchet: 'Just now',
  },
  {
    callsign: 'GHOST-02',
    tailNumber: 'B21-21-0002',
    role: 'Raider Element (Ghost 02)',
    distanceNm: 45.0,
    linkStatus: 'LPI_DIRECTIONAL',
    latencyMs: 0.12,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -42,
    packetLossPercent: 0.01,
    lastRatchet: '2.1s ago',
  },
  {
    callsign: 'VANGUARD-01 (Loyal Wingman CCA)',
    tailNumber: 'CCA-MQ28-04',
    role: 'CCA Autonomous Loyal Wingman (Vanguard 1)',
    distanceNm: 95.0,
    linkStatus: 'LPI_DIRECTIONAL',
    latencyMs: 0.24,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -52,
    packetLossPercent: 0.02,
    lastRatchet: '1.4s ago',
  },
  {
    callsign: 'VANGUARD-02 (CCA Scout)',
    tailNumber: 'CCA-MQ28-05',
    role: 'CCA Swarm Scout (Vanguard 2)',
    distanceNm: 130.0,
    linkStatus: 'LPI_DIRECTIONAL',
    latencyMs: 0.31,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -58,
    packetLossPercent: 0.03,
    lastRatchet: '3.0s ago',
  },
  {
    callsign: 'AEHF-SATCOM-GATEWAY',
    tailNumber: 'USA-292 (GEO)',
    role: 'Milstar / AEHF SATCOM Gateway',
    distanceNm: 22300.0,
    linkStatus: 'CONNECTED',
    latencyMs: 0.08,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -36,
    packetLossPercent: 0.0,
    lastRatchet: '0.9s ago',
  },
];
