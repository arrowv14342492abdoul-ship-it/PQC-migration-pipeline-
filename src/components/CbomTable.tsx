import React, { useState } from 'react';
import { CbomItem } from '../types/pqc';
import { AlertTriangle, Download, Filter, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

interface CbomTableProps {
  items: CbomItem[];
  rawAuditReport?: string;
}

export const CbomTable: React.FC<CbomTableProps> = ({ items, rawAuditReport }) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (filterRisk === 'ALL') return true;
    return item.riskTier === filterRisk;
  });

  const downloadCbomJson = () => {
    const cbomPackage = {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      serialNumber: `urn:uuid:${crypto.randomUUID()}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: {
          name: 'audited-cryptographic-codebase',
          type: 'application',
        },
        tools: [
          {
            vendor: 'NIST PQC Migration Pipeline',
            name: 'PQC Auditor Agent',
            version: '2026.1',
          },
        ],
      },
      cryptographicAssets: items.map((item, idx) => ({
        id: `crypto-asset-${idx + 1}`,
        algorithm: item.algorithm,
        primitive: item.primitive,
        vulnerabilities: [
          {
            name: item.vulnerability,
            severity: item.riskTier.toLowerCase(),
          },
        ],
        quantumSecurity: {
          riskTier: item.riskTier,
          nistMigrationTarget: item.nistReplacement,
          fipsStandard: item.fipsStandard,
        },
        locations: item.locations,
        keyLength: item.classicalKeySize,
      })),
    };

    const blob = new Blob([JSON.stringify(cbomPackage, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptographic-bill-of-materials.cbom.json';
    a.click();
    URL.revokeObjectURL(url);
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
              <th className="py-2.5 px-3.5 font-medium">Primitive / Algorithm</th>
              <th className="py-2.5 px-3.5 font-medium">Quantum Threat</th>
              <th className="py-2.5 px-3.5 font-medium">Risk Tier</th>
              <th className="py-2.5 px-3.5 font-medium">NIST Replacement</th>
              <th className="py-2.5 px-3.5 font-medium">FIPS Standard</th>
              <th className="py-2.5 px-3.5 font-medium">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filteredItems.map((item, idx) => {
              const isCritical = item.riskTier === 'CRITICAL';
              const isHigh = item.riskTier === 'HIGH';

              return (
                <tr
                  key={idx}
                  className="hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      {item.algorithm}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {item.primitive}
                      {item.classicalKeySize && ` · ${item.classicalKeySize}`}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-zinc-300 max-w-xs">
                    <div className="line-clamp-2">{item.vulnerability}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        isCritical
                          ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300'
                          : isHigh
                          ? 'bg-amber-950/70 border border-amber-800/80 text-amber-300'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      )}
                      {item.riskTier}
                    </span>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-medium text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {item.nistReplacement}
                    </div>
                    {item.postQuantumKeySize && (
                      <div className="text-[11px] text-zinc-400">
                        {item.postQuantumKeySize}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-zinc-300">
                    {item.fipsStandard}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-zinc-400">
                    {item.locations}
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
