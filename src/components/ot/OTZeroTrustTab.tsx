import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Layers,
  Cpu,
  Network,
  Lock,
  Unlock,
  Radio,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Server,
  Building2,
  Anchor,
  Flame,
  Droplet,
  ChevronRight,
  Filter,
  Download,
  Share2,
} from 'lucide-react';
import {
  NSA_CSI_METADATA,
  NSA_OT_CONTROLS,
  OT_SECTORS,
  PURDUE_MODEL_LEVELS,
} from '../../data/otZeroTrustData';
import { NSACSIControl, OTProtocol } from '../../types/otZeroTrust';

interface OTZeroTrustTabProps {
  onLoadOTPresetToPipeline?: () => void;
}

export const OTZeroTrustTab: React.FC<OTZeroTrustTabProps> = ({
  onLoadOTPresetToPipeline,
}) => {
  const [controls, setControls] = useState<NSACSIControl[]>([...NSA_OT_CONTROLS]);
  const [selectedPurdueIndex, setSelectedPurdueIndex] = useState<number>(2); // Level 3.5 default
  const [selectedSectorId, setSelectedSectorId] = useState<string>('defense-bases');
  const [filterPillar, setFilterPillar] = useState<string>('ALL');

  // Command verification simulation state
  const [simProtocol, setSimProtocol] = useState<OTProtocol>('Modbus TCP');
  const [simAction, setSimAction] = useState<'UNAUTHENTICATED' | 'SIGNED_PQC' | 'REPLAY_ATTACK'>('SIGNED_PQC');
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{
    status: 'PERMITTED' | 'BLOCKED_BY_ZERO_TRUST' | 'REPLAY_ATTACK_DETECTED';
    details: string;
    log: string[];
  } | null>({
    status: 'PERMITTED',
    details: 'Coil write verified by Policy Enforcement Point via NIST FIPS 204 ML-DSA-87 digital signature. Sequence counter #8841 validated.',
    log: [
      '[PEP-INGRESS] Received Modbus TCP Function 0x05 (Write Single Coil at 0x0024)',
      '[CRYPTO-CHECK] Attached ML-DSA-87 signature verified against Root-of-Trust (Key ID: NSA-DIB-OT-99)',
      '[NONCE-CHECK] Monotonic counter 8841 > previous 8840 (No replay detected)',
      '[PHYSICS-CHECK] Valve actuation within thermodynamic safety envelope (0-100% boundary check: PASS)',
      '[PEP-EGRESS] Forwarding authorized packet to Schneider M580 PLC at 10.14.2.10',
    ],
  });

  const selectedSector =
    OT_SECTORS.find((s) => s.id === selectedSectorId) || OT_SECTORS[0];

  const handleToggleControlStatus = (id: string) => {
    setControls((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus =
            c.status === 'COMPLIANT'
              ? 'NEEDS_HARDENING'
              : c.status === 'NEEDS_HARDENING'
              ? 'DEFICIENT'
              : 'COMPLIANT';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const compliantCount = controls.filter((c) => c.status === 'COMPLIANT').length;
  const totalCount = controls.length;
  const complianceScore = Math.round((compliantCount / totalCount) * 100);

  const handleRunSimulation = async (action: 'UNAUTHENTICATED' | 'SIGNED_PQC' | 'REPLAY_ATTACK') => {
    setSimAction(action);
    setSimRunning(true);
    setSimResult(null);

    await new Promise((r) => setTimeout(r, 650));

    if (action === 'UNAUTHENTICATED') {
      setSimResult({
        status: 'BLOCKED_BY_ZERO_TRUST',
        details: 'Blocked by NSA Zero Trust Enforcement Point: Raw Modbus packet lacks cryptographic FIPS 204 authentication signature.',
        log: [
          `[PEP-INGRESS] Received ${simProtocol} Write Command from 192.168.1.105`,
          '[CRYPTO-CHECK] Missing digital signature wrapper in Application Data Unit',
          '[NSA-CSI-RULE] ZT-OT-03 Violation: Unsigned control commands are strictly forbidden at Level 1/2 boundary',
          '[FIREWALL] Packet dropped. Alert dispatched to SIEM/SOAR incident pipeline (Severity: HIGH)',
          '[PLC-STATUS] Field controller protected from unauthorized state transition',
        ],
      });
    } else if (action === 'REPLAY_ATTACK') {
      setSimResult({
        status: 'REPLAY_ATTACK_DETECTED',
        details: 'Adversarial Replay Attack Detected: Monotonic sequence counter #8840 has already been executed. Packet rejected.',
        log: [
          `[PEP-INGRESS] Received ${simProtocol} Write Command with captured signature`,
          '[CRYPTO-CHECK] Valid mathematical signature format',
          '[NONCE-CHECK] Sequence counter #8840 <= current state counter #8841 (REPLAY REJECT)',
          '[NSA-CSI-RULE] ZT-OT-03 Anti-Replay Violation: Stale monotonic timestamp detected',
          '[ACTION] Session flagged. Origin IP isolated via Software-Defined Perimeter (SDP)',
        ],
      });
    } else {
      setSimResult({
        status: 'PERMITTED',
        details: 'Coil write verified by Policy Enforcement Point via NIST FIPS 204 ML-DSA-87 digital signature. Sequence counter #8842 validated.',
        log: [
          `[PEP-INGRESS] Received ${simProtocol} Write Command with FIPS 204 ML-DSA-87 Auth`,
          '[CRYPTO-CHECK] Signature verified in 0.8ms via hardware accelerator (Lattice Key Level 5)',
          '[NONCE-CHECK] Monotonic counter 8842 > 8841 (Chronological validity confirmed)',
          '[PHYSICS-CHECK] Commanded setpoint safely within physical process bounds',
          '[DISPATCH] Command released to deterministic field bus',
        ],
      });
    }

    setSimRunning(false);
  };

  const filteredControls =
    filterPillar === 'ALL'
      ? controls
      : controls.filter((c) => c.pillar === filterPillar);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Official NSA Cybersecurity Information Sheet Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 sm:p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/90">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                    NSA CYBERSECURITY INFORMATION SHEET
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Doc ID: {NSA_CSI_METADATA.documentId}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                  {NSA_CSI_METADATA.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={NSA_CSI_METADATA.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg cursor-pointer"
              >
                <span>Read Official NSA PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">
            Published <strong className="text-white">{NSA_CSI_METADATA.publicationDate}</strong> by the{' '}
            <strong className="text-emerald-300">{NSA_CSI_METADATA.issuingAgency}</strong> in coordination with the DoD CIO and USCYBERCOM.
            This guidance establishes decisive Zero Trust hardening standards for critical Operational Technology (ICS, SCADA, DCS, BMS)
            to eliminate reliance on the flawed &quot;air-gap myth&quot; and actively prevent living-off-the-land kinetic attacks against National Security Systems and Defense Industrial Base networks.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Zero Trust Readiness</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{complianceScore}%</div>
              <div className="text-[10px] text-zinc-400">{compliantCount} of {totalCount} Controls Active</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Cryptographic Standard</div>
              <div className="text-sm font-bold text-cyan-300 mt-1 font-mono">NIST FIPS 204 ML-DSA</div>
              <div className="text-[10px] text-zinc-400">Post-Quantum Lattice Signing</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Boundary Enforcement</div>
              <div className="text-sm font-bold text-amber-300 mt-1">Hardware Data Diodes</div>
              <div className="text-[10px] text-zinc-400">Physical Egress Unidirectionality</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Command Verification</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Anti-Replay Nonce Active</div>
              <div className="text-[10px] text-zinc-400">Modbus / DNP3 / OPC UA Intercept</div>
            </div>
          </div>
        </div>
      </div>

      {/* Purdue Model Zero Trust Architecture Visualizer */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Purdue Model Modernization & Zero Trust Boundary Map</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Per NSA CSI guidance: Moving from flat PERA networks to software-defined microsegments and hardware unidirectional data diodes.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            Interactive Layer Inspector
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {PURDUE_MODEL_LEVELS.map((item, idx) => (
            <button
              key={item.level}
              type="button"
              onClick={() => setSelectedPurdueIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                selectedPurdueIndex === idx
                  ? `${item.color} ring-2 ring-emerald-500 shadow-lg scale-[1.02]`
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-black/60 border border-zinc-700/60">
                  {item.badge}
                </span>
                <div className="text-xs font-bold text-white mt-1.5 leading-snug">
                  {item.level.split(':')[0]}
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 truncate mt-1">
                {item.level.split(':')[1]}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Layer Technical Inspector */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-black/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 font-mono">
              {PURDUE_MODEL_LEVELS[selectedPurdueIndex].level}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              NSA CSI Architectural Requirement
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {PURDUE_MODEL_LEVELS[selectedPurdueIndex].desc}
          </p>
        </div>
      </div>

      {/* Two Column: Interactive Protocol Command Signer vs Sector Blueprints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Protocol Signer & Anti-Replay Simulator */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>OT Protocol Zero Trust Command Signer (FIPS 204)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Live simulation of NSA CSI ZT-OT-03: Preventing unauthenticated Modbus/DNP3 control commands.
              </p>
            </div>
          </div>

          {/* Protocol & Action Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Protocol:</span>
              {(['Modbus TCP', 'DNP3 Secure', 'OPC UA (IEC 62541)'] as OTProtocol[]).map((proto) => (
                <button
                  key={proto}
                  type="button"
                  onClick={() => setSimProtocol(proto)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    simProtocol === proto
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRunSimulation('UNAUTHENTICATED')}
                disabled={simRunning}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  simAction === 'UNAUTHENTICATED'
                    ? 'border-rose-600 bg-rose-950/50 text-white'
                    : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-rose-300">1. Raw Command</div>
                <div className="text-[10px] text-zinc-400">Unsigned packet (Attack test)</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunSimulation('SIGNED_PQC')}
                disabled={simRunning}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  simAction === 'SIGNED_PQC'
                    ? 'border-emerald-500 bg-emerald-950/50 text-white'
                    : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-emerald-300">2. FIPS 204 Signed</div>
                <div className="text-[10px] text-zinc-400">ML-DSA-87 + Nonce</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunSimulation('REPLAY_ATTACK')}
                disabled={simRunning}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  simAction === 'REPLAY_ATTACK'
                    ? 'border-amber-500 bg-amber-950/50 text-white'
                    : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold text-amber-300">3. Replay Attack</div>
                <div className="text-[10px] text-zinc-400">Stale sequence counter</div>
              </button>
            </div>
          </div>

          {/* Simulation Output Console */}
          <div className="rounded-xl border border-zinc-800 bg-black p-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
              <span className="text-[11px] text-zinc-400">NSA PEP Inspection Engine</span>
              {simResult && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    simResult.status === 'PERMITTED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : simResult.status === 'REPLAY_ATTACK_DETECTED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}
                >
                  {simResult.status}
                </span>
              )}
            </div>

            {simRunning ? (
              <div className="py-6 flex items-center justify-center gap-2 text-zinc-400">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Evaluating cryptographic verification proof...</span>
              </div>
            ) : simResult ? (
              <div className="space-y-2">
                <p className="text-zinc-200 text-xs font-sans">{simResult.details}</p>
                <div className="space-y-1 pt-1 border-t border-zinc-900 text-[11px]">
                  {simResult.log.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.includes('Violation') || line.includes('dropped')
                          ? 'text-rose-400'
                          : line.includes('REPLAY')
                          ? 'text-amber-400'
                          : line.includes('verified') || line.includes('PASS') || line.includes('authorized')
                          ? 'text-emerald-400'
                          : 'text-zinc-400'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Bridge Button to PQC Pipeline */}
          {onLoadOTPresetToPipeline && (
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Need to migrate raw Modbus/OPC UA socket code?
              </span>
              <button
                type="button"
                onClick={onLoadOTPresetToPipeline}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Load OT Preset into PQC Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Critical Sector Blueprints */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Critical Sector OT Profiles</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Department of Defense & Critical Infrastructure sector architectures.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {OT_SECTORS.map((sector) => (
              <button
                key={sector.id}
                type="button"
                onClick={() => setSelectedSectorId(sector.id)}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  selectedSectorId === sector.id
                    ? 'border-amber-500 bg-amber-950/40 text-white'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold truncate">{sector.name.split('&')[0]}</div>
                <div className="text-[10px] text-zinc-500 truncate">{sector.primaryProtocols[0]}</div>
              </button>
            ))}
          </div>

          {/* Active Sector Blueprint Details */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-black/70 space-y-3 text-xs">
            <div>
              <div className="font-bold text-white text-sm">{selectedSector.name}</div>
              <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                {selectedSector.description}
              </p>
            </div>

            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Critical Protected Assets:</div>
              <ul className="list-disc list-inside text-zinc-300 space-y-0.5 mt-1 text-[11px]">
                {selectedSector.criticalAssets.map((asset, i) => (
                  <li key={i}>{asset}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 text-[11px] text-rose-200">
              <span className="font-bold text-rose-300">Adversary Threat Vector: </span>
              {selectedSector.threatVector}
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-[11px] text-emerald-200">
              <span className="font-bold text-emerald-300">NSA CSI Hardening: </span>
              {selectedSector.mitigationHighlight}
            </div>
          </div>
        </div>
      </div>

      {/* NSA CSI Control Checklist & Compliance Evaluator */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>NSA CSI Zero Trust Hardening Checklist & Requirements</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Click any control status tag to toggle compliance state and recalculate readiness score.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'Network & Microsegmentation', 'User & Identity (ICAM)', 'Data & Command Protection', 'Device & Hardware Trust', 'Visibility & Analytics'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPillar(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  filterPillar === p
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p === 'ALL' ? 'All Pillars' : p.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Controls List */}
        <div className="space-y-3">
          {filteredControls.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 transition-colors space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className="font-bold text-sm text-white">{c.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                    {c.pillar}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      c.priority.includes('MANDATORY')
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {c.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleControlStatus(c.id)}
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border transition-transform active:scale-95 cursor-pointer ${
                      c.status === 'COMPLIANT'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : c.status === 'NEEDS_HARDENING'
                        ? 'bg-amber-950 border-amber-600 text-amber-300'
                        : 'bg-rose-950 border-rose-600 text-rose-300'
                    }`}
                  >
                    {c.status === 'COMPLIANT' ? 'COMPLIANT ✓' : c.status === 'NEEDS_HARDENING' ? 'NEEDS HARDENING ⚠' : 'DEFICIENT ✕'}
                  </button>
                </div>
              </div>

              {/* NSA Guidance Quotation */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border-l-2 border-emerald-500 text-xs text-zinc-300 italic">
                &ldquo;{c.nsaGuidanceSnippet}&rdquo;
              </div>

              {/* Comparative Technical Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-zinc-300">
                  <span className="font-bold text-rose-300 font-mono text-[11px] block mb-0.5">
                    Traditional Air-Gap Vulnerability:
                  </span>
                  {c.legacyFlaw}
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-zinc-300">
                  <span className="font-bold text-emerald-300 font-mono text-[11px] block mb-0.5">
                    Zero Trust Remediation Architecture:
                  </span>
                  {c.zeroTrustRemediation}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400 font-mono border-t border-zinc-900">
                <span>Applicable Purdue Levels: {c.purdueLevels.join(' · ')}</span>
                <span className="text-cyan-400 font-bold">Standard: {c.cryptographicStandard}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
