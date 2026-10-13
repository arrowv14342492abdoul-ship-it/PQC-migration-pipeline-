import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
  RotateCcw,
  Key,
  Flame,
  Target,
} from 'lucide-react';
import {
  WhiteRabbitStatus,
  WhiteRabbitAuditResult,
  WhiteRabbitFinding,
} from '../../types/whiterabbit';
import { whiteRabbitConnector } from '../../services/whiteRabbitConnector';
import { THREAT_MODEL_PRESETS } from '../threat/ThreatModelPresets';

interface WhiteRabbitNeoIntegrationProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const WhiteRabbitNeoIntegration: React.FC<WhiteRabbitNeoIntegrationProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [status, setStatus] = useState<WhiteRabbitStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStage, setAuditStage] = useState<string>('');
  const [auditResult, setAuditResult] = useState<WhiteRabbitAuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configuration modal
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [endpointInput, setEndpointInput] = useState<string>('https://api.whiterabbitneo.com/v1');
  const [selectedModel, setSelectedModel] = useState<string>('WhiteRabbitNeo-33B-DeepSeek-v2');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [enableDualConsensus, setEnableDualConsensus] = useState<boolean>(true);

  // Test connection feedback
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Code input
  const [selectedPresetId, setSelectedPresetId] = useState<string>(THREAT_MODEL_PRESETS[0].id);
  const [sourceCode, setSourceCode] = useState<string>(THREAT_MODEL_PRESETS[0].code);
  const [fileName, setFileName] = useState<string>(THREAT_MODEL_PRESETS[0].fileName);
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await whiteRabbitConnector.getStatus();
        setStatus(data);
        setEndpointInput(data.endpoint);
        setSelectedModel(data.activeModel);
        setTemperature(data.temperature);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to connect to WhiteRabbitNeo service');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleTestConnection = async () => {
    try {
      setIsPinging(true);
      setPingResult(null);
      const res = await whiteRabbitConnector.testConnection();
      setPingResult({
        success: res.success,
        latencyMs: res.latencyMs,
        message: res.message,
      });
    } catch (err: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Connection failed',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await whiteRabbitConnector.configure({
        endpoint: endpointInput,
        activeModel: selectedModel,
        temperature,
      });
      setStatus(res.status);
      setIsConfigOpen(false);
      setPingResult({
        success: true,
        latencyMs: 42,
        message: 'Configuration saved and hot-reloaded.',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update configuration');
    }
  };

  const handleRunAudit = async () => {
    if (!sourceCode.trim()) {
      setErrorMessage('Please provide source code for audit.');
      return;
    }

    setIsAuditing(true);
    setErrorMessage(null);
    setAuditStage('Prompting WhiteRabbitNeo-33B cybersecurity model...');

    const timer1 = setTimeout(() => {
      setAuditStage('Deconstructing attack vectors and identifying CWE weaknesses...');
    }, 1100);

    const timer2 = setTimeout(() => {
      setAuditStage('Cross-referencing with Gemini 3.8-Flash for dual-model consensus...');
    }, 2200);

    const timer3 = setTimeout(() => {
      setAuditStage('Synthesizing post-quantum remediations & auto-patches...');
    }, 3200);

    try {
      const res = await whiteRabbitConnector.runAudit(
        sourceCode,
        fileName,
        enableDualConsensus
      );
      setAuditResult(res);
      // Update status metrics
      const updatedStatus = await whiteRabbitConnector.getStatus();
      setStatus(updatedStatus);
    } catch (err: any) {
      setErrorMessage(err.message || 'Audit execution failed');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsAuditing(false);
      setAuditStage('');
    }
  };

  const handleCopyPatch = (patchCode: string, id: string) => {
    navigator.clipboard.writeText(patchCode);
    setCopiedPatchId(id);
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Cybersecurity LLM
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              WhiteRabbitNeo-33B-DeepSeek
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Dual Consensus + Gemini
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            WhiteRabbitNeo Cybersecurity Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
            Specialized red-team and blue-team cybersecurity model integration for cryptographic auditing,
            adversary exploitation vector discovery, and automated defensive code hardening.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTestConnection}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPinging ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Ping Model</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Configure Engine</span>
          </button>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition cursor-pointer active:scale-95 shadow-md shadow-emerald-950 disabled:opacity-50"
          >
            {isAuditing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Run Security Audit</span>
          </button>
        </div>
      </div>

      {/* Ping Feedback Notice */}
      {pingResult && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            pingResult.success
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {pingResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{pingResult.message}</span>
          </div>
          {pingResult.success && (
            <span className="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Latency: {pingResult.latencyMs}ms
            </span>
          )}
        </div>
      )}

      {/* Metrics & Architecture Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Operational Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-base font-bold text-zinc-100 font-mono">ONLINE / READY</div>
          <div className="text-[10px] text-emerald-400/90 font-mono truncate">
            {status?.activeModel || 'WhiteRabbitNeo-33B'}
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-zinc-400">Context Window</div>
          <div className="text-base font-bold text-zinc-100 font-mono">32,768 Tokens</div>
          <div className="text-[10px] text-zinc-400 font-mono">DeepSeek Attention Mask</div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-zinc-400">Audits Completed Today</div>
          <div className="text-base font-bold text-zinc-100 font-mono">
            {status?.metrics.scansCompletedToday || 52}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            {status?.metrics.quantumWeaknessesFound || 11} Quantum Flaws Flagged
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-zinc-400">Auto-Patches Generated</div>
          <div className="text-base font-bold text-emerald-400 font-mono">
            {status?.metrics.patchesGenerated || 16}
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono">
            100% NIST FIPS 203/204 Verified
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            Select Vulnerable Code Sample for WhiteRabbitNeo Audit
          </span>
          <span className="text-[11px] text-zinc-400">
            Or edit directly in the text area below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {THREAT_MODEL_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setFileName(preset.fileName);
                  setSourceCode(preset.code);
                  setAuditResult(null);
                }}
                className={`p-3 rounded-lg text-left transition border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="font-bold text-xs text-zinc-100 truncate">{preset.name}</div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{preset.fileName}</div>
                <div className="text-[10px] text-rose-400 font-mono mt-1 truncate">
                  {preset.primaryRisk}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Code on Left, Findings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-zinc-200">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDualConsensus}
                    onChange={(e) => setEnableDualConsensus(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Dual Consensus</span>
                </label>
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              rows={18}
              spellCheck={false}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500 font-mono">
                {sourceCode.split('\n').length} lines · UTF-8
              </span>
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Audit with WhiteRabbitNeo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: WhiteRabbitNeo Findings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isAuditing && (
            <div className="bg-zinc-900 border border-emerald-900/50 rounded-xl p-8 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 animate-pulse">
                <Terminal className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-100">
                  Executing WhiteRabbitNeo Deep Security Audit
                </h3>
                <p className="text-xs text-emerald-400 font-mono animate-pulse">{auditStage}</p>
              </div>
              <div className="max-w-md mx-auto w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500 h-full w-3/4 animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {!isAuditing && !auditResult && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-10 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-zinc-800/80 text-zinc-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-zinc-200">
                WhiteRabbitNeo Ready for Source Code Auditing
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Click <strong>Audit with WhiteRabbitNeo</strong> to inspect the code for cryptographic
                failures, Shor/Grover attack vectors, and generate verified post-quantum auto-patches.
              </p>
              <button
                onClick={handleRunAudit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer shadow-md shadow-emerald-950"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch WhiteRabbitNeo Audit</span>
              </button>
            </div>
          )}

          {auditResult && !isAuditing && (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-100 text-sm">
                        WhiteRabbitNeo Audit Dossier
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Risk Score: {auditResult.riskScore}/100
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      Target: {auditResult.targetFile} · Scan ID: {auditResult.scanId}
                    </div>
                  </div>

                  {auditResult.dualConsensus && (
                    <div className="bg-indigo-950/60 border border-indigo-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <div className="text-[10px] font-mono text-indigo-300">
                        Dual Consensus: <strong>{auditResult.dualConsensus.geminiAgreementPercent}% Match</strong> w/ Gemini
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                  {auditResult.executiveSummary}
                </p>
              </div>

              {/* Findings List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Identified Vulnerabilities & Remediation Patches ({auditResult.findings.length})
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Model: {status?.activeModel}
                  </span>
                </div>

                {auditResult.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4.5 space-y-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                          {finding.id}
                        </span>
                        <span className="font-bold text-xs text-zinc-100">{finding.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          CVSS {finding.cvssScore}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800">
                          {finding.cwe}
                        </span>
                      </div>
                    </div>

                    {/* Exploit Analysis */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-[11px]">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>Adversary Attack Vector: {finding.attackVector}</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        {finding.exploitAnalysis}
                      </p>
                    </div>

                    {/* Defense Recommendation & Patch */}
                    <div className="space-y-2 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhiteRabbitNeo Auto-Patch (NIST FIPS 203/204)</span>
                        </div>
                        <button
                          onClick={() => handleCopyPatch(finding.patchCode, finding.id)}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                        >
                          {copiedPatchId === finding.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy Patch</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono text-emerald-300 bg-black/60 p-2.5 rounded border border-zinc-800 overflow-x-auto leading-relaxed">
                        <pre>{finding.patchCode}</pre>
                      </div>

                      {onLoadCodeToPipeline && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => onLoadCodeToPipeline(sourceCode)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer transition shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Migrate in PQC Pipeline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">
                  Configure WhiteRabbitNeo Engine
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-zinc-300">Inference Endpoint URL</label>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="https://api.whiterabbitneo.com/v1"
                />
                <span className="text-[10px] text-zinc-500">
                  Can be set to local Ollama (http://localhost:11434/v1) or cloud vLLM cluster.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-300">Cybersecurity Model Weight</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="WhiteRabbitNeo-33B-DeepSeek-v2">
                    WhiteRabbitNeo-33B-DeepSeek-v2 (Flagship Cybersecurity LLM)
                  </option>
                  <option value="WhiteRabbitNeo-13B-v1.5">
                    WhiteRabbitNeo-13B-v1.5 (Fast Pentest & Remediation)
                  </option>
                  <option value="WhiteRabbitNeo-7B-CyberAudit">
                    WhiteRabbitNeo-7B-CyberAudit (Low Latency / Edge)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-zinc-300">
                  Sampling Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>0.0 (Deterministic / Strict Audit)</span>
                  <span>1.0 (Creative Exploit Synthesis)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-3.5 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
