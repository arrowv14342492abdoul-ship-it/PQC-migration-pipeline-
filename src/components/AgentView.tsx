import React, { useState } from 'react';
import { PipelineResult, PipelineStep, PipelineOptions } from '../types/pqc';
import { CbomTable } from './CbomTable';
import { ArchitectRoadmap } from './ArchitectRoadmap';
import { CodeBlock } from './CodeBlock';
import { DiffViewer } from './DiffViewer';
import { SimulationRunner } from './SimulationRunner';
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  Code2,
  FileCheck2,
  GitCompare,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface AgentViewProps {
  currentTab: PipelineStep;
  result: PipelineResult | null;
  legacyCode: string;
  options: PipelineOptions;
  isRunningStep: boolean;
  onRunSingleStep: (step: PipelineStep) => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  currentTab,
  result,
  legacyCode,
  options,
  isRunningStep,
  onRunSingleStep,
}) => {
  const [implementerSubTab, setImplementerSubTab] = useState<
    'code' | 'diff' | 'simulate'
  >('code');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCode = () => {
    if (!result?.code) return;
    const blob = new Blob([result.code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pqc_modern_module.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // If no results have been generated yet
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Cpu className="w-6 h-6 animate-pulse text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-200">
          Awaiting Pipeline Execution
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Click <strong>Run PQC Migration Pipeline</strong> above to trigger the 3-agent orchestration chain: Auditor, Architect, and Implementer.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4">
      {/* Tab 1: Auditor Agent Deliverables */}
      {currentTab === 'audit' && (
        <div className="space-y-4">
          {/* Header & Sub-controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  01. Auditor Agent Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  CBOM & Quantum Vulnerability Report
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Identifies Shor-vulnerable classical primitives and creates inventory for NIST compliance.
              </p>
            </div>

            <button
              onClick={() => onRunSingleStep('audit')}
              disabled={isRunningStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-750 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRunningStep ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span>Re-run Auditor Step</span>
            </button>
          </div>

          {/* Shor's Algorithm Vulnerability Warning */}
          <div className="p-3.5 rounded-lg border border-rose-900/60 bg-rose-950/20 text-xs space-y-1.5">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Quantum Vulnerability Notice: Shor's Algorithm (HNDL Threat)</span>
            </div>
            <p className="text-rose-200/80 text-[11px] leading-relaxed">
              Classical public-key cryptography (RSA, Diffie-Hellman, ECDSA) relies on the hardness of integer factorization and discrete logarithms. A Cryptanalytically Relevant Quantum Computer (CRQC) running Shor's algorithm solves these in polynomial time. Adversaries are actively performing <strong>Harvest Now, Decrypt Later (HNDL)</strong> on encrypted data.
            </p>
          </div>

          {/* Cryptographic Bill of Materials Table */}
          <CbomTable items={result.cbom || []} rawAuditReport={result.audit} />

          {/* Full Audit Report Markdown Block */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-zinc-200">
              Full Auditor Report Prose
            </div>
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
          {/* Header & Sub-controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  02. Crypto-Agility Architect Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  FIPS 203/204 Hybrid Strategy
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Designs crypto-agile hybrid transition plan utilizing NIST standards and AES-256 for data-at-rest.
              </p>
            </div>

            <button
              onClick={() => onRunSingleStep('architect')}
              disabled={isRunningStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-750 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRunningStep ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span>Re-run Architect Step</span>
            </button>
          </div>

          {/* Architect Visual Roadmap */}
          <ArchitectRoadmap planText={result.plan} />
        </div>
      )}

      {/* Tab 3: Implementer Agent Deliverables */}
      {currentTab === 'implement' && (
        <div className="space-y-4">
          {/* Header & Sub-controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  03. PQC Implementer Engineer Output
                </span>
                <span className="text-zinc-600 text-xs">·</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Python liboqs Wrappers
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Production-ready Python module integrating NIST PQC algorithms alongside classical fallbacks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRunSingleStep('implement')}
                disabled={isRunningStep}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-zinc-750 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isRunningStep ? 'animate-spin text-emerald-400' : ''
                  }`}
                />
                <span>Re-run Implementer</span>
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

          {/* Sub-tab content */}
          {implementerSubTab === 'code' && (
            <div className="space-y-3">
              <CodeBlock
                code={result.code}
                language="python"
                title="pqc_hybrid_module.py"
                badge="FIPS 203 / liboqs"
              />
            </div>
          )}

          {implementerSubTab === 'diff' && (
            <DiffViewer legacyCode={legacyCode} modernCode={result.code} />
          )}

          {implementerSubTab === 'simulate' && (
            <SimulationRunner code={result.code} />
          )}
        </div>
      )}
    </div>
  );
};
