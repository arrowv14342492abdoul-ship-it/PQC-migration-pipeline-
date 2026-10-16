import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Gauge,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  ShieldAlert,
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
  Network,
  Route,
} from 'lucide-react';
import {
  F22FlightState,
  F22FlightMode,
  F22PqcSecurityParams,
  F22AvionicsSubsystem,
  MilStd1553Frame,
  F22RadarTrack,
  RadarMode,
  KeyNegotiationLatencySample,
  MultiShipFormationNode,
  CIPPerformanceMetrics,
} from '../../types/f22Simulator';
import {
  INITIAL_F22_FLIGHT_STATE,
  F22_AVIONICS_SUBSYSTEMS,
  F22_PQC_MODE_PRESETS,
  SAMPLE_MIL_1553_FRAMES,
  SAMPLE_RADAR_TRACKS,
  INITIAL_CIP_METRICS,
  INITIAL_LATENCY_HISTORY,
  INITIAL_FORMATION_NODES,
} from '../../data/f22SimulatorData';
import { F22AvionicsD3Map } from './F22AvionicsD3Map';
import { F22AvionicsStatusWidget } from './F22AvionicsStatusWidget';
import { F22AvionicsForceGraph } from './F22AvionicsForceGraph';
import { F22AvionicsCommunicationPathsGraph } from './F22AvionicsCommunicationPathsGraph';
import { F22PqcPerformanceDashboard } from './F22PqcPerformanceDashboard';
import {
  F22ElectronicAttackHardening,
  HardeningArchitectureConfig,
} from './F22ElectronicAttackHardening';
import { CbomItem } from '../../types/pqc';
import { DefenseHoneypot } from '../defense/DefenseHoneypot';
import { HoneypotSecurityLog } from '../../types/defenseHoneypot';
import { subscribeToF22HoneypotTelemetry } from '../../utils/defenseHoneypotLogger';

interface F22RaptorSimulatorTabProps {
  onLoadCodeToPipeline?: (code: string) => void;
  cbomItems?: CbomItem[];
}

export const F22RaptorSimulatorTab: React.FC<F22RaptorSimulatorTabProps> = ({
  onLoadCodeToPipeline,
  cbomItems = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'cockpit' | 'architecture' | 'avionics-status' | 'perf-dashboard' | 'ea-hardening' | 'code' | 'bus' | 'telemetry' | 'defense-honeypot'
  >('ea-hardening');
  const [architectureGraphView, setArchitectureGraphView] = useState<'paths' | 'force' | 'tiered'>('paths');

  // F-35 Breach & Electronic Attack Mitigation State
  const [isElectronicAttackActive, setIsElectronicAttackActive] = useState<boolean>(true);
  const [hardeningConfig, setHardeningConfig] = useState<HardeningArchitectureConfig>({
    pqcBusGuardian: true,
    hudAttestedPipeline: true,
    vmsInertialCrossCheck: true,
    f35DataDiodeQuarantine: true,
    cnsa2RekeyRatchet: true,
  });

  // Flight State
  const [flightState, setFlightState] = useState<F22FlightState>(INITIAL_F22_FLIGHT_STATE);
  const [selectedSubsystem, setSelectedSubsystem] = useState<F22AvionicsSubsystem>(
    F22_AVIONICS_SUBSYSTEMS[0]
  );
  const [radarTracks, setRadarTracks] = useState<F22RadarTrack[]>(SAMPLE_RADAR_TRACKS);
  const [busFrames, setBusFrames] = useState<MilStd1553Frame[]>(SAMPLE_MIL_1553_FRAMES);
  const [targetLocked, setTargetLocked] = useState<string | null>('TRK-01');

  // Mission Telemetry & Latency Metrics State
  const [cipMetrics, setCipMetrics] = useState<CIPPerformanceMetrics>(INITIAL_CIP_METRICS);
  const [latencyHistory, setLatencyHistory] = useState<KeyNegotiationLatencySample[]>(
    INITIAL_LATENCY_HISTORY
  );
  const [formationNodes, setFormationNodes] = useState<MultiShipFormationNode[]>(
    INITIAL_FORMATION_NODES
  );
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [formationDistance, setFormationDistance] = useState<number>(15.0);
  const [selectedGraphLine, setSelectedGraphLine] = useState<
    'all' | 'pqc' | 'classical' | 'hardware'
  >('all');
  const [inspectedSample, setInspectedSample] = useState<KeyNegotiationLatencySample | null>(
    INITIAL_LATENCY_HISTORY[INITIAL_LATENCY_HISTORY.length - 1]
  );

  // Dynamic PQC Rekey Countdown
  const [rekeyCountdown, setRekeyCountdown] = useState<number>(
    INITIAL_F22_FLIGHT_STATE.pqcSecurity.rekeyIntervalSeconds
  );
  const [isRekeying, setIsRekeying] = useState<boolean>(false);

  // Action status feedback
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

  // Live Rekey Ratchet Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setRekeyCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automatic ratchet
          handleForceRekey(false);
          return flightState.pqcSecurity.rekeyIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flightState.flightMode, flightState.pqcSecurity.rekeyIntervalSeconds]);

  // Subscribe to real-time Defense Honeypot alerts & feed into F-22 Avionics Telemetry
  useEffect(() => {
    const unsubscribe = subscribeToF22HoneypotTelemetry((log) => {
      // 1. Update CIP metrics
      setCipMetrics((prev) => ({
        ...prev,
        cip1CpuUtilization: Math.min(
          99.0,
          Number((prev.cip1CpuUtilization + log.f22AvionicsTelemetryInjected.cip1CpuDeltaPercent).toFixed(1))
        ),
        trngEntropyRateGbps: Number(
          (prev.trngEntropyRateGbps + log.f22AvionicsTelemetryInjected.trngEntropyDrawGbps).toFixed(2)
        ),
        fibreChannelThroughputMbps: Number((prev.fibreChannelThroughputMbps + 14.5).toFixed(1)),
      }));

      // 2. Inject bus frame into 1553 bus frames
      const newBusFrame: MilStd1553Frame = {
        id: `bus-hp-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        busChannel: log.f22AvionicsTelemetryInjected.busChannelAlert,
        remoteTerminal: `RT-${log.endpointPort}`,
        subAddress: 'SA-18 (HONEYPOT)',
        wordCount: 32,
        hexPayload: '08C4 FA09 1198 5164',
        decodedMeaning: log.f22AvionicsTelemetryInjected.hudWarningMessage,
        status: 'PQC_ENCRYPTED',
      };
      setBusFrames((prev) => [newBusFrame, ...prev.slice(0, 19)]);

      // 3. Inject latency sample into latencyHistory
      const newLatencySample: KeyNegotiationLatencySample = {
        timestamp: new Date().toTimeString().split(' ')[0],
        cycle: (latencyHistory[latencyHistory.length - 1]?.cycle || 0) + 1,
        kemEncapMs: 0.054,
        kemDecapMs: 0.062,
        ifdlRttMs: 0.039,
        totalNegotiationMs: 0.155,
        classicalEcdhMs: 0.071,
        algorithm: log.simulatedHandshake.negotiatedKem,
        flightMode: flightState.flightMode,
        jitterMicrosec: 3.4,
        handshakeStatus: 'RATCHETED',
      };
      setLatencyHistory((prev) => [...prev.slice(-19), newLatencySample]);

      // 4. Trigger HUD notice
      triggerNotice(log.f22AvionicsTelemetryInjected.hudWarningMessage);
    });

    return () => unsubscribe();
  }, [flightState.flightMode, latencyHistory]);

  // Live Mission Telemetry Streaming Loop (50 Hz CIP Simulation)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const streamInterval = setInterval(() => {
      // 1. Slightly fluctuate CIP hardware metrics
      setCipMetrics((prev) => ({
        ...prev,
        cip1CpuUtilization: Number((47.0 + Math.random() * 5.0).toFixed(1)),
        cip2CpuUtilization: Number((50.5 + Math.random() * 4.5).toFixed(1)),
        fibreChannelThroughputMbps: Number((308.0 + Math.random() * 12.0).toFixed(1)),
        mil1553WordsPerSec: Math.round(18200 + Math.random() * 600),
        cryptoCoreTempC: Number((41.0 + Math.random() * 0.8).toFixed(1)),
        trngEntropyRateGbps: Number((2.42 + Math.random() * 0.08).toFixed(2)),
        opticalBusJitterNs: Number((1.5 + Math.random() * 0.6).toFixed(1)),
      }));

      // 2. Generate new latency point calibrated to current flight mode
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      let baseEncap = 0.045;
      let baseDecap = 0.052;
      let baseRtt = 0.021;
      let algo = 'ML-KEM-1024';

      if (flightState.flightMode === 'Combat') {
        baseEncap = 0.028;
        baseDecap = 0.033;
        baseRtt = 0.019;
        algo = 'ML-KEM-768';
      } else if (flightState.flightMode === 'Training') {
        baseEncap = 0.018;
        baseDecap = 0.021;
        baseRtt = 0.310;
        algo = 'ML-KEM-512';
      }

      const distFactor = (formationDistance / 15.0) * 0.003;
      const jitter = (Math.random() - 0.5) * 0.005;
      const encapMs = Number((baseEncap + (Math.random() - 0.5) * 0.004).toFixed(3));
      const decapMs = Number((baseDecap + (Math.random() - 0.5) * 0.004).toFixed(3));
      const rttMs = Number((baseRtt + distFactor + jitter).toFixed(3));
      const totalMs = Number((encapMs + decapMs + rttMs).toFixed(3));
      const classicalMs = Number((0.063 + (Math.random() - 0.5) * 0.004).toFixed(3));

      setLatencyHistory((prev) => {
        const nextCycle = (prev[prev.length - 1]?.cycle || 0) + 1;
        const newSample: KeyNegotiationLatencySample = {
          timestamp: timeStr,
          cycle: nextCycle,
          kemEncapMs: encapMs,
          kemDecapMs: decapMs,
          ifdlRttMs: rttMs,
          totalNegotiationMs: totalMs,
          classicalEcdhMs: classicalMs,
          algorithm: algo,
          flightMode: flightState.flightMode,
          jitterMicrosec: Number((Math.random() * 1.4 + 0.5).toFixed(1)),
          handshakeStatus: nextCycle % 5 === 0 ? 'RATCHETED' : 'SUCCESS',
        };
        const updated = [...prev.slice(-19), newSample];
        return updated;
      });

      // 3. Update formation nodes timing and distance
      setFormationNodes((prev) =>
        prev.map((node) => {
          if (node.role === 'Flight Lead') return node;
          const adjustedDist = Number((node.distanceNm * (formationDistance / 15.0)).toFixed(1));
          const adjustedLat = Number((0.08 + (adjustedDist / 100) * 0.05 + Math.random() * 0.004).toFixed(3));
          return {
            ...node,
            distanceNm: adjustedDist,
            latencyMs: adjustedLat,
            lastRatchet: `${(Math.random() * 1.8 + 0.3).toFixed(1)}s ago`,
          };
        })
      );
    }, 2500);

    return () => clearInterval(streamInterval);
  }, [isLiveStreaming, flightState.flightMode, formationDistance]);

  // Handle Flight Mode Selection (Stealth, Combat, Training)
  const handleSelectFlightMode = (mode: F22FlightMode) => {
    const params = F22_PQC_MODE_PRESETS[mode];
    setRekeyCountdown(params.rekeyIntervalSeconds);

    let newRadarMode: RadarMode = flightState.radarMode;
    let newRcs = 0.0001;
    let notice = '';

    if (mode === 'Stealth') {
      newRadarMode = 'Passive Silent';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.024 : 0.0001;
      notice = 'STEALTH MODE ENGAGED. EMCON 1 RF SILENCE ACTIVE. PQC PROFILE: FIPS 203 ML-KEM-1024 + ML-DSA-87.';
    } else if (mode === 'Combat') {
      newRadarMode = 'Track-While-Scan';
      newRcs = flightState.weaponBayDoors === 'OPEN' ? 0.024 : 0.0001;
      notice = 'COMBAT MODE ENGAGED. TACTICAL MESH ACTIVE. PQC PROFILE: FIPS 203 ML-KEM-768 + ML-DSA-65.';
    } else if (mode === 'Training') {
      newRadarMode = 'SAR Ground Map';
      newRcs = 0.1500; // Simulated Luneburg Lens Reflectors deployed for range safety tracking
      notice = 'TRAINING MODE ENGAGED. LUNEBURG REFLECTORS DEPLOYED (RCS 0.15 m²). PQC PROFILE: ML-KEM-512 + ACMI TELEMETRY.';
    }

    setFlightState((prev) => ({
      ...prev,
      flightMode: mode,
      pqcSecurity: params,
      radarMode: newRadarMode,
      stealthRcsSqm: newRcs,
      cnsaCryptoStatus: mode === 'Training' ? 'CLASSICAL_RESTRICTED' : 'PQC_HYBRID_ACTIVE',
    }));

    // Inject dynamic 1553 frames capturing mode transition
    const nowStamp =
      new Date().toTimeString().split(' ')[0] +
      '.' +
      Math.floor(Math.random() * 900 + 100);
    const modeFrames: MilStd1553Frame[] = [
      {
        id: `frm-mode-${Date.now()}-1`,
        timestamp: nowStamp,
        busChannel: 'FC-OPTICAL-1',
        remoteTerminal: 'CIP-1 (CNI Security Enclave)',
        subAddress: 'SA-18 (PQC Mode Transition)',
        wordCount: 64,
        hexPayload:
          mode === 'Stealth'
            ? '03E8 0005 0400 0001'
            : mode === 'Combat'
            ? '0300 0003 0190 0002'
            : '0200 0001 00C8 0003',
        decodedMeaning: `CIP-1 Switched to ${mode.toUpperCase()} PROFILE: ${params.kemAlgorithm} (${params.securityLevel})`,
        status: 'PQC_ENCRYPTED',
      },
      {
        id: `frm-mode-${Date.now()}-2`,
        timestamp: nowStamp,
        busChannel: 'CH-B (MIL-1553B)',
        remoteTerminal: 'RT-08 (IFDL Datalink)',
        subAddress: 'SA-11 (Lattice Ratchet Key)',
        wordCount: 32,
        hexPayload: `${params.emconLevel.slice(0, 7)} SESSION RATIFIED`,
        decodedMeaning: `IFDL Link Status: ${params.ifdlEncryptionMode} (Rekey every ${params.rekeyIntervalSeconds}s)`,
        status: 'VALID',
      },
      ...busFrames.slice(0, 6),
    ];
    setBusFrames(modeFrames);

    triggerNotice(notice);
  };

  // Manual or Scheduled Force Rekey Ratchet
  const handleForceRekey = (manual = true) => {
    setIsRekeying(true);
    setFlightState((prev) => ({
      ...prev,
      cnsaCryptoStatus: 'REKEYING',
    }));

    setTimeout(() => {
      setIsRekeying(false);
      setRekeyCountdown(flightState.pqcSecurity.rekeyIntervalSeconds);
      setFlightState((prev) => ({
        ...prev,
        cnsaCryptoStatus:
          prev.flightMode === 'Training'
            ? 'CLASSICAL_RESTRICTED'
            : 'PQC_HYBRID_ACTIVE',
      }));

      // Inject fresh rekey bus telemetry
      const nowStamp =
        new Date().toTimeString().split(' ')[0] +
        '.' +
        Math.floor(Math.random() * 900 + 100);
      const rekeyFrame: MilStd1553Frame = {
        id: `frm-rekey-${Date.now()}`,
        timestamp: nowStamp,
        busChannel: 'CH-B (MIL-1553B)',
        remoteTerminal: 'RT-08 (CNI Key Vault)',
        subAddress: 'SA-11 (Ratchet Ephemeral Nonce)',
        wordCount: 32,
        hexPayload: `${flightState.pqcSecurity.kemAlgorithm.slice(0, 15)} NONCE RATCHET`,
        decodedMeaning: `Periodic Ephemeral Rekeying Success: Zero RF leak verified on ${flightState.pqcSecurity.hsmCryptoCore}`,
        status: 'PQC_ENCRYPTED',
      };
      setBusFrames((prev) => [rekeyFrame, ...prev.slice(0, 7)]);

      if (manual) {
        triggerNotice(
          `EPHEMERAL PQC RATCHET COMPLETED (${flightState.pqcSecurity.kemAlgorithm}). NEW LATTICE SHARED SECRET ESTABLISHED.`
        );
      }
    }, 400);
  };

  // Generate Ada 95 mission code for the active flight mode
  const generateFlightModeCode = (
    mode: F22FlightMode,
    pqc: F22PqcSecurityParams
  ): string => {
    return `-- =========================================================================
-- F-22 RAPTOR AVIONICS COMMON INTEGRATED PROCESSOR (CIP 1 / CIP 2)
-- FLIGHT MODE MISSION CRYPTOGRAPHY PACKAGE: ${mode.toUpperCase()} MODE
-- STANDARD: DO-178C Level A Safety-Critical | CNSA 2.0 PQC Compliance
-- AIRFRAME IDENT: F-22A BLOCK 35 / AIMS 03-1000 LEVEL 4
-- =========================================================================

with System;
with F22_Types; use F22_Types;
with NIST_FIPS_203_ML_KEM;
with NIST_FIPS_204_ML_DSA;

package body F22_${mode}_Flight_Crypto is

   -- Active Flight Profile: ${pqc.profileName}
   -- Operational Security Level: ${pqc.securityLevel}
   -- RF Emission Constraint: ${pqc.emconLevel}
   -- Intra-Flight Data Link: ${pqc.ifdlEncryptionMode}
   -- Active Hardware Enclave: ${pqc.hsmCryptoCore}

   type Key_Schedule_State is (LOCKED, SYNCHRONIZED, REKEYING, DEGRADED);
   Current_State : Key_Schedule_State := SYNCHRONIZED;

   -- Ephemeral Ratchet Parameters
   REKEY_INTERVAL_SEC        : constant Positive := ${pqc.rekeyIntervalSeconds};
   QUANTUM_RESISTANCE_TARGET : constant Natural := ${Math.round(pqc.quantumResistanceScore)};
   BURST_LATENCY_MAX_MS      : constant Float := ${pqc.burstLatencyMs};

   -- Active Cryptographic Algorithms
   KEM_ALGORITHM_IDENTIFIER : constant String := "${pqc.kemAlgorithm}";
   DSA_ALGORITHM_IDENTIFIER : constant String := "${pqc.signatureAlgorithm}";
   CIPHERSUITE_IDENTIFIER   : constant String := "${pqc.activeCiphersuite}";
   ENTROPY_SOURCE           : constant String := "${pqc.ephemeralEntropySource}";

   procedure Execute_50Hz_Cyclic_Crypto_Update (
      Frame_Counter  : in  Word32;
      Entropy_Seed   : in  Byte_Array_32;
      Out_Ciphertext : out ML_KEM_Ciphertext;
      Status_Out     : out Return_Code
   ) is
   begin
      -- FIPS 203 Lattice Key Encapsulation Mechanism
      NIST_FIPS_203_ML_KEM.Encapsulate_Secret(
         Public_Key    => CIP_Hardware_Keyring.Get_Wingman_Lattice_Key,
         Shared_Secret => Session_Ratchet_Secret,
         Ciphertext    => Out_Ciphertext,
         Entropy_Pool  => Entropy_Seed
      );

      -- FIPS 204 Lattice Digital Signature on Telemetry
      NIST_FIPS_204_ML_DSA.Sign_Telemetry_Frame(
         Payload       => Telemetry_Payload_Buffer,
         Priv_Key      => CIP_Hardware_Keyring.Get_Airframe_Signing_Key,
         Signature_Out => Frame_Signature
      );

      Status_Out := SUCCESS;
   end Execute_50Hz_Cyclic_Crypto_Update;

end F22_${mode}_Flight_Crypto;`;
  };

  // Throttle Change Handler
  const handleThrottleChange = (newThrottle: number) => {
    const isAb = newThrottle > 85;
    const isSupercruise = newThrottle >= 75 && newThrottle <= 85;
    const calculatedMach = Number(
      (0.85 + (newThrottle / 100) * 1.4 + (isAb ? 0.35 : 0)).toFixed(2)
    );
    const calculatedKnots = Math.round(calculatedMach * 580);
    const calculatedG = isAb ? 2.4 : 1.0;

    setFlightState((prev) => ({
      ...prev,
      throttlePercent: newThrottle,
      afterburner: isAb,
      supercruise: isSupercruise,
      mach: calculatedMach,
      airspeedKnots: calculatedKnots,
      gForce: calculatedG,
    }));
  };

  // Toggle Weapons Bay Doors
  const handleToggleBayDoors = () => {
    const nextState = flightState.weaponBayDoors === 'CLOSED' ? 'OPEN' : 'CLOSED';
    const newRcs = nextState === 'OPEN' ? 0.024 : 0.0001; // Stealth degraded when open
    setFlightState((prev) => ({
      ...prev,
      weaponBayDoors: nextState,
      stealthRcsSqm: newRcs,
    }));
    triggerNotice(
      nextState === 'OPEN'
        ? 'MAIN WEAPONS BAY DOORS OPEN. RCS BLOOM ACTIVE (+24 dBsm).'
        : 'MAIN WEAPONS BAY DOORS SEALED. STEALTH RCS 0.0001 m² RESTORED.'
    );
  };

  // Fire Weapon Simulation
  const handleFireWeapon = () => {
    if (!flightState.masterArm) {
      triggerNotice('WARNING: MASTER ARM IS SAFE. UNABLE TO RELEASE ORDNANCE.');
      return;
    }
    if (flightState.weaponBayDoors !== 'OPEN') {
      triggerNotice('WARNING: WEAPONS BAY DOORS CLOSED. OPEN DOORS BEFORE RELEASE.');
      return;
    }

    const inventory = [...flightState.weaponsInventory];
    const amraamIdx = inventory.findIndex(
      (w) => w.name.includes('AMRAAM') && w.count > 0
    );

    if (amraamIdx !== -1) {
      inventory[amraamIdx].count -= 1;
      if (inventory[amraamIdx].count === 0) {
        inventory[amraamIdx].status = 'EXPENDED';
      }
      setFlightState((prev) => ({
        ...prev,
        weaponsInventory: inventory,
      }));
      triggerNotice(
        `FOX THREE! AIM-120D AMRAAM RELEASED. TARGET: ${
          targetLocked ? 'BANDIT-01 (Su-57)' : 'LEAD TRACK'
        } (PQC DATALINK ACTIVE).`
      );
    } else {
      triggerNotice('NO AMRAAM REMAINING IN INTERNAL BAYS.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Plane className="w-3 h-3 text-emerald-400" />
                F-22 Raptor 5th Gen Air Dominance Suite
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                Lockheed Martin · Boeing · P&W F119
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                CNSA 2.0 PQC Hybrid Flight Avionics
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              F-22 Raptor Avionics Suite & Architecture Simulator
            </h2>
            <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Full-fidelity interactive simulation of the F-22 Raptor software stack, including the <strong className="text-emerald-300">Common Integrated Processor (CIP 1 & CIP 2)</strong>, <strong className="text-cyan-300">AN/APG-77 AESA Radar</strong>, <strong className="text-purple-300">AN/ALR-94 Electronic Warfare</strong>, <strong className="text-amber-300">Intra-Flight Data Link (IFDL)</strong> with NIST FIPS 203 post-quantum encryption, and quadruplex 2D thrust-vectoring flight control laws.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('ea-hardening')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left group ${
                isElectronicAttackActive
                  ? 'border-rose-500/60 bg-rose-950/40 hover:bg-rose-900/50'
                  : 'border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900/90'
              }`}
              title="F-35 Breach & Electronic Attack Mitigation Hardening Suite"
            >
              <Shield className={`w-4 h-4 group-hover:scale-110 transition-transform ${isElectronicAttackActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                  <span>EA Threat Defense</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isElectronicAttackActive ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                </div>
                <div className={`text-sm font-bold font-mono ${isElectronicAttackActive ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {isElectronicAttackActive ? 'ATTACK DEFENSE · ACTIVE' : 'SYSTEM HARDENED'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('perf-dashboard')}
              className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-950/80 flex items-center gap-3 hover:border-cyan-400 hover:bg-zinc-900/90 transition-all cursor-pointer text-left group"
              title="View PQC Performance Dashboard (ML-KEM-768 Latency Overhead vs Classical)"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                  <span>ML-KEM-768 Overhead</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  PERF DASHBOARD · D3
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('avionics-status')}
              className="p-3.5 rounded-xl border border-emerald-500/30 bg-zinc-950/80 flex items-center gap-3 hover:border-emerald-400 hover:bg-zinc-900/90 transition-all cursor-pointer text-left group"
              title="View Live Avionics Status & FIPS 203/204 Key Negotiation Latency"
            >
              <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                  <span>Avionics System Status</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-sm font-bold font-mono text-emerald-300">
                  ALL SYSTEMS GO · LIVE D3
                </div>
              </div>
            </button>

            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-zinc-950/80 flex items-center gap-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-zinc-400">Flight Regime</div>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  {flightState.supercruise ? 'SUPERCRUISE (MACH 1.62)' : 'MIL POWER'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* F-22 Flight Mode Selector: Stealth, Combat, Training */}
        <div className="mt-6 pt-5 border-t border-emerald-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                F-22 Operational Flight Mode Selector
              </span>
              <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">
                (Dynamically updates CIP 1/2 PQC hybrid parameters & EMCON status)
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
                  ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/60'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                      flightState.flightMode === 'Stealth'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Stealth Mode</span>
                      {flightState.flightMode === 'Stealth' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                      EMCON 1 · Strict RF Silence
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                  100% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-emerald-300 font-semibold">ML-KEM-1024 (Level 5)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-emerald-300 font-semibold">ML-DSA-87 (CNSA 2.0)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">Passive Silent · 0.0001 m²</span>
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
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Combat Mode</span>
                      {flightState.flightMode === 'Combat' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-semibold">
                      EMCON 3 · Tactical 50Hz Mesh
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-700 text-amber-300">
                  99.4% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-amber-300 font-semibold">ML-KEM-768 + X25519</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-amber-300 font-semibold">ML-DSA-65 (Rapid Guide)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-zinc-200">Track-While-Scan · 0.0001 m²</span>
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
                      <span>Training Mode</span>
                      {flightState.flightMode === 'Training' && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-sky-400 font-semibold">
                      EMCON 5 · ACMI Range / Pod
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-700 text-sky-300">
                  88.0% PQC
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">KEM:</span>
                  <span className="text-sky-300 font-semibold">ML-KEM-512 + ACMI Pod</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">DSA:</span>
                  <span className="text-sky-300 font-semibold">ML-DSA-44 + ECDSA P-256</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="text-zinc-500">Radar / RCS:</span>
                  <span className="text-sky-200">SAR Map · 0.1500 m² (Luneburg)</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-zinc-800">
          <button
            onClick={() => setActiveSubTab('ea-hardening')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'ea-hardening'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            <span>F-35 EA Hardening</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
              isElectronicAttackActive
                ? 'bg-rose-950 border-rose-500/50 text-rose-200 animate-pulse'
                : 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
            }`}>
              {isElectronicAttackActive ? 'Attack Mitigated' : '5 Shields Ready'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('perf-dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'perf-dashboard'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
            <span>PQC Performance Dashboard</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-400/30 text-cyan-200">
              ML-KEM-768 Overhead
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('avionics-status')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'avionics-status'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span>Avionics Status</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Live D3 Widget
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('cockpit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'cockpit'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
            <span>Glass Cockpit & HUD Simulator</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'architecture'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span>CIP & Avionics Architecture</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-400/30 text-cyan-200">
              CIP 1 / CIP 2
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-300" />
            <span>Ada 95 & C++ Avionics Code</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              DO-178C Level A
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('bus')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'bus'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-300" />
            <span>MIL-STD-1553B & Fibre Channel Telemetry</span>
          </button>

          <button
            onClick={() => setActiveSubTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'telemetry'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-rose-300" />
            <span>Mission Telemetry & PQC Latency</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-200">
              Live Graphs
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('defense-honeypot')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'defense-honeypot'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'bg-zinc-900/70 text-rose-300 hover:text-white hover:bg-zinc-800/80 border border-rose-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Defense Honeypot · Decoy TLS</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 border border-rose-500/40 text-rose-200">
              liboqs Grid
            </span>
          </button>
        </div>
      </div>

      {/* Action Notice Strip */}
      {lastActionNotice && (
        <div className="p-3 rounded-xl border border-emerald-500/50 bg-emerald-950/80 text-emerald-200 text-xs font-mono font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>AVIONICS AUDIO/TACTICAL CUE: {lastActionNotice}</span>
          </div>
          <button
            onClick={() => setLastActionNotice(null)}
            className="text-[10px] text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUB-TAB: Electronic Attack Mitigation & Architecture Hardening */}
      {activeSubTab === 'ea-hardening' && (
        <F22ElectronicAttackHardening
          flightState={flightState}
          isAttackActive={isElectronicAttackActive}
          onToggleAttack={(active) => {
            setIsElectronicAttackActive(active);
            triggerNotice(
              active
                ? 'ELECTRONIC ATTACK STIMULUS ACTIVATED: MONITORING HARDENING MITIGATION.'
                : 'ELECTRONIC ATTACK TERMINATED: AVIONICS BUS & HUD INTEGRITY RESTORED.'
            );
          }}
          hardeningConfig={hardeningConfig}
          onUpdateHardeningConfig={setHardeningConfig}
          onSwitchSubTab={(sub) => {
            if (
              sub === 'cockpit' ||
              sub === 'bus' ||
              sub === 'architecture' ||
              sub === 'telemetry' ||
              sub === 'perf-dashboard' ||
              sub === 'avionics-status'
            ) {
              setActiveSubTab(sub as any);
            }
          }}
        />
      )}

      {/* SUB-TAB: PQC Performance Dashboard (ML-KEM-768 Latency Overhead vs Classical) */}
      {activeSubTab === 'perf-dashboard' && (
        <F22PqcPerformanceDashboard
          flightState={flightState}
          cbomItems={cbomItems}
          onTriggerFlightMode={handleSelectFlightMode}
          onRekeyTrigger={() => handleForceRekey(true)}
          onNavigateToTab={(tab) => {
            if (tab === 'telemetry') setActiveSubTab('telemetry');
            if (tab === 'avionics-status') setActiveSubTab('avionics-status');
            if (tab === 'architecture') setActiveSubTab('architecture');
          }}
        />
      )}

      {/* SUB-TAB 0: Avionics Status Widget (D3 Live FIPS 203/204 Key Negotiation Latency) */}
      {activeSubTab === 'avionics-status' && (
        <F22AvionicsStatusWidget
          flightState={flightState}
          onTriggerFlightMode={handleSelectFlightMode}
          onRekeyTrigger={() => handleForceRekey(true)}
        />
      )}

      {/* SUB-TAB 1: Cockpit Glass & HUD View */}
      {activeSubTab === 'cockpit' && (
        <div className="space-y-6">
          {/* F-35 Threat & HUD Hardening Control Strip */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs transition-all ${
            isElectronicAttackActive
              ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200 shadow-md'
                : 'border-rose-500/60 bg-rose-950/30 text-rose-200 animate-pulse'
              : 'border-zinc-800 bg-zinc-950 text-zinc-300'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 shrink-0 ${
                isElectronicAttackActive
                  ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                    ? 'text-emerald-400'
                    : 'text-rose-400 animate-bounce'
                  : 'text-zinc-500'
              }`} />
              <div>
                <div className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>F-35 Threat Vector & HUD Anti-Tamper Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isElectronicAttackActive
                      ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    {isElectronicAttackActive
                      ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                        ? 'MITIGATED (PQC ATTESTED & GROUND-TRUTH LOCKED)'
                        : 'SPOOF ATTACK ACTIVE (CORRUPTED HUD SYMBOLOGY)'
                      : 'NORMAL FLIGHT'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isElectronicAttackActive
                    ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                      ? 'Adversary F-35 injection intercepted. HUD glass Display Verification Controller blocks unverified vectors. Pitch locked to true VMS gyros.'
                      : 'Adversary injecting false pitch ladder (+14.2°) & phantom radar track through F-35 bridge! Click "Enable HUD Hardening" to neutralize.'
                    : 'Simulate F-35 electronic attack to test cryptographic HUD vector attestation and VMS cross-checking.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsElectronicAttackActive(!isElectronicAttackActive)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isElectronicAttackActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-rose-300 border border-rose-600/40'
                }`}
              >
                {isElectronicAttackActive ? 'Halt Attack' : 'Simulate F-35 Attack'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setHardeningConfig({
                    ...hardeningConfig,
                    hudAttestedPipeline: !hardeningConfig.hudAttestedPipeline,
                    vmsInertialCrossCheck: !hardeningConfig.vmsInertialCrossCheck,
                  });
                }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                  hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-emerald-900/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
              >
                {hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                  ? 'HUD Hardening: ENGAGED'
                  : 'Engage HUD Hardening'}
              </button>
            </div>
          </div>

          {/* Main Flight Display & Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Phosphor Green Heads-Up Display (HUD) */}
            <div className={`lg:col-span-7 p-6 rounded-2xl border-2 bg-black shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px] transition-all ${
              isElectronicAttackActive
                ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                  ? 'border-emerald-500/60 shadow-emerald-950/40'
                  : 'border-rose-500/80 shadow-rose-950/40 animate-pulse'
                : 'border-emerald-500/40'
            }`}>
              {/* Scanline background overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,255,0,0)_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px]"
              />

              {/* HUD Cryptographic Security Watermark / Alert Strip */}
              {isElectronicAttackActive && (
                <div className={`p-2 rounded-lg font-mono text-[10px] font-bold flex items-center justify-between mb-2 relative z-20 ${
                  hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                    ? 'bg-cyan-950/90 border border-cyan-500/50 text-cyan-300'
                    : 'bg-rose-950/90 border border-rose-500/80 text-rose-300 animate-pulse'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>[PQC ATTESTED: CIP-1 ML-DSA-65] · VMS RLG LOCKED (0.0° DRIFT) · F-35 VECTORS BLOCKED</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span>⚠ [EA CORRUPTION ACTIVE] · F-35 BUS INJECTION · NOSE-UP DRIFT (+14.2°) · GHOST TARGET ACTIVE</span>
                      </>
                    )}
                  </div>
                  <span className="opacity-80">50 Hz CYCLIC</span>
                </div>
              )}

              {/* Top HUD Line: Heading & Steerpoint */}
              <div className="flex items-center justify-between text-emerald-400 font-mono text-xs border-b border-emerald-500/30 pb-2 relative z-10">
                <div className="flex items-center gap-3">
                  <span>HDG {flightState.heading.toString().padStart(3, '0')}°</span>
                  <span className="text-[10px] text-emerald-600">|</span>
                  <span>WPT 04 (CAP POINT ALASKA)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 font-bold text-[10px]">
                    {flightState.radarMode}
                  </span>
                  <span className="font-bold text-emerald-300">ARMED</span>
                </div>
              </div>

              {/* Middle HUD Horizon & Flight Director */}
              <div className="my-auto py-12 flex flex-col items-center justify-center relative z-10">
                {/* Airspeed Left Tape */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-emerald-400 text-center space-y-1">
                  <div className="text-[10px] text-emerald-600 uppercase">KTS</div>
                  <div className="text-xl font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40">
                    {flightState.airspeedKnots}
                  </div>
                  <div className="text-xs font-bold text-emerald-300">
                    M {flightState.mach.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-emerald-500">
                    {flightState.supercruise ? 'SUPERCRUISE' : 'MIL POWER'}
                  </div>
                </div>

                {/* Center Pitch Ladder & Bore Sight Crosshair */}
                <div className="relative flex flex-col items-center justify-center">
                  {/* Pitch ladder bars with dynamic spoof offset simulation */}
                  {isElectronicAttackActive && (!hardeningConfig.hudAttestedPipeline || !hardeningConfig.vmsInertialCrossCheck) ? (
                    /* Corrupted Pitch Ladder with +14° Offset Warning */
                    <div className="space-y-4 text-center">
                      <div className="p-1 px-2 rounded bg-rose-950/80 border border-rose-500 text-rose-300 text-[10px] font-mono animate-pulse">
                        ⚠ SPOOFED PITCH DRIFT +14.2° (F-35 INJECTION)
                      </div>
                      <div className="w-56 h-0.5 bg-rose-500/80 mb-4 relative flex items-center justify-between px-2 text-[10px] font-mono text-rose-400">
                        <span>+24</span>
                        <span className="w-16 h-0.5 bg-rose-400" />
                        <span>+24</span>
                      </div>
                    </div>
                  ) : (
                    /* Clean Attested Ground-Truth Ladder */
                    <div className="w-48 h-0.5 bg-emerald-500/60 mb-8 relative flex items-center justify-between px-2 text-[10px] font-mono text-emerald-400">
                      <span>+10</span>
                      <span className="w-12 h-0.5 bg-emerald-400" />
                      <span>+10</span>
                    </div>
                  )}

                  {/* Flight Path Marker (FPM) */}
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-emerald-400" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-emerald-400" />
                    <div className="absolute top--3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-emerald-400" />
                  </div>

                  {/* Ghost Target Injected on HUD when attack is active and unhardened */}
                  {isElectronicAttackActive && (!hardeningConfig.hudAttestedPipeline || !hardeningConfig.f35DataDiodeQuarantine) && (
                    <div className="absolute -top-24 left-10 p-2 border-2 border-dashed border-rose-500 text-rose-300 font-mono text-[10px] bg-rose-950/70 animate-bounce z-20">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>GHOST-99 [F-35 SPOOF LURE]</span>
                      </div>
                      <div>12 NM · M 1.2 · CFIT HAZARD</div>
                      <div className="text-[8px] text-rose-400">UNATTESTED RASTER VECTOR</div>
                    </div>
                  )}

                  <div className="w-48 h-0.5 bg-emerald-500/40 mt-8 relative flex items-center justify-between px-2 text-[10px] font-mono text-emerald-400">
                    <span>-10</span>
                    <span className="w-12 h-0.5 bg-emerald-400/50" />
                    <span>-10</span>
                  </div>

                  {/* Target Lead Lock Box if locked */}
                  {targetLocked && (
                    <div className="absolute -top-16 right-12 p-1.5 border-2 border-dashed border-rose-400 text-rose-300 font-mono text-[10px] animate-pulse">
                      <div>T-01 [LPI LOCK]</div>
                      <div>48 NM · M 0.94</div>
                      <div>R-MAX SHOOT</div>
                    </div>
                  )}
                </div>

                {/* Altitude Right Tape */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-emerald-400 text-center space-y-1">
                  <div className="text-[10px] text-emerald-600 uppercase">ALT (BARO)</div>
                  <div className="text-xl font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40">
                    {flightState.altitudeFeet.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold text-emerald-300">
                    FL {Math.round(flightState.altitudeFeet / 100)}
                  </div>
                  <div className="text-[9px] text-emerald-500">VVI 0000</div>
                </div>
              </div>

              {/* Bottom HUD Line: G-Force, AoA, Weapon Selected */}
              <div className="flex items-center justify-between text-emerald-400 font-mono text-xs border-t border-emerald-500/30 pt-2 relative z-10">
                <div className="flex items-center gap-4">
                  <span>G: <strong>{flightState.gForce.toFixed(1)}</strong></span>
                  <span>AoA: <strong>{flightState.aoaDegrees.toFixed(1)}°</strong></span>
                  <span>TVC: <strong>{flightState.thrustVectorAngle}°</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span>BAY: <strong className={flightState.weaponBayDoors === 'OPEN' ? 'text-rose-400' : 'text-emerald-300'}>{flightState.weaponBayDoors}</strong></span>
                  <span className="text-[10px] text-emerald-600">|</span>
                  <span className="text-emerald-200 font-bold">{flightState.selectedWeapon}</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Tactical Situation Display (TSD) & Cockpit Switches */}
            <div className="lg:col-span-5 space-y-4">
              {/* Tactical Situation Radar Display */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold font-mono text-white uppercase">
                      Tactical Situation Display (TSD)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    80 NM RANGE
                  </span>
                </div>

                {/* Radar Grid Graphic */}
                <div className="h-56 rounded-xl border border-cyan-500/30 bg-black relative flex items-center justify-center overflow-hidden">
                  {/* Concentric Range Rings */}
                  <div className="w-48 h-48 rounded-full border border-cyan-500/20 absolute" />
                  <div className="w-32 h-32 rounded-full border border-cyan-500/20 absolute" />
                  <div className="w-16 h-16 rounded-full border border-cyan-500/20 absolute" />
                  <div className="w-full h-0.5 bg-cyan-500/10 absolute" />
                  <div className="h-full w-0.5 bg-cyan-500/10 absolute" />

                  {/* Raptor Center Marker */}
                  <div className="w-3 h-3 bg-emerald-400 rounded-full z-10 shadow-lg shadow-emerald-400/50" />

                  {/* Tracks on Radar */}
                  {radarTracks.map((trk) => {
                    // Position mapping
                    const posX = trk.id === 'TRK-01' ? '68%' : trk.id === 'TRK-02' ? '82%' : '28%';
                    const posY = trk.id === 'TRK-01' ? '28%' : trk.id === 'TRK-02' ? '20%' : '75%';

                    return (
                      <button
                        key={trk.id}
                        onClick={() => setTargetLocked(trk.id)}
                        style={{ left: posX, top: posY }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded font-mono text-[9px] transition-transform hover:scale-110 cursor-pointer ${
                          trk.iffStatus === 'HOSTILE'
                            ? 'text-rose-400 border border-rose-500/60 bg-rose-950/60'
                            : 'text-emerald-400 border border-emerald-500/60 bg-emerald-950/60'
                        } ${targetLocked === trk.id ? 'ring-2 ring-rose-400 ring-offset-1 ring-offset-black' : ''}`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          <span>▲</span>
                          <span>{trk.id}</span>
                        </div>
                        <div className="text-[8px] opacity-80">{trk.rangeNm} NM</div>
                      </button>
                    );
                  })}
                </div>

                {/* Track Details Strip */}
                {targetLocked && (
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-rose-300 font-bold">
                      <span>LOCKED: BANDIT-01 (Su-57 Felon)</span>
                      <span>IFF: HOSTILE</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] flex justify-between">
                      <span>Range: 48 NM · Brg: 284°</span>
                      <span>Mach 0.94 · Alt: 36,000 ft</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Cockpit Tactical Controls */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Pilot Throttle & Avionics Controls
                </div>

                {/* Throttle Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300">P&W F119 Engine Throttle:</span>
                    <span className="text-emerald-300 font-bold">
                      {flightState.throttlePercent}% {flightState.afterburner ? '(AFTERBURNER)' : '(MIL POWER)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={flightState.throttlePercent}
                    onChange={(e) => handleThrottleChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Idle (30%)</span>
                    <span>Mil Power (85%)</span>
                    <span>Max Afterburner (100%)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleToggleBayDoors}
                    className={`p-2.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      flightState.weaponBayDoors === 'OPEN'
                        ? 'border-rose-500 bg-rose-950/80 text-rose-200'
                        : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <span>Bay Doors: {flightState.weaponBayDoors}</span>
                  </button>

                  <button
                    onClick={handleFireWeapon}
                    className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>LAUNCH MISSILE</span>
                  </button>
                </div>

                {/* Radar Mode Selector */}
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-mono text-zinc-400">AN/APG-77 Radar Mode:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['LPI Search', 'Track-While-Scan', 'SAR Ground Map', 'Passive Silent'] as RadarMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setFlightState((prev) => ({ ...prev, radarMode: m }));
                          triggerNotice(`APG-77 RADAR MODE ENGAGED: ${m}`);
                        }}
                        className={`p-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                          flightState.radarMode === m
                            ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic PQC Hybrid Security & Cryptographic Telemetry Dashboard */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-zinc-950 shadow-2xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    CNSA 2.0 PQC Hybrid Flight Encryption Subsystem
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                    {flightState.cnsaCryptoStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Active Cryptographic Profile for <strong>{flightState.flightMode.toUpperCase()} FLIGHT REGIME</strong>. Synchronized across CIP 1 / CIP 2 cryogenic vector modules and Intra-Flight Data Link.
                </p>
              </div>

              {/* Rekey ratchet action & countdown */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs flex items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase text-zinc-500">Ephemeral Ratchet Cycle</div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        {rekeyCountdown}s remaining
                      </span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400 text-[11px]">
                        {flightState.pqcSecurity.rekeyIntervalSeconds}s period
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleForceRekey(true)}
                    disabled={isRekeying}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                    title="Force immediate ephemeral lattice ratchet"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRekeying ? 'animate-spin' : ''}`} />
                    <span>Rekey</span>
                  </button>
                </div>

                {onLoadCodeToPipeline && (
                  <button
                    type="button"
                    onClick={() => {
                      const code = generateFlightModeCode(
                        flightState.flightMode,
                        flightState.pqcSecurity
                      );
                      onLoadCodeToPipeline(code);
                      triggerNotice(`SENT ${flightState.flightMode.toUpperCase()} PQC MISSION SPEC TO MIGRATION PIPELINE.`);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Mode Code to Pipeline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Dynamic Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Key Encapsulation (KEM) */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[10px]">Key Encapsulation (KEM)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    FIPS 203
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {flightState.pqcSecurity.kemAlgorithm}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Security Classification: <span className="text-emerald-400 font-semibold">{flightState.pqcSecurity.securityLevel}</span>
                </div>
              </div>

              {/* Card 2: Digital Signatures (DSA) */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[10px]">Digital Signature (DSA)</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    FIPS 204
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {flightState.pqcSecurity.signatureAlgorithm}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Telemetry / Weapon Datalink: <span className="text-cyan-400 font-semibold">Constant-Time Sealed</span>
                </div>
              </div>

              {/* Card 3: Emission Control & IFDL Mode */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[10px]">Emission Control (EMCON)</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold font-mono">
                    RF Constraint
                  </span>
                </div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {flightState.pqcSecurity.emconLevel}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate" title={flightState.pqcSecurity.ifdlEncryptionMode}>
                  Link: {flightState.pqcSecurity.ifdlEncryptionMode}
                </div>
              </div>

              {/* Card 4: Quantum Resistance Score & Latency */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase text-[10px]">Quantum Resistance</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {flightState.pqcSecurity.quantumResistanceScore}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      flightState.pqcSecurity.quantumResistanceScore >= 99
                        ? 'bg-emerald-400'
                        : flightState.pqcSecurity.quantumResistanceScore >= 95
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${flightState.pqcSecurity.quantumResistanceScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Burst Latency:</span>
                  <span className="text-white font-bold">{flightState.pqcSecurity.burstLatencyMs} ms</span>
                </div>
              </div>
            </div>

            {/* Lower Telemetry Strip: Hardware Core, Formation Sync, RCS Explanation */}
            <div className="p-4 rounded-xl border border-zinc-850 bg-black/60 space-y-3 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">Cryptographic Hardware Enclave:</span>
                  <span className="text-zinc-200 font-semibold">{flightState.pqcSecurity.hsmCryptoCore}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">Flight Formation Mesh Sync:</span>
                  <span className="text-zinc-200 font-semibold">{flightState.pqcSecurity.flightFormationSync}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">Radar Cross Section State:</span>
                  <span className={flightState.flightMode === 'Training' ? 'text-sky-300 font-semibold' : 'text-emerald-300 font-semibold'}>
                    {flightState.stealthRcsSqm.toFixed(4)} m² ({flightState.pqcSecurity.rcsModifierExplanation})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-zinc-500">Ciphersuite:</span>
                  <code className="text-emerald-300 text-[11px] font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {flightState.pqcSecurity.activeCiphersuite}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(flightState.pqcSecurity.activeCiphersuite, 'ciphersuite')}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'ciphersuite' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Ciphersuite</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Interactive CIP & Avionics Architecture */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          {/* Topology View Switcher: D3 Communication Paths Graph vs Relational Graph vs Tiered Architecture */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 font-semibold px-1">TOPOLOGY VIEW:</span>
              <button
                type="button"
                onClick={() => setArchitectureGraphView('paths')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  architectureGraphView === 'paths'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-emerald-300" />
                <span>Communication Paths Graph</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-400/30 text-emerald-200">
                  ML-KEM-768 Highlighted
                </span>
              </button>
              <button
                type="button"
                onClick={() => setArchitectureGraphView('force')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  architectureGraphView === 'force'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-cyan-300" />
                <span>Relational Force Graph</span>
              </button>
              <button
                type="button"
                onClick={() => setArchitectureGraphView('tiered')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  architectureGraphView === 'tiered'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                <span>Tiered Bus Architecture</span>
              </button>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 px-2 hidden lg:block">
              Directed D3 links & PQC-hybrid enclaves
            </div>
          </div>

          {/* Active Topology Component */}
          {architectureGraphView === 'paths' ? (
            <F22AvionicsCommunicationPathsGraph
              flightMode={flightState.flightMode}
              onSelectSubsystem={(sub) => setSelectedSubsystem(sub)}
              onOpenCodeView={(sub) => {
                setSelectedSubsystem(sub);
                setActiveSubTab('code');
              }}
            />
          ) : architectureGraphView === 'force' ? (
            <F22AvionicsForceGraph
              flightMode={flightState.flightMode}
              onSelectSubsystem={(sub) => setSelectedSubsystem(sub)}
              onOpenCodeView={(sub) => {
                setSelectedSubsystem(sub);
                setActiveSubTab('code');
              }}
            />
          ) : (
            <F22AvionicsD3Map
              flightMode={flightState.flightMode}
              onSelectSubsystem={(sub) => setSelectedSubsystem(sub)}
              onOpenCodeView={(sub) => {
                setSelectedSubsystem(sub);
                setActiveSubTab('code');
              }}
            />
          )}

          <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Common Integrated Processor (CIP 1 & CIP 2) Core Architecture
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubTab('avionics-status')}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Avionics Status Widget</span>
              </button>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl">
              The F-22 Raptor eliminated discrete black-box federated avionics by introducing the twin Common Integrated Processors. Signal and data processing modules communicate over high-speed 400 Mbps Fibre Channel backplanes and MIL-STD-1553B multiplex buses running 2.5 million lines of Ada 95 software.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Visual Architecture Diagram (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Interactive Avionics Hardware & Software Topology
              </div>

              {/* Subsystems Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {F22_AVIONICS_SUBSYSTEMS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSubsystem.id === sub.id
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/50'
                        : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub.acronym}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-emerald-300">
                        {sub.cipHost}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-200 mt-1 font-semibold">{sub.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-1 flex justify-between">
                      <span>{sub.softwareLanguage}</span>
                      <span>{(sub.linesOfCode / 1000).toFixed(0)}k SLOC</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Central Bus Topology Indicator */}
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="text-zinc-300 font-bold">Avionics Interconnect Backbone:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded bg-black border border-zinc-800 text-cyan-300">
                    <div>Fibre Channel</div>
                    <div className="text-zinc-500">400 Mbps Optical</div>
                  </div>
                  <div className="p-2 rounded bg-black border border-zinc-800 text-emerald-300">
                    <div>MIL-STD-1553B</div>
                    <div className="text-zinc-500">Dual-Redundant</div>
                  </div>
                  <div className="p-2 rounded bg-black border border-zinc-800 text-amber-300">
                    <div>IEEE 1394B</div>
                    <div className="text-zinc-500">FireWire Serial</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subsystem Deep Dive (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">Selected Module</span>
                  <h4 className="text-base font-bold text-white">{selectedSubsystem.name}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300">
                  {selectedSubsystem.cipHost}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedSubsystem.description}
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">Software Language:</span>
                  <span className="text-zinc-200 font-semibold">{selectedSubsystem.softwareLanguage}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">Safety Certification:</span>
                  <span className="text-emerald-400 font-semibold">{selectedSubsystem.criticalityLevel}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">Bus Interface:</span>
                  <span className="text-cyan-300 font-semibold">{selectedSubsystem.busInterface}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                  <span className="text-zinc-400">PQC Compliance:</span>
                  <span className="text-emerald-300 font-semibold">{selectedSubsystem.pqcCompliance}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">{selectedSubsystem.sourceFile}</span>
                  <button
                    onClick={() => setActiveSubTab('code')}
                    className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Full Source</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Ada 95 & C++ Avionics Source Code */}
      {activeSubTab === 'code' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Avionics Module:</span>
              {F22_AVIONICS_SUBSYSTEMS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubsystem(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedSubsystem.id === sub.id
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-200 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  {sub.sourceFile}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(selectedSubsystem.codeSnippet, 'avionics_code')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                {copiedKey === 'avionics_code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ada/C++</span>
                  </>
                )}
              </button>

              {onLoadCodeToPipeline && (
                <button
                  onClick={() => onLoadCodeToPipeline(selectedSubsystem.codeSnippet)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send to PQC Pipeline</span>
                </button>
              )}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
            <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{selectedSubsystem.sourceFile}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">{selectedSubsystem.softwareLanguage}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">{selectedSubsystem.criticalityLevel}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300">
                VERIFIED CONSTANT-TIME
              </span>
            </div>

            <pre className="p-5 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre selection:bg-emerald-900/60 max-h-[550px] overflow-y-auto">
              {selectedSubsystem.codeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MIL-STD-1553B & Telemetry Bus Monitor */}
      {activeSubTab === 'bus' && (
        <div className="space-y-6">
          {/* F-35 Threat & Bus Guardian Arbiter Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs ${
            isElectronicAttackActive
              ? hardeningConfig.pqcBusGuardian && hardeningConfig.f35DataDiodeQuarantine
                ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                : 'border-rose-500/60 bg-rose-950/30 text-rose-200 animate-pulse'
              : 'border-purple-500/30 bg-purple-950/20 text-zinc-300'
          }`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 shrink-0 ${
                isElectronicAttackActive
                  ? hardeningConfig.pqcBusGuardian
                    ? 'text-emerald-400'
                    : 'text-rose-400 animate-bounce'
                  : 'text-purple-400'
              }`} />
              <div>
                <div className="font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>MIL-STD-1553B & Optical Bus Integrity:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isElectronicAttackActive
                      ? hardeningConfig.pqcBusGuardian
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {isElectronicAttackActive
                      ? hardeningConfig.pqcBusGuardian
                        ? 'PQC BUS GUARDIAN: ACTIVE (ROGUE FRAMES SHUNTED)'
                        : 'BUS COMPROMISED (ROGUE 1553B WORDS EXECUTING)'
                      : 'ALL CHANNELS SECURED'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isElectronicAttackActive
                    ? hardeningConfig.pqcBusGuardian
                      ? 'Hardware Bus Arbiter ASIC evaluates 64-bit FIPS 204 ML-DSA-65 MAC on each 1553B command frame. Rogue packets from F-35 bridge are shunted in <2 µs.'
                      : 'Adversary injecting unauthenticated flight control command words from RT-14 (F-35 bridge)! Enable PQC Bus Guardian to isolate.'
                    : 'Real-time frame capture across F-22 flight controls, AESA radar, and post-quantum Intra-Flight Data Link.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHardeningConfig({
                  ...hardeningConfig,
                  pqcBusGuardian: !hardeningConfig.pqcBusGuardian,
                  f35DataDiodeQuarantine: !hardeningConfig.f35DataDiodeQuarantine,
                });
              }}
              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer shrink-0 ${
                hardeningConfig.pqcBusGuardian
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              {hardeningConfig.pqcBusGuardian ? 'PQC Guardian: ENGAGED' : 'Engage PQC Bus Guardian'}
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 grid grid-cols-12 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              <span className="col-span-2">Timestamp</span>
              <span className="col-span-2">Bus Channel</span>
              <span className="col-span-3">Remote Terminal</span>
              <span className="col-span-3">Decoded Meaning</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            <div className="divide-y divide-zinc-900">
              {/* If Electronic Attack is active, display the intercepted rogue frames at the top of the stream */}
              {isElectronicAttackActive && (
                <>
                  <div className={`p-3.5 grid grid-cols-12 items-center text-xs font-mono transition-colors ${
                    hardeningConfig.pqcBusGuardian ? 'bg-emerald-950/20' : 'bg-rose-950/40 animate-pulse'
                  }`}>
                    <span className="col-span-2 text-zinc-400">19:48:52.4</span>
                    <span className="col-span-2 text-cyan-300 font-semibold">CH-A (MIL-1553B)</span>
                    <span className="col-span-3 text-rose-300 font-bold">RT-14 (F-35 BRIDGE)</span>
                    <span className="col-span-3 font-bold truncate">
                      {hardeningConfig.pqcBusGuardian ? (
                        <span className="text-emerald-400">0x438A: CMD_OVERRIDE_PITCH (DROPPED & QUARANTINED)</span>
                      ) : (
                        <span className="text-rose-400">0x438A: CMD_OVERRIDE_PITCH (+14.2° SPOOF EXEC)</span>
                      )}
                    </span>
                    <span className="col-span-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hardeningConfig.pqcBusGuardian
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : 'bg-rose-950 border border-rose-500 text-rose-200 animate-pulse'
                      }`}>
                        {hardeningConfig.pqcBusGuardian ? 'BLOCKED_INVALID_MAC' : 'UNAUTHORIZED_EXEC'}
                      </span>
                    </span>
                  </div>

                  <div className={`p-3.5 grid grid-cols-12 items-center text-xs font-mono transition-colors ${
                    hardeningConfig.pqcBusGuardian ? 'bg-emerald-950/20' : 'bg-rose-950/40 animate-pulse'
                  }`}>
                    <span className="col-span-2 text-zinc-400">19:48:51.9</span>
                    <span className="col-span-2 text-cyan-300 font-semibold">CH-B (MIL-1553B)</span>
                    <span className="col-span-3 text-rose-300 font-bold">RT-14 (F-35 BRIDGE)</span>
                    <span className="col-span-3 font-bold truncate">
                      {hardeningConfig.pqcBusGuardian ? (
                        <span className="text-emerald-400">0x192F: SPOOF_ALTITUDE_TAPE (DROPPED BY ARBITER)</span>
                      ) : (
                        <span className="text-rose-400">0x192F: SPOOF_ALTITUDE_TAPE (41,500 FT INJECTED)</span>
                      )}
                    </span>
                    <span className="col-span-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hardeningConfig.pqcBusGuardian
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : 'bg-rose-950 border border-rose-500 text-rose-200 animate-pulse'
                      }`}>
                        {hardeningConfig.pqcBusGuardian ? 'BLOCKED_ML_DSA' : 'UNAUTHORIZED_EXEC'}
                      </span>
                    </span>
                  </div>
                </>
              )}
              {busFrames.map((frm) => (
                <div
                  key={frm.id}
                  className="p-3.5 grid grid-cols-12 items-center text-xs font-mono hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="col-span-2 text-zinc-400">{frm.timestamp}</span>
                  <span className="col-span-2 text-cyan-300 font-semibold">{frm.busChannel}</span>
                  <span className="col-span-3 text-zinc-200">{frm.remoteTerminal}</span>
                  <span className="col-span-3 text-emerald-400 truncate">{frm.decodedMeaning}</span>
                  <span className="col-span-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        frm.status === 'PQC_ENCRYPTED'
                          ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {frm.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Mission Telemetry & PQC Key Negotiation Latency */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner & Live Controls */}
          <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-rose-950/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  F-22 Mission Telemetry & PQC Key Negotiation Dynamics
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isLiveStreaming
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 animate-pulse'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isLiveStreaming ? 'LIVE (50 Hz CYCLIC)' : 'STREAM PAUSED'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                Real-time avionics telemetry monitoring CIP 1/CIP 2 vector processor loads, 400 Mbps Fibre Channel optical throughput, and NIST FIPS 203 lattice key encapsulation latency across 4-ship flight formations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Stream Pause / Resume */}
              <button
                type="button"
                onClick={() => {
                  setIsLiveStreaming(!isLiveStreaming);
                  triggerNotice(
                    isLiveStreaming
                      ? 'TELEMETRY STREAM PAUSED. BUFFER FROZEN.'
                      : '50 Hz REAL-TIME AVIONICS TELEMETRY RESUMED.'
                  );
                }}
                className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Activity className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-emerald-400 animate-spin' : 'text-zinc-500'}`} />
                <span>{isLiveStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
              </button>

              {/* Trigger Burst Test */}
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const timeStr = now.toTimeString().split(' ')[0];
                  const burstSample: KeyNegotiationLatencySample = {
                    timestamp: timeStr,
                    cycle: (latencyHistory[latencyHistory.length - 1]?.cycle || 0) + 1,
                    kemEncapMs: 0.058,
                    kemDecapMs: 0.064,
                    ifdlRttMs: 0.038,
                    totalNegotiationMs: 0.160,
                    classicalEcdhMs: 0.068,
                    algorithm: flightState.pqcSecurity.kemAlgorithm.slice(0, 11),
                    flightMode: flightState.flightMode,
                    jitterMicrosec: 2.8,
                    handshakeStatus: 'RATCHETED',
                  };
                  setLatencyHistory((prev) => [...prev.slice(-19), burstSample]);
                  setInspectedSample(burstSample);
                  triggerNotice('STRESS TEST BURST INJECTED: 0.160 ms ROUNDTRIP LATTICE RATIFIED.');
                }}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Inject Burst Handshake</span>
              </button>

              {/* Export Telemetry */}
              <button
                type="button"
                onClick={() => {
                  const dataStr =
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(
                      JSON.stringify(
                        {
                          airframe: 'F-22A Raptor Block 35',
                          flightMode: flightState.flightMode,
                          pqcSecurity: flightState.pqcSecurity,
                          cipMetrics,
                          latencyHistory,
                          formationNodes,
                        },
                        null,
                        2
                      )
                    );
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute(
                    'download',
                    `f22_mission_telemetry_${Date.now()}.json`
                  );
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  triggerNotice('MISSION TELEMETRY LOGS DOWNLOADED (JSON FORMAT).');
                }}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Tactical Decoy TLS Honeypot Telemetry Feeder Bar */}
          <div className="p-3.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-zinc-950 to-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-white">
                    Avionics Decoy TLS Honeypot Feed Active
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
                    5 Decoys (Ports 8443–12443)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 border border-purple-800 text-purple-300">
                    liboqs FIPS 203/204
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Adversary connection attempts & quantum downgrade exploits intercept on decoy TLS listeners and stream directly into F-22 CIP-1 vector bus.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('defense-honeypot')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inspect Honeypot Telemetry</span>
            </button>
          </div>

          {/* Core Hardware KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: CIP 1 Load */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
                <span>CIP 1 Vector Load</span>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {cipMetrics.cip1CpuUtilization}%
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${cipMetrics.cip1CpuUtilization}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>66 SEM-E modules</span>
                <span className="text-emerald-400">50 Hz</span>
              </div>
            </div>

            {/* KPI 2: CIP 2 Load */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
                <span>CIP 2 Vector Load</span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {cipMetrics.cip2CpuUtilization}%
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${cipMetrics.cip2CpuUtilization}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>Sensor fusion core</span>
                <span className="text-cyan-400">50 Hz</span>
              </div>
            </div>

            {/* KPI 3: Fibre Channel Bus */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
                <span>Optical Backplane</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {cipMetrics.fibreChannelThroughputMbps} <span className="text-xs text-zinc-400 font-normal">Mbps</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 transition-all duration-300"
                  style={{ width: `${(cipMetrics.fibreChannelThroughputMbps / 400) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>400 Mbps Cap</span>
                <span className="text-purple-300">0.00% drop</span>
              </div>
            </div>

            {/* KPI 4: Key Negotiation Latency (P99) */}
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 text-[10px] font-mono uppercase font-bold">
                <span>PQC Latency (P99)</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {latencyHistory[latencyHistory.length - 1]?.totalNegotiationMs.toFixed(3)}{' '}
                <span className="text-xs text-emerald-500 font-normal">ms</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((latencyHistory[latencyHistory.length - 1]?.totalNegotiationMs || 0.1) /
                        0.25) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>Lattice Cycle</span>
                <span className="text-emerald-400 font-bold">CNSA 2.0</span>
              </div>
            </div>

            {/* KPI 5: TRNG Quantum Entropy */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
                <span>Hardware TRNG</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {cipMetrics.trngEntropyRateGbps} <span className="text-xs text-zinc-400 font-normal">Gbps</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-full" />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>FIPS 140-3 L4</span>
                <span className="text-amber-300">Unbiased</span>
              </div>
            </div>

            {/* KPI 6: Crypto Core Thermal Margin */}
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[10px] font-mono uppercase">
                <span>Crypto Core Temp</span>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {cipMetrics.cryptoCoreTempC}°C
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 transition-all duration-300"
                  style={{ width: `${(cipMetrics.cryptoCoreTempC / 85) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex justify-between">
                <span>+43.7°C margin</span>
                <span className="text-emerald-400">Cryo OK</span>
              </div>
            </div>
          </div>

          {/* Interactive PQC Key Negotiation Latency Graphs Panel */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    PQC-Hybrid Key Negotiation Latency Time-Series (ms)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300">
                    50 Hz Real-Time Sampling
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Dynamic round-trip latency comparing <strong>NIST FIPS 203 ML-KEM</strong> against classical non-quantum X25519 ECDH baseline during multi-ship IFDL synchronization.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('perf-dashboard')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Dedicated ML-KEM-768 Latency Overhead Dashboard (D3) →</span>
                </button>
              </div>

              {/* Line Visibility Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedGraphLine('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedGraphLine === 'all'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All Series
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGraphLine('pqc')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedGraphLine === 'pqc'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-zinc-400 hover:text-cyan-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>PQC Total</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGraphLine('classical')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedGraphLine === 'classical'
                      ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800'
                      : 'text-zinc-400 hover:text-amber-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Classical Baseline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGraphLine('hardware')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedGraphLine === 'hardware'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                      : 'text-zinc-400 hover:text-emerald-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Lattice Core (Encap/Decap)</span>
                </button>
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div className="relative rounded-xl border border-zinc-850 bg-black p-4 overflow-hidden">
              <svg
                viewBox="0 0 800 240"
                className="w-full h-64 select-none overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="pqcAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="pqcLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Grid Lines */}
                {/* 0.40 ms (y = 25) */}
                <line x1="50" y1="25" x2="780" y2="25" stroke="#27272a" strokeDasharray="3 3" />
                <text x="42" y="29" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                  0.40 ms
                </text>

                {/* 0.30 ms (y = 70) */}
                <line x1="50" y1="70" x2="780" y2="70" stroke="#27272a" strokeDasharray="3 3" />
                <text x="42" y="74" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                  0.30 ms
                </text>

                {/* 0.20 ms (y = 115) */}
                <line x1="50" y1="115" x2="780" y2="115" stroke="#27272a" strokeDasharray="3 3" />
                <text x="42" y="119" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                  0.20 ms
                </text>

                {/* 0.10 ms Target Envelope (y = 160) */}
                <line x1="50" y1="160" x2="780" y2="160" stroke="#06b6d4" strokeOpacity="0.4" strokeDasharray="4 2" />
                <text x="42" y="164" fill="#06b6d4" fontSize="10" textAnchor="end" fontFamily="monospace">
                  0.10 ms
                </text>
                <text x="775" y="154" fill="#06b6d4" fontSize="9" textAnchor="end" fontFamily="monospace" opacity="0.8">
                  ← 50 Hz Cyclic Real-Time Dogfight Envelope (0.10 ms)
                </text>

                {/* 0.00 ms (y = 205) */}
                <line x1="50" y1="205" x2="780" y2="205" stroke="#3f3f46" strokeWidth="1.5" />
                <text x="42" y="209" fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">
                  0.00 ms
                </text>

                {/* Compute Path Coordinates */}
                {(() => {
                  const pointsCount = latencyHistory.length;
                  if (pointsCount < 2) return null;

                  const getX = (index: number) => 50 + (index / (pointsCount - 1)) * 730;
                  const getY = (ms: number) => {
                    const clamped = Math.max(0, Math.min(0.40, ms));
                    return 205 - (clamped / 0.40) * 180;
                  };

                  // Build SVG path strings
                  const pqcPoints = latencyHistory.map((s, i) => `${getX(i)},${getY(s.totalNegotiationMs)}`);
                  const classicalPoints = latencyHistory.map((s, i) => `${getX(i)},${getY(s.classicalEcdhMs)}`);
                  const hwPoints = latencyHistory.map(
                    (s, i) => `${getX(i)},${getY(s.kemEncapMs + s.kemDecapMs)}`
                  );

                  const areaPath = `M 50,205 L ${pqcPoints.join(' L ')} L ${getX(pointsCount - 1)},205 Z`;
                  const pqcLine = `M ${pqcPoints.join(' L ')}`;
                  const classicalLine = `M ${classicalPoints.join(' L ')}`;
                  const hwLine = `M ${hwPoints.join(' L ')}`;

                  return (
                    <>
                      {/* Area Fill for Total PQC */}
                      {(selectedGraphLine === 'all' || selectedGraphLine === 'pqc') && (
                        <path d={areaPath} fill="url(#pqcAreaGradient)" />
                      )}

                      {/* Classical Baseline Line (Amber dashed) */}
                      {(selectedGraphLine === 'all' || selectedGraphLine === 'classical') && (
                        <path
                          d={classicalLine}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />
                      )}

                      {/* Hardware Lattice Core (Emerald dotted) */}
                      {(selectedGraphLine === 'all' || selectedGraphLine === 'hardware') && (
                        <path
                          d={hwLine}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="2 3"
                          opacity="0.9"
                        />
                      )}

                      {/* PQC Total Line (Cyan/Emerald Gradient) */}
                      {(selectedGraphLine === 'all' || selectedGraphLine === 'pqc') && (
                        <path
                          d={pqcLine}
                          fill="none"
                          stroke="url(#pqcLineGradient)"
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Interactive Data Point Dots */}
                      {latencyHistory.map((s, i) => {
                        const px = getX(i);
                        const py = getY(s.totalNegotiationMs);
                        const isSelected = inspectedSample?.cycle === s.cycle;

                        return (
                          <g
                            key={s.cycle}
                            className="cursor-pointer group"
                            onClick={() => setInspectedSample(s)}
                          >
                            <circle
                              cx={px}
                              cy={py}
                              r={isSelected ? 6 : 3.5}
                              className={`transition-all duration-150 ${
                                isSelected
                                  ? 'fill-cyan-300 stroke-white stroke-2'
                                  : 'fill-cyan-400 group-hover:fill-white group-hover:r-5'
                              }`}
                            />
                            {isSelected && (
                              <line
                                x1={px}
                                y1="25"
                                x2={px}
                                y2="205"
                                stroke="#06b6d4"
                                strokeOpacity="0.4"
                                strokeDasharray="2 2"
                              />
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}

                {/* X-Axis Cycle Labels */}
                {latencyHistory.map((s, i) => {
                  if (i % 3 !== 0 && i !== latencyHistory.length - 1) return null;
                  const px = 50 + (i / Math.max(1, latencyHistory.length - 1)) * 730;
                  return (
                    <text
                      key={s.cycle}
                      x={px}
                      y="225"
                      fill="#71717a"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {s.timestamp.slice(3)}
                    </text>
                  );
                })}
              </svg>

              {/* Legend Strip Overlay */}
              <div className="mt-2 pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-3 h-0.5 bg-cyan-400" />
                    <span>Total PQC Hybrid Roundtrip ({flightState.pqcSecurity.kemAlgorithm.slice(0, 11)})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-3 h-0.5 bg-amber-400 stroke-dashed" />
                    <span>Classical Non-Quantum Baseline (X25519 ECDH ~0.064 ms)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-0.5 bg-emerald-400 stroke-dotted" />
                    <span>Hardware Lattice Encap + Decap Cycle</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Tip: Click any data point to inspect cycle telemetry
                </div>
              </div>
            </div>

            {/* Inspected Sample Telemetry Breakdown Card */}
            {inspectedSample && (
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-800/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-bold uppercase">
                      Inspected Cycle #{inspectedSample.cycle}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-300">Timestamp: {inspectedSample.timestamp}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-700 text-cyan-200">
                      {inspectedSample.algorithm}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Flight Regime:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-white">
                      {inspectedSample.flightMode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inspectedSample.handshakeStatus === 'RATCHETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {inspectedSample.handshakeStatus}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Waterfall Decomposition */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">1. KEM Encapsulation</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">
                      {inspectedSample.kemEncapMs.toFixed(3)} ms
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">CIP 1 Crypto Vector Core</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">2. Optical IFDL RTT</div>
                    <div className="text-base font-bold text-cyan-400 mt-1">
                      {inspectedSample.ifdlRttMs.toFixed(3)} ms
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Air-to-Air Narrow Beam</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">3. KEM Decapsulation</div>
                    <div className="text-base font-bold text-purple-400 mt-1">
                      {inspectedSample.kemDecapMs.toFixed(3)} ms
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Wingman Shared Verification</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/40 bg-emerald-950/30">
                    <div className="text-[10px] text-emerald-300 uppercase font-bold">
                      Total Handshake Roundtrip
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {inspectedSample.totalNegotiationMs.toFixed(3)} ms
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      Jitter: ±{inspectedSample.jitterMicrosec} µs
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Ship Flight Formation PQC Link Status Matrix */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>4-Ship Raptor Cell Formation PQC Mesh Datalink Status</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Intra-Flight Data Link (IFDL) cryptographic key synchronization across all aircraft in the tactical cell.
                </p>
              </div>

              {/* Formation Distance Slider */}
              <div className="p-2.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900 font-mono text-xs flex items-center gap-3">
                <span className="text-zinc-400 text-[11px] whitespace-nowrap">Wingman Separation:</span>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={formationDistance}
                  onChange={(e) => setFormationDistance(Number(e.target.value))}
                  className="w-28 accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <span className="text-emerald-400 font-bold whitespace-nowrap">
                  {formationDistance.toFixed(1)} NM
                </span>
              </div>
            </div>

            {/* Formation Nodes Table */}
            <div className="rounded-xl border border-zinc-850 bg-black overflow-hidden">
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 grid grid-cols-12 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                <span className="col-span-3">Airframe / Tail Number</span>
                <span className="col-span-2">Tactical Role</span>
                <span className="col-span-2">Distance (NM)</span>
                <span className="col-span-2">PQC Algorithm</span>
                <span className="col-span-1 text-center">Latency</span>
                <span className="col-span-2 text-right">Ratchet Status</span>
              </div>

              <div className="divide-y divide-zinc-900">
                {formationNodes.map((node) => (
                  <div
                    key={node.tailNumber}
                    className="p-3.5 grid grid-cols-12 items-center text-xs font-mono hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="col-span-3">
                      <div className="text-white font-bold">{node.callsign}</div>
                      <div className="text-[10px] text-zinc-500">{node.tailNumber}</div>
                    </div>

                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        {node.role}
                      </span>
                    </div>

                    <div className="col-span-2 text-zinc-300">
                      {node.distanceNm.toFixed(1)} NM
                      <span className="text-[10px] text-zinc-500 ml-1.5">({node.rssiDb} dBm)</span>
                    </div>

                    <div className="col-span-2 text-emerald-400 font-semibold truncate">
                      {node.kemAlgorithm}
                    </div>

                    <div className="col-span-1 text-center text-cyan-300 font-bold">
                      {node.latencyMs === 0 ? '0.000 ms' : `${node.latencyMs.toFixed(3)} ms`}
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] text-zinc-500">{node.lastRatchet}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            node.linkStatus === 'CONNECTED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {node.linkStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Defense Honeypot & Decoy TLS Endpoints with liboqs */}
      {activeSubTab === 'defense-honeypot' && (
        <DefenseHoneypot
          onNavigateToF22Telemetry={() => setActiveSubTab('telemetry')}
          isEmbeddedInF22={true}
        />
      )}
    </div>
  );
};
