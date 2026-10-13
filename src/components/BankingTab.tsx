import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Send,
  Building2,
  ShieldAlert,
  ChevronRight,
  Filter,
  DollarSign,
  Copy,
  Check,
  Eye,
  X,
  Share2,
  Cpu
} from 'lucide-react';
import { FinancialInstitution, InstitutionCategory } from '../types/banking';
import { MAJOR_FINANCIAL_INSTITUTIONS } from '../data/mockBankingInstitutions';
import { bankingService } from '../services/bankingService';
import { BankAccountView } from './banking/BankAccountView';

export const BankingTab: React.FC = () => {
  const [bankingSubView, setBankingSubView] = useState<'account' | 'directory'>('account');
  const [institutions, setInstitutions] = useState<FinancialInstitution[]>(
    MAJOR_FINANCIAL_INSTITUTIONS
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(
    null
  );

  // Inspector modal sub-tab
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    'sandbox' | 'cbom' | 'compliance' | 'security'
  >('sandbox');

  // Interactive sandbox state
  const [selectedCapabilityIndex, setSelectedCapabilityIndex] = useState(0);
  const [isExecutingTx, setIsExecutingTx] = useState(false);
  const [txResult, setTxResult] = useState<any | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  // Live ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any | null>(null);

  // Active institution object
  const activeInstitution = useMemo(() => {
    return (
      institutions.find((i) => i.id === activeInstitutionId) || null
    );
  }, [institutions, activeInstitutionId]);

  // Categories list
  const categories = [
    'All',
    'Commercial & Investment Banking',
    'Central Settlement & Interbank',
    'Custody & Securities Servicing',
    'Wealth & Asset Management',
  ];

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const matchesSearch =
        searchQuery === '' ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inst.ticker && inst.ticker.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inst.headquarters.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.primaryProtocols.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' || inst.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [institutions, searchQuery, selectedCategory]);

  // Handle open inspector
  const handleOpenInspector = (id: string) => {
    setActiveInstitutionId(id);
    setSelectedCapabilityIndex(0);
    setTxResult(null);
    setPingResult(null);
    setActiveInspectorTab('sandbox');
  };

  // Handle test ping
  const handleTestPing = async (id: string) => {
    setIsPinging(true);
    try {
      const res = await bankingService.testConnection(id);
      setPingResult(res);
      // update local state
      setInstitutions((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                sandboxStatus: {
                  ...item.sandboxStatus,
                  latencyMs: res.latencyMs,
                  lastHandshake: 'Just now',
                },
              }
            : item
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsPinging(false);
    }
  };

  // Handle execute transaction
  const handleExecuteTransaction = async () => {
    if (!activeInstitution) return;
    const currentCap = activeInstitution.capabilities[selectedCapabilityIndex];
    if (!currentCap) return;

    setIsExecutingTx(true);
    setTxResult(null);

    try {
      const res = await bankingService.executeTransaction(
        activeInstitution.id,
        currentCap.id
      );
      setTxResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingTx(false);
    }
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Sub-Navigation Switcher: Commercial Account vs Institutions Directory */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setBankingSubView('account')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              bankingSubView === 'account'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-200" />
            <span>Commercial Account & Ledger</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                bankingSubView === 'account'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              Full Account & Generator
            </span>
          </button>

          <button
            onClick={() => setBankingSubView('directory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              bankingSubView === 'directory'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-200" />
            <span>Financial Institutions Directory</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                bankingSubView === 'directory'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              18 Banks & Rails
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>FIPS 203 / 204 Lattice Active</span>
        </div>
      </div>

      {/* VIEW 1: Full Commercial Banking Account & Transactions */}
      {bankingSubView === 'account' && <BankAccountView />}

      {/* VIEW 2: Financial Institutions & Integrations Directory */}
      {bankingSubView === 'directory' && (
        <div className="space-y-6">
          {/* 1. Hero Summary Header */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/20 p-5 sm:p-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-700/80 text-emerald-300">
                    <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                    Global Financial Sector PQC Network
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    ISO 20022 MX · FIPS 203 / 204 Mandate
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Major Financial Institutions & Interbank Settlement
                </h1>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                  Real-time post-quantum cryptographic integration directory across Tier-1 Global G-SIBs, central clearing rails, and global custodians. Test live ISO 20022 wholesale wires, verify FIPS 203 ML-KEM-768 key encapsulation, inspect Cryptographic Bills of Materials (CBOM), and audit compliance with Federal Reserve, DORA, and BSI mandates.
                </p>
              </div>

              {/* Quick Aggregate Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
                <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-950/80">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    Institutions
                  </div>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">
                    {institutions.length} <span className="text-xs text-emerald-400 font-normal">Active</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Tier-1 G-SIBs & Rails</div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-950/80">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    Protected AUM
                  </div>
                  <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">
                    $38.4T+
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Sovereign & Wholesale</div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-950/80">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    PQC Standards
                  </div>
                  <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
                    FIPS 203/204
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">ML-KEM & ML-DSA</div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-950/80">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    Avg. Latency
                  </div>
                  <div className="text-xl font-bold text-zinc-200 font-mono mt-0.5">
                    31.4 ms
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Lattice TLS 1.3</div>
                </div>
              </div>
            </div>
          </div>

      {/* 2. Search & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by bank name, ticker, city, or protocol (e.g. pacs.008, Fedwire, FIX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-300'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Financial Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstitutions.map((inst) => {
          const isHighReadiness = inst.quantumReadinessScore >= 92;

          return (
            <div
              key={inst.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700/80 transition-all p-4.5 space-y-4 group"
            >
              {/* Card Top: Name, Ticker, Category & Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                      <Landmark className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-zinc-100 text-sm group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {inst.name}
                        </h3>
                        {inst.ticker && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                            {inst.ticker}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <span>{inst.headquarters}</span>
                        <span>·</span>
                        <span className="text-zinc-500">{inst.tier}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-emerald-950/80 border border-emerald-800 text-emerald-300 shrink-0">
                    Connected
                  </span>
                </div>

                {/* Score & AUM Row */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800/80 text-xs">
                  <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                    <div className="text-[10px] text-zinc-500">PQC Readiness</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {inst.quantumReadinessScore}%
                      </span>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${inst.quantumReadinessScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-850">
                    <div className="text-[10px] text-zinc-500">Assets / AUM</div>
                    <div className="font-mono font-semibold text-zinc-200 text-xs truncate mt-0.5">
                      {inst.totalAssetsAUM}
                    </div>
                  </div>
                </div>

                {/* Standards & Protocols */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-mono text-zinc-300 truncate">
                      {inst.pqcStandards.fips203}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {inst.primaryProtocols.slice(0, 3).map((p, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800"
                      >
                        {p}
                      </span>
                    ))}
                    {inst.primaryProtocols.length > 3 && (
                      <span className="px-1 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-zinc-500 border border-zinc-800">
                        +{inst.primaryProtocols.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{inst.sandboxStatus.latencyMs}ms</span>
                </div>

                <button
                  onClick={() => handleOpenInspector(inst.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-200 transition-colors cursor-pointer group-hover:bg-emerald-500 group-hover:text-zinc-950"
                >
                  <span>Inspect & Transact</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInstitutions.length === 0 && (
        <div className="text-center py-16 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-3">
          <Landmark className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-300">
            No matching financial institutions found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query or reset your category filter to view all 18 major institutions.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
        </div>
      )}

      {/* 4. Deep Inspection & PQC Sandbox Modal */}
      {activeInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-750 bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-zinc-800 bg-zinc-900/70">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-700/80 flex items-center justify-center shrink-0">
                  <Landmark className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {activeInstitution.name}
                    </h2>
                    {activeInstitution.ticker && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {activeInstitution.ticker}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/90 border border-emerald-800 text-emerald-300">
                      FIPS 203 Verified
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                    <span>{activeInstitution.headquarters}</span>
                    <span>·</span>
                    <span>{activeInstitution.tier}</span>
                    <span>·</span>
                    <span className="font-mono text-zinc-300">
                      {activeInstitution.totalAssetsAUM}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setActiveInstitutionId(null)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 sm:px-6 border-b border-zinc-800 bg-zinc-950 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveInspectorTab('sandbox')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeInspectorTab === 'sandbox'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>PQC Financial Sandbox</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('cbom')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeInspectorTab === 'cbom'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Cryptographic Bill of Materials (CBOM)</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('compliance')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeInspectorTab === 'compliance'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Regulatory & Compliance Matrix</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('security')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeInspectorTab === 'security'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>HNDL Advisory & Audit Trail</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* SUB-TAB 1: SANDBOX */}
              {activeInspectorTab === 'sandbox' && (
                <div className="space-y-6">
                  {/* Endpoint & Handshake Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                        Bank Production Gateway Endpoint
                      </div>
                      <div className="font-mono text-xs text-zinc-200 truncate">
                        {activeInstitution.apiEndpoint}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestPing(activeInstitution.id)}
                        disabled={isPinging}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`}
                        />
                        <span>{isPinging ? 'Handshaking...' : 'Test TLS Handshake'}</span>
                      </button>
                    </div>
                  </div>

                  {pingResult && (
                    <div className="p-3 rounded-xl border border-emerald-800/80 bg-emerald-950/40 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>{pingResult.handshakeStatus}</strong> · Roundtrip: {pingResult.latencyMs}ms ({pingResult.tlsVersion} with {pingResult.kemCipher})
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 shrink-0">
                        {pingResult.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Capabilities Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Select Transaction or Message Flow:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeInstitution.capabilities.map((cap, idx) => (
                        <button
                          key={cap.id}
                          onClick={() => {
                            setSelectedCapabilityIndex(idx);
                            setTxResult(null);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedCapabilityIndex === idx
                              ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40'
                              : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-semibold text-zinc-200 text-xs">
                            {cap.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                            {cap.standardMessage}
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <Lock className="w-3 h-3" />
                            <span>{cap.pqcShield}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payload Viewer & Transact Action */}
                  {activeInstitution.capabilities[selectedCapabilityIndex] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                            Transaction Message Payload (ISO 20022 / PQC Extension)
                          </h4>
                          <p className="text-[11px] text-zinc-400">
                            {activeInstitution.capabilities[selectedCapabilityIndex].description}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleCopyPayload(
                              activeInstitution.capabilities[selectedCapabilityIndex].samplePayload
                            )
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedState ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code block */}
                      <pre className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300 overflow-x-auto max-h-56 scrollbar-thin">
                        <code>
                          {activeInstitution.capabilities[selectedCapabilityIndex].samplePayload}
                        </code>
                      </pre>

                      {/* Execute Button */}
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>
                            Protected via {activeInstitution.pqcStandards.fips203} & {activeInstitution.pqcStandards.fips204}
                          </span>
                        </div>

                        <button
                          onClick={handleExecuteTransaction}
                          disabled={isExecutingTx}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                        >
                          {isExecutingTx ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Encapsulating & Transacting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Execute PQC Financial Transaction</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Execution Result */}
                      {txResult && (
                        <div className="p-4 rounded-xl border border-emerald-700/80 bg-zinc-950 space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="font-semibold text-xs text-emerald-300">
                                Transaction Finalized & Affirmed: {txResult.status}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Settlement: {txResult.executionTimeMs}ms
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block">Transaction Hash</span>
                              <span className="font-mono text-zinc-200 text-[11px] truncate block mt-0.5">
                                {txResult.txHash}
                              </span>
                            </div>
                            <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 block">Attestation Proof</span>
                              <span className="font-mono text-emerald-400 text-[11px] truncate block mt-0.5">
                                {txResult.attestationProof}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] text-zinc-400 font-mono">
                              Bank Ledger Gateway Response:
                            </div>
                            <pre className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-36">
                              <code>{txResult.responsePayload}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: CBOM */}
              {activeInspectorTab === 'cbom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        Cryptographic Bill of Materials (CBOM)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Inventory of classical cryptographic algorithms and their FIPS 203/204 post-quantum replacements across {activeInstitution.name}.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-mono bg-zinc-900 text-emerald-400 border border-zinc-800">
                      {activeInstitution.cbomInventory.length} Components Audited
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900/90 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">Banking Component</th>
                          <th className="py-2.5 px-3">Classical Primitive</th>
                          <th className="py-2.5 px-3">PQC Replacement</th>
                          <th className="py-2.5 px-3">Standard</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {activeInstitution.cbomInventory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-zinc-200">
                              {item.component}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-rose-300">
                              {item.classicalPrimitive} ({item.keySizeClassical})
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-300">
                              {item.postQuantumReplacement}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-zinc-400">
                              {item.nistStandard}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                                {item.riskTier}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: COMPLIANCE */}
              {activeInspectorTab === 'compliance' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Regulatory & Compliance Matrix
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Status against central bank directives, DORA, and national security mandates.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {activeInstitution.complianceMatrix.map((comp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-zinc-200">
                              {comp.standard}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              ({comp.framework})
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{comp.notes}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-400">
                            Deadline: {comp.deadline}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                            {comp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: SECURITY ADVISORY & AUDIT */}
              {activeInspectorTab === 'security' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-800/80 bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Harvest-Now-Decrypt-Later (HNDL) Vulnerability Risk</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {activeInstitution.securityAdvisory.hndlVulnerability}
                    </p>
                    <div className="pt-2 border-t border-amber-800/40 text-[11px] text-amber-200/80">
                      <strong>Mitigation:</strong> {activeInstitution.securityAdvisory.mitigationPath}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Real-time Cryptographic Audit Trail
                    </h4>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 divide-y divide-zinc-850 max-h-56 overflow-y-auto">
                      {activeInstitution.liveEvents.map((ev, idx) => (
                        <div
                          key={`${ev.id}-${idx}`}
                          className="p-2.5 px-3 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-500">
                              {ev.timestamp}
                            </span>
                            <span className="text-zinc-300 text-[11px]">{ev.event}</span>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                            {ev.primitive}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIST SP 800-227 Certified Interbank Corridor</span>
              </div>

              <button
                onClick={() => setActiveInstitutionId(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
