import React, { useState } from 'react';
import { CheckPointIntegration } from './CheckPointIntegration';
import { SnowflakeIntegration } from './SnowflakeIntegration';
import { ElasticsearchIntegration } from './ElasticsearchIntegration';
import { SecurityCatalog } from './SecurityCatalog';
import { EnterpriseSoftwareDetail } from './EnterpriseSoftwareDetail';
import { WhiteRabbitNeoIntegration } from './whiterabbit/WhiteRabbitNeoIntegration';
import {
  Network,
  Database,
  Activity,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  CheckCircle2,
  Compass,
  Key,
  Lock,
  Cloud,
  FileCheck2,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  Shield,
  ArrowUpRight,
  Terminal,
} from 'lucide-react';

export type EnterpriseSubTab =
  | 'whiterabbitneo'
  | 'checkpoint'
  | 'snowflake'
  | 'elasticsearch'
  | 'hashicorp-vault'
  | 'thales-luna'
  | 'venafi-clm'
  | 'digicert-one'
  | 'cloudflare-one'
  | 'okta-workforce'
  | 'cyberark-pam'
  | 'palo-alto-prisma'
  | 'wiz-cloud'
  | 'crowdstrike-falcon'
  | 'splunk-es'
  | 'snyk-appsec'
  | 'catalog';

interface EnterpriseTabMeta {
  id: EnterpriseSubTab;
  name: string;
  shortName: string;
  vendor: string;
  category: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ALL_ENTERPRISE_INTEGRATIONS: EnterpriseTabMeta[] = [
  // 0. AI Security LLM
  {
    id: 'whiterabbitneo',
    name: 'WhiteRabbitNeo Cybersecurity LLM',
    shortName: 'WhiteRabbitNeo',
    vendor: 'WhiteRabbitNeo',
    category: 'AI Security & Pentesting',
    badge: '33B DeepSeek',
    badgeColor: 'border-emerald-800 bg-emerald-950/80 text-emerald-300',
    icon: Terminal,
  },

  // 1. Core Perimeter & Network
  {
    id: 'checkpoint',
    name: 'Check Point Quantum Security',
    shortName: 'Check Point',
    vendor: 'Check Point',
    category: 'Network & Perimeter',
    badge: 'ML-KEM-768',
    badgeColor: 'border-red-800 bg-red-950/80 text-red-300',
    icon: Network,
  },
  {
    id: 'cloudflare-one',
    name: 'Cloudflare One SASE / Edge Zero Trust',
    shortName: 'Cloudflare One',
    vendor: 'Cloudflare',
    category: 'Network & Perimeter',
    badge: 'Edge TLS 1.3 PQC',
    badgeColor: 'border-cyan-800 bg-cyan-950/80 text-cyan-300',
    icon: Cloud,
  },

  // 2. Data Warehouse & Storage
  {
    id: 'snowflake',
    name: 'Snowflake Data Warehouse',
    shortName: 'Snowflake',
    vendor: 'Snowflake',
    category: 'Cloud & Data Warehouse',
    badge: 'Tri-Secret CMK',
    badgeColor: 'border-cyan-800 bg-cyan-950/80 text-cyan-300',
    icon: Database,
  },

  // 3. HSM & Key Management
  {
    id: 'hashicorp-vault',
    name: 'HashiCorp Vault Enterprise',
    shortName: 'HashiCorp Vault',
    vendor: 'HashiCorp / IBM',
    category: 'HSM & Key Management',
    badge: 'FIPS 203 Transit KEM',
    badgeColor: 'border-purple-800 bg-purple-950/80 text-purple-300',
    icon: Key,
  },
  {
    id: 'thales-luna',
    name: 'Thales Luna HSM & CipherTrust',
    shortName: 'Thales Luna HSM',
    vendor: 'Thales Group',
    category: 'HSM & Key Management',
    badge: 'FIPS 140-3 L3 HW',
    badgeColor: 'border-purple-800 bg-purple-950/80 text-purple-300',
    icon: Lock,
  },

  // 4. Machine Identity & PKI
  {
    id: 'venafi-clm',
    name: 'Venafi Machine Identity Platform',
    shortName: 'Venafi CLM',
    vendor: 'CyberArk / Venafi',
    category: 'Machine Identity & PKI',
    badge: 'Dual Hybrid X.509',
    badgeColor: 'border-indigo-800 bg-indigo-950/80 text-indigo-300',
    icon: FileCheck2,
  },
  {
    id: 'digicert-one',
    name: 'DigiCert ONE Trust Lifecycle',
    shortName: 'DigiCert ONE',
    vendor: 'DigiCert',
    category: 'Machine Identity & PKI',
    badge: 'FIPS 204 Root CA',
    badgeColor: 'border-indigo-800 bg-indigo-950/80 text-indigo-300',
    icon: Key,
  },

  // 5. Identity & Zero Trust
  {
    id: 'okta-workforce',
    name: 'Okta Workforce Identity Cloud',
    shortName: 'Okta Identity',
    vendor: 'Okta',
    category: 'Identity & Zero Trust',
    badge: 'FIDO2 Lattice WebAuthn',
    badgeColor: 'border-cyan-800 bg-cyan-950/80 text-cyan-300',
    icon: ShieldCheck,
  },
  {
    id: 'cyberark-pam',
    name: 'CyberArk Privileged Access Manager',
    shortName: 'CyberArk PAM',
    vendor: 'CyberArk',
    category: 'Identity & Zero Trust',
    badge: 'ML-KEM-1024 SSH',
    badgeColor: 'border-cyan-800 bg-cyan-950/80 text-cyan-300',
    icon: Lock,
  },

  // 6. Cloud & CNAPP
  {
    id: 'palo-alto-prisma',
    name: 'Palo Alto Networks Prisma Cloud',
    shortName: 'Prisma Cloud',
    vendor: 'Palo Alto Networks',
    category: 'Cloud & CNAPP',
    badge: 'Continuous CBOM CSPM',
    badgeColor: 'border-amber-800 bg-amber-950/80 text-amber-300',
    icon: Cloud,
  },
  {
    id: 'wiz-cloud',
    name: 'Wiz Cloud Security Platform',
    shortName: 'Wiz Cloud',
    vendor: 'Wiz',
    category: 'Cloud & CNAPP',
    badge: 'Crypto Blast Radius',
    badgeColor: 'border-amber-800 bg-amber-950/80 text-amber-300',
    icon: Layers,
  },
  {
    id: 'crowdstrike-falcon',
    name: 'CrowdStrike Falcon (Horizon & XDR)',
    shortName: 'CrowdStrike Falcon',
    vendor: 'CrowdStrike',
    category: 'Cloud & CNAPP',
    badge: 'HNDL Threat Shield',
    badgeColor: 'border-amber-800 bg-amber-950/80 text-amber-300',
    icon: Activity,
  },

  // 7. SIEM & SOAR
  {
    id: 'elasticsearch',
    name: 'Elasticsearch SIEM & Audit Logs',
    shortName: 'Elasticsearch',
    vendor: 'Elastic',
    category: 'SIEM & SOAR',
    badge: '84k Docs Live',
    badgeColor: 'border-amber-800 bg-amber-950/80 text-amber-300',
    icon: Activity,
  },
  {
    id: 'splunk-es',
    name: 'Splunk Enterprise Security (SIEM/SOAR)',
    shortName: 'Splunk ES',
    vendor: 'Splunk / Cisco',
    category: 'SIEM & SOAR',
    badge: 'CIM Crypto HEC',
    badgeColor: 'border-rose-800 bg-rose-950/80 text-rose-300',
    icon: Server,
  },

  // 8. AppSec & Supply Chain
  {
    id: 'snyk-appsec',
    name: 'Snyk Code & Open Source SCA',
    shortName: 'Snyk AppSec',
    vendor: 'Snyk',
    category: 'AppSec & Supply Chain',
    badge: 'liboqs Auto PR',
    badgeColor: 'border-emerald-800 bg-emerald-950/80 text-emerald-300',
    icon: Sparkles,
  },
];

interface EnterpriseIntegrationsProps {
  initialSubTab?: EnterpriseSubTab;
}

export const EnterpriseIntegrations: React.FC<EnterpriseIntegrationsProps> = ({
  initialSubTab = 'checkpoint',
}) => {
  const [activeTab, setActiveTab] = useState<EnterpriseSubTab>(initialSubTab);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const categories = [
    'All',
    'Network & Perimeter',
    'Cloud & Data Warehouse',
    'HSM & Key Management',
    'Machine Identity & PKI',
    'Identity & Zero Trust',
    'Cloud & CNAPP',
    'SIEM & SOAR',
    'AppSec & Supply Chain',
  ];

  const filteredIntegrations = ALL_ENTERPRISE_INTEGRATIONS.filter((item) => {
    const matchesCat =
      categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      searchFilter === '' ||
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeMeta = ALL_ENTERPRISE_INTEGRATIONS.find((i) => i.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Enterprise Suite Header & Health Bar */}
      <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Enterprise Cryptographic Defense Suite
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                15 Production Post-Quantum Integrations
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
              Hardware HSM · PKI · Perimeter · Zero Trust · Cloud & SIEM
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
              Full-spectrum post-quantum cryptographic integration ecosystem enforcing <strong>NIST FIPS 203 (ML-KEM)</strong> and <strong>FIPS 204 (ML-DSA)</strong> across every tier of your enterprise architecture.
            </p>
          </div>

          {/* Quick Health Strip */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="p-2 sm:p-2.5 rounded-lg border border-emerald-950/60 bg-emerald-950/20 text-xs">
              <div className="text-[10px] text-zinc-400">PQC Ecosystem</div>
              <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                15 Active Integrations
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg border border-purple-950/60 bg-purple-950/20 text-xs">
              <div className="text-[10px] text-zinc-400">NIST Standard</div>
              <div className="font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                FIPS 203 / 204
              </div>
            </div>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`p-2 sm:p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'border-purple-600 bg-purple-950/60 text-purple-200'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-left">
                <div className="text-[10px] text-zinc-400">Roadmap</div>
                <div className="font-semibold text-purple-300">Catalog View</div>
              </div>
            </button>
          </div>
        </div>

        {/* Search, Filter & Quick Mobile Selector Row */}
        <div className="pt-3 border-t border-zinc-850/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Dropdown for Mobile / iPhone Viewports */}
          <div className="md:hidden relative">
            <label className="text-[10px] text-zinc-400 font-mono block mb-1">
              Select Enterprise Integration:
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as EnterpriseSubTab)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 pr-9 cursor-pointer"
              >
                <option value="catalog">⭐ Connector Catalog & Overview (15 Targets)</option>
                <optgroup label="Perimeter & Network">
                  <option value="checkpoint">Check Point Quantum Security (ML-KEM-768)</option>
                  <option value="cloudflare-one">Cloudflare One Zero Trust (TLS 1.3 PQC)</option>
                </optgroup>
                <optgroup label="Cloud & Data Warehouse">
                  <option value="snowflake">Snowflake Data Warehouse (Tri-Secret CMK)</option>
                </optgroup>
                <optgroup label="Hardware HSM & Key Management">
                  <option value="hashicorp-vault">HashiCorp Vault Enterprise (Transit KEM)</option>
                  <option value="thales-luna">Thales Luna HSM & CipherTrust (FIPS 140-3 L3)</option>
                </optgroup>
                <optgroup label="Machine Identity & PKI">
                  <option value="venafi-clm">Venafi Machine Identity (Dual-Signature X.509)</option>
                  <option value="digicert-one">DigiCert ONE Trust Lifecycle (FIPS 204 Root CA)</option>
                </optgroup>
                <optgroup label="Identity & Zero Trust">
                  <option value="okta-workforce">Okta Workforce Identity (FIDO2 Passkeys)</option>
                  <option value="cyberark-pam">CyberArk PAM (ML-KEM-1024 Ephemeral SSH)</option>
                </optgroup>
                <optgroup label="Cloud & CNAPP">
                  <option value="palo-alto-prisma">Palo Alto Prisma Cloud (CBOM CSPM)</option>
                  <option value="wiz-cloud">Wiz Cloud Security (Crypto Blast Radius)</option>
                  <option value="crowdstrike-falcon">CrowdStrike Falcon (HNDL Threat Shield)</option>
                </optgroup>
                <optgroup label="SIEM & SecOps">
                  <option value="elasticsearch">Elasticsearch SIEM & Logs (84k Docs)</option>
                  <option value="splunk-es">Splunk Enterprise Security (CIM Crypto HEC)</option>
                </optgroup>
                <optgroup label="AppSec & Supply Chain">
                  <option value="snyk-appsec">Snyk Code & Open Source (liboqs Auto PR)</option>
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Desktop Category Filters */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter 15 integrations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Desktop / Tablet Scrollable Tabs Strip */}
        <div className="hidden md:flex items-center gap-2 border-t border-zinc-850 pt-3 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-purple-500/15 border border-purple-500/50 text-purple-200 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Catalog (15)</span>
          </button>

          {filteredIntegrations.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 border border-zinc-700 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.shortName}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Enterprise Integration */}
      {activeTab === 'whiterabbitneo' && <WhiteRabbitNeoIntegration />}
      {activeTab === 'checkpoint' && <CheckPointIntegration />}
      {activeTab === 'snowflake' && <SnowflakeIntegration />}
      {activeTab === 'elasticsearch' && <ElasticsearchIntegration />}
      {activeTab === 'catalog' && (
        <SecurityCatalog
          onOpenSoftware={(id) => setActiveTab(id as EnterpriseSubTab)}
        />
      )}

      {/* The 12 Top Enterprise Security Software Integrations */}
      {activeTab !== 'whiterabbitneo' &&
        activeTab !== 'checkpoint' &&
        activeTab !== 'snowflake' &&
        activeTab !== 'elasticsearch' &&
        activeTab !== 'catalog' && (
          <EnterpriseSoftwareDetail
            connectorId={activeTab}
            onBackToCatalog={() => setActiveTab('catalog')}
          />
        )}
    </div>
  );
};
