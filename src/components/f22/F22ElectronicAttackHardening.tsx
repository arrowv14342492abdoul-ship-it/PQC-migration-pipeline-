import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crosshair,
  Server,
  FileCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Flame,
  Plane,
} from 'lucide-react';
import { F22FlightState } from '../../types/f22Simulator';

export interface HardeningArchitectureConfig {
  pqcBusGuardian: boolean; // Layer 1: Hardware Bus Arbiter + PQC ML-DSA-65 Frame MACs
  hudAttestedPipeline: boolean; // Layer 2: Signed Display Vector Stream + Glass DVM Micro-Watermark
  vmsInertialCrossCheck: boolean; // Layer 3: Quadruplex Ring Laser Gyro Ground-Truth Comparator
  f35DataDiodeQuarantine: boolean; // Layer 4: Unidirectional Physical Data Diode + Untrusted DMZ Enclave
  cnsa2RekeyRatchet: boolean; // Layer 5: High-Frequency Lattice Rekeying under EMCON
}

export interface AttackVectorTelemetry {
  id: string;
  timestamp: string;
  source: 'F-35 MADL Gateway' | 'Internal Avionics Bus' | 'HUD Glass Line';
  vector: string;
  payload: string;
  targetSubsystem: string;
  status: 'INJECTED_COMPROMISED' | 'BLOCKED_BY_HARDENING' | 'ISOLATED_QUARANTINE';
  mitigatingLayer: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

interface F22ElectronicAttackHardeningProps {
  flightState: F22FlightState;
  isAttackActive: boolean;
  onToggleAttack: (active: boolean) => void;
  hardeningConfig: HardeningArchitectureConfig;
  onUpdateHardeningConfig: (config: HardeningArchitectureConfig) => void;
  onSwitchSubTab?: (subtab: string) => void;
}

export const F22ElectronicAttackHardening: React.FC<F22ElectronicAttackHardeningProps> = ({
  flightState,
  isAttackActive,
  onToggleAttack,
  hardeningConfig,
  onUpdateHardeningConfig,
  onSwitchSubTab,
}) => {
  // Live attack log history
  const [attackLogs, setAttackLogs] = useState<AttackVectorTelemetry[]>([]);
  const [selectedMitigationView, setSelectedMitigationView] = useState<'architecture-diagram' | 'layers-matrix' | 'threat-forensics' | 'hud-crosscheck'>('architecture-diagram');
  const [logFilter, setLogFilter] = useState<'all' | 'blocked' | 'compromised'>('all');

  // Compute overall hardening health
  const activeShieldsCount = useMemo(() => {
    return Object.values(hardeningConfig).filter(Boolean).length;
  }, [hardeningConfig]);

  const isFullyHardened = activeShieldsCount === 5;
  const isVulnerable = activeShieldsCount < 3 && isAttackActive;

  // Generate synthetic attack & mitigation events when attack is active
  useEffect(() => {
    if (!isAttackActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        Math.floor(now.getMilliseconds() / 100)
      )}`;

      const vectors = [
        {
          source: 'F-35 MADL Gateway' as const,
          vector: 'MIL-1553B Rogue Command Word Injection (SubAddress 14)',
          payload: '0x438A: CMD_OVERRIDE_FLIGHT_SURFACE_PITCH +14.2°',
          targetSubsystem: 'Vehicle Management System (VMS)',
          requiresLayer: 'pqcBusGuardian' as keyof HardeningArchitectureConfig,
          layerName: 'Layer 1: PQC Bus Guardian Arbiter',
          severity: 'CRITICAL' as const,
        },
        {
          source: 'F-35 MADL Gateway' as const,
          vector: 'HUD Stroke Generator Symbology Tampering (Pitch Ladder Drift)',
          payload: 'VECTOR_OFFSET: PITCH_LADDER_Y_SHIFT +28px (SPOOFED NOSE-HIGH)',
          targetSubsystem: 'Cockpit HUD Raster/Stroke Generator',
          requiresLayer: 'hudAttestedPipeline' as keyof HardeningArchitectureConfig,
          layerName: 'Layer 2: Attested HUD Vector Pipeline',
          severity: 'CRITICAL' as const,
        },
        {
          source: 'F-35 MADL Gateway' as const,
          vector: 'Phantom Radar Target Injection (Ghost Bandit Lock)',
          payload: 'IFF_INJECT: TRK-99 [GHOST MIG-31] BRG: 340° RNG: 12NM (CFIT LURE)',
          targetSubsystem: 'AN/APG-77 Radar Display Bus',
          requiresLayer: 'f35DataDiodeQuarantine' as keyof HardeningArchitectureConfig,
          layerName: 'Layer 4: Unidirectional Data Diode',
          severity: 'HIGH' as const,
        },
        {
          source: 'Internal Avionics Bus' as const,
          vector: 'Barometric Altitude Tape Desynchronization',
          payload: 'ALT_SPOOF: 24,000 FT -> 41,500 FT (INDUCING LOW ALTITUDE RECOVERY DELAY)',
          targetSubsystem: 'Air Data Computer (ADC) & HUD Tape',
          requiresLayer: 'vmsInertialCrossCheck' as keyof HardeningArchitectureConfig,
          layerName: 'Layer 3: VMS Ring Laser Gyro Comparator',
          severity: 'CRITICAL' as const,
        },
        {
          source: 'Internal Avionics Bus' as const,
          vector: 'Datalink Session Key Harvest & Replay Attack',
          payload: 'REPLAY_FRAME: REPLAY_NONCE_STALE (SESSION KEY RETRO-EXPLOITATION)',
          targetSubsystem: 'IFDL Post-Quantum Crypto Wrapper',
          requiresLayer: 'cnsa2RekeyRatchet' as keyof HardeningArchitectureConfig,
          layerName: 'Layer 5: CNSA 2.0 Microsecond Ratchet',
          severity: 'HIGH' as const,
        },
      ];

      const chosen = vectors[Math.floor(Math.random() * vectors.length)];
      const isMitigated = hardeningConfig[chosen.requiresLayer];

      const newEvent: AttackVectorTelemetry = {
        id: `EA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
        source: chosen.source,
        vector: chosen.vector,
        payload: chosen.payload,
        targetSubsystem: chosen.targetSubsystem,
        status: isMitigated ? 'BLOCKED_BY_HARDENING' : 'INJECTED_COMPROMISED',
        mitigatingLayer: isMitigated ? chosen.layerName : 'UNPROTECTED (VULNERABLE)',
        severity: chosen.severity,
      };

      setAttackLogs((prev) => [newEvent, ...prev.slice(0, 39)]);
    }, 1400);

    return () => clearInterval(interval);
  }, [isAttackActive, hardeningConfig]);

  // Toggle helper for individual shields
  const toggleShield = (key: keyof HardeningArchitectureConfig) => {
    onUpdateHardeningConfig({
      ...hardeningConfig,
      [key]: !hardeningConfig[key],
    });
  };

  const enableAllShields = () => {
    onUpdateHardeningConfig({
      pqcBusGuardian: true,
      hudAttestedPipeline: true,
      vmsInertialCrossCheck: true,
      f35DataDiodeQuarantine: true,
      cnsa2RekeyRatchet: true,
    });
  };

  const disableAllShields = () => {
    onUpdateHardeningConfig({
      pqcBusGuardian: false,
      hudAttestedPipeline: false,
      vmsInertialCrossCheck: false,
      f35DataDiodeQuarantine: false,
      cnsa2RekeyRatchet: false,
    });
  };

  // Filtered attack logs
  const filteredLogs = useMemo(() => {
    if (logFilter === 'blocked') return attackLogs.filter((l) => l.status === 'BLOCKED_BY_HARDENING');
    if (logFilter === 'compromised') return attackLogs.filter((l) => l.status === 'INJECTED_COMPROMISED');
    return attackLogs;
  }, [attackLogs, logFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Threat Situation & Hardening Architecture Overview */}
      <div className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isAttackActive
          ? isFullyHardened
            ? 'border-emerald-500/60 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 shadow-emerald-950/40'
            : 'border-rose-500/70 bg-gradient-to-r from-zinc-950 via-rose-950/30 to-zinc-950 shadow-rose-950/40 animate-pulse'
          : 'border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 ${
                isAttackActive
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-bounce'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>THREAT SCENARIO: F-35 COMPROMISE & ELECTRONIC ATTACK</span>
              </span>

              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 ${
                isFullyHardened
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/60'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>HARDENING STATUS: {activeShieldsCount} / 5 SHIELDS ACTIVE</span>
              </span>

              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                NIST FIPS 204 (ML-DSA-65) ATTESTED
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wide uppercase flex items-center gap-3">
              <ShieldAlert className={`w-7 h-7 ${isAttackActive ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span>Avionics Bus & Cockpit HUD Anti-Electronic Attack Hardening</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Threat vector analysis: An adversary has compromised the joint inter-flight datalink through an interoperating <strong>F-35 Lightning II</strong>, seeking to execute malicious command injection into the internal <strong>MIL-STD-1553B bus</strong> and spoof the pilot&apos;s <strong>Cockpit Heads-Up Display (HUD)</strong>. The multi-tiered hardening architecture below enforces zero-trust hardware isolation, post-quantum cryptographic frame authentication, and out-of-band inertial cross-checks.
            </p>
          </div>

          {/* Master Attack Stimulator Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onToggleAttack(!isAttackActive)}
              className={`px-5 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-lg ${
                isAttackActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-rose-300 border border-rose-500/40 hover:border-rose-400'
              }`}
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>{isAttackActive ? '■ Halt Electronic Attack' : '▶ Simulate F-35 Electronic Attack'}</span>
            </button>

            <button
              type="button"
              onClick={isFullyHardened ? disableAllShields : enableAllShields}
              className={`px-4 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                isFullyHardened
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isFullyHardened ? 'Reset Hardening' : 'Engage All 5 Hardening Shields'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Threat / Defense Banner Status */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Threat Injection State:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isAttackActive ? 'bg-rose-950 text-rose-300 border border-rose-600' : 'bg-zinc-900 text-zinc-400'
              }`}>
                {isAttackActive ? 'ACTIVE MALICIOUS ELECTRONIC INJECTION' : 'STANDBY / PASSIVE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Cockpit HUD Integrity:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isAttackActive
                  ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
              }`}>
                {isAttackActive
                  ? hardeningConfig.hudAttestedPipeline && hardeningConfig.vmsInertialCrossCheck
                    ? 'PROTECTED (PQC ATTESTED & GROUND-TRUTH LOCKED)'
                    : 'COMPROMISED (SPOOFED PITCH & GHOST TRACKS ACTIVE)'
                  : 'NOMINAL (CLEAN GLASS)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span>DO-178C Level A Safety Guarantee:</span>
            <span className={isFullyHardened ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {isFullyHardened ? '100% WCET & PARTITIONING CERTIFIED' : 'VULNERABILITY SURFACE DETECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Layer Hardening Architecture Defense Matrix */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>5-Layer Architectural Defense & Anti-Tamper Hardening Controls</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            Click switches to toggle individual cryptographic and hardware isolation shields.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Layer 1: PQC Bus Guardian */}
          <div
            onClick={() => toggleShield('pqcBusGuardian')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              hardeningConfig.pqcBusGuardian
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-750 text-zinc-300">
                LAYER 1
              </span>
              <div className={`w-3 h-3 rounded-full ${hardeningConfig.pqcBusGuardian ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>PQC Bus Guardian</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                SEM-E Hardware Arbiter ASIC drops unauthenticated 1553B frames lacking <strong>FIPS 204 ML-DSA-65</strong> authentication tags + anti-replay nonces.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Bus Injection Defense:</span>
              <span className={`font-bold ${hardeningConfig.pqcBusGuardian ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {hardeningConfig.pqcBusGuardian ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Layer 2: Attested HUD Pipeline */}
          <div
            onClick={() => toggleShield('hudAttestedPipeline')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              hardeningConfig.hudAttestedPipeline
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-750 text-zinc-300">
                LAYER 2
              </span>
              <div className={`w-3 h-3 rounded-full ${hardeningConfig.hudAttestedPipeline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
                <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Attested HUD Pipeline</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                CIP 1 stroke generator cryptographically signs every raster vector. HUD glass Display Verification Controller rejects unverified stroke vectors.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">HUD Glass Tamper Guard:</span>
              <span className={`font-bold ${hardeningConfig.hudAttestedPipeline ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {hardeningConfig.hudAttestedPipeline ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Layer 3: VMS Inertial Ground-Truth Cross-Check */}
          <div
            onClick={() => toggleShield('vmsInertialCrossCheck')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              hardeningConfig.vmsInertialCrossCheck
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-750 text-zinc-300">
                LAYER 3
              </span>
              <div className={`w-3 h-3 rounded-full ${hardeningConfig.vmsInertialCrossCheck ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
                <Crosshair className="w-4 h-4 text-purple-400 shrink-0" />
                <span>VMS Inertial Cross-Check</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                Quadruplex Ring Laser Gyros (RLG) in VMS feed hardware comparator. Automatically locks HUD pitch ladder to true inertial ground truth ($0.0^\circ$ drift).
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Anti-Disorientation Guard:</span>
              <span className={`font-bold ${hardeningConfig.vmsInertialCrossCheck ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {hardeningConfig.vmsInertialCrossCheck ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Layer 4: Unidirectional Data Diode Quarantine */}
          <div
            onClick={() => toggleShield('f35DataDiodeQuarantine')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              hardeningConfig.f35DataDiodeQuarantine
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-750 text-zinc-300">
                LAYER 4
              </span>
              <div className={`w-3 h-3 rounded-full ${hardeningConfig.f35DataDiodeQuarantine ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
                <Server className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hardware Data Diode</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                Physical optical data diode isolates the F-35 gateway into an untrusted DMZ partition on CIP 2, completely preventing rogue bus controller takeover.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Gateway Isolation:</span>
              <span className={`font-bold ${hardeningConfig.f35DataDiodeQuarantine ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {hardeningConfig.f35DataDiodeQuarantine ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Layer 5: CNSA 2.0 Rekey Ratchet */}
          <div
            onClick={() => toggleShield('cnsa2RekeyRatchet')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              hardeningConfig.cnsa2RekeyRatchet
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-750 text-zinc-300">
                LAYER 5
              </span>
              <div className={`w-3 h-3 rounded-full ${hardeningConfig.cnsa2RekeyRatchet ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase">
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Lattice Rekey Ratchet</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                FIPS 203 ML-KEM-768 dynamic ratcheting changes ephemeral keys every 2.0 seconds, defeating replay, key harvesting, and MITM attacks.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Forward Secrecy:</span>
              <span className={`font-bold ${hardeningConfig.cnsa2RekeyRatchet ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {hardeningConfig.cnsa2RekeyRatchet ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Sub-Panels with View Switcher */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Mitigation Architecture & Forensics Inspector</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Inspect how the signal path neutralizes rogue bus words and prevents HUD stroke corruption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSelectedMitigationView('architecture-diagram')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedMitigationView === 'architecture-diagram'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Signal Path Diagram</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMitigationView('hud-crosscheck')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedMitigationView === 'hud-crosscheck'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HUD Anti-Spoof Crosscheck</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMitigationView('threat-forensics')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedMitigationView === 'threat-forensics'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Threat Intercept Log</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Interactive Signal Path & Attack Flow Diagram */}
        {selectedMitigationView === 'architecture-diagram' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-zinc-850 bg-black space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3 font-mono text-xs">
                <span className="text-zinc-400">
                  Signal Flow: Compromised F-35 Gateway → Internal Avionics Bus → Cockpit HUD Glass
                </span>
                <span className={isAttackActive ? (isFullyHardened ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold') : 'text-zinc-500'}>
                  {isAttackActive
                    ? isFullyHardened
                      ? '● ATTACK INTERCEPTED BY HARDENED GUARDS'
                      : '▲ VULNERABILITY BREACH OCCURRING'
                    : '○ INACTIVE'}
                </span>
              </div>

              {/* Graphical Flow Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 relative font-mono text-xs">
                {/* Stage 1: Compromised F-35 Bridge */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isAttackActive ? 'border-rose-500/80 bg-rose-950/30' : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Threat Origin</span>
                    <Plane className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="font-bold text-white text-sm">F-35 MADL Bridge</div>
                  <p className="text-[11px] text-zinc-400">
                    Hostile malware attempts to inject rogue 1553B words & HUD symbology vectors.
                  </p>
                  <div className="text-[10px] text-rose-300 font-bold pt-1">
                    {isAttackActive ? '⚡ INJECTING ATTACK PAYLOAD' : 'NORMAL LINK'}
                  </div>
                </div>

                {/* Stage 2: Hardware Data Diode & DMZ Enclave */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  hardeningConfig.f35DataDiodeQuarantine
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isAttackActive
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Layer 4 Guard</span>
                    <Server className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="font-bold text-white text-sm">Hardware Data Diode</div>
                  <p className="text-[11px] text-zinc-400">
                    Physical optic diode prevents return control path. Isolates F-35 into untrusted DMZ.
                  </p>
                  <div className="text-[10px] font-bold pt-1">
                    {hardeningConfig.f35DataDiodeQuarantine ? (
                      <span className="text-emerald-400">✓ BUS MASTER TAKEOVER BLOCKED</span>
                    ) : (
                      <span className="text-rose-400">⚠ DIODE BYPASSED (UNHARDENED)</span>
                    )}
                  </div>
                </div>

                {/* Stage 3: PQC Bus Guardian Arbiter */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  hardeningConfig.pqcBusGuardian
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isAttackActive
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Layer 1 Guard</span>
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="font-bold text-white text-sm">PQC Bus Guardian</div>
                  <p className="text-[11px] text-zinc-400">
                    Hardware arbiter checks ML-DSA-65 signatures on 1553B frames. Cuts rogue frames in &lt;2 µs.
                  </p>
                  <div className="text-[10px] font-bold pt-1">
                    {hardeningConfig.pqcBusGuardian ? (
                      <span className="text-emerald-400">✓ 1553B INJECTIONS SHUNTED</span>
                    ) : (
                      <span className="text-rose-400">⚠ ROGUE BUS WORDS EXECUTED</span>
                    )}
                  </div>
                </div>

                {/* Stage 4: VMS Inertial RLG Comparator */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  hardeningConfig.vmsInertialCrossCheck
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isAttackActive
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Layer 3 Guard</span>
                    <Crosshair className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="font-bold text-white text-sm">VMS RLG Comparator</div>
                  <p className="text-[11px] text-zinc-400">
                    Quadruplex Ring Laser Gyros cross-check pitch/roll telemetry out-of-band.
                  </p>
                  <div className="text-[10px] font-bold pt-1">
                    {hardeningConfig.vmsInertialCrossCheck ? (
                      <span className="text-emerald-400">✓ GROUND TRUTH VERIFIED (0.0° DRIFT)</span>
                    ) : (
                      <span className="text-rose-400">⚠ PITCH LADDER SPOOFED +14°</span>
                    )}
                  </div>
                </div>

                {/* Stage 5: Cockpit HUD Glass */}
                <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                  hardeningConfig.hudAttestedPipeline
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isAttackActive
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Pilot Interface</span>
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white text-sm">Cockpit HUD Glass</div>
                  <p className="text-[11px] text-zinc-400">
                    Anti-tamper DVM validates cryptographic watermark hash before raster projection.
                  </p>
                  <div className="text-[10px] font-bold pt-1">
                    {hardeningConfig.hudAttestedPipeline ? (
                      <span className="text-emerald-400">✓ [ATTESTED] CLEAN GLASS</span>
                    ) : (
                      <span className="text-rose-400">⚠ SPOOFED SYMBOLOGY SHOWN</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons to test HUD and Bus directly */}
              <div className="pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-zinc-400">
                  Verify effects live in the Cockpit or Bus Monitor:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchSubTab) onSwitchSubTab('cockpit');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <span>View Cockpit HUD Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchSubTab) onSwitchSubTab('bus');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-200 cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <span>View MIL-1553B Bus Monitor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: HUD Anti-Spoof Crosscheck Comparison */}
        {selectedMitigationView === 'hud-crosscheck' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unhardened Attack State Preview */}
              <div className="p-5 rounded-xl border border-rose-500/40 bg-black space-y-3">
                <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
                  <span className="text-rose-400 font-bold uppercase flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Unhardened State (Adversary Controls HUD)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-700">
                    VULNERABLE
                  </span>
                </div>

                <div className="space-y-2 text-zinc-300 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                    <strong className="text-rose-300">Pitch Ladder Offset (+14.2° Spoof):</strong>
                    <p className="text-zinc-400 mt-0.5">
                      Adversary shifts attitude bars to indicate level flight while airframe is in steep dive, causing pilot spatial disorientation and CFIT hazard.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                    <strong className="text-rose-300">Phantom Ghost Target Injection (TRK-99):</strong>
                    <p className="text-zinc-400 mt-0.5">
                      F-35 bridge injects false missile lock box and ghost bandit cue on HUD glass, baiting defensive maneuvers into real SAM radar envelopes.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                    <strong className="text-rose-300">Corrupted Barometric Altitude:</strong>
                    <p className="text-zinc-400 mt-0.5">
                      Altimeter reads 41,500 ft when aircraft is actually at 24,000 ft, compromising weapon employment envelopes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardened Mitigated State Preview */}
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-black space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                  <span className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hardened State (PQC Attested & Ground-Truth Locked)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                    MITIGATED
                  </span>
                </div>

                <div className="space-y-2 text-zinc-300 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <strong className="text-emerald-300">VMS Quadruplex Ring Laser Gyro Lock:</strong>
                    <p className="text-zinc-400 mt-0.5">
                      Physical inertial sensors override any bus telemetry. Pitch ladder is physically anchored to VMS inertial ground truth with $0.0^\circ$ drift.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <strong className="text-emerald-300">Display Verification Controller (DVM) Hash:</strong>
                    <p className="text-zinc-400 mt-0.5">
                      Every stroke vector requires ML-DSA-65 signature from CIP 1 enclave. Ghost targets injected without valid signature are 100% blocked from glass.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <strong className="text-emerald-300">Cryptographic Pilot Watermark:</strong>
                    <p className="text-zinc-400 mt-0.5">
                      HUD projects glowing watermark <code>[PQC ATTESTED · CIP-1 HW]</code> assuring pilot of authentic flight director symbology.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Live Threat Intercept Log */}
        {selectedMitigationView === 'threat-forensics' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Filter Event Status:</span>
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setLogFilter('all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      logFilter === 'all' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({attackLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('blocked')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      logFilter === 'blocked' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    Blocked ({attackLogs.filter((l) => l.status === 'BLOCKED_BY_HARDENING').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogFilter('compromised')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      logFilter === 'compromised' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-white'
                    }`}
                  >
                    Compromised ({attackLogs.filter((l) => l.status === 'INJECTED_COMPROMISED').length})
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttackLogs([])}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear forensic log</span>
              </button>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-black overflow-x-auto max-h-96">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase tracking-wider border-b border-zinc-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Threat Vector</th>
                    <th className="py-2.5 px-3">Injected Payload</th>
                    <th className="py-2.5 px-3">Target Subsystem</th>
                    <th className="py-2.5 px-3">Hardening Verdict</th>
                    <th className="py-2.5 px-3 text-right">Mitigating Shield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500">
                        {isAttackActive ? 'Listening for threat vectors...' : 'Simulate F-35 attack above to stream forensic events.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-2 px-3 text-zinc-300 font-bold">{log.id}</td>
                        <td className="py-2 px-3 text-zinc-400">{log.timestamp}</td>
                        <td className="py-2 px-3 text-zinc-200 font-semibold">{log.vector}</td>
                        <td className="py-2 px-3 text-rose-300 text-[11px] max-w-xs truncate">{log.payload}</td>
                        <td className="py-2 px-3 text-cyan-300">{log.targetSubsystem}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'BLOCKED_BY_HARDENING'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                          }`}>
                            {log.status === 'BLOCKED_BY_HARDENING' ? 'BLOCKED & SHUNTED' : 'INJECTED (VULNERABLE)'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-400 text-[11px]">
                          {log.mitigatingLayer}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Technical Hardening Specification: Cryptographic & Architecture Blueprint */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
        <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Technical Architecture Blueprint: Mitigation Standards Compliance</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="text-cyan-400 font-bold uppercase text-[11px]">1. MIL-STD-1553B Authenticated Protocol</div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Enhances legacy 1553B with a 64-bit truncated <strong>ML-DSA-65</strong> MAC in word 31 of command frames + a 32-bit hardware timestamp counter to guarantee zero unauthenticated command injection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="text-emerald-400 font-bold uppercase text-[11px]">2. Cockpit HUD Root of Trust</div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Display Verification Controller (DVM) in HUD optics rejects any stroke vector lacking cryptographic attestation from the CIP 1 DO-178C Level A partition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="text-purple-400 font-bold uppercase text-[11px]">3. VMS Quadruplex Cross-Check</div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Hardware voting comparator directly links quadruplex Honeywell Ring Laser Gyros to the HUD symbol generator, enforcing physical ground-truth override.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
