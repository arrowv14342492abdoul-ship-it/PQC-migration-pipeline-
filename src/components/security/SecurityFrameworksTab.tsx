import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  BookOpen,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
  Workflow,
  Target,
  Activity,
  Code,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ListFilter,
  Zap,
  Sliders,
  FileCheck2,
  FileText,
  Eye,
  Server,
  Network,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SecurityFrameworksTabProps {
  onLoadDefensivePresetToPipeline?: () => void;
}

export const SecurityFrameworksTab: React.FC<SecurityFrameworksTabProps> = ({
  onLoadDefensivePresetToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'methodologies' | 'mitre-attack' | 'detection-engineering' | 'coverage-audit'
  >('methodologies');

  // Methodologies state
  const [selectedMethodology, setSelectedMethodology] = useState<
    'ptes' | 'nist800-115' | 'owasp-wstg' | 'osstmm'
  >('ptes');
  const [selectedPtesPhase, setSelectedPtesPhase] = useState<number>(0);

  // MITRE ATT&CK state
  const [selectedTactic, setSelectedTactic] = useState<string>('all');
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>('T1190');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Remediation state
  const [selectedRemediationCategory, setSelectedRemediationCategory] =
    useState<string>('crypto');

  // Coverage calculator state
  const [defenseScores, setDefenseScores] = useState<Record<string, number>>({
    'Initial Access': 85,
    Execution: 70,
    Persistence: 60,
    'Privilege Escalation': 75,
    'Defense Evasion': 55,
    'Credential Access': 80,
    Discovery: 65,
    'Lateral Movement': 50,
    Collection: 70,
    'Command and Control': 60,
    Exfiltration: 80,
    Impact: 75,
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // PTES 7 Phases Data
  const ptesPhases = [
    {
      num: 1,
      name: 'Pre-engagement Interactions',
      objective: 'Establish legal boundaries, scope, rules of engagement (RoE), and emergency contacts.',
      deliverables: ['Scoping Document', 'Rules of Engagement (RoE)', 'Authorization Letter (Get-Out-Of-Jail Letter)', 'Escalation Matrix'],
      keyActivities: [
        'Define in-scope vs. out-of-scope CIDR blocks, hostnames, and SaaS components',
        'Establish test windows, black-out periods, and peak-traffic avoidance',
        'Agree on exploitation thresholds (e.g., verifying exploitability vs. executing destructive payloads)',
        'Sign NDAs, third-party cloud provider penetration testing approval forms (AWS, Azure, GCP)',
      ],
      nistReference: 'NIST SP 800-115 Section 2.1 (Planning & Scoping Phase)',
    },
    {
      num: 2,
      name: 'Intelligence Gathering (Reconnaissance)',
      objective: 'Collect open-source intelligence (OSINT) and identify external exposure without intrusive actions.',
      deliverables: ['OSINT Dossier', 'DNS & ASN Topology Map', 'Credential Exposure Digest', 'External Footprint Inventory'],
      keyActivities: [
        'Passive reconnaissance via Certificate Transparency (crt.sh), BGP looking glasses, and WHOIS/RDAP',
        'DNS enumeration (subdomain brute-forcing, zone transfer verification, DNSSEC inspection)',
        'Public repository & leak analysis (trufflehog, gitleaks, dark web breach credential dumps)',
        'Cloud storage discovery (open S3 buckets, exposed Azure blobs, public Google Cloud Storage)',
      ],
      nistReference: 'NIST SP 800-115 Section 4.2 (Discovery Techniques - Information Gathering)',
    },
    {
      num: 3,
      name: 'Threat Modeling & Asset Mapping',
      objective: 'Model organizational risk profiles, critical assets, threat actor capabilities, and business impact vectors.',
      deliverables: ['Threat Vector Matrix', 'Crown Jewels Asset Registry', 'Adversary Profile Alignment (MITRE TTPs)'],
      keyActivities: [
        'Identify high-value business assets (payment gateways, customer PII, trade secrets, HSM root keys)',
        'Map primary threat agent motivations (financial cybercrime, industrial espionage, nation-state APT)',
        'Correlate intelligence gather results with viable attack avenues and supply chain dependencies',
        'Establish post-quantum cryptographic risk vectors (e.g., Harvest Now, Decrypt Later threats against long-lived RSA/ECC archives)',
      ],
      nistReference: 'NIST SP 800-115 Section 2.3 (Risk Analysis and Assessment Prioritization)',
    },
    {
      num: 4,
      name: 'Vulnerability Analysis',
      objective: 'Discover and analyze security flaws, misconfigurations, outdated cipher suites, and software defects.',
      deliverables: ['Vulnerability Catalog', 'CVE/CWE Mapping Report', 'False-Positive Triage Analysis'],
      keyActivities: [
        'Automated and manual port scanning, protocol fingerprinting, and service banner analysis',
        'Web application dynamic assessment (OWASP Top 10, business logic flaw identification)',
        'Cryptographic audit: Detecting deprecated TLS 1.0/1.1, weak ciphers (RC4, 3DES), and legacy RSA-1024/2048 keys',
        'API endpoint schema fuzzing, authorization token tampering, and IDOR validation',
      ],
      nistReference: 'NIST SP 800-115 Section 4.3 (Vulnerability Scanning and Assessment Techniques)',
    },
    {
      num: 5,
      name: 'Exploitation (Controlled Verification)',
      objective: 'Validate vulnerabilities with minimal operational impact to confirm true positives and business risk.',
      deliverables: ['Validated Findings Proof-of-Concept', 'Exploit Impact Rating', 'Telemetry Trigger Log'],
      keyActivities: [
        'Execute controlled, non-destructive proofs-of-concept to verify vulnerability exploitability',
        'Bypass anti-automation and web application firewalls (WAF) using protocol-level techniques',
        'Validate authentication flaws (session fixation, JWT signature manipulation, credential stuffing resilience)',
        'Ensure continuous logging of all test actions with precise timestamps to support defensive blue team triage',
      ],
      nistReference: 'NIST SP 800-115 Section 5.1 (Target Penetration and Verification)',
    },
    {
      num: 6,
      name: 'Post-Exploitation & Impact Analysis',
      objective: 'Determine true business exposure by evaluating lateral movement paths, privilege escalation, and data sensitivity.',
      deliverables: ['Lateral Movement Path Diagram', 'Data Exposure Impact Assessment', 'Host Restoration Checklist'],
      keyActivities: [
        'Assess potential lateral movement routes across network segmentation zones (DMZ to Internal LAN)',
        'Audit privilege escalation vectors (misconfigured RBAC, unquoted service paths, excessive IAM roles)',
        'Verify database containment, secret manager isolation, and encryption-at-rest efficacy',
        'Sanitize and clean up all assessment artifacts, temporary accounts, and test beacons immediately',
      ],
      nistReference: 'NIST SP 800-115 Section 5.2 (Post-Penetration Analysis and Containment Verification)',
    },
    {
      num: 7,
      name: 'Reporting & Remediation Guidance',
      objective: 'Deliver prioritized executive summaries and actionable engineering blueprints for full remediation.',
      deliverables: ['Executive Board Briefing', 'Technical Remediation Playbook', 'CVSS v4.0 Risk Scorecard', 'Re-test Verification Protocol'],
      keyActivities: [
        'Synthesize executive summary highlighting business impact, compliance impact, and risk trends',
        'Provide step-by-step technical remediation guidance, code snippets, and configuration hardening templates',
        'Map every validated vulnerability to MITRE D3FEND defensive countermeasures and NIST CSF controls',
        'Schedule re-testing validation windows to verify effectiveness of implemented security patches',
      ],
      nistReference: 'NIST SP 800-115 Section 6.0 (Reporting and Post-Testing Activities)',
    },
  ];

  // MITRE ATT&CK Matrix Techniques Data
  const attackTechniques = [
    {
      id: 'T1190',
      tactic: 'Initial Access',
      name: 'Exploit Public-Facing Application',
      description: 'Adversaries exploit software vulnerabilities or configuration defects in internet-accessible servers, APIs, or gateway devices.',
      emulationScenario: 'Atomic Red Team test simulating HTTP request with directory traversal or command injection markers against a test endpoint.',
      telemetrySources: ['Web Server Access Logs (W3C/NGINX)', 'Network IDS (Suricata EVE-JSON)', 'EDR Process Lineage (Sysmon Event ID 1)'],
      d3fendCountermeasure: 'D3-MUD (Network Traffic Filtering) & D3-PSA (Process Spawn Analysis)',
      defensiveRemediation: 'Implement WAF virtual patching, input parameter validation, micro-segmentation, and zero-trust reverse proxies with mutual TLS (mTLS).',
      sigmaRule: `title: Suspicious Web Server Child Process Execution
id: f4811f07-88d4-4a4f-9e7b-c9a175df3291
status: production
description: Detects suspicious child processes spawned by web server daemons (nginx, httpd, w3wp.exe) indicative of web shell or T1190 exploitation.
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\\w3wp.exe'
      - '\\httpd.exe'
      - '\\nginx.exe'
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\whoami.exe'
      - '\\certutil.exe'
  condition: selection
falsepositives:
  - Legitimate administrative maintenance scripts (filter by service account)
level: high`,
    },
    {
      id: 'T1059.001',
      tactic: 'Execution',
      name: 'Command and Scripting Interpreter: PowerShell',
      description: 'Adversaries abuse PowerShell commands and scripts to execute malicious payloads, bypass AMSI, or interrogate system configurations.',
      emulationScenario: 'Invoking PowerShell with encoded command flags (-EncodedCommand) and hidden window flags (-WindowStyle Hidden).',
      telemetrySources: ['PowerShell Script Block Logging (EID 4104)', 'Module Logging (EID 4103)', 'Process Creation (Sysmon Event ID 1)'],
      d3fendCountermeasure: 'D3-SIA (Script Execution Analysis) & D3-SP (Script Sandboxing)',
      defensiveRemediation: 'Enforce Constrained Language Mode (CLM), AppLocker/WDAC application control, Script Block Logging, and AMSI provider verification.',
      sigmaRule: `title: Suspicious PowerShell Encoded or Obfuscated Execution
id: 3c5972d9-1064-4e92-9602-53b4788bbdc8
status: production
description: Detects invocation of PowerShell with base64 encoded command arguments commonly used in adversary payload execution.
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\powershell.exe'
    CommandLine|contains:
      - ' -e '
      - ' -enc '
      - ' -EncodedCommand '
      - ' -ExecutionPolicy Bypass'
  condition: selection
falsepositives:
  - Legitimate software installers or IT deployment tools (SCCM, Ansible)
level: medium`,
    },
    {
      id: 'T1003.001',
      tactic: 'Credential Access',
      name: 'OS Credential Dumping: LSASS Memory',
      description: 'Adversaries extract plaintext credentials, Kerberos tickets, or NTLM hashes by accessing the memory space of Local Security Authority Subsystem Service (LSASS).',
      emulationScenario: 'Using tools or system utilities (procdump, comsvcs.dll) requesting PROCESS_VM_READ access to lsass.exe.',
      telemetrySources: ['Process Access Logs (Sysmon Event ID 10)', 'Windows Security Log (EID 4656)', 'EDR Kernel Callbacks'],
      d3fendCountermeasure: 'D3-LSASSP (LSA Process Protection) & D3-KTC (Credential Invalidation)',
      defensiveRemediation: 'Enable Windows LSA RunAsPPL (Protected Process Light), Credential Guard (VBS), ASR (Attack Surface Reduction) rule to block credential stealing from LSASS.',
      sigmaRule: `title: LSASS Memory Dumping via Comsvcs MiniDump
id: e8a264a1-b847-4950-934c-6f81e3a47942
status: production
description: Detects command-line execution of comsvcs.dll MiniDump export targeting lsass.exe for credential harvesting.
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    CommandLine|contains|all:
      - 'comsvcs'
      - 'MiniDump'
      - 'full'
  condition: selection
falsepositives:
  - Rare legitimate crash dump collection by diagnostic scripts
level: critical`,
    },
    {
      id: 'T1021.002',
      tactic: 'Lateral Movement',
      name: 'Remote Services: SMB/Windows Admin Shares',
      description: 'Adversaries leverage SMB file sharing and administrative shares (C$, ADMIN$) to transfer files and execute code remotely via PsExec or WMI.',
      emulationScenario: 'Mounting administrative IPC$ or C$ share from a non-domain-controller endpoint followed by remote service creation.',
      telemetrySources: ['Network SMB Traffic (Port 445)', 'Security EID 5140 (Network Share Object Accessed)', 'Service Creation (EID 7045)'],
      d3fendCountermeasure: 'D3-SFL (Segment Network Flow) & D3-SC (Service Hardening)',
      defensiveRemediation: 'Block inbound port 445 at host firewall across workstations, disable SMBv1/v2 where possible, enforce SMB signing and SMB encryption.',
      sigmaRule: `title: Remote Service Creation via PsExec Pattern
id: 7915b886-c4d6-410a-8bf8-d6fb729bb5c1
status: production
description: Detects installation of remote execution services with characteristic PsExec naming patterns over RPC/SMB.
logsource:
  category: system
  product: windows
detection:
  selection:
    EventID: 7045
    ServiceName|contains:
      - 'PSEXESVC'
      - 'PAExec'
  condition: selection
falsepositives:
  - Authorized systems management software
level: high`,
    },
    {
      id: 'T1552.004',
      tactic: 'Credential Access',
      name: 'Unsecured Credentials: Private Keys',
      description: 'Adversaries search file systems, code repositories, or configuration files for unencrypted SSH private keys, TLS keys, or cryptographic certificates.',
      emulationScenario: 'Script searching filesystem for files ending in .pem, .id_rsa, .pkcs12, or inspecting ~/.ssh directories.',
      telemetrySources: ['File Integrity Monitoring (FIM)', 'Auditd Syscall 257 (openat)', 'EDR File Access Auditing'],
      d3fendCountermeasure: 'D3-FE (File Encryption) & D3-KDS (Key Derivation Separation)',
      defensiveRemediation: 'Store keys exclusively in Hardware Security Modules (HSMs) or cloud KMS, enforce PQC hybrid certificates (ML-KEM/ML-DSA), eliminate disk-stored private keys.',
      sigmaRule: `title: Suspicious Access to User SSH Private Key Files
id: b2a719c2-55ef-4d33-a309-8d1844b25e17
status: production
description: Detects non-SSH processes reading ~/.ssh/id_rsa or private key stores.
logsource:
  product: linux
  service: auditd
detection:
  selection:
    type: 'PATH'
    name|contains:
      - '/.ssh/id_rsa'
      - '/.ssh/id_ed25519'
    comm|exclude:
      - 'ssh'
      - 'sshd'
      - 'scp'
  condition: selection
falsepositives:
  - Authorized backup scripts
level: medium`,
    },
    {
      id: 'T1486',
      tactic: 'Impact',
      name: 'Data Encrypted for Impact (Ransomware)',
      description: 'Adversaries encrypt data on target systems to interrupt system availability and extort ransom.',
      emulationScenario: 'Rapid file rename operations combined with shadow copy deletion commands (vssadmin delete shadows).',
      telemetrySources: ['Volume Shadow Copy Deletion (EID 4688)', 'Mass File Modification IOPS', 'Canary File Tripwires'],
      d3fendCountermeasure: 'D3-IB (Immutable Backups) & D3-FA (File Access Anomaly Detection)',
      defensiveRemediation: 'Deploy immutable object-lock backups, restrict vssadmin execution via WDAC, install canary files in key network shares for automated tripwires.',
      sigmaRule: `title: Volume Shadow Copy Deletion via Vssadmin
id: 5b4c4fae-9c2b-4560-84a1-8d26451e6044
status: production
description: Detects execution of vssadmin attempting to delete volume shadow copies, a hallmark precursor to ransomware encryption.
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\vssadmin.exe'
    CommandLine|contains|all:
      - 'delete'
      - 'shadows'
  condition: selection
falsepositives:
  - Very rare legacy IT backup scripts
level: critical`,
    },
  ];

  // Remediation Playbooks
  const remediationPlaybooks = [
    {
      id: 'crypto',
      title: 'Cryptographic Vulnerabilities (CWE-327 / CWE-328) & Post-Quantum Hardening',
      description: 'Mitigating obsolete cipher suites, weak key sizes (RSA-1024/2048, ECDSA-P256), and transitioning to NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA).',
      attackVector: 'Store-Now-Decrypt-Later (SNDL) attacks capturing classical TLS sessions to decrypt retroactively with CRQC (Cryptographically Relevant Quantum Computers).',
      controls: [
        'Mandate TLS 1.3 with Hybrid Post-Quantum Key Exchange (X25519 + ML-KEM-768)',
        'Replace RSA-2048 signatures with ML-DSA-65 (Dilithium) or SLH-DSA-SHA2-128s',
        'Enforce Cryptographic Bill of Materials (CBOM) automation to continuously inventory all asymmetric algorithms',
        'Deploy Hardware Security Modules (HSM) supporting firmware-level lattice-based cryptography',
      ],
      codeExample: `# 1. Environment Setup:
# Install Open Quantum Safe Python bindings:
#   pip install liboqs-python pycryptodome
# Or run in preconfigured PQC container:
#   docker run -it openquantumsafe/oqs-python python3

# 2. Defensive Implementation: NIST FIPS 203 Post-Quantum Hybrid TLS Wrapper (Python oqs)
import oqs
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

def establish_pqc_hybrid_session(client_classical_pub, client_mlkem_pub):
    """
    Establish zero-trust session combining classical X25519 with post-quantum ML-KEM-768.
    Provides dual-layer defense: unbroken even if quantum computer breaks classical discrete log.
    NIST SP 800-56C dual-KDF combiner architecture.
    """
    # Step 1: Post-Quantum KEM Encapsulation (ML-KEM-768)
    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
        pqc_ciphertext, pqc_shared_secret = kem.encap_secret(client_mlkem_pub)

    # Step 2: Classical Diffie-Hellman Shared Secret (e.g., X25519)
    classical_shared_secret = compute_classical_ecdh(client_classical_pub)

    # Step 3: KDF Combiner (NIST SP 800-56C dual combiner)
    combined_entropy = classical_shared_secret + pqc_shared_secret
    master_key = HKDF(
        algorithm=hashes.SHA384(),
        length=64,
        salt=None,
        info=b"PQC-HYBRID-TLS-MASTER-SECRET-V1",
    ).derive(combined_entropy)

    return {
        "pqc_ciphertext": pqc_ciphertext,
        "master_session_key": master_key,
        "cipher_suite": "X25519_MLKEM768_AES256_GCM_SHA384",
        "compliance": "NIST FIPS 203 & CNSA 2.0 Ready"
    }`,
    },
    {
      id: 'injection',
      title: 'Injection Flaws (CWE-89 SQLi / CWE-78 Command Injection)',
      description: 'Preventing untrusted user input from altering query syntax or executing arbitrary operating system commands.',
      attackVector: 'Adversaries inject shell meta-characters or SQL Boolean/union conditions to exfiltrate database records or spawn remote shells.',
      controls: [
        'Use parameterized prepared statements exclusively for all relational database queries',
        'Avoid system shell execution APIs (system, popen, exec) - use array-based parameter execution without shell interpreters',
        'Implement strict type-validated input schemas with Zod / Pydantic',
        'Apply database user least privilege (read-only views, no DDL/DROP permissions)',
      ],
      codeExample: `// Defensive TypeScript / Node.js Implementation: Parameterized Queries & Strict Validation
import { z } from 'zod';
import { Pool } from 'pg';

const pool = new Pool();

// 1. Strict Input Schema
const QueryFilterSchema = z.object({
  tenantId: z.string().uuid(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']),
  limit: z.number().int().min(1).max(100),
});

export async function getTenantAuditRecords(input: unknown) {
  // Validate schema before database interaction
  const validated = QueryFilterSchema.parse(input);

  // 2. Enforce Parameterized Query (prevents SQL injection unconditionally)
  const sql = \`
    SELECT id, event_type, created_at, encrypted_payload
    FROM security_audit_events
    WHERE tenant_id = $1 AND status = $2
    ORDER BY created_at DESC
    LIMIT $3
  \`;

  const result = await pool.query(sql, [validated.tenantId, validated.status, validated.limit]);
  return result.rows;
}`,
    },
    {
      id: 'access_control',
      title: 'Broken Access Control & IDOR (CWE-284 / CWE-639)',
      description: 'Enforcing server-side authorization checks on every state change and object retrieval.',
      attackVector: 'Adversaries modify IDs in API requests (e.g., /api/accounts/1234 -> /api/accounts/1235) to access other tenants data.',
      controls: [
        'Enforce Attribute-Based Access Control (ABAC) or Policy-as-Code (Open Policy Agent / Cedar)',
        'Never trust client-supplied tenant or user IDs; extract authenticated identity strictly from verified cryptographically signed session tokens',
        'Adopt indirect object references (UUIDv4 or random opaque tokens) instead of sequential integers',
        'Deny all access by default; require explicit allow policies',
      ],
      codeExample: `// Defensive Implementation: ABAC Object Ownership Authorization Guard
import { Request, Response, NextFunction } from 'express';

export function authorizeResourceAccess(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Verified from mTLS / JWT signature
    const resourceId = req.params.id;

    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // 1. Load resource metadata from trusted data layer
    const resource = await db.resources.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // 2. Strict Tenant and Ownership Check
    const isOwner = resource.ownerId === user.id;
    const isTenantAdmin = user.tenantId === resource.tenantId && user.roles.includes('ADMIN');

    if (!isOwner && !isTenantAdmin) {
      // Log security violation for SIEM triage
      auditLogger.warn('Unauthorized access attempt detected', {
        userId: user.id,
        targetResource: resourceId,
        ip: req.ip,
      });
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
}`,
    },
    {
      id: 'ssrf',
      title: 'Server-Side Request Forgery (SSRF - CWE-918)',
      description: 'Protecting cloud metadata services (IMDSv2), internal microservices, and private networks from server-initiated requests.',
      attackVector: 'Adversary provides URLs pointing to 169.254.169.254 or localhost to steal IAM role credentials or query internal VPC services.',
      controls: [
        'Enforce AWS IMDSv2 (Session token required; hop limit = 1) across all compute instances',
        'Implement strict allowlisting of destination domains rather than blocklisting',
        'Disable HTTP redirection following in backend HTTP client libraries',
        'Block private IP ranges (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16) at DNS resolution layer',
      ],
      codeExample: `// Defensive Node.js Implementation: Safe URL Fetcher with DNS Resolution Validation
import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

export async function fetchSafeExternalResource(targetUrlString: string) {
  const url = new URL(targetUrlString);

  // 1. Protocol allowlist
  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS protocol is permitted');
  }

  // 2. Resolve DNS host before connection
  const addresses = await dns.resolve4(url.hostname);

  for (const ipString of addresses) {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    // 3. Block private, loopback, link-local, and cloud metadata ranges
    if (
      range === 'private' ||
      range === 'loopback' ||
      range === 'linkLocal' ||
      ipString === '169.254.169.254'
    ) {
      throw new Error(\`Forbidden destination IP: \${ipString} is in private/internal range\`);
    }
  }

  // 4. Safe fetch without following redirects automatically
  return await fetch(url.toString(), { redirect: 'error' });
}`,
    },
  ];

  const filteredTechniques =
    selectedTactic === 'all'
      ? attackTechniques
      : attackTechniques.filter((t) => t.tactic.toLowerCase() === selectedTactic.toLowerCase());

  const selectedTechnique =
    attackTechniques.find((t) => t.id === selectedTechniqueId) || attackTechniques[0];

  const currentRemediation =
    remediationPlaybooks.find((p) => p.id === selectedRemediationCategory) ||
    remediationPlaybooks[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-950 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300">
                DEFENSIVE ARCHITECTURE
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                PTES · NIST SP 800-115 · MITRE ATT&CK & D3FEND
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              Security Assessment, Threat Modeling & Defensive Engineering
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Standardized penetration testing execution methodologies, adversary emulation mapping against the MITRE ATT&CK matrix, and production-grade detection engineering and cryptographic remediation playbooks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onLoadDefensivePresetToPipeline && (
              <button
                onClick={onLoadDefensivePresetToPipeline}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Remediation into PQC Pipeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 mt-5 border-t border-zinc-800/80 pt-4 overflow-x-auto pb-1 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('methodologies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'methodologies'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Methodologies & Frameworks (PTES / NIST / OWASP)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mitre-attack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'mitre-attack'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Threat Modeling & MITRE ATT&CK Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('detection-engineering')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'detection-engineering'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>3. Defensive Remediations & Detection Rules</span>
          </button>

          <button
            onClick={() => setActiveSubTab('coverage-audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeSubTab === 'coverage-audit'
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. Defensive Gap Assessment & Coverage Audit</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Methodologies & Frameworks */}
      {activeSubTab === 'methodologies' && (
        <div className="space-y-6">
          {/* Framework Selector */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedMethodology('ptes')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMethodology === 'ptes'
                  ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-emerald-400">PTES</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                  7 Phases
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Penetration Testing Execution Standard</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Industry standard covering complete lifecycle from pre-engagement interactions to executive reporting.
              </p>
            </button>

            <button
              onClick={() => setSelectedMethodology('nist800-115')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMethodology === 'nist800-115'
                  ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-cyan-400">NIST SP 800-115</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                  Federal Standard
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Technical Guide to InfoSec Testing</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                US Government testing guidelines focusing on Review, Interview, and Test assessment techniques.
              </p>
            </button>

            <button
              onClick={() => setSelectedMethodology('owasp-wstg')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMethodology === 'owasp-wstg'
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-amber-400">OWASP WSTG v4.2</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                  12 Categories
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Web Security Testing Guide</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Premier guide for testing web applications, APIs, authentication, and cryptographic controls.
              </p>
            </button>

            <button
              onClick={() => setSelectedMethodology('osstmm')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMethodology === 'osstmm'
                  ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-purple-400">OSSTMM 3.0</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                  Operational Metrics
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Open Source Security Testing Manual</h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Scientific methodology measuring operational security posture and vulnerability risk rav metrics.
              </p>
            </button>
          </div>

          {/* PTES Detail View */}
          {selectedMethodology === 'ptes' && (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-emerald-400" />
                    Penetration Testing Execution Standard (PTES) Complete Lifecycle
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select a phase below to inspect objectives, mandatory deliverables, and technical execution criteria.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                  Phase {selectedPtesPhase + 1} of 7: {ptesPhases[selectedPtesPhase].name}
                </div>
              </div>

              {/* Step indicator bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {ptesPhases.map((phase, idx) => (
                  <button
                    key={phase.num}
                    onClick={() => setSelectedPtesPhase(idx)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedPtesPhase === idx
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold text-emerald-400">
                      Phase {phase.num}
                    </div>
                    <div className="text-xs font-medium truncate mt-0.5">{phase.name}</div>
                  </button>
                ))}
              </div>

              {/* Active Phase Card */}
              <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/80 border border-emerald-600 flex items-center justify-center font-mono text-xs text-emerald-300">
                      {ptesPhases[selectedPtesPhase].num}
                    </span>
                    {ptesPhases[selectedPtesPhase].name}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                    {ptesPhases[selectedPtesPhase].nistReference}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-zinc-100 font-semibold">Phase Objective:</strong>{' '}
                  {ptesPhases[selectedPtesPhase].objective}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                    <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Key Testing Activities & Protocols
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {ptesPhases[selectedPtesPhase].keyActivities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                    <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Required Documentation & Deliverables
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {ptesPhases[selectedPtesPhase].deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">✓</span>
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NIST SP 800-115 Detail View */}
          {selectedMethodology === 'nist800-115' && (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                NIST SP 800-115 Technical Assessment Framework
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                NIST Special Publication 800-115 provides recommendations for improving organizations' technical information security testing and assessment practices. It defines three primary technique classes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-mono text-xs font-bold text-cyan-400">1. REVIEW TECHNIQUES</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Documentation & Config Review</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Passive examination of system documentation, architecture diagrams, firewall rule sets, and source code for architectural flaws and cryptographic obsolescence without system interaction.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-mono text-xs font-bold text-emerald-400">2. INTERVIEW TECHNIQUES</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Stakeholder Inquiries</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Structured interviews with systems administrators, developers, and security officers to understand operational reality versus written security policy.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-mono text-xs font-bold text-amber-400">3. TARGET TESTING</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Active Vulnerability Testing</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Active discovery techniques including network mapping, vulnerability scanning, password auditing, and authorized penetration testing to validate exploitability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OWASP WSTG v4.2 Detail View */}
          {selectedMethodology === 'owasp-wstg' && (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                OWASP Web Security Testing Guide (WSTG v4.2)
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The comprehensive framework for evaluating web application and API security across 12 distinct test domains:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { code: 'WSTG-INFO', name: 'Information Gathering', tests: 'Search engine discovery, fingerprinting, application entry points' },
                  { code: 'WSTG-CONF', name: 'Configuration & Deployment', tests: 'Network/infra config, HTTP methods, HSTS, CSP headers' },
                  { code: 'WSTG-IDNT', name: 'Identity Management', tests: 'Role definitions, registration process, account harvesting' },
                  { code: 'WSTG-ATHN', name: 'Authentication Testing', tests: 'Credentials over plain text, remember password, MFA bypass, brute-force' },
                  { code: 'WSTG-ATHZ', name: 'Authorization Testing', tests: 'Directory traversal, BOLA/IDOR, privilege escalation' },
                  { code: 'WSTG-SESS', name: 'Session Management', tests: 'Session fixation, CSRF tokens, cookie attributes, logout invalidation' },
                  { code: 'WSTG-INPV', name: 'Input Validation', tests: 'SQLi, XSS, SSRF, command injection, path traversal, XML injection' },
                  { code: 'WSTG-ERRH', name: 'Error Handling', tests: 'Stack traces, sensitive information leakage in error messages' },
                  { code: 'WSTG-CRYP', name: 'Cryptography Testing', tests: 'Weak TLS ciphers, classical RSA/ECC deprecation, random number generator entropy' },
                  { code: 'WSTG-BUSL', name: 'Business Logic Testing', tests: 'Workflow bypass, price tampering, race conditions, limits evasion' },
                  { code: 'WSTG-CLNT', name: 'Client-Side Testing', tests: 'DOM XSS, JavaScript execution context, WebSocket security' },
                  { code: 'WSTG-APIT', name: 'API Security Testing', tests: 'REST/GraphQL schema inspection, mass assignment, token replay' },
                ].map((item) => (
                  <div key={item.code} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">{item.code}</span>
                      <span className="text-[10px] text-zinc-500">OWASP</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">{item.name}</div>
                    <div className="text-[11px] text-zinc-400 leading-tight">{item.tests}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OSSTMM Detail View */}
          {selectedMethodology === 'osstmm' && (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                OSSTMM 3.0 Operational Security Testing Methodology
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Open Source Security Testing Methodology Manual provides quantifiable metrics (RAVs - Risk Assessment Values) to measure operational security across five channels: Human, Physical, Wireless, Telecommunications, and Data Networks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-purple-400 font-mono">SEPARATION & ISOLATION</h4>
                  <p className="text-xs text-zinc-300">
                    Measures whether security boundaries provide genuine containment between sensitive operational enclaves and untrusted networks.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-purple-400 font-mono">RESILIENCE & RECOVERY</h4>
                  <p className="text-xs text-zinc-300">
                    Quantifies the ability of an infrastructure to sustain degraded operations while actively remediating compromised elements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Threat Modeling & MITRE ATT&CK */}
      {activeSubTab === 'mitre-attack' && (
        <div className="space-y-6">
          {/* Header & Filter */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                MITRE ATT&CK Enterprise Matrix & D3FEND Countermeasure Mapping
              </h2>
              <p className="text-xs text-zinc-400">
                Correlate adversary tactics and techniques with detection telemetry and defensive mitigations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">Filter Tactic:</span>
              <select
                value={selectedTactic}
                onChange={(e) => setSelectedTactic(e.target.value)}
                className="px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Tactics</option>
                <option value="initial access">Initial Access</option>
                <option value="execution">Execution</option>
                <option value="credential access">Credential Access</option>
                <option value="lateral movement">Lateral Movement</option>
                <option value="impact">Impact</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Technique List */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Technique Catalog ({filteredTechniques.length})
              </div>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filteredTechniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechniqueId(tech.id)}
                    className={`w-full p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedTechniqueId === tech.id
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/30'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400">{tech.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                        {tech.tactic}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">{tech.name}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                      {tech.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: In-Depth Technique & Defensive Architecture View */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan-400">
                        {selectedTechnique.id}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-400 font-mono uppercase">
                        {selectedTechnique.tactic}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                      {selectedTechnique.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(selectedTechnique.sigmaRule, selectedTechnique.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {copiedId === selectedTechnique.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Sigma Rule</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Sigma Rule</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Adversary Behavior Overview */}
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-zinc-100 font-semibold">Adversary Behavior:</strong>{' '}
                  {selectedTechnique.description}
                </div>

                {/* Emulation Scenario & Telemetry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Emulation Spec (Atomic Test)
                    </div>
                    <div className="text-xs text-zinc-300 leading-relaxed">
                      {selectedTechnique.emulationScenario}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Telemetry Data Sources
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1">
                      {selectedTechnique.telemetrySources.map((source, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* D3FEND Countermeasure & Hardening */}
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> MITRE D3FEND Countermeasure
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {selectedTechnique.d3fendCountermeasure}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    {selectedTechnique.defensiveRemediation}
                  </div>
                </div>

                {/* Sigma Rule Code Block */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      Production Sigma Detection Rule (YAML)
                    </span>
                    <span className="text-[10px] text-zinc-500">Logsource: Windows / Sysmon</span>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    {selectedTechnique.sigmaRule}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Defensive Remediations & Detection Rules */}
      {activeSubTab === 'detection-engineering' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {remediationPlaybooks.map((playbook) => (
              <button
                key={playbook.id}
                onClick={() => setSelectedRemediationCategory(playbook.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRemediationCategory === playbook.id
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">
                  Remediation Category
                </div>
                <div className="text-xs font-semibold text-zinc-200 leading-snug line-clamp-2">
                  {playbook.title}
                </div>
              </button>
            ))}
          </div>

          {/* Active Playbook Card */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                  Engineering Defense Blueprint
                </span>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-1.5">
                  {currentRemediation.title}
                </h3>
              </div>

              <button
                onClick={() => handleCopy(currentRemediation.codeExample, currentRemediation.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copiedId === currentRemediation.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Implementation</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Code Solution</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
                <div className="text-xs font-semibold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Threat Model & Attack Vector
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentRemediation.attackVector}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Mandatory Defensive Controls
                </div>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {currentRemediation.controls.map((control, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{control}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code Solution */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  Hardened Code Implementation & Verification
                </span>
                <span className="text-[10px] text-zinc-500">Defensive Reference Spec</span>
              </div>
              <pre className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {currentRemediation.codeExample}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Defensive Gap Assessment & Coverage Audit */}
      {activeSubTab === 'coverage-audit' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Interactive ATT&CK Defensive Coverage Calculator
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Assess and tune your defensive telemetry, detection rules, and preventive controls across each MITRE tactic.
                </p>
              </div>

              <div className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-800 flex items-center gap-2">
                <span>Enterprise Posture Score:</span>
                <strong className="text-sm text-purple-200">
                  {Math.round(
                    Object.values(defenseScores).reduce((a, b) => a + b, 0) /
                      Object.values(defenseScores).length
                  )}
                  %
                </strong>
              </div>
            </div>

            {/* Tactical Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {Object.entries(defenseScores).map(([tactic, score]) => (
                <div
                  key={tactic}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">{tactic}</span>
                    <span
                      className={`font-mono font-bold ${
                        score >= 75
                          ? 'text-emerald-400'
                          : score >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={score}
                    onChange={(e) =>
                      setDefenseScores((prev) => ({
                        ...prev,
                        [tactic]: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Low Telemetry</span>
                    <span>Fully Instrumented</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Roadmap & Next Steps */}
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
              <div className="space-y-1">
                <div className="text-xs font-bold text-zinc-200">
                  Defensive Priority Recommendation:
                </div>
                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  Focus on Lateral Movement and Defense Evasion by deploying Sigma rules for administrative shares (T1021.002) and activating LSA RunAsPPL to safeguard credential stores. Transition asymmetric cryptography to post-quantum standards to nullify long-term Harvest Now, Decrypt Later threats.
                </p>
              </div>

              {onLoadDefensivePresetToPipeline && (
                <button
                  onClick={onLoadDefensivePresetToPipeline}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute PQC Migration</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
