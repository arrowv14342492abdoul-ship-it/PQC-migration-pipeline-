import {
  DecoyTlsEndpoint,
  LiboqsKemAlgorithm,
  LiboqsSigAlgorithm,
  HoneypotExploitSignature,
  HoneypotSecurityLog,
  HoneypotTelemetrySummary,
  ExploitPatternId,
} from '../types/defenseHoneypot';

export const EXPLOIT_SIGNATURE_CATALOG: HoneypotExploitSignature[] = [
  {
    patternId: 'SIG-PQC-DOWNGRADE-01',
    name: 'Quantum Downgrade Exploit / HNDL Stripping',
    category: 'Protocol Downgrade',
    cveReference: 'CWE-757 / Post-Quantum TLS Downgrade Probe',
    severity: 'CRITICAL',
    description:
      'Adversary ClientHello intentionally strips post-quantum KEM key shares from supported_groups extension to force weak classical ECDHE/RSA for Harvest-Now-Decrypt-Later.',
    detectionRule:
      'ClientHello contains cipher_suites matching RSA/ECDSA only, supported_groups lacks 0x6399 (ML-KEM-768) or 0x639A (ML-KEM-1024).',
    f22AvionicsResponse:
      'PQC Bus Guardian rejects connection; issues immediate EW HUD alert; forces 100% optical bus fallback.',
  },
  {
    patternId: 'SIG-LATTICE-POISON-02',
    name: 'Lattice Modulus Injection Attack',
    category: 'Lattice Parameter Poisoning',
    cveReference: 'CWE-1284 / ML-KEM NTT Coefficient Range Overflow',
    severity: 'CRITICAL',
    description:
      'Client sends malformed polynomial ciphertext vectors violating ML-KEM modulus q=3329 (coefficients >= 3329 or negative integers) attempting integer overflow in vector arithmetic.',
    detectionRule:
      'Polynomial NTT coefficient decode error: vector element c[i] > 3328 detected during deserialization.',
    f22AvionicsResponse:
      'CIP-1 hardware vector unit asserts fault trap; kills decoy worker PID; logs anomalous vector to mission recorder.',
  },
  {
    patternId: 'SIG-IFDL-ROGUE-F35-03',
    name: 'Tactical IFDL Rogue Flight Node Impersonation',
    category: 'Tactical Node Impersonation',
    cveReference: 'CWE-290 / Link-16 / MADL Spurious Flight Lead Auth',
    severity: 'CRITICAL',
    description:
      'Compromised external flight asset attempts to bind to F-22 Intra-Flight Data Link using forged Link-16 crypto seed without valid FIPS 204 ML-DSA-87 flight certificate.',
    detectionRule:
      'Mutual TLS client certificate signature verification failed against AF_AIR_COMBAT_COMMAND_ROOT_CA.',
    f22AvionicsResponse:
      'APG-77 radar sets hostile track flag on transmitting coordinates; severs IFDL tactical slot.',
  },
  {
    patternId: 'SIG-TLS-FUZZ-OVERFLOW-04',
    name: 'Malformed TLS Extension Buffer Fuzzing',
    category: 'Buffer Fuzzing',
    cveReference: 'CWE-120 / Embedded TCP/IP Stack Heap Overflow',
    severity: 'HIGH',
    description:
      'Fuzzing payload with oversized extension length header (65,535 bytes) aimed at exhausting embedded RTOS memory buffer on MIL-STD-1760 bus interface.',
    detectionRule:
      'ClientHello extension payload length mismatch: claimed length exceeds packet boundary by > 4,096 bytes.',
    f22AvionicsResponse:
      'Fibre Channel switch firewall drops frame at Layer 2; quarantines remote terminal sub-address.',
  },
  {
    patternId: 'SIG-HEARTBEAT-LEAK-05',
    name: 'Avionics Heartbeat Memory Leak Probe',
    category: 'Memory Disclosure',
    cveReference: 'CVE-2014-0160 Variant / Avionics TLS Heartbeat Probe',
    severity: 'HIGH',
    description:
      'Client issues TLS Heartbeat request with payload_length field exceeding actual transmitted payload, probing for raw memory leakage from CIP crypto buffers.',
    detectionRule:
      'TLS record type 0x18 (Heartbeat) with payload length mismatch detected on decoy telemetry socket.',
    f22AvionicsResponse:
      'Decoy responds with randomized pseudo-noise dummy bytes; alerts SIEM of memory probe.',
  },
  {
    patternId: 'SIG-TIMING-PROBE-06',
    name: 'Micro-Burst Side-Channel Timing Probe',
    category: 'Side-Channel',
    cveReference: 'CWE-385 / Timing Discrepancy in Lattice Decapsulation',
    severity: 'MEDIUM',
    description:
      'High-frequency probe packets sent at sub-millisecond intervals attempting to measure timing variance in constant-time Montgomery reduction.',
    detectionRule:
      'Packet inter-arrival interval < 200 microseconds for 10 consecutive ClientHello handshakes.',
    f22AvionicsResponse:
      'CIP-2 hardware timer applies jitter masking; throttles connection rate on maintenance gateway.',
  },
];

export const INITIAL_DECOY_ENDPOINTS: DecoyTlsEndpoint[] = [
  {
    id: 'ep-ifdl-8443',
    name: 'IFDL Tactical Ingress Gateway (Decoy)',
    port: 8443,
    bindHost: '0.0.0.0:8443',
    subsystemRole: 'Intra-Flight Data Link (IFDL) 4-Ship Mesh',
    protocol: 'Tactical TLS / IFDL LPI',
    kemPrimitive: 'ML-KEM-1024',
    sigPrimitive: 'ML-DSA-87',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (X448_MLKEM1024)',
    decoyCertSubject: 'CN=raptor-lead-01.tactical.ifdl.af.mil, OU=Avionics CIP-1, O=USAF',
    decoyCertIssuer: 'CN=USAF Tactical Post-Quantum Intermediate CA-04',
    status: 'LISTENING_ACTIVE',
    dummyKeyStats: {
      publicKeyBytes: 1568,
      secretKeyBytes: 3168,
      ciphertextBytes: 1568,
      signatureBytes: 4595,
      claimedSecurityCategory: 5,
    },
    totalProbesTrapped: 6,
    lastProbeTimestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    activeExploitAlerts: 1,
    description:
      'Emulates the primary inter-aircraft formation encrypted bridge. Lures rogue RF spoofers attempting to infiltrate the 4-ship flight mesh.',
  },
  {
    id: 'ep-radar-9443',
    name: 'AN/APG-77 AESA Radar Cryptographic Stream (Decoy)',
    port: 9443,
    bindHost: '0.0.0.0:9443',
    subsystemRole: 'AESA Radar Track Feeder & LPI Egress',
    protocol: 'Mil-Std Optical TLS',
    kemPrimitive: 'ML-KEM-768',
    sigPrimitive: 'Falcon-1024',
    cipherSuite: 'TLS_CHACHA20_POLY1305_SHA256 (X25519_MLKEM768)',
    decoyCertSubject: 'CN=apg77-radartrack.f22.sensor.mil, OU=Lockheed Sensor Array',
    decoyCertIssuer: 'CN=Lockheed Martin Post-Quantum Root Authority 2026',
    status: 'LISTENING_ACTIVE',
    dummyKeyStats: {
      publicKeyBytes: 1184,
      secretKeyBytes: 2400,
      ciphertextBytes: 1088,
      signatureBytes: 1330,
      claimedSecurityCategory: 3,
    },
    totalProbesTrapped: 4,
    lastProbeTimestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    activeExploitAlerts: 1,
    description:
      'Decoy feed for high-rate synthetic aperture radar track telemetry. Captures adversary SIGINT attempts to decrypt raw radar track arrays.',
  },
  {
    id: 'ep-vms-10443',
    name: 'VMS Flight Control Maintenance Gateway (Decoy)',
    port: 10443,
    bindHost: '0.0.0.0:10443',
    subsystemRole: 'Vehicle Management System (VMS) Quad-Redundant Bus',
    protocol: 'TLS 1.3 / Post-Quantum Draft',
    kemPrimitive: 'FrodoKEM-976-AES',
    sigPrimitive: 'ML-DSA-65',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (FrodoKEM-976)',
    decoyCertSubject: 'CN=vms-maintenance-service.f22.avionics.internal',
    decoyCertIssuer: 'CN=USAF Flight Dynamics Division CA-01',
    status: 'LISTENING_ACTIVE',
    dummyKeyStats: {
      publicKeyBytes: 15632,
      secretKeyBytes: 31296,
      ciphertextBytes: 15744,
      signatureBytes: 3293,
      claimedSecurityCategory: 3,
    },
    totalProbesTrapped: 3,
    lastProbeTimestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    activeExploitAlerts: 0,
    description:
      'High-interaction decoy interface simulating ground-crew maintenance protocol for flight surface actuators and thrust-vectoring nozzles.',
  },
  {
    id: 'ep-weapons-11443',
    name: 'MIL-STD-1760 Smart Weapons Bus Diode (Decoy)',
    port: 11443,
    bindHost: '0.0.0.0:11443',
    subsystemRole: 'Internal Weapons Bay AIM-120D / GBU-39 Arming Bus',
    protocol: 'Mil-Std Optical TLS',
    kemPrimitive: 'Classic-McEliece-348864',
    sigPrimitive: 'SPHINCS+-SHA2-192s-robust',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (Classic-McEliece)',
    decoyCertSubject: 'CN=aim120d-weapons-bus.f22.ordnance.mil',
    decoyCertIssuer: 'CN=USAF Air Armament Center Eglin AFB CA',
    status: 'LISTENING_ACTIVE',
    dummyKeyStats: {
      publicKeyBytes: 261120,
      secretKeyBytes: 6492,
      ciphertextBytes: 128,
      signatureBytes: 16224,
      claimedSecurityCategory: 1,
    },
    totalProbesTrapped: 2,
    lastProbeTimestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    activeExploitAlerts: 0,
    description:
      'Simulates the cryptographic arming key distribution channel for internal missile bays. Detects unauthorized payload status inquiries.',
  },
  {
    id: 'ep-egi-12443',
    name: 'EGI Inertial/GPS Anti-Spoofing Relay (Decoy)',
    port: 12443,
    bindHost: '0.0.0.0:12443',
    subsystemRole: 'Embedded GPS/INS Cross-Check Filter',
    protocol: 'Tactical TLS / IFDL LPI',
    kemPrimitive: 'BIKE-L3',
    sigPrimitive: 'Falcon-512',
    cipherSuite: 'TLS_AES_128_GCM_SHA256 (BIKE-L3)',
    decoyCertSubject: 'CN=egi-inertial-timesync.af.mil',
    decoyCertIssuer: 'CN=Space Delta 8 Satellite Communications CA',
    status: 'LISTENING_ACTIVE',
    dummyKeyStats: {
      publicKeyBytes: 3114,
      secretKeyBytes: 5224,
      ciphertextBytes: 3114,
      signatureBytes: 666,
      claimedSecurityCategory: 3,
    },
    totalProbesTrapped: 1,
    lastProbeTimestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    activeExploitAlerts: 0,
    description:
      'Traps GPS ephemeris spoofing payloads and false time-synchronization beacons before they can reach the flight guidance computers.',
  },
];

export const INITIAL_HONEYPOT_LOGS: HoneypotSecurityLog[] = [
  {
    id: 'log-hp-2001',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    endpointId: 'ep-ifdl-8443',
    endpointPort: 8443,
    endpointName: 'IFDL Tactical Ingress Gateway (Decoy)',
    clientIp: '198.51.100.22',
    clientPort: 48912,
    simulatedHandshake: {
      clientOfferedCiphers: ['TLS_RSA_WITH_AES_128_CBC_SHA', 'TLS_RSA_WITH_AES_256_CBC_SHA'],
      clientSupportedGroups: ['secp256r1', 'secp384r1'],
      negotiatedKem: 'ML-KEM-1024',
      negotiatedSig: 'ML-DSA-87',
      handshakeDurationMs: 0.048,
      dummyCiphertextSnippet: 'MLKEM1024-CT: [3A 8F 9C 21 ... 1568 bytes]',
    },
    detectedSignature: EXPLOIT_SIGNATURE_CATALOG[0], // Quantum Downgrade
    threatLevel: 'DEFCON_1_CRITICAL',
    rawPayloadSnippet:
      'ClientHello: [16 03 03 00 9C 01 ... cipher_suites=(0x002F, 0x0035) supported_groups=(0x0017, 0x0018) EXT_PQC_MISSING]',
    containmentAction:
      'PQC Bus Guardian rejected downgrade attempt; client IP blacklisted in null netns; emitted HUD master warning.',
    f22AvionicsTelemetryInjected: {
      cip1CpuDeltaPercent: 4.8,
      trngEntropyDrawGbps: 0.35,
      busChannelAlert: 'FC-OPTICAL-1',
      busOpcode: '0x08C4 (PQC_DECOY_INTRUSION_ALERT)',
      hudWarningMessage: 'EW ALERT: DECOY IFDL (PORT 8443) TRIPPED - QUANTUM DOWNGRADE PROBE BLOCKED',
      missionImpact: 'Zero avionics degradation; adversary tactical deception payload archived.',
    },
  },
  {
    id: 'log-hp-2002',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    endpointId: 'ep-radar-9443',
    endpointPort: 9443,
    endpointName: 'AN/APG-77 AESA Radar Cryptographic Stream (Decoy)',
    clientIp: '203.0.113.88',
    clientPort: 52190,
    simulatedHandshake: {
      clientOfferedCiphers: ['TLS_AES_256_GCM_SHA384'],
      clientSupportedGroups: ['x25519_kyber768', 'x25519'],
      negotiatedKem: 'ML-KEM-768',
      negotiatedSig: 'Falcon-1024',
      handshakeDurationMs: 0.052,
      dummyCiphertextSnippet: 'MLKEM768-CT: [7B 12 FF 09 ... 1088 bytes]',
    },
    detectedSignature: EXPLOIT_SIGNATURE_CATALOG[1], // Lattice Modulus Injection
    threatLevel: 'DEFCON_1_CRITICAL',
    rawPayloadSnippet:
      'Malformed KeyShareExtension: [00 33 04 40 ... coeff[42]=0x0D05 (3333 > q=3329) OVERFLOW_VECTOR]',
    containmentAction:
      'CIP-1 hardware vector bounds checker trapped integer overflow; isolated decoy thread; logged telemetry.',
    f22AvionicsTelemetryInjected: {
      cip1CpuDeltaPercent: 6.2,
      trngEntropyDrawGbps: 0.42,
      busChannelAlert: 'CH-A (MIL-1553B)',
      busOpcode: '0x09F2 (LATTICE_MODULUS_VIOLATION)',
      hudWarningMessage: 'CIP FAULT TRAP: MALFORMED LATTICE VECTOR ON RADAR DECOY (PORT 9443)',
      missionImpact: 'Vector unit prevented core dump; radar track processing unaffected.',
    },
  },
  {
    id: 'log-hp-2003',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    endpointId: 'ep-vms-10443',
    endpointPort: 10443,
    endpointName: 'VMS Flight Control Maintenance Gateway (Decoy)',
    clientIp: '192.0.2.14',
    clientPort: 34102,
    simulatedHandshake: {
      clientOfferedCiphers: ['TLS_AES_256_GCM_SHA384'],
      clientSupportedGroups: ['frodo976aes'],
      negotiatedKem: 'FrodoKEM-976-AES',
      negotiatedSig: 'ML-DSA-65',
      handshakeDurationMs: 0.112,
      dummyCiphertextSnippet: 'FRODOKEM-CT: [C4 90 2A 11 ... 15744 bytes]',
    },
    detectedSignature: EXPLOIT_SIGNATURE_CATALOG[3], // Buffer Fuzzing
    threatLevel: 'TACTICAL_HIGH',
    rawPayloadSnippet:
      'ExtensionHeader: [FF 01 FF FF 41 41 41 41 ... 16384 bytes of 0x41 FUZZING_PATTERN]',
    containmentAction:
      'Fibre Channel switch frame parser dropped oversized extension; alerted VMS quad-redundant bus.',
    f22AvionicsTelemetryInjected: {
      cip1CpuDeltaPercent: 2.1,
      trngEntropyDrawGbps: 0.12,
      busChannelAlert: 'CH-B (MIL-1553B)',
      busOpcode: '0x07B0 (BUFFER_OVERFLOW_SHIELD)',
      hudWarningMessage: 'VMS BUS DEFENSE: OVERSIZED FUZZING FRAME DROPPED ON PORT 10443',
      missionImpact: 'Actuator commands verified 4-of-4 lockstep; zero flight control disturbance.',
    },
  },
];

// Telemetry Listener Subscriptions for Real-Time F-22 Bridge
type TelemetryListener = (log: HoneypotSecurityLog) => void;
const telemetryListeners: Set<TelemetryListener> = new Set();

export function subscribeToF22HoneypotTelemetry(listener: TelemetryListener): () => void {
  telemetryListeners.add(listener);
  return () => telemetryListeners.delete(listener);
}

// Generate Dummy Liboqs Cryptographic Primitives
export function generateDummyLiboqsPrimitives(
  kem: LiboqsKemAlgorithm = 'ML-KEM-1024',
  sig: LiboqsSigAlgorithm = 'ML-DSA-87'
) {
  const seed = Date.now().toString(16);

  // Return realistic dummy keys, sizes, and sample bytes
  return {
    kemAlgorithm: kem,
    sigAlgorithm: sig,
    publicKeyHex: `04${seed}${Array.from({ length: 32 }, (_, i) =>
      ((i * 17 + 42) % 256).toString(16).padStart(2, '0')
    ).join('')}...`,
    secretKeyHex: `[PROTECTED_HSM_CIP_KEY_STORE_${seed.toUpperCase()}]`,
    ciphertextHex: `CT_${kem.replace(/[^A-Za-z0-9]/g, '')}_${seed}${Array.from(
      { length: 24 },
      (_, i) => ((i * 31 + 88) % 256).toString(16).padStart(2, '0')
    ).join('')}`,
    signatureHex: `SIG_${sig.replace(/[^A-Za-z0-9]/g, '')}_${seed}${Array.from(
      { length: 24 },
      (_, i) => ((i * 47 + 120) % 256).toString(16).padStart(2, '0')
    ).join('')}`,
    generatedAt: new Date().toISOString(),
  };
}

// Record Honeypot Probe & Feed into F-22 Telemetry Stream
export function recordHoneypotProbe(
  endpointId: string,
  scenario:
    | 'QUANTUM_DOWNGRADE'
    | 'LATTICE_MODULUS_ATTACK'
    | 'ROGUE_IFDL_IMPERSONATION'
    | 'BUFFER_FUZZING'
    | 'HEARTBEAT_MEMORY_LEAK'
    | 'NORMAL_DECOY_PROBE',
  customIp?: string
): HoneypotSecurityLog {
  const ep =
    INITIAL_DECOY_ENDPOINTS.find((e) => e.id === endpointId) || INITIAL_DECOY_ENDPOINTS[0];
  const now = new Date();
  const timestamp = now.toISOString();

  ep.totalProbesTrapped += 1;
  ep.lastProbeTimestamp = timestamp;

  const clientIp = customIp || `198.51.100.${Math.floor(Math.random() * 200) + 15}`;
  const clientPort = Math.floor(Math.random() * 30000) + 32000;

  let sig: HoneypotExploitSignature | undefined;
  let threatLevel: HoneypotSecurityLog['threatLevel'] = 'PROBE_INTERCEPTED';
  let rawPayload = '';
  let containment = 'Decoy handshake processed with dummy liboqs primitives.';
  let hudMsg = `EW INFO: Decoy probe intercepted on port ${ep.port}`;
  let busOp = '0x05A1 (DECOY_PROBE_LOG)';
  let cpuDelta = 1.8;
  let entropyDraw = 0.15;
  let busChannel: HoneypotSecurityLog['f22AvionicsTelemetryInjected']['busChannelAlert'] =
    'FC-OPTICAL-1';

  if (scenario === 'QUANTUM_DOWNGRADE') {
    sig = EXPLOIT_SIGNATURE_CATALOG[0];
    threatLevel = 'DEFCON_1_CRITICAL';
    ep.activeExploitAlerts += 1;
    rawPayload = `ClientHello: [16 03 03 ... cipher_suites=(0x002F, 0x0035 RSA_ONLY) supported_groups=(secp256r1) PQC_OMITTED]`;
    containment =
      'PQC Bus Guardian rejected classical downgrade attempt; isolated socket in null netns; alerted cockpit HUD.';
    hudMsg = `EW MASTER CAUTION: DECOY IFDL (PORT ${ep.port}) TRIPPED - QUANTUM DOWNGRADE PROBE BLOCKED`;
    busOp = '0x08C4 (PQC_DECOY_INTRUSION_ALERT)';
    cpuDelta = 5.2;
    entropyDraw = 0.45;
  } else if (scenario === 'LATTICE_MODULUS_ATTACK') {
    sig = EXPLOIT_SIGNATURE_CATALOG[1];
    threatLevel = 'DEFCON_1_CRITICAL';
    ep.activeExploitAlerts += 1;
    rawPayload = `Malformed KeyShare: [00 33 ... coeff[18]=0x0D12 (3346 > q=3329) ILLEGAL_COEFFICIENT]`;
    containment =
      'CIP vector bounds checker asserted fault; killed tainted decompiler process; preserved CIP-1 state.';
    hudMsg = `CIP VECTOR FAULT TRAP: MALFORMED LATTICE MODULUS ON PORT ${ep.port}`;
    busOp = '0x09F2 (LATTICE_MODULUS_VIOLATION)';
    cpuDelta = 7.1;
    entropyDraw = 0.55;
    busChannel = 'CH-A (MIL-1553B)';
  } else if (scenario === 'ROGUE_IFDL_IMPERSONATION') {
    sig = EXPLOIT_SIGNATURE_CATALOG[2];
    threatLevel = 'DEFCON_1_CRITICAL';
    ep.activeExploitAlerts += 1;
    rawPayload = `MADL_AUTH_PACKET: [Spoofed NodeID: F35-LIGHTNING-04 Link16_Seed=0xFA991 Invalid_MLDSA87_Cert]`;
    containment =
      'APG-77 radar sets hostile track flag on transmitting bearing; severs IFDL tactical slot.';
    hudMsg = `TACTICAL THREAT: ROGUE IFDL TOKEN SPOOF ON PORT ${ep.port} - HOSTILE RADAR TRACK GENERATED`;
    busOp = '0x0A10 (ROGUE_TACTICAL_NODE_ALERT)';
    cpuDelta = 6.0;
    entropyDraw = 0.38;
  } else if (scenario === 'BUFFER_FUZZING') {
    sig = EXPLOIT_SIGNATURE_CATALOG[3];
    threatLevel = 'TACTICAL_HIGH';
    rawPayload = `Oversized Frame: [Len=65535 payload=41 41 41 41 ... 16KB RTOS_BUFFER_OVERFLOW_ATTEMPT]`;
    containment =
      'Fibre Channel switch frame parser dropped oversized packet; sub-address quarantined.';
    hudMsg = `VMS BUS WARNING: OVERSIZED FUZZING ATTEMPT BLOCKED ON PORT ${ep.port}`;
    busOp = '0x07B0 (BUFFER_OVERFLOW_SHIELD)';
    cpuDelta = 3.4;
    entropyDraw = 0.22;
    busChannel = 'CH-B (MIL-1553B)';
  } else if (scenario === 'HEARTBEAT_MEMORY_LEAK') {
    sig = EXPLOIT_SIGNATURE_CATALOG[4];
    threatLevel = 'TACTICAL_HIGH';
    rawPayload = `TLS_HEARTBEAT: [Type 0x18 PayloadLen=0xFFFF ActualLen=0x0004 MEMORY_DISCLOSURE_PROBE]`;
    containment =
      'Decoy responded with synthetic pseudo-noise bytes; recorded adversary source in SIEM.';
    hudMsg = `SECURITY ALERT: TLS HEARTBEAT LEAK PROBE BLOCKED ON PORT ${ep.port}`;
    busOp = '0x0640 (HEARTBEAT_MEMORY_TRAP)';
    cpuDelta = 2.8;
    entropyDraw = 0.25;
  } else {
    rawPayload = `ClientHello: [16 03 03 ... Supported_Groups=(x448_mlkem1024, secp384r1) Valid handshake]`;
  }

  const newLog: HoneypotSecurityLog = {
    id: `log-hp-${Date.now()}`,
    timestamp,
    endpointId: ep.id,
    endpointPort: ep.port,
    endpointName: ep.name,
    clientIp,
    clientPort,
    simulatedHandshake: {
      clientOfferedCiphers: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
      clientSupportedGroups: [
        scenario === 'QUANTUM_DOWNGRADE' ? 'secp256r1' : 'x448_mlkem1024',
        'x25519_mlkem768',
      ],
      negotiatedKem: ep.kemPrimitive,
      negotiatedSig: ep.sigPrimitive,
      handshakeDurationMs: Number((0.045 + Math.random() * 0.02).toFixed(3)),
      dummyCiphertextSnippet: `${ep.kemPrimitive.replace(/[^A-Za-z0-9]/g, '')}-CT: [${Math.random()
        .toString(16)
        .substring(2, 10)
        .toUpperCase()} ... ${ep.dummyKeyStats.ciphertextBytes} bytes]`,
    },
    detectedSignature: sig,
    threatLevel,
    rawPayloadSnippet: rawPayload,
    containmentAction: containment,
    f22AvionicsTelemetryInjected: {
      cip1CpuDeltaPercent: cpuDelta,
      trngEntropyDrawGbps: entropyDraw,
      busChannelAlert: busChannel,
      busOpcode: busOp,
      hudWarningMessage: hudMsg,
      missionImpact:
        scenario === 'NORMAL_DECOY_PROBE'
          ? 'Nominal decoy handshake logged.'
          : 'Zero avionics degradation; automated PQC bus guardian engaged.',
    },
  };

  INITIAL_HONEYPOT_LOGS.unshift(newLog);
  if (INITIAL_HONEYPOT_LOGS.length > 50) {
    INITIAL_HONEYPOT_LOGS.pop();
  }

  // Dispatch to active F-22 Telemetry Stream listeners
  telemetryListeners.forEach((listener) => {
    try {
      listener(newLog);
    } catch (err) {
      console.warn('Error in telemetry listener:', err);
    }
  });

  return newLog;
}

export function getHoneypotTelemetrySummary(): HoneypotTelemetrySummary {
  const critical = INITIAL_HONEYPOT_LOGS.filter((l) => l.threatLevel === 'DEFCON_1_CRITICAL').length;
  const downgrade = INITIAL_HONEYPOT_LOGS.filter(
    (l) => l.detectedSignature?.patternId === 'SIG-PQC-DOWNGRADE-01'
  ).length;

  const totalDuration = INITIAL_HONEYPOT_LOGS.reduce(
    (acc, cur) => acc + cur.simulatedHandshake.handshakeDurationMs,
    0
  );

  return {
    totalDecoyEndpoints: INITIAL_DECOY_ENDPOINTS.length,
    totalConnectionsIntercepted: INITIAL_HONEYPOT_LOGS.length,
    criticalExploitsBlocked: critical,
    downgradeAttemptsTrapped: downgrade,
    f22TelemetryStreamSynced: true,
    averageHandshakeLatencyMs:
      INITIAL_HONEYPOT_LOGS.length > 0
        ? Number((totalDuration / INITIAL_HONEYPOT_LOGS.length).toFixed(3))
        : 0.05,
    lastExploitSignature: INITIAL_HONEYPOT_LOGS[0]?.detectedSignature?.name,
  };
}
