import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileCode2,
  Cpu,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  Activity,
  Layers,
  Clock,
  Eye,
  RefreshCw,
  FolderOpen,
  Send,
  ExternalLink,
  ChevronRight,
  Shield,
  Target,
  FileText,
  Sliders,
  Flame,
} from 'lucide-react';
import { QuantumThreatModelResult, QuantumAttackVector } from '../../types/threatModel';
import { THREAT_MODEL_PRESETS, ThreatModelPreset } from './ThreatModelPresets';
import { threatModelService } from '../../services/threatModelService';

interface QuantumThreatModelTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const QuantumThreatModelTab: React.FC<QuantumThreatModelTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [sourceCode, setSourceCode] = useState<string>(THREAT_MODEL_PRESETS[0].code);
  const [fileName, setFileName] = useState<string>(THREAT_MODEL_PRESETS[0].fileName);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(THREAT_MODEL_PRESETS[0].id);
  const [threatActorProfile, setThreatActorProfile] = useState<string>(
    'Nation-State CRQC APT (Harvest Now, Decrypt Later)'
  );
  const [targetYear, setTargetYear] = useState<number>(2030);
  const [complianceTarget, setComplianceTarget] = useState<string>(
    'NIST FIPS 203 & 204 / NSA CNSA 2.0'
  );
  const [modelChoice, setModelChoice] = useState<string>('gemini-3.8-flash');

  // Execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [threatModelResult, setThreatModelResult] = useState<QuantumThreatModelResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'vectors' | 'cbom' | 'defense' | 'raw'>(
    'vectors'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Preset Selection
  const handleSelectPreset = (preset: ThreatModelPreset) => {
    setSelectedPresetId(preset.id);
    setFileName(preset.fileName);
    setSourceCode(preset.code);
    setThreatModelResult(null);
    setErrorMessage(null);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedPresetId('custom-upload');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSourceCode(content);
        setThreatModelResult(null);
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
  };

  // Run Threat Model with Gemini API
  const handleRunThreatModel = async () => {
    if (!sourceCode.trim()) {
      setErrorMessage('Please upload or paste source code to perform threat modeling.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStage('Scanning code AST for classical cryptographic primitives...');

    const stageTimer1 = setTimeout(() => {
      setLoadingStage('Calling Gemini 3.8-Flash to model quantum-adversary attack vectors...');
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setLoadingStage('Simulating Shor / Grover kill chains & HNDL exposure windows...');
    }, 2800);

    const stageTimer3 = setTimeout(() => {
      setLoadingStage('Generating NIST FIPS 203 / 204 defensive remediations...');
    }, 4500);

    try {
      const result = await threatModelService.runThreatModel(sourceCode, fileName, {
        model: modelChoice,
        threatActorProfile,
        targetYear,
        complianceTarget,
      });

      setThreatModelResult(result);
      if (result.attackVectors && result.attackVectors.length > 0) {
        setSelectedVectorId(result.attackVectors[0].id);
      }
    } catch (err: any) {
      console.error('Threat model failure:', err);
      setErrorMessage(err.message || 'Failed to generate quantum threat model.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Export full markdown report
  const handleExportMarkdown = () => {
    if (!threatModelResult) return;
    const md = `# Automated Quantum Threat Model Report
**Target File**: \`${threatModelResult.fileName}\`  
**Generated At**: ${threatModelResult.metadata.generatedAt}  
**Engine**: ${threatModelResult.metadata.model}  
**Overall Quantum Risk Score**: ${threatModelResult.overallRiskScore}/100 (${threatModelResult.quantumReadiness})  
**HNDL Risk Level**: ${threatModelResult.hndlExposure.level} (Retention Risk: ${threatModelResult.hndlExposure.retentionRiskYears} years)  
**Estimated Q-Day Horizon**: ${threatModelResult.crqcBreachTimeline}  

---

## Executive Summary
${threatModelResult.summary}

---

## Quantum-Adversary Attack Vectors (${threatModelResult.attackVectors.length} Identified)

${threatModelResult.attackVectors
  .map(
    (v, i) => `### ${i + 1}. [${v.id}] ${v.name}
- **Vulnerable Primitive**: ${v.vulnerablePrimitive}
- **Code Location**: \`${v.targetCodeLocation}\`
- **Quantum Mechanism**: ${v.quantumMechanism}
- **Severity**: ${v.severity} | **Feasibility**: ${v.feasibility}
- **MITRE ATT&CK**: ${v.mitreTechnique.id} - ${v.mitreTechnique.name}
- **DREAD Total**: ${v.dreadScores.total}/100

#### Adversary Kill Chain:
${v.adversaryKillChain.map((step) => `1. **${step.phase}: ${step.title}** - ${step.description}\n   *Detail*: \`${step.technicalDetail}\``).join('\n')}

#### Recommended Remediation:
${v.recommendedRemediation}

\`\`\`python
${v.remediationCodeSnippet}
\`\`\`
`
  )
  .join('\n---\n')}

---

## Cryptographic Bill of Materials (CBOM)
| Primitive | Current Spec | Quantum Risk | FIPS Replacement |
|---|---|---|---|
${threatModelResult.cbomInventory.map((c) => `| ${c.primitive} | ${c.currentSpec} | ${c.quantumRisk} | ${c.fipsReplacement} |`).join('\n')}

---

## Phased Defense Action Plan
${threatModelResult.defenseActionPlan.map((p) => `- **[${p.priority}]** ${p.title} (${p.timeline})\n  ${p.action}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_threat_model_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!threatModelResult) return;
    const blob = new Blob([JSON.stringify(threatModelResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_threat_model_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedVector =
    threatModelResult?.attackVectors.find((v) => v.id === selectedVectorId) ||
    threatModelResult?.attackVectors[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
              Automated Threat Modeling
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Gemini 3.8-Flash AI
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
              NIST FIPS 203 & 204
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Quantum-Adversary Threat Modeling Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
            Upload source code to automatically synthesize adversary attack vectors, Shor/Grover kill chains,
            Harvest Now Decrypt Later (HNDL) exposure windows, and defensive PQC remediations using the Gemini API.
          </p>
        </div>

        {/* Quick CTA Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload Code</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".py,.ts,.js,.go,.rs,.c,.cpp,.java,.cs,.pem,.json"
            className="hidden"
          />

          <button
            onClick={handleRunThreatModel}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg cursor-pointer active:scale-95 ${
              isLoading
                ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Modeling Threat...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Threat Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Architectures Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Quick-Audit Presets & Vulnerable Architectures
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Click any architecture or upload custom files (.py, .ts, .go, .c)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {THREAT_MODEL_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-lg text-left transition border cursor-pointer ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-100 truncate">{preset.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    {preset.language}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-rose-400">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{preset.primaryRisk}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration & Code Input Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Adversary Configuration & Code Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Threat Model Parameters
                </span>
              </div>
            </div>

            {/* Threat Actor Profile */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-300">
                Adversary Threat Actor Profile
              </label>
              <select
                value={threatActorProfile}
                onChange={(e) => setThreatActorProfile(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="Nation-State CRQC APT (Harvest Now, Decrypt Later)">
                  Nation-State CRQC APT (Harvest Now, Decrypt Later)
                </option>
                <option value="Advanced Quantum Cyber-Cartel / Extortionist">
                  Advanced Quantum Cyber-Cartel / Extortionist
                </option>
                <option value="Foreign SIGINT Passive Wiretap Program">
                  Foreign SIGINT Passive Wiretap Program
                </option>
                <option value="Industrial Espionage & Patent Interceptor">
                  Industrial Espionage & Patent Interceptor
                </option>
              </select>
            </div>

            {/* Q-Day Horizon & Target Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">
                  CRQC Arrival Horizon (Q-Day)
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 font-mono"
                >
                  <option value={2027}>2027 (Aggressive / Near-Term)</option>
                  <option value={2030}>2030 (Industry Consensus)</option>
                  <option value={2033}>2033 (Conservative)</option>
                  <option value={2035}>2035 (Long-Horizon)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-300">
                  Gemini Model Engine
                </label>
                <select
                  value={modelChoice}
                  onChange={(e) => setModelChoice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                </select>
              </div>
            </div>

            {/* Compliance Target */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-300">
                Defense & Compliance Benchmark
              </label>
              <select
                value={complianceTarget}
                onChange={(e) => setComplianceTarget(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="NIST FIPS 203 & 204 / NSA CNSA 2.0">
                  NIST FIPS 203 & 204 / NSA CNSA 2.0 (Mandatory 2026-2030)
                </option>
                <option value="BSI TR-02102-1 (German Federal Post-Quantum Spec)">
                  BSI TR-02102-1 (German Federal Post-Quantum Spec)
                </option>
                <option value="PCI-DSS v4.0 Cryptographic Integrity & Agility">
                  PCI-DSS v4.0 Cryptographic Integrity & Agility
                </option>
              </select>
            </div>
          </div>

          {/* Source Code Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-zinc-200">{fileName}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({sourceCode.split('\n').length} lines)
                </span>
              </div>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Change File
              </button>
            </div>

            <div className="relative">
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500 leading-relaxed resize-y"
                placeholder="Paste code or upload file containing cryptographic primitives..."
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Supports Python, Go, TypeScript, Rust, C, C++, Java, PEM keys
              </span>
              <button
                onClick={handleRunThreatModel}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Run Threat Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Threat Modeling Output & Analysis Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading && (
            <div className="bg-zinc-900 border border-rose-900/50 rounded-xl p-8 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 animate-pulse">
                <Flame className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-100">
                  Synthesizing Quantum Threat Model with Gemini AI
                </h3>
                <p className="text-xs text-rose-400 font-mono animate-pulse">{loadingStage}</p>
              </div>
              <div className="max-w-md mx-auto w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">Threat Modeling Analysis Failed</p>
                <p className="mt-1 text-rose-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          {!isLoading && !threatModelResult && !errorMessage && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-zinc-800/80 text-zinc-400">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200">
                Ready for Automated Threat Modeling
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Select one of the preset vulnerable architectures above or upload your own source code,
                then click <strong className="text-zinc-200">Generate Threat Model</strong>. The Gemini
                API will decompose cryptographic attack vectors and synthesize Shor/Grover kill chains.
              </p>
              <button
                onClick={handleRunThreatModel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition shadow-md shadow-rose-950"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Analysis Now</span>
              </button>
            </div>
          )}

          {threatModelResult && !isLoading && (
            <div className="space-y-4">
              {/* Executive Header Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Score Dial Badge */}
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold border shrink-0 ${
                        threatModelResult.overallRiskScore >= 80
                          ? 'bg-rose-950 border-rose-700 text-rose-300'
                          : threatModelResult.overallRiskScore >= 50
                          ? 'bg-amber-950 border-amber-700 text-amber-300'
                          : 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      }`}
                    >
                      <span className="text-xl leading-none">
                        {threatModelResult.overallRiskScore}
                      </span>
                      <span className="text-[9px] text-zinc-400">/ 100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                          Overall Quantum Vulnerability
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            threatModelResult.quantumReadiness === 'CRITICAL_EXPOSURE'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {threatModelResult.quantumReadiness.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>
                          File: <strong className="text-zinc-200">{threatModelResult.fileName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Q-Day Window: <strong className="text-zinc-200">{threatModelResult.crqcBreachTimeline}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleExportMarkdown}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
                      title="Download Markdown Report"
                    >
                      <Download className="w-3 h-3 text-zinc-400" />
                      <span>MD Report</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
                      title="Download JSON Schema"
                    >
                      <FileText className="w-3 h-3 text-zinc-400" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* HNDL Alert Banner */}
                <div className="bg-rose-950/30 border border-rose-900/60 rounded-lg p-3 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-200">
                        Harvest Now, Decrypt Later (HNDL) Threat Level: {threatModelResult.hndlExposure.level}
                      </span>
                      <span className="text-[10px] font-mono text-rose-300/80 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800/60">
                        {threatModelResult.hndlExposure.retentionRiskYears}-Year Exposure Window
                      </span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      {threatModelResult.hndlExposure.rationale}
                    </p>
                  </div>
                </div>

                {/* Summary narrative */}
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                  {threatModelResult.summary}
                </p>

                {/* Sub-Tabs Selector */}
                <div className="flex items-center gap-1 border-b border-zinc-800 pt-2">
                  <button
                    onClick={() => setActiveResultTab('vectors')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      activeResultTab === 'vectors'
                        ? 'border-rose-500 text-rose-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Attack Vectors & Kill Chains ({threatModelResult.attackVectors.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveResultTab('cbom')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      activeResultTab === 'cbom'
                        ? 'border-rose-500 text-rose-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Vulnerable CBOM ({threatModelResult.cbomInventory.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveResultTab('defense')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      activeResultTab === 'defense'
                        ? 'border-rose-500 text-rose-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>NIST Defense Plan & Compliance</span>
                  </button>
                </div>
              </div>

              {/* View 1: Attack Vectors & Kill Chains */}
              {activeResultTab === 'vectors' && (
                <div className="space-y-4">
                  {/* Vector Selector Pills */}
                  <div className="flex flex-wrap gap-2">
                    {threatModelResult.attackVectors.map((v) => {
                      const isSelected = v.id === selectedVector?.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVectorId(v.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isSelected
                              ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-sm'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-rose-400 font-bold">{v.id}</span>
                          <span className="truncate max-w-[200px]">{v.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1 rounded ${
                              v.severity === 'CRITICAL'
                                ? 'bg-rose-900/60 text-rose-300'
                                : 'bg-amber-900/60 text-amber-300'
                            }`}
                          >
                            {v.severity}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Vector Deep Dive Card */}
                  {selectedVector && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
                      {/* Vector Title & Meta */}
                      <div className="space-y-2 border-b border-zinc-800 pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                              {selectedVector.id}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-100">{selectedVector.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                              MITRE {selectedVector.mitreTechnique.id}: {selectedVector.mitreTechnique.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              DREAD {selectedVector.dreadScores.total}/100
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                            <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                              Vulnerable Primitive:
                            </span>
                            <span className="text-rose-300 font-medium">
                              {selectedVector.vulnerablePrimitive}
                            </span>
                          </div>
                          <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                            <span className="text-zinc-500 block text-[10px] uppercase font-mono">
                              Target Code Reference:
                            </span>
                            <span className="text-zinc-300 font-mono text-[11px]">
                              {selectedVector.targetCodeLocation}
                            </span>
                          </div>
                        </div>

                        {/* Quantum Mechanism */}
                        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/80 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                            Quantum Cryptanalytic Mechanism:
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                            {selectedVector.quantumMechanism}
                          </p>
                        </div>
                      </div>

                      {/* 5-Phase Adversary Kill Chain */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-rose-400" />
                            Multi-Phase Adversary Attack Kill Chain
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Interception → CRQC Shor Execution → Retroactive Decryption
                          </span>
                        </div>

                        <div className="space-y-2">
                          {selectedVector.adversaryKillChain.map((step, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-lg p-3 text-xs transition space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-rose-400 font-bold text-[11px]">
                                  {step.phase}: {step.title}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  Step {idx + 1} of {selectedVector.adversaryKillChain.length}
                                </span>
                              </div>
                              <p className="text-zinc-300">{step.description}</p>
                              <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800/50 mt-1">
                                {step.technicalDetail}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DREAD Risk Score Bars */}
                      <div className="bg-zinc-950/70 p-3.5 rounded-lg border border-zinc-800 space-y-3">
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                          DREAD Quantum Risk Evaluation
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">Damage</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              {selectedVector.dreadScores.damage}/10
                            </span>
                          </div>
                          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">Reproducibility</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              {selectedVector.dreadScores.reproducibility}/10
                            </span>
                          </div>
                          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">Exploitability</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              {selectedVector.dreadScores.exploitability}/10
                            </span>
                          </div>
                          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">Affected Users</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              {selectedVector.dreadScores.affectedUsers}/10
                            </span>
                          </div>
                          <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">Discoverability</span>
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              {selectedVector.dreadScores.discoverability}/10
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remediation & Defensive Code Snippet */}
                      <div className="space-y-2 border-t border-zinc-800 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-300">
                              Recommended Defensive Remediation (NIST FIPS 203/204)
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(selectedVector.remediationCodeSnippet, 999)}
                            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                          >
                            {copiedCodeIndex === 999 ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Remediation</span>
                          </button>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {selectedVector.recommendedRemediation}
                        </p>

                        <div className="relative bg-zinc-950 rounded-lg p-3 border border-zinc-800 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
                          <pre>{selectedVector.remediationCodeSnippet}</pre>
                        </div>

                        {onLoadCodeToPipeline && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => onLoadCodeToPipeline(sourceCode)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer transition shadow-md shadow-emerald-950"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Load into 3-Agent Migration Pipeline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Cryptographic Bill of Materials (CBOM) */}
              {activeResultTab === 'cbom' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        Vulnerable Cryptographic Inventory (CBOM)
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Extracted from uploaded source code ({threatModelResult.fileName})
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-zinc-800 rounded-lg">
                      <thead className="bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase border-b border-zinc-800">
                        <tr>
                          <th className="p-3">Primitive</th>
                          <th className="p-3">Current Spec</th>
                          <th className="p-3">Quantum Vulnerability</th>
                          <th className="p-3">NIST FIPS Replacement</th>
                          <th className="p-3">CWE Mapping</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {threatModelResult.cbomInventory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/30">
                            <td className="p-3 font-mono font-bold text-zinc-100">{item.primitive}</td>
                            <td className="p-3 text-zinc-300">{item.currentSpec}</td>
                            <td className="p-3 text-rose-300 font-medium">{item.quantumRisk}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {item.fipsReplacement}
                            </td>
                            <td className="p-3 text-zinc-400 font-mono text-[11px]">
                              {item.cweMapping || 'CWE-327'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 3: Defense Action Plan & Compliance */}
              {activeResultTab === 'defense' && (
                <div className="space-y-4">
                  {/* Action Roadmap */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Phased Post-Quantum Remediation Roadmap
                    </h3>

                    <div className="space-y-3">
                      {threatModelResult.defenseActionPlan.map((action, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  action.priority === 'IMMEDIATE'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : action.priority === 'PHASE_1'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                }`}
                              >
                                {action.priority}
                              </span>
                              <span className="font-bold text-zinc-100 text-xs">{action.title}</span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {action.timeline}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{action.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Matrix */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Post-Quantum Compliance Benchmarks
                    </h3>

                    <div className="space-y-2">
                      {threatModelResult.complianceStatus.map((chk, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-200 block">{chk.standard}</span>
                            <span className="text-zinc-400 text-[11px] mt-0.5 block">
                              {chk.details}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              chk.status === 'COMPLIANT'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : chk.status === 'NEEDS_MIGRATION'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {chk.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
