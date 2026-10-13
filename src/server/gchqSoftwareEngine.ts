import crypto from 'crypto';
import {
  GCHQRepository,
  CyberChefRecipeStep,
  CyberChefBakeResult,
  GafferGraphData,
} from '../types/gchqSoftware.js';

export const GCHQ_REPOSITORIES: GCHQRepository[] = [
  {
    id: 'cyberchef',
    name: 'CyberChef',
    repoName: 'gchq/CyberChef',
    githubUrl: 'https://github.com/gchq/CyberChef',
    description:
      'The Cyber Swiss Army Knife — a simple, intuitive web app for carrying out all manner of "cyber" operations within a web browser, including XOR, AES, Base64, regex, post-quantum formatting, and automated Magic decoding.',
    category: 'Cyber Swiss Army Knife',
    stars: 28900,
    forks: 3400,
    license: 'Apache-2.0',
    primaryLanguage: 'JavaScript / HTML',
    status: 'Flagship',
    officialTagline: 'The Cyber Swiss Army Knife for encryption, encoding, compression, and analysis',
    keyFeatures: [
      'Over 300+ drag-and-drop operations ranging from simple ciphers to forensic de-obfuscation',
      'Automated "Magic" algorithm detecting encoded layers and compression formats',
      'Client-side execution ensuring sensitive data never leaves the analyst workstation',
      'Support for Post-Quantum DER/PEM certificates and raw cryptographic byte streams',
      'Recipe link sharing and repeatable forensic pipeline configuration',
    ],
    architectureOverview:
      'Pure modular client-side JavaScript architecture utilizing web workers for asynchronous streaming of gigabyte-sized files and zero-telemetry in-browser processing.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/CyberChef.git',
      docker: 'docker run -d -p 8080:80 mpepping/cyberchef:latest',
      run: 'npm install && npm run build && npx http-server build/prod',
    },
    gchqMissionContext:
      'Originally conceived by an analyst inside GCHQ in 2014 to eliminate repetitive script writing for de-obfuscating suspicious malware strings and decoding packet captures.',
    liveDemoUrl: 'https://gchq.github.io/CyberChef',
  },
  {
    id: 'gaffer',
    name: 'Gaffer',
    repoName: 'gchq/Gaffer',
    githubUrl: 'https://github.com/gchq/Gaffer',
    description:
      'A large-scale graph database framework optimized for cyber threat intelligence, network link analysis, and entity resolution across trillions of nodes and edges with property aggregations.',
    category: 'Graph Analytics',
    stars: 2200,
    forks: 390,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Flagship',
    officialTagline: 'Scalable graph database framework for high-speed entity and link analytics',
    keyFeatures: [
      'Ingestion and querying of billions of interconnected cyber threat intelligence nodes',
      'Extensible schema with user-defined property aggregation (counts, hyperloglog, bloom filters)',
      'Pluggable backends: Apache Accumulo, Apache HBase, and Federator',
      'Direct Python integration via gafferpy and Jupyter notebook visualization',
      'Built-in security labeling with fine-grained visibility predicates',
    ],
    architectureOverview:
      'Distributed storage architecture using sorted key-value tablets to store adjacency lists, enabling sub-second multi-hop graph traversals at petabyte scale.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/Gaffer.git',
      docker: 'docker run -p 8080:8080 gchq/gaffer-rest:latest',
      run: 'mvn clean install -Pquick',
    },
    gchqMissionContext:
      'Engineered by GCHQ data scientists to connect disparate signals intelligence, C2 telemetry, and threat actor infrastructure into unified knowledge graphs.',
  },
  {
    id: 'stroom',
    name: 'Stroom',
    repoName: 'gchq/stroom',
    githubUrl: 'https://github.com/gchq/stroom',
    description:
      'High-throughput scalable data processing, indexing, translation, and analysis platform developed by GCHQ to handle complex multi-source enterprise and security event logs.',
    category: 'Audit & Event Logging',
    stars: 1350,
    forks: 230,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Active',
    officialTagline: 'Scalable data processing and log translation pipeline engine',
    keyFeatures: [
      'Scalable XML/JSON/Syslog parsing and schema-validated normalization',
      'Complex event processing with visual dataflow pipeline editor',
      'Direct integration with Apache Lucene for ultra-fast full-text log search',
      'High-assurance data retention and tamper-resistant storage architectures',
    ],
    architectureOverview:
      'Microservice log ingestion pipeline processing streams through XSLT translation pipelines into Lucene indexes and cold-storage repositories.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/stroom.git',
      docker: 'docker-compose up -d',
      run: 'gradlew clean build',
    },
    gchqMissionContext:
      'Used across UK sovereign networks to aggregate, validate, and search mission-critical security logs according to strict compliance standards.',
  },
  {
    id: 'event-logging',
    name: 'Event-Logging',
    repoName: 'gchq/event-logging',
    githubUrl: 'https://github.com/gchq/event-logging',
    description:
      'Standardized schema definitions and Java/XML libraries providing unified, auditable security logging structures for government systems and defense operations.',
    category: 'Audit & Event Logging',
    stars: 580,
    forks: 90,
    license: 'Apache-2.0',
    primaryLanguage: 'Java / XML',
    status: 'Active',
    officialTagline: 'Comprehensive XML schemas and Java models for auditable event logging',
    keyFeatures: [
      'Strict XML Schema Definition (XSD) enforcing comprehensive audit trails',
      'Captures user identity, system actions, data classifications, and outcomes',
      'Native bindings for generating compliant logs in Java, Scala, and Kotlin',
      'Compliant with UK National Cyber Security Centre (NCSC) logging guidelines',
    ],
    architectureOverview:
      'XSD schemas and JAXB code-generation plugins compiling audit models directly into Java class hierarchies for zero-overhead validation.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/event-logging.git',
      run: 'mvn clean install',
    },
    gchqMissionContext:
      'Guarantees non-repudiation and forensic accountability across intelligence workflows.',
  },
  {
    id: 'palisade',
    name: 'Palisade',
    repoName: 'gchq/Palisade',
    githubUrl: 'https://github.com/gchq/Palisade',
    description:
      'Dynamic data access control framework that enforces complex security policies and GDPR/privacy rules before clients can query underlying databases.',
    category: 'Data Governance',
    stars: 840,
    forks: 140,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Active',
    officialTagline: 'Dynamic policy enforcement and attribute-based access control (ABAC)',
    keyFeatures: [
      'Attribute-based access control (ABAC) dynamic policy evaluation',
      'Redaction and tokenization of sensitive PII fields on the fly',
      'Zero-trust decoupling of data consumers from raw storage engines',
      'Comprehensive audit event generation for every data access decision',
    ],
    architectureOverview:
      'Distributed Spring Boot microservices evaluating request context against policy rules and minting cryptographically signed data access tokens.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/Palisade.git',
      docker: 'docker-compose -f docker/docker-compose.yml up -d',
      run: 'mvn clean install',
    },
    gchqMissionContext:
      'Ensures classified and sensitive signals data is strictly partitioned and accessible solely to vetted personnel on a need-to-know basis.',
  },
  {
    id: 'koryphe',
    name: 'Koryphe',
    repoName: 'gchq/koryphe',
    githubUrl: 'https://github.com/gchq/koryphe',
    description:
      'A library of composable, reusable functions, predicates, and binary operators designed to perform in-memory data validation, filtering, and aggregation.',
    category: 'Core Libraries',
    stars: 490,
    forks: 75,
    license: 'Apache-2.0',
    primaryLanguage: 'Java',
    status: 'Active',
    officialTagline: 'Composable predicates and aggregation functions for high-speed streaming',
    keyFeatures: [
      'Composable logical predicates (AND, OR, NOT, Regex, Range, IsMoreThan)',
      'Stateful aggregation operators (Sum, Max, Min, HyperLogLogPlus, BloomFilter)',
      'JSON-serializable execution pipelines for remote distributed execution',
    ],
    architectureOverview: 'Lightweight Java utility library with zero external runtime dependencies.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/koryphe.git',
      run: 'mvn clean install',
    },
    gchqMissionContext:
      'Underpins Gaffer graph query filters and real-time streaming predicates across GCHQ systems.',
  },
  {
    id: 'bailo',
    name: 'Bailo',
    repoName: 'gchq/Bailo',
    githubUrl: 'https://github.com/gchq/Bailo',
    description:
      'AI and Machine Learning model lifecycle management system developed by GCHQ to ensure ethical, safe, auditable, and secure deployment of AI models.',
    category: 'AI & ML Governance',
    stars: 710,
    forks: 110,
    license: 'Apache-2.0',
    primaryLanguage: 'TypeScript / Node.js',
    status: 'Active',
    officialTagline: 'Secure Machine Learning model management and compliance governance',
    keyFeatures: [
      'Comprehensive model cards and risk assessment checklists',
      'Automated schema-driven approval workflows for classified AI deployment',
      'Model artifact provenance tracking and cryptographic binary signing',
      'Alignment with NCSC Guidelines for Secure AI System Development',
    ],
    architectureOverview:
      'Node.js / Express backend with Next.js frontend and MongoDB store managing model metadata, versioning, and approval gates.',
    quickStartCommands: {
      clone: 'git clone https://github.com/gchq/Bailo.git',
      docker: 'docker-compose up -d',
      run: 'npm install && npm run build',
    },
    gchqMissionContext:
      'Enforces rigorous governance, security vetting, and safety assurance before operational deployment of AI/ML models in national defense.',
  },
];

export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

export function bakeCyberChef(
  input: string,
  recipe: CyberChefRecipeStep[]
): CyberChefBakeResult {
  const startTime = Date.now();
  let current = input;
  const stepsOut: {
    stepIndex: number;
    op: any;
    outputSnippet: string;
    durationMs: number;
  }[] = [];

  for (let i = 0; i < recipe.length; i++) {
    const step = recipe[i];
    if (!step.enabled) continue;
    const stepStart = Date.now();

    try {
      switch (step.op) {
        case 'To Base64':
          current = Buffer.from(current, 'utf-8').toString('base64');
          break;

        case 'From Base64':
          try {
            current = Buffer.from(current.trim(), 'base64').toString('utf-8');
          } catch {
            current = '[Error: Invalid Base64 String]';
          }
          break;

        case 'To Hex':
          current = Buffer.from(current, 'utf-8').toString('hex');
          break;

        case 'From Hex':
          try {
            const cleanHex = current.replace(/[\s\r\n:]+/g, '');
            current = Buffer.from(cleanHex, 'hex').toString('utf-8');
          } catch {
            current = '[Error: Invalid Hex String]';
          }
          break;

        case 'URL Encode':
          current = encodeURIComponent(current);
          break;

        case 'URL Decode':
          current = decodeURIComponent(current);
          break;

        case 'ROT13':
          current = current.replace(/[a-zA-Z]/g, (c) => {
            const code = c.charCodeAt(0);
            const base = code >= 97 ? 97 : 65;
            return String.fromCharCode(((code - base + 13) % 26) + base);
          });
          break;

        case 'Defang IP':
          current = current.replace(
            /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g,
            '$1[.]$2[.]$3[.]$4'
          );
          break;

        case 'Defang URL':
          current = current
            .replace(/https:\/\//gi, 'hxxps://')
            .replace(/http:\/\//gi, 'hxxp://')
            .replace(/\./g, '[.]');
          break;

        case 'Reverse':
          current = current.split('').reverse().join('');
          break;

        case 'SHA-256':
          current = crypto.createHash('sha256').update(current, 'utf-8').digest('hex');
          break;

        case 'SHA-512':
          current = crypto.createHash('sha512').update(current, 'utf-8').digest('hex');
          break;

        case 'MD5':
          current = crypto.createHash('md5').update(current, 'utf-8').digest('hex');
          break;

        case 'Calculate Entropy': {
          const ent = calculateShannonEntropy(current);
          current = `Calculated Shannon Entropy: ${ent} bits/byte (Scale: 0.0 to 8.0, High entropy > 7.2 indicates encryption/compression)`;
          break;
        }

        case 'Magic (Auto-Detect)': {
          // Detect base64, hex, url, hash
          const detections: string[] = [];
          if (/^[A-Za-z0-9+/=]{16,}$/.test(current.trim())) {
            try {
              const decoded = Buffer.from(current.trim(), 'base64').toString('utf-8');
              detections.push(`Base64 Detected -> Decoded: "${decoded.slice(0, 60)}"`);
            } catch {
              // Ignore
            }
          }
          if (/^[0-9a-fA-F]{16,}$/.test(current.trim())) {
            try {
              const decoded = Buffer.from(current.trim(), 'hex').toString('utf-8');
              detections.push(`Hex Byte Stream Detected -> Decoded: "${decoded.slice(0, 60)}"`);
            } catch {
              // Ignore
            }
          }
          if (current.includes('%20') || current.includes('%3A')) {
            detections.push(`URL-Encoded String Detected -> Decoded: "${decodeURIComponent(current).slice(0, 60)}"`);
          }
          if (/^[0-9a-f]{64}$/i.test(current.trim())) {
            detections.push(`SHA-256 Hash Detected (256 bits)`);
          }
          current = detections.length > 0 ? detections.join('\n') : `Magic Analysis: Standard ASCII string (Entropy: ${calculateShannonEntropy(current)})`;
          break;
        }

        case 'To Binary':
          current = current
            .split('')
            .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ');
          break;

        case 'From Binary':
          current = current
            .trim()
            .split(/\s+/)
            .map((b) => String.fromCharCode(parseInt(b, 2)))
            .join('');
          break;

        case 'XOR': {
          const key = (step.args?.key || 'GCHQ').charCodeAt(0);
          current = current
            .split('')
            .map((c) => String.fromCharCode(c.charCodeAt(0) ^ key))
            .join('');
          break;
        }

        default:
          break;
      }
    } catch (err: any) {
      current = `[Operation Error in ${step.op}: ${err.message}]`;
    }

    stepsOut.push({
      stepIndex: i + 1,
      op: step.op,
      outputSnippet: current.length > 80 ? current.slice(0, 80) + '...' : current,
      durationMs: Date.now() - stepStart,
    });
  }

  return {
    recipe: recipe.filter((r) => r.enabled).map((r) => r.op),
    inputLength: input.length,
    outputLength: current.length,
    output: current,
    executionTimeMs: Date.now() - startTime,
    steps: stepsOut,
    entropy: calculateShannonEntropy(current),
  };
}

export function getSampleGafferThreatGraph(): GafferGraphData {
  return {
    nodes: [
      { id: 'apt_cozy_bear', label: 'APT29 / Nobelium', group: 'Threat Actor', properties: { origin: 'State-Sponsored', motivation: 'Espionage', confidence: 0.95 } },
      { id: 'malware_quantum_harvest', label: 'Q-Harvester Dropper', group: 'Malware', properties: { family: 'TLS Exfiltrator', target: 'PQC Transitional Nodes', sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' } },
      { id: 'c2_server_1', label: '185.220.101.5', group: 'C2 Server', properties: { asn: 'AS200052', location: 'Frankfurt DE', defanged: '185[.]220[.]101[.]5' } },
      { id: 'domain_crypto_fake', label: 'quantum-tls-update.org', group: 'Indicator', properties: { registrar: 'NameCheap', defanged: 'quantum-tls-update[.]org' } },
      { id: 'cve_classical_leak', label: 'CVE-2024-RSA-LEAK', group: 'Vulnerability', properties: { cvss: 9.8, type: 'Montgomery Side-Channel & Shor Factoring' } },
      { id: 'victim_power_grid', label: 'UK National Grid OT Substation 4', group: 'Target Entity', properties: { sector: 'Energy & Critical Infrastructure', status: 'Compromised Perimeter' } },
      { id: 'victim_defense_contractor', label: 'Sovereign Aerospace Avionics', group: 'Target Entity', properties: { sector: 'Defense Industrial Base', status: 'Targeted Ingress' } },
    ],
    edges: [
      { id: 'e1', source: 'apt_cozy_bear', target: 'malware_quantum_harvest', relationship: 'OPERATES', weight: 0.95, confidence: 98 },
      { id: 'e2', source: 'malware_quantum_harvest', target: 'c2_server_1', relationship: 'BEACONS_TO', weight: 0.9, confidence: 94 },
      { id: 'e3', source: 'c2_server_1', target: 'domain_crypto_fake', relationship: 'RESOLVES_TO', weight: 0.85, confidence: 91 },
      { id: 'e4', source: 'malware_quantum_harvest', target: 'cve_classical_leak', relationship: 'EXPLOITS', weight: 0.92, confidence: 96 },
      { id: 'e5', source: 'malware_quantum_harvest', target: 'victim_power_grid', relationship: 'TARGETS', weight: 0.88, confidence: 90 },
      { id: 'e6', source: 'apt_cozy_bear', target: 'victim_defense_contractor', relationship: 'TARGETS', weight: 0.94, confidence: 95 },
    ],
    summary: {
      totalEntities: 7,
      totalRelationships: 6,
      subgraphDensity: '0.285 (Sparse High-Confidence Threat Cluster)',
      riskCluster: 'CRITICAL: Critical Infrastructure Harvest-Now-Decrypt-Later Operation',
    },
  };
}
