import { ThreatIntelCve } from '../types/threatIntel';

export const INITIAL_CVE_THREAT_INTEL: ThreatIntelCve[] = [
  // 1. Radar & RF A2/AD Environment (TGT-A2AD-RADAR-01)
  {
    id: 'CVE-2026-44821',
    title: 'Nebo-M Multi-Band Radar DSP Firmware Remote Memory Corruption',
    targetEnvironmentIds: ['TGT-A2AD-RADAR-01'],
    targetCategory: 'Radar & RF A2/AD',
    cvssScore: 9.8,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.965,
    cisaKev: true,
    zeroDay: true,
    publishedDate: '2026-10-12T04:15:00Z',
    affectedComponents: [
      'Altera Stratix V FPGA Radar DSP Microcode',
      'Analog Devices AD9361 RF Agile Transceiver',
      'Nebo-M VHF/UHF Beamforming Unit v4.2',
    ],
    attackVector: 'ADJACENT_RF',
    attackComplexity: 'LOW',
    mitreTechnique: 'T0815 - Denial of View & RF Blind Strobe',
    mitreTactic: 'Inhibit Response Function',
    description:
      'A boundary condition flaw in the digital signal processing pipeline allows an adversary broadcasting modulated RF pulses on the radar carrier frequency (3.1-3.4 GHz) to overwrite the target tracking buffer, creating ghost tracks and dropping true hypersonic tracks.',
    impact:
      'Complete blindness of early warning radar sector for up to 18 minutes without requiring kinetic munitions.',
    tacticalRelevance:
      'Directly compromises Cape Tarhankut S-400 battery detection umbrella, creating an unmonitored ingress corridor for Mach 20 ARRW hypersonic strike.',
    pqcRelevance: {
      vulnerableCrypto: 'Unsigned 802.11-derivative RF command frame telemetry',
      pqcFix: 'FIPS 204 ML-DSA-87 digital pulse-frame attestation',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-rf-aesa-injector',
    exploitStatus: 'UNPATCHED_ZERO_DAY',
    feedSource: 'DOD-CYBERCOM',
  },
  {
    id: 'CVE-2025-39104',
    title: 'Krasukha-4 Electronic Warfare Command Bus Deserialization RCE',
    targetEnvironmentIds: ['TGT-A2AD-RADAR-01'],
    targetCategory: 'Radar & RF A2/AD',
    cvssScore: 9.1,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.884,
    cisaKev: true,
    zeroDay: false,
    publishedDate: '2025-11-28T14:30:00Z',
    affectedComponents: [
      'Krasukha-4 EW Jammer Tactical Bus Controller',
      'Mil-Ruggedized Linux 4.19-rt Embedded Controller',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    mitreTactic: 'Initial Access',
    description:
      'Insecure object deserialization in the remote jammer coordination socket allows remote code execution with root privileges when processing malformed tactical telemetry messages.',
    impact:
      'Allows attacking forces to disable hostile high-power GPS/SAR jamming antennas remotely, restoring full precision GPS to inbound munitions.',
    tacticalRelevance:
      'Neutralizes the electronic shield protecting the coastal radar complex, guaranteeing 0.8m CEP kinetic accuracy.',
    pqcRelevance: {
      vulnerableCrypto: 'TLS 1.2 with RSA-2048 and SHA-256',
      pqcFix: 'FIPS 203 ML-KEM-768 hybrid TLS 1.3 encapsulation',
      harvestNowRisk: true,
    },
    suggestedCyberPayloadId: 'cyber-rf-aesa-injector',
    exploitStatus: 'WEAPONIZED',
    feedSource: 'CISA-KEV',
  },
  {
    id: 'CVE-2026-21899',
    title: 'Pantsir-S1 Electro-Optical Fire Control Optical Seeker Glitch',
    targetEnvironmentIds: ['TGT-A2AD-RADAR-01'],
    targetCategory: 'Radar & RF A2/AD',
    cvssScore: 7.9,
    cvssSeverity: 'HIGH',
    epssScore: 0.732,
    cisaKev: false,
    zeroDay: true,
    publishedDate: '2026-10-09T08:12:00Z',
    affectedComponents: [
      '1RS2-1E Phased Array Fire Control Radar Unit',
      'Thermal Imaging Target Tracker Seeker Firmware v3.1',
    ],
    attackVector: 'ADJACENT_RF',
    attackComplexity: 'MEDIUM',
    mitreTechnique: 'T1498 - Network Denial of Service',
    mitreTactic: 'Impact',
    description:
      'Optical seeker sensor overload triggered by dual-spectrum pulsed infrared laser signals leads to kernel panic in the close-in weapon system targeting computer.',
    impact:
      'Renders point-defense guns unable to track incoming munitions during terminal dive phase.',
    tacticalRelevance:
      'Precludes automated 30mm rotary gun interception of the ARRW kinetic fragmenting penetrator.',
    suggestedCyberPayloadId: 'cyber-rf-aesa-injector',
    exploitStatus: 'ACTIVE_EXPLOIT',
    feedSource: 'PALANTIR-INTEL',
  },

  // 2. Subterranean Hardened C4I Bunker (TGT-C4I-BUNKER-02)
  {
    id: 'CVE-2026-51208',
    title: 'KG-175 Type 1 Crypto Gateway Red/Black Isolation Bypass Zero-Day',
    targetEnvironmentIds: ['TGT-C4I-BUNKER-02'],
    targetCategory: 'Subterranean C4I',
    cvssScore: 10.0,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.982,
    cisaKev: true,
    zeroDay: true,
    publishedDate: '2026-10-11T22:04:00Z',
    affectedComponents: [
      'TSEC/KG-175D Ethernet Encryptor Microcode',
      'High-Assurance IP Encryptor (HAIPE) IS v4.3.1',
      'Red/Black Cryptographic Separation ASIC',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    mitreTechnique: 'T1557 - Adversary-in-the-Middle & Cryptographic Downgrade',
    mitreTactic: 'Credential Access',
    description:
      'A microcode memory leakage vulnerability in the HAIPE encryption engine allows unencrypted RED data buffers to bleed into BLACK egress packets when handling fragmented IPv6 extension headers.',
    impact:
      'Total breach of subterranean command center strategic battle management traffic, exposing targeting orders and high-value personnel positions.',
    tacticalRelevance:
      'Pinpoints exact subterranean bunker depth and structural weak points for the B-21 Raider GBU-57 Massive Ordnance Penetrator (MOP).',
    pqcRelevance: {
      vulnerableCrypto: 'Suite B Classical ECDH P-384 / AES-256-GCM',
      pqcFix: 'CNSA 2.0 Level 5 (ML-KEM-1024 + ML-DSA-87)',
      harvestNowRisk: true,
    },
    suggestedCyberPayloadId: 'cyber-satellite-spoof',
    exploitStatus: 'UNPATCHED_ZERO_DAY',
    feedSource: 'NSA-GHIDRA',
  },
  {
    id: 'CVE-2025-48190',
    title: 'TACAMO Low-Frequency Strategic Sub-Bunker Antenna Relay RCE',
    targetEnvironmentIds: ['TGT-C4I-BUNKER-02'],
    targetCategory: 'Subterranean C4I',
    cvssScore: 8.8,
    cvssSeverity: 'HIGH',
    epssScore: 0.812,
    cisaKev: false,
    zeroDay: false,
    publishedDate: '2025-08-14T11:20:00Z',
    affectedComponents: [
      'Very Low Frequency (VLF) Receiver Terminal Processor',
      'Strategic Command Datalink Parser Daemon',
    ],
    attackVector: 'ADJACENT_RF',
    attackComplexity: 'HIGH',
    mitreTechnique: 'T1565.002 - Transmitted Data Manipulation',
    mitreTactic: 'Impact',
    description:
      'Buffer underflow when parsing corrupted VLF atmospheric skip signals allows execution of arbitrary payloads on the subterranean antenna multiplexer.',
    impact:
      'Disconnects mountain bunker leadership from forward-deployed nuclear and conventional forces.',
    tacticalRelevance:
      'Blinds the command center, preventing defensive scramble or counter-battery fire before B-21 stealth strike arrival.',
    suggestedCyberPayloadId: 'cyber-satellite-spoof',
    exploitStatus: 'WEAPONIZED',
    feedSource: 'DEFENSE-SIGINT',
  },

  // 3. Maritime Fleet / SAG (TGT-SURFACE-FLOTILLA-03)
  {
    id: 'CVE-2026-33921',
    title: 'Naval Combat Management System (CMS) JREAP-C Nonce Replay Vulnerability',
    targetEnvironmentIds: ['TGT-SURFACE-FLOTILLA-03'],
    targetCategory: 'Maritime Fleet / SAG',
    cvssScore: 9.6,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.941,
    cisaKev: true,
    zeroDay: true,
    publishedDate: '2026-10-10T16:45:00Z',
    affectedComponents: [
      'Naval Combat System Tactical Datalink Terminal (Link-16 / JREAP-C)',
      'Phased Array Anti-Air Warfare Radar Interlock',
    ],
    attackVector: 'ADJACENT_RF',
    attackComplexity: 'LOW',
    mitreTechnique: 'T1565.001 - Stored Data Manipulation / Ghost Tracks',
    mitreTactic: 'Impact',
    description:
      'Cryptographic nonce collision in the tactical track broadcasting protocol allows insertion of fabricated maritime surface radar contacts into the primary combat display.',
    impact:
      'Cruiser combat operations center expends surface-to-air missiles on ghost coordinates, leaving true defense channels exhausted.',
    tacticalRelevance:
      'Enables PrSM Increment 4 anti-ship missiles and Collaborative Combat Aircraft swarms to saturate the fleet defense corridor with 92% Pk.',
    pqcRelevance: {
      vulnerableCrypto: 'Classical 32-bit PRNG Session Nonce with RSA-1024 Signature',
      pqcFix: 'NIST FIPS 204 ML-DSA-87 monotonic signature verification',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-datalink-poison',
    exploitStatus: 'ACTIVE_EXPLOIT',
    feedSource: 'DOD-CYBERCOM',
  },
  {
    id: 'CVE-2025-29402',
    title: 'Marine Gas Turbine Propulsion Controller Modbus CAN-Bus Override',
    targetEnvironmentIds: ['TGT-SURFACE-FLOTILLA-03'],
    targetCategory: 'Maritime Fleet / SAG',
    cvssScore: 8.6,
    cvssSeverity: 'HIGH',
    epssScore: 0.795,
    cisaKev: true,
    zeroDay: false,
    publishedDate: '2025-09-02T10:11:00Z',
    affectedComponents: [
      'Rolls-Royce MT30 / GT-25000 Marine Turbine Digital Governor',
      'Shipboard Industrial Control System (ICS) Ethernet Switch',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'MEDIUM',
    mitreTechnique: 'T0836 - Modify Parameter (Turbine Overspeed)',
    mitreTactic: 'Inhibit Response Function',
    description:
      'Unauthenticated write access on port 502 allows injecting forged coil registers to command fuel shutoff valves, inducing emergency propulsion shutdown in rough seas.',
    impact:
      'Dead-in-water condition for the guided missile cruiser within the narrow Strait of Malacca transit corridor.',
    tacticalRelevance:
      'Restricts defensive maneuverability to 0 knots, creating stationary high-value surface targets for precision kinetic strike.',
    pqcRelevance: {
      vulnerableCrypto: 'Unencrypted Modbus TCP / Cleartext CAN frames',
      pqcFix: 'FIPS 203 ML-KEM encrypted zero-trust OT boundary gateway',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-modbus-turbine-trip',
    exploitStatus: 'WEAPONIZED',
    feedSource: 'CISA-KEV',
  },

  // 4. Mobile Hypersonic TEL Battery (TGT-TEL-BATTERY-04)
  {
    id: 'CVE-2026-61803',
    title: 'Heavy TEL Transporter J1939 Engine ECU CAN Injection & Wheel-Lock',
    targetEnvironmentIds: ['TGT-TEL-BATTERY-04'],
    targetCategory: 'Mobile TEL Battery',
    cvssScore: 9.3,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.923,
    cisaKev: true,
    zeroDay: true,
    publishedDate: '2026-10-12T19:00:00Z',
    affectedComponents: [
      'WS2400 Heavy 8x8 Transporter Erector Launcher Engine Control Unit',
      'Hydraulic Outrigger Deployment Telematics Gateway',
    ],
    attackVector: 'ADJACENT_RF',
    attackComplexity: 'LOW',
    mitreTechnique: 'T0813 - Denial of Control',
    mitreTactic: 'Inhibit Response Function',
    description:
      'Remotely exploitable buffer overflow in the cellular/satellite maintenance dongle broadcasts unverified CAN frames on the J1939 vehicle bus, locking pneumatic brakes and freezing hydraulic launcher elevation.',
    impact:
      'Transporter battery immobilized in exposed littoral clearing; unable to erect or launch DF-17 hypersonic glide vehicles.',
    tacticalRelevance:
      'Prevents TEL dispersion into forest camouflage before Long-Range Hypersonic Weapon (LRHW) "Dark Eagle" impact.',
    pqcRelevance: {
      vulnerableCrypto: 'Symmetric static 128-bit XOR maintenance key',
      pqcFix: 'Hardware Security Module with ML-DSA-87 attestation',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-modbus-turbine-trip',
    exploitStatus: 'UNPATCHED_ZERO_DAY',
    feedSource: 'PALANTIR-INTEL',
  },
  {
    id: 'CVE-2025-40291',
    title: 'Hypersonic Glide Vehicle Inertial Unit Flash Memory Corruption',
    targetEnvironmentIds: ['TGT-TEL-BATTERY-04'],
    targetCategory: 'Mobile TEL Battery',
    cvssScore: 8.7,
    cvssSeverity: 'HIGH',
    epssScore: 0.844,
    cisaKev: false,
    zeroDay: false,
    publishedDate: '2025-10-04T13:22:00Z',
    affectedComponents: [
      'Ring Laser Gyroscope Navigation Computer',
      'Pre-Flight Cryptographic Target Upload Interface',
    ],
    attackVector: 'LOCAL',
    attackComplexity: 'MEDIUM',
    mitreTechnique: 'T1565.002 - Component Firmware Corruption',
    mitreTactic: 'Impact',
    description:
      'Failure to sanitize boundary inputs during pre-flight mission waypoint upload allows an attacker to corrupt the missile calibration flash sector.',
    impact:
      'Missile trajectory veers off-course into uninhabited ocean immediately upon rocket booster ignition.',
    tacticalRelevance:
      'Nullifies adversary counter-strike capability with minimal collateral signature.',
    pqcRelevance: {
      vulnerableCrypto: 'Legacy RSA-2048 Mission Hash Verification',
      pqcFix: 'CNSA 2.0 Level 5 (ML-DSA-87 Signed Mission Files)',
      harvestNowRisk: true,
    },
    suggestedCyberPayloadId: 'cyber-datalink-poison',
    exploitStatus: 'WEAPONIZED',
    feedSource: 'DEFENSE-SIGINT',
  },

  // 5. Air Defense Sector C2 Power & SCADA Node (TGT-CYBER-GRID-05)
  {
    id: 'CVE-2026-19450',
    title: 'IEC 61850 Substation Protective Relay Goose Packet Injection Zero-Day',
    targetEnvironmentIds: ['TGT-CYBER-GRID-05'],
    targetCategory: 'Industrial SCADA & Power Grid',
    cvssScore: 10.0,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.991,
    cisaKev: true,
    zeroDay: true,
    publishedDate: '2026-10-13T02:30:00Z',
    affectedComponents: [
      'Siemens SIPROTEC 5 High-Voltage Circuit Breaker Relay',
      'ABB MicroSCADA Pro Substation Automation Gateway',
      'IEC 61850 GOOSE Multicast Protocol Parser',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    mitreTechnique: 'T0855 - Unauthorized Command Message',
    mitreTactic: 'Impair Process Control',
    description:
      'Unauthenticated GOOSE multicast frame processing allows an attacker to trip 500kV step-down transformer circuit breakers, permanently severing primary high-voltage feed to regional radar clusters.',
    impact:
      'Immediate physical blackout across air defense sector radar stations, forcing fallback to noisy diesel generators.',
    tacticalRelevance:
      'Creates instant radar blackout allowing low-altitude infiltration of Anduril Barracuda strike swarms.',
    pqcRelevance: {
      vulnerableCrypto: 'Cleartext IEC 61850 Layer-2 GOOSE packets',
      pqcFix: 'IEC 62351-9 Post-Quantum ML-DSA authenticated GOOSE headers',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-modbus-turbine-trip',
    exploitStatus: 'ACTIVE_EXPLOIT',
    feedSource: 'CISA-KEV',
  },
  {
    id: 'CVE-2025-50218',
    title: 'Modbus TCP Function Code 0x05 Coil Register Memory Override',
    targetEnvironmentIds: ['TGT-CYBER-GRID-05', 'TGT-A2AD-RADAR-01'],
    targetCategory: 'Industrial SCADA & Power Grid',
    cvssScore: 9.4,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.953,
    cisaKev: true,
    zeroDay: false,
    publishedDate: '2025-07-19T09:40:00Z',
    affectedComponents: [
      'Schneider Electric Modicon M580 Programmable Logic Controller',
      'Substation Cooling Fan & Oil Pump Controller v2.8',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    mitreTechnique: 'T0831 - Manipulation of Control',
    mitreTactic: 'Inhibit Response Function',
    description:
      'Direct memory write vulnerability when handling Modbus TCP single coil writes (0x05) allows disabling transformer oil circulating pumps while spoofing temperature telemetry.',
    impact:
      'Thermal runaway and permanent core transformer meltdown within 14 minutes.',
    tacticalRelevance:
      'Permanent incapacitation of critical infrastructure backing adversary integrated air defense command nodes.',
    pqcRelevance: {
      vulnerableCrypto: 'Legacy Modbus TCP lacking authentication or encryption',
      pqcFix: 'FIPS 203 ML-KEM wrapped tunnel with mutual client certs',
      harvestNowRisk: false,
    },
    suggestedCyberPayloadId: 'cyber-modbus-turbine-trip',
    exploitStatus: 'WEAPONIZED',
    feedSource: 'CISA-KEV',
  },

  // 6. Cross-Cutting Post-Quantum Cryptography & Multi-Domain Flaws (ALL TARGETS)
  {
    id: 'CVE-2026-90412',
    title: 'Pre-Quantum RSA-2048 / ECDH P-256 Harvest-Now-Decrypt Intercept Vulnerability',
    targetEnvironmentIds: [
      'TGT-A2AD-RADAR-01',
      'TGT-C4I-BUNKER-02',
      'TGT-SURFACE-FLOTILLA-03',
      'TGT-TEL-BATTERY-04',
      'TGT-CYBER-GRID-05',
    ],
    targetCategory: 'Multi-Domain Tactical / Avionics',
    cvssScore: 9.9,
    cvssSeverity: 'CRITICAL',
    epssScore: 0.978,
    cisaKev: true,
    zeroDay: false,
    publishedDate: '2026-10-13T06:00:00Z',
    affectedComponents: [
      'Classical TLS 1.3 Cipher Suites (TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384)',
      'Legacy IPsec IKEv2 Cryptographic Association Engines',
      'Tactical Link-16 Satellite Ground Station Uplink Modules',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    mitreTechnique: 'T1557 - Adversary in the Middle & Post-Quantum Harvest',
    mitreTactic: 'Credential Access',
    description:
      'Adversary cryptanalytic recording stations are harvesting ciphertexts across high-frequency and satellite relays. Classical discrete-logarithm and integer-factorization keys are susceptible to Shor algorithm execution on fault-tolerant quantum processors.',
    impact:
      'Retroactive decryption of military fire orders, targeting coordinates, and national tactical telemetry.',
    tacticalRelevance:
      'Enforces mandatory transition to NIST FIPS 203 ML-KEM-768/1024 and FIPS 204 ML-DSA-87 across all offensive strike kill chain links.',
    pqcRelevance: {
      vulnerableCrypto: 'RSA-2048 / ECDH P-256 (0 bits of post-quantum security)',
      pqcFix: 'NIST FIPS 203 ML-KEM-1024 + NIST FIPS 204 ML-DSA-87',
      harvestNowRisk: true,
    },
    suggestedCyberPayloadId: 'cyber-satellite-spoof',
    exploitStatus: 'ACTIVE_EXPLOIT',
    feedSource: 'DOD-CYBERCOM',
  },
  {
    id: 'CVE-2026-77319',
    title: 'OpenSSL 3.3.2 Classical KDF Downgrade Attack on Military Mesh Radios',
    targetEnvironmentIds: ['TGT-C4I-BUNKER-02', 'TGT-TEL-BATTERY-04'],
    targetCategory: 'Multi-Domain Tactical / Avionics',
    cvssScore: 8.5,
    cvssSeverity: 'HIGH',
    epssScore: 0.819,
    cisaKev: false,
    zeroDay: true,
    publishedDate: '2026-10-12T11:15:00Z',
    affectedComponents: [
      'OpenSSL 3.3.x libcrypto Key Derivation Functions',
      'AN/PRC-117G Tactical MANET Radio Mesh Firmware',
    ],
    attackVector: 'NETWORK',
    attackComplexity: 'MEDIUM',
    mitreTechnique: 'T1553.004 - Install Root Certificate / Cryptographic Bypass',
    mitreTactic: 'Defense Evasion',
    description:
      'Improper validation during client key exchange negotiation allows an active RF adversary to strip post-quantum KEM extension packets, forcing fallback to weak single-pass SHA-1 key derivation.',
    impact:
      'Adversary breaks radio mesh hop key in sub-minute computational runs.',
    tacticalRelevance:
      'Forces all forward tactical relay aircraft and ground stations to verify post-quantum hybrid KDF combiners.',
    pqcRelevance: {
      vulnerableCrypto: 'Single-pass classical KDF fallback',
      pqcFix: 'NIST FIPS 203 ML-KEM-768 with Monotonic Anti-Downgrade Pinning',
      harvestNowRisk: true,
    },
    suggestedCyberPayloadId: 'cyber-rf-aesa-injector',
    exploitStatus: 'UNPATCHED_ZERO_DAY',
    feedSource: 'NSA-GHIDRA',
  },
];

// Helper to generate simulated incoming live CVE bulletins in real-time
export function generateSimulatedLiveCve(targetId: string): ThreatIntelCve {
  const cveNumber = Math.floor(10000 + Math.random() * 89999);
  const now = new Date().toISOString();

  const templates: Array<{
    title: string;
    cat: ThreatIntelCve['targetCategory'];
    comp: string[];
    vector: ThreatIntelCve['attackVector'];
    score: number;
    sev: ThreatIntelCve['cvssSeverity'];
    mitre: string;
    tactic: string;
    desc: string;
    impact: string;
    tactical: string;
    pqc?: ThreatIntelCve['pqcRelevance'];
    payload?: string;
  }> = [
    {
      title: 'AESA Beamforming Array Microcode Ring-0 Arbitrary Write',
      cat: 'Radar & RF A2/AD',
      comp: ['GaN Solid-State RF Power Amplifier ASIC', 'Beam Steering Controller v5.1'],
      vector: 'ADJACENT_RF',
      score: 9.8,
      sev: 'CRITICAL',
      mitre: 'T0815 - Denial of View',
      tactic: 'Inhibit Response Function',
      desc: 'High-power modulated S-band harmonic pulse causes stack pointer overwrite in beam-steering ASIC.',
      impact: 'Shuts down radar azimuth sweep, leaving 90-degree blind window for incoming strike.',
      tactical: 'Exposes target site to surprise hypersonic low-altitude glide entry.',
      pqc: {
        vulnerableCrypto: 'Unauthenticated RF maintenance frame',
        pqcFix: 'FIPS 204 ML-DSA-87 Hardware Attestation',
        harvestNowRisk: false,
      },
      payload: 'cyber-rf-aesa-injector',
    },
    {
      title: 'DNP3 Secure Authentication SAv5 Session Key Desynchronization',
      cat: 'Industrial SCADA & Power Grid',
      comp: ['Schweitzer Engineering SEL-3530 Real-Time Automation Controller', 'DNP3 Protocol Stack'],
      vector: 'NETWORK',
      score: 8.9,
      sev: 'HIGH',
      mitre: 'T0855 - Unauthorized Command Message',
      tactic: 'Impair Process Control',
      desc: 'Session desynchronization allows forged critical trip commands to execute without valid cryptographic HMAC.',
      impact: 'Immediate power trip to radar cooling chillers, forcing thermal emergency shutdown.',
      tactical: 'Disables radar cooling arrays before kinetic weapon launch.',
      pqc: {
        vulnerableCrypto: 'Classical HMAC-SHA256 with pre-shared keys',
        pqcFix: 'FIPS 203 ML-KEM authenticated ephemeral sessions',
        harvestNowRisk: false,
      },
      payload: 'cyber-modbus-turbine-trip',
    },
    {
      title: 'Tactical UHF Satellite Downlink Demodulator Heap Overflow',
      cat: 'Subterranean C4I',
      comp: ['AN/WSC-3 Satellite Transceiver', 'Milstar / UHF Follow-On Baseband Demodulator'],
      vector: 'ADJACENT_RF',
      score: 9.4,
      sev: 'CRITICAL',
      mitre: 'T1190 - Exploit Public-Facing Application',
      tactic: 'Initial Access',
      desc: 'Malformed frame length header in UHF satellite broadcast causes kernel heap overflow in terminal controller.',
      impact: 'Remote command execution on command bunker gateway router.',
      tactical: 'Enables exfiltration of underground command bunker staff rotations and shift orders.',
      pqc: {
        vulnerableCrypto: 'Classical 1024-bit Diffie-Hellman Key Exchange',
        pqcFix: 'FIPS 203 ML-KEM-1024 KEM Encapsulation',
        harvestNowRisk: true,
      },
      payload: 'cyber-satellite-spoof',
    },
    {
      title: 'MIL-STD-1553B Dual-Redundant Bus Arbiter Injection Glitch',
      cat: 'Multi-Domain Tactical / Avionics',
      comp: ['DDC BU-61580 Remote Terminal Interface', 'Avionics Mission Computer Subsystem'],
      vector: 'LOCAL',
      score: 8.4,
      sev: 'HIGH',
      mitre: 'T1499 - Endpoint Denial of Service',
      tactic: 'Impact',
      desc: 'Clock glitching on the 1553 transformer-coupled bus induces babbling idiot mode, starving mission computer bus slots.',
      impact: 'Target launcher telemetry fails to synchronize launch authorization.',
      tactical: 'Freezes mobile TEL hydraulic launcher firing sequence.',
      pqc: {
        vulnerableCrypto: 'Unauthenticated MIL-STD-1553 Manchester II word streams',
        pqcFix: 'FIPS 204 ML-DSA-44 micro-frame attestation',
        harvestNowRisk: false,
      },
      payload: 'cyber-datalink-poison',
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  const isZeroDay = Math.random() > 0.45;
  const isCisaKev = Math.random() > 0.35;

  return {
    id: `CVE-2026-${cveNumber}`,
    title: template.title,
    targetEnvironmentIds: [targetId],
    targetCategory: template.cat,
    cvssScore: template.score,
    cvssSeverity: template.sev,
    epssScore: Number((0.75 + Math.random() * 0.24).toFixed(3)),
    cisaKev: isCisaKev,
    zeroDay: isZeroDay,
    publishedDate: now,
    affectedComponents: template.comp,
    attackVector: template.vector,
    attackComplexity: 'LOW',
    mitreTechnique: template.mitre,
    mitreTactic: template.tactic,
    description: template.desc,
    impact: template.impact,
    tacticalRelevance: template.tactical,
    pqcRelevance: template.pqc,
    suggestedCyberPayloadId: template.payload,
    exploitStatus: isZeroDay ? 'UNPATCHED_ZERO_DAY' : 'ACTIVE_EXPLOIT',
    feedSource: isZeroDay ? 'DOD-CYBERCOM' : 'CISA-KEV',
  };
}
