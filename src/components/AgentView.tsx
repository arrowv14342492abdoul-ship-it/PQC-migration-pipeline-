import React, { useState } from 'react';
import {
  PipelineResult,
  PipelineStep,
  PipelineOptions,
  MigrationMode,
  AuditLedgerEntry,
} from '../types/pqc';
import { CbomTable } from './CbomTable';
import { ArchitectRoadmap } from './ArchitectRoadmap';
import { CodeBlock } from './CodeBlock';
import { DiffViewer } from './DiffViewer';
import { SimulationRunner } from './SimulationRunner';
import { QuantumVulnerabilityHeatmap } from './QuantumVulnerabilityHeatmap';
import { exportCycloneDx16Cbom } from '../utils/cyclonedxExporter';
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  Code2,
  FileCheck2,
  GitCompare,
  Cpu,
  RefreshCw,
  FileJson,
  ShieldCheck,
  Activity,
  Radio,
} from 'lucide-react';

interface AgentViewProps {
  currentTab: PipelineStep;
  result: PipelineResult | null;
  legacyCode: string;
  options: PipelineOptions;
  isRunningStep: boolean;
  completedSteps?: Record<PipelineStep, boolean>;
  onRunSingleStep: (step: PipelineStep) => void;
  onUpdateResult?: (partial: Partial<PipelineResult>) => void;
  onLaunchF22Benchmark?: () => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  currentTab,
  result,
  legacyCode,
  options,
  isRunningStep,
  completedSteps,
  onRunSingleStep,
  onUpdateResult,
  onLaunchF22Benchmark,
}) => {
  const [implementerSubTab, setImplementerSubTab] = useState<'code' | 'diff' | 'simulate'>('code');
  const [migrationMode, setMigrationMode] = useState<MigrationMode>('hybrid-x25519-mlkem768');
  const [isStreamingSse, setIsStreamingSse] = useState(false);
  const [streamedText, setStreamedText] = useState<Record<'architect' | 'implement', string>>({
    architect: '',
    implement: '',
  });
  const [ledgerReceipt, setLedgerReceipt] = useState<{
    entryHash: string;
    mlDsaSignature: string;
    timestamp: string;
  } | null>(null);
  const [isCommittingLedger, setIsCommittingLedger] = useState(false);

  // Real-time SSE Streamer for Architect & Implementer
  const handleStreamAgentStep = async (step: 'architect' | 'implement') => {
    if (!result || isStreamingSse) return;
    setIsStreamingSse(true);
    setStreamedText((prev) => ({ ...prev, [step]: '' }));

    try {
      const response = await fetch('/api/pqc/stream-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          code: legacyCode,
          cbomItems: result.cbom || [],
          migrationMode,
          model: 'gemini-2.5-flash',
        }),
      });

      if (!response.body) {
        onRunSingleStep(step);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.text) {
                accumulated += payload.text;
                setStreamedText((prev) => ({ ...prev, [step]: accumulated }));
              }
            } catch {
              // Ignore partial SSE frame
            }
          }
        }
      }

      if (onUpdateResult && accumulated) {
        onUpdateResult(step === 'architect' ? { plan: accumulated } : { code: accumulated });
      }
    } catch (err) {
      console.error('SSE stream fallback triggered:', err);
      onRunSingleStep(step);
    } finally {
      setIsStreamingSse(false);
    }
  };

  // Sign & Commit Remediation Diff to Tamper-Evident ML-DSA-65 Audit Ledger
  const handleCommitToPqcLedger = async () => {
    if (!result?.code || isCommittingLedger) return;
    setIsCommittingLedger(true);
    try {
      const res = await fetch('/api/audit/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `PQC_REMEDIATION_${migrationMode.toUpperCase()}`,
          userId: 1,
          projectId: 1,
          remediationDiff: {
            beforeSnippet: legacyCode.slice(0, 500),
            afterSnippet: (streamedText.implement || result.code).slice(0, 500),
            reversibleCommand: 'git revert --no-edit HEAD',
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLedgerReceipt({
          entryHash: data.entryHash,
          mlDsaSignature: data.mlDsaSignature,
          timestamp: data.timestamp,
        });
      }
    } catch (err) {
      console.error('Audit commit error:', err);
    } finally {
      setIsCommittingLedger(false);
    }
  };

  const handleDownloadCode = () => {
    const activeCode = streamedText.implement || result?.code;
    if (!activeCode) return;
    const blob = new Blob([activeCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      migrationMode === 'hybrid-x25519-mlkem768'
        ? 'pqc_hybrid_x25519_mlkem768.py'
        : 'pqc_cnsa2_pure_module.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Cpu className="w-6 h-6 animate-pulse text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-200">Awaiting Pipeline Execution</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Click <strong>Run PQC Migration Pipeline</strong> above to trigger the 3-agent
          orchestration chain: Auditor, Architect, and Implementer.
        </p>
      </div>
    );
  }

  const activePlanText = streamedText.architect || result.plan;
  const activeCodeText = streamedText.implement || result.code;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4">
      {/* Shared Architecture Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-bold uppercase">Target Cryptographic Posture:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMigrationMode('hybrid-x25519-mlkem768')}
            className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
              migrationMode === 'hybrid-x25519-mlkem768'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hybrid Mode (X25519MLKEM768 + FIPS 140-3 Fallback)
          </button>
          <button
            type="button"
            onClick={() => setMigrationMode('pure-pqc-fips203-204')}
            className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
              migrationMode === 'pure-pqc-fips203-204'
                ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pure PQC CNSA 2.0 (ML-KEM-1024 / ML-DSA-87)
          </button>
        </div>
      </div>

      {/* Tab 1: Auditor Agent Deliverables */}
      {currentTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  01. Auditor Agent Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  CycloneDX v1.6 CBOM & AST-Grounded Inventory
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Identifies Shor-vulnerable classical primitives with deterministic line grounding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportCycloneDx16Cbom('Sovereign_Defense_Module', result.cbom || [])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CycloneDX 1.6 CBOM</span>
              </button>

              {onLaunchF22Benchmark && (
                <button
                  type="button"
                  onClick={onLaunchF22Benchmark}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profile in F-22 Telemetry</span>
                </button>
              )}

              <button
                onClick={() => onRunSingleStep('audit')}
                disabled={isRunningStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-750 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRunningStep ? 'animate-spin text-emerald-400' : ''}`}
                />
                <span>Re-run Auditor</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-900/60 bg-rose-950/20 text-xs space-y-1.5">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Quantum Vulnerability Notice: Shor's Algorithm (HNDL Threat)</span>
            </div>
            <p className="text-rose-200/80 text-[11px] leading-relaxed">
              Classical public-key cryptography (RSA, Diffie-Hellman, ECDSA) relies on the hardness
              of integer factorization and discrete logarithms. A Cryptanalytically Relevant Quantum
              Computer (CRQC) running Shor's algorithm solves these in polynomial time. Adversaries
              are actively performing <strong>Harvest Now, Decrypt Later (HNDL)</strong> on
              encrypted data.
            </p>
          </div>

          <QuantumVulnerabilityHeatmap
            cbomItems={result.cbom || []}
            analyzedCode={legacyCode}
            planText={activePlanText}
            isAuditComplete={completedSteps?.audit}
            isArchitectComplete={completedSteps?.architect}
            completedSteps={completedSteps}
          />

          <CbomTable items={result.cbom || []} rawAuditReport={result.audit} />

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-zinc-200">Full Auditor Report Prose</div>
            <CodeBlock
              code={result.audit}
              language="markdown"
              title="audit_vulnerability_report.md"
              badge="Agent 01"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Architect Agent Deliverables */}
      {currentTab === 'architect' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  02. Crypto-Agility Architect Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  {migrationMode === 'hybrid-x25519-mlkem768'
                    ? 'RFC 9370 Hybrid X25519MLKEM768 Strategy'
                    : 'CNSA 2.0 Pure FIPS 203/204 Strategy'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Streams phased transition architecture in real time via Server-Sent Events (SSE).
              </p>
            </div>
            <button
              onClick={() => handleStreamAgentStep('architect')}
              disabled={isRunningStep || isStreamingSse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRunningStep || isStreamingSse ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span>{isStreamingSse ? 'Streaming Roadmap...' : 'Stream Architect Roadmap'}</span>
            </button>
          </div>

          <QuantumVulnerabilityHeatmap
            cbomItems={result.cbom || []}
            analyzedCode={legacyCode}
            planText={activePlanText}
            isAuditComplete={completedSteps?.audit}
            isArchitectComplete={completedSteps?.architect}
            completedSteps={completedSteps}
          />

          <ArchitectRoadmap planText={activePlanText} />
        </div>
      )}

      {/* Tab 3: Implementer Agent Deliverables */}
      {currentTab === 'implement' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  03. PQC Implementer Engineer Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Python liboqs / OpenSSL 3.5+ Wrappers
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Production-ready PQC module with tamper-evident ML-DSA-65 ledger signing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCommitToPqcLedger}
                disabled={isCommittingLedger}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isCommittingLedger ? 'Signing SHA3-512...' : 'Sign & Commit to ML-DSA Ledger'}
                </span>
              </button>

              <button
                onClick={() => handleStreamAgentStep('implement')}
                disabled={isRunningStep || isStreamingSse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-750 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isRunningStep || isStreamingSse ? 'animate-spin text-emerald-400' : ''
                  }`}
                />
                <span>{isStreamingSse ? 'Streaming Code...' : 'Stream Implementer'}</span>
              </button>

              <button
                onClick={handleDownloadCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          {/* Tamper-Evident ML-DSA-65 Ledger Receipt Banner */}
          {ledgerReceipt && (
            <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 font-mono text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  FIPS 204 (ML-DSA-65) Remediation Ledger Receipt Verified
                </span>
                <span className="text-[10px] text-zinc-400">{ledgerReceipt.timestamp}</span>
              </div>
              <div className="text-[11px] text-zinc-300 truncate">
                <strong className="text-zinc-500">SHA3-512 Chain Hash:</strong>{' '}
                {ledgerReceipt.entryHash}
              </div>
              <div className="text-[11px] text-cyan-300 truncate">
                <strong className="text-zinc-500">Detached Signature:</strong>{' '}
                {ledgerReceipt.mlDsaSignature}
              </div>
            </div>
          )}

          {/* Sub-tab view switcher */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-fit text-xs">
            <button
              onClick={() => setImplementerSubTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                implementerSubTab === 'code'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modernized PQC Code</span>
            </button>
            <button
              onClick={() => setImplementerSubTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                implementerSubTab === 'diff'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Side-by-Side Diff</span>
            </button>
            <button
              onClick={() => setImplementerSubTab('simulate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                implementerSubTab === 'simulate'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Invariant Verification & Benchmarks</span>
            </button>
          </div>

          {implementerSubTab === 'code' && (
            <div className="space-y-3">
              <CodeBlock
                code={activeCodeText}
                language="python"
                title={
                  migrationMode === 'hybrid-x25519-mlkem768'
                    ? 'pqc_hybrid_x25519_mlkem768.py'
                    : 'pqc_cnsa2_pure_module.py'
                }
                badge={
                  migrationMode === 'hybrid-x25519-mlkem768'
                    ? 'RFC 9370 Hybrid / liboqs'
                    : 'FIPS 203 & 204 Pure'
                }
              />
            </div>
          )}

          {implementerSubTab === 'diff' && (
            <DiffViewer legacyCode={legacyCode} modernCode={activeCodeText} />
          )}

          {implementerSubTab === 'simulate' && <SimulationRunner code={activeCodeText} />}
        </div>
      )}
    </div>
  );
};
