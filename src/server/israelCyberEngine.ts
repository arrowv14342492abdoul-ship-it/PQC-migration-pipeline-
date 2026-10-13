import {
  IsraelCyberRepository,
  CdmControlItem,
  CertIlThreatAlert,
  TraceeEbpfEvent,
} from '../types/israelCyberSoftware.js';

export const ISRAEL_CYBER_REPOSITORIES: IsraelCyberRepository[] = [
  {
    id: 'cdm-methodology',
    name: 'INCD Cyber Defense Methodology (CDM 2.0)',
    repoName: 'cyber-israel/cyber-defense-methodology',
    githubUrl: 'https://github.com/cyber-israel/cyber-defense-methodology',
    description:
      'The official sovereign cyber defense methodology published by the Israel National Cyber Directorate (INCD). Defines rigorous baseline controls, zero-trust network architectures, and post-quantum cryptographic transitions for government and critical infrastructure.',
    category: 'National Cyber Defense',
    stars: 3800,
    forks: 590,
    license: 'Apache-2.0',
    primaryLanguage: 'JSON / Markdown / Python',
    status: 'Official Sovereign',
    officialTagline: 'INCD Sovereign Defense Methodology for national resilience & zero-trust compliance',
    keyFeatures: [
      'Layered defense matrices for Enterprise, Healthcare, and Critical Infrastructure',
      'Zero-Trust Architecture (ZTA) enforcement across Purdue OT layers',
      'Automated compliance audit scripts evaluating cryptographic posture',
      'Post-Quantum Cryptography transition timelines harmonized with NIST FIPS 203',
      'Integration with national CERT-IL incident dispatch protocols',
    ],
    architectureOverview:
      'Structured policy model compiling security controls into automated machine-readable JSON schemas and CLI audit scripts for continuous posture verification.',
    quickStartCommands: {
      clone: 'git clone https://github.com/cyber-israel/cyber-defense-methodology.git',
      docker: 'docker run -it --rm cyberisrael/cdm-checker:latest --audit-all',
      run: 'python3 -m cdm_auditor --level national-critical --enforce-pqc',
    },
    incdRole:
      'The foundational standard guiding all Israeli sovereign agencies, defense contractors, and critical utility operators.',
    documentationUrl: 'https://www.gov.il/en/departments/israel_national_cyber_directorate',
  },
  {
    id: 'cert-il-stix',
    name: 'CERT-IL Threat Intelligence Feed (STIX/TAXII)',
    repoName: 'cyber-israel/cert-il-threat-sharing',
    githubUrl: 'https://github.com/cyber-israel/cert-il-threat-sharing',
    description:
      'Automated cyber threat intelligence integration hub from the Israel Computer Emergency Response Team (CERT-IL). Dispatches real-time indicator feeds (STIX 2.1), state-sponsored adversary tracking, and emergency mitigation advisories.',
    category: 'Threat Intelligence & CERT',
    stars: 2900,
    forks: 410,
    license: 'Apache-2.0',
    primaryLanguage: 'Python / Go',
    status: 'Official Sovereign',
    officialTagline: 'National Computer Emergency Response Team real-time threat sharing engine',
    keyFeatures: [
      'Automated TAXII 2.1 push/pull client for real-time IoC distribution',
      'Dedicated indicators tracking Middle East state-sponsored advanced persistent threats (APTs)',
      'Forensic YARA rules and Sigma detection logic for adversary tactics',
      'Harvest-Now-Decrypt-Later (HNDL) reconnaissance alerts targeting critical infrastructure',
    ],
    architectureOverview:
      'Event-driven streaming connector translating national sensor telemetry into STIX 2.1 bundles distributed over TLS 1.3 with dual-hybrid PQC authentication.',
    quickStartCommands: {
      clone: 'git clone https://github.com/cyber-israel/cert-il-threat-sharing.git',
      docker: 'docker run -d -p 9000:9000 certil/taxii-gateway:latest',
      run: 'python3 cert_il_client.py --subscribe national-feed --filter critical',
    },
    incdRole:
      'Coordinates national defense alerts and rapid containment across Israeli critical sectors.',
  },
  {
    id: 'tracee-ebpf',
    name: 'Tracee (eBPF Kernel Runtime Security)',
    repoName: 'aquasecurity/tracee',
    githubUrl: 'https://github.com/aquasecurity/tracee',
    description:
      'Advanced Linux kernel runtime security and forensics engine utilizing eBPF to trace system calls and detect anomalous behavior in real time, developed in Tel Aviv by Israeli cybersecurity pioneers.',
    category: 'Runtime eBPF Security',
    stars: 12400,
    forks: 1100,
    license: 'Apache-2.0',
    primaryLanguage: 'Go / C (eBPF)',
    status: 'Flagship',
    officialTagline: 'Kernel-level runtime security and behavioral analysis powered by eBPF',
    keyFeatures: [
      'Zero-overhead kernel probe instrumentation without kernel module compilation',
      'Detection of fileless memory execution, rootkits, and unauthorized crypto key extraction',
      'Signature-based and behavioral heuristic engine (Rego / OPA policy evaluation)',
      'Forensic event capture streaming directly to SIEMs via gRPC and JSON lines',
    ],
    architectureOverview:
      'eBPF bytecode programs loaded into kernel space via libbpf, filtering low-level tracepoints and transmitting high-assurance telemetry into a Go userspace daemon.',
    quickStartCommands: {
      clone: 'git clone https://github.com/aquasecurity/tracee.git',
      docker: 'docker run --name tracee --rm --privileged -v /lib/modules/:/lib/modules/:ro aquasec/tracee:latest',
      run: 'make build && sudo ./bin/tracee --output json',
    },
    incdRole:
      'Deployed on national cloud nodes and sovereign servers to detect micro-architectural memory inspection and kernel tampering.',
  },
  {
    id: 'kics-iac',
    name: 'KICS (Keeping Infrastructure as Code Secure)',
    repoName: 'Checkmarx/kics',
    githubUrl: 'https://github.com/Checkmarx/kics',
    description:
      'Open-source static analysis engine for Infrastructure as Code (IaC) detecting security vulnerabilities, compliance gaps, and crypto misconfigurations across Terraform, Kubernetes, Dockerfile, and CloudFormation.',
    category: 'IaC & Compliance',
    stars: 6700,
    forks: 690,
    license: 'Apache-2.0',
    primaryLanguage: 'Go',
    status: 'Flagship',
    officialTagline: 'Automated Infrastructure as Code static analysis and posture validation',
    keyFeatures: [
      'Over 2,500+ built-in security queries written in Open Policy Agent (Rego)',
      'Detects unencrypted S3 storage, weak TLS versions, and non-PQC ciphersuites in cloud templates',
      'Automated remediation suggestions with inline JSON/YAML diff generation',
      'Seamless CI/CD pipeline integration with zero false-positive tuning',
    ],
    architectureOverview:
      'High-speed Go parser constructing unified ASTs from cloud deployment manifests, evaluated against Rego rules using an embedded OPA engine.',
    quickStartCommands: {
      clone: 'git clone https://github.com/Checkmarx/kics.git',
      docker: 'docker run -v $(pwd):/path checkmarx/kics:latest scan -p /path',
      run: 'kics scan -p . --report-formats json,sarif',
    },
    incdRole:
      'Enforces mandatory pre-deployment infrastructure audits across government cloud environments (Project Nimbus).',
  },
  {
    id: 'scada-shield-il',
    name: 'INCD OT/SCADA Shield & ICS Sentinel',
    repoName: 'cyber-israel/scada-ics-shield',
    githubUrl: 'https://github.com/cyber-israel/scada-ics-shield',
    description:
      'Operational Technology (OT) and SCADA defensive verification framework developed under INCD guidelines to safeguard national water grids (Mekorot), electricity generation, and port automation systems.',
    category: 'ICS & Critical Infrastructure',
    stars: 2100,
    forks: 320,
    license: 'Apache-2.0',
    primaryLanguage: 'Python / C',
    status: 'Official Sovereign',
    officialTagline: 'Industrial Control Systems (ICS) sovereign intrusion detection & protocol verification',
    keyFeatures: [
      'Deep packet inspection (DPI) for Modbus-TCP, DNP3, and IEC 60870-5-104 protocols',
      'Anomaly detection on PLC coil write limits preventing physical equipment damage',
      'Unidirectional air-gap optical data diode software stack',
      'Hybrid Post-Quantum TLS wrapper securing remote RTU telemetry channels',
    ],
    architectureOverview:
      'Passive network tap sniffer running zero-overhead protocol decoders, flagging unauthorized PLC firmware uploads and protocol anomalies.',
    quickStartCommands: {
      clone: 'git clone https://github.com/cyber-israel/scada-ics-shield.git',
      docker: 'docker run -d --net=host incd/scada-shield:latest',
      run: 'python3 -m scada_shield --interface eth1 --profile water-utility',
    },
    incdRole:
      'Directly safeguards Israel\'s national critical infrastructure against nation-state kinetic cyber attacks.',
  },
  {
    id: 'pqc-lattice-israel',
    name: 'Technion & Weizmann Post-Quantum Lattice Suite',
    repoName: 'cyber-israel/israel-pqc-lattice',
    githubUrl: 'https://github.com/cyber-israel/israel-pqc-lattice',
    description:
      'High-performance post-quantum cryptographic benchmark and implementation suite developed by Israeli academic and defense cryptographers, specializing in Module-LWE optimizations and side-channel hardening.',
    category: 'Post-Quantum Research',
    stars: 1850,
    forks: 240,
    license: 'Apache-2.0',
    primaryLanguage: 'Rust / C++ / Python',
    status: 'Active',
    officialTagline: 'Sovereign lattice-based post-quantum cryptographic acceleration & formal verification',
    keyFeatures: [
      'Constant-time AVX-512 and ARM Neon vectorized Number Theoretic Transform (NTT)',
      'Formal mathematical verification of ML-KEM-768 polynomial multiplication routines',
      'Side-channel resistance testing against power-analysis and electromagnetic leakage',
      'Zero-knowledge post-quantum proof integration for privacy-preserving sovereign identity',
    ],
    architectureOverview:
      'Assembly-optimized mathematical kernels wrapped in safe Rust interfaces, with automated constant-time verification tooling.',
    quickStartCommands: {
      clone: 'git clone https://github.com/cyber-israel/israel-pqc-lattice.git',
      run: 'cargo test --release -- --nocapture',
    },
    incdRole:
      'Informs the national cryptographic transition strategy to replace classical RSA/ECC across government backbones before 2030.',
  },
];

export const SAMPLE_CDM_CONTROLS: CdmControlItem[] = [
  {
    id: 'CDM-CRYPTO-01',
    domain: 'Cryptography & Data Protection',
    title: 'Post-Quantum Hybrid TLS Transition Mandate',
    description:
      'All government endpoints and critical infrastructure telemetry gateways must enforce hybrid key exchange combining X25519 with NIST FIPS 203 ML-KEM-768.',
    status: 'IN_PROGRESS',
    pqcRelevance: 'Mitigates Harvest Now Decrypt Later (HNDL) data retention risks across sovereign links.',
    remediationSnippet: `# INCD CDM 2.0 Compliance Wrapper: Hybrid Post-Quantum Session
import oqs
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

def establish_incd_compliant_session(client_mlkem_pub):
    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
        pqc_ciphertext, shared_secret = kem.encap_secret(client_mlkem_pub)
    return pqc_ciphertext, shared_secret`,
  },
  {
    id: 'CDM-ZTA-02',
    domain: 'Network & Perimeter Architecture',
    title: 'Zero-Trust Purdue Model Layer 3 Partitioning',
    description:
      'Industrial SCADA control systems must be logically and cryptographically partitioned from corporate enterprise networks using unidirectional gateways.',
    status: 'IMPLEMENTED',
    pqcRelevance: 'Prevents lateral pivot from enterprise workstations into critical national infrastructure.',
    remediationSnippet: `# INCD Unidirectional Gateway Validation
iptables -A FORWARD -s 192.168.10.0/24 -d 10.0.0.0/8 -j DROP
sysctl -w net.ipv4.ip_forward=0`,
  },
  {
    id: 'CDM-ID-03',
    domain: 'Identity & Authentication',
    title: 'Hardware Token FIPS 140-3 Level 3 Multi-Factor Authentication',
    description:
      'Privileged administrator access to sovereign systems requires cryptographic hardware keys with quantum-resilient signatures (ML-DSA-65).',
    status: 'IMPLEMENTED',
    pqcRelevance: 'Eliminates credential harvesting and session hijacking attacks.',
    remediationSnippet: `# Enforce FIPS 204 ML-DSA-65 SSH Authentication
Host sovereign-defense-bastion
  PubkeyAcceptedKeyTypes ml-dsa-65,sk-ssh-ed25519@openssh.com
  IdentityFile ~/.ssh/id_mldsa65`,
  },
  {
    id: 'CDM-DET-04',
    domain: 'Incident Detection & Response',
    title: 'Automated CERT-IL TAXII Feed Synchronization',
    description:
      'Continuous automated ingestion of CERT-IL threat indicator feeds and real-time DNS sinkholing of state-sponsored C2 domains.',
    status: 'IMPLEMENTED',
    pqcRelevance: 'Provides sub-second defense against newly observed adversary infrastructure.',
    remediationSnippet: `# CERT-IL Automated Feed Ingestion Routine
taxii-client pull --collection cert-il-critical --output /etc/suricata/rules/cert-il.rules
suricata-update --reload-rules`,
  },
];

export const SAMPLE_CERT_IL_ALERTS: CertIlThreatAlert[] = [
  {
    id: 'ALERT-IL-2026-104',
    code: 'CERT-IL-CRIT-2026-092',
    severity: 'CRITICAL',
    title: 'State-Sponsored Harvesting Campaign Targeting National Water & Energy SCADA',
    targetSector: 'Water Supply (Mekorot) & National Electrical Grid',
    date: '2026-10-10',
    mitreTactic: 'TA0001: Initial Access / TA0009: Collection',
    description:
      'CERT-IL telemetry detected coordinated probing on edge Modbus routers attempting to establish prolonged encrypted sessions to harvest SCADA telemetry for offline cryptanalysis.',
    mitigation:
      'Immediately isolate exposed Modbus ports, rotate legacy RSA certificates, and enable INCD SCADA-Shield with hybrid ML-KEM-768 encryption.',
    iocs: [
      '185.190.141.22 (C2 Node)',
      'water-gateway-update.me (Spoofed Domain)',
      'SHA256: 7d1b32948e9a1120fcf9581a8b54f9a0c12848123910cdae1982bfe1204859a1',
    ],
    quantumRisk: 'Targeting legacy RSA-2048 handshake data for eventual decryption once CRQC becomes operational.',
  },
  {
    id: 'ALERT-IL-2026-103',
    code: 'CERT-IL-HIGH-2026-088',
    severity: 'HIGH',
    title: 'Supply Chain Compromise Attempt on Defense Cloud CI/CD Pipelines',
    targetSector: 'Aerospace & Defense Industrial Base',
    date: '2026-10-08',
    mitreTactic: 'TA0002: Execution / TA0005: Defense Evasion',
    description:
      'Adversary attempting to inject malicious build actions into Kubernetes deployment manifests. Flagged by KICS IaC scanner.',
    mitigation:
      'Enforce cryptographic binary signing with ML-DSA-87 and run automated KICS policy enforcement prior to container registry push.',
    iocs: [
      '194.26.29.110 (Exfiltration IP)',
      'malicious-k8s-hook.internal-cloud.net',
    ],
    quantumRisk: 'Classical ECDSA secp256r1 build signatures at risk of quantum signature forgery.',
  },
];

export const SAMPLE_TRACEE_EVENTS: TraceeEbpfEvent[] = [
  {
    id: 'trc-001',
    timestamp: '19:44:02.148',
    processName: 'scada_collector',
    syscall: 'sys_enter_connect',
    probeType: 'tracepoint',
    description: 'Outbound TCP connection to authorized Purdue Layer 3 SCADA gateway 10.0.4.15:8443',
    verdict: 'VERIFIED',
    cryptoPrimitive: 'X25519_MLKEM768 (NIST FIPS 203)',
  },
  {
    id: 'trc-002',
    timestamp: '19:44:02.215',
    processName: 'unknown_daemon',
    syscall: 'sys_enter_ptrace',
    probeType: 'kprobe',
    description: 'Suspicious memory inspection targeting crypto private key buffer in openssl process memory',
    verdict: 'BLOCKED',
    cryptoPrimitive: 'Blocked Non-Zero Memory Extraction',
  },
  {
    id: 'trc-003',
    timestamp: '19:44:02.390',
    processName: 'incd_pqc_gateway',
    syscall: 'sys_enter_bpf',
    probeType: 'raw_syscall',
    description: 'Loaded verifiable eBPF packet filter checking Modbus coil write constraints',
    verdict: 'VERIFIED',
    cryptoPrimitive: 'INCD OT Shield Rule #88',
  },
];
