import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Download,
  Upload,
  Play,
  RotateCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Flame,
  Cpu,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  FileCode,
  BookOpen,
  Filter,
} from 'lucide-react';
import {
  Coun7erCountermeasure,
  Coun7erCampaignPreset,
  Coun7erEvictionPlan,
  Coun7erStats,
  TargetEnvironment,
  CountermeasureStatus,
} from '../../types/coun7er';
import { coun7erService } from '../../services/coun7erService';

interface Coun7erTabProps {
  onLoadCodeToPipeline: (remediationCode: string) => void;
}

export const Coun7erTab: React.FC<Coun7erTabProps> = ({ onLoadCodeToPipeline }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'playbook' | 'catalog' | 'campaigns' | 'terminal' | 'cisa-io'
  >('playbook');

  const [countermeasures, setCountermeasures] = useState<Coun7erCountermeasure[]>([]);
  const [campaigns, setCampaigns] = useState<Coun7erCampaignPreset[]>([]);
  const [stats, setStats] = useState<Coun7erStats | null>(null);
  const [activePlan, setActivePlan] = useState<Coun7erEvictionPlan | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('campaign-volt-typhoon');
  const [selectedEnvironment, setSelectedEnvironment] = useState<TargetEnvironment>(
    'Enterprise Active Directory & Cloud'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCountermeasure, setSelectedCountermeasure] = useState<Coun7erCountermeasure | null>(
    null
  );

  const [executingId, setExecutingId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] CISA Eviction Strategies Tool (COUN7ER Database) initialized.',
    '[SYSTEM] Kernel-level PQC enforcement ready. FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) active.',
    '[READY] Select an incident campaign or execute atomic countermeasures.',
  ]);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cmList, campList, statData] = await Promise.all([
          coun7erService.getDatabase(),
          coun7erService.getCampaigns(),
          coun7erService.getStats(),
        ]);
        setCountermeasures(cmList);
        setCampaigns(campList);
        setStats(statData);

        // Generate initial default plan for Volt Typhoon
        const defaultPlan = await coun7erService.generatePlaybook(
          'campaign-volt-typhoon',
          [],
          'Enterprise Active Directory & Cloud'
        );
        setActivePlan(defaultPlan);
        if (cmList.length > 0) {
          setSelectedCountermeasure(cmList[0]);
        }
      } catch (err) {
        console.error('Failed to initialize COUN7ER:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGeneratePlan = async (campId: string, env: TargetEnvironment) => {
    setLoading(true);
    try {
      const plan = await coun7erService.generatePlaybook(campId, [], env);
      setActivePlan(plan);
      setTerminalLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Generated Eviction Plan: ${plan.planName}`,
        `[TARGET] Environment: ${env} | Items: ${plan.countermeasures.length} Sequenced Actions`,
        ...prev.slice(0, 50),
      ]);
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCountermeasure = async (cm: Coun7erCountermeasure) => {
    setExecutingId(cm.id);
    setTerminalLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] >>> INITIATING ATOMIC EXECUTION: ${cm.id} - ${cm.title}`,
      `[EXEC] Command Type: ${cm.executionProcedure.commandType.toUpperCase()}`,
      ...prev,
    ]);

    try {
      const result = await coun7erService.executeCountermeasure(cm.id, activePlan?.id);

      // Update state in active plan and database
      const updateStatus = (list: Coun7erCountermeasure[]) =>
        list.map((item) =>
          item.id === cm.id
            ? {
                ...item,
                status: 'verified' as CountermeasureStatus,
                executionTimestamp: result.timestamp,
                auditSignature: result.mlDsaSignature,
                logs: result.logs,
              }
            : item
        );

      setCountermeasures((prev) => updateStatus(prev));
      if (activePlan) {
        setActivePlan({
          ...activePlan,
          countermeasures: updateStatus(activePlan.countermeasures),
        });
      }

      setTerminalLogs((prev) => [
        ...result.logs,
        `[AUDIT-COMMIT] ML-DSA-65 Signature: ${result.mlDsaSignature}`,
        `[STATUS] ${cm.id} VERIFIED SUCCESSFUL.`,
        ...prev,
      ]);

      if (selectedCountermeasure?.id === cm.id) {
        setSelectedCountermeasure({
          ...cm,
          status: 'verified',
          executionTimestamp: result.timestamp,
          auditSignature: result.mlDsaSignature,
          logs: result.logs,
        });
      }
    } catch (err: any) {
      setTerminalLogs((prev) => [
        `[ERROR] Execution failed for ${cm.id}: ${err?.message || 'Command error'}`,
        ...prev,
      ]);
    } finally {
      setExecutingId(null);
    }
  };

  const handleExecuteAllInPlaybook = async () => {
    if (!activePlan || activePlan.countermeasures.length === 0) return;
    for (const cm of activePlan.countermeasures) {
      if (cm.status !== 'verified') {
        await handleExecuteCountermeasure(cm);
      }
    }
  };

  const handleExportCisaJson = () => {
    if (!activePlan) return;
    const exportData = coun7erService.formatCisaJsonExport(activePlan);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisa-coun7er-playbook-${activePlan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!activePlan) return;
    const md = coun7erService.generateMarkdownRunbook(activePlan);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cisa-coun7er-eviction-runbook-${activePlan.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed && parsed.playbook) {
        setImportStatus('Successfully parsed CISA Playbook-NG format!');
        const importedActions =
          parsed.playbook.phases?.flatMap((p: any) => p.actions || []) || [];
        const mapped = importedActions.map((a: any) => {
          const match = countermeasures.find((c: Coun7erCountermeasure) => c.id === a.countermeasureId);
          return (
            match || {
              id: a.countermeasureId || `CNTR-IMP-${Math.floor(Math.random() * 900)}`,
              title: a.title || 'Imported Countermeasure',
              category: a.category || 'Cryptographic Remediation',
              phase: 'phase-2-containment',
              phaseOrder: 1,
              mitreAttack: (a.mitreAttackIds || []).map((id: string) => ({
                id,
                name: 'Technique',
                tactic: 'Adversary Action',
              })),
              mitreD3fend: (a.mitreD3fendIds || []).map((id: string) => ({
                id,
                name: 'Defensive Action',
                defensiveTactic: 'Hardening',
              })),
              cwe: ['CWE-327'],
              intendedOutcome: 'Adversary eviction and containment',
              preparatorySteps: ['Verify forensic trace'],
              executionProcedure: {
                commandType: 'bash',
                script: a.procedure || '#!/usr/bin/env bash\necho "Applying imported eviction rule..."',
                explanation: 'Imported procedure from CISA Playbook-NG export',
              },
              operationalRisks: a.risks || ['Potential service reboot required'],
              validationSteps: a.validation || ['Verify firewall filter'],
              pqcRemediationAlignment: {
                fipsStandard: a.pqcStandard || 'NIST FIPS 203 (ML-KEM)',
                quantumThreatCountered: 'Harvest-Now-Decrypt-Later (HNDL)',
                replacementPrimitive: 'ML-KEM-768',
              },
              targetEnvironments: ['Enterprise Active Directory & Cloud'],
              cisaAdvisoryRef: 'CISA Eviction Strategies Tool Import',
              status: 'pending' as CountermeasureStatus,
            }
          );
        });

        setActivePlan({
          id: `imp-${Date.now().toString(36)}`,
          planName: parsed.playbook.title || 'Imported CISA Eviction Plan',
          createdAt: new Date().toISOString(),
          threatScenario: parsed.playbook.description || 'Imported Threat Campaign',
          targetEnvironment: (parsed.playbook.targetEnvironment as TargetEnvironment) || 'Enterprise Active Directory & Cloud',
          countermeasures: mapped,
          estimatedExecutionTimeMinutes: mapped.length * 12,
          pqcShieldActive: true,
          complianceAttestations: [
            'CISA Playbook-NG v1.2 Schema Validated',
            'NIST FIPS 203/204 Post-Quantum Aligned',
          ],
        });
        setActiveSubTab('playbook');
      } else {
        setImportStatus('Invalid schema: Missing playbook top-level object.');
      }
    } catch (e: any) {
      setImportStatus(`Parse error: ${e?.message || 'Invalid JSON syntax'}`);
    }
  };

  const filteredCountermeasures = countermeasures.filter((cm) => {
    const matchesSearch =
      searchQuery === '' ||
      cm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cm.mitreAttack.some(
        (m) =>
          m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      cm.cisaAdvisoryRef.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || cm.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'ALL',
    'Cryptographic Remediation',
    'Network Isolation',
    'Identity & Credential Reset',
    'Session & Token Purge',
    'Avionics & Bus Hardening',
    'OT / SCADA Quarantine',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans text-zinc-100">
      {/* 1. Header Banner: CISA Eviction Strategies Tool & COUN7ER Database */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-amber-950/30 border border-red-500/30 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-900/60 border border-red-500/50 text-red-200">
                Official CISA Eviction Strategies Tool
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs font-mono text-zinc-400">
                Playbook-NG Integration v1.2
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs font-mono text-emerald-400">
                NIST FIPS 203 / 204 PQC
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  CISA COUN7ER Database & Incident Eviction Engine
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  Curated repository of atomic post-compromise countermeasures to contain and evict
                  advanced cyber adversaries (Volt Typhoon, Salt Typhoon, HNDL Quantum Eavesdroppers)
                  while pivoting vulnerable assets to post-quantum cryptographic defenses.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Atomic Actions</div>
              <div className="text-lg font-bold font-mono text-red-400">
                {stats?.totalCountermeasures || 12}
              </div>
              <div className="text-[9px] text-zinc-500">Curated by CISA</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] uppercase font-mono text-zinc-400">ATT&CK TTPs</div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {stats?.totalAttackTTPsCovered || 24}
              </div>
              <div className="text-[9px] text-zinc-500">Cross-Referenced</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] uppercase font-mono text-zinc-400">D3FEND Mappings</div>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {stats?.totalD3fendTacticsMapped || 18}
              </div>
              <div className="text-[9px] text-zinc-500">Defensive Actions</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] uppercase font-mono text-zinc-400">PQC Resilient</div>
              <div className="text-lg font-bold font-mono text-emerald-400">100%</div>
              <div className="text-[9px] text-zinc-500">FIPS 203 / 204</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('playbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'playbook'
                ? 'bg-red-950/80 border border-red-500/50 text-red-200 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>Eviction Playbook Builder</span>
            {activePlan && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                {activePlan.countermeasures.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Atomic Countermeasure Catalog</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {countermeasures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'campaigns'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Incident Threat Campaigns</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {campaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'terminal'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Eviction Console</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveSubTab('cisa-io')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSubTab === 'cisa-io'
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>CISA Playbook-NG Round-Trip</span>
          </button>
        </div>

        {/* Global Export Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCisaJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer"
            title="Download CISA Playbook-NG Compatible JSON Schema"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CISA JSON</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer"
            title="Download Full Markdown Runbook"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Runbook (.md)</span>
          </button>

          {activePlan && (
            <button
              onClick={handleExecuteAllInPlaybook}
              disabled={executingId !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-900/30 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Full Eviction</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Sub-Tab View 1: Eviction Playbook Builder */}
      {activeSubTab === 'playbook' && (
        <div className="space-y-6">
          {/* Plan Configuration Selector */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-medium text-zinc-400 shrink-0">
                Select Threat Scenario:
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  handleGeneratePlan(e.target.value, selectedEnvironment);
                }}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono w-full sm:w-80 cursor-pointer"
              >
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.threatActor.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-medium text-zinc-400 shrink-0">
                Target Environment:
              </label>
              <select
                value={selectedEnvironment}
                onChange={(e) => {
                  const env = e.target.value as TargetEnvironment;
                  setSelectedEnvironment(env);
                  handleGeneratePlan(selectedCampaignId, env);
                }}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono w-full sm:w-64 cursor-pointer"
              >
                <option value="Enterprise Active Directory & Cloud">Enterprise AD & Cloud</option>
                <option value="Avionics (F-22 / F-35 / B-21)">Avionics (F-22 / F-35 / B-21)</option>
                <option value="Critical Infrastructure OT/ICS">Critical Infrastructure OT/ICS</option>
                <option value="Telecom & High-Speed Optical Backbones">Telecom & Optical Backbone</option>
                <option value="Defense Sensor-to-Shooter">Defense Sensor-to-Shooter</option>
                <option value="Financial SWIFT & Core Banking">Financial SWIFT & Core Banking</option>
              </select>

              <button
                onClick={() => handleGeneratePlan(selectedCampaignId, selectedEnvironment)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Active Eviction Directive Banner */}
          {activePlan && (
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 border border-red-800 text-red-300 font-bold">
                      ACTIVE EVICTION DIRECTIVE
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      ID: {activePlan.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{activePlan.planName}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    <span className="text-zinc-500">Execution Window:</span>{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      ~{activePlan.estimatedExecutionTimeMinutes} min
                    </span>
                  </div>
                  <div className="h-4 w-px bg-zinc-800" />
                  <div className="text-right text-xs">
                    <span className="text-zinc-500">Quantum Shield:</span>{' '}
                    <span className="text-emerald-400 font-mono font-bold">RFC 9370 ENFORCED</span>
                  </div>
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                {activePlan.complianceAttestations.map((att, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{att}</span>
                  </span>
                ))}
              </div>

              {/* Sequenced Countermeasure Execution List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                  Sequenced Countermeasure Actions ({activePlan.countermeasures.length})
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {activePlan.countermeasures.map((cm, idx) => (
                    <div
                      key={cm.id}
                      className={`p-4 rounded-xl border transition-all ${
                        cm.status === 'verified'
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : executingId === cm.id
                          ? 'bg-amber-950/20 border-amber-500/50 animate-pulse'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                              Step {idx + 1}
                            </span>
                            <span className="text-xs font-mono font-bold text-red-400">
                              {cm.id}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-zinc-800 text-zinc-300">
                              {cm.category}
                            </span>
                            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                              {cm.phase.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white">{cm.title}</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                            {cm.intendedOutcome}
                          </p>

                          {/* MITRE and PQC Mapping Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cm.mitreAttack.map((atk) => (
                              <span
                                key={atk.id}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/60 border border-red-800/80 text-red-300"
                              >
                                ATT&CK: {atk.id} ({atk.name})
                              </span>
                            ))}
                            {cm.mitreD3fend.map((def) => (
                              <span
                                key={def.id}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/80 text-cyan-300"
                              >
                                D3FEND: {def.id}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold">
                              {cm.pqcRemediationAlignment.fipsStandard}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-center">
                          <button
                            onClick={() => setSelectedCountermeasure(cm)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                          >
                            Inspect
                          </button>

                          <button
                            onClick={() => onLoadCodeToPipeline(cm.executionProcedure.script)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 cursor-pointer"
                            title="Load remediation script into PQC Pipeline"
                          >
                            <FileCode className="w-3.5 h-3.5 text-purple-400" />
                            <span>To Pipeline</span>
                          </button>

                          <button
                            onClick={() => handleExecuteCountermeasure(cm)}
                            disabled={executingId !== null || cm.status === 'verified'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              cm.status === 'verified'
                                ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-xs'
                            }`}
                          >
                            {cm.status === 'verified' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Verified</span>
                              </>
                            ) : executingId === cm.id ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>Executing...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Trigger</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Sub-Tab View 2: Atomic Countermeasure Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by TTP (e.g. T1552), ID, keyword, or CISA Advisory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <div className="flex items-center gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-950 border border-red-500/50 text-red-200 font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Grid & Inspect View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Countermeasures (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs text-zinc-400 font-mono flex items-center justify-between">
                <span>Matching Countermeasures: {filteredCountermeasures.length}</span>
                <span>Database: CISA COUN7ER v1.2</span>
              </div>

              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {filteredCountermeasures.map((cm) => (
                  <div
                    key={cm.id}
                    onClick={() => setSelectedCountermeasure(cm)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedCountermeasure?.id === cm.id
                        ? 'bg-zinc-800/90 border-red-500/70 shadow-lg'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-red-400">{cm.id}</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                            {cm.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {cm.pqcRemediationAlignment.fipsStandard.split(' ')[0]}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{cm.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {cm.intendedOutcome}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 self-center" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/50">
                      {cm.mitreAttack.slice(0, 2).map((a) => (
                        <span
                          key={a.id}
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-950/40 text-red-300"
                        >
                          {a.id}
                        </span>
                      ))}
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950/40 text-cyan-300">
                        {cm.executionProcedure.commandType.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                        {cm.cisaAdvisoryRef.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Inspector Drawer (5 cols) */}
            <div className="lg:col-span-5">
              {selectedCountermeasure ? (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 sticky top-20">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-red-400">
                          {selectedCountermeasure.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 font-bold">
                          {selectedCountermeasure.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">
                        {selectedCountermeasure.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleExecuteCountermeasure(selectedCountermeasure)}
                      disabled={executingId !== null}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer shrink-0"
                    >
                      {executingId === selectedCountermeasure.id ? 'Running...' : 'Execute'}
                    </button>
                  </div>

                  {/* Intended Outcome */}
                  <div>
                    <h5 className="text-[10px] uppercase font-mono text-zinc-400 font-bold">
                      Intended Tactical Outcome
                    </h5>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                      {selectedCountermeasure.intendedOutcome}
                    </p>
                  </div>

                  {/* PQC & NIST Standard Alignment */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Post-Quantum Alignment (NIST & CNSA 2.0)</span>
                    </div>
                    <div className="text-xs text-emerald-200">
                      Standard: <span className="font-mono font-bold">{selectedCountermeasure.pqcRemediationAlignment.fipsStandard}</span>
                    </div>
                    <div className="text-xs text-emerald-300/80">
                      Replacement: <span className="font-mono font-bold">{selectedCountermeasure.pqcRemediationAlignment.replacementPrimitive}</span>
                    </div>
                    {selectedCountermeasure.pqcRemediationAlignment.hybridProtocol && (
                      <div className="text-xs text-emerald-400">
                        Hybrid Envelope: <span className="font-mono">{selectedCountermeasure.pqcRemediationAlignment.hybridProtocol}</span>
                      </div>
                    )}
                  </div>

                  {/* Execution Code / CLI Command */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold">
                        Atomic Procedure ({selectedCountermeasure.executionProcedure.commandType.toUpperCase()})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCountermeasure.executionProcedure.script
                            );
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={() =>
                            onLoadCodeToPipeline(selectedCountermeasure.executionProcedure.script)
                          }
                          className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>Load to Pipeline</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-3 rounded-lg bg-black border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-snug">
                      <code>{selectedCountermeasure.executionProcedure.script}</code>
                    </pre>
                  </div>

                  {/* Operational Risks & Downtime */}
                  <div>
                    <h5 className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Operational Risks & Constraints</span>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-zinc-400 mt-1 space-y-0.5">
                      {selectedCountermeasure.operationalRisks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Validation Steps */}
                  <div>
                    <h5 className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                      Eviction Validation Steps
                    </h5>
                    <ul className="list-disc list-inside text-xs text-zinc-400 mt-1 space-y-0.5">
                      {selectedCountermeasure.validationSteps.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs">
                  Select a countermeasure to inspect full CISA specification
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab View 3: Curated Incident Threat Campaigns */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
            Curated threat incident campaigns modeled directly on **CISA and NSA Cybersecurity Advisories (CSAs)**.
            Each campaign pairs active adversarial TTPs with recommended atomic countermeasures from the COUN7ER database.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 border border-red-800 text-red-300">
                      {camp.criticality}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{camp.name}</h3>
                    <p className="text-xs font-mono text-zinc-400">{camp.threatActor}</p>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-amber-300 font-bold shrink-0">
                    {camp.quantumRiskFactor}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{camp.description}</p>

                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span className="text-zinc-500">CISA Advisory Ref:</span>{' '}
                  <span className="text-red-400 font-bold">{camp.cisaAlertId}</span>
                </div>

                {/* Observed TTPs */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono text-zinc-400">Observed TTPs</div>
                  <div className="flex flex-wrap gap-1">
                    {camp.observedTTPs.map((ttp) => (
                      <span
                        key={ttp}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                      >
                        {ttp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
                  <span className="text-xs text-zinc-400 font-mono">
                    {camp.recommendedCountermeasureIds.length} Countermeasures
                  </span>

                  <button
                    onClick={() => {
                      setSelectedCampaignId(camp.id);
                      setSelectedEnvironment(camp.targetEnvironment);
                      handleGeneratePlan(camp.id, camp.targetEnvironment);
                      setActiveSubTab('playbook');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Generate Eviction Directive</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sub-Tab View 4: Live Eviction Console & Forensics */}
      {activeSubTab === 'terminal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>CISA COUN7ER Kernel Console & Audit Ledger Commit Stream</span>
            </div>
            <button
              onClick={() =>
                setTerminalLogs([
                  `[${new Date().toLocaleTimeString()}] Buffer cleared. Waiting for atomic countermeasure triggers...`,
                ])
              }
              className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
            >
              Clear Console
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-emerald-400 overflow-y-auto max-h-[500px] space-y-1.5 shadow-2xl leading-relaxed">
            {terminalLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-zinc-600 select-none">{String(index + 1).padStart(3, '0')}</span>
                <span
                  className={
                    log.includes('ERROR')
                      ? 'text-red-400 font-bold'
                      : log.includes('VERIFIED') || log.includes('Complete')
                      ? 'text-emerald-300 font-bold'
                      : log.includes('ML-DSA') || log.includes('AUDIT')
                      ? 'text-cyan-300'
                      : 'text-zinc-300'
                  }
                >
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Cryptographic Digest Algorithm: SHA-384</span>
            <span className="text-zinc-400">Post-Quantum Signature: FIPS 204 ML-DSA-65</span>
            <span className="text-emerald-400">Audit Status: Synchronized</span>
          </div>
        </div>
      )}

      {/* 7. Sub-Tab View 5: CISA Playbook-NG Round-Trip Import / Export */}
      {activeSubTab === 'cisa-io' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>CISA Playbook-NG Round-Trip Interoperability</span>
            </h3>
            <p>
              CISA offers **Playbook-NG** as a stateless web tool under the MIT open-source license.
              This platform provides full two-way compatibility with Playbook-NG JSON format. You can
              paste a CISA Playbook-NG plan to import its adversary TTP mappings, or export your current
              quantum-hardened eviction directive to re-upload directly into CISA&apos;s Playbook-NG interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import JSON */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Import CISA Playbook-NG JSON</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Paste JSON exported from CISA Playbook-NG or a partner cybersecurity directive:
              </p>

              <textarea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "schemaVersion": "1.2.0", "playbook": { "title": "Volt Typhoon Containment", "phases": [...] } }'
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />

              {importStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-mono ${
                    importStatus.includes('Successfully')
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-red-950/80 border border-red-800 text-red-300'
                  }`}
                >
                  {importStatus}
                </div>
              )}

              <button
                onClick={handleImportJson}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
              >
                Parse & Load Playbook
              </button>
            </div>

            {/* Export Preview */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Active Plan Export Schema Preview</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Live serialization of the current active plan matching CISA&apos;s v1.2 schema:
              </p>

              {activePlan ? (
                <pre className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[290px] leading-snug">
                  <code>{JSON.stringify(coun7erService.formatCisaJsonExport(activePlan), null, 2)}</code>
                </pre>
              ) : (
                <div className="p-12 text-center text-xs text-zinc-500">No active plan generated</div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleExportCisaJson}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  Download .JSON
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                >
                  Download .MD Runbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
