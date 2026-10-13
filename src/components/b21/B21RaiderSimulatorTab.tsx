import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Gauge,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Target,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sliders,
  Plane,
  Eye,
  Radar,
  Radio,
  Lock,
  Flame,
  Activity,
  ArrowRight,
  Shield,
  RefreshCw,
  TrendingUp,
  Download,
  Crosshair as Reticle,
  Bomb,
  RadioTower,
  Package,
  KeyRound,
  Compass,
} from 'lucide-react';
import {
  B21FlightState,
  B21FlightMode,
  B21PqcSecurityParams,
  B21WeaponSystem,
  B21AvionicsSubsystem,
  B21BusFrame,
  B21StrategicTrack,
  B21RadarMode,
  B21KeyNegotiationLatencySample,
  B21StrikePackageNode,
  B21OmsPerformanceMetrics,
} from '../../types/b21Simulator';
import {
  INITIAL_B21_FLIGHT_STATE,
  B21_MAJOR_WEAPONS_SYSTEMS,
  B21_PQC_MODE_PRESETS,
  B21_AVIONICS_SUBSYSTEMS,
  SAMPLE_B21_BUS_FRAMES,
  SAMPLE_B21_STRATEGIC_TRACKS,
  INITIAL_B21_OMS_METRICS,
  INITIAL_B21_LATENCY_HISTORY,
  INITIAL_B21_STRIKE_PACKAGE_NODES,
} from '../../data/b21SimulatorData';

interface B21RaiderSimulatorTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const B21RaiderSimulatorTab: React.FC<B21RaiderSimulatorTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cockpit' | 'weapons' | 'architecture' | 'code' | 'bus' | 'telemetry'
  >('cockpit');

  // Strategic Flight State
  const [flightState, setFlightState] = useState<B21FlightState>(INITIAL_B21_FLIGHT_STATE);
  const [weaponsCatalog, setWeaponsCatalog] = useState<B21WeaponSystem[]>(B21_MAJOR_WEAPONS_SYSTEMS);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<B21WeaponSystem>(B21_MAJOR_WEAPONS_SYSTEMS[0]);
  const [selectedSubsystem, setSelectedSubsystem] = useState<B21AvionicsSubsystem>(B21_AVIONICS_SUBSYSTEMS[0]);
  const [strategicTracks, setStrategicTracks] = useState<B21StrategicTrack[]>(SAMPLE_B21_STRATEGIC_TRACKS);
  const [busFrames, setBusFrames] = useState<B21BusFrame[]>(SAMPLE_B21_BUS_FRAMES);
  const [targetLocked, setTargetLocked] = useState<string | null>('STRAT-01');
  const [filterWeaponCategory, setFilterWeaponCategory] = useState<string>('ALL');

  // Mission Telemetry & Metrics State
  const [omsMetrics, setOmsMetrics] = useState<B21OmsPerformanceMetrics>(INITIAL_B21_OMS_METRICS);
  const [latencyHistory, setLatencyHistory] = useState<B21KeyNegotiationLatencySample[]>(
    INITIAL_B21_LATENCY_HISTORY
  );
  const [strikeNodes, setStrikeNodes] = useState<B21StrikePackageNode[]>(INITIAL_B21_STRIKE_PACKAGE_NODES);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Dynamic PQC Rekey Countdown
  const [rekeyCountdown, setRekeyCountdown] = useState<number>(
    INITIAL_B21_FLIGHT_STATE.pqcSecurity.rekeyIntervalSeconds
  );
  const [isRekeying, setIsRekeying] = useState<boolean>(false);

  // Permissive Action Link (PAL Category F) Code Simulation
  const [palCodeInput, setPalCodeInput] = useState<string>('842-901');
  const [palAuthorized, setPalAuthorized] = useState<boolean>(true);

  // Status Feedback & Clipboard
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerNotice = (msg: string) => {
    setLastActionNotice(msg);
    setTimeout(() => setLastActionNotice(null), 4000);
  };

  // Live Rekey Ratchet Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRekeyCountdown((prev) => {
        if (prev <= 1) {
          handleForceRekey(false);
          return flightState.pqcSecurity.rekeyIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flightState.pqcSecurity.rekeyIntervalSeconds]);

  // Live Telemetry Stream
  useEffect(() => {
    if (!isLiveStreaming) return;

    const streamInterval = setInterval(() => {
      setOmsMetrics((prev) => ({
        ...prev,
        omsCpuUtilization: Number((prev.omsCpuUtilization + (Math.random() * 2.0 - 1.0)).toFixed(1)),
        nc3CryptoCoresUtilization: Number((prev.nc3CryptoCoresUtilization + (Math.random() * 1.6 - 0.8)).toFixed(1)),
        opticalFabricThroughputGbps: Number((8.92 + Math.random() * 0.4 - 0.2).toFixed(2)),
        busJitterNs: Number((0.85 + (Math.random() * 0.08 - 0.04)).toFixed(2)),
      }));

      // Latency sample generator
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const baseKEM = flightState.flightMode === 'Stealth' ? 0.038 : flightState.flightMode === 'Combat' ? 0.032 : 0.068;
      const sample: B21KeyNegotiationLatencySample = {
        timestamp: timeStr,
        cycle: Date.now(),
        kemEncapMs: Number((baseKEM + (Math.random() * 0.004 - 0.002)).toFixed(3)),
        kemDecapMs: Number((baseKEM * 1.08 + (Math.random() * 0.004 - 0.002)).toFixed(3)),
        satcomRttMs: Number((0.08 + (Math.random() * 0.008 - 0.004)).toFixed(3)),
        totalNegotiationMs: Number((baseKEM * 2.08 + 0.08 + (Math.random() * 0.008)).toFixed(3)),
        classicalEcdhMs: Number((0.295 + (Math.random() * 0.02 - 0.01)).toFixed(3)),
        algorithm: 'ML-KEM-1024',
        flightMode: flightState.flightMode,
        jitterMicrosec: Number((3.0 + Math.random() * 1.2).toFixed(1)),
        handshakeStatus: Math.random() > 0.85 ? 'RATCHETED' : 'SUCCESS',
      };

      setLatencyHistory((prev) => [...prev.slice(-14), sample]);
    }, 2000);

    return () => clearInterval(streamInterval);
  }, [isLiveStreaming, flightState.flightMode]);

  // Handle Flight Mode Selection (Stealth, Combat, Training)
  const handleSelectFlightMode = (mode: B21FlightMode) => {
    const params = B21_PQC_MODE_PRESETS[mode];
    setRekeyCountdown(params.rekeyIntervalSeconds);

    let newRadarMode: B21RadarMode = flightState.radarMode;
    let newRcs = 0.00001;
    let notice = '';

    if (mode === 'Stealth') {
      newRadarMode = 'Total Emission Silence';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.015 : 0.00001;
      notice = 'B-21 ULTRA-VLO DEEP PENETRATION ENGAGED. BROADBAND EMISSION SILENCE. PQC PROFILE: FIPS 203 ML-KEM-1024 + ML-DSA-87 (LEVEL 5).';
    } else if (mode === 'Combat') {
      newRadarMode = 'Broadband AESA LPI';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.015 : 0.00001;
      notice = 'B-21 STANDOFF COMBAT STRIKE & CCA SWARM ACTIVE. PQC PROFILE: FIPS 203 ML-KEM-768 + ML-DSA-65.';
    } else if (mode === 'Training') {
      newRadarMode = 'SAR All-Weather Strike';
      newRcs = 0.3500;
      notice = 'B-21 STRATEGIC DETERRENCE SORTIE ACTIVE. LUNEBURG REFLECTORS DEPLOYED (RCS 0.35 m²). FAA TELEMETRY.';
    }

    setFlightState((prev) => ({
      ...prev,
      flightMode: mode,
      pqcSecurity: params,
      radarMode: newRadarMode,
      stealthRcsSqm: newRcs,
      cnsaCryptoStatus: mode === 'Training' ? 'CLASSICAL_RESTRICTED' : 'PQC_HYBRID_ACTIVE',
    }));

    // Inject OMS Optical Fabric frame
    const nowStamp = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const newFrame: B21BusFrame = {
      id: `b21-mode-${Date.now()}`,
      timestamp: nowStamp,
      busChannel: 'OMS-OPTICAL-FABRIC',
      remoteTerminal: 'OMS Core (Cluster Alpha)',
      subAddress: 'SA-01 (Profile Transition)',
      wordCount: 128,
      hexPayload: mode === 'Stealth' ? 'FFFF 0001 03E8 0005' : mode === 'Combat' ? '0300 0003 0190 0002' : '0200 0001 00C8 0003',
      decodedMeaning: `OMS Core Switched to ${mode.toUpperCase()} PROFILE: ${params.kemAlgorithm} (${params.securityLevel})`,
      status: 'PQC_ENCRYPTED',
    };
    setBusFrames((prev) => [newFrame, ...prev.slice(0, 5)]);

    triggerNotice(notice);
  };

  // Manual or Scheduled Rekey Ratchet
  const handleForceRekey = (manual = true) => {
    setIsRekeying(true);
    setFlightState((prev) => ({ ...prev, cnsaCryptoStatus: 'REKEYING' }));

    setTimeout(() => {
      setIsRekeying(false);
      setRekeyCountdown(flightState.pqcSecurity.rekeyIntervalSeconds);
      setFlightState((prev) => ({
        ...prev,
        cnsaCryptoStatus: prev.flightMode === 'Training' ? 'CLASSICAL_RESTRICTED' : 'PQC_HYBRID_ACTIVE',
      }));

      if (manual) {
        triggerNotice(
          `B-21 OMS STRATEGIC PQC KEY RATCHET EXECUTED. Ephemeral key refreshed: ${flightState.pqcSecurity.kemAlgorithm}.`
        );
      }
    }, 850);
  };

  // Toggle Heavy Rotary Launcher Bay Doors
  const handleToggleBayDoors = () => {
    const nextState = flightState.weaponBayDoors === 'CLOSED' ? 'OPEN' : 'CLOSED';
    const newRcs = nextState === 'OPEN' ? 0.015 : 0.00001;
    setFlightState((prev) => ({
      ...prev,
      weaponBayDoors: nextState,
      stealthRcsSqm: newRcs,
    }));
    triggerNotice(
      nextState === 'OPEN'
        ? 'HEAVY ROTARY LAUNCHER DOORS OPEN. RCS BLOOM ACTIVE: 0.015 m².'
        : 'HEAVY ROTARY LAUNCHER DOORS SEALED. ULTRA-LOW OBSERVABLE 0.00001 m² RESTORED.'
    );
  };

  // Toggle PAL Code Nuclear Release Authorization
  const handleTogglePal = () => {
    const nextPal = !palAuthorized;
    setPalAuthorized(nextPal);
    setFlightState((prev) => ({ ...prev, palCodeAuthorized: nextPal }));
    triggerNotice(
      nextPal
        ? 'TWO-MAN RULE VERIFIED: PERMISSIVE ACTION LINK (PAL CATEGORY F) CONFIRMED ARMED.'
        : 'PERMISSIVE ACTION LINK HARDWARE LOCKOUT ENGAGED: STRATEGIC WEAPONS INHIBITED.'
    );
  };

  // Fire Weapon Simulation
  const handleFireWeapon = (weaponIdToFire?: string) => {
    if (!flightState.masterArm) {
      triggerNotice('WARNING: MASTER ARM IS SAFE. SWITCH TO MASTER ARM LIVE BEFORE RELEASE.');
      return;
    }
    if (flightState.weaponBayDoors !== 'OPEN') {
      triggerNotice('WARNING: ROTARY LAUNCHER DOORS CLOSED. ACTUATE HEAVY BAY DOORS PRIOR TO RELEASE.');
      return;
    }

    const targetWeaponId = weaponIdToFire || flightState.selectedWeaponId;
    const weapon = weaponsCatalog.find((w) => w.id === targetWeaponId);

    if (!weapon || weapon.readyCount <= 0) {
      triggerNotice(`NO ${weapon?.name || 'WEAPON'} REMAINING IN CURRENT INVENTORY.`);
      return;
    }

    if (weapon.category === 'Strategic Nuclear' && !palAuthorized) {
      triggerNotice('ABORTED: NUCLEAR RELEASE INHIBITED. ENTER PERMISSIVE ACTION LINK (PAL) TWO-MAN RULE AUTHORIZATION.');
      return;
    }

    // Decrement count
    setWeaponsCatalog((prev) =>
      prev.map((w) => {
        if (w.id === targetWeaponId) {
          const newCount = w.readyCount - 1;
          return {
            ...w,
            readyCount: newCount,
            status: newCount <= 0 ? 'EXPENDED' : 'READY',
          };
        }
        return w;
      })
    );

    triggerNotice(
      `STRATEGIC RELEASE: ${weapon.name.toUpperCase()} DEPLOYED! Target: ${targetLocked ? targetLocked : 'DEEP BUNKER'} (${weapon.guidance.slice(0, 30)}...).`
    );
  };

  // Filter weapons
  const filteredWeapons = filterWeaponCategory === 'ALL'
    ? weaponsCatalog
    : weaponsCatalog.filter((w) => w.category === filterWeaponCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-indigo-400" />
                B-21 Raider Sixth-Gen Long-Range Penetrating Strike Bomber
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                Northrop Grumman · USAF Global Strike Command · Ellsworth AFB
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                CNSA 2.0 Category 5 Post-Quantum Cryptoprocessor
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              B-21 Raider Open Mission Systems (OMS) & Strategic Architecture Simulator
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full-fidelity interactive simulation of the B-21 Raider flying wing architecture: <strong className="text-indigo-300">Open Mission Systems (OMS) Modular Core</strong>, <strong className="text-emerald-300">Broadband Conformal Sensors & EW</strong>, <strong className="text-rose-300">Nuclear Command & Control (NC3)</strong> with Permissive Action Link PAL Category F, <strong className="text-amber-300">CCA Autonomous Swarm Command</strong>, and integrated <strong className="text-cyan-300">Strategic Weapons Systems</strong> with NIST FIPS 203/204 lattice cryptography.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Activity className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">OMS Core Status</div>
                <div className="text-sm font-bold font-mono text-indigo-300">OPTICAL FABRIC 10 GBPS</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Broadband Stealth RCS</div>
                <div className="text-sm font-bold font-mono text-emerald-300">
                  {flightState.stealthRcsSqm.toFixed(5)} m² (ULTRA-VLO)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B-21 Flight Mode Selector: Stealth, Combat, Training */}
        <div className="mt-6 pt-5 border-t border-indigo-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                B-21 Operational Strategic Mission Selector
              </span>
              <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">
                (Dynamically updates OMS PQC parameters, NC3 encryption, and broadband EMCON status)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">Active Profile:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  flightState.flightMode === 'Stealth'
                    ? 'bg-indigo-950/90 text-indigo-300 border-indigo-500/70'
                    : flightState.flightMode === 'Combat'
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                    : 'bg-sky-950/90 text-sky-300 border-sky-500/70'
                }`}
              >
                {flightState.flightMode.toUpperCase()} · {flightState.pqcSecurity.securityLevel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Mode 1: STEALTH */}
            <button
              type="button"
              onClick={() => handleSelectFlightMode('Stealth')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                flightState.flightMode === 'Stealth'
                  ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/60 shadow-lg shadow-indigo-950/60'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      flightState.flightMode === 'Stealth'
                        ? 'bg-indigo-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Deep Penetration VLO</span>
                      {flightState.flightMode === 'Stealth' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-400 font-semibold">
                      EMCON 1 · Broadband Silence
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-700 text-indigo-300">
                  100% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-indigo-300 font-semibold">ML-KEM-1024 (Category 5)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">NC3 Crypto:</span>
                  <span className="text-indigo-300 font-semibold">ML-DSA-87 / Cryogenic HSM</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">Total Silence · 0.00001 m²</span>
                </div>
              </div>
            </button>

            {/* Mode 2: COMBAT */}
            <button
              type="button"
              onClick={() => handleSelectFlightMode('Combat')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                flightState.flightMode === 'Combat'
                  ? 'border-amber-500 bg-amber-950/40 ring-2 ring-amber-500/60 shadow-lg shadow-amber-950/60'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      flightState.flightMode === 'Combat'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Standoff Strike & Swarm</span>
                      {flightState.flightMode === 'Combat' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-semibold">
                      EMCON 3 · Protected SATCOM
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-700 text-amber-300">
                  99.5% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-amber-300 font-semibold">ML-KEM-768 + X25519</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Swarm Link:</span>
                  <span className="text-amber-300 font-semibold">ML-DSA-65 / CCA Directional</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">AESA LPI · 0.00001 m²</span>
                </div>
              </div>
            </button>

            {/* Mode 3: TRAINING */}
            <button
              type="button"
              onClick={() => handleSelectFlightMode('Training')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                flightState.flightMode === 'Training'
                  ? 'border-sky-500 bg-sky-950/40 ring-2 ring-sky-500/60 shadow-lg shadow-sky-950/60'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      flightState.flightMode === 'Training'
                        ? 'bg-sky-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Deterrence Sortie</span>
                      {flightState.flightMode === 'Training' && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-sky-400 font-semibold">
                      EMCON 5 · Range Test / FAA
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-700 text-sky-300">
                  88.5% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-sky-300 font-semibold">ML-KEM-512 + Range Test</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Telemetry:</span>
                  <span className="text-sky-300 font-semibold">ML-DSA-44 + ECDSA P-256</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">SAR Strike · 0.3500 m²</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
          <button
            onClick={() => setActiveSubTab('cockpit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'cockpit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-300" />
            <span>Strategic Flight Deck & Mission Commander</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950 border border-indigo-400/30 text-indigo-200">
              Intercontinental
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('weapons')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'weapons'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Bomb className="w-3.5 h-3.5 text-rose-300" />
            <span>Major Weapons Systems (12 Strategic Arsenal)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-400/30 text-rose-200">
              PAL Nuclear / Conventional
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Open Mission Systems (OMS) Architecture</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Microkernel Fabric
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-300" />
            <span>Ada 2012 & Rust Flight Code</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              DO-178C Level A
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('bus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'bus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>Optical OMS & TTEthernet Bus</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'telemetry'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-300" />
            <span>Mission Telemetry & Strategic Latency</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-200">
              Live Graphs
            </span>
          </button>
        </div>
      </div>

      {/* Action Notice Strip */}
      {lastActionNotice && (
        <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>{lastActionNotice}</span>
          </div>
          <span className="text-[10px] text-zinc-400">GLOBAL STRIKE COMMAND AUTHENTICATED</span>
        </div>
      )}

      {/* SUB-TAB 1: STRATEGIC FLIGHT DECK & COCKPIT */}
      {activeSubTab === 'cockpit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Strategic HUD & Penetration Vector */}
            <div className="lg:col-span-2 p-5 rounded-2xl border border-indigo-500/40 bg-zinc-950 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    B-21 Strategic Mission Deck · Penetration Vector
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-700 text-emerald-300">
                    Range: {flightState.rangeRemainingNm.toLocaleString()} NM
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                    Fuel: {flightState.fuelPercent}%
                  </span>
                </div>
              </div>

              {/* High-Contrast Glass Display */}
              <div className="h-72 rounded-xl bg-black border border-indigo-500/30 p-4 font-mono text-indigo-300 flex flex-col justify-between relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 to-transparent pointer-events-none" />

                {/* Flying Wing Vector Silhouette */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-80 h-1 bg-indigo-400/80 -rotate-12" />
                  <div className="w-80 h-1 bg-indigo-400/80 rotate-12" />
                </div>

                {/* HUD Top Bar */}
                <div className="flex justify-between items-center text-xs relative z-10">
                  <div>
                    <span className="text-zinc-500 mr-2">CRUISE</span>
                    <strong className="text-emerald-400 text-base">{flightState.airspeedKnots}</strong> KTS
                    <span className="ml-3 text-indigo-300">M {flightState.mach}</span>
                  </div>
                  <div className="text-center font-bold text-sm text-indigo-300">
                    HDG {flightState.heading}° / PITCH {flightState.pitch}°
                  </div>
                  <div>
                    <span className="text-zinc-500 mr-2">ALT</span>
                    <strong className="text-emerald-400 text-base">{flightState.altitudeFeet.toLocaleString()}</strong> FT
                  </div>
                </div>

                {/* Target Indicator */}
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="w-20 h-20 rounded-full border border-dashed border-indigo-400 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-[10px] text-rose-300 mt-2 font-bold tracking-wider">
                    {targetLocked ? `ASSIGNED: ${targetLocked}` : 'SCANNING STRATEGIC TARGET'}
                  </div>
                </div>

                {/* HUD Bottom Bar */}
                <div className="flex justify-between items-end text-xs relative z-10 border-t border-indigo-500/20 pt-2">
                  <div className="space-y-0.5 text-[11px]">
                    <div>G-LOAD: <strong className="text-white">{flightState.gForce}G</strong> · EMCON: <strong className="text-indigo-400">{flightState.pqcSecurity.emconLevel.slice(0, 7)}</strong></div>
                    <div>SENSOR: <strong className="text-emerald-300">{flightState.radarMode}</strong></div>
                  </div>
                  <div className="text-right space-y-0.5 text-[11px]">
                    <div>ROTARY BAY: <strong className={flightState.weaponBayDoors === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'}>{flightState.weaponBayDoors}</strong></div>
                    <div>PAL ARMING: <strong className={palAuthorized ? 'text-emerald-300' : 'text-rose-400'}>{palAuthorized ? 'CAT-F ARMED' : 'LOCKED'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Strategic Flight Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">CRUISE THROTTLE (%)</div>
                  <input
                    type="range"
                    min="40"
                    max="95"
                    value={flightState.throttlePercent}
                    onChange={(e) => {
                      const newTh = Number(e.target.value);
                      const mach = Number((0.68 + (newTh / 100) * 0.28).toFixed(2));
                      setFlightState((prev) => ({
                        ...prev,
                        throttlePercent: newTh,
                        mach,
                        airspeedKnots: Math.round(mach * 590),
                      }));
                    }}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">{flightState.throttlePercent}%</span>
                    <span className="text-indigo-400 font-bold">HIGH-EFFICIENCY</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">ROTARY LAUNCHER DOORS</div>
                  <button
                    onClick={handleToggleBayDoors}
                    className={`w-full py-1.5 px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      flightState.weaponBayDoors === 'OPEN'
                        ? 'bg-rose-500 text-black hover:bg-rose-400'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {flightState.weaponBayDoors === 'OPEN' ? 'CLOSE BAY DOORS' : 'CYCLE ROTARY DOORS'}
                  </button>
                  <div className="text-[10px] font-mono text-zinc-500 text-center">
                    RCS: {flightState.stealthRcsSqm.toFixed(5)} m²
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">PAL NUCLEAR PERMISSIVE LINK</div>
                  <button
                    onClick={handleTogglePal}
                    className={`w-full py-1.5 px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      palAuthorized
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {palAuthorized ? 'TWO-MAN RULE ARMED' : 'PAL LOCKED'}
                  </button>
                  <div className="text-[10px] font-mono text-zinc-500 text-center">
                    Code: {palCodeInput}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">MASTER ARM</div>
                  <button
                    onClick={() => {
                      setFlightState((prev) => ({ ...prev, masterArm: !prev.masterArm }));
                      triggerNotice(flightState.masterArm ? 'MASTER ARM SAFE' : 'MASTER ARM HOT & LIVE');
                    }}
                    className={`w-full py-1.5 px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      flightState.masterArm
                        ? 'bg-rose-600 text-white hover:bg-rose-500'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {flightState.masterArm ? 'ARMED (LIVE)' : 'SAFE'}
                  </button>
                  <div className="text-[10px] font-mono text-zinc-500 text-center">
                    DO-178C Interlock
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Situation Display (SSD) */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Strategic Situation Display (SSD)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Global ESM
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="text-[11px] font-mono text-zinc-400 flex justify-between">
                    <span>STRATEGIC OBJECTIVE</span>
                    <span>BEARING / RNG</span>
                  </div>

                  {strategicTracks.map((trk) => (
                    <div
                      key={trk.id}
                      onClick={() => {
                        setTargetLocked(trk.id);
                        triggerNotice(`TARGET ASSIGNED: ${trk.callsign} loaded into guidance computer.`);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        targetLocked === trk.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 ring-1 ring-indigo-500/70'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              trk.threatLevel === 'CRITICAL'
                                ? 'bg-rose-500'
                                : trk.threatLevel === 'HIGH'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          {trk.callsign}
                        </span>
                        <span className="text-zinc-400">
                          {trk.bearing.toString().padStart(3, '0')}° / {trk.rangeNm} nm
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
                        <span>{trk.type}</span>
                        <span className={trk.lockStatus === 'TARGET_DESIGNATED' ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
                          {trk.lockStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fire Selected Weapon Button */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <button
                  type="button"
                  onClick={() => handleFireWeapon()}
                  className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <Bomb className="w-4 h-4" />
                  <span>EXECUTE STRATEGIC MUNITION RELEASE</span>
                </button>
                <div className="text-[10px] font-mono text-zinc-500 text-center">
                  Weapon: {weaponsCatalog.find(w => w.id === flightState.selectedWeaponId)?.name || 'AGM-181 LRSO'}
                </div>
              </div>
            </div>
          </div>

          {/* Live PQC Dynamic Parameters Status Dashboard */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-zinc-950 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Active B-21 Post-Quantum Cryptoprocessor & NC3 Permissive Parameters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">Auto Rekey in:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-700 text-indigo-300">
                  {rekeyCountdown}s
                </span>
                <button
                  onClick={() => handleForceRekey(true)}
                  disabled={isRekeying}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRekeying ? 'animate-spin' : ''}`} />
                  <span>Force Ratchet</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">LATTICE KEM ALGORITHM</div>
                <div className="text-indigo-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.kemAlgorithm}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">SIGNATURE & NC3 ARMING</div>
                <div className="text-emerald-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.signatureAlgorithm}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">STRIKE PACKAGE SYNC</div>
                <div className="text-amber-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.strikePackageSync}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">QUANTUM RESISTANCE SCORE</div>
                <div className="text-purple-300 font-bold mt-0.5">{flightState.pqcSecurity.quantumResistanceScore}% CNSA 2.0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MAJOR WEAPONS SYSTEMS INTEGRATION (12 ARSENAL) */}
      {activeSubTab === 'weapons' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-zinc-950 to-rose-950/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bomb className="w-5 h-5 text-rose-400" />
                  B-21 Raider Major Weapons Systems Integration (12 Strategic Arsenal)
                </h3>
                <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed mt-0.5">
                  Complete catalog of strategic thermonuclear, long-range standoff cruise missiles, super-heavy penetrators (30,000 lb MOP), hypersonic weapons, and autonomous Collaborative Combat Aircraft (CCA) swarm bays with Permissive Action Link PAL Category F verification.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {['ALL', 'Strategic Nuclear', 'Standoff Hypersonic', 'Super-Heavy Penetrator', 'Autonomous CCA Swarm', 'Maritime Strike', 'Smart Munitions'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterWeaponCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      filterWeaponCategory === cat
                        ? 'bg-rose-500 text-black shadow-md'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotary Launcher Status Bars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">ROTARY LAUNCHER ALPHA</span>
                <div className="text-white font-bold mt-0.5">8x AGM-181 LRSO Cruise Missiles</div>
                <div className="text-[10px] text-emerald-400">Armed & Pre-Targeted</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">ROTARY LAUNCHER BRAVO</span>
                <div className="text-white font-bold mt-0.5">8x B61-12 Thermonuclear Bombs</div>
                <div className="text-[10px] text-purple-400">PAL Category F Verified</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">INTERNAL HEAVY BAY</span>
                <div className="text-white font-bold mt-0.5">2x GBU-57 MOP (30,000 lb Bunker Buster)</div>
                <div className="text-[10px] text-rose-400">Penetrates 200 ft Concrete</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">CCA AUTONOMOUS SWARM BAY</span>
                <div className="text-white font-bold mt-0.5">4x Collaborative Combat Aircraft (CCA)</div>
                <div className="text-[10px] text-cyan-400">MUM-T Swarm Mesh Ready</div>
              </div>
            </div>
          </div>

          {/* Interactive Weapons Grid & Detailed Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Weapons List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex justify-between items-center px-1">
                <span>Select Munition to Inspect / Deploy ({filteredWeapons.length} Systems)</span>
                <span className="text-[10px] text-zinc-500">Dual Common Rotary Launcher (CRL)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredWeapons.map((wpn) => {
                  const isSelected = selectedWeaponDetail.id === wpn.id;
                  return (
                    <div
                      key={wpn.id}
                      onClick={() => {
                        setSelectedWeaponDetail(wpn);
                        setFlightState((prev) => ({ ...prev, selectedWeaponId: wpn.id }));
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/70 shadow-lg'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {wpn.name}
                          </span>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {wpn.rangeKm}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                            wpn.category === 'Strategic Nuclear'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : wpn.category === 'Super-Heavy Penetrator'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : wpn.category === 'Standoff Hypersonic'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : wpn.category === 'Autonomous CCA Swarm'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {wpn.category}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">{wpn.defaultBay}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">Qty: {wpn.readyCount}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFireWeapon(wpn.id);
                            }}
                            disabled={wpn.readyCount <= 0 || !flightState.masterArm}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold cursor-pointer"
                          >
                            Release
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Selected Weapon Full Technical Dossier */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Strategic Munition Dossier
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {selectedWeaponDetail.defaultBay}
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">WEAPON SYSTEM</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedWeaponDetail.name}</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Strategic Parameters</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Guidance:</span>
                      <span className="text-zinc-200 text-right max-w-[200px] truncate">{selectedWeaponDetail.guidance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Standoff Range:</span>
                      <span className="text-emerald-400 font-bold">{selectedWeaponDetail.rangeKm}</span>
                    </div>
                    {selectedWeaponDetail.yield && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Nuclear Yield:</span>
                        <span className="text-purple-300 font-bold">{selectedWeaponDetail.yield}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Weight:</span>
                      <span className="text-zinc-300">{selectedWeaponDetail.weightKg.toLocaleString()} kg ({Math.round(selectedWeaponDetail.weightKg * 2.204).toLocaleString()} lb)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bay Capacity:</span>
                      <span className="text-indigo-400 font-bold">{selectedWeaponDetail.maxPayloadCount} carried</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Bus Interface & PAL Security</div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Bus: </span>
                    {selectedWeaponDetail.busInterface}
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Arming Protocol: </span>
                    <span className="text-rose-300 font-bold">{selectedWeaponDetail.cryptoArmingProtocol}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Release Envelope: </span>
                    {selectedWeaponDetail.releaseEnvelope}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                  {selectedWeaponDetail.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleFireWeapon(selectedWeaponDetail.id)}
                  disabled={selectedWeaponDetail.readyCount <= 0 || !flightState.masterArm}
                  className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <Bomb className="w-4 h-4" />
                  <span>ARM & RELEASE ({selectedWeaponDetail.readyCount} READY)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: OPEN MISSION SYSTEMS (OMS) ARCHITECTURE */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  B-21 Open Mission Systems (OMS) Modular Architecture
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                Cloud-Native DevSecOps Containerized Fabric
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {B21_AVIONICS_SUBSYSTEMS.map((sub) => {
                const isSelected = selectedSubsystem.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/70 shadow-lg'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">{sub.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                        {sub.acronym}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-zinc-400 space-y-0.5">
                      <div>Domain: <span className="text-indigo-300">{sub.omsDomain}</span></div>
                      <div>Language: <span className="text-amber-300">{sub.softwareLanguage}</span></div>
                      <div>Bus: <span className="text-zinc-300">{sub.busInterface}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subsystem Details Card */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">{selectedSubsystem.name}</span>
                <span className="text-emerald-400">{selectedSubsystem.pqcCompliance}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{selectedSubsystem.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: FLIGHT CODE & PIPELINE EXPORT */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  B-21 Safety-Critical Software Code ({selectedSubsystem.sourceFile})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedSubsystem.codeSnippet, 'code')}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'code' ? 'Copied' : 'Copy Code'}</span>
                </button>

                {onLoadCodeToPipeline && (
                  <button
                    type="button"
                    onClick={() => onLoadCodeToPipeline(selectedSubsystem.codeSnippet)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Export to PQC Pipeline</span>
                  </button>
                )}
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black border border-zinc-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{selectedSubsystem.codeSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AVIONICS BUS TELEMETRY */}
      {activeSubTab === 'bus' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  High-Speed Optical OMS Fabric & Time-Triggered Ethernet (TTEthernet) Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                10 Gbps PQC Authenticated
              </span>
            </div>

            <div className="space-y-2">
              {busFrames.map((frm) => (
                <div
                  key={frm.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs space-y-1"
                >
                  <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                    <span className="text-zinc-200 font-bold">{frm.remoteTerminal}</span>
                    <span>{frm.timestamp} · {frm.busChannel}</span>
                  </div>
                  <div className="text-zinc-300">{frm.decodedMeaning}</div>
                  <div className="text-[10px] text-zinc-500 flex justify-between">
                    <span>SubAddress: {frm.subAddress}</span>
                    <span className="text-indigo-400 font-semibold">{frm.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: MISSION TELEMETRY & STRATEGIC LATENCY */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">OMS Core Utilization</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{omsMetrics.omsCpuUtilization}%</div>
              <div className="text-[10px] text-zinc-400">Microkernel Multi-Core</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Optical Fabric Throughput</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{omsMetrics.opticalFabricThroughputGbps} Gbps</div>
              <div className="text-[10px] text-zinc-400">OMS Conformal Mesh</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Cryogenic TRNG Rate</div>
              <div className="text-xl font-bold text-purple-400 mt-1">{omsMetrics.cryogenicTrngEntropyRateGbps} Gbps</div>
              <div className="text-[10px] text-zinc-400">Quantum Vacuum Entropy</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Deterministic Jitter</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{omsMetrics.busJitterNs} ns</div>
              <div className="text-[10px] text-zinc-400">Time-Triggered Ethernet</div>
            </div>
          </div>

          {/* SVG Latency Graph */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Real-Time B-21 Strategic Key Negotiation Latency (ML-KEM-1024 vs Classical ECDH)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  SATCOM & Optical Ratchet Active
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="h-64 w-full bg-black rounded-xl border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Radar className="w-48 h-48 text-indigo-500" />
              </div>

              <div className="flex justify-end gap-4 text-[10px] font-mono z-10">
                <span className="text-indigo-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-indigo-400 inline-block" /> ML-KEM-1024 ({latencyHistory[latencyHistory.length - 1]?.totalNegotiationMs}ms)
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-rose-400 inline-block" /> Classical ECDH ({latencyHistory[latencyHistory.length - 1]?.classicalEcdhMs}ms)
                </span>
              </div>

              <svg className="w-full h-40 overflow-visible z-10" viewBox="0 0 600 120" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="600" y2="100" stroke="#27272a" strokeDasharray="4 4" />
                <line x1="0" y1="50" x2="600" y2="50" stroke="#27272a" strokeDasharray="4 4" />

                {/* Classical Line (Red) */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  points={latencyHistory
                    .map((d, i) => `${(i / (latencyHistory.length - 1 || 1)) * 600},${120 - d.classicalEcdhMs * 300}`)
                    .join(' ')}
                />

                {/* PQC Total Line (Indigo) */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  points={latencyHistory
                    .map((d, i) => `${(i / (latencyHistory.length - 1 || 1)) * 600},${120 - d.totalNegotiationMs * 300}`)
                    .join(' ')}
                />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-zinc-500 z-10">
                <span>-30s Timeline</span>
                <span>CNSA 2.0 Category 5 Ultra-Low Latency Cryptographic Ratchet Verified</span>
                <span>T-0 (Now)</span>
              </div>
            </div>
          </div>

          {/* Strategic Strike Package Nodes & SATCOM */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Strategic Strike Package & AEHF SATCOM Mesh Nodes
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Directional LPI Crosslink Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {strikeNodes.map((node) => (
                <div
                  key={node.callsign}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-[11px] truncate">{node.callsign}</span>
                  </div>
                  <div className="text-[10px] text-indigo-300 truncate">{node.role}</div>
                  <div className="text-[11px] text-zinc-400 flex justify-between">
                    <span>{node.distanceNm} nm</span>
                    <span className="text-emerald-400">{node.latencyMs}ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-zinc-800">
                    <span>{node.kemAlgorithm}</span>
                    <span className="text-zinc-400">{node.lastRatchet}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
