import React, { useState } from 'react';
import { SimulationResult } from '../types/pqc';
import { Play, CheckCircle2, AlertCircle, ArrowUpRight, BarChart2, ShieldCheck, Zap } from 'lucide-react';

interface SimulationRunnerProps {
  code: string;
}

export const SimulationRunner: React.FC<SimulationRunnerProps> = ({ code }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch('/api/pqc/simulate-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }
      const data: SimulationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to run cryptographic verification');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Trigger Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs">
        <div>
          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PQC Correctness & Known Answer Invariant Suite</span>
          </div>
          <p className="text-zinc-400 text-[11px] mt-0.5">
            Executes encapsulation / decapsulation verification, hybrid combiner integrity, and quantum security margins.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning || !code}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors disabled:opacity-50 cursor-pointer text-xs"
        >
          {isRunning ? (
            <>
              <Zap className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying PQC Invariants...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Verification Tests</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results grid */}
      {result && (
        <div className="space-y-4">
          {/* Key & Bandwidth Overhead Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Public Key Size</span>
                <BarChart2 className="w-3 h-3 text-zinc-500" />
              </div>
              <div className="text-lg font-mono font-semibold text-zinc-100 tabular-nums">
                {result.cryptographicOverhead.pqcPubKeyBytes} bytes
              </div>
              <div className="text-[11px] text-zinc-400">
                vs {result.cryptographicOverhead.classicalPubKeyBytes} bytes (classical RSA) · <span className="text-amber-400 font-mono">+{Math.round((result.cryptographicOverhead.pqcPubKeyBytes / result.cryptographicOverhead.classicalPubKeyBytes) * 100 - 100)}%</span> overhead
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Ciphertext / Token Size</span>
                <BarChart2 className="w-3 h-3 text-zinc-500" />
              </div>
              <div className="text-lg font-mono font-semibold text-zinc-100 tabular-nums">
                {result.cryptographicOverhead.pqcCiphertextBytes} bytes
              </div>
              <div className="text-[11px] text-zinc-400">
                vs {result.cryptographicOverhead.classicalCiphertextBytes} bytes (classical) · <span className="text-amber-400 font-mono">+{Math.round((result.cryptographicOverhead.pqcCiphertextBytes / result.cryptographicOverhead.classicalCiphertextBytes) * 100 - 100)}%</span> overhead
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Quantum Security Margin</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-sm font-semibold text-emerald-400 font-mono">
                {result.cryptographicOverhead.quantumSecurityLevel}
              </div>
              <div className="text-[11px] text-zinc-400">
                Standards: {result.cryptographicOverhead.standardCompliance.join(' · ')}
              </div>
            </div>
          </div>

          {/* Test Cases Table */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/90 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Test Invariants & Cavp Vectors</span>
              <span className="text-zinc-400 font-mono text-[11px]">Completed in {result.executionTimeMs}ms</span>
            </div>
            <div className="divide-y divide-zinc-850 text-xs">
              {result.testCases.map((tc, i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  {tc.status === 'PASSED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="font-medium text-zinc-100 flex items-center justify-between">
                      <span>{tc.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                        {tc.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{tc.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integration Quickstart Snippet */}
      <div className="p-3.5 rounded-lg border border-zinc-800/90 bg-zinc-900/40 text-xs space-y-2">
        <div className="font-semibold text-zinc-200 flex items-center justify-between">
          <span>Python Runtime Environment Setup</span>
          <a
            href="https://github.com/open-quantum-safe/liboqs-python"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
          >
            liboqs-python docs <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-zinc-300 text-[11px] space-y-1">
          <div><span className="text-zinc-500"># 1. Install Open Quantum Safe Python bindings</span></div>
          <div className="text-emerald-400">pip install liboqs-python pycryptodome</div>
          <div className="pt-1"><span className="text-zinc-500"># 2. Or run in preconfigured PQC container</span></div>
          <div className="text-zinc-300">docker run -it openquantumsafe/oqs-python python3</div>
        </div>
      </div>
    </div>
  );
};
