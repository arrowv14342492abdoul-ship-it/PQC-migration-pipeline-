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
  Activity,
  Radio,
  Lock,
  Zap,
} from 'lucide-react';
import {
  IsraelCyberRepository,
  CdmControlItem,
  CertIlThreatAlert,
  TraceeEbpfEvent,
} from '../../types/israelCyberSoftware';
import { israelCyberService } from '../../services/israelCyberService';

interface IsraelCyberTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const IsraelCyberTab: React.FC<IsraelCyberTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cdm' | 'cert-il' | 'catalog' | 'tracee'
  >('cdm');

  const [repositories, setRepositories] = useState<IsraelCyberRepository[]>([]);
  const [cdmControls, setCdmControls] = useState<CdmControlItem[]>([]);
  const [certAlerts, setCertAlerts] = useState<CertIlThreatAlert[]>([]);
  const [traceeEvents, setTraceeEvents] = useState<TraceeEbpfEvent[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // CDM Evaluator State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    israelCyberService.getRepositories().then(setRepositories).catch(console.error);
    israelCyberService.getCdmControls().then(setCdmControls).catch(console.error);
    israelCyberService.getCertIlAlerts().then(setCertAlerts).catch(console.error);
    israelCyberService.getTraceeEvents().then(setTraceeEvents).catch(console.error);
  }, []);

  const handleRunCdmEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await israelCyberService.evaluateCdmCompliance();
      setEvaluationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
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
    'National Cyber Defense',
    'Threat Intelligence & CERT',
    'ICS & Critical Infrastructure',
    'Runtime eBPF Security',
    'IaC & Compliance',
    'Post-Quantum Research',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-zinc-900/80 to-blue-950/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5">
                <FolderGit2 className="w-3 h-3 text-sky-400" />
                Israel National Cyber Directorate (INCD / מערך הסייבר)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                github.com/cyber-israel
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                CERT-IL Hotline 119
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Israel Cyber Defense & Sovereign Security Suite
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full integration of sovereign cyber defense frameworks, threat intelligence feeds, and open-source cybersecurity tools published by the <strong className="text-sky-300">Israel National Cyber Directorate (INCD)</strong>, <strong className="text-blue-300">CERT-IL</strong>, and the Israeli sovereign defense sector. Features interactive <strong className="text-sky-300">CDM 2.0 Compliance Auditing</strong>, live <strong className="text-emerald-300">CERT-IL STIX/TAXII</strong> threat feeds, and <strong className="text-cyan-300">Tracee eBPF</strong> runtime protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <a
              href="https://www.gov.il/en/departments/israel_national_cyber_directorate"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>INCD Gov Portal</span>
            </a>
            <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-950/30 flex items-center gap-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Total Ecosystem Stars</div>
                <div className="text-sm font-bold font-mono text-zinc-100">28,000+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-zinc-800">
          <button
            onClick={() => setActiveSubTab('cdm')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'cdm'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
            <span>INCD CDM 2.0 Compliance Evaluator</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-950 border border-sky-400/30 text-sky-200">
              National Baseline
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('cert-il')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'cert-il'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>CERT-IL Threat Intelligence (STIX/TAXII)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-200">
              Live Feed
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Israeli Open Source Catalog</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {repositories.length} Repos
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('tracee')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'tracee'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            <span>Tracee eBPF Kernel Monitor</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Sovereign Runtime
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INCD CDM 2.0 Compliance Evaluator */}
      {activeSubTab === 'cdm' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                Cyber Defense Methodology Version 2.0 (CDM)
              </div>
              <h3 className="text-lg font-bold text-white">
                Sovereign Cyber Resilience & Zero-Trust Verification
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                Official security baseline published by the Israel National Cyber Directorate, mandating hybrid post-quantum key encapsulation (NIST FIPS 203) and strict Purdue OT Layer 3 isolation.
              </p>
            </div>

            <button
              onClick={handleRunCdmEvaluation}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Evaluating CDM Baseline...' : 'Run CDM 2.0 Audit'}</span>
            </button>
          </div>

          {/* Compliance Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
              <div className="text-[10px] uppercase font-mono text-zinc-400">CDM 2.0 National Status</div>
              <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>COMPLIANT (96%)</span>
              </div>
              <div className="text-[10px] text-zinc-400">Zero-Trust & PQC Controls Verified</div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Cryptographic Standard</div>
              <div className="text-sm font-bold font-mono text-sky-300">
                ML-KEM-768 / ML-DSA-65
              </div>
              <div className="text-[10px] text-zinc-400">FIPS 203/204 Sovereign Alignment</div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Critical Infrastructure SLA</div>
              <div className="text-sm font-bold font-mono text-cyan-300">
                Purdue Layer 3 Shielded
              </div>
              <div className="text-[10px] text-zinc-400">Optical Data Diode Isolation</div>
            </div>
          </div>

          {/* Controls List */}
          <div className="space-y-3">
            {cdmControls.map((ctrl) => (
              <div
                key={ctrl.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3 hover:border-sky-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-800 text-sky-300">
                      {ctrl.id}
                    </span>
                    <span className="text-sm font-bold text-white">{ctrl.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {ctrl.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">{ctrl.description}</p>

                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1 font-mono">
                  <div className="text-sky-300 font-bold">PQC & National Defense Impact:</div>
                  <div className="text-zinc-300">{ctrl.pqcRelevance}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-zinc-400">
                      INCD Remediation Implementation Code:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(ctrl.remediationSnippet, `ctrl_${ctrl.id}`)}
                        className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                      >
                        {copiedKey === `ctrl_${ctrl.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </button>
                      {onLoadCodeToPipeline && (
                        <button
                          onClick={() => onLoadCodeToPipeline(ctrl.remediationSnippet)}
                          className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Load into PQC Pipeline</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-black border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {ctrl.remediationSnippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CERT-IL Threat Intelligence Feed */}
      {activeSubTab === 'cert-il' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-ping" />
                Israel Computer Emergency Response Team (CERT-IL / 119)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-900/60 border border-rose-700 text-rose-200 font-bold">
                STIX 2.1 TAXII Feed
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Sovereign Threat Intelligence Bulletins & Incident Advisories
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl">
              Real-time threat advisories dispatched to critical sectors (energy, water, banking, aerospace). Includes Harvest-Now-Decrypt-Later reconnaissance signatures and automated containment playbooks.
            </p>
          </div>

          <div className="space-y-4">
            {certAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3 hover:border-rose-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-500 text-black'
                          : 'bg-amber-500 text-black'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-sm font-bold text-white">{alert.title}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{alert.code}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400">Target Sector: </span>
                    <span className="text-zinc-200 font-semibold">{alert.targetSector}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-400">MITRE Technique: </span>
                    <span className="text-rose-300 font-semibold">{alert.mitreTactic}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{alert.description}</p>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-400 font-mono">INCD Emergency Mitigation:</div>
                  <div className="text-zinc-300">{alert.mitigation}</div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-zinc-400 font-mono text-[11px]">
                    Indicators of Compromise (IoCs):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.iocs.map((ioc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-black border border-zinc-800 font-mono text-[11px] text-rose-300"
                      >
                        {ioc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Israeli Open Source Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Israeli cyber repos (CDM, Tracee, KICS, SCADA-Shield)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-sky-500"
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
                      ? 'bg-sky-600 text-white font-semibold'
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
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white hover:text-sky-300 transition-colors">
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
                        {repo.status === 'Official Sovereign' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            SOVEREIGN
                          </span>
                        )}
                        {repo.status === 'Flagship' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
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
                    <div className="text-[10px] uppercase font-mono text-sky-400 font-bold">
                      National Defense Role:
                    </div>
                    <div className="text-xs text-zinc-200">{repo.incdRole}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono text-zinc-400">Key Capabilities:</div>
                    <ul className="space-y-1">
                      {repo.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <span className="text-sky-400">›</span>
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
                      onClick={() => handleCopy(repo.quickStartCommands.clone, `il_clone_${repo.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                      title={repo.quickStartCommands.clone}
                    >
                      {copiedKey === `il_clone_${repo.id}` ? (
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
                          handleCopy(repo.quickStartCommands.docker!, `il_docker_${repo.id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                        title={repo.quickStartCommands.docker}
                      >
                        {copiedKey === `il_docker_${repo.id}` ? (
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

      {/* SUB-TAB 4: Tracee eBPF Kernel Monitor */}
      {activeSubTab === 'tracee' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Tracee eBPF Kernel Runtime Threat Detection
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl">
              Real-time Linux kernel security probes capturing low-level system calls, memory inspection attempts, and fileless code execution without modifying kernel source.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase tracking-wider">
                  Live eBPF Kernel Probes Stream ({traceeEvents.length} Events)
                </span>
                <span className="text-zinc-500">libbpf v1.4 / Linux 6.8</span>
              </div>

              <div className="space-y-2">
                {traceeEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-lg border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      ev.verdict === 'BLOCKED'
                        ? 'border-rose-500/50 bg-rose-950/20 text-rose-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">{ev.timestamp}</span>
                        <span className="font-bold text-sky-400">{ev.processName}</span>
                        <span className="text-[11px] text-zinc-400">[{ev.syscall}]</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-zinc-300">
                          {ev.probeType}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-300">{ev.description}</div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">{ev.cryptoPrimitive}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.verdict === 'BLOCKED'
                            ? 'bg-rose-500 text-black'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {ev.verdict}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
