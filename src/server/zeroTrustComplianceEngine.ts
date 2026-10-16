import type {
  IncomingConnectionAttempt,
  ZeroTrustComplianceOverview,
  AnomalySignature,
} from '../types/zeroTrustCompliance.ts';

export let INCOMING_CONNECTIONS: IncomingConnectionAttempt[] = [
  {
    id: 'conn-attempt-9901',
    timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
    sourceIp: '198.51.100.89',
    sourcePort: 54128,
    sourceGeo: 'Unknown / Tor Exit Node (nl-ams-exit02)',
    sourceAsnOrOrg: 'AS60244 / Privacy Proxy Transit',
    subnetClass: 'TOR_ANONYMIZED_NODE',
    targetEndpoint: 'ghidra-c2-decoy.internal:13100',
    targetPort: 13100,
    protocol: 'Java RMI / Decoy Registry',
    requestedCipherSuite: 'PLAINTEXT_TCP_RMI',
    verdict: 'HONEYPOT_TRIPPED',
    honeypotDecoyHit: {
      honeypotId: 'hp-rmi-decoy',
      honeypotName: 'Ghidra Server Java RMI Decoy Listener',
      decoyType: 'High-Interaction Deserialization Decoy',
    },
    anomalySignature: {
      patternId: 'SIG-RMI-DESER-901',
      name: 'Ghidra RMI Remote Code Execution Probe',
      category: 'Deserialization Exploit',
      severity: 'CRITICAL',
      anomalyScore: 99,
      mitreAttackTechnique: 'T1210 - Exploitation of Remote Services / T1584 - Compromise Infrastructure',
      mitreDefendTactic: 'Decoy Environment (D3-DE)',
      cveOrStandardReference: 'CVE-2021-44228 / NSA Deception Guideline',
      ruleTriggered: 'ANOMALY_RMI_OBJECT_REGISTRY_INJECTION_DETECTED',
      payloadFingerprint: 'SHA256: 4f98a1c87...e8103 (Java Serializable Payload BadAttributeValueExpException)',
      containmentEnforced: 'eBPF TCP SYN-DROP applied to /32 subnet; process sandbox quarantined in null netns.',
    },
    ja4Fingerprint: 't13d311200_000000000000_deadbeefcafe',
    clientAttestationStatus: 'MISSING_CLIENT_CERT',
    latencyMs: 12.4,
    rawPayloadSnippet: 'AC ED 00 05 73 72 00 32 67 68 69 64 72 61 2E 73 65 72 76 65 72 2E 47 65 74 53 65 72 76 65 72 49 6E 66 6F...',
    isSevered: true,
  },
  {
    id: 'conn-attempt-9902',
    timestamp: new Date(Date.now() - 95 * 1000).toISOString(),
    sourceIp: '10.14.88.19',
    sourcePort: 48992,
    sourceGeo: 'Fort Meade MD / Lab B4 Subnet',
    sourceAsnOrOrg: 'NSA Engineering Intranet (Compromised Workstation)',
    subnetClass: 'INTERNAL_INSIDER_LAB',
    targetEndpoint: 'avionics-pqc-tls.tactical:8443',
    targetPort: 8443,
    protocol: 'Legacy TLS 1.2 / RSA-2048',
    requestedCipherSuite: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (LEGACY_DOWNGRADE)',
    verdict: 'HONEYPOT_TRIPPED',
    honeypotDecoyHit: {
      honeypotId: 'ep-ifdl-8443',
      honeypotName: 'F-22 IFDL Tactical Key Broker TLS Decoy',
      decoyType: 'Decoy Liboqs TLS 1.3 Endpoint',
    },
    anomalySignature: {
      patternId: 'SIG-PQC-DOWNGRADE-01',
      name: 'Cryptographic Downgrade Attack (Quantum Stripping)',
      category: 'Quantum Downgrade',
      severity: 'CRITICAL',
      anomalyScore: 96,
      mitreAttackTechnique: 'T1557 - Adversary-in-the-Middle / T1553.004 - Subvert Trust Controls',
      mitreDefendTactic: 'Cryptographic Boundary Enforcement (D3-CBE)',
      cveOrStandardReference: 'CNSA 2.0 Advisory / NIST SP 800-207 Section 3.1',
      ruleTriggered: 'ZERO_TRUST_DENY_NON_LATTICE_CIPHER_OFFERED',
      payloadFingerprint: 'ClientHello cipher_suites length: 2 [0xC030, 0x009D] (No ML-KEM/FIPS 203 extension)',
      containmentEnforced: 'Immediate TLS Alert (handshake_failure: 40); internal analyst ticket auto-created; host credentials revoked.',
    },
    ja4Fingerprint: 't12d190800_c030009d_legacy_downgrade',
    clientAttestationStatus: 'DOWNGRADE_REJECTED',
    latencyMs: 1.8,
    rawPayloadSnippet: '16 03 01 00 f8 01 00 00 f4 03 03 a1 84 9b cc e2 ... [downgrade attempt stripped of ML-KEM-1024]',
    isSevered: true,
  },
  {
    id: 'conn-attempt-9903',
    timestamp: new Date(Date.now() - 150 * 1000).toISOString(),
    sourceIp: '172.18.4.12',
    sourcePort: 38204,
    sourceGeo: 'Nellis AFB / Tactical Test Range',
    sourceAsnOrOrg: 'USAF Air Combat Command / 422nd TES',
    subnetClass: 'TACTICAL_AVIONICS_MESH',
    targetEndpoint: 'f22-cip-gateway.node:443',
    targetPort: 443,
    protocol: 'TLS 1.3 / ML-KEM-1024',
    requestedCipherSuite: 'TLS_AES_256_GCM_SHA384_ML_KEM_1024_ML_DSA_87',
    verdict: 'ALLOWED_ZERO_TRUST',
    ja4Fingerprint: 't13d151600_13021301_fips203_kem1024_dsa87',
    clientAttestationStatus: 'VALID_FIPS204_ML_DSA',
    latencyMs: 3.1,
    rawPayloadSnippet: '16 03 03 04 20 01 00 04 1c 03 03 [NIST FIPS 204 ML-DSA-87 Validated Client Cert + TPM 2.0 PCR Quote]',
    isSevered: false,
  },
  {
    id: 'conn-attempt-9904',
    timestamp: new Date(Date.now() - 210 * 1000).toISOString(),
    sourceIp: '203.0.113.195',
    sourcePort: 60190,
    sourceGeo: 'St. Petersburg, RU / ASN 48281',
    sourceAsnOrOrg: 'State-Sponsored Recon Cluster (APT29 / Midnight Blizzard)',
    subnetClass: 'PUBLIC_INTERNET_SCANNER',
    targetEndpoint: 'canary-binary-download.nsa.gov:443',
    targetPort: 443,
    protocol: 'PQC API Gateway',
    requestedCipherSuite: 'TLS_AES_128_GCM_SHA256 (Missing Client Auth)',
    verdict: 'HONEYPOT_TRIPPED',
    honeypotDecoyHit: {
      honeypotId: 'hp-canary-binary-cnsa',
      honeypotName: 'Canary Binary Trap (CNSA-Quantum-Keyloader.elf)',
      decoyType: 'Cryptographically Watermarked Binary Decoy',
    },
    anomalySignature: {
      patternId: 'SIG-CANARY-HARVEST-44',
      name: 'Canary Decoy Binary Harvesting Reconnaissance',
      category: 'Canary File Tamper',
      severity: 'HIGH',
      anomalyScore: 91,
      mitreAttackTechnique: 'T1005 - Data from Local System / T1552 - Unsecured Credentials',
      mitreDefendTactic: 'Canary File / Decoy Asset (D3-CF)',
      cveOrStandardReference: 'MITRE D3FEND D3-CF / CISA Decoy Standard',
      ruleTriggered: 'CANARY_BINARY_DOWNLOAD_TRIPWIRE_TRIGGERED',
      payloadFingerprint: 'GET /downloads/canary_cnsa_mlkem_keyloader.elf HTTP/1.1 (Scraper Tool python-requests)',
      containmentEnforced: 'Delivered weaponized synthetic canary token with GPS/IP tracking beacons embedded.',
    },
    ja4Fingerprint: 't13d100400_13011302_scraper_python',
    clientAttestationStatus: 'MISSING_CLIENT_CERT',
    latencyMs: 142.6,
    rawPayloadSnippet: '47 45 54 20 2F 64 6F 77 6E 6C 6F 61 64 73 2F 63 61 6E 61 72 79 ... User-Agent: python-requests/2.31.0',
    isSevered: true,
  },
  {
    id: 'conn-attempt-9905',
    timestamp: new Date(Date.now() - 320 * 1000).toISOString(),
    sourceIp: '10.14.92.4',
    sourcePort: 51240,
    sourceGeo: 'Fort Meade MD / Directorate W3',
    sourceAsnOrOrg: 'Suspicious Insider Host (Revoked Hardware Token)',
    subnetClass: 'INTERNAL_INSIDER_LAB',
    targetEndpoint: 'sleigh-processor-repo.git:9418',
    targetPort: 9418,
    protocol: 'PQC API Gateway',
    requestedCipherSuite: 'TLS_AES_256_GCM_SHA384_ML_KEM_768',
    verdict: 'QUARANTINED_ANOMALOUS',
    anomalySignature: {
      patternId: 'SIG-INSIDER-REVOKED-02',
      name: 'Revoked Insider Hardware Token Replay',
      category: 'Tactical Impersonation',
      severity: 'CRITICAL',
      anomalyScore: 98,
      mitreAttackTechnique: 'T1078.004 - Valid Cloud/Internal Accounts / T1098 - Account Manipulation',
      mitreDefendTactic: 'Continuous Authorization Validation (D3-CAV)',
      cveOrStandardReference: 'DoD Zero Trust User Pillar Advancing Maturity',
      ruleTriggered: 'SUSPENDED_PERSONNEL_CREDENTIAL_REPLAY_TRAP',
      payloadFingerprint: 'TOKEN: NSA-OP-9014 (SPECTRE-LEAD) Quarantined in null netns',
      containmentEnforced: 'Session terminated immediately. eBPF netfilter zeroed connection; physical facility security alerted.',
    },
    ja4Fingerprint: 't13d220800_13021301_revoked_token',
    clientAttestationStatus: 'REVOKED_INSIDER_HARDWARE',
    latencyMs: 0.9,
    rawPayloadSnippet: 'POST /git-receive-pack HTTP/1.1 Authorization: Bearer eyJhbGciOiJNTC1EU0EtODci... [REVOKED]',
    isSevered: true,
  },
  {
    id: 'conn-attempt-9906',
    timestamp: new Date(Date.now() - 410 * 1000).toISOString(),
    sourceIp: '198.51.100.72',
    sourcePort: 49182,
    sourceGeo: 'Frankfurt DE / Hosted VPS',
    sourceAsnOrOrg: 'AS24940 / Hetzner Cloud',
    subnetClass: 'PUBLIC_INTERNET_SCANNER',
    targetEndpoint: 'pqc-cnsa-telemetry.mil.canary-token.local:53',
    targetPort: 53,
    protocol: 'DNS / Port 53 Egress',
    requestedCipherSuite: 'PLAINTEXT_UDP_DNS',
    verdict: 'HONEYPOT_TRIPPED',
    honeypotDecoyHit: {
      honeypotId: 'hp-dns-beacon',
      honeypotName: 'Network Egress Decoy Beacon Token',
      decoyType: 'Canary DNS Sinkhole',
    },
    anomalySignature: {
      patternId: 'SIG-DNS-EXFIL-07',
      name: 'Canary Domain Resolution Egress Attempt',
      category: 'Egress Exfiltration',
      severity: 'HIGH',
      anomalyScore: 94,
      mitreAttackTechnique: 'T1048 - Exfiltration Over Alternative Protocol / T1071 - Application Layer Protocol',
      mitreDefendTactic: 'Network Traffic Deception (D3-NTD)',
      ruleTriggered: 'DNS_EGRESS_CANARY_NAME_INTERCEPTED',
      payloadFingerprint: 'DNS QUERY: A? pqc-cnsa-telemetry.mil.canary-token.local (Query ID 0x3a4b)',
      containmentEnforced: 'DNS sinkhole returned bogus loopback IP (127.0.0.1); host workstation network interface disabled.',
    },
    ja4Fingerprint: 'u53d010100_dns_standard_query',
    clientAttestationStatus: 'MISSING_CLIENT_CERT',
    latencyMs: 38.2,
    rawPayloadSnippet: '3a 4b 01 00 00 01 00 00 00 00 00 00 08 70 71 63 2d 63 6e 73 61 ...',
    isSevered: true,
  },
  {
    id: 'conn-attempt-9907',
    timestamp: new Date(Date.now() - 530 * 1000).toISOString(),
    sourceIp: '172.18.6.99',
    sourcePort: 42100,
    sourceGeo: 'Edwards AFB / 412th Test Wing',
    sourceAsnOrOrg: 'USAF Avionics Cyber Security Laboratory',
    subnetClass: 'TACTICAL_AVIONICS_MESH',
    targetEndpoint: 'ifdl-bridge.tactical:8443',
    targetPort: 8443,
    protocol: 'Tactical IFDL LPI',
    requestedCipherSuite: 'IFDL_LPI_PQC_ML_KEM_768_CHACHA20_POLY1305',
    verdict: 'ALLOWED_ZERO_TRUST',
    ja4Fingerprint: 't13d181000_ifdl_lpi_pqc_attested',
    clientAttestationStatus: 'VALID_FIPS204_ML_DSA',
    latencyMs: 2.2,
    rawPayloadSnippet: '00 48 49 46 44 4c 20 54 41 43 54 49 43 41 4c 20 [Valid Avionics Cryptographic Handshake]',
    isSevered: false,
  },
];

export function getZeroTrustComplianceOverview(): ZeroTrustComplianceOverview {
  const total = INCOMING_CONNECTIONS.length;
  const allowed = INCOMING_CONNECTIONS.filter((c) => c.verdict === 'ALLOWED_ZERO_TRUST').length;
  const honeypotTrips = INCOMING_CONNECTIONS.filter((c) => c.verdict === 'HONEYPOT_TRIPPED').length;
  const quarantined = INCOMING_CONNECTIONS.filter((c) => c.verdict === 'QUARANTINED_ANOMALOUS').length;
  const severed = INCOMING_CONNECTIONS.filter((c) => c.isSevered).length;

  return {
    globalComplianceScore: 98.6,
    nistSp800207Alignment: 99.2,
    dodZta20Alignment: 98.4,
    cnsa20Readiness: 100.0,
    totalConnections24h: 38450 + total,
    allowedCount: 36980 + allowed,
    honeypotTrippedCount: 840 + honeypotTrips,
    quarantinedCount: 420 + quarantined,
    severedCount: 1260 + severed,
    continuousVerificationsSec: 18450,
    activeHoneypotsListening: 6,
    totalSignaturesCataloged: 48,
    lastAnomalyDetectedAt: INCOMING_CONNECTIONS[0]?.timestamp || new Date().toISOString(),
    pillarAuditScores: [
      {
        pillar: 'Identity',
        score: 100,
        status: 'HARDENED',
        description: 'Zero single-operator trust; 2-of-3 dual ML-DSA-87 attestation enforced for all credentials.',
      },
      {
        pillar: 'Device',
        score: 98,
        status: 'COMPLIANT',
        description: 'AMD SEV-SNP confidential microVM memory encryption with TPM 2.0 PCR hardware sealing.',
      },
      {
        pillar: 'Network',
        score: 99,
        status: 'HARDENED',
        description: 'Lateral movement severed; eBPF default-drop firewall; mTLS 1.3 with NIST FIPS 203 ML-KEM-1024.',
      },
      {
        pillar: 'Application',
        score: 97,
        status: 'COMPLIANT',
        description: 'Multi-Engine BFT Lifter Consensus (Rizin + angr + LLVM-MC) cross-verifying decompiler binaries.',
      },
      {
        pillar: 'Data',
        score: 100,
        status: 'HARDENED',
        description: 'Tamper-evident append-only Merkle ledger chained with quantum-resistant ML-DSA-87 signatures.',
      },
      {
        pillar: 'Visibility',
        score: 98,
        status: 'HARDENED',
        description: 'Decoy deception grid with 6 active honeypots, real-time eBPF socket monitoring & SIEM feed.',
      },
    ],
  };
}

export function getIncomingConnections(): IncomingConnectionAttempt[] {
  return INCOMING_CONNECTIONS;
}

export function simulateIncomingConnection(params: {
  scenario:
    | 'QUANTUM_DOWNGRADE_ATTEMPT'
    | 'GHIDRA_RMI_DESERIALIZATION'
    | 'LATTICE_MODULUS_POISONING'
    | 'CANARY_ELF_ACCESS'
    | 'VALID_ZERO_TRUST_MTLS'
    | 'SUSPICIOUS_INSIDER_PROBE';
  sourceIp?: string;
}): IncomingConnectionAttempt {
  const id = `conn-sim-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  let newConn: IncomingConnectionAttempt;

  switch (params.scenario) {
    case 'QUANTUM_DOWNGRADE_ATTEMPT':
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '198.51.100.114',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Geneva CH / Anonymous Gateway',
        sourceAsnOrOrg: 'AS13030 / Unknown Cyber Probe',
        subnetClass: 'PUBLIC_INTERNET_SCANNER',
        targetEndpoint: 'avionics-pqc-tls.tactical:8443',
        targetPort: 8443,
        protocol: 'Legacy TLS 1.2 / RSA-2048',
        requestedCipherSuite: 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (STRIPPED)',
        verdict: 'HONEYPOT_TRIPPED',
        honeypotDecoyHit: {
          honeypotId: 'ep-ifdl-8443',
          honeypotName: 'F-22 IFDL Tactical Key Broker TLS Decoy',
          decoyType: 'Decoy Liboqs TLS 1.3 Endpoint',
        },
        anomalySignature: {
          patternId: 'SIG-PQC-DOWNGRADE-01',
          name: 'Quantum-Stripping Protocol Downgrade Probe',
          category: 'Quantum Downgrade',
          severity: 'CRITICAL',
          anomalyScore: 97,
          mitreAttackTechnique: 'T1557 - Adversary-in-the-Middle',
          mitreDefendTactic: 'Cryptographic Boundary Enforcement (D3-CBE)',
          ruleTriggered: 'STRICT_ZERO_TRUST_PQC_ENFORCEMENT_VIOLATION',
          payloadFingerprint: 'ClientHello cipher_suites: [0xC030, 0x009D] (No ML-KEM extension)',
          containmentEnforced: 'Handshake rejected; source IP added to eBPF dynamic blocklist.',
        },
        ja4Fingerprint: 't12d190800_c030009d_sim_downgrade',
        clientAttestationStatus: 'DOWNGRADE_REJECTED',
        latencyMs: 14.2,
        rawPayloadSnippet: '16 03 01 00 ec 01 00 00 e8 03 03 [SIMULATED CLIENT HELLO WITHOUT PQC EXTENSIONS]',
        isSevered: true,
      };
      break;

    case 'GHIDRA_RMI_DESERIALIZATION':
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '203.0.113.201',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Bucharest RO / Bulletproof Hosting',
        sourceAsnOrOrg: 'AS9009 / Threat Actor Infrastructure',
        subnetClass: 'PUBLIC_INTERNET_SCANNER',
        targetEndpoint: 'ghidra-c2-decoy.internal:13100',
        targetPort: 13100,
        protocol: 'Java RMI / Decoy Registry',
        requestedCipherSuite: 'PLAINTEXT_TCP_RMI',
        verdict: 'HONEYPOT_TRIPPED',
        honeypotDecoyHit: {
          honeypotId: 'hp-rmi-decoy',
          honeypotName: 'Ghidra Server Java RMI Decoy Listener',
          decoyType: 'High-Interaction Deserialization Decoy',
        },
        anomalySignature: {
          patternId: 'SIG-RMI-DESER-901',
          name: 'Java RMI Exploit / Deserialization Gadget Probe',
          category: 'Deserialization Exploit',
          severity: 'CRITICAL',
          anomalyScore: 99,
          mitreAttackTechnique: 'T1210 - Exploitation of Remote Services',
          mitreDefendTactic: 'Decoy Environment (D3-DE)',
          ruleTriggered: 'ANOMALY_RMI_DESERIALIZATION_SIGNATURE',
          payloadFingerprint: 'SHA256: 7a88b12...ec9 (CommonsCollections / YsoSerial gadget payload)',
          containmentEnforced: 'Connection dropped inside null netns; memory core dumped for attribution.',
        },
        ja4Fingerprint: 't13d311200_java_rmi_probe',
        clientAttestationStatus: 'MISSING_CLIENT_CERT',
        latencyMs: 24.8,
        rawPayloadSnippet: 'AC ED 00 05 73 72 00 1F 6F 72 67 2E 61 70 61 63 68 65 ... [Exploit Payload]',
        isSevered: true,
      };
      break;

    case 'LATTICE_MODULUS_POISONING':
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '10.14.88.42',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Fort Meade MD / Lab B4 Subnet',
        sourceAsnOrOrg: 'Compromised Workstation (Internal Insider)',
        subnetClass: 'INTERNAL_INSIDER_LAB',
        targetEndpoint: 'key-attestation-service.mil:443',
        targetPort: 443,
        protocol: 'TLS 1.3 / ML-KEM-1024',
        requestedCipherSuite: 'TLS_AES_256_GCM_SHA384_ML_KEM_1024',
        verdict: 'QUARANTINED_ANOMALOUS',
        anomalySignature: {
          patternId: 'SIG-LATTICE-POISON-02',
          name: 'Lattice Modulus Mathematical Fault Injection',
          category: 'Lattice Parameter Poisoning',
          severity: 'CRITICAL',
          anomalyScore: 98,
          mitreAttackTechnique: 'T1553.004 - Subvert Trust Controls / T1554 - Compromise Binary',
          mitreDefendTactic: 'Mathematical Parameter Verification (D3-MPV)',
          ruleTriggered: 'NIST_FIPS203_MODULUS_Q3329_TAMPER_DETECTED',
          payloadFingerprint: 'q = 3328 (Faulty Prime Ring Modulus injected to bypass LWE hardness)',
          containmentEnforced: 'BFT consensus rejected transaction; operator cryptographic token suspended.',
        },
        ja4Fingerprint: 't13d151600_faulty_lattice_probe',
        clientAttestationStatus: 'FORGED_ATTRIBUTION_TOKEN',
        latencyMs: 1.1,
        rawPayloadSnippet: '00 03 33 28 FF AA [Malformed Polynomial Coefficient Matrix with weak noise distribution]',
        isSevered: true,
      };
      break;

    case 'CANARY_ELF_ACCESS':
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '198.51.100.220',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Stockholm SE / VPN Gateway',
        sourceAsnOrOrg: 'AS4455 / Anonymous Scanner Cluster',
        subnetClass: 'PUBLIC_INTERNET_SCANNER',
        targetEndpoint: 'canary-files.vault.internal:443',
        targetPort: 443,
        protocol: 'PQC API Gateway',
        requestedCipherSuite: 'TLS_AES_256_GCM_SHA384',
        verdict: 'HONEYPOT_TRIPPED',
        honeypotDecoyHit: {
          honeypotId: 'hp-canary-binary-cnsa',
          honeypotName: 'Canary Binary Trap (CNSA-Quantum-Keyloader.elf)',
          decoyType: 'Decoy Binary Honeyfile',
        },
        anomalySignature: {
          patternId: 'SIG-CANARY-HARVEST-44',
          name: 'Decoy Honeyfile Extraction Attempt',
          category: 'Canary File Tamper',
          severity: 'HIGH',
          anomalyScore: 92,
          mitreAttackTechnique: 'T1005 - Data from Local System',
          mitreDefendTactic: 'Canary File / Decoy Asset (D3-CF)',
          ruleTriggered: 'CANARY_FILE_READ_EVENT_TRIPPED',
          payloadFingerprint: 'SHA256: 8842...mldsa (Access to planted /var/ghidra/analysis_queue/cnsa_keyloader.elf)',
          containmentEnforced: 'Delivered watermarked fake keyloader; triggered automated forensic trace.',
        },
        ja4Fingerprint: 't13d100400_scraper_probe',
        clientAttestationStatus: 'MISSING_CLIENT_CERT',
        latencyMs: 31.5,
        rawPayloadSnippet: 'GET /api/v1/binaries/cnsa_topsecret_mlkem_keyloader.elf HTTP/1.1',
        isSevered: true,
      };
      break;

    case 'SUSPICIOUS_INSIDER_PROBE':
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '10.14.88.99',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Fort Meade MD / Operations Annex',
        sourceAsnOrOrg: 'Suspicious Analyst Session (Untrusted Device)',
        subnetClass: 'INTERNAL_INSIDER_LAB',
        targetEndpoint: 'ghidra-server-admin.local:13101',
        targetPort: 13101,
        protocol: 'Java RMI / Decoy Registry',
        requestedCipherSuite: 'PLAINTEXT_TCP_RMI',
        verdict: 'QUARANTINED_ANOMALOUS',
        anomalySignature: {
          patternId: 'SIG-INSIDER-PROBE-88',
          name: 'Unauthorized Internal Port Scan on Deception Grid',
          category: 'Deserialization Exploit',
          severity: 'HIGH',
          anomalyScore: 89,
          mitreAttackTechnique: 'T1046 - Network Service Discovery',
          mitreDefendTactic: 'Decoy Environment (D3-DE)',
          ruleTriggered: 'LATERAL_MOVEMENT_SWEEP_DETECTED_BY_EBPF',
          payloadFingerprint: 'Rapid SYN scan across ports 13100, 13101, 13102 from unapproved subnet',
          containmentEnforced: 'Workstation network port shut down via 802.1X; investigator dispatched.',
        },
        ja4Fingerprint: 't13d090100_syn_scanner',
        clientAttestationStatus: 'REVOKED_INSIDER_HARDWARE',
        latencyMs: 0.6,
        rawPayloadSnippet: 'TCP SYN -> 13101 [No valid Zero-Trust mutual handshake initiated]',
        isSevered: true,
      };
      break;

    case 'VALID_ZERO_TRUST_MTLS':
    default:
      newConn = {
        id,
        timestamp: now,
        sourceIp: params.sourceIp || '172.18.12.80',
        sourcePort: Math.floor(40000 + Math.random() * 20000),
        sourceGeo: 'Langley VA / Validated Node',
        sourceAsnOrOrg: 'US Defense Authenticated Peer',
        subnetClass: 'TACTICAL_AVIONICS_MESH',
        targetEndpoint: 'api-gateway.zero-trust.mil:443',
        targetPort: 443,
        protocol: 'TLS 1.3 / ML-KEM-1024',
        requestedCipherSuite: 'TLS_AES_256_GCM_SHA384_ML_KEM_1024_ML_DSA_87',
        verdict: 'ALLOWED_ZERO_TRUST',
        ja4Fingerprint: 't13d151600_13021301_fips203_kem1024_dsa87',
        clientAttestationStatus: 'VALID_FIPS204_ML_DSA',
        latencyMs: 2.4,
        rawPayloadSnippet: '16 03 03 [Valid Mutual TLS 1.3 Handshake - All Zero Trust Policies Satisfied]',
        isSevered: false,
      };
      break;
  }

  INCOMING_CONNECTIONS.unshift(newConn);
  if (INCOMING_CONNECTIONS.length > 100) {
    INCOMING_CONNECTIONS.pop();
  }
  return newConn;
}

export function severConnection(connId: string): { success: boolean; connection?: IncomingConnectionAttempt } {
  const conn = INCOMING_CONNECTIONS.find((c) => c.id === connId);
  if (!conn) return { success: false };

  conn.isSevered = true;
  conn.verdict = 'SEVERED_BLOCKED';
  return { success: true, connection: conn };
}

export function clearQuarantineAction(): { success: boolean; count: number } {
  let cleared = 0;
  INCOMING_CONNECTIONS.forEach((c) => {
    if (c.verdict === 'QUARANTINED_ANOMALOUS') {
      c.verdict = 'SEVERED_BLOCKED';
      c.isSevered = true;
      cleared++;
    }
  });
  return { success: true, count: cleared };
}
