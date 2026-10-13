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
} from 'lucide-react';
import {
  F35FlightState,
  F35FlightMode,
  F35PqcSecurityParams,
  F35WeaponSystem,
  F35AvionicsSubsystem,
  F35BusFrame,
  F35RadarTrack,
  F35RadarMode,
  F35KeyNegotiationLatencySample,
  F35FormationNode,
  F35IcpPerformanceMetrics,
} from '../../types/f35Simulator';
import {
  INITIAL_F35_FLIGHT_STATE,
  F35_MAJOR_WEAPONS_SYSTEMS,
  F35_PQC_MODE_PRESETS,
  F35_AVIONICS_SUBSYSTEMS,
  SAMPLE_F35_BUS_FRAMES,
  SAMPLE_F35_RADAR_TRACKS,
  INITIAL_F35_ICP_METRICS,
  INITIAL_F35_LATENCY_HISTORY,
  INITIAL_F35_FORMATION_NODES,
} from '../../data/f35SimulatorData';

interface F35LightningSimulatorTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
}

export const F35LightningSimulatorTab: React.FC<F35LightningSimulatorTabProps> = ({
  onLoadCodeToPipeline,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cockpit' | 'weapons' | 'architecture' | 'code' | 'bus' | 'telemetry'
  >('cockpit');

  // Flight State
  const [flightState, setFlightState] = useState<F35FlightState>(INITIAL_F35_FLIGHT_STATE);
  const [weaponsCatalog, setWeaponsCatalog] = useState<F35WeaponSystem[]>(F35_MAJOR_WEAPONS_SYSTEMS);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<F35WeaponSystem>(F35_MAJOR_WEAPONS_SYSTEMS[0]);
  const [selectedSubsystem, setSelectedSubsystem] = useState<F35AvionicsSubsystem>(F35_AVIONICS_SUBSYSTEMS[0]);
  const [radarTracks, setRadarTracks] = useState<F35RadarTrack[]>(SAMPLE_F35_RADAR_TRACKS);
  const [busFrames, setBusFrames] = useState<F35BusFrame[]>(SAMPLE_F35_BUS_FRAMES);
  const [targetLocked, setTargetLocked] = useState<string | null>('TRK-F35-01');
  const [filterWeaponCategory, setFilterWeaponCategory] = useState<string>('ALL');

  // Telemetry & Metrics State
  const [icpMetrics, setIcpMetrics] = useState<F35IcpPerformanceMetrics>(INITIAL_F35_ICP_METRICS);
  const [latencyHistory, setLatencyHistory] = useState<F35KeyNegotiationLatencySample[]>(
    INITIAL_F35_LATENCY_HISTORY
  );
  const [formationNodes, setFormationNodes] = useState<F35FormationNode[]>(INITIAL_F35_FORMATION_NODES);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [selectedGraphLine, setSelectedGraphLine] = useState<'all' | 'pqc' | 'classical' | 'hardware'>('all');

  // Dynamic PQC Rekey Countdown
  const [rekeyCountdown, setRekeyCountdown] = useState<number>(
    INITIAL_F35_FLIGHT_STATE.pqcSecurity.rekeyIntervalSeconds
  );
  const [isRekeying, setIsRekeying] = useState<boolean>(false);

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
    setTimeout(() => setLastActionNotice(null), 3500);
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

  // Live Telemetry Jitter Simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    const streamInterval = setInterval(() => {
      setIcpMetrics((prev) => ({
        ...prev,
        icp1CpuUtilization: Number((prev.icp1CpuUtilization + (Math.random() * 2.4 - 1.2)).toFixed(1)),
        icp2CpuUtilization: Number((prev.icp2CpuUtilization + (Math.random() * 2.0 - 1.0)).toFixed(1)),
        fibreChannelThroughputGbps: Number((1.84 + Math.random() * 0.12).toFixed(2)),
        opticalBusJitterNs: Number((1.15 + (Math.random() * 0.1 - 0.05)).toFixed(2)),
      }));

      // Latency sample generator
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const baseKEM = flightState.flightMode === 'Stealth' ? 0.042 : flightState.flightMode === 'Combat' ? 0.035 : 0.075;
      const sample: F35KeyNegotiationLatencySample = {
        timestamp: timeStr,
        cycle: Date.now(),
        kemEncapMs: Number((baseKEM + (Math.random() * 0.006 - 0.003)).toFixed(3)),
        kemDecapMs: Number((baseKEM * 1.1 + (Math.random() * 0.006 - 0.003)).toFixed(3)),
        madlRttMs: Number((0.065 + (Math.random() * 0.01 - 0.005)).toFixed(3)),
        totalNegotiationMs: Number((baseKEM * 2.1 + 0.065 + (Math.random() * 0.01)).toFixed(3)),
        classicalEcdhMs: Number((0.285 + (Math.random() * 0.02 - 0.01)).toFixed(3)),
        algorithm: flightState.pqcSecurity.kemAlgorithm.includes('1024') ? 'ML-KEM-1024' : 'ML-KEM-768',
        flightMode: flightState.flightMode,
        jitterMicrosec: Number((4.0 + Math.random() * 1.5).toFixed(1)),
        handshakeStatus: Math.random() > 0.85 ? 'RATCHETED' : 'SUCCESS',
      };

      setLatencyHistory((prev) => [...prev.slice(-14), sample]);
    }, 2000);

    return () => clearInterval(streamInterval);
  }, [isLiveStreaming, flightState.flightMode]);

  // Handle Flight Mode Selection (Stealth, Combat, Training)
  const handleSelectFlightMode = (mode: F35FlightMode) => {
    const params = F35_PQC_MODE_PRESETS[mode];
    setRekeyCountdown(params.rekeyIntervalSeconds);

    let newRadarMode: F35RadarMode = flightState.radarMode;
    let newRcs = 0.00015;
    let notice = '';

    if (mode === 'Stealth') {
      newRadarMode = 'Passive ESM Barracuda';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.032 : flightState.beastModeExternalPylons ? 0.045 : 0.00015;
      notice = 'F-35 VLO STEALTH ENGAGED. EMCON 1 RF SILENCE ACTIVE. PQC PROFILE: FIPS 203 ML-KEM-1024 + ML-DSA-87.';
    } else if (mode === 'Combat') {
      newRadarMode = 'AESA Multi-Mode Search';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.032 : flightState.beastModeExternalPylons ? 0.045 : 0.00015;
      notice = 'F-35 COMBAT STRIKE ENGAGED. HIGH-SPEED MADL MESH ACTIVE. PQC PROFILE: FIPS 203 ML-KEM-768 + ML-DSA-65.';
    } else if (mode === 'Training') {
      newRadarMode = 'High-Res SAR Ground Map';
      newRcs = 0.2200;
      notice = 'F-35 RANGE TRAINING MODE ENGAGED. LUNEBURG RADAR REFLECTORS ACTIVE (RCS 0.22 m²). ACMI TELEMETRY.';
    }

    setFlightState((prev) => ({
      ...prev,
      flightMode: mode,
      pqcSecurity: params,
      radarMode: newRadarMode,
      stealthRcsSqm: newRcs,
      cnsaCryptoStatus: mode === 'Training' ? 'CLASSICAL_RESTRICTED' : 'PQC_HYBRID_ACTIVE',
    }));

    // Inject 1394B / Fibre Channel frame
    const nowStamp = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const newFrame: F35BusFrame = {
      id: `f35-mode-${Date.now()}`,
      timestamp: nowStamp,
      busChannel: 'FC-AV (Fibre Channel)',
      remoteTerminal: 'ICP-Core 1 (CNI Security Enclave)',
      subAddress: 'SA-18 (Mode Ratchet)',
      wordCount: 64,
      hexPayload: mode === 'Stealth' ? '03E8 0005 0400 0001' : mode === 'Combat' ? '0300 0003 0190 0002' : '0200 0001 00C8 0003',
      decodedMeaning: `ICP-Core 1 switched to ${mode.toUpperCase()} PROFILE: ${params.kemAlgorithm}`,
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
          `MADL POST-QUANTUM KEY RATCHET EXECUTED. Ephemeral key refreshed: ${flightState.pqcSecurity.kemAlgorithm}.`
        );
      }
    }, 850);
  };

  // Toggle Weapons Bay Doors
  const handleToggleBayDoors = () => {
    const nextState = flightState.weaponBayDoors === 'CLOSED' ? 'OPEN' : 'CLOSED';
    const baseRcs = flightState.beastModeExternalPylons ? 0.045 : 0.00015;
    const newRcs = nextState === 'OPEN' ? 0.032 : baseRcs;
    setFlightState((prev) => ({
      ...prev,
      weaponBayDoors: nextState,
      stealthRcsSqm: newRcs,
    }));
    triggerNotice(
      nextState === 'OPEN'
        ? 'INTERNAL WEAPONS BAY DOORS OPEN. RADAR CROSS-SECTION BLOOM: 0.032 m².'
        : 'INTERNAL WEAPONS BAY DOORS SEALED. LOW OBSERVABLE RCS 0.00015 m² RESTORED.'
    );
  };

  // Toggle Beast Mode (External Pylons)
  const handleToggleBeastMode = () => {
    const nextBeast = !flightState.beastModeExternalPylons;
    const newRcs = nextBeast ? 0.045 : (flightState.weaponBayDoors === 'OPEN' ? 0.032 : 0.00015);
    setFlightState((prev) => ({
      ...prev,
      beastModeExternalPylons: nextBeast,
      stealthRcsSqm: newRcs,
    }));
    triggerNotice(
      nextBeast
        ? 'BEAST MODE EXTERNAL PYLONS MOUNTED: +4 Wing Hardpoints active (+22,000 lb ordnance capacity). RCS: 0.045 m².'
        : 'BEAST MODE PYLONS JETTISONED / STOWED: Pure VLO Stealth Configuration restored.'
    );
  };

  // Throttle adjustments
  const handleThrottleChange = (newThrottle: number) => {
    const isAb = newThrottle > 85;
    const calculatedMach = Number((0.75 + (newThrottle / 100) * 0.85 + (isAb ? 0.2 : 0)).toFixed(2));
    const calculatedKnots = Math.round(calculatedMach * 575);
    const calculatedG = isAb ? 2.2 : 1.0;

    setFlightState((prev) => ({
      ...prev,
      throttlePercent: newThrottle,
      afterburner: isAb,
      mach: calculatedMach,
      airspeedKnots: calculatedKnots,
      gForce: calculatedG,
    }));
  };

  // Fire Weapon Simulation
  const handleFireWeapon = (weaponIdToFire?: string) => {
    if (!flightState.masterArm) {
      triggerNotice('WARNING: MASTER ARM IS SAFE. SWITCH TO MASTER ARM LIVE BEFORE RELEASE.');
      return;
    }
    if (flightState.weaponBayDoors !== 'OPEN' && !flightState.beastModeExternalPylons) {
      triggerNotice('WARNING: WEAPONS BAY DOORS CLOSED. ACTUATE BAY DOORS BEFORE INTERNAL MUNITION SEPARATION.');
      return;
    }

    const targetWeaponId = weaponIdToFire || flightState.selectedWeaponId;
    const weapon = weaponsCatalog.find((w) => w.id === targetWeaponId);

    if (!weapon || weapon.readyCount <= 0) {
      triggerNotice(`NO ${weapon?.name || 'WEAPON'} REMAINING IN CURRENT INVENTORY.`);
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

    // Update flight state inventory
    setFlightState((prev) => ({
      ...prev,
      weaponsInventory: prev.weaponsInventory.map((item) => {
        if (item.weaponId === targetWeaponId && item.count > 0) {
          const newCnt = item.count - 1;
          return { ...item, count: newCnt, status: newCnt <= 0 ? 'EXPENDED' : 'READY' };
        }
        return item;
      }),
    }));

    triggerNotice(
      `ORDNANCE RELEASE: ${weapon.name.toUpperCase()} LAUNCHED! Guided via ${weapon.guidance.slice(0, 35)}... (PQC Token Verified).`
    );
  };

  // Filter weapons
  const filteredWeapons = filterWeaponCategory === 'ALL'
    ? weaponsCatalog
    : weaponsCatalog.filter((w) => w.category === filterWeaponCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-cyan-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-cyan-400" />
                F-35 Lightning II 5th Gen Multi-Role Strike
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                Lockheed Martin · Northrop Grumman · BAE Systems · P&W F135
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                CNSA 2.0 PQC Hybrid Flight Avionics
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              F-35 Lightning II Avionics Suite & Architecture Simulator
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full-fidelity interactive simulation of the F-35 Lightning II mission computing architecture: <strong className="text-cyan-300">Integrated Core Processor (ICP)</strong>, <strong className="text-emerald-300">AN/APG-81 / APG-85 AESA Radar</strong>, <strong className="text-purple-300">AN/AAQ-37 DAS 360° IR</strong>, <strong className="text-amber-300">AN/ASQ-239 Barracuda EW</strong>, <strong className="text-sky-300">MADL Directional Datalink</strong>, and integrated <strong className="text-rose-300">Major Weapons Systems</strong> with NIST FIPS 203/204 post-quantum arming protocols.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">ICP Mission Status</div>
                <div className="text-sm font-bold font-mono text-cyan-300">CORE 1 & 2 SYNCHRONIZED</div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Low Observable RCS</div>
                <div className="text-sm font-bold font-mono text-emerald-300">
                  {flightState.stealthRcsSqm.toFixed(5)} m² {flightState.stealthRcsSqm < 0.001 ? '(PURE VLO)' : '(BLOOM)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* F-35 Flight Mode Selector: Stealth, Combat, Training */}
        <div className="mt-6 pt-5 border-t border-cyan-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                F-35 Operational Flight Mode Selector
              </span>
              <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">
                (Dynamically updates ICP PQC hybrid parameters & MADL directional link)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">Active Profile:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  flightState.flightMode === 'Stealth'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70'
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
                  ? 'border-cyan-500 bg-cyan-950/40 ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-950/60'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      flightState.flightMode === 'Stealth'
                        ? 'bg-cyan-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>VLO Stealth Mode</span>
                      {flightState.flightMode === 'Stealth' && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400 font-semibold">
                      EMCON 1 · Strict RF Silence
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                  100% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-cyan-300 font-semibold">ML-KEM-1024 (Category 5)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-cyan-300 font-semibold">ML-DSA-87 (CNSA 2.0)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">Passive ESM · 0.00015 m²</span>
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
                      <span>Combat Strike Mode</span>
                      {flightState.flightMode === 'Combat' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-semibold">
                      EMCON 3 · High-Speed MADL
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-700 text-amber-300">
                  99.2% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-amber-300 font-semibold">ML-KEM-768 + X25519</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-amber-300 font-semibold">ML-DSA-65 (Rapid Target)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">AESA Search · 0.00015 m²</span>
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
                      <span>Range Sortie Mode</span>
                      {flightState.flightMode === 'Training' && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-sky-400 font-semibold">
                      EMCON 5 · ACMI Pod Telemetry
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-700 text-sky-300">
                  87.5% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-sky-300 font-semibold">ML-KEM-512 + Range Fallback</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-sky-300 font-semibold">ML-DSA-44 + ECDSA P-256</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">SAR Ground Map · 0.2200 m²</span>
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
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
            <span>Panoramic Display & Glass Cockpit</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-400/30 text-cyan-200">
              PCD Touch
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('weapons')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'weapons'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Bomb className="w-3.5 h-3.5 text-rose-300" />
            <span>Major Weapons Systems (14 Arsenal)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-400/30 text-rose-200">
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'architecture'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>ICP & Avionics Architecture</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Core 1 / Core 2
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-300" />
            <span>C++ & Ada Flight Code</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              DO-178C Level A
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('bus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'bus'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>Fibre Channel & 1394B Bus</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'telemetry'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-300" />
            <span>Mission Telemetry & PQC Latency</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-200">
              Live Graphs
            </span>
          </button>
        </div>
      </div>

      {/* Action Notice Strip */}
      {lastActionNotice && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{lastActionNotice}</span>
          </div>
          <span className="text-[10px] text-zinc-400">TACTICAL BUS CONFIRMED</span>
        </div>
      )}

      {/* SUB-TAB 1: GLASS COCKPIT & PANORAMIC DISPLAY */}
      {activeSubTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Panoramic Cockpit Display (PCD 20x8-inch touch layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Flight Display / HUD Simulator */}
            <div className="lg:col-span-2 p-5 rounded-2xl border border-cyan-500/40 bg-zinc-950 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Panoramic Cockpit Display (PCD) · Primary Flight Vector
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-700 text-emerald-300">
                    HMDS Gen III Active
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                    Auto-Throttle
                  </span>
                </div>
              </div>

              {/* Simulated HUD Glass with Green Tactical Phosphor */}
              <div className="h-72 rounded-xl bg-black border border-cyan-500/30 p-4 font-mono text-cyan-400 flex flex-col justify-between relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-radial-gradient from-cyan-950/20 to-transparent pointer-events-none" />

                {/* Pitch Ladder Simulation */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none opacity-40">
                  <div className="w-48 h-0.5 bg-cyan-400 mb-6" />
                  <div className="w-32 h-0.5 bg-cyan-400/60 mb-6" />
                  <div className="w-48 h-0.5 bg-cyan-400" />
                </div>

                {/* HUD Top Bar */}
                <div className="flex justify-between items-center text-xs relative z-10">
                  <div>
                    <span className="text-zinc-500 mr-2">SPD</span>
                    <strong className="text-emerald-400 text-base">{flightState.airspeedKnots}</strong> KTS
                    <span className="ml-3 text-cyan-300">M {flightState.mach}</span>
                  </div>
                  <div className="text-center font-bold text-sm text-cyan-300">
                    HDG {flightState.heading}° / PITCH {flightState.pitch}°
                  </div>
                  <div>
                    <span className="text-zinc-500 mr-2">ALT</span>
                    <strong className="text-emerald-400 text-base">{flightState.altitudeFeet.toLocaleString()}</strong> FT
                  </div>
                </div>

                {/* Center Bore Sight Reticle */}
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="w-16 h-16 rounded-full border border-dashed border-cyan-400 flex items-center justify-center animate-spin-slow">
                    <div className="w-2 h-2 rounded-full bg-cyan-300" />
                  </div>
                  <div className="text-[10px] text-cyan-300 mt-2 font-bold tracking-wider">
                    {targetLocked ? `AIM-120D LOCK: ${targetLocked}` : 'SCANNING FOR TARGET'}
                  </div>
                </div>

                {/* HUD Bottom Bar */}
                <div className="flex justify-between items-end text-xs relative z-10 border-t border-cyan-500/20 pt-2">
                  <div className="space-y-0.5 text-[11px]">
                    <div>G-LOAD: <strong className="text-white">{flightState.gForce}G</strong> · AOA: {flightState.aoaDegrees}°</div>
                    <div>RADAR: <strong className="text-emerald-300">{flightState.radarMode}</strong></div>
                  </div>
                  <div className="text-right space-y-0.5 text-[11px]">
                    <div>BAY DOORS: <strong className={flightState.weaponBayDoors === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'}>{flightState.weaponBayDoors}</strong></div>
                    <div>PQC CRYPTO: <strong className="text-cyan-300">{flightState.cnsaCryptoStatus}</strong></div>
                  </div>
                </div>
              </div>

              {/* Flight Controls Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">THROTTLE (% MIL)</div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={flightState.throttlePercent}
                    onChange={(e) => handleThrottleChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">{flightState.throttlePercent}%</span>
                    <span className={flightState.afterburner ? 'text-amber-400 font-bold' : 'text-cyan-400'}>
                      {flightState.afterburner ? 'AFTERBURNER' : 'MIL POWER'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">WEAPONS BAY DOORS</div>
                  <button
                    onClick={handleToggleBayDoors}
                    className={`w-full py-1.5 px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      flightState.weaponBayDoors === 'OPEN'
                        ? 'bg-rose-500 text-black hover:bg-rose-400'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {flightState.weaponBayDoors === 'OPEN' ? 'CLOSE DOORS' : 'OPEN DOORS'}
                  </button>
                  <div className="text-[10px] font-mono text-zinc-500 text-center">
                    RCS: {flightState.stealthRcsSqm.toFixed(4)} m²
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400">BEAST MODE PYLONS</div>
                  <button
                    onClick={handleToggleBeastMode}
                    className={`w-full py-1.5 px-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      flightState.beastModeExternalPylons
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    {flightState.beastModeExternalPylons ? 'EXTERNAL ACTIVE' : 'INTERNAL ONLY'}
                  </button>
                  <div className="text-[10px] font-mono text-zinc-500 text-center">
                    +22k lb Hardpoints
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
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400'
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

            {/* Tactical Situation Display (TSD) / Radar Contacts */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Tactical Situation Display (TSD)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    APG-81 / DAS
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="text-[11px] font-mono text-zinc-400 flex justify-between">
                    <span>TRACK IDENTIFIER</span>
                    <span>BEARING / RNG</span>
                  </div>

                  {radarTracks.map((trk) => (
                    <div
                      key={trk.id}
                      onClick={() => {
                        setTargetLocked(trk.id);
                        triggerNotice(`TARGET ACQUIRED: ${trk.callsign} locked on APG-81 AESA.`);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        targetLocked === trk.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500/70'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              trk.iffStatus === 'HOSTILE' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          {trk.callsign}
                        </span>
                        <span className="text-zinc-400">
                          {trk.bearing.toString().padStart(3, '0')}° / {trk.rangeNm} nm
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
                        <span>{trk.sensorSource}</span>
                        <span className={trk.lockStatus === 'LPI_LOCKED' ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
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
                  <Reticle className="w-4 h-4" />
                  <span>FIRE SELECTED ORDNANCE (FOX THREE)</span>
                </button>
                <div className="text-[10px] font-mono text-zinc-500 text-center">
                  Target: {targetLocked ? targetLocked : 'BORESIGHT'} · Weapon: {weaponsCatalog.find(w => w.id === flightState.selectedWeaponId)?.name || 'AIM-120D'}
                </div>
              </div>
            </div>
          </div>

          {/* Live PQC Dynamic Parameters Status Dashboard */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-zinc-950 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Active F-35 PQC Hybrid Security & Rekey Ratchet Parameters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">Auto Rekey in:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
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
                <div className="text-[10px] text-zinc-500">KEM ALGORITHM (LATTICE)</div>
                <div className="text-cyan-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.kemAlgorithm}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">SIGNATURE ALGORITHM</div>
                <div className="text-emerald-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.signatureAlgorithm}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">MADL DATALINK RATIO</div>
                <div className="text-amber-300 font-bold truncate mt-0.5">{flightState.pqcSecurity.madlEncryptionMode}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">QUANTUM RESISTANCE SCORE</div>
                <div className="text-purple-300 font-bold mt-0.5">{flightState.pqcSecurity.quantumResistanceScore}% FIPS CERTIFIED</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MAJOR WEAPONS SYSTEMS INTEGRATION (14 ARSENAL) */}
      {activeSubTab === 'weapons' && (
        <div className="space-y-6">
          {/* Weapons Management Header */}
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-zinc-950 to-rose-950/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bomb className="w-5 h-5 text-rose-400" />
                  Major Weapons Systems Integration List & Arming Suite
                </h3>
                <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed mt-0.5">
                  Complete inventory of 14 major air-to-air, standoff precision strike, anti-radiation, nuclear, hypersonic, and gun systems integrated into the F-35 Lightning II with NIST FIPS 203/204 cryptographic release protocols.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {['ALL', 'Air-to-Air', 'Air-to-Surface', 'Nuclear', 'Anti-Radiation', 'Hypersonic', 'Internal Gun'].map((cat) => (
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

            {/* Internal vs External Loadout Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">LEFT INTERNAL BAY</span>
                <div className="text-white font-bold mt-0.5">2x AIM-120D + 4x GBU-53/B SDB II</div>
                <div className="text-[10px] text-emerald-400">Sealed Low Observable</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">RIGHT INTERNAL BAY</span>
                <div className="text-white font-bold mt-0.5">2x AIM-260 JATM + 1x GBU-31 JDAM</div>
                <div className="text-[10px] text-emerald-400">Sealed Low Observable</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">INTERNAL GUN (F-35A)</span>
                <div className="text-white font-bold mt-0.5">GAU-22/A 25mm Equalizer</div>
                <div className="text-[10px] text-cyan-400">182 Rounds Ready</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">BEAST MODE WING PYLONS</span>
                <div className="text-white font-bold mt-0.5">
                  {flightState.beastModeExternalPylons ? '4x Hardpoints Armed (+22k lb)' : 'Stowed (VLO Stealth Clean)'}
                </div>
                <div className={flightState.beastModeExternalPylons ? 'text-amber-400' : 'text-zinc-500'}>
                  {flightState.beastModeExternalPylons ? 'RCS: 0.045 m²' : 'RCS: 0.00015 m²'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Weapons Grid & Detailed Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Weapons List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex justify-between items-center px-1">
                <span>Select Munition to Inspect / Arm ({filteredWeapons.length} Systems)</span>
                <span className="text-[10px] text-zinc-500">Universal Armament Interface (UAI)</span>
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
                          ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/70 shadow-lg'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                            {wpn.name}
                          </span>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {wpn.rangeKm}
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                            wpn.category === 'Air-to-Air'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : wpn.category === 'Air-to-Surface'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : wpn.category === 'Nuclear'
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : wpn.category === 'Hypersonic'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
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
                  <Package className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Munition Dossier & Bus Specs
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {selectedWeaponDetail.defaultBay}
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">WEAPON IDENTIFIER</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedWeaponDetail.name}</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Tactical Parameters</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Guidance:</span>
                      <span className="text-zinc-200 text-right max-w-[200px] truncate">{selectedWeaponDetail.guidance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Max Range:</span>
                      <span className="text-emerald-400 font-bold">{selectedWeaponDetail.rangeKm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Warhead:</span>
                      <span className="text-zinc-300">{selectedWeaponDetail.warhead}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Weight:</span>
                      <span className="text-zinc-300">{selectedWeaponDetail.weightKg} kg ({Math.round(selectedWeaponDetail.weightKg * 2.204)} lb)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Max Internal:</span>
                      <span className="text-cyan-400 font-bold">{selectedWeaponDetail.maxCarriedInternal} carried</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Bus Interface & PQC Arming</div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Bus Protocol: </span>
                    {selectedWeaponDetail.busInterface}
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="text-zinc-500">Arming Crypto: </span>
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
                  <Reticle className="w-4 h-4" />
                  <span>ARM & RELEASE ({selectedWeaponDetail.readyCount} READY)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AVIONICS & ICP ARCHITECTURE */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  F-35 Integrated Core Processor (ICP) & Subsystems Architecture
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                DO-178C Level A Safety Isolation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {F35_AVIONICS_SUBSYSTEMS.map((sub) => {
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
                      <div>Domain: <span className="text-cyan-300">{sub.icpDomain}</span></div>
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
                  F-35 Safety-Critical Avionics Code ({selectedSubsystem.sourceFile})
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
                  Fibre Channel (FC-AV) & IEEE-1394B FireWire Frame Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                PQC Signature Tagged
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
                    <span className="text-cyan-400 font-semibold">{frm.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: MISSION TELEMETRY & PQC LATENCY */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">ICP 1 CPU Utilization</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{icpMetrics.icp1CpuUtilization}%</div>
              <div className="text-[10px] text-zinc-400">DO-178C Level A Safety</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Fibre Channel Bandwidth</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{icpMetrics.fibreChannelThroughputGbps} Gbps</div>
              <div className="text-[10px] text-zinc-400">FC-AV Real-Time Video</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Hardware TRNG Entropy</div>
              <div className="text-xl font-bold text-purple-400 mt-1">{icpMetrics.trngEntropyRateGbps} Gbps</div>
              <div className="text-[10px] text-zinc-400">FIPS 140-3 Level 4 TRNG</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">Optical Bus Jitter</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{icpMetrics.opticalBusJitterNs} ns</div>
              <div className="text-[10px] text-zinc-400">Microsecond Deterministic</div>
            </div>
          </div>

          {/* SVG Latency Graph */}
          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Real-Time PQC Key Negotiation Latency (KEM vs Classical)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  Streaming 500ms Cycle
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="h-64 w-full bg-black rounded-xl border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Radar className="w-48 h-48 text-cyan-500" />
              </div>

              {/* Chart Legend */}
              <div className="flex justify-end gap-4 text-[10px] font-mono z-10">
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> ML-KEM-1024 ({latencyHistory[latencyHistory.length - 1]?.totalNegotiationMs}ms)
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-rose-400 inline-block" /> Classical ECDH ({latencyHistory[latencyHistory.length - 1]?.classicalEcdhMs}ms)
                </span>
              </div>

              {/* SVG Curve */}
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

                {/* PQC Total Line (Cyan) */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  points={latencyHistory
                    .map((d, i) => `${(i / (latencyHistory.length - 1 || 1)) * 600},${120 - d.totalNegotiationMs * 300}`)
                    .join(' ')}
                />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-zinc-500 z-10">
                <span>-30s Timeline</span>
                <span>Sub-Millisecond Cryptographic Quantum Resistance Ratchet Verified</span>
                <span>T-0 (Now)</span>
              </div>
            </div>
          </div>

          {/* 4-Ship Lightning Flight & CCA Loyal Wingman Formation Mesh */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  MADL 4-Ship Lightning Flight & CCA Loyal Wingman Formation
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                LPI Narrow-Beam Mesh Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {formationNodes.map((node) => (
                <div
                  key={node.callsign}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{node.callsign}</span>
                    <span className="text-[10px] text-cyan-400">{node.role}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex justify-between">
                    <span>Range: {node.distanceNm} nm</span>
                    <span className="text-emerald-400">{node.latencyMs}ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-zinc-800">
                    <span>{node.kemAlgorithm}</span>
                    <span className="text-zinc-400">Ratchet: {node.lastRatchet}</span>
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
