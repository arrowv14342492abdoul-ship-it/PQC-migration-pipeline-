import React, { useState, useEffect } from 'react';
import {
  Flame,
  Crosshair,
  Zap,
  Radio,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Eye,
  Radar,
  Sliders,
  Send,
  Boxes,
  ShieldAlert,
  Globe2,
  Compass,
  Bomb,
  FastForward,
  Play,
  RotateCcw,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  OFFENSIVE_WEAPONS,
  OFFENSIVE_SOFTWARE_STACKS,
  STRIKE_TARGETS,
  OFFENSIVE_CYBER_PAYLOADS,
} from '../../data/warData';
import {
  OffensiveWeapon,
  OffensiveSoftware,
  StrikeTarget,
  OffensiveCyberPayload,
  KillChainPhase,
  StrikeMissionExecution,
} from '../../types/war';

interface WarTabProps {
  onLoadWarPresetToPipeline?: () => void;
}

export const WarTab: React.FC<WarTabProps> = ({ onLoadWarPresetToPipeline }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'killchain' | 'arsenal' | 'software' | 'cyber-injection' | 'trajectory'
  >('killchain');

  // Interactive Kill Chain State
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    STRIKE_TARGETS[0].id
  );
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(
    OFFENSIVE_WEAPONS[0].id
  );
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>(
    OFFENSIVE_SOFTWARE_STACKS[0].id
  );
  const [strikeMode, setStrikeMode] = useState<
    'KINETIC' | 'NON_KINETIC_CYBER' | 'DUAL_SPECTRUM_STRIKE'
  >('DUAL_SPECTRUM_STRIKE');
  const [roeAuthorized, setRoeAuthorized] = useState<boolean>(true);
  const [pqcOverrideActive, setPqcOverrideActive] = useState<boolean>(true);

  const [missionState, setMissionState] = useState<StrikeMissionExecution>({
    targetId: STRIKE_TARGETS[0].id,
    weaponId: OFFENSIVE_WEAPONS[0].id,
    softwareId: OFFENSIVE_SOFTWARE_STACKS[0].id,
    kineticOrCyber: 'DUAL_SPECTRUM_STRIKE',
    roeApproved: true,
    pqcAuthenticationVerified: true,
    currentPhase: 'FIND',
    phaseProgressPct: 20,
    timeToImpactSeconds: 0,
    telemetryLogs: [
      '[WAR-INIT] Joint Strike Operation Room online. Strategic command grid initialized.',
      '[RECON-SATELLITE] Continuous high-resolution Synthetic Aperture Radar (SAR) stream locked.',
      '[PQC-UPLINK] NIST FIPS 204 ML-DSA-87 digital fire control keys verified on Hardware Security Module.',
    ],
    bdaDamageScorePct: null,
    status: 'IDLE',
  });

  const [isExecutingStrike, setIsExecutingStrike] = useState<boolean>(false);
  const [inspectedWeapon, setInspectedWeapon] = useState<OffensiveWeapon | null>(
    null
  );
  const [inspectedSoftware, setInspectedSoftware] =
    useState<OffensiveSoftware | null>(null);

  // Live Zulu Clock
  const [zuluTime, setZuluTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setZuluTime(
        `${now.toISOString().substring(11, 19)}Z · ${now.toISOString().substring(0, 10)}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cyber payloads interactive state
  const [cyberPayloads, setCyberPayloads] = useState<OffensiveCyberPayload[]>(
    OFFENSIVE_CYBER_PAYLOADS
  );
  const [activeCyberInjectingId, setActiveCyberInjectingId] = useState<
    string | null
  >(null);
  const [cyberLogs, setCyberLogs] = useState<string[]>([
    '[CYBER-INIT] US CYBERCOM offensive staging node authenticated.',
    '[EXPLOIT-BUS] Over-the-air RF injection transceiver tuned to target radar frequency bands.',
  ]);

  const selectedTarget =
    STRIKE_TARGETS.find((t) => t.id === selectedTargetId) || STRIKE_TARGETS[0];
  const selectedWeapon =
    OFFENSIVE_WEAPONS.find((w) => w.id === selectedWeaponId) ||
    OFFENSIVE_WEAPONS[0];
  const selectedSoftware =
    OFFENSIVE_SOFTWARE_STACKS.find((s) => s.id === selectedSoftwareId) ||
    OFFENSIVE_SOFTWARE_STACKS[0];

  // Execute Strike Kill Chain
  const handleLaunchStrike = async () => {
    if (!roeAuthorized) return;
    setIsExecutingStrike(true);

    const phases: { phase: KillChainPhase; progress: number; log: string }[] = [
      {
        phase: 'FIND',
        progress: 15,
        log: `[PHASE 1: FIND] ${selectedSoftware.codeName} isolated target signature for ${selectedTarget.designation} (${selectedTarget.coordinates.mgrs}).`,
      },
      {
        phase: 'FIX',
        progress: 35,
        log: `[PHASE 2: FIX] Multi-static sensor triangulation confirmed coordinates. Uncertainty window reduced to < 0.6m CEP.`,
      },
      {
        phase: 'TRACK',
        progress: 55,
        log: `[PHASE 3: TRACK] Continuous sensor handover established via SDA Tranche 2 transport layer and ${selectedWeapon.platforms[0]}.`,
      },
      {
        phase: 'TARGET',
        progress: 75,
        log: `[PHASE 4: TARGET] Weaponeering solver calculated Pk=${(selectedTarget.calculatedKillProbability * 100).toFixed(0)}%. CJCSI 3160 CDE evaluated: ${selectedTarget.collateralDamageRisk}.`,
      },
      {
        phase: 'ENGAGE',
        progress: 90,
        log: `[PHASE 5: ENGAGE] Dispatched launch command to ${selectedWeapon.designation}! ${
          pqcOverrideActive
            ? 'NIST FIPS 204 ML-DSA-87 signed fire order verified in 0.4ms.'
            : 'Warning: Legacy unsigned fallback active.'
        } Ignition confirmed at Mach ${selectedWeapon.speedMach}.`,
      },
      {
        phase: 'ASSESS',
        progress: 100,
        log: `[PHASE 6: ASSESS] Terminal impact confirmed! Satellite SAR and high-definition IR confirm 100% target neutralization. Zero collateral breach.`,
      },
    ];

    setMissionState((prev) => ({
      ...prev,
      status: 'STRIKE_DISPATCHED',
      telemetryLogs: [
        `[STRIKE-INIT] Launching ${selectedWeapon.designation} against ${selectedTarget.id} (${selectedTarget.locationName})...`,
        ...prev.telemetryLogs,
      ],
      timeToImpactSeconds: Math.round(selectedTarget.calculatedKillProbability * 18),
    }));

    for (let i = 0; i < phases.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      const p = phases[i];
      setMissionState((prev) => ({
        ...prev,
        currentPhase: p.phase,
        phaseProgressPct: p.progress,
        telemetryLogs: [p.log, ...prev.telemetryLogs],
        status:
          i === phases.length - 1
            ? 'TARGET_NEUTRALIZED'
            : i > 2
            ? 'TERMINAL_MANEUVER'
            : 'MIDCOURSE_HOMING',
        bdaDamageScorePct: i === phases.length - 1 ? 99.4 : prev.bdaDamageScorePct,
      }));
    }

    setIsExecutingStrike(false);
  };

  const handleResetKillChain = () => {
    setMissionState({
      targetId: selectedTargetId,
      weaponId: selectedWeaponId,
      softwareId: selectedSoftwareId,
      kineticOrCyber: strikeMode,
      roeApproved: roeAuthorized,
      pqcAuthenticationVerified: pqcOverrideActive,
      currentPhase: 'FIND',
      phaseProgressPct: 20,
      timeToImpactSeconds: 0,
      telemetryLogs: [
        '[RESET] Kill chain reset. Standing by for next target assignment.',
      ],
      bdaDamageScorePct: null,
      status: 'IDLE',
    });
  };

  // Execute Cyber Payload
  const handleTriggerCyberPayload = async (payload: OffensiveCyberPayload) => {
    setActiveCyberInjectingId(payload.id);
    const newLogs = [
      `[CYBER-DISPATCH] Injecting payload "${payload.name}"...`,
      `[RF-BEAM] Transmitting over ${payload.deliveryVector} with zero-dwell pulse modulation...`,
      `[TARGET-EXPLOIT] Exploiting ${payload.targetInfrastructure}. Microcode override active.`,
      `[EFFECT-VERIFIED] Operational effect confirmed: ${payload.operationalEffect}`,
    ];

    for (const log of newLogs) {
      await new Promise((r) => setTimeout(r, 600));
      setCyberLogs((prev) => [log, ...prev]);
    }

    setCyberPayloads((prev) =>
      prev.map((p) =>
        p.id === payload.id ? { ...p, status: 'EFFECT_OBSERVED' } : p
      )
    );
    setActiveCyberInjectingId(null);
  };

  // Export Strike Package Dossier
  const handleExportStrikeDossier = () => {
    const data = {
      title: 'Offensive Strike Package & Weaponeering Telemetry Dossier',
      timestamp: new Date().toISOString(),
      zuluTimestamp: zuluTime,
      classification: 'TOP SECRET // SCI // EXCLUSIVE',
      standards: [
        'DoD CNSA 2.0 Level 5',
        'NIST FIPS 204 (ML-DSA-87)',
        'NIST FIPS 203 (ML-KEM-1024)',
        'CJCSI 3160.01 Collateral Damage Estimation',
        'Title 10 United States Code Armed Forces Authority',
      ],
      strikeTarget: selectedTarget,
      assignedWeapon: selectedWeapon,
      assignedSoftware: selectedSoftware,
      missionState,
      availableArsenal: OFFENSIVE_WEAPONS,
      offensiveSoftwareCatalog: OFFENSIVE_SOFTWARE_STACKS,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offensive-strike-dossier-${selectedTarget.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* War Room Header: Crimson & Dark Tactical Command Center */}
      <div className="relative overflow-hidden rounded-2xl border border-red-800/80 bg-gradient-to-br from-black via-zinc-950 to-neutral-950 p-5 sm:p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-red-950/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-950/90 border border-red-700 flex items-center justify-center text-red-400 font-bold shrink-0 shadow-lg ring-1 ring-red-500/40">
                <Flame className="w-7 h-7 text-red-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300">
                    DEFCON 2 · KINETIC & CYBER STRIKE COMMAND
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {zuluTime || '00:00:00Z'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Offensive Weapons & Strategic Strike Operations</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-900">
                    F2T2EA KILL CHAIN
                  </span>
                </h2>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onLoadWarPresetToPipeline && (
                <button
                  type="button"
                  onClick={onLoadWarPresetToPipeline}
                  className="px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-700 text-xs font-mono text-red-300 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Hypersonic PQC Uplink</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportStrikeDossier}
                className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-xs font-mono text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-red-400" />
                <span>Export Strike Dossier</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-4xl leading-relaxed">
            Autonomous multi-domain strike execution engine integrating advanced hypersonic boost-glide weapons, deep-strike cruise munitions, autonomous collaborative combat aircraft (CCA) swarms, and offensive cyber/EW injection. Enforces <strong className="text-white">DoD CNSA 2.0</strong> quantum-resistant fire command authorization and <strong className="text-amber-300">CJCSI 3160.01 Collateral Damage Estimation</strong> guardrails.
          </p>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl border border-red-950/80 bg-black/60">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Offensive Strike Arsenal</div>
              <div className="text-xl font-bold text-red-400 mt-0.5">8 Advanced Systems</div>
              <div className="text-[10px] text-zinc-400">Hypersonic · Stealth · Swarms</div>
            </div>

            <div className="p-3 rounded-xl border border-red-950/80 bg-black/60">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Max Hypersonic Velocity</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5 font-mono">Mach 20.0</div>
              <div className="text-[10px] text-zinc-400">AGM-183A ARRW Boost-Glide</div>
            </div>

            <div className="p-3 rounded-xl border border-red-950/80 bg-black/60">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">PQC Weapon Bus Encryption</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">FIPS 204 ML-DSA</div>
              <div className="text-[10px] text-zinc-400">Anti-Spoofing Terminal Divert</div>
            </div>

            <div className="p-3 rounded-xl border border-red-950/80 bg-black/60">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">F2T2EA Kill Cycle Speed</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5 font-mono">&lt; 22 Seconds</div>
              <div className="text-[10px] text-zinc-400">Algorithmic Maven & Warp Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('killchain')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'killchain'
              ? 'bg-red-950 border border-red-600 text-red-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Target className="w-4 h-4 text-red-400" />
          <span>F2T2EA Automated Strike Kill Chain</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('arsenal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'arsenal'
              ? 'bg-red-950 border border-red-600 text-red-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Bomb className="w-4 h-4 text-amber-400" />
          <span>Offensive Weapons Arsenal ({OFFENSIVE_WEAPONS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('software')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'software'
              ? 'bg-red-950 border border-red-600 text-red-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Offensive Military Software Stacks ({OFFENSIVE_SOFTWARE_STACKS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cyber-injection')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cyber-injection'
              ? 'bg-red-950 border border-red-600 text-red-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Cyber & Electronic Attack Console</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('trajectory')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'trajectory'
              ? 'bg-red-950 border border-red-600 text-red-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Hypersonic Trajectory & Weaponeering</span>
        </button>
      </div>

      {/* SUB-TAB 1: F2T2EA AUTOMATED STRIKE KILL CHAIN */}
      {activeSubTab === 'killchain' && (
        <div className="space-y-6">
          {/* Target & Weapon Pairing Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Target Selection */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  1. Designated Targets ({STRIKE_TARGETS.length})
                </span>
                <span className="text-[10px] font-mono text-zinc-400">JIPTL Priority</span>
              </div>

              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {STRIKE_TARGETS.map((tgt) => (
                  <button
                    key={tgt.id}
                    type="button"
                    onClick={() => {
                      setSelectedTargetId(tgt.id);
                      setSelectedWeaponId(tgt.recommendedWeaponId);
                      setSelectedSoftwareId(tgt.recommendedSoftwareId);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                      selectedTargetId === tgt.id
                        ? 'border-red-600 bg-red-950/30 ring-1 ring-red-500 shadow-md'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{tgt.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-950 text-red-300 border border-red-800">
                        {tgt.priority.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-zinc-100">{tgt.designation}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1">{tgt.locationName} · {tgt.region}</div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <span>Pk: <strong className="text-emerald-400">{(tgt.calculatedKillProbability * 100).toFixed(0)}%</strong></span>
                      <span>MGRS: <strong className="text-zinc-300">{tgt.coordinates.mgrs}</strong></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Weapon & Software Pairing */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Bomb className="w-4 h-4 text-amber-400" />
                  2. Assigned Kinetic & Cyber Systems
                </span>
                <span className="text-[10px] font-mono text-amber-400">Optimized Pairing</span>
              </div>

              {/* Weapon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Assigned Strike Munition:</label>
                <select
                  value={selectedWeaponId}
                  onChange={(e) => setSelectedWeaponId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-red-500 outline-none"
                >
                  {OFFENSIVE_WEAPONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.designation} ({w.weaponType} · Mach {w.speedMach})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Weapon Profile Snapshot */}
              <div className="p-3 rounded-xl border border-zinc-800 bg-black/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{selectedWeapon.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Mach {selectedWeapon.speedMach}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                  <div>Range: <strong className="text-white">{selectedWeapon.rangeKm} km</strong></div>
                  <div>CEP: <strong className="text-emerald-400">&lt; {selectedWeapon.circularErrorProbableMeters} m</strong></div>
                  <div className="col-span-2 text-zinc-300">Guidance: {selectedWeapon.guidanceSystem}</div>
                  <div className="col-span-2 text-amber-300">PQC: {selectedWeapon.quantumCryptoLink.standard}</div>
                </div>
              </div>

              {/* Software Suite Selector */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <label className="text-xs font-mono text-zinc-400">Targeting & Kill-Chain Software:</label>
                <select
                  value={selectedSoftwareId}
                  onChange={(e) => setSelectedSoftwareId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                >
                  {OFFENSIVE_SOFTWARE_STACKS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codeName} · {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Software Profile Snapshot */}
              <div className="p-3 rounded-xl border border-zinc-800 bg-black/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 font-mono">{selectedSoftware.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedSoftware.classification}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{selectedSoftware.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                  <span>Cycle: <strong className="text-white">{selectedSoftware.telemetry.cycleTimeMs}ms</strong></span>
                  <span>Certainty: <strong className="text-emerald-400">{selectedSoftware.telemetry.solutionCertaintyPct}%</strong></span>
                </div>
              </div>

              {/* Strike Vector Toggles */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-xs font-mono text-zinc-400 block">Strike Delivery Vector:</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setStrikeMode('KINETIC')}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold transition-all ${
                      strikeMode === 'KINETIC'
                        ? 'bg-amber-950 border border-amber-600 text-amber-300'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Kinetic
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrikeMode('NON_KINETIC_CYBER')}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold transition-all ${
                      strikeMode === 'NON_KINETIC_CYBER'
                        ? 'bg-cyan-950 border border-cyan-600 text-cyan-300'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Cyber / RF
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrikeMode('DUAL_SPECTRUM_STRIKE')}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold transition-all ${
                      strikeMode === 'DUAL_SPECTRUM_STRIKE'
                        ? 'bg-red-950 border border-red-600 text-red-300'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Dual-Spectrum
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Authorization & Fire Execution Panel */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    3. Launch Execution & ROE
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      missionState.status === 'TARGET_NEUTRALIZED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : missionState.status === 'IDLE'
                        ? 'bg-zinc-900 text-zinc-400'
                        : 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                    }`}
                  >
                    {missionState.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Collateral Damage & ROE Verification */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-400">Target Defenses:</span>
                      <span className="text-rose-400 font-mono text-[11px] font-bold">A2/AD Contested</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">{selectedTarget.defenses}</p>
                    <div className="pt-1.5 border-t border-zinc-800 text-[11px] font-mono text-amber-300">
                      Collateral Risk: {selectedTarget.collateralDamageRisk}
                    </div>
                  </div>

                  {/* Switch Controls */}
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black/60 space-y-3 text-xs font-mono">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-zinc-300">Title 10 ROE Clearance:</span>
                      <input
                        type="checkbox"
                        checked={roeAuthorized}
                        onChange={(e) => setRoeAuthorized(e.target.checked)}
                        className="w-4 h-4 accent-red-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-zinc-300">CNSA 2.0 PQC Hardware Lock:</span>
                      <input
                        type="checkbox"
                        checked={pqcOverrideActive}
                        onChange={(e) => setPqcOverrideActive(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Kill Chain Phase Tracker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Current Phase:</span>
                    <strong className="text-red-400 font-bold">{missionState.currentPhase}</strong>
                  </div>
                  <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${missionState.phaseProgressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                    <span>FIND</span>
                    <span>FIX</span>
                    <span>TRACK</span>
                    <span>TARGET</span>
                    <span>ENGAGE</span>
                    <span>ASSESS</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleLaunchStrike}
                  disabled={isExecutingStrike || !roeAuthorized}
                  className={`w-full py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isExecutingStrike
                      ? 'bg-red-950 text-red-400 border border-red-800 cursor-not-allowed animate-pulse'
                      : !roeAuthorized
                      ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border border-red-500 shadow-red-950/50'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>{isExecutingStrike ? 'Executing Strike Sequence...' : 'Dispatch Strike Package'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetKillChain}
                  className="w-full py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Reset Kill Chain</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry Log Stream */}
          <div className="rounded-2xl border border-zinc-800 bg-black/90 p-4 space-y-2 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span className="text-zinc-400 flex items-center gap-2 font-bold text-[11px] uppercase">
                <Terminal className="w-4 h-4 text-red-500" />
                Live Strike Telemetry Stream & Crypto Verification
              </span>
              <span className="text-[10px] text-zinc-500">
                {missionState.telemetryLogs.length} Events Logged
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none text-[11px] leading-relaxed">
              {missionState.telemetryLogs.map((log, index) => (
                <div
                  key={index}
                  className={`py-1 px-2 rounded ${
                    log.includes('CRITICAL') || log.includes('ASSESS') || log.includes('impact confirmed')
                      ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                      : log.includes('Warning') || log.includes('ENGAGE')
                      ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500'
                      : log.includes('STRIKE-INIT') || log.includes('PHASE')
                      ? 'bg-red-950/30 text-red-300 border-l-2 border-red-500'
                      : 'text-zinc-400 bg-zinc-950/60'
                  }`}
                >
                  <span className="text-zinc-500 mr-2 text-[10px]">
                    [{new Date().toISOString().substring(14, 21)}]
                  </span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OFFENSIVE WEAPONS ARSENAL */}
      {activeSubTab === 'arsenal' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bomb className="w-5 h-5 text-amber-400" />
                <span>Next-Generation Offensive Strike Systems Arsenal</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Hypersonic boost-glide vehicles, deep-penetrating stealth aircraft, and autonomous collaborative swarm missiles.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-red-950 border border-red-800 text-red-300">
              {OFFENSIVE_WEAPONS.length} SYSTEMS DEPLOYABLE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFENSIVE_WEAPONS.map((weapon) => (
              <div
                key={weapon.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4 hover:border-red-900/60 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      {weapon.weaponType}
                    </span>
                    <h4 className="text-sm font-bold text-white">{weapon.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono">{weapon.contractor}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black font-mono text-amber-400">
                      Mach {weapon.speedMach}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {weapon.rangeKm} km Range
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800/80 bg-black/60 space-y-1.5 text-xs">
                  <div className="text-zinc-300 leading-relaxed font-mono text-[11px]">
                    <strong className="text-zinc-400">Flight Profile: </strong>
                    {weapon.flightProfile}
                  </div>
                  <div className="text-zinc-300 leading-relaxed font-mono text-[11px]">
                    <strong className="text-zinc-400">Guidance: </strong>
                    {weapon.guidanceSystem}
                  </div>
                  <div className="text-zinc-300 leading-relaxed font-mono text-[11px]">
                    <strong className="text-zinc-400">Warhead: </strong>
                    {weapon.warheadType}
                  </div>
                </div>

                {/* Platforms & PQC Status */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-500">Deployable Platforms:</span>
                    {weapon.platforms.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg border border-emerald-950 bg-emerald-950/20 text-xs text-emerald-300 space-y-1 font-mono">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>Quantum Cryptographic Uplink:</span>
                      <span className="text-emerald-400">{weapon.quantumCryptoLink.status}</span>
                    </div>
                    <div className="text-[10px] text-zinc-300">{weapon.quantumCryptoLink.description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-mono text-zinc-400">
                    CEP: <strong className="text-emerald-400">&lt; {weapon.circularErrorProbableMeters}m</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWeaponId(weapon.id);
                      setActiveSubTab('killchain');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-xs font-mono text-red-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Assign to Kill Chain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: OFFENSIVE MILITARY SOFTWARE STACKS */}
      {activeSubTab === 'software' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Offensive Military Software & Algorithmic Strike Engines</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Algorithmic weaponeering, autonomous swarm coordination, and cognitive electronic attack software suites.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              {OFFENSIVE_SOFTWARE_STACKS.length} STACKS ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFENSIVE_SOFTWARE_STACKS.map((stack) => (
              <div
                key={stack.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4 hover:border-cyan-800/60 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {stack.codeName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {stack.classification}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{stack.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono">{stack.agencyOrContractor}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{stack.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Core Capabilities:</span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {stack.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-800 bg-black/60 font-mono text-xs flex items-center justify-between text-zinc-400">
                  <span>Cycle: <strong className="text-white">{stack.telemetry.cycleTimeMs}ms</strong></span>
                  <span>Throughput: <strong className="text-cyan-400">{stack.telemetry.targetThroughputPerSec}/s</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{stack.telemetry.solutionCertaintyPct}%</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-mono text-emerald-400">
                    PQC: {stack.pqcSecurityProtocol}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSoftwareId(stack.id);
                      setActiveSubTab('killchain');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-xs font-mono text-cyan-300 font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Deploy in Kill Chain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: OFFENSIVE CYBER & ELECTRONIC ATTACK CONSOLE */}
      {activeSubTab === 'cyber-injection' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-400" />
                <span>Offensive Cyber Injection & Electronic Warfare Console</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Over-the-air RF signal manipulation, SCADA turbine governor overspeed trips, and tactical datalink deception.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950 border border-rose-800 text-rose-300">
              CYBERCOM / NSA TAO STAGING
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Payloads List */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                Deployable Offensive Cyber Exploits:
              </span>
              {cyberPayloads.map((payload) => (
                <div
                  key={payload.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-3 hover:border-rose-900/60 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        {payload.exploitType}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{payload.name}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        payload.status === 'EFFECT_OBSERVED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {payload.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed font-mono text-[11px] bg-black/60 p-2.5 rounded-lg border border-zinc-800">
                    <p><strong className="text-zinc-500">Target: </strong>{payload.targetInfrastructure}</p>
                    <p><strong className="text-zinc-500">Vector: </strong>{payload.deliveryVector}</p>
                    <p><strong className="text-zinc-500">Effect: </strong>{payload.operationalEffect}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-zinc-400">
                      Stealth Dwell: <strong className="text-amber-400">{payload.stealthDurationSec}s</strong>
                    </span>

                    <button
                      type="button"
                      disabled={activeCyberInjectingId !== null}
                      onClick={() => handleTriggerCyberPayload(payload)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950 to-red-900 hover:from-rose-900 hover:to-red-800 border border-rose-700 text-xs font-mono text-rose-200 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeCyberInjectingId === payload.id ? 'Injecting Payload...' : 'Trigger Cyber Injection'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cyber Terminal Output */}
            <div className="rounded-2xl border border-zinc-800 bg-black/90 p-5 space-y-3 font-mono text-xs flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-300 flex items-center gap-2 font-bold text-[11px] uppercase">
                    <Terminal className="w-4 h-4 text-rose-500" />
                    Offensive Cyber Broadcast Stream
                  </span>
                  <span className="text-[10px] text-zinc-500">RF Transceiver Active</span>
                </div>

                <div className="space-y-2 mt-3 max-h-[420px] overflow-y-auto scrollbar-none text-[11px] leading-relaxed">
                  {cyberLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded border-l-2 ${
                        log.includes('EFFECT-VERIFIED')
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                          : log.includes('TARGET-EXPLOIT')
                          ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                          : 'border-rose-500 bg-rose-950/20 text-rose-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-[10px] text-zinc-400 space-y-1">
                <div className="flex justify-between text-zinc-300 font-bold">
                  <span>RF Frequency Band:</span>
                  <span className="text-emerald-400">3.1 - 3.5 GHz (S-Band Direct Injection)</span>
                </div>
                <div>Encryption: Post-Quantum Zero-Dwell Monotonic Key Exchange (FIPS 203)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: HYPERSONIC TRAJECTORY & WEAPONEERING PHYSICS */}
      {activeSubTab === 'trajectory' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Hypersonic Boost-Glide Trajectory Simulation & Physics</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Non-ballistic atmospheric skip maneuvers, thermal envelope dissipation, and quantum-resistant midcourse update packets.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              AERODYNAMIC SIMULATION
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Visual Altitude vs Range Flight Corridor */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-black/80 space-y-4">
              <span className="text-xs font-mono font-bold text-zinc-300 block">
                Atmospheric Altitude Profile (Mach 20.0 ARRW / Mach 17.0 Dark Eagle):
              </span>

              {/* Trajectory Graphic */}
              <div className="relative h-64 border border-zinc-800/90 rounded-xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-4 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none" />

                <div className="flex justify-between text-[10px] font-mono text-zinc-500 z-10">
                  <span>Exo-Atmosphere (80 km+)</span>
                  <span className="text-amber-400">Boost Rocket Burnout (Mach 20)</span>
                  <span>Midcourse Glide Skip (35 km)</span>
                  <span className="text-red-400 font-bold">Terminal Hypersonic Dive (0 km)</span>
                </div>

                {/* SVG Curve of Hypersonic Skip Maneuver */}
                <svg className="w-full h-36" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Classical ballistic path (dashed red) */}
                  <path
                    d="M 10 110 Q 250 -40 490 110"
                    fill="none"
                    stroke="#52525b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Hypersonic non-ballistic skipping trajectory (bright gradient) */}
                  <path
                    d="M 10 110 Q 70 10 140 30 T 260 45 T 380 40 L 490 110"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />

                  {/* Pulsing Intercept Target Node */}
                  <circle cx="490" cy="110" r="5" fill="#ef4444" className="animate-ping" />
                  <circle cx="490" cy="110" r="4" fill="#ffffff" />
                </svg>

                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 z-10 pt-2 border-t border-zinc-800">
                  <span>Launch: T+0s (0 km Range)</span>
                  <span className="text-amber-300">Atmospheric Re-entry Bounce (800 km Range)</span>
                  <span>Terminal Kinetic Impact: T+440s (1,600 km Range)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Atmospheric Peak Temp:</span>
                  <strong className="text-amber-400">1,940 °C</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">G-Force Terminal Maneuver:</span>
                  <strong className="text-cyan-400">28.4 Gs</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Target Impact Energy:</span>
                  <strong className="text-red-400">3.8 GJ (Exo-Kinetic)</strong>
                </div>
              </div>
            </div>

            {/* Weaponeering Calculations Card */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-black/80 space-y-3 text-xs font-mono">
              <span className="text-xs font-bold text-white uppercase block pb-2 border-b border-zinc-800">
                Automated Weaponeering Solvers
              </span>

              <div className="space-y-2 text-zinc-300">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px]">CJCSI 3160 Collateral Assessment:</span>
                  <div className="text-emerald-400 font-bold">Passed · Tier 1 Concurrence</div>
                  <div className="text-[10px] text-zinc-400">Expected Non-Combatant Casualties: 0.000</div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px]">Kinetic Penetration Depth:</span>
                  <div className="text-amber-400 font-bold">14.2 meters Reinforced Concrete</div>
                  <div className="text-[10px] text-zinc-400">Super-hardened tungsten carbide penetrator nose cone</div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 text-[10px]">PQC Fire Authorization Signature:</span>
                  <div className="text-cyan-300 font-bold truncate">NIST FIPS 204 ML-DSA-87</div>
                  <div className="text-[10px] text-zinc-400">Hash: 0x9a8f21bc44e19033...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
