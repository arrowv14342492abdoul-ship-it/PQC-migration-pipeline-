import React from 'react';
import { Shield, Settings, Download, ExternalLink } from 'lucide-react';
import { PipelineResult } from '../types/pqc';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenExport: () => void;
  result: PipelineResult | null;
  isRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenExport,
  result,
  isRunning,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & NIST Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
                PQC Migration Pipeline
              </h1>
              <span className="text-zinc-500 text-xs">/</span>
              <span className="text-[11px] font-mono text-emerald-400 font-medium">
                NIST FIPS 203 & 204
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
              <span>Auditor · Architect · Implementer</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-zinc-400">Temp 0.0</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://csrc.nist.gov/projects/post-quantum-cryptography/post-quantum-cryptography-standardization"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-colors"
          >
            <span>NIST CSRC</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors cursor-pointer"
            title="Configure PQC parameters and libraries"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Constraints</span>
          </button>

          <button
            onClick={onOpenExport}
            disabled={!result || isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-200 hover:text-white border border-zinc-750 hover:border-zinc-600 bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Export full migration dossier and Python files"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>
    </header>
  );
};
