import React, { useState } from 'react';
import {
  ShieldAlert,
  Radio,
  Target,
  AlertTriangle,
  Zap,
  Terminal,
  Crosshair,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import { StrikeTarget } from '../../types/war';
import { STRIKE_TARGETS } from '../../data/warData';
import { INITIAL_CVE_THREAT_INTEL } from '../../data/cveThreatIntelData';
import { ThreatIntelCve } from '../../types/threatIntel';

interface ThreatIntelligenceMatrixViewProps {
  selectedTarget: StrikeTarget;
  onSelectTarget: (targetId: string) => void;
  onArmCyberPayload: (payloadId?: string) => void;
}

export const ThreatIntelligenceMatrixView: React.FC<ThreatIntelligenceMatrixViewProps> = ({
  selectedTarget,
  onSelectTarget,
  onArmCyberPayload,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Compute stats per target environment
  const targetProfiles = STRIKE_TARGETS.map((tgt) => {
    const cves = INITIAL_CVE_THREAT_INTEL.filter(
      (c) =>
        c.targetEnvironmentIds.includes(tgt.id) ||
        c.targetEnvironmentIds.includes('ALL')
    );
    const zeroDays = cves.filter((c) => c.zeroDay).length;
    const criticals = cves.filter((c) => c.cvssSeverity === 'CRITICAL').length;
    const avgCvss =
      cves.length > 0
        ? (cves.reduce((acc, c) => acc + c.cvssScore, 0) / cves.length).toFixed(1)
        : '0.0';

    return {
      target: tgt,
      cves,
      zeroDays,
      criticals,
      avgCvss,
    };
  });

  const activeTargetCves = INITIAL_CVE_THREAT_INTEL.filter(
    (c) =>
      c.targetEnvironmentIds.includes(selectedTarget.id) ||
      c.targetEnvironmentIds.includes('ALL')
  );

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-rose-900/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 sm:p-6 text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-rose-400 font-bold uppercase">
                CYBERCOM / NSA TAO Threat Intelligence Matrix
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Target Environment Vulnerability & CVE Exposure Matrix
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300">
              Active Environment: <strong className="text-amber-400">{selectedTarget.designation}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-4xl">
          Real-time intelligence aggregation correlating National Vulnerability Database (NVD), CISA Known Exploited Vulnerabilities (KEV), and US CYBERCOM SIGINT intercepts directly to operational strike targets. Identifies exploitable air gaps, RF microcode flaws, and classical crypto downgrade vectors.
        </p>
      </div>

      {/* Target Environments Grid Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            Operational Target Environments ({STRIKE_TARGETS.length})
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Click any environment to tune live ticker
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {targetProfiles.map(({ target, cves, zeroDays, criticals, avgCvss }) => {
            const isSelected = target.id === selectedTarget.id;

            return (
              <div
                key={target.id}
                onClick={() => onSelectTarget(target.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-rose-600 bg-rose-950/30 ring-1 ring-rose-500 shadow-lg'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    {isSelected && <Crosshair className="w-3.5 h-3.5 text-amber-400" />}
                    {target.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {target.hardenedTier.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-zinc-100">{target.designation}</div>
                  <div className="text-[11px] text-zinc-400">{target.locationName}</div>
                </div>

                {/* Threat stats strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center text-xs font-mono">
                  <div className="p-1.5 rounded bg-black/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Total CVEs</span>
                    <strong className="text-white">{cves.length}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-black/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">0-Days</span>
                    <strong className="text-rose-400">{zeroDays}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-black/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Avg CVSS</span>
                    <strong className="text-amber-400">{avgCvss}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between pt-1">
                  <span>Defenses: {target.hardenedTier === 'HEAVILY_DEFENDED_A2AD' ? 'S-400 / EW' : 'Hardened'}</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    {isSelected ? 'Active Stream' : 'Tune Stream'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target-Specific Detailed CVE Threat Dossier Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Correlated Intelligence Bulletins for {selectedTarget.designation} ({activeTargetCves.length})
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            NIST CNSA 2.0 & CISA Threat Cross-Reference
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTargetCves.map((cve) => (
            <div
              key={cve.id}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-3 hover:border-zinc-700 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-red-400">{cve.id}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        cve.cvssSeverity === 'CRITICAL'
                          ? 'bg-rose-950 border border-rose-600 text-rose-300'
                          : 'bg-amber-950 border border-amber-600 text-amber-300'
                      }`}
                    >
                      CVSS {cve.cvssScore} {cve.cvssSeverity}
                    </span>
                    {cve.zeroDay && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold">
                        0-DAY
                      </span>
                    )}
                    {cve.cisaKev && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-950 border border-orange-700 text-orange-300 font-bold">
                        CISA KEV
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{cve.title}</h4>
                </div>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                {cve.description}
              </p>

              {/* Tactical Environment Relevance */}
              <div className="p-2.5 rounded-lg border border-amber-900/60 bg-amber-950/20 text-[11px] text-amber-200/90 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block">
                  Target Specific Exploitation Note:
                </span>
                <div>{cve.tacticalRelevance}</div>
              </div>

              {/* PQC or Mitre Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pt-2 border-t border-zinc-800 text-zinc-400">
                <span>Vector: <strong className="text-zinc-200">{cve.attackVector}</strong></span>
                {cve.pqcRelevance && (
                  <span className="text-cyan-400">
                    Fix: {cve.pqcRelevance.pqcFix}
                  </span>
                )}
                {cve.suggestedCyberPayloadId && (
                  <button
                    type="button"
                    onClick={() => onArmCyberPayload(cve.suggestedCyberPayloadId)}
                    className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Arm Payload</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
