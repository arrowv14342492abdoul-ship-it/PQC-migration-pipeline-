import React, { useState } from 'react';
import { CbomItem } from '../types/pqc';
import { AlertTriangle, Download, Filter, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { exportCycloneDx16Cbom } from '../utils/cycloneDxExport';

interface CbomTableProps {
  items: CbomItem[];
  rawAuditReport?: string;
  projectName?: string;
}

export const CbomTable: React.FC<CbomTableProps> = ({ items, rawAuditReport, projectName = 'PQC-Cryptographic-Codebase' }) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (filterRisk === 'ALL') return true;
    if (item.riskTier === filterRisk) return true;
    if (filterRisk === 'CRITICAL' && item.quantumVulnerability === 'shor-critical') return true;
    if (filterRisk === 'HIGH' && item.quantumVulnerability === 'grover-moderate') return true;
    if (filterRisk === 'MEDIUM' && item.quantumVulnerability === 'quantum-safe') return true;
    return false;
  });

  const downloadCbomJson = () => {
    exportCycloneDx16Cbom(projectName, items);
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/40 text-center">
        <Cpu className="w-8 h-8 text-zinc-500 mx-auto mb-2 animate-pulse" />
        <p className="text-zinc-300 font-medium text-sm">
          Cryptographic Bill of Materials (CBOM)
        </p>
        <p className="text-zinc-500 text-xs mt-1 max-w-md mx-auto">
          The Auditor Agent analyzes code line-by-line to identify classical asymmetric primitives and calculate quantum vulnerability exposure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400">Risk Filter:</span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterRisk(tier)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filterRisk === tier
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={downloadCbomJson}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-750 text-zinc-200 transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3 text-emerald-400" />
          <span>Export CycloneDX 1.6 CBOM</span>
        </button>
      </div>

      {/* Structured CBOM Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 font-mono text-[11px]">
              <th className="py-2.5 px-3.5 font-medium">Primitive / Asset</th>
              <th className="py-2.5 px-3.5 font-medium">Quantum Threat</th>
              <th className="py-2.5 px-3.5 font-medium">NIST & Hybrid Target</th>
              <th className="py-2.5 px-3.5 font-medium">Overhead & Sizes</th>
              <th className="py-2.5 px-3.5 font-medium">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filteredItems.map((item, idx) => {
              const isShorCritical =
                item.quantumVulnerability === 'shor-critical' ||
                item.riskTier === 'CRITICAL';
              const isGroverModerate =
                item.quantumVulnerability === 'grover-moderate' ||
                item.riskTier === 'HIGH';

              return (
                <tr
                  key={item.id || idx}
                  className="hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      {item.primitive || item.algorithm}
                      {item.cycloneDx?.algorithmProperties?.nistQuantumSecurityLevel && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                          NIST L{item.cycloneDx.algorithmProperties.nistQuantumSecurityLevel}
                        </span>
                      )}
                    </div>
                    {item.bomRef && (
                      <div className="text-[10px] font-mono text-zinc-500 truncate max-w-xs" title={item.bomRef}>
                        {item.bomRef}
                      </div>
                    )}
                    {item.cycloneDx?.oid && (
                      <div className="text-[10px] font-mono text-cyan-400/80">
                        OID: {item.cycloneDx.oid}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-zinc-300 max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          isShorCritical
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300'
                            : isGroverModerate
                            ? 'bg-amber-950/70 border border-amber-800/80 text-amber-300'
                            : 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {isShorCritical ? (
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        )}
                        {item.quantumVulnerability || (isShorCritical ? 'shor-critical' : 'grover-moderate')}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2">
                      {item.vulnerability ||
                        (isShorCritical
                          ? "Shor's algorithm integer factorization / discrete log poly-time break"
                          : "Grover's algorithm speedup")}
                    </div>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-medium text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {item.nistReplacement}
                    </div>
                    {item.hybridRecommendation && (
                      <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                        Hybrid: {item.hybridRecommendation}
                      </div>
                    )}
                    {item.fipsStandard && (
                      <div className="text-[10px] font-mono text-zinc-500">
                        {item.fipsStandard}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-zinc-300">
                    {item.estimatedCycleOverheadPct !== undefined && (
                      <div className="text-amber-300">
                        +{item.estimatedCycleOverheadPct}% cycle overhead
                      </div>
                    )}
                    {item.pubkeySizeBytes !== undefined && item.pubkeySizeBytes > 0 && (
                      <div className="text-zinc-400 text-[10px]">
                        PubKey: {item.pubkeySizeBytes}B
                      </div>
                    )}
                    {item.ciphertextOrSigSizeBytes !== undefined && (
                      <div className="text-zinc-400 text-[10px]">
                        Cipher/Sig: {item.ciphertextOrSigSizeBytes}B
                      </div>
                    )}
                    {item.postQuantumKeySize && !item.pubkeySizeBytes && (
                      <div className="text-zinc-400 text-[10px]">
                        {item.postQuantumKeySize}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-zinc-400">
                    {item.fileLocation ? (
                      <div>
                        <span className="text-zinc-300">{item.fileLocation}</span>
                        {item.lineNumber && <span className="text-emerald-400">:{item.lineNumber}</span>}
                      </div>
                    ) : (
                      item.locations || 'Global scope'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
