import {
  F35FlightState,
  F35FlightMode,
  F35PqcSecurityParams,
  F35WeaponSystem,
  F35AvionicsSubsystem,
  F35BusFrame,
  F35RadarTrack,
  F35KeyNegotiationLatencySample,
  F35FormationNode,
  F35IcpPerformanceMetrics,
} from '../types/f35Simulator';

export const F35_MAJOR_WEAPONS_SYSTEMS: F35WeaponSystem[] = [
  {
    id: 'aim-120d',
    name: 'AIM-120D AMRAAM (Advanced Medium-Range AAM)',
    category: 'Air-to-Air',
    guidance: 'Two-Way Encrypted Datalink + Active Radar Terminal Seeker + PQC GPS/INS',
    rangeKm: '160+ km (Mach 4+)',
    warhead: 'High-Explosive Blast-Fragmentation (18.1 kg)',
    weightKg: 161,
    maxCarriedInternal: 4, // 6 with Sidekick modification
    maxCarriedExternal: 4,
    releaseEnvelope: 'Alt: 500 - 65,000 ft | Mach 0.6 - 1.6+ | G-load: -3G to +9G',
    busInterface: 'MIL-STD-1760 Weapons Data Bus / Fibre Channel FC-AV',
    cryptoArmingProtocol: 'FIPS 203 ML-KEM-1024 Ephemeral Session Handshake + Type 1 Telemetry',
    description:
      'Primary beyond-visual-range (BVR) intercept missile with two-way intra-flight datalink guidance, high off-boresight radar capability, and improved GPS-aided navigation for high-jamming environments.',
    defaultBay: 'Left Internal Bay',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'aim-9x',
    name: 'AIM-9X Block II/II+ Sidewinder',
    category: 'Air-to-Air',
    guidance: 'High Off-Boresight Imaging Infrared (IIR) + Lock-On After Launch (LOAL)',
    rangeKm: '35+ km (Mach 2.7)',
    warhead: 'Annular Blast-Fragmentation WDU-17/B (9.4 kg)',
    weightKg: 85,
    maxCarriedInternal: 0, // Carried on external stealth wingtip rails or modified bays
    maxCarriedExternal: 2,
    releaseEnvelope: 'Alt: 0 - 50,000 ft | High Off-Boresight 90° HMS cueing',
    busInterface: 'MIL-STD-1553B / 1760 with Helmet Mounted Display System (HMDS)',
    cryptoArmingProtocol: 'HMDS Gen III Reticle Cryo-Key Handshake with Zero-Lag IIR Target Lock',
    description:
      'Dogfight visual-range missile with thrust-vectoring control, 90° off-boresight capability cued directly by the F-35 pilot helmet (HMDS Gen III) and DAS 360° spherical sensors.',
    defaultBay: 'External Beast Pylon',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'aim-260',
    name: 'AIM-260 JATM (Joint Advanced Tactical Missile)',
    category: 'Air-to-Air',
    guidance: 'Multi-Mode Active AESA Seeker + Directional MADL Network Relaying',
    rangeKm: '260+ km (Mach 5.0 Hypersonic Glide)',
    warhead: 'Directed Lethality Focused Fragmentation',
    weightKg: 195,
    maxCarriedInternal: 4,
    maxCarriedExternal: 2,
    releaseEnvelope: 'Alt: 10,000 - 65,000 ft | High-Mach Supercruise Launch',
    busInterface: 'Fibre Channel FC-AV 2 Gbps / OMS Ethernet',
    cryptoArmingProtocol: 'FIPS 204 ML-DSA-87 Digital Signature Arming Token + Post-Quantum Key Ratchet',
    description:
      'Classified next-generation air dominance missile designed to counter peer 5th/6th gen stealth fighters and standoff high-value airborne assets (AWACS/Tankers) with extreme no-escape range.',
    defaultBay: 'Right Internal Bay',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'gbu-53b',
    name: 'GBU-53/B StormBreaker (Small Diameter Bomb II)',
    category: 'Air-to-Surface',
    guidance: 'Tri-Mode Seeker: Millimeter-Wave Radar + Uncooled IIR + Semi-Active Laser',
    rangeKm: '110+ km standoff (Moving targets)',
    warhead: 'Multi-Effects Warhead (Shape Charge + Blast Frag) (48 kg)',
    weightKg: 93,
    maxCarriedInternal: 8, // Up to 8 carried internally in twin bays
    maxCarriedExternal: 16,
    releaseEnvelope: 'Alt: 15,000 - 45,000 ft | Adverse weather / heavy smoke penetration',
    busInterface: 'Link-16 Weapon Datalink + MIL-STD-1760 Class II',
    cryptoArmingProtocol: 'MADL Swarm Target Assignment Protocol with PQC Lattice Message Auth',
    description:
      'Precision strike standoff weapon with tri-mode seeker designed to engage moving vehicles, naval vessels, and armored targets in heavy rain, dust, smoke, and electronic jamming.',
    defaultBay: 'Left Internal Bay',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'gbu-31-32',
    name: 'GBU-31 / GBU-32 JDAM (Joint Direct Attack Munition)',
    category: 'Air-to-Surface',
    guidance: 'Anti-Jam PQC GPS Guidance Kit + Inertial Navigation System (INS)',
    rangeKm: '28 km glide',
    warhead: 'BLU-109 Hardened Penetrator or MK-84 Blast (907 kg / 2000 lb)',
    weightKg: 925,
    maxCarriedInternal: 2,
    maxCarriedExternal: 4,
    releaseEnvelope: 'Alt: 2,000 - 45,000 ft | Level flight or high-G toss',
    busInterface: 'MIL-STD-1760 Class I Heavy Munition Interface',
    cryptoArmingProtocol: 'Selective Availability Anti-Spoofing Module (SAASM) + FIPS 203 PQC Re-key',
    description:
      'Heavy all-weather guided bomb for destroying hardened underground command bunkers, reinforced bridges, and concrete hardened aircraft shelters.',
    defaultBay: 'Right Internal Bay',
    readyCount: 1,
    status: 'READY',
  },
  {
    id: 'gbu-39',
    name: 'GBU-39/B Small Diameter Bomb I (SDB I)',
    category: 'Air-to-Surface',
    guidance: 'Differential GPS/INS + DiamondBack Deployable Wings',
    rangeKm: '110 km standoff',
    warhead: 'Deep Penetrating Steel Casing (93 kg)',
    weightKg: 129,
    maxCarriedInternal: 8,
    maxCarriedExternal: 16,
    releaseEnvelope: 'Alt: 20,000 - 45,000 ft | Supersonic release capable',
    busInterface: 'BRU-61/A Carriage Rack Bus / MIL-STD-1760',
    cryptoArmingProtocol: 'Cryptographic Precision Munition Fuze Arming (DO-178C Level A)',
    description:
      'Low-collateral standoff glide bomb allowing the F-35 to carry up to 8 precision munitions internally, quadrupling the sorties-per-target attack capability.',
    defaultBay: 'Left Internal Bay',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'agm-158-jassm',
    name: 'AGM-158B JASSM-ER (Joint Air-to-Surface Standoff Missile)',
    category: 'Air-to-Surface',
    guidance: 'Stealth Airframe + Anti-Jam GPS/INS + Imaging Infrared Terminal Correlator',
    rangeKm: '925+ km (Standoff Subsonic Cruise)',
    warhead: 'WDU-42/B Penetrating Blast-Fragmentation (450 kg / 1000 lb)',
    weightKg: 1020,
    maxCarriedInternal: 0, // Carried externally on wing hardpoints
    maxCarriedExternal: 2,
    releaseEnvelope: 'Alt: 5,000 - 35,000 ft | Stand-off outside enemy SAM range',
    busInterface: 'MIL-STD-1760 / Fibre Channel Weapon Interface',
    cryptoArmingProtocol: 'Dual-Officer Permissive Target Verification + PQC Pre-Mission Hash',
    description:
      'Long-range stealth cruise missile designed to destroy heavily defended anti-access/area-denial (A2/AD) targets without entering hostile integrated air defense envelopes.',
    defaultBay: 'External Beast Pylon',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'agm-88g-aargm-er',
    name: 'AGM-88G AARGM-ER (Advanced Anti-Radiation Guided Missile ER)',
    category: 'Anti-Radiation',
    guidance: 'Millimeter-Wave Radar + Multi-Spectrum Passive RF Counter-Shutdown Homing',
    rangeKm: '300+ km (Solid Rocket Motor Mach 3+)',
    warhead: 'Pre-fragmented Warhead with directional lethality',
    weightKg: 467,
    maxCarriedInternal: 2, // Modified internal bay fits on F-35A/C
    maxCarriedExternal: 2,
    releaseEnvelope: 'Alt: 10,000 - 50,000 ft | SEAD / DEAD High-Speed Ingress',
    busInterface: 'MIL-STD-1760 High-Speed Radar Bus',
    cryptoArmingProtocol: 'Electronic Order of Battle (EOB) Cryptographic Target Match Token',
    description:
      'Suppression and destruction of enemy air defenses (SEAD/DEAD) missile capable of locating and destroying advanced radar systems even if operators shut down RF emissions.',
    defaultBay: 'Right Internal Bay',
    readyCount: 1,
    status: 'READY',
  },
  {
    id: 'b61-12',
    name: 'B61-12 Life Extension Guided Nuclear Bomb',
    category: 'Nuclear',
    guidance: 'Boeing Guided Tail-Kit + Inertial Navigation System (INS)',
    rangeKm: 'Gravity / Guided Glide (Variable Standoff)',
    warhead: 'Dial-a-Yield Thermonuclear (0.3 kt, 1.5 kt, 10 kt, 50 kt)',
    weightKg: 375,
    maxCarriedInternal: 2,
    maxCarriedExternal: 0,
    releaseEnvelope: 'Alt: 500 - 50,000 ft | Subsonic/Supersonic VLO Nuclear Delivery',
    busInterface: 'MIL-STD-1760 Nuclear Weapons Bus Interface',
    cryptoArmingProtocol: 'USAF Permissive Action Link (PAL Category F) + Dual PQC Key Release',
    description:
      'Certified stealth tactical nuclear weapon with earth-penetrating capability and precision tail-kit assembly, allowing lower yield selection with higher target neutralization confidence.',
    defaultBay: 'Left Internal Bay',
    readyCount: 1,
    status: 'LOADED',
  },
  {
    id: 'gau-22a',
    name: 'GAU-22/A 25mm 4-barrel Equalizer Gatling Gun',
    category: 'Internal Gun',
    guidance: 'Pilot HMDS Reticle + Lead Computing Optical Gun Sight (LCOGS)',
    rangeKm: '3.7 km effective range (3,300 rounds/min)',
    warhead: 'HEI (High Explosive Incendiary) / APEX Armor-Piercing HE',
    weightKg: 189,
    maxCarriedInternal: 182, // Rounds of 25mm ammunition
    maxCarriedExternal: 220, // Gun pod for F-35B/C
    releaseEnvelope: 'Dogfight & Close Air Support (CAS) close-in envelope',
    busInterface: 'VMS Digital Fire Control Direct Relay',
    cryptoArmingProtocol: 'Master Arm Hardware Interlock + Safe Separation Logic',
    description:
      'High-velocity 25mm pneumatic Gatling cannon integrated internally on the F-35A port shoulder, delivering high kinetic knockdown punch against armored vehicles and dogfight targets.',
    defaultBay: 'Internal Gun',
    readyCount: 182,
    status: 'READY',
  },
  {
    id: 'spear-3',
    name: 'SPEAR 3 (Selected Precision Effects At Range)',
    category: 'Air-to-Surface',
    guidance: 'Miniature Turbojet + Multi-Sensor Seeker + Swarm Network Datalink',
    rangeKm: '140+ km standoff',
    warhead: 'Multi-Effects Insensitive Warhead',
    weightKg: 90,
    maxCarriedInternal: 8, // 4 per bay
    maxCarriedExternal: 8,
    releaseEnvelope: 'Alt: 10,000 - 40,000 ft | Autonomous Swarm Coordination',
    busInterface: 'MIL-STD-1760 / OMS Network Bus',
    cryptoArmingProtocol: 'Decentralized Multi-Agent Swarm PQC Handshake (Falcon-512)',
    description:
      'Miniature network-enabled cruise missile powered by a Pratt & Whitney TJ-150 turbojet, designed for autonomous collaborative swarm attacks against moving surface-to-air missiles.',
    defaultBay: 'Left Internal Bay',
    readyCount: 4,
    status: 'READY',
  },
  {
    id: 'meteor-bvr',
    name: 'Meteor Ramjet Beyond Visual Range Air-to-Air Missile',
    category: 'Air-to-Air',
    guidance: 'Solid Fuel Variable Flow Ducted Ramjet + Two-Way Datalink + Active AESA Seeker',
    rangeKm: '200+ km (Mach 4.5+ sustained till endgame)',
    warhead: 'Blast-Fragmentation with Proximity & Impact Laser Fuze',
    weightKg: 190,
    maxCarriedInternal: 4,
    maxCarriedExternal: 2,
    releaseEnvelope: 'Alt: 1,000 - 65,000 ft | Largest No-Escape Zone of any AAM',
    busInterface: 'MIL-STD-1760 / STANAG 4626',
    cryptoArmingProtocol: 'NATO STANAG 5066 + NIST FIPS 203 Lattice Encapsulation',
    description:
      'Throttleable ramjet-powered BVRAAM maintaining Mach 4+ sustained thrust until terminal impact, providing a No-Escape Zone over 3 times larger than conventional solid rocket motors.',
    defaultBay: 'Right Internal Bay',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'siaw-strike',
    name: 'SiAW (Stand-in Attack Weapon)',
    category: 'Air-to-Surface',
    guidance: 'High-Speed Multi-Domain Sensor + GPS-Denied Optical Terminal Target Correlator',
    rangeKm: '200+ km High-Speed Dash',
    warhead: 'Advanced Penetration Blast Multi-Option Fuze',
    weightKg: 420,
    maxCarriedInternal: 2,
    maxCarriedExternal: 2,
    releaseEnvelope: 'Rapid engagement of mobile ballistic missile launchers and anti-ship systems',
    busInterface: 'OMS Universal Armament Interface (UAI)',
    cryptoArmingProtocol: 'CNSA 2.0 Level 5 Zero-Knowledge Arming Auth',
    description:
      'Air Force strike weapon built to engage rapid-relocatable targets including theater ballistic missile launchers, land-attack cruise missile launchers, and GPS-jamming emitters inside A2/AD bubbles.',
    defaultBay: 'Right Internal Bay',
    readyCount: 2,
    status: 'READY',
  },
  {
    id: 'hawc-hypersonic',
    name: 'HAWC (Hypersonic Air-breathing Weapon Concept)',
    category: 'Hypersonic',
    guidance: 'Scramjet Hydrocarbon Sustained Flight + Advanced Optical Ingress (Mach 5+)',
    rangeKm: '550+ km',
    warhead: 'High-Kinetic Energy Pure Penetration / Tactical Warhead',
    weightKg: 950,
    maxCarriedInternal: 0,
    maxCarriedExternal: 1,
    releaseEnvelope: 'Alt: 40,000 - 65,000 ft | Standoff hypersonic launch',
    busInterface: 'Fibre Channel OMS High-Speed Interface',
    cryptoArmingProtocol: 'Quantum-Resistant Telemetry Stream with Lattice Key Exchange',
    description:
      'Air-launched scramjet missile concept flying sustained Mach 5+ through atmospheric skimming, leaving defending radar networks under 90 seconds of reaction time before target impact.',
    defaultBay: 'External Beast Pylon',
    readyCount: 1,
    status: 'LOADED',
  },
];

export const F35_PQC_MODE_PRESETS: Record<F35FlightMode, F35PqcSecurityParams> = {
  Stealth: {
    profileName: 'CNSA 2.0 Ultra-High Assurance VLO Ingress',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 + Kyber-1024 (Category 5)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-87 (CNSA 2.0 Category 5)',
    securityLevel: 'Category 5 (Top Secret)',
    rekeyIntervalSeconds: 45,
    emconLevel: 'EMCON 1 (VLO Stealth Silence)',
    madlEncryptionMode: 'Directional Low-Probability-of-Detection Narrow-Beam Lattice Ratchet',
    quantumResistanceScore: 100,
    hsmCryptoCore: 'ICP-Core 1 Cryogenic Tamper-Proof Cryptoprocessor (FIPS 140-3 Level 4)',
    burstLatencyMs: 0.14,
    antiJamStatus: 'Directional MADL Phase Shifters + Multi-Aperture Null-Steering',
    ephemeralEntropySource: 'Hardware Quantum TRNG & Ring Oscillator Entropy Core',
    flightFormationSync: 'MADL Narrow-Beam 4-Ship PQC Coordinate Schedule',
    activeCiphersuite: 'ML-KEM-1024 / AES-256-GCM / ML-DSA-87 / SHA-3-512',
    rcsModifierExplanation:
      'Pure Very Low Observable 0.00015 m² (Internal bays sealed, external pylons jettisoned, RF emission silence)',
  },
  Combat: {
    profileName: 'Tactical Multi-Role Strike & Collaborative Mesh',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 + X25519 (Fast Cycle Category 3)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-65 (Rapid Target Broadcast)',
    securityLevel: 'Category 3 (Secret)',
    rekeyIntervalSeconds: 150,
    emconLevel: 'EMCON 3 (MADL High-Speed Mesh)',
    madlEncryptionMode: 'High-Bandwidth 100 Hz Cyclic MADL & Link-16 Gateway Mesh',
    quantumResistanceScore: 99.2,
    hsmCryptoCore: 'Dual ICP-Core 1 & ICP-Core 2 Vectorized Post-Quantum Co-Processor',
    burstLatencyMs: 0.09,
    antiJamStatus: 'Broadband Frequency Agility + Barracuda Electronic Attack Assist',
    ephemeralEntropySource: 'ICP High-Entropy Vector Random Generator Pool',
    flightFormationSync: 'Multi-Ship Lightning Flight + CCA Loyal Wingman Autonomous Mesh',
    activeCiphersuite: 'ML-KEM-768 / ChaCha20-Poly1305 / ML-DSA-65 / SHA-384',
    rcsModifierExplanation:
      'Combat Stealth 0.00015 m² (Spikes to 0.032 m² during weapon bay cycle or when external beast pylons mounted)',
  },
  Training: {
    profileName: 'Nellis Red Flag & ACMI Range Telemetry Sortie',
    kemAlgorithm: 'NIST FIPS 203 ML-KEM-512 + Classical Fallback (ACMI Pod)',
    signatureAlgorithm: 'NIST FIPS 204 ML-DSA-44 + Dual ECDSA P-256',
    securityLevel: 'Category 1 / Range Test',
    rekeyIntervalSeconds: 600,
    emconLevel: 'EMCON 5 (Open Test / ACMI)',
    madlEncryptionMode: 'Synthetic Range Test Telemetry Link with Range Safety Interlock',
    quantumResistanceScore: 87.5,
    hsmCryptoCore: 'ICP Debriefing Instrumentation Module (Unclassified Range Partition)',
    burstLatencyMs: 0.38,
    antiJamStatus: 'Standard Range-Safety Test Protocol (FAA Mode 5 Active)',
    ephemeralEntropySource: 'Cryptographic Deterministic Range Random Seed Generator',
    flightFormationSync: 'ACMI Pod Tactical Ground Station Relay',
    activeCiphersuite: 'ML-KEM-512 / AES-128-GCM / ECDSA P-256 (Range Telemetry)',
    rcsModifierExplanation:
      'Simulated 0.2200 m² (Luneburg Lens Radar Reflectors physically mounted for civilian ATC & safety tracking)',
  },
};

export const INITIAL_F35_FLIGHT_STATE: F35FlightState = {
  flightMode: 'Stealth',
  pqcSecurity: F35_PQC_MODE_PRESETS['Stealth'],
  airspeedKnots: 780,
  mach: 1.25,
  altitudeFeet: 36000,
  throttlePercent: 78,
  afterburner: false,
  supercruise: false,
  gForce: 1.0,
  aoaDegrees: 4.1,
  heading: 195,
  pitch: 2.1,
  roll: 0.0,
  verticalSpeedFpm: 0,
  stealthRcsSqm: 0.00015,
  radarMode: 'AESA Multi-Mode Search',
  eotsMode: 'FLIR Target Track',
  dasActive: true,
  weaponBayDoors: 'CLOSED',
  beastModeExternalPylons: false,
  selectedWeaponId: 'aim-120d',
  weaponsInventory: [
    {
      slot: 'BAY-LEFT-1',
      weaponId: 'aim-120d',
      name: 'AIM-120D AMRAAM',
      count: 2,
      guidance: 'Two-Way Encrypted Datalink + Active Radar Terminal Seeker',
      status: 'READY',
    },
    {
      slot: 'BAY-RIGHT-1',
      weaponId: 'aim-260',
      name: 'AIM-260 JATM',
      count: 2,
      guidance: 'Multi-Mode Active AESA Seeker + Directional MADL Relaying',
      status: 'READY',
    },
    {
      slot: 'BAY-LEFT-2',
      weaponId: 'gbu-53b',
      name: 'GBU-53/B StormBreaker (SDB II)',
      count: 4,
      guidance: 'Tri-Mode Millimeter-Wave / IIR / Semi-Active Laser',
      status: 'READY',
    },
    {
      slot: 'BAY-RIGHT-2',
      weaponId: 'gbu-31-32',
      name: 'GBU-31 JDAM (2000 lb)',
      count: 1,
      guidance: 'Anti-Jam PQC GPS Guidance + INS',
      status: 'READY',
    },
    {
      slot: 'GUN-PORT',
      weaponId: 'gau-22a',
      name: 'GAU-22/A 25mm Gatling Gun',
      count: 182,
      guidance: 'HMDS Helmet Reticle + LCOGS',
      status: 'READY',
    },
  ],
  masterArm: true,
  autopilotMode: 'NAV_STEER',
  cnsaCryptoStatus: 'PQC_HYBRID_ACTIVE',
};

export const F35_AVIONICS_SUBSYSTEMS: F35AvionicsSubsystem[] = [
  {
    id: 'f35-icp',
    name: 'Integrated Core Processor (ICP) Mission System',
    acronym: 'ICP Core',
    category: 'Integrated Core Processor (ICP)',
    icpDomain: 'ICP-Core 1',
    softwareLanguage: 'C++',
    linesOfCode: 8400000,
    busInterface: 'Fibre Channel (FC-AV 2 Gbps)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 203 ML-KEM-1024 + FIPS 204 ML-DSA-87 Hardware Integrated',
    description:
      'Central nerve system composed of commercial off-the-shelf high-performance processing modules running Green Hills INTEGRITY-178B RTOS, responsible for executing sensor fusion algorithms, tactical situation displays, and cryptographic enclave isolation.',
    sourceFile: 'avionics/f35/core/icp_sensor_fusion.cpp',
    codeSnippet: `// Lockheed Martin F-35 Lightning II - ICP Core Sensor Fusion Engine
// DO-178C Level A Safety Critical / Green Hills INTEGRITY-178B RTOS
#include <f35/icp/sensor_fusion.hpp>
#include <f35/crypto/pqc_lattice_engine.hpp>
#include <f35/madl/directional_mesh.hpp>

namespace f35::avionics::fusion {

class SensorFusionCore {
public:
    explicit SensorFusionCore(const CryptoEnclaveConfig& config)
        : m_pqcEngine(config.latticeParams),
          m_madlMesh(config.nodeIdentity) {}

    FusionTrackRecord correlateSensorStreams(
        const AesaRadarTrackStream& aesaStream,
        const DasSphericalIrStream& dasStream,
        const EotsOpticalStream& eotsStream,
        const BarracudaEsmStream& esmStream) 
    {
        // Correlate multi-spectral tracks into a single unified kinematic track
        FusionTrackRecord fusedRecord;
        fusedRecord.trackId = generateUniqueTrackId();
        fusedRecord.kinematics = computeKalmanKinematics(aesaStream, dasStream);
        fusedRecord.rfSignature = esmStream.classifyEmitterType();
        fusedRecord.irAspect = dasStream.extractThermalBloom();
        
        // Cryptographically sign track telemetry for MADL 4-ship dissemination
        const auto signature = m_pqcEngine.signTrackWithMlDsa87(fusedRecord.serialize());
        fusedRecord.pqcSignatureToken = signature;
        
        m_madlMesh.broadcastDirectionalLpi(fusedRecord);
        return fusedRecord;
    }

private:
    pqc::LatticeCryptoEngine m_pqcEngine;
    madl::DirectionalMeshRouter m_madlMesh;
};

} // namespace f35::avionics::fusion`,
  },
  {
    id: 'f35-apg81',
    name: 'AN/APG-81 / APG-85 Active Electronically Scanned Array',
    acronym: 'APG-81 AESA',
    category: 'Radar & Electronic Warfare',
    icpDomain: 'AESA Dedicated Beamformer',
    softwareLanguage: 'C / C++ Real-Time',
    linesOfCode: 3200000,
    busInterface: 'Fibre Channel (FC-AV 2 Gbps)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 203 Kyber-1024 LPI Waveform Encryption',
    description:
      'Northrop Grumman solid-state active electronically scanned array with over 1,600 transmit/receive gallium nitride modules, providing simultaneous air-to-air search, high-resolution Synthetic Aperture Radar (SAR) ground mapping, and electronic attack.',
    sourceFile: 'avionics/f35/radar/apg81_beamformer.cpp',
    codeSnippet: `// AN/APG-81 / APG-85 AESA Beamformer & LPI Waveform Agility
#include <f35/radar/aesa_array.hpp>
#include <f35/crypto/quantum_rng.hpp>

void Apg81RadarController::synthesizeLpiWaveform(LpiScanParams& scanParams) {
    // Generate pseudo-random phase agility driven by quantum hardware entropy
    const auto entropyChunk = m_quantumTrng.fetchEntropyWord();
    scanParams.frequencyHopSeed = entropyChunk.seed;
    scanParams.prfJitterMicrosec = entropyChunk.jitter;
    
    // Low Probability of Intercept: spread transmission energy below ambient noise floor
    m_beamformerArray.steerMainBeam(scanParams.azimuthDeg, scanParams.elevationDeg);
    m_beamformerArray.injectPqcSpreadSpectrumCodes(scanParams.frequencyHopSeed);
}`,
  },
  {
    id: 'f35-das',
    name: 'AN/AAQ-37 Distributed Aperture System (DAS)',
    acronym: 'DAS 360° IR',
    category: 'Electro-Optical / Infrared',
    icpDomain: 'ICP-Core 2',
    softwareLanguage: 'C++',
    linesOfCode: 2100000,
    busInterface: 'Fibre Channel (FC-AV 2 Gbps)',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'DO-178C Level A Image Stream PQC Authenticated Hash',
    description:
      'Six electro-optical infrared sensors distributed around the airframe providing an uninterrupted 360-degree spherical situational awareness bubble, missile launch warning, and day/night imagery projected directly onto pilot visor.',
    sourceFile: 'avionics/f35/sensors/das_spherical_tracker.cpp',
    codeSnippet: `// AN/AAQ-37 DAS 360-Degree Spherical Threat Correlator
#include <f35/sensors/das_sensors.hpp>

MissileWarningEvent DasTracker::evaluateSphericalThreats() {
    for (const auto& sensorHead : m_sixSensorHeads) {
        auto thermalBlooms = sensorHead.captureThermalContours();
        for (const auto& bloom : thermalBlooms) {
            if (bloom.isAscendingBurnerPlume()) {
                return MissileWarningEvent{
                    .azimuth = bloom.azimuth,
                    .elevation = bloom.elevation,
                    .timeToImpactSec = calculateClosureRate(bloom),
                    .flareRecommendation = true
                };
            }
        }
    }
    return MissileWarningEvent::noThreat();
}`,
  },
  {
    id: 'f35-madl',
    name: 'Multifunction Advanced Data Link (MADL)',
    acronym: 'MADL Datalink',
    category: 'Communications, Navigation & IFF (CNI)',
    icpDomain: 'ICP-Core 1',
    softwareLanguage: 'Ada 95 / 2012',
    linesOfCode: 1850000,
    busInterface: 'IEEE-1394B FireWire',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'NIST FIPS 203 ML-KEM-1024 Session Key Ratchet',
    description:
      'Directional narrow-beam Ku-band data link utilizing phased array antennas distributed on the aircraft skin, providing high-bandwidth stealth inter-flight communications without compromising the low-observable profile.',
    sourceFile: 'avionics/f35/cni/madl_directional_mesh.adb',
    codeSnippet: `-- Multifunction Advanced Data Link (MADL) PQC Directional Router
package body MADL_Directional_Mesh is

   procedure Ratchet_Session_Key (
      Flight_Node : in     Node_Identifier;
      New_Key     : out    Lattice_Key_Block
   ) is
      Entropy_Seed : constant Hardware_Entropy := Hardware_TRNG.Read_Entropy;
   begin
      -- FIPS 203 ML-KEM-1024 Directional Key Encapsulation
      PQC_Lattice_KEM.Encapsulate_1024 (
         Public_Key => Flight_Node.Public_Key,
         Seed       => Entropy_Seed,
         Ciphertext => Outgoing_Frame.Ciphertext,
         Shared_Key => New_Key
      );
      
      -- Update Phased Array Beam Steer Angles
      Phased_Array_Controller.Steer_Beam_To_Node(Flight_Node.Coordinates);
   end Ratchet_Session_Key;

end MADL_Directional_Mesh;`,
  },
  {
    id: 'f35-vms',
    name: 'Vehicle Management System & Flight Control Computers',
    acronym: 'VMS Flight Laws',
    category: 'Vehicle Systems & Flight Control',
    icpDomain: 'VMS Quad Computer',
    softwareLanguage: 'Ada 95 / 2012',
    linesOfCode: 2750000,
    busInterface: 'IEEE-1394B FireWire',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'Cryptographically Verified Quad-Redundant Actuator Bus',
    description:
      'Quadruplex-redundant digital fly-by-wire flight control system managing relaxed static stability, electro-hydrostatic actuators (EHAs), leading/trailing edge flaps, twin rudders, and weapons bay door clearance interlocks.',
    sourceFile: 'avionics/f35/vms/flight_control_laws.adb',
    codeSnippet: `-- F-35 Quadruplex Fly-By-Wire Actuation Control Laws
package body F35_Flight_Control_Laws is

   procedure Execute_Cycle (
      Pilot_Inputs : in  Stick_And_Rudder_Commands;
      Air_Data     : in  Air_Data_Sensors;
      Actuators    : out Actuator_Command_Array
   ) is
   begin
      -- Calculate G-command and Pitch Rate schedules
      Actuators.Horizontal_Tails := Compute_Tail_Deflection(
         Command_G => Pilot_Inputs.Pitch_Stick_G,
         Current_Mach => Air_Data.Mach,
         Current_Alpha => Air_Data.Angle_Of_Attack
      );
      
      -- Ensure Weapon Bay Door Opening Separation Clearance
      if Bay_Door_Status = OPENING then
         Actuators.Rudder_Deflection := Apply_Yaw_Stability_Compensation(Air_Data.Dynamic_Pressure);
      end if;
   end Execute_Cycle;

end F35_Flight_Control_Laws;`,
  },
  {
    id: 'f35-weapons',
    name: 'Universal Armament Interface & Weapons Bay Manager',
    acronym: 'UAI Weapons Core',
    category: 'Weapons Bay & Mission Management',
    icpDomain: 'ICP-Core 2',
    softwareLanguage: 'C++',
    linesOfCode: 1650000,
    busInterface: 'MIL-STD-1553B',
    criticalityLevel: 'DO-178C Level A (Safety-Critical)',
    pqcCompliance: 'FIPS 204 ML-DSA-87 Digital Signature Weapon Release Authorization',
    description:
      'Open Mission Systems Universal Armament Interface (UAI) managing pneumatic ejector racks, internal weapons bay thermal conditioning, safe separation telemetry, and post-quantum cryptographic arming handshakes.',
    sourceFile: 'avionics/f35/weapons/uai_bay_manager.cpp',
    codeSnippet: `// Universal Armament Interface (UAI) Ordnance Release Engine
#include <f35/weapons/uai_manager.hpp>
#include <f35/crypto/pqc_signatures.hpp>

ReleaseStatus UaiManager::authorizeWeaponRelease(const MunitionSlot& slot) {
    if (!m_masterArmSwitch.isEngaged()) {
        return ReleaseStatus::ABORTED_MASTER_ARM_SAFE;
    }
    
    if (slot.bayDoorStatus() != BayDoorState::FULL_OPEN) {
        return ReleaseStatus::ABORTED_DOORS_NOT_SEALED_OPEN;
    }
    
    // Authenticate weapon release token with NIST FIPS 204 ML-DSA-87 signature
    const auto releaseToken = m_cryptoEnclave.generateArmingToken(slot.targetCoordinates());
    if (!slot.verifyTokenWithPqc(releaseToken)) {
        return ReleaseStatus::ABORTED_CRYPTO_TOKEN_INVALID;
    }
    
    slot.firePneumaticEjectorPistons();
    return ReleaseStatus::RELEASE_SUCCESSFUL;
}`,
  },
];

export const SAMPLE_F35_BUS_FRAMES: F35BusFrame[] = [
  {
    id: 'f35-bus-1',
    timestamp: '14:24:08.102',
    busChannel: 'FC-AV (Fibre Channel)',
    remoteTerminal: 'ICP-Core 1 (Fusion)',
    subAddress: 'SA-05 (Sensor Correlator)',
    wordCount: 128,
    hexPayload: '04A1 88F2 003B 99A4 FIPS203_KEM_VALID',
    decodedMeaning: 'Fused Track TRK-01 (Su-57) from APG-81 & DAS broadcast over high-speed Fibre Channel',
    status: 'PQC_ENCRYPTED',
  },
  {
    id: 'f35-bus-2',
    timestamp: '14:24:08.118',
    busChannel: 'IEEE-1394B (FireWire)',
    remoteTerminal: 'MADL Ku-Band Transceiver',
    subAddress: 'SA-14 (Intra-Flight Ratchet)',
    wordCount: 64,
    hexPayload: '0100 0005 03E8 0001 ML-KEM-1024_ACTIVE',
    decodedMeaning: 'MADL Directional 4-Ship Flight Ratchet verified; Next Rekey in 45s (EMCON 1 Active)',
    status: 'PQC_ENCRYPTED',
  },
  {
    id: 'f35-bus-3',
    timestamp: '14:24:08.134',
    busChannel: 'MIL-1553B (Weapons Bus)',
    remoteTerminal: 'RT-12 (Left Bay AIM-120D)',
    subAddress: 'SA-08 (In-Flight Target Update)',
    wordCount: 32,
    hexPayload: '0200 00A4 001F 00C8 AIM120D_GUIDANCE_OK',
    decodedMeaning: 'AIM-120D Slot 1 In-Flight Target Handshake confirmed: Target Heading 285° Mach 1.4',
    status: 'VALID',
  },
  {
    id: 'f35-bus-4',
    timestamp: '14:24:08.150',
    busChannel: 'OMS-ETH-1',
    remoteTerminal: 'Barracuda EW (AN/ASQ-239)',
    subAddress: 'SA-21 (Emitter Classification)',
    wordCount: 64,
    hexPayload: '00FF 0432 0010 0002 SAM_S400_RADAR_NOTCHED',
    decodedMeaning: 'S-400 92N6E Grave Stone radar track passive angle identified; Jamming Null applied',
    status: 'ACK',
  },
  {
    id: 'f35-bus-5',
    timestamp: '14:24:08.166',
    busChannel: 'FC-AV (Fibre Channel)',
    remoteTerminal: 'AN/AAQ-40 EOTS Sensor',
    subAddress: 'SA-02 (Optical FLIR Telemetry)',
    wordCount: 96,
    hexPayload: '0032 01A0 0045 0003 EOTS_LASER_DESIGNATION',
    decodedMeaning: 'EOTS Electro-Optical sensor locked on hostile lead aircraft engine exhaust nozzle',
    status: 'VALID',
  },
];

export const SAMPLE_F35_RADAR_TRACKS: F35RadarTrack[] = [
  {
    id: 'TRK-F35-01',
    callsign: 'BANDIT-01 (Su-57 Felon)',
    type: '5th Gen Stealth Fighter',
    bearing: 25,
    rangeNm: 42.5,
    altitudeFeet: 41000,
    mach: 1.45,
    iffStatus: 'HOSTILE',
    aspect: 'Hot (Nose-On Closure)',
    sensorSource: 'APG-81 AESA',
    lockStatus: 'LPI_LOCKED',
  },
  {
    id: 'TRK-F35-02',
    callsign: 'THREAT-02 (S-400 Grave Stone)',
    type: 'SAM Battery (S-400)',
    bearing: 75,
    rangeNm: 68.0,
    altitudeFeet: 450,
    mach: 0.0,
    iffStatus: 'HOSTILE',
    aspect: 'Surface Radar Emitter',
    sensorSource: 'Barracuda ESM',
    lockStatus: 'TRACKING',
  },
  {
    id: 'TRK-F35-03',
    callsign: 'BANDIT-03 (J-20 Mighty Dragon)',
    type: '5th Gen Stealth Fighter',
    bearing: 340,
    rangeNm: 58.2,
    altitudeFeet: 46000,
    mach: 1.6,
    iffStatus: 'HOSTILE',
    aspect: 'Flanking Right',
    sensorSource: 'DAS 360° IR',
    lockStatus: 'TRACKING',
  },
  {
    id: 'TRK-F35-04',
    callsign: 'VIPER-02 (Friendly F-35 Wingman)',
    type: 'Friendly Flight',
    bearing: 210,
    rangeNm: 8.5,
    altitudeFeet: 36000,
    mach: 1.25,
    iffStatus: 'FRIEND',
    aspect: 'Line-Abreast Formation',
    sensorSource: 'APG-81 AESA',
    lockStatus: 'SEARCH',
  },
];

export const INITIAL_F35_ICP_METRICS: F35IcpPerformanceMetrics = {
  icp1CpuUtilization: 44.8,
  icp2CpuUtilization: 39.2,
  fibreChannelThroughputGbps: 1.84,
  firewire1394BThroughputMbps: 760,
  cryptoCoreTempC: 48.2,
  trngEntropyRateGbps: 3.4,
  opticalBusJitterNs: 1.15,
  memoryUsedMb: 14200,
  memoryTotalMb: 32768,
  cyclicExecutionRateHz: 100,
};

export const INITIAL_F35_LATENCY_HISTORY: F35KeyNegotiationLatencySample[] = [
  {
    timestamp: '14:24:00',
    cycle: 1,
    kemEncapMs: 0.042,
    kemDecapMs: 0.048,
    madlRttMs: 0.065,
    totalNegotiationMs: 0.155,
    classicalEcdhMs: 0.285,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 4.2,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:24:02',
    cycle: 2,
    kemEncapMs: 0.041,
    kemDecapMs: 0.046,
    madlRttMs: 0.062,
    totalNegotiationMs: 0.149,
    classicalEcdhMs: 0.29,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 3.9,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:24:04',
    cycle: 3,
    kemEncapMs: 0.044,
    kemDecapMs: 0.047,
    madlRttMs: 0.068,
    totalNegotiationMs: 0.159,
    classicalEcdhMs: 0.282,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 5.1,
    handshakeStatus: 'SUCCESS',
  },
  {
    timestamp: '14:24:06',
    cycle: 4,
    kemEncapMs: 0.04,
    kemDecapMs: 0.045,
    madlRttMs: 0.061,
    totalNegotiationMs: 0.146,
    classicalEcdhMs: 0.288,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 3.6,
    handshakeStatus: 'RATCHETED',
  },
  {
    timestamp: '14:24:08',
    cycle: 5,
    kemEncapMs: 0.042,
    kemDecapMs: 0.046,
    madlRttMs: 0.064,
    totalNegotiationMs: 0.152,
    classicalEcdhMs: 0.284,
    algorithm: 'ML-KEM-1024',
    flightMode: 'Stealth',
    jitterMicrosec: 4.0,
    handshakeStatus: 'SUCCESS',
  },
];

export const INITIAL_F35_FORMATION_NODES: F35FormationNode[] = [
  {
    callsign: 'VIPER-01 (This Ship)',
    tailNumber: 'AF-19-5402',
    role: 'Flight Lead',
    distanceNm: 0.0,
    linkStatus: 'CONNECTED',
    latencyMs: 0.02,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -32,
    packetLossPercent: 0.0,
    lastRatchet: 'Just now',
  },
  {
    callsign: 'VIPER-02',
    tailNumber: 'AF-19-5403',
    role: 'Wingman 1',
    distanceNm: 8.5,
    linkStatus: 'MADL_DIRECTIONAL',
    latencyMs: 0.14,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -48,
    packetLossPercent: 0.01,
    lastRatchet: '2.4s ago',
  },
  {
    callsign: 'VIPER-03',
    tailNumber: 'AF-20-5418',
    role: 'Sensor Scout',
    distanceNm: 18.2,
    linkStatus: 'MADL_DIRECTIONAL',
    latencyMs: 0.21,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -54,
    packetLossPercent: 0.02,
    lastRatchet: '3.1s ago',
  },
  {
    callsign: 'VANGUARD-01 (CCA Drone)',
    tailNumber: 'YQ-58A-09',
    role: 'CCA Loyal Wingman (YQ-58A)',
    distanceNm: 12.0,
    linkStatus: 'MADL_DIRECTIONAL',
    latencyMs: 0.18,
    kemAlgorithm: 'ML-KEM-1024',
    rssiDb: -51,
    packetLossPercent: 0.03,
    lastRatchet: '1.8s ago',
  },
];
