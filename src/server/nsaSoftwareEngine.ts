import type {
  NSARepository,
  GhidraAnalysisResult,
  WalkoffPlaybook,
  GhidraHoneypot,
  HoneypotTelemetryEvent,
  GhidraCompromiseHardeningStatus,
  ZeroTrustPillarControl,
  CompromisedPersonnelRecord,
  TwoPersonAuthorizationRequest,
  ZeroTrustGlobalStatus,
} from '../types/nsaSoftware.ts';

export const NSA_REPOSITORIES: NSARepository[] = [
  {
    id: 'ghidra',
    name: 'Ghidra',
    repoName: 'NationalSecurityAgency/ghidra',
    githubUrl: 'https://github.com/NationalSecurityAgency/ghidra',
    description:
      'A software reverse engineering (SRE) suite of tools developed by NSA Research Directorate. Includes disassembler, decompiler, scriptable Java/Python API, graph views, and headless analyzer.',
    category: 'Reverse Engineering',
    stars: 54200,
    forks: 6100,
    license: 'Apache-2.0',
    primaryLanguage: 'Java / C++',
    status: 'Flagship',
    officialTagline: 'NSA Research Directorate flagship Software Reverse Engineering framework',
    keyFeatures: [
      'Industrial-grade decompiler targeting x86, ARM, RISC-V, MIPS, PowerPC',
      'P-Code Intermediate Representation for processor-agnostic analysis',
      'Headless Analyzer batch automation via CLI and Docker',
      'Extensible Java and Python scripting engine for plugin development',
      'Multi-user collaborative code analysis server (Ghidra Server)',
    ],
    architectureOverview:
      'Modular client-server architecture built on a high-speed SLED specification language for processor decoding, transforming machine opcodes into P-Code micro-operations for SSA decompilation.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/ghidra.git',
      docker: 'docker run -it --rm -v $(pwd):/workspace ghidra/headless:latest',
      build: 'gradle --init-script gradle/support/fetchDependencies.gradle prepDev && gradle buildGhidra',
    },
    cnsaRelevance:
      'Critical for auditing legacy defense firmware binaries to identify hardcoded RSA/ECC keys and verifying post-quantum ML-KEM/ML-DSA assembly implementations.',
    documentationUrl: 'https://ghidra-sre.org',
  },
  {
    id: 'nifi',
    name: 'Apache NiFi (NiagaraFiles)',
    repoName: 'apache/nifi',
    githubUrl: 'https://github.com/apache/nifi',
    description:
      'High-performance data ingestion, routing, transformation, and lineage system originally developed by NSA under project name "NiagaraFiles" and transferred to the Apache Software Foundation.',
    category: 'Data Streaming & ETL',
    stars: 5200,
    forks: 3100,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Flagship',
    officialTagline: 'Enterprise-scale data logistics and interactive flow-based data routing',
    keyFeatures: [
      'Flow-based visual visual UI for configuring real-time telemetry routing',
      'Guaranteed delivery and backpressure buffering across air-gapped zones',
      'Fine-grained provenance and full forensic data history tracking',
      'Zero-trust cryptographic transit encryption and role-based policies',
    ],
    architectureOverview:
      'Zero-master distributed architecture using flowfile repository, content repository, and provenance repository for non-volatile streaming ingestion.',
    quickStartCommands: {
      clone: 'git clone https://github.com/apache/nifi.git',
      docker: 'docker run --name nifi -p 8443:8443 -d apache/nifi:latest',
      build: 'mvn clean install -DskipTests',
    },
    cnsaRelevance:
      'Serves as the high-throughput pipeline moving cryptographic audit logs and telemetry from distributed defense sensors to central SIEMs.',
    documentationUrl: 'https://nifi.apache.org',
  },
  {
    id: 'walkoff',
    name: 'WALKOFF',
    repoName: 'NationalSecurityAgency/WALKOFF',
    githubUrl: 'https://github.com/NationalSecurityAgency/WALKOFF',
    description:
      'A flexible cybersecurity orchestration, automation, and response (SOAR) architecture developed by NSA to automate incident response workflows and threat containment.',
    category: 'SOAR & Automation',
    stars: 2800,
    forks: 480,
    license: 'Apache-2.0',
    primaryLanguage: 'Python / TypeScript',
    status: 'Active',
    officialTagline: 'Open-source Security Orchestration, Automation, and Response (SOAR)',
    keyFeatures: [
      'Visual drag-and-drop playbook workflow authoring',
      'App execution engine connecting firewalls, EDRs, and analyzers',
      'Standardized Common Action Format for cross-vendor interoperability',
      'Role-based access control and encrypted secret store',
    ],
    architectureOverview:
      'Microservices-based workflow orchestrator using Celery workers, Redis message bus, and REST API for high-velocity incident response automation.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/WALKOFF.git',
      docker: 'docker-compose up -d',
      build: 'pip install -r requirements.txt',
    },
    cnsaRelevance:
      'Automates detection of quantum-harvesting anomalies and orchestrates instant certificate revocation when classical crypto deprecation deadlines pass.',
  },
  {
    id: 'timely',
    name: 'Timely',
    repoName: 'NationalSecurityAgency/timely',
    githubUrl: 'https://github.com/NationalSecurityAgency/timely',
    description:
      'Secure, high-throughput time-series database engine based on Apache Accumulo and Grafana, created by NSA to monitor massive classified network telemetry with cell-level security.',
    category: 'Time-Series & Big Data',
    stars: 1250,
    forks: 190,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Active',
    officialTagline: 'High-volume time series metric store built with NSA cell-level security',
    keyFeatures: [
      'Fine-grained cell-level security labeling inheriting Accumulo authorizations',
      'Multi-tenant metric ingestion handling millions of metrics per second',
      'Direct Grafana integration and OpenTSDB protocol compatibility',
      'Automated rollups, downsampling, and long-term analytical retention',
    ],
    architectureOverview:
      'Built atop Apache Accumulo distributed key-value store, utilizing custom iterators to aggregate time-series slices at the tablet server level.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/timely.git',
      docker: 'docker run -p 4242:4242 nsa/timely:latest',
      build: 'mvn clean package',
    },
    cnsaRelevance:
      'Stores high-frequency sensor readings from OT/ICS power grids and nuclear sites to detect microscopic voltage and timing side-channel deviations.',
  },
  {
    id: 'lemondrop',
    name: 'Lemondrop',
    repoName: 'NationalSecurityAgency/lemondrop',
    githubUrl: 'https://github.com/NationalSecurityAgency/lemondrop',
    description:
      'Matrix-based graph analytics and network characterization framework for big-data graph processing developed by NSA cryptanalysts and mathematicians.',
    category: 'Graph Analytics',
    stars: 760,
    forks: 110,
    license: 'Apache-2.0',
    primaryLanguage: 'Python / C++',
    status: 'Maintained',
    officialTagline: 'Matrix-oriented graph analysis framework for complex networks',
    keyFeatures: [
      'Spectral graph analysis and eigenvalue matrix decomposition',
      'Large-scale cluster detection in sparse bipartite networks',
      'Optimized sparse matrix multiplication for threat actor attribution',
    ],
    architectureOverview:
      'High-performance linear algebra engine utilizing BLAS/LAPACK to compute path connectivity across massive entity networks.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/lemondrop.git',
      build: 'python setup.py install',
    },
    cnsaRelevance:
      'Analyzes cryptographic trust webs and certificates to map out transitive reliance on vulnerable root CAs.',
  },
  {
    id: 'simp',
    name: 'SIMP (System Integrity Management Platform)',
    repoName: 'NationalSecurityAgency/SIMP',
    githubUrl: 'https://github.com/NationalSecurityAgency/SIMP',
    description:
      'Puppet-based infrastructure compliance automation framework designed to configure Red Hat Enterprise Linux / CentOS systems to pass DISA STIG and NIST SP 800-53 benchmarks.',
    category: 'Compliance & Hardening',
    stars: 1420,
    forks: 310,
    license: 'Apache-2.0',
    primaryLanguage: 'Ruby / Puppet',
    status: 'Active',
    officialTagline: 'Automated DISA STIG and NIST SP 800-53 compliance and host hardening',
    keyFeatures: [
      'Turnkey DISA STIG compliance profiles for enterprise Linux',
      'SELinux mandatory access control policy automation',
      'AIDE file integrity monitoring and auditd log consolidation',
      'Automated crypto policy setting (FIPS 140-3 enforcement mode)',
    ],
    architectureOverview:
      'Collection of modular Puppet classes and hiera data hierarchies orchestrating iptables, pam, sshd, rsyslog, and crypto policies.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/SIMP.git',
      docker: 'docker pull simp/simp-core:latest',
      build: 'bundle install && rake spec',
    },
    cnsaRelevance:
      'Enforces system-wide crypto policy `update-crypto-policies --set FIPS:CNSA` to disable SHA-1, 3DES, and classical 1024/2048-bit RSA.',
  },
  {
    id: 'cscs',
    name: 'Control System Cyber Security (CSCS)',
    repoName: 'NationalSecurityAgency/control-system-cyber-security',
    githubUrl: 'https://github.com/NationalSecurityAgency/control-system-cyber-security',
    description:
      'NSA guide and scripts for securing Industrial Control Systems (ICS), Operational Technology (OT), and SCADA infrastructure from nation-state intrusion.',
    category: 'Compliance & Hardening',
    stars: 940,
    forks: 150,
    license: 'Public Domain',
    primaryLanguage: 'Shell / Python',
    status: 'Maintained',
    officialTagline: 'Operational Technology & Critical Infrastructure Defense Hardening',
    keyFeatures: [
      'Purdue Enterprise Reference Architecture boundary verification',
      'Modbus, DNP3, and OPC-UA protocol security testing scripts',
      'Hardening templates for substation and pipeline telemetry nodes',
    ],
    architectureOverview:
      'Collection of audit scripts and defensive architectural blueprints evaluating Layer 0-3 ICS networks.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/control-system-cyber-security.git',
      build: 'chmod +x *.sh && ./audit-ics-boundary.sh --dry-run',
    },
    cnsaRelevance:
      'Ensures critical national infrastructure OT gateways adopt hybrid post-quantum TLS before 2030 CNSA 2.0 enforcement.',
  },
  {
    id: 'ghidra-data',
    name: 'Ghidra Data & Processor Modules',
    repoName: 'NationalSecurityAgency/ghidra-data',
    githubUrl: 'https://github.com/NationalSecurityAgency/ghidra-data',
    description:
      'Test binaries, processor manuals, and SLED definitions used by the NSA Ghidra engineering team for regression testing and architecture support.',
    category: 'Reverse Engineering',
    stars: 620,
    forks: 140,
    license: 'Apache-2.0',
    primaryLanguage: 'Assembly / C',
    status: 'Maintained',
    officialTagline: 'Sample binaries, test suites, and SLED processor specs for Ghidra',
    keyFeatures: [
      'Test binaries across 30+ hardware instruction sets',
      'Disassembly validation corpora for rare military architectures (Tricore, 68000, PIC)',
      'Compiler-generated optimization patterns for decompiler verification',
    ],
    architectureOverview: 'Data repository containing binary corpora and SLED processor specs.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/ghidra-data.git',
      build: 'echo "Ready for Ghidra integration"',
    },
    cnsaRelevance: 'Validates Ghidra decompilation accuracy on PQC lattice arithmetic routines.',
  },
  {
    id: 'skills-matrix',
    name: 'NSA Cybersecurity Skills Matrix',
    repoName: 'NationalSecurityAgency/skills-matrix',
    githubUrl: 'https://github.com/NationalSecurityAgency/skills-matrix',
    description:
      'Framework and web application created by NSA to track, assess, and develop technical cybersecurity competencies across defense and intelligence workforce.',
    category: 'Secure Coding & Education',
    stars: 510,
    forks: 95,
    license: 'Apache-2.0',
    primaryLanguage: 'JavaScript / Python',
    status: 'Maintained',
    officialTagline: 'Workforce capability tracking mapped to the NICE Cybersecurity Framework',
    keyFeatures: [
      'Alignment with NIST SP 800-181 NICE Workforce Framework',
      'Cryptanalysis, Vulnerability Assessment, and Forensics role roadmaps',
      'Self-assessment rubrics for quantum-safe crypto engineering skills',
    ],
    architectureOverview: 'Full-stack application mapping team skill levels to mission roles.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/skills-matrix.git',
      build: 'npm install && npm start',
    },
    cnsaRelevance: 'Guides national re-skilling programs in lattice-based cryptography.',
  },
  {
    id: 'go-sec-ed',
    name: 'Secure Go Education (go-sec-ed)',
    repoName: 'NationalSecurityAgency/go-sec-ed',
    githubUrl: 'https://github.com/NationalSecurityAgency/go-sec-ed',
    description:
      'Curated educational modules and vulnerability examples demonstrating how to write memory-safe, cryptographically resilient microservices in Go.',
    category: 'Secure Coding & Education',
    stars: 880,
    forks: 120,
    license: 'Public Domain',
    primaryLanguage: 'Go',
    status: 'Active',
    officialTagline: 'NSA educational guide for high-assurance Go software engineering',
    keyFeatures: [
      'Safe concurrent routines avoiding race conditions',
      'Constant-time cryptographic arithmetic implementations in Go',
      'Defense against timing side-channel attacks on private keys',
    ],
    architectureOverview: 'Self-guided interactive Go modules with testable vulnerabilities.',
    quickStartCommands: {
      clone: 'git clone https://github.com/NationalSecurityAgency/go-sec-ed.git',
      build: 'go test -v ./...',
    },
    cnsaRelevance: 'Teaches memory safety and safe crypto practices for modern defense backends.',
  },
];

export const SAMPLE_GHIDRA_PRESETS = [
  {
    id: 'rsa-montgomery',
    title: 'Legacy RSA-2048 Montgomery Modular Exponentiation (x86_64)',
    arch: 'x86_64' as const,
    format: 'ELF-64' as const,
    description:
      'Disassembled binary from an enterprise payment gateway implementing standard RSA-2048 private key decryption. Ghidra reveals non-constant-time modular branching and Shor-vulnerable discrete log factoring.',
    hexSnippet: '48 83 ec 40 48 89 7c 24 38 48 89 74 24 30 48 8b 44 24 38 48 8b 4c 24 30 48 0f af c1 48 89 44 24 28',
    decompiledSnippet: `/* Ghidra Decompiler 11.2 - Function at 0x00401180 */
int crypto_rsa2048_decrypt(byte *ciphertext, rsa_key_t *private_key, byte *plaintext) {
    bn_t mod_exp_acc;
    int bit_index;
    
    /* VULNERABILITY: Non-constant time modular exponentiation */
    bn_init(&mod_exp_acc, 1);
    for (bit_index = 2047; bit_index >= 0; bit_index--) {
        bn_montgomery_sqr(&mod_exp_acc, &mod_exp_acc, private_key->modulus);
        if (bn_is_bit_set(private_key->d, bit_index)) {
            /* Timing side-channel: conditional branch depends on secret exponent bit */
            bn_montgomery_mul(&mod_exp_acc, ciphertext, private_key->modulus);
        }
    }
    /* QUANTUM RISK: Vulnerable to polynomial-time factoring via Shor's Algorithm (O((log N)^3)) */
    return bn_to_bytes(&mod_exp_acc, plaintext);
}`,
    instructions: [
      { address: '0x00401180', bytes: '55', mnemonic: 'push', operands: 'rbp', comment: 'Function prologue' },
      { address: '0x00401181', bytes: '48 89 e5', mnemonic: 'mov', operands: 'rbp, rsp' },
      { address: '0x00401184', bytes: '48 83 ec 40', mnemonic: 'sub', operands: 'rsp, 0x40' },
      { address: '0x00401188', bytes: '48 89 7d f8', mnemonic: 'mov', operands: 'qword ptr [rbp - 0x8], rdi', comment: 'arg1: ciphertext' },
      { address: '0x0040118c', bytes: '48 89 75 f0', mnemonic: 'mov', operands: 'qword ptr [rbp - 0x10], rsi', comment: 'arg2: private_key (RSA-2048)' },
      { address: '0x00401190', bytes: 'e8 4b 02 00 00', mnemonic: 'call', operands: 'bn_init', comment: 'Initialize BigNum accumulator' },
      { address: '0x00401195', bytes: 'c7 45 fc ff 07 00 00', mnemonic: 'mov', operands: 'dword ptr [rbp - 0x4], 0x7ff', comment: 'bit_index = 2047' },
      { address: '0x0040119c', bytes: '83 7d fc 00', mnemonic: 'cmp', operands: 'dword ptr [rbp - 0x4], 0x0' },
      { address: '0x004011a0', bytes: '7c 2e', mnemonic: 'jl', operands: '0x004011d0', comment: 'Exit exponentiation loop' },
      { address: '0x004011a2', bytes: 'e8 69 03 00 00', mnemonic: 'call', operands: 'bn_montgomery_sqr', comment: 'Always square accumulator' },
      { address: '0x004011a7', bytes: '85 c0', mnemonic: 'test', operands: 'eax, eax' },
      { address: '0x004011a9', bytes: '74 0a', mnemonic: 'jz', operands: '0x004011b5', comment: 'BRANCH LEAK: jump if bit is 0' },
      { address: '0x004011ab', bytes: 'e8 80 03 00 00', mnemonic: 'call', operands: 'bn_montgomery_mul', comment: 'Multiply: Secret-dependent execution timing!' },
      { address: '0x004011b0', bytes: 'ff 4d fc', mnemonic: 'dec', operands: 'dword ptr [rbp - 0x4]' },
      { address: '0x004011b3', bytes: 'eb e7', mnemonic: 'jmp', operands: '0x0040119c' },
    ],
    symbols: [
      { name: 'crypto_rsa2048_decrypt', address: '0x00401180', type: 'Function' as const },
      { name: 'bn_montgomery_sqr', address: '0x00401410', type: 'Function' as const },
      { name: 'bn_montgomery_mul', address: '0x00401530', type: 'Function' as const },
      { name: 'RSA_PKCS1_PADDING_MAGIC', address: '0x00403010', type: 'Data' as const },
    ],
    strings: [
      { string: 'RSA_KEY_SIZE_BITS=2048', address: '0x00403040', section: '.rodata' },
      { string: 'ERROR: OpenSSL 1.0.2 RSA exponentiation failed', address: '0x00403080', section: '.rodata' },
      { string: 'HNDL_EXPOSURE_WARNING', address: '0x004030c0', section: '.rodata' },
    ],
    vulnerabilities: [
      {
        type: 'Shor Quantum Factoring (RSA-2048)',
        severity: 'CRITICAL' as const,
        cwe: 'CWE-327',
        description: 'RSA-2048 asymmetric factoring is fully broken by Shor Algorithm on a 4,098 logical qubit quantum computer.',
        location: 'crypto_rsa2048_decrypt @ 0x00401180',
        quantumImplication: 'Full compromise of confidentiality and forward secrecy (HNDL payload exposure).',
      },
      {
        type: 'Timing Side-Channel on Secret Exponent',
        severity: 'HIGH' as const,
        cwe: 'CWE-385',
        description: 'Conditional jump at 0x004011a9 branches based on private key bit, leaking key bits via microarchitectural cache latency.',
        location: '0x004011a9 (jz 0x004011b5)',
        quantumImplication: 'Classical side-channel amplifies quantum attack feasibility.',
      },
    ],
  },
  {
    id: 'mlkem-pqc',
    title: 'NIST FIPS 203 ML-KEM-768 NTT Polynomial Vector Arithmetic (AArch64)',
    arch: 'AArch64' as const,
    format: 'ELF-64' as const,
    description:
      'Ghidra decompilation of post-quantum ML-KEM-768 (Kyber) Module-Lattice Key Encapsulation Mechanism compiled with ARM NEON SIMD optimizations. Completely immune to Shor and Grover speedups.',
    hexSnippet: 'e0 03 00 aa 01 04 00 11 22 00 40 f9 43 00 00 b9 64 00 00 53 85 00 00 b9',
    decompiledSnippet: `/* Ghidra Decompiler 11.2 - Function at 0x00408200 */
/* NIST FIPS 203 Post-Quantum ML-KEM-768 Vector NTT Arithmetic */
void pqc_mlkem768_poly_ntt_neon(int16_t r[256], const int16_t a[256]) {
    int16x8_t q_vec = vdupq_n_s16(3329); /* Kyber Modulus q = 3329 */
    int16x8_t mont_vec = vdupq_n_s16(-3327);
    int len, start, j;
    
    /* Post-Quantum constant-time butterfly NTT execution */
    for (len = 128; len >= 2; len >>= 1) {
        for (start = 0; start < 256; start += 2 * len) {
            int16x8_t zeta = vdupq_n_s16(pqc_zetas_table[j++]);
            for (j = start; j < start + len; j += 8) {
                int16x8_t u = vld1q_s16(&r[j]);
                int16x8_t v = vld1q_s16(&r[j + len]);
                int16x8_t t = pqc_montgomery_reduce_neon(vmulq_s16(v, zeta), q_vec, mont_vec);
                vst1q_s16(&r[j], vaddq_s16(u, t));
                vst1q_s16(&r[j + len], vsubq_s16(u, t));
            }
        }
    }
    /* POST-QUANTUM ASSURANCE: Security Category 3 (192-bit quantum security) */
}`,
    instructions: [
      { address: '0x00408200', bytes: 'fd 7b ba a9', mnemonic: 'stp', operands: 'x29, x30, [sp, #-96]!', comment: 'AArch64 Frame setup' },
      { address: '0x00408204', bytes: 'fd 03 00 91', mnemonic: 'mov', operands: 'x29, sp' },
      { address: '0x00408208', bytes: '02 08 80 d2', mnemonic: 'movz', operands: 'x2, #0xd01', comment: 'Modulus q = 3329' },
      { address: '0x0040820c', bytes: '42 04 02 0f', mnemonic: 'dup', operands: 'v2.8h, w2', comment: 'Broadcast q to vector register' },
      { address: '0x00408210', bytes: '20 00 40 3d', mnemonic: 'ldr', operands: 'q0, [x1]', comment: 'Load 8 polynomial coeffs' },
      { address: '0x00408214', bytes: '00 9c 20 4e', mnemonic: 'fmla', operands: 'v0.8h, v1.8h, v2.8h', comment: 'Constant-time vectorized butterfly' },
      { address: '0x00408218', bytes: '20 00 00 3d', mnemonic: 'str', operands: 'q0, [x0]', comment: 'Store NTT transformed slice' },
    ],
    symbols: [
      { name: 'pqc_mlkem768_poly_ntt_neon', address: '0x00408200', type: 'Function' as const },
      { name: 'pqc_montgomery_reduce_neon', address: '0x00408450', type: 'Function' as const },
      { name: 'pqc_zetas_table', address: '0x00409000', type: 'Data' as const },
    ],
    strings: [
      { string: 'NIST_FIPS_203_ML_KEM_768_COMPLIANT', address: '0x00409200', section: '.rodata' },
      { string: 'CNSA_2_0_APPROVED_ALGORITHM', address: '0x00409240', section: '.rodata' },
    ],
    vulnerabilities: [
      {
        type: 'Zero Quantum Vulnerabilities Found',
        severity: 'INFO' as const,
        cwe: 'N/A',
        description: 'Module Learning With Errors (M-LWE) lattice structure is verified post-quantum secure against both Shor and Grover algorithms.',
        location: '0x00408200',
        quantumImplication: 'Passes CNSA 2.0 and NIST FIPS 203 mandate. Safe until beyond 2040.',
      },
    ],
  },
];

export const GHIDRA_COMPROMISE_HARDENING_STATUS = {
  incidentId: 'NSA-CIRT-2026-GHIDRA-ZERO-TRUST',
  threatLevel: 'CONTAINED_ZERO_TRUST' as const,
  compromiseVectorsMitigated: [
    {
      id: 'vec-decompiler-heap',
      vector: 'C++ Native Decompiler Binary Parser Heap Overflow & ROP Chain',
      cveOrCwe: 'CWE-787 / Malicious ELF DWARF & SLEIGH Section Injection',
      attackSurface: 'Ghidra native `decompile` child process parsing adversarial ELF/PE headers',
      mitigationControl:
        'Isolated ephemeral gVisor/Firecracker microVM per binary pass with strict seccomp-bpf syscall whitelist (`read`, `write`, `exit_group` only) and ASLR/CFI shadow stack.',
      status: 'HARDENED' as const,
    },
    {
      id: 'vec-pcode-poisoning',
      vector: 'Trojanized SLEIGH / P-Code Specification Backdoor (False-Clean Crypto Audit)',
      cveOrCwe: 'CWE-345 / Supply-Chain SLEIGH `.sla` Rule Tampering',
      attackSurface: 'Compromised Ghidra processor module hiding backdoored RSA/ECC keys or falsifying ML-KEM constant-time loops',
      mitigationControl:
        '3-Way Byzantine Fault Tolerant (BFT) Multi-Lifter Consensus: Cross-verifies Ghidra P-Code against independent Radare2/Rizin ESIL and angr VEX IR + LLVM-MC AST hashes.',
      status: 'ENFORCED' as const,
    },
    {
      id: 'vec-jvm-rmi',
      vector: 'Ghidra Server Java RMI Deserialization & Jython Post-Analysis RCE',
      cveOrCwe: 'CWE-502 / Java ObjectInputStream & Untrusted Script Execution',
      attackSurface: 'Collaborative Ghidra Server ports (13100-13102) and auto-triggered `.py`/`.java` analyzer extensions',
      mitigationControl:
        'Hard-blocked Java RMI sockets, network-airgapped null `netns`, read-only squashfs root, and mandatory NIST FIPS 204 ML-DSA-87 signature verification on all SLEIGH & script bundles.',
      status: 'QUARANTINED' as const,
    },
    {
      id: 'vec-xml-xxe',
      vector: 'Project `.gpr` / XML External Entity (XXE) Credential Exfiltration',
      cveOrCwe: 'CWE-611 / XML Parser DTD External Entity Resolution',
      attackSurface: 'Importing untrusted Ghidra `.gar` archives or XML symbol tables',
      mitigationControl:
        'Disallowed DTD/external entities at parser level; stripped all host environment variables and secrets before headless invocation.',
      status: 'HARDENED' as const,
    },
  ],
  sandboxPolicy: {
    seccompProfile: 'seccomp-strict-ghidra-decompiler-v4.json (392 syscalls blocked)',
    jvmRmiStatus: 'DISABLED_HARD_BLOCKED' as const,
    networkNamespace: 'AIRGAPPED_NULL_NETNS' as const,
    pluginSignatureEnforcement: 'FIPS_204_ML_DSA_87_REQUIRED' as const,
    triEngineConsensusQuorum: '2-of-3 Independent Lifters (Rizin + angr + Isolated Ghidra)' as const,
  },
  hardenedArchitectureSnippet: `# Zero-Trust Ghidra Compromise Containment & Multi-Engine BFT Verification
# Mitigates compromised Ghidra decompiler binaries, poisoned SLEIGH specs, and JVM RMI RCE
import hashlib
import subprocess
import oqs

class HardenedBftBinaryAuditor:
    """
    Never trusts Ghidra output alone. Executes Ghidra inside an air-gapped,
    network-isolated seccomp microVM and cross-verifies its Control Flow Graph (CFG)
    against independent Rizin (ESIL) and angr (VEX IR) lifters signed with ML-DSA-87.
    """
    def __init__(self):
        self.signer = oqs.Signature("ML-DSA-87")
        self.pub_key = self.signer.generate_keypair()

    def verify_sleigh_integrity(self, sleigh_spec_bytes: bytes, signature: bytes, trusted_pub: bytes) -> bool:
        with oqs.Signature("ML-DSA-87") as verifier:
            return verifier.verify(sleigh_spec_bytes, signature, trusted_pub)

    def run_bft_multi_lifter_quorum(self, binary_digest: str, ghidra_cfg_hash: str, rizin_esil_hash: str, angr_vex_hash: str) -> dict:
        quorum_match = (rizin_esil_hash == angr_vex_hash)
        ghidra_compromised = (ghidra_cfg_hash != rizin_esil_hash)
        attestation_payload = f"{binary_digest}:{rizin_esil_hash}:QUORUM={quorum_match}".encode()
        sig = self.signer.sign(attestation_payload)
        return {
            "binary_sha256": binary_digest,
            "ghidra_quarantined": ghidra_compromised,
            "trusted_consensus_hash": rizin_esil_hash,
            "fips_204_mldsa87_attestation": sig.hex()[:64]
        }`,
};

export function runSimulatedGhidraAnalysis(presetId: string = 'rsa-montgomery'): GhidraAnalysisResult {
  const preset = SAMPLE_GHIDRA_PRESETS.find((p) => p.id === presetId) || SAMPLE_GHIDRA_PRESETS[0];

  const isCompromiseSim = presetId === 'compromised-ghidra-poison';

  return {
    binaryName: isCompromiseSim ? 'poisoned_sleigh_decompiler_target.elf' : `${preset.id}.elf`,
    architecture: preset.arch,
    format: preset.format,
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    instructions: preset.instructions,
    decompiledC: preset.decompiledSnippet,
    symbols: preset.symbols,
    stringsFound: preset.strings,
    pcodeIntermediate: [
      {
        instruction: '0x00401184: sub rsp, 0x40',
        pcode: ['COPY (register, 0x20, 8) -> (unique, 0x100, 8)', 'INT_SUB (unique, 0x100, 8), (const, 0x40, 8) -> (register, 0x20, 8)'],
      },
      {
        instruction: '0x004011a2: call bn_montgomery_sqr',
        pcode: ['CALL (ram, 0x00401410, 8)'],
      },
      {
        instruction: '0x004011a9: jz 0x004011b5',
        pcode: ['CBRANCH (ram, 0x004011b5, 8), (register, ZF, 1)'],
      },
    ],
    detectedVulnerabilities: [
      ...preset.vulnerabilities,
      {
        type: 'Ghidra Decompiler Supply-Chain & P-Code Cross-Verification',
        severity: 'HIGH',
        cwe: 'CWE-345',
        description:
          'Ghidra SRE output was treated as untrusted due to active Ghidra compromise alert. Output was cross-verified via 3-way BFT consensus against Radare2/Rizin ESIL and angr VEX IR inside an air-gapped seccomp-bpf microVM.',
        location: 'Decompiler Pipeline Quorum Verifier @ BFT-Gate-01',
        quantumImplication:
          'Prevents a compromised decompiler from masking classical RSA/ECC backdoors or injecting trojanized P-Code during FIPS 203/204 migration.',
      },
    ],
    analysisMetrics: {
      functionsCount: preset.symbols.filter((s) => s.type === 'Function').length,
      basicBlocksCount: 14,
      cyclomaticComplexity: 4,
      analysisTimeMs: 142,
    },
    compromiseContainment: {
      ghidraTrustStatus: 'COMPROMISED_QUARANTINED',
      decompilerBftConsensus: [
        {
          engine: 'Ghidra SRE (Untrusted Sandbox)',
          ssaHash: 'sha3_256:e4b89a1c02f9d881... (Quarantined MicroVM)',
          status: 'TAMPER_DETECTED_POISONED_PCODE',
          divergenceNotes:
            'Detected anomalous SLEIGH P-Code rule attempting to suppress CWE-327 RSA-2048 warning; overridden by BFT quorum.',
        },
        {
          engine: 'Radare2 / Rizin',
          ssaHash: 'sha3_256:7c91f44b882019ae... (Canonical ESIL)',
          status: 'BYZANTINE_QUORUM_MATCH',
          divergenceNotes: 'Independent ESIL lifter confirmed exact CFG and timing branch at 0x004011a9.',
        },
        {
          engine: 'angr / BinaryNinja',
          ssaHash: 'sha3_256:7c91f44b882019ae... (Canonical VEX IR)',
          status: 'BYZANTINE_QUORUM_MATCH',
          divergenceNotes: 'Symbolic VEX IR matches Rizin ESIL 100%; attested with ML-DSA-87.',
        },
        {
          engine: 'LLVM-MC Lifter',
          ssaHash: 'sha3_256:7c91f44b882019ae... (Canonical LLVM IR)',
          status: 'VERIFIED',
          divergenceNotes: 'Zero-trust reference disassembly verified.',
        },
      ],
      activeCountermeasures: [
        'Ephemeral Firecracker MicroVM + seccomp-bpf Syscall Jail',
        'Air-Gapped Null Network Namespace (Java RMI 13100-13102 Blocked)',
        '3-Way BFT Multi-Lifter Consensus (Rizin + angr + LLVM-MC override)',
        'Mandatory NIST FIPS 204 ML-DSA-87 Signature Check on SLEIGH Specs',
      ],
      pqcAttestationSignature:
        'FIPS-204-ML-DSA-87:9a8f4c210e77b3d18c44e9201a55f80c3b77d2190f4e88a1c6623d90b11e44f2',
    },
  };
}

export const SAMPLE_WALKOFF_PLAYBOOK: WalkoffPlaybook = {
  id: 'playbook-ghidra-compromise-containment',
  title: 'Zero-Trust Ghidra Compromise Containment & BFT Decompiler Quorum (WALKOFF SOAR)',
  trigger: 'CRITICAL ALERT: Ghidra Decompiler / SLEIGH Supply-Chain Compromise Detected',
  description:
    'Hardened NSA WALKOFF workflow isolating compromised Ghidra instances into air-gapped seccomp microVMs, revoking Java RMI network bindings, and enforcing 3-way Byzantine Fault Tolerant (BFT) binary lifting consensus.',
  nodes: [
    {
      id: 'node-1',
      title: 'Quarantine Compromised Ghidra Worker & Block Java RMI',
      app: 'Ghidra Quarantine Sandbox',
      action: 'Sever ports 13100-13102, mount read-only squashfs, and enforce seccomp-bpf syscall jail',
      status: 'success',
      outputSnippet: 'Isolated Ghidra PID inside null netns Firecracker microVM. Blocked 392 dangerous syscalls.',
    },
    {
      id: 'node-2',
      title: 'Execute 3-Way BFT Multi-Engine Lifter Consensus',
      app: 'Multi-Engine BFT Lifter',
      action: 'Cross-verify Ghidra P-Code against independent Radare2/Rizin ESIL, angr VEX IR, and LLVM-MC',
      status: 'success',
      outputSnippet: 'Detected poisoned SLEIGH rule in Ghidra output; overridden by 3-of-4 Rizin + angr + LLVM quorum.',
    },
    {
      id: 'node-3',
      title: 'Verify SLEIGH & Plugin Signatures with FIPS 204 ML-DSA-87',
      app: 'NiFi Pipeline',
      action: 'Inspect cryptographic hashes and post-quantum signatures of all processor .sla modules',
      status: 'success',
      outputSnippet: 'Quarantined unsigned Jython extension; re-pinned verified ML-DSA-87 signed processor specs.',
    },
    {
      id: 'node-4',
      title: 'Enforce SIMP Host Hardening & SELinux Mandatory Containment',
      app: 'SIMP Hardening',
      action: 'Push Puppet SELinux policy `simp_ghidra_sandbox_t` and `FIPS:CNSA` across all analysis nodes',
      status: 'success',
      outputSnippet: 'Applied SELinux mandatory access control and FIPS:CNSA crypto policy across 18 analysis clusters.',
    },
    {
      id: 'node-5',
      title: 'Rotate Attestation Keys & Seal CBOM Ledger',
      app: 'SOAR Containment',
      action: 'Re-sign verified binary CBOMs using hardware-backed ML-DSA-87 and close containment ticket',
      status: 'success',
      outputSnippet: 'Zero-Trust BFT Decompiler Architecture active. Incident #NSA-CIRT-2026-GHIDRA-ZT sealed.',
    },
  ],
};

// ============================================================================
// GHIDRA DEFENSIVE DECEPTION & TELEMETRY HONEYPOTS
// ============================================================================

export let GHIDRA_HONEYPOTS: GhidraHoneypot[] = [
  {
    id: 'hp-rmi-decoy',
    name: 'Ghidra Server Java RMI Decoy Listener',
    type: 'RMI_SERVER_DECOY',
    status: 'ACTIVE_LISTENING',
    decoySurface: 'Port 13100-13102 (Java RMI ghidra.server.GetServerInfo)',
    telemetryPort: 13100,
    tripCount: 3,
    lastTrippedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    mitreDefendTactic: 'Decoy Environment (D3-DE)',
    mitreAttackTechnique: 'T1584 - Compromise Infrastructure / T1210 - Exploitation of Remote Services',
    canaryTokenSignature: 'CANARY-RMI-JVM-TOKEN-7719B-FIPS204',
    description: 'High-interaction fake Ghidra collaboration server. Emulates Java RMI registry endpoint to capture deserialization payloads, unauthorized project clone attempts, and attacker C2 scanners.',
    defensiveActionOnTrigger: 'Automated eBPF netfilter socket sever, attacker IP drop in null netns, and forensic memory dump of connection attempt.',
  },
  {
    id: 'hp-canary-binary-cnsa',
    name: 'Canary Binary Trap (CNSA-Quantum-Keyloader.elf)',
    type: 'CANARY_BINARY_TRAP',
    status: 'ACTIVE_LISTENING',
    decoySurface: '/var/ghidra/analysis_queue/cnsa_topsecret_mlkem_keyloader.elf',
    decoyPath: '/var/ghidra/analysis_queue/cnsa_topsecret_mlkem_keyloader.elf',
    tripCount: 1,
    lastTrippedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    mitreDefendTactic: 'Canary File / Decoy Asset (D3-CF)',
    mitreAttackTechnique: 'T1005 - Data from Local System / T1552 - Unsecured Credentials',
    canaryTokenSignature: 'CANARY-ELF-HASH-8842-MLDSA87-WATERMARK',
    description: 'Decoy compiled ELF binary with simulated FIPS 203 ML-KEM private key material and unique cryptographic watermarks planted in Ghidra batch analysis intake.',
    defensiveActionOnTrigger: 'Alerts SOC immediately when decompiled or parsed; identifies compromised Ghidra scripts scanning local storage for cryptographic secrets.',
  },
  {
    id: 'hp-sleigh-tamper',
    name: 'Poisoned SLEIGH Decoy Processor Spec',
    type: 'SLEIGH_SPEC_DECOY',
    status: 'ACTIVE_LISTENING',
    decoySurface: '/opt/ghidra/Ghidra/Processors/ARM/data/languages/armv9_crypto_decoy.sla',
    decoyPath: '/opt/ghidra/Ghidra/Processors/ARM/data/languages/armv9_crypto_decoy.sla',
    tripCount: 0,
    mitreDefendTactic: 'File Integrity Monitoring / Decoy Resource (D3-FIM)',
    mitreAttackTechnique: 'T1554 - Compromise Host Software Binary / T1055 - Process Injection',
    canaryTokenSignature: 'SLEIGH-SPEC-INTEGRITY-MLDSA-99411',
    description: 'Tripwire processor definition file with cryptographic canary hashes. Detects trojanized extensions or adversaries attempting to modify opcode semantics.',
    defensiveActionOnTrigger: 'Triggers instant BFT lifter quorum override, rolls back to read-only squashfs, and reports file tamper to WALKOFF SOAR.',
  },
  {
    id: 'hp-cred-breadcrumb',
    name: 'Admin Credential Breadcrumb Trap',
    type: 'CREDENTIAL_BREADCRUMB',
    status: 'ACTIVE_LISTENING',
    decoySurface: '~/.ghidra/.ghidra_11.2_PUBLIC/ghidra_server_admin_creds.xml',
    decoyPath: '~/.ghidra/.ghidra_11.2_PUBLIC/ghidra_server_admin_creds.xml',
    tripCount: 2,
    lastTrippedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    mitreDefendTactic: 'Decoy Credentials (D3-DC)',
    mitreAttackTechnique: 'T1552.001 - Credentials In Files / T1083 - File and Directory Discovery',
    canaryTokenSignature: 'BREADCRUMB-CANARY-CREDS-XML-5502A',
    description: 'Decoy configuration file containing high-value honeypot credentials for internal Ghidra repositories. Monitored via Linux eBPF inotify hook.',
    defensiveActionOnTrigger: 'Instant process termination (SIGKILL) of accessing PID, credential rotation alert dispatched to Active Directory / Kerberos.',
  },
  {
    id: 'hp-dns-beacon',
    name: 'Network Egress Decoy Beacon Token',
    type: 'NETWORK_BEACON_TRAP',
    status: 'ACTIVE_LISTENING',
    decoySurface: 'pqc-cnsa-telemetry.mil.canary-token.local (DNS / UDP 53)',
    tripCount: 1,
    lastTrippedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    mitreDefendTactic: 'Network Traffic Deception (D3-NTD)',
    mitreAttackTechnique: 'T1048 - Exfiltration Over Alternative Protocol / T1071 - Application Layer Protocol',
    canaryTokenSignature: 'DNS-CANARY-TOKEN-PQC-901844',
    description: 'Embedded canary hostnames in sample Ghidra Python scripts. If an adversary or compromised plugin attempts exfiltration, DNS queries trigger an instant alarm.',
    defensiveActionOnTrigger: 'Internal DNS sinkhole activation, perimeter firewall drop rule pushed via API, workstation network interface severed.',
  },
];

export let GHIDRA_HONEYPOT_EVENTS: HoneypotTelemetryEvent[] = [
  {
    id: 'evt-hp-1001',
    honeypotId: 'hp-dns-beacon',
    honeypotName: 'Network Egress Decoy Beacon Token',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    severity: 'CRITICAL',
    attackerSignature: {
      sourceIp: '198.51.100.72',
      sourcePort: 49182,
      payloadFingerprint: 'DNS-QUERY: A? pqc-cnsa-telemetry.mil.canary-token.local',
      attemptedAction: 'Out-of-band DNS Exfiltration Probe from compromised Ghidra Jython runtime',
      userAgentOrTool: 'Python-urllib/3.10 GhidraScriptWorker',
      targetedAsset: 'pqc-cnsa-telemetry.mil.canary-token.local',
    },
    telemetryDetails: 'Compromised Ghidra script attempted DNS resolution of decoy canary token. Query trapped by internal DNS sinkhole.',
    containmentTriggered: true,
    mitigationTaken: 'Air-gapped null netns enforced; isolated Ghidra worker process (PID 48190); alert relayed to CISA COUN7ER & WALKOFF SOAR.',
  },
  {
    id: 'evt-hp-1002',
    honeypotId: 'hp-cred-breadcrumb',
    honeypotName: 'Admin Credential Breadcrumb Trap',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    severity: 'HIGH',
    attackerSignature: {
      sourceIp: '203.0.113.45',
      sourcePort: 38290,
      payloadFingerprint: 'INOTIFY_ACCESS: read() on ~/.ghidra/.ghidra_11.2_PUBLIC/ghidra_server_admin_creds.xml',
      attemptedAction: 'Credential harvesting from Ghidra user profile directory',
      userAgentOrTool: 'cat / bash credential search loop',
      targetedAsset: '~/.ghidra/.ghidra_11.2_PUBLIC/ghidra_server_admin_creds.xml',
    },
    telemetryDetails: 'Unauthorized process attempted to read decoy Ghidra admin credentials XML. Tripwire inotify sensor alerted security engine.',
    containmentTriggered: true,
    mitigationTaken: 'eBPF process kill signal sent; decoy credential usage flagged across Kerberos/LDAP audit logs.',
  },
  {
    id: 'evt-hp-1003',
    honeypotId: 'hp-rmi-decoy',
    honeypotName: 'Ghidra Server Java RMI Decoy Listener',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    severity: 'CRITICAL',
    attackerSignature: {
      sourceIp: '198.51.100.198',
      sourcePort: 54110,
      payloadFingerprint: 'JAVA-RMI-INVOKE: rmi://0.0.0.0:13100/GhidraServer [Magic AC ED 00 05 ObjectInputStream]',
      attemptedAction: 'Java ObjectInputStream Remote Code Execution (RCE) deserialization probe',
      userAgentOrTool: 'ysoserial CommonsCollections6 / JNDIExploit',
      targetedAsset: 'Port 13100 GhidraServer RMI Registry',
    },
    telemetryDetails: 'Adversary sent serialized Java exploit payload to decoy Ghidra Server RMI port. Decoy listener captured bytecode without execution.',
    containmentTriggered: true,
    mitigationTaken: 'eBPF netfilter dropped TCP handshake; IP added to automated border blocklist; payload archived for malware analysis.',
  },
  {
    id: 'evt-hp-1004',
    honeypotId: 'hp-canary-binary-cnsa',
    honeypotName: 'Canary Binary Trap (CNSA-Quantum-Keyloader.elf)',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    severity: 'MEDIUM',
    attackerSignature: {
      sourceIp: '192.0.2.89',
      sourcePort: 42100,
      payloadFingerprint: 'ELF_PARSE: DWARF section scan for watermark CANARY-ELF-HASH-8842',
      attemptedAction: 'Headless batch scraper indexing cryptographic keys from analysis intake queue',
      userAgentOrTool: 'ghidra-headless -import -scriptPath /tmp/scrape.py',
      targetedAsset: '/var/ghidra/analysis_queue/cnsa_topsecret_mlkem_keyloader.elf',
    },
    telemetryDetails: 'Canary binary decompilation triggered unique embedded watermark beacon. Worker PID logged.',
    containmentTriggered: true,
    mitigationTaken: 'Decompiler execution flagged as untrusted; output rejected by 3-Way BFT consensus engine.',
  },
];

export function getGhidraHoneypots(): GhidraHoneypot[] {
  return GHIDRA_HONEYPOTS;
}

export function getGhidraHoneypotEvents(): HoneypotTelemetryEvent[] {
  return GHIDRA_HONEYPOT_EVENTS;
}

export function simulateAdversaryProbe(
  honeypotId: string = 'hp-rmi-decoy',
  attackerIp?: string
): { honeypot: GhidraHoneypot; event: HoneypotTelemetryEvent } {
  const hp = GHIDRA_HONEYPOTS.find((h) => h.id === honeypotId) || GHIDRA_HONEYPOTS[0];
  const now = new Date().toISOString();

  hp.status = 'TRIPPED_ALARM';
  hp.tripCount += 1;
  hp.lastTrippedAt = now;

  const simulatedIp =
    attackerIp ||
    `198.51.100.${Math.floor(Math.random() * 200) + 20}`;

  let attemptedAction = 'Adversary probe detected on decoy surface';
  let payloadFingerprint = `PROBE-PAYLOAD-${Date.now().toString(16).toUpperCase()}`;
  let userAgentOrTool = 'Adversary Automated Scanner';
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'HIGH';
  let mitigation = 'Automated zero-trust containment applied.';

  if (hp.type === 'RMI_SERVER_DECOY') {
    severity = 'CRITICAL';
    attemptedAction = 'Adversary injected Java RMI deserialization payload targeting Ghidra Server 13100';
    payloadFingerprint = 'JAVA-RMI-DESER: [AC ED 00 05] ysoserial CommonsCollections payload';
    userAgentOrTool = 'JNDIExploit / GhidraServerExploiter v2.4';
    mitigation = 'eBPF dropped connection, isolated port, and logged attacker payload.';
  } else if (hp.type === 'CANARY_BINARY_TRAP') {
    severity = 'HIGH';
    attemptedAction = 'Unauthorized decompilation and extraction of Canary CNSA binary';
    payloadFingerprint = `WATERMARK-TRIGGER: ${hp.canaryTokenSignature}`;
    userAgentOrTool = 'Headless Ghidra Analyzer Python Script';
    mitigation = 'Revoked analysis token; BFT consensus quarantined tainted decompiler output.';
  } else if (hp.type === 'SLEIGH_SPEC_DECOY') {
    severity = 'CRITICAL';
    attemptedAction = 'Adversary attempted write/modify on SLEIGH opcode decoder specification';
    payloadFingerprint = 'SLEIGH-TAMPER: SHA256 mismatch detected in .sla rule table';
    userAgentOrTool = 'Malicious Ghidra Native Plugin Extension';
    mitigation = 'Rollback to signed FIPS 204 ML-DSA-87 specification; isolated container rootfs.';
  } else if (hp.type === 'CREDENTIAL_BREADCRUMB') {
    severity = 'HIGH';
    attemptedAction = 'Adversary read decoy administrative credentials from user profile';
    payloadFingerprint = 'BREADCRUMB-ACCESS: inotify IN_ACCESS triggered';
    userAgentOrTool = 'Exfiltration curl / python daemon';
    mitigation = 'Killed process UID via SIGKILL; blacklisted attacker source.';
  } else if (hp.type === 'NETWORK_BEACON_TRAP') {
    severity = 'CRITICAL';
    attemptedAction = 'Adversary triggered out-of-band network beacon query from container';
    payloadFingerprint = `DNS-TRIGGER: ${hp.canaryTokenSignature}.canary-token.local`;
    userAgentOrTool = 'cURL / DNS exfiltration channel';
    mitigation = 'Severed network namespace to NULL_NETNS; triggered perimeter firewall rule.';
  }

  const newEvent: HoneypotTelemetryEvent = {
    id: `evt-hp-${Date.now()}`,
    honeypotId: hp.id,
    honeypotName: hp.name,
    timestamp: now,
    severity,
    attackerSignature: {
      sourceIp: simulatedIp,
      sourcePort: Math.floor(Math.random() * 30000) + 30000,
      payloadFingerprint,
      attemptedAction,
      userAgentOrTool,
      targetedAsset: hp.decoySurface,
    },
    telemetryDetails: `Adversary interaction captured by defensive decoy ${hp.name}. No production assets exposed.`,
    containmentTriggered: true,
    mitigationTaken: mitigation,
  };

  GHIDRA_HONEYPOT_EVENTS = [newEvent, ...GHIDRA_HONEYPOT_EVENTS.slice(0, 49)];

  return { honeypot: hp, event: newEvent };
}

export function deployHoneypotTrap(trapData: Partial<GhidraHoneypot>): GhidraHoneypot {
  const newTrap: GhidraHoneypot = {
    id: `hp-${Date.now()}`,
    name: trapData.name || 'Custom Defensive Honeypot Decoy',
    type: trapData.type || 'CANARY_BINARY_TRAP',
    status: 'ACTIVE_LISTENING',
    decoySurface: trapData.decoySurface || `/analysis_queue/canary_decoy_${Date.now()}.bin`,
    tripCount: 0,
    mitreDefendTactic: trapData.mitreDefendTactic || 'Decoy Asset (D3-CF)',
    mitreAttackTechnique: trapData.mitreAttackTechnique || 'T1005 - Data from Local System',
    canaryTokenSignature: `CANARY-CUSTOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}-MLDSA`,
    description: trapData.description || 'Defensive honeypot decoy deployed to detect adversary discovery and tampering in Ghidra environment.',
    defensiveActionOnTrigger: trapData.defensiveActionOnTrigger || 'Immediate worker PID quarantine and eBPF netfilter drop.',
  };

  GHIDRA_HONEYPOTS.push(newTrap);
  return newTrap;
}

export function resetHoneypotAlarms(): { success: boolean; message: string } {
  GHIDRA_HONEYPOTS = GHIDRA_HONEYPOTS.map((hp) => ({
    ...hp,
    status: 'ACTIVE_LISTENING' as const,
  }));
  return { success: true, message: 'All honeypot tripwires re-armed to ACTIVE_LISTENING' };
}

export function getGhidraCompromiseHardeningStatus(): GhidraCompromiseHardeningStatus {
  return GHIDRA_COMPROMISE_HARDENING_STATUS;
}

// ============================================================================
// ZERO TRUST ALL-LEVELS HARDENING & INSIDER THREAT / COMPROMISED PERSONNEL
// ============================================================================

export let ZERO_TRUST_GLOBAL_STATUS: ZeroTrustGlobalStatus = {
  incidentId: 'NSA-ZT-INSIDER-CONTAINMENT-2026',
  threatLevel: 'DEFCON-1 INSIDER THREAT ACTIVE',
  twoPersonIntegrityEnforced: true,
  singleAdminAccessBlocked: true,
  microVMConfidentialComputingEnforced: true,
  allPersonnelImplicitTrustRevoked: true,
  activeQuarantinedPersonnelCount: 3,
  pillarsHardenedCount: 6,
  totalPillars: 6,
  lastLockdownTimestamp: new Date().toISOString(),
};

export let ZERO_TRUST_PILLAR_CONTROLS: ZeroTrustPillarControl[] = [
  {
    id: 'zt-pillar-identity',
    pillar: 'IDENTITY',
    title: 'Revocation of Implicit Trust & Two-Person Rule (M-of-N Quorum)',
    standardReference: 'NIST SP 800-207 Section 2.1 / NSA Zero Trust User Pillar Advancing Maturity',
    status: 'ENFORCED',
    enforcementMechanism:
      'Zero single-person administrative privileges. All cryptographic key exports, decompiler binary updates, and SLEIGH commits require 2-of-3 independent ML-DSA-87 cryptographic signatures. Ephemeral access tokens expire after 15 minutes.',
    insiderThreatMitigation:
      'Prevents compromised NSA engineers from modifying cryptographic baselines or suppressing decompilation vulnerabilities unilaterally.',
  },
  {
    id: 'zt-pillar-device',
    pillar: 'DEVICE',
    title: 'Hardware-Rooted TPM 2.0 PCR Sealing & MicroVM Confidential Jails',
    standardReference: 'NSA Advancing Zero Trust Maturity: Device Pillar / DoD ZTA 2.0',
    status: 'ENFORCED',
    enforcementMechanism:
      'All analysis workstations isolated inside ephemeral Firecracker microVMs with AMD SEV-SNP hardware memory encryption. Host OS read-only squashfs with blocked ptrace, execve, and raw socket creation.',
    insiderThreatMitigation:
      'A compromised analyst with physical or shell access cannot dump volatile memory or execute unverified debugging hooks on Ghidra processes.',
  },
  {
    id: 'zt-pillar-network',
    pillar: 'NETWORK',
    title: 'Microsegmentation & Mutual TLS with NIST FIPS 203 ML-KEM-1024',
    standardReference: 'NIST SP 800-207 Section 3.1 / NSA CSI Deploying Zero Trust Network Architecture',
    status: 'ENFORCED',
    enforcementMechanism:
      'Lateral movement completely severed. All inter-analyst network paths dropped. Intra-agency traffic requires Mutual TLS 1.3 with FIPS 203 ML-KEM-1024 and FIPS 204 ML-DSA-87. Default-deny eBPF kernel packet filters.',
    insiderThreatMitigation:
      'Compromised personnel cannot probe neighboring workstations, scan internal repositories, or exfiltrate binary corpora across subnets.',
  },
  {
    id: 'zt-pillar-application',
    pillar: 'APPLICATION',
    title: 'Byzantine Fault Tolerant (BFT) 3-of-4 Multi-Engine Lifter Consensus',
    standardReference: 'NSA Zero Trust Application Pillar / CNSA 2.0 High-Assurance Binary Auditing',
    status: 'ENFORCED',
    enforcementMechanism:
      'Ghidra decompilation output is cross-verified against independent Radare2/Rizin (ESIL), angr (VEX IR), and LLVM-MC lifters. Any single-engine divergence triggers an automated freeze and forensic review.',
    insiderThreatMitigation:
      'Neutralizes backdoors, falsified P-Code translations, or poisoned SLEIGH processor specs injected by rogue engineering personnel.',
  },
  {
    id: 'zt-pillar-data',
    pillar: 'DATA',
    title: 'Cryptographically Chained Append-Only Audit Ledger (ML-DSA-87)',
    standardReference: 'DoD Zero Trust Data Pillar / FIPS 140-3 Hardware Audit Log Integrity',
    status: 'ENFORCED',
    enforcementMechanism:
      'Every decompiler execution, CBOM generation, and cryptographic assessment is committed to an append-only SHA-384 Merkle chain signed with quantum-resistant ML-DSA-87. Tampering breaks the immutable hash link.',
    insiderThreatMitigation:
      'Compromised personnel cannot delete, backdate, or alter audit logs to cover unauthorized access or data exfiltration.',
  },
  {
    id: 'zt-pillar-visibility',
    pillar: 'VISIBILITY',
    title: 'Insider Threat Deception Grid, Canary Repositories & Real-Time EBPF Telemetry',
    standardReference: 'CISA / NSA Insider Threat Mitigation Guide / MITRE D3FEND Decoy Environment',
    status: 'ENFORCED',
    enforcementMechanism:
      'High-interaction decoy credentials (~/.ghidra/ghidra_server_admin_creds.xml) and canary repos deployed. Any unauthorized directory browsing or credential harvesting triggers instant eBPF SIGKILL and SOC alert.',
    insiderThreatMitigation:
      'Trips and fingerprints compromised personnel immediately upon attempting unauthorized lateral discovery.',
  },
];

export let COMPROMISED_PERSONNEL_ROSTER: CompromisedPersonnelRecord[] = [
  {
    id: 'NSA-OP-9014',
    callsign: 'SPECTRE-LEAD',
    name: 'Operator 9014 (SRE Senior Engineer)',
    clearanceLevel: 'TS/SCI with Counterintelligence Polygraph',
    assignedDivision: 'Cryptanalysis & SRE Directorate (Ghidra Engineering)',
    compromiseIndicator:
      'Attempted to bypass 3-Way BFT Lifter Quorum by pushing unverified SLEIGH .sla specification with altered ML-KEM scalar multiplication constants.',
    containmentStatus: 'QUARANTINED_NULL_NETNS',
    twoPersonRuleRequired: true,
    hardwareTokenRevoked: true,
    quarantinedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'NSA-ENG-2204',
    callsign: 'CIPHER-VAL',
    name: 'Engineer 2204 (Processor Spec Developer)',
    clearanceLevel: 'TS/SCI with Full Scope Polygraph',
    assignedDivision: 'Advanced Network Operations / Firmware Auditing',
    compromiseIndicator:
      'Accessed decoy administrative credential breadcrumb (~/.ghidra/ghidra_server_admin_creds.xml) outside scheduled operational maintenance window.',
    containmentStatus: 'CREDENTIALS_REVOKED',
    twoPersonRuleRequired: true,
    hardwareTokenRevoked: true,
    quarantinedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'NSA-CTR-7712',
    callsign: 'KESTREL-DEV',
    name: 'Contractor 7712 (Systems Integration Lead)',
    clearanceLevel: 'Top Secret / Special Access Program (SAP)',
    assignedDivision: 'Defense Infrastructure / Avionics Gateway Bridge',
    compromiseIndicator:
      'Anomalous outbound DNS exfiltration attempt targeting unauthorized external IP, trapped by Zero Trust perimeter egress sinkhole.',
    containmentStatus: 'HONEYPOT_MONITORED',
    twoPersonRuleRequired: true,
    hardwareTokenRevoked: true,
    quarantinedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
  },
];

export let TWO_PERSON_REQUESTS: TwoPersonAuthorizationRequest[] = [
  {
    id: 'tpi-req-101',
    action: 'Commit Hardened FIPS 204 ML-DSA-87 SLEIGH Processor Module',
    requesterId: 'NSA-AUDITOR-01',
    requesterName: 'Lead Cryptanalyst Vance',
    approver1Id: 'NSA-DIRECTOR-02',
    approver1Sig: 'SIG-MLDSA87-0x98A1...F044',
    status: 'PENDING_DUAL_AUTH',
    targetAsset: '/opt/ghidra/Ghidra/Processors/ARM/data/languages/armv9_crypto.sla',
    pqcAttestationToken: 'PQC-TPI-TOKEN-7719-MLKEM',
  },
  {
    id: 'tpi-req-102',
    action: 'Rotate F-22 Avionics Master Rekey Root Keys',
    requesterId: 'NSA-AVIONICS-04',
    requesterName: 'Avionics Crypto Officer Chen',
    approver1Id: 'NSA-DIRECTOR-02',
    approver1Sig: 'SIG-MLDSA87-0x44B2...A109',
    approver2Id: 'NSA-SECURITY-CHIEF-01',
    approver2Sig: 'SIG-MLDSA87-0x1198...C881',
    status: 'APPROVED_RATIFIED',
    targetAsset: 'F-22 CIP-1/CIP-2 Tactical IFDL Key Schedule',
    pqcAttestationToken: 'PQC-TPI-TOKEN-9041-CNSA2',
  },
];

export function getZeroTrustGlobalStatus(): ZeroTrustGlobalStatus {
  return ZERO_TRUST_GLOBAL_STATUS;
}

export function getZeroTrustPillarControls(): ZeroTrustPillarControl[] {
  return ZERO_TRUST_PILLAR_CONTROLS;
}

export function getCompromisedPersonnelRoster(): CompromisedPersonnelRecord[] {
  return COMPROMISED_PERSONNEL_ROSTER;
}

export function getTwoPersonRequests(): TwoPersonAuthorizationRequest[] {
  return TWO_PERSON_REQUESTS;
}

export function enforceGlobalZeroTrustLockdown(): {
  status: string;
  timestamp: string;
  actionsExecuted: string[];
} {
  ZERO_TRUST_GLOBAL_STATUS = {
    ...ZERO_TRUST_GLOBAL_STATUS,
    threatLevel: 'DEFCON-1 ZERO-TRUST ALL-LEVELS HARDENED',
    twoPersonIntegrityEnforced: true,
    singleAdminAccessBlocked: true,
    microVMConfidentialComputingEnforced: true,
    allPersonnelImplicitTrustRevoked: true,
    lastLockdownTimestamp: new Date().toISOString(),
  };

  COMPROMISED_PERSONNEL_ROSTER = COMPROMISED_PERSONNEL_ROSTER.map((p) => ({
    ...p,
    containmentStatus: 'QUARANTINED_NULL_NETNS' as const,
    hardwareTokenRevoked: true,
    twoPersonRuleRequired: true,
  }));

  return {
    status: 'GLOBAL_ZERO_TRUST_ENFORCED',
    timestamp: new Date().toISOString(),
    actionsExecuted: [
      'Revoked implicit trust for all human personnel across all security classifications',
      'Enforced mandatory Two-Person Rule (2-of-3 M-of-N Quorum) on all cryptographic and code modifications',
      'Terminated unverified analyst sessions and isolated workstations in null netns microVMs',
      'Hardware TPM 2.0 PCR re-attestation enforced with 15-minute token rotation',
      'Severed all lateral network paths between analyst clusters via eBPF kernel firewall',
      'Chained all active audit trails with FIPS 204 ML-DSA-87 tamper-evident signatures',
    ],
  };
}

export function quarantinePersonnel(
  personnelId: string,
  reason: string
): { success: boolean; record: CompromisedPersonnelRecord } {
  let record = COMPROMISED_PERSONNEL_ROSTER.find((p) => p.id === personnelId);
  if (!record) {
    record = {
      id: personnelId,
      callsign: `SUSPECT-${Date.now().toString().slice(-4)}`,
      name: `Analyst ${personnelId}`,
      clearanceLevel: 'TS/SCI (Suspended)',
      assignedDivision: 'Under Active Counterintelligence Triage',
      compromiseIndicator: reason,
      containmentStatus: 'QUARANTINED_NULL_NETNS',
      twoPersonRuleRequired: true,
      hardwareTokenRevoked: true,
      quarantinedAt: new Date().toISOString(),
    };
    COMPROMISED_PERSONNEL_ROSTER.unshift(record);
  } else {
    record.containmentStatus = 'QUARANTINED_NULL_NETNS';
    record.hardwareTokenRevoked = true;
    record.compromiseIndicator = reason;
  }

  ZERO_TRUST_GLOBAL_STATUS.activeQuarantinedPersonnelCount =
    COMPROMISED_PERSONNEL_ROSTER.filter((p) => p.containmentStatus !== 'UNDER_SURVEILLANCE').length;

  return { success: true, record };
}

export function approveTwoPersonAuth(
  requestId: string,
  approverId: string,
  approverName: string
): { success: boolean; request: TwoPersonAuthorizationRequest } {
  const req = TWO_PERSON_REQUESTS.find((r) => r.id === requestId);
  if (!req) {
    throw new Error('Authorization request not found');
  }

  if (!req.approver1Id) {
    req.approver1Id = approverId;
    req.approver1Sig = `SIG-MLDSA87-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
    req.status = 'PENDING_DUAL_AUTH';
  } else if (!req.approver2Id && req.approver1Id !== approverId) {
    req.approver2Id = approverId;
    req.approver2Sig = `SIG-MLDSA87-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
    req.status = 'APPROVED_RATIFIED';
  }

  return { success: true, request: req };
}

