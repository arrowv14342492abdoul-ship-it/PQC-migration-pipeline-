import {
  NSARepository,
  GhidraAnalysisResult,
  WalkoffPlaybook,
} from '../types/nsaSoftware.js';

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

export function runSimulatedGhidraAnalysis(presetId: string = 'rsa-montgomery'): GhidraAnalysisResult {
  const preset = SAMPLE_GHIDRA_PRESETS.find((p) => p.id === presetId) || SAMPLE_GHIDRA_PRESETS[0];

  return {
    binaryName: `${preset.id}.elf`,
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
    detectedVulnerabilities: preset.vulnerabilities,
    analysisMetrics: {
      functionsCount: preset.symbols.filter((s) => s.type === 'Function').length,
      basicBlocksCount: 14,
      cyclomaticComplexity: 4,
      analysisTimeMs: 142,
    },
  };
}

export const SAMPLE_WALKOFF_PLAYBOOK: WalkoffPlaybook = {
  id: 'playbook-pqc-containment',
  title: 'Automated Post-Quantum Harvest-Now-Decrypt-Later Containment (WALKOFF SOAR)',
  trigger: 'SIEM Alert: Detection of Classical RSA-2048 Ingress on Critical Telemetry Port',
  description:
    'NSA WALKOFF workflow coordinating Ghidra headless binary inspection, Timely telemetry querying, and automated SIMP crypto policy enforcement.',
  nodes: [
    {
      id: 'node-1',
      title: 'Ingest Ingress PCAP & Binary Payload',
      app: 'NiFi Pipeline',
      action: 'Extract raw executable attachment and TLS handshake metadata',
      status: 'success',
      outputSnippet: 'Extracted payload SHA256: 9f86d081... TLS Cipher: ECDHE-RSA-AES256-GCM-SHA384 (Deprecated)',
    },
    {
      id: 'node-2',
      title: 'Execute Ghidra Headless Decompilation',
      app: 'Ghidra Headless',
      action: 'Run automated Ghidra script to inspect crypto primitives and Montgomery loops',
      status: 'success',
      outputSnippet: 'Decompiler confirmed RSA-2048 discrete log vulnerability (CWE-327). 0 post-quantum primitives.',
    },
    {
      id: 'node-3',
      title: 'Query Timely Time-Series Metric Anomaly',
      app: 'Timely Metrics',
      action: 'Evaluate egress traffic volume to detect bulk encrypted data exfiltration (HNDL activity)',
      status: 'success',
      outputSnippet: 'Accumulo cell query returned 4.2 GB bulk payload transfer to untrusted ASN within 10 minutes.',
    },
    {
      id: 'node-4',
      title: 'Enforce SIMP Host Hardening Rule',
      app: 'SIMP Hardening',
      action: 'Push Puppet policy update-crypto-policies --set FIPS:CNSA to isolate classical TLS endpoints',
      status: 'success',
      outputSnippet: 'Applied FIPS:CNSA configuration on 18 core clusters. Enforced ML-KEM-768 hybrid requirement.',
    },
    {
      id: 'node-5',
      title: 'Revoke Classical X.509 Certificates',
      app: 'SOAR Containment',
      action: 'Issue CRL revocation for compromised RSA leaf keys and notify Security Operations Center',
      status: 'success',
      outputSnippet: 'Revocation broadcast complete. Automated incident ticket #NSA-SOAR-2026-881 closed.',
    },
  ],
};
