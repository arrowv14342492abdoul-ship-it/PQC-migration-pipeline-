import React, { useState } from 'react';
import {
  Shield,
  Key,
  Lock,
  Cloud,
  FileCheck2,
  Server,
  Zap,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';

export interface SecuritySoftwareTarget {
  id: string;
  name: string;
  vendor: string;
  category: 'HSM & Key Management' | 'Machine Identity & PKI' | 'Identity & Zero Trust' | 'Cloud & CNAPP' | 'SIEM & SOAR' | 'AppSec & Supply Chain';
  categoryColor: string;
  pqcCapability: string;
  nistStandard: string;
  priority: 'Immediate (Phase 1)' | 'Near-Term (Phase 2)' | 'Strategic (Phase 3)';
  priorityBadge: string;
  status: 'Ready to Deploy' | 'Integration Blueprint' | 'API Sandbox';
  description: string;
  technicalHook: string;
  protocol: string;
}

export const TOP_SECURITY_SOFTWARE_LIST: SecuritySoftwareTarget[] = [
  {
    id: 'hashicorp-vault',
    name: 'HashiCorp Vault Enterprise',
    vendor: 'HashiCorp / IBM',
    category: 'HSM & Key Management',
    categoryColor: 'border-purple-850 bg-purple-950/30 text-purple-300',
    pqcCapability: 'Quantum-Safe Transit Secret Engine & Dynamic KEM Key Wrapping',
    nistStandard: 'FIPS 203 (ML-KEM-768) + AES-256-GCM',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Centralized secrets broker providing Cryptography-as-a-Service (CaaS) to seamlessly wrap existing AES-GCM database envelope keys using post-quantum KEMs.',
    technicalHook: 'REST API `/v1/transit/encrypt/pqc-kem` & KMIP listener',
    protocol: 'KMIP 2.1 / HTTPS REST',
  },
  {
    id: 'thales-luna',
    name: 'Thales Luna HSM & CipherTrust',
    vendor: 'Thales Group',
    category: 'HSM & Key Management',
    categoryColor: 'border-purple-850 bg-purple-950/30 text-purple-300',
    pqcCapability: 'Hardware FIPS 140-3 Level 3 Quantum Root-of-Trust',
    nistStandard: 'FIPS 204 (ML-DSA-65) & SLH-DSA',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Hardware security modules securing master seed generation, PQC code-signing certificates, and hardware-protected lattice key generation.',
    technicalHook: 'PKCS#11 v3.0 PQC Extensions & Thales REST Gateway',
    protocol: 'PKCS#11 / KMIP / REST',
  },
  {
    id: 'venafi-clm',
    name: 'Venafi Machine Identity Platform',
    vendor: 'CyberArk / Venafi',
    category: 'Machine Identity & PKI',
    categoryColor: 'border-indigo-850 bg-indigo-950/30 text-indigo-300',
    pqcCapability: 'Automated Post-Quantum X.509 Certificate Lifecycle Management',
    nistStandard: 'Composite Hybrid (RSA-4096 + ML-DSA-87)',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Enterprise certificate orchestration engine discovering legacy RSA/ECC certs and automating rolling deployments of dual-signature hybrid certificates.',
    technicalHook: 'Venafi Trust Protection Platform API & ACME v2 PQC Proxy',
    protocol: 'ACME / SCEP / REST API',
  },
  {
    id: 'digicert-one',
    name: 'DigiCert ONE / Trust Lifecycle',
    vendor: 'DigiCert',
    category: 'Machine Identity & PKI',
    categoryColor: 'border-indigo-850 bg-indigo-950/30 text-indigo-300',
    pqcCapability: 'Post-Quantum Public & Private Root CA Infrastructure',
    nistStandard: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
    priority: 'Near-Term (Phase 2)',
    priorityBadge: 'bg-blue-950/80 border-blue-800 text-blue-300',
    status: 'Integration Blueprint',
    description: 'High-volume quantum-resistant CA issuance engine generating compliant production X.509 v3 certificates and CRL/OCSP responders.',
    technicalHook: 'CertCentral REST API v2 & DigiCert Sensor Agent',
    protocol: 'EST / CMP / REST API',
  },
  {
    id: 'cloudflare-one',
    name: 'Cloudflare One (SASE / Zero Trust)',
    vendor: 'Cloudflare',
    category: 'Identity & Zero Trust',
    categoryColor: 'border-cyan-850 bg-cyan-950/30 text-cyan-300',
    pqcCapability: 'X25519 + ML-KEM-768 Hybrid Post-Quantum TLS 1.3 Terminus',
    nistStandard: 'IETF Kyber-v00 Draft / FIPS 203',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Edge reverse proxy terminating hybrid post-quantum TLS handshakes at wire speed, shielding origin backends from harvest-now-decrypt-later (HNDL) attacks.',
    technicalHook: 'Cloudflare API v4 TLS Client Hello & Magic WAN Connector',
    protocol: 'TLS 1.3 Draft / WireGuard / gRPC',
  },
  {
    id: 'okta-workforce',
    name: 'Okta Workforce Identity Cloud',
    vendor: 'Okta',
    category: 'Identity & Zero Trust',
    categoryColor: 'border-cyan-850 bg-cyan-950/30 text-cyan-300',
    pqcCapability: 'Quantum-Safe FIDO2 / WebAuthn & OIDC Signing Cert Rotation',
    nistStandard: 'FIPS 204 (ML-DSA) Authentication Hooks',
    priority: 'Near-Term (Phase 2)',
    priorityBadge: 'bg-blue-950/80 border-blue-800 text-blue-300',
    status: 'Integration Blueprint',
    description: 'Enterprise SSO, adaptive MFA, and passkey authentication pipeline configured with high-assurance post-quantum token signature verification.',
    technicalHook: 'Okta Management API `/api/v1/trustedOrigins` & IdP metadata',
    protocol: 'OIDC / SAML 2.0 / SCIM',
  },
  {
    id: 'cyberark-pam',
    name: 'CyberArk Privileged Access Manager (PAM)',
    vendor: 'CyberArk',
    category: 'Identity & Zero Trust',
    categoryColor: 'border-cyan-850 bg-cyan-950/30 text-cyan-300',
    pqcCapability: 'Quantum-Resistant SSH Key Wrapping & Privilege Ephemeral Vaulting',
    nistStandard: 'FIPS 203 (ML-KEM-1024) Key Exchange',
    priority: 'Strategic (Phase 3)',
    priorityBadge: 'bg-zinc-800 border-zinc-700 text-zinc-300',
    status: 'API Sandbox',
    description: 'Privileged session management and vault orchestration preventing unauthorized root compromise during multi-year PQC algorithm migration phases.',
    technicalHook: 'CyberArk Password Vault Web Access (PVWA) REST API',
    protocol: 'REST / PSM SSH Proxy',
  },
  {
    id: 'palo-alto-prisma',
    name: 'Palo Alto Networks Prisma Cloud',
    vendor: 'Palo Alto Networks',
    category: 'Cloud & CNAPP',
    categoryColor: 'border-amber-850 bg-amber-950/30 text-amber-300',
    pqcCapability: 'Continuous Cryptographic Asset Posture Management (CSPM)',
    nistStandard: 'CBOM / CycloneDX 1.6 Crypto Spec',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Agentless multi-cloud posture scanner discovering quantum-vulnerable TLS listeners, unencrypted S3 buckets, and non-compliant Kubernetes ingresses.',
    technicalHook: 'Prisma Cloud Compute API `/api/v1/compliance`',
    protocol: 'REST API / Webhooks',
  },
  {
    id: 'wiz-cloud',
    name: 'Wiz Cloud Security Platform',
    vendor: 'Wiz',
    category: 'Cloud & CNAPP',
    categoryColor: 'border-amber-850 bg-amber-950/30 text-amber-300',
    pqcCapability: 'Graph-Based Cryptographic Debt & Certificate Expiry Mapping',
    nistStandard: 'NIST SP 800-208 State Machine Tracking',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Security graph that correlates classical cryptographic dependencies across VMs, serverless functions, and container registries to assess blast radius.',
    technicalHook: 'Wiz GraphQL API `query SecurityIssues { cryptography }`',
    protocol: 'GraphQL / EventBridge',
  },
  {
    id: 'crowdstrike-falcon',
    name: 'CrowdStrike Falcon (Horizon & XDR)',
    vendor: 'CrowdStrike',
    category: 'Cloud & CNAPP',
    categoryColor: 'border-amber-850 bg-amber-950/30 text-amber-300',
    pqcCapability: 'HNDL (Harvest Now, Decrypt Later) Adversary Telemetry Detection',
    nistStandard: 'MITRE ATT&CK T1048 Exfiltration Analysis',
    priority: 'Near-Term (Phase 2)',
    priorityBadge: 'bg-blue-950/80 border-blue-800 text-blue-300',
    status: 'Integration Blueprint',
    description: 'Endpoint detection and telemetry sensors identifying bulk encrypted traffic capture campaigns targeting corporate TLS connections.',
    technicalHook: 'Falcon Streaming API & Cloud Security Posture API',
    protocol: 'OAuth2 REST / Kafka Stream',
  },
  {
    id: 'splunk-es',
    name: 'Splunk Enterprise Security (SIEM/SOAR)',
    vendor: 'Splunk / Cisco',
    category: 'SIEM & SOAR',
    categoryColor: 'border-rose-850 bg-rose-950/30 text-rose-300',
    pqcCapability: 'Cryptographic Event Correlation & Automated Remediation Playbooks',
    nistStandard: 'Common Information Model (CIM) Crypto Schema',
    priority: 'Immediate (Phase 1)',
    priorityBadge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    status: 'Ready to Deploy',
    description: 'Enterprise SIEM analytics correlating PQC migration progress, handshake dropouts, legacy cipher fallbacks, and compliance executive dashboards.',
    technicalHook: 'Splunk HEC (HTTP Event Collector) Token Endpoint',
    protocol: 'HEC JSON / Syslog RFC 5424',
  },
  {
    id: 'snyk-appsec',
    name: 'Snyk (Code & Open Source SCA)',
    vendor: 'Snyk',
    category: 'AppSec & Supply Chain',
    categoryColor: 'border-emerald-850 bg-emerald-950/30 text-emerald-300',
    pqcCapability: 'Software Supply Chain CBOM Auditing & Crypto Library Dependency Fixes',
    nistStandard: 'CycloneDX CBOM Specification',
    priority: 'Near-Term (Phase 2)',
    priorityBadge: 'bg-blue-950/80 border-blue-800 text-blue-300',
    status: 'Integration Blueprint',
    description: 'Developer security platform identifying outdated crypto dependencies (`pycryptodome`, `bouncycastle`, `web3.js`) and issuing automated pull requests for `liboqs`.',
    technicalHook: 'Snyk REST API v1 `/org/{id}/dependencies` & CLI Scanner',
    protocol: 'REST / GitHub Webhooks',
  },
];

export interface SecurityCatalogProps {
  onOpenSoftware?: (id: string) => void;
}

export const SecurityCatalog: React.FC<SecurityCatalogProps> = ({ onOpenSoftware }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalSoftware, setActiveModalSoftware] = useState<SecuritySoftwareTarget | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState<string | null>(null);

  const categories = [
    'All',
    'HSM & Key Management',
    'Machine Identity & PKI',
    'Identity & Zero Trust',
    'Cloud & CNAPP',
    'SIEM & SOAR',
    'AppSec & Supply Chain',
  ];

  const filteredList = TOP_SECURITY_SOFTWARE_LIST.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nistStandard.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pqcCapability.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSimulateRequest = (software: SecuritySoftwareTarget) => {
    setRequestSubmitted(software.id);
    setTimeout(() => {
      setRequestSubmitted(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                PQC Ecosystem Expansion
              </span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-xs text-zinc-400">Enterprise Connector Roadmap</span>
            </div>
            <h3 className="text-base font-bold text-zinc-100 mt-1">
              Top Enterprise Security Software Targets
            </h3>
            <p className="text-xs text-zinc-400 max-w-3xl mt-0.5">
              Priority enterprise security systems evaluated for immediate post-quantum integration alongside <strong>Check Point Quantum</strong>, <strong>Snowflake</strong>, and <strong>Elasticsearch</strong>. Each connector provides native FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) compliance hooks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
              <div className="text-xs font-mono font-bold text-emerald-400">12 Planned</div>
              <div className="text-[10px] text-zinc-500">Tier-1 Targets</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
              <div className="text-xs font-mono font-bold text-cyan-400">6 Domains</div>
              <div className="text-[10px] text-zinc-500">Zero-Trust Stack</div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="pt-2 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between border-t border-zinc-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search software, vendor, FIPS standard, protocol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target Software Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((software) => (
          <div
            key={software.id}
            className="rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/80 hover:bg-zinc-900/40 p-4 flex flex-col justify-between transition-all duration-150 space-y-4 group shadow-sm"
          >
            <div className="space-y-3">
              {/* Header line: Vendor, Name & Category */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    {software.vendor}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white mt-0.5">
                    {software.name}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${software.categoryColor}`}
                >
                  {software.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {software.description}
              </p>

              {/* Capabilities badge strip */}
              <div className="space-y-2 pt-2 border-t border-zinc-900 text-xs">
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-500 uppercase block font-mono">PQC Capability</span>
                    <span className="text-[11px] text-zinc-200 font-medium truncate block">
                      {software.pqcCapability}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-zinc-500 uppercase block font-mono">Standard & Hook</span>
                    <span className="text-[11px] text-emerald-300 font-mono truncate block">
                      {software.nistStandard}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Status */}
            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${software.priorityBadge}`}
              >
                {software.priority}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveModalSoftware(software)}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Info className="w-3 h-3 text-zinc-400" />
                  <span>Specs</span>
                </button>

                {onOpenSoftware ? (
                  <button
                    onClick={() => onOpenSoftware(software.id)}
                    className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Launch</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSimulateRequest(software)}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-300 hover:text-emerald-200 font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {requestSubmitted === software.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Queued!</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Provision</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Technical Blueprint Modal */}
      {activeModalSoftware && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {activeModalSoftware.vendor} · {activeModalSoftware.category}
                </span>
                <h3 className="text-base font-bold text-zinc-100 mt-0.5">
                  {activeModalSoftware.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalSoftware(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded border border-zinc-800 bg-zinc-900 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Architecture Mission</div>
                <p className="text-zinc-300 leading-relaxed">{activeModalSoftware.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Cryptographic Standard</div>
                  <div className="font-mono text-emerald-400 font-semibold">{activeModalSoftware.nistStandard}</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Integration Protocol</div>
                  <div className="font-mono text-cyan-400 font-semibold">{activeModalSoftware.protocol}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Target Technical Hook</div>
                <code className="font-mono text-[11px] text-zinc-200 block bg-zinc-950 p-2 rounded border border-zinc-850">
                  {activeModalSoftware.technicalHook}
                </code>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
              <div className="text-[11px] text-zinc-500">
                Phase: <strong className="text-zinc-300">{activeModalSoftware.priority}</strong>
              </div>
              {onOpenSoftware ? (
                <button
                  onClick={() => {
                    const id = activeModalSoftware.id;
                    setActiveModalSoftware(null);
                    onOpenSoftware(id);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch Full Integration</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSimulateRequest(activeModalSoftware);
                    setActiveModalSoftware(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Queue Connector Blueprint
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
