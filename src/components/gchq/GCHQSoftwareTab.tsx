import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Play,
  RotateCw,
  GitBranch,
  Star,
  Download,
  AlertTriangle,
  FolderGit2,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Trash2,
  Plus,
  Network,
  Binary,
  FileCode,
  Gauge,
  Lock,
} from 'lucide-react';
import {
  GCHQRepository,
  CyberChefRecipeStep,
  CyberChefOpName,
  CyberChefBakeResult,
  GafferGraphData,
  GafferNode,
} from '../../types/gchqSoftware';
import { gchqService } from '../../services/gchqService';

interface GCHQSoftwareTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

const AVAILABLE_OPS: CyberChefOpName[] = [
  'To Base64',
  'From Base64',
  'To Hex',
  'From Hex',
  'URL Encode',
  'URL Decode',
  'ROT13',
  'Defang IP',
  'Defang URL',
  'Reverse',
  'SHA-256',
  'SHA-512',
  'MD5',
  'Calculate Entropy',
  'Magic (Auto-Detect)',
  'To Binary',
  'From Binary',
  'XOR',
];

const CYBERCHEF_PRESETS = [
  {
    name: 'De-obfuscate Base64 Payload',
    input:
      'aW1wb3J0IG9xcwpmcm9tIGNyeXB0b2dyYXBoeS5oYXptYXQucHJpbWl0aXZlcy5rZGYuaGtkZiBpbXBvcnQgSEtERgpkZWYgcHFjX3Nlc3Npb24oKToKICAgIHJldHVybiAieDI1NTE5K21sa2VtNzY4Ig==',
    recipe: [{ id: '1', op: 'From Base64' as CyberChefOpName, enabled: true }],
  },
  {
    name: 'Defang Malicious IOCs',
    input:
      'Found active C2 at http://malicious-node.org/drop and egress connection to 185.220.101.5:443',
    recipe: [
      { id: '1', op: 'Defang URL' as CyberChefOpName, enabled: true },
      { id: '2', op: 'Defang IP' as CyberChefOpName, enabled: true },
    ],
  },
  {
    name: 'Cryptographic Hashes & Entropy',
    input: 'Post-Quantum NIST FIPS 203 ML-KEM-768 Verification Secret',
    recipe: [
      { id: '1', op: 'SHA-256' as CyberChefOpName, enabled: true },
    ],
  },
  {
    name: 'Magic Auto-Detection',
    input: '4e4953545f464950535f3230335f4d4c4b454d373638',
    recipe: [
      { id: '1', op: 'Magic (Auto-Detect)' as CyberChefOpName, enabled: true },
    ],
  },
];

export const GCHQSoftwareTab: React.FC<GCHQSoftwareTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cyberchef' | 'catalog' | 'gaffer' | 'stroom'
  >('cyberchef');

  const [repositories, setRepositories] = useState<GCHQRepository[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // CyberChef State
  const [chefInput, setChefInput] = useState<string>(CYBERCHEF_PRESETS[0].input);
  const [chefRecipe, setChefRecipe] = useState<CyberChefRecipeStep[]>(
    CYBERCHEF_PRESETS[0].recipe
  );
  const [bakeResult, setBakeResult] = useState<CyberChefBakeResult | null>(null);
  const [isBaking, setIsBaking] = useState<boolean>(false);

  // Gaffer Graph State
  const [gafferGraph, setGafferGraph] = useState<GafferGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GafferNode | null>(null);

  // Stroom State
  const [stroomLogInput, setStroomLogInput] = useState<string>(
    'CEF:0|Sovereign Defense|PQC-Gateway|1.0|100|Handshake Downgrade Attempt|9|src=192.168.1.100 dst=10.0.0.1 msg=Client requested classical RSA-2048'
  );
  const [stroomParsed, setStroomParsed] = useState<any | null>(null);
  const [isParsingStroom, setIsParsingStroom] = useState<boolean>(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    gchqService.getRepositories().then(setRepositories).catch(console.error);
    gchqService.getGafferGraph().then(setGafferGraph).catch(console.error);
    runBake(CYBERCHEF_PRESETS[0].input, CYBERCHEF_PRESETS[0].recipe);
  }, []);

  const runBake = async (input: string, recipe: CyberChefRecipeStep[]) => {
    setIsBaking(true);
    try {
      const res = await gchqService.bakeCyberChef(input, recipe);
      setBakeResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBaking(false);
    }
  };

  const addOperation = (op: CyberChefOpName) => {
    const updated = [
      ...chefRecipe,
      { id: `step_${Date.now()}_${Math.random()}`, op, enabled: true },
    ];
    setChefRecipe(updated);
    runBake(chefInput, updated);
  };

  const removeOperation = (id: string) => {
    const updated = chefRecipe.filter((s) => s.id !== id);
    setChefRecipe(updated);
    runBake(chefInput, updated);
  };

  const toggleOperation = (id: string) => {
    const updated = chefRecipe.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setChefRecipe(updated);
    runBake(chefInput, updated);
  };

  const handleApplyPreset = (preset: typeof CYBERCHEF_PRESETS[0]) => {
    setChefInput(preset.input);
    setChefRecipe(preset.recipe);
    runBake(preset.input, preset.recipe);
  };

  const handleParseStroom = async () => {
    setIsParsingStroom(true);
    try {
      const res = await gchqService.parseStroomLog(stroomLogInput);
      setStroomParsed(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingStroom(false);
    }
  };

  const filteredRepos = repositories.filter((repo) => {
    const matchesCategory =
      selectedCategory === 'All' || repo.category === selectedCategory;
    const matchesQuery =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = [
    'All',
    'Cyber Swiss Army Knife',
    'Graph Analytics',
    'Audit & Event Logging',
    'Data Governance',
    'AI & ML Governance',
    'Core Libraries',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900/80 to-teal-950/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <FolderGit2 className="w-3 h-3 text-emerald-400" />
                GCHQ GitHub Official Ecosystem
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                github.com/gchq
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                UK Sovereign Open Source
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Government Communications Headquarters (GCHQ) Software Suite
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full integration of open-source defensive and cryptographic tools published by the UK's intelligence and cyber agency (GCHQ) on GitHub. Features a live <strong className="text-emerald-300">CyberChef "Cyber Swiss Army Knife"</strong> recipe engine, <strong className="text-cyan-300">Gaffer Graph</strong> threat intelligence explorer, <strong className="text-purple-300">Bailo</strong> AI model governance, and <strong className="text-amber-300">Stroom</strong> log processing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <a
              href="https://github.com/gchq"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>GCHQ GitHub Org</span>
            </a>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 flex items-center gap-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Total GitHub Stars</div>
                <div className="text-sm font-bold font-mono text-zinc-100">35,000+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-zinc-800">
          <button
            onClick={() => setActiveSubTab('cyberchef')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'cyberchef'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-emerald-300" />
            <span>CyberChef "Cyber Swiss Army Knife"</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-teal-300" />
            <span>GCHQ GitHub Catalog</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {repositories.length} Repos
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('gaffer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'gaffer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-300" />
            <span>Gaffer Threat Graph Explorer</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-400/30 text-cyan-200">
              Link Analysis
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('stroom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'stroom'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Stroom & Event-Logging Schemas</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CyberChef Workbench */}
      {activeSubTab === 'cyberchef' && (
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Recipe Presets:</span>
              {CYBERCHEF_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runBake(chefInput, chefRecipe)}
                disabled={isBaking}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isBaking ? 'animate-spin' : 'fill-white'}`} />
                <span>{isBaking ? 'Baking Recipe...' : 'Bake!'}</span>
              </button>
              {bakeResult && onLoadCodeToPipeline && (
                <button
                  onClick={() => onLoadCodeToPipeline(bakeResult.output)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                  title="Send decoded text or script into PQC Pipeline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send to Pipeline</span>
                </button>
              )}
            </div>
          </div>

          {/* Main CyberChef Workspace: Operations / Recipe / Input / Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Operations Library (3 cols) */}
            <div className="lg:col-span-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center justify-between">
                <span>Operations ({AVAILABLE_OPS.length})</span>
                <span className="text-[10px] text-zinc-500 font-normal">Click to add</span>
              </div>
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {AVAILABLE_OPS.map((op) => (
                  <button
                    key={op}
                    onClick={() => addOperation(op)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-emerald-950/80 hover:text-emerald-300 border border-zinc-800/80 text-zinc-300 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <span>{op}</span>
                    <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Column: Recipe Builder (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-mono">
                  Recipe Pipeline ({chefRecipe.length} Steps)
                </span>
                {chefRecipe.length > 0 && (
                  <button
                    onClick={() => {
                      setChefRecipe([]);
                      runBake(chefInput, []);
                    }}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {chefRecipe.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500">
                  Select operations from the left panel to build your transformation recipe.
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {chefRecipe.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-lg border transition-all ${
                        step.enabled
                          ? 'border-emerald-500/40 bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-900/30 opacity-60'
                      } flex items-center justify-between gap-2`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          {step.op}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleOperation(step.id)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            step.enabled
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {step.enabled ? 'ON' : 'OFF'}
                        </button>
                        <button
                          onClick={() => removeOperation(step.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Input & Output (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Input Area */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Input ({chefInput.length} bytes)
                  </span>
                  <button
                    onClick={() => {
                      setChefInput('');
                      runBake('', chefRecipe);
                    }}
                    className="text-[10px] text-zinc-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={chefInput}
                  onChange={(e) => {
                    setChefInput(e.target.value);
                    runBake(e.target.value, chefRecipe);
                  }}
                  rows={4}
                  placeholder="Enter or paste text, hex, encoded payload..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 leading-relaxed resize-y"
                />
              </div>

              {/* Output Area */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-300 font-mono uppercase tracking-wider">
                      Output ({bakeResult?.outputLength || 0} bytes)
                    </span>
                    {bakeResult && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {bakeResult.executionTimeMs} ms
                      </span>
                    )}
                  </div>
                  {bakeResult && (
                    <button
                      onClick={() => handleCopy(bakeResult.output, 'chef_output')}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                    >
                      {copiedKey === 'chef_output' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Output</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <textarea
                  readOnly
                  value={bakeResult?.output || ''}
                  rows={6}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-emerald-300 leading-relaxed resize-y"
                />

                {/* Entropy & Metric Badge */}
                {bakeResult && bakeResult.entropy !== undefined && (
                  <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-zinc-400">Shannon Entropy:</span>
                      <span
                        className={`font-bold ${
                          bakeResult.entropy > 7.0
                            ? 'text-rose-400'
                            : bakeResult.entropy > 4.5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {bakeResult.entropy} / 8.0
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {bakeResult.entropy > 7.0
                        ? 'High (Likely Encrypted/Compressed)'
                        : 'Structured Text'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GCHQ GitHub Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search GCHQ repositories (CyberChef, Gaffer, Stroom, Bailo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-emerald-300 transition-colors">
                          <a
                            href={repo.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                          >
                            {repo.name}
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                          </a>
                        </h3>
                        {repo.status === 'Flagship' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            FLAGSHIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">{repo.repoName}</div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{repo.stars.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{repo.description}</p>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-emerald-400">
                      GCHQ Sovereign Context:
                    </div>
                    <div className="text-xs text-zinc-200">{repo.gchqMissionContext}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono text-zinc-400">Key Capabilities:</div>
                    <ul className="space-y-1">
                      {repo.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <span className="text-emerald-400">›</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>Language: <strong className="text-zinc-200">{repo.primaryLanguage}</strong></span>
                    <span>License: <strong className="text-zinc-200">{repo.license}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(repo.quickStartCommands.clone, `gchq_clone_${repo.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                      title={repo.quickStartCommands.clone}
                    >
                      {copiedKey === `gchq_clone_${repo.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied Clone</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span>git clone</span>
                        </>
                      )}
                    </button>
                    {repo.quickStartCommands.docker && (
                      <button
                        onClick={() =>
                          handleCopy(repo.quickStartCommands.docker!, `gchq_docker_${repo.id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                        title={repo.quickStartCommands.docker}
                      >
                        {copiedKey === `gchq_docker_${repo.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied Docker</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-zinc-500" />
                            <span>docker run</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Gaffer Threat Graph */}
      {activeSubTab === 'gaffer' && gafferGraph && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              GCHQ Gaffer Large-Scale Graph Intelligence Explorer
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl">
              Scalable graph database framework for high-speed entity resolution and threat actor link analytics. Analyzes complex relationships between state-sponsored threat groups, C2 networks, and compromised critical infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Entities & Relationships (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-cyan-300 uppercase">
                    Graph Nodes / Threat Entities ({gafferGraph.nodes.length})
                  </span>
                  <span className="text-zinc-500">Click node for deep dive</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {gafferGraph.nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedNode?.id === node.id
                          ? 'border-cyan-500 bg-cyan-950/40 shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{node.label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                          {node.group}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate">
                        ID: {node.id}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edge Relationships */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  Directed Threat Graph Edges ({gafferGraph.edges.length})
                </div>
                <div className="space-y-2">
                  {gafferGraph.edges.map((edge) => (
                    <div
                      key={edge.id}
                      className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 text-zinc-200">
                        <span className="text-blue-400 font-semibold">{edge.source}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                          {edge.relationship}
                        </span>
                        <span className="text-emerald-400 font-semibold">{edge.target}</span>
                      </div>
                      <span className="text-zinc-400 text-[11px]">
                        Conf: {edge.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Node Details Drawer (1 col) */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Entity Intelligence Properties
              </div>

              {selectedNode ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="text-xs font-bold text-white">{selectedNode.label}</div>
                    <div className="text-[11px] font-mono text-cyan-300">
                      Group: {selectedNode.group}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-zinc-300">Aggregated Properties:</div>
                    <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedNode.properties, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500">
                  Select an entity from the graph to inspect Gaffer accumulated properties and indicators.
                </div>
              )}

              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-1 text-xs">
                <div className="font-bold text-zinc-300">Cluster Risk:</div>
                <div className="text-rose-400 font-mono text-[11px]">
                  {gafferGraph.summary.riskCluster}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Stroom Log Normalizer */}
      {activeSubTab === 'stroom' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              GCHQ Stroom & Event-Logging Standard Schema
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl">
              Strict XML/JSON logging schemas enforcing auditable, tamper-evident trails according to UK National Cyber Security Centre (NCSC) Sovereign Standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="text-xs font-bold text-amber-300 font-mono uppercase">
                Raw Event Input (CEF / Syslog / PQC Handshake)
              </div>
              <textarea
                value={stroomLogInput}
                onChange={(e) => setStroomLogInput(e.target.value)}
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 leading-relaxed"
              />
              <button
                onClick={handleParseStroom}
                disabled={isParsingStroom}
                className="w-full py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isParsingStroom ? 'Normalizing via Stroom...' : 'Normalize to GCHQ Event Schema'}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="text-xs font-bold text-emerald-300 font-mono uppercase">
                Stroom Normalized Schema (Event-Logging v4.2)
              </div>
              <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto min-h-[140px] max-h-[220px]">
                {stroomParsed
                  ? JSON.stringify(stroomParsed, null, 2)
                  : `{\n  "status": "Awaiting log stream input..."\n}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
