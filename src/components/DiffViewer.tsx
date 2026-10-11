import React from 'react';
import { ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface DiffViewerProps {
  legacyCode: string;
  modernCode: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ legacyCode, modernCode }) => {
  return (
    <div className="space-y-4">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <ShieldAlert className="w-4 h-4" />
            <span>Legacy Classical Implementation</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>PQC-Agile Modern Replacement</span>
          </div>
        </div>
        <div className="text-zinc-400">
          Replaces Shor-vulnerable primitives with NIST FIPS 203/204 hybrid standards
        </div>
      </div>

      {/* 2-column comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
            <span className="font-semibold text-rose-300">Legacy Code (Classical / Vulnerable)</span>
            <span>Quantum Vulnerable (Shor)</span>
          </div>
          <CodeBlock
            code={legacyCode}
            language="python"
            title="legacy_crypto.py"
            badge="Deprecated"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
            <span className="font-semibold text-emerald-300">Modern PQC Code (Hybrid Agile)</span>
            <span className="text-emerald-400">NIST Standard Compliant</span>
          </div>
          <CodeBlock
            code={modernCode}
            language="python"
            title="pqc_hybrid_crypto.py"
            badge="FIPS 203/204"
          />
        </div>
      </div>
    </div>
  );
};
