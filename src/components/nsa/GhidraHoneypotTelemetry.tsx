import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Flame,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  Terminal,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  Activity,
  Layers,
  Lock,
  Zap,
  Server,
  FileCode,
  Globe,
  Key,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  GhidraHoneypot,
  HoneypotTelemetryEvent,
  HoneypotType,
} from '../../types/nsaSoftware';
import { nsaService } from '../../services/nsaService';

interface GhidraHoneypotTelemetryProps {
  onNotify?: (msg: string) => void;
  onNavigateToWalkoff?: () => void;
}

export const GhidraHoneypotTelemetry: React.FC<GhidraHoneypotTelemetryProps> = ({
  onNotify,
  onNavigateToWalkoff,
}) => {
  const [honeypots, setHoneypots] = useState<GhidraHoneypot[]>([]);
  const [events, setEvents] = useState<HoneypotTelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedHoneypotId, setSelectedHoneypotId] = useState<string>('hp-rmi-decoy');
  const [customAttackerIp, setCustomAttackerIp] = useState<string>('198.51.100.94');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lockdownResult, setLockdownResult] = useState<any | null>(null);
  const [isLockingDown, setIsLockingDown] = useState<boolean>(false);
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);

  // New trap form state
  const [newTrapName, setNewTrapName] = useState<string>('');
  const [newTrapType, setNewTrapType] = useState<HoneypotType>('CANARY_BINARY_TRAP');
  const [newTrapSurface, setNewTrapSurface] = useState<string>('/analysis_queue/canary_pqc_vault.elf');
  const [newTrapDescription, setNewTrapDescription] = useState<string>('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [hpRes, evtRes] = await Promise.all([
        nsaService.getHoneypots(),
        nsaService.getHoneypotEvents(),
      ]);
      setHoneypots(hpRes.honeypots);
      setEvents(evtRes.events);
      if (hpRes.honeypots.length > 0 && !selectedHoneypotId) {
        setSelectedHoneypotId(hpRes.honeypots[0].id);
      }
    } catch (err) {
      console.error('Failed to load honeypot telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateProbe = async (targetId?: string) => {
    const idToProbe = targetId || selectedHoneypotId;
    setIsSimulating(true);
    try {
      const res = await nsaService.simulateHoneypotProbe(idToProbe, customAttackerIp);
      // Update local states
      setHoneypots((prev) =>
        prev.map((h) => (h.id === res.honeypot.id ? res.honeypot : h))
      );
      setEvents((prev) => [res.event, ...prev.filter((e) => e.id !== res.event.id)]);
      if (onNotify) {
        onNotify(`🚨 CANARY TRIPPED: ${res.honeypot.name} triggered by ${res.event.attackerSignature.sourceIp}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetAlarms = async () => {
    try {
      await nsaService.resetHoneypotAlarms();
      setHoneypots((prev) =>
        prev.map((h) => ({ ...h, status: 'ACTIVE_LISTENING' }))
      );
      if (onNotify) onNotify('All honeypot alarms reset to ACTIVE_LISTENING');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyLockdown = async () => {
    setIsLockingDown(true);
    try {
      const res = await nsaService.triggerEmergencyLockdown();
      setLockdownResult(res);
      if (onNotify) {
        onNotify('EMERGENCY LOCKDOWN EXECUTED: All Ghidra workers isolated & seccomp jails sealed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLockingDown(false);
    }
  };

  const handleDeployTrap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await nsaService.deployHoneypotTrap({
        name: newTrapName || 'Custom Canary Honeytrap',
        type: newTrapType,
        decoySurface: newTrapSurface,
        description: newTrapDescription || 'Defensive honeypot decoy deployed to monitor Ghidra workspace.',
      });
      setHoneypots((prev) => [...prev, res.deployedTrap]);
      setShowDeployModal(false);
      setNewTrapName('');
      setNewTrapDescription('');
      if (onNotify) onNotify(`Deployed honeypot: ${res.deployedTrap.name}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportStix = () => {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      spec_version: '2.1',
      objects: events.map((evt) => ({
        type: 'indicator',
        id: `indicator--${evt.id}`,
        created: evt.timestamp,
        modified: evt.timestamp,
        name: `Honeypot Breach Attempt: ${evt.honeypotName}`,
        description: evt.telemetryDetails,
        indicator_types: ['compromised-workstation', 'malicious-probe'],
        pattern: `[ipv4-addr:value = '${evt.attackerSignature.sourceIp}']`,
        pattern_type: 'stix',
        valid_from: evt.timestamp,
        labels: ['honeypot-telemetry', 'ghidra-compromise', evt.severity.toLowerCase()],
        custom_mitigation: evt.mitigationTaken,
      })),
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghidra-honeypot-stix2.1-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === 'ALL') return true;
    return e.severity === filterSeverity;
  });

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;
  const highCount = events.filter((e) => e.severity === 'HIGH').length;
  const mediumCount = events.filter((e) => e.severity === 'MEDIUM').length;

  const getTypeIcon = (type: HoneypotType) => {
    switch (type) {
      case 'RMI_SERVER_DECOY':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'CANARY_BINARY_TRAP':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'SLEIGH_SPEC_DECOY':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'CREDENTIAL_BREADCRUMB':
        return <Key className="w-4 h-4 text-purple-400" />;
      case 'NETWORK_BEACON_TRAP':
        return <Globe className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Incident & Deception Architecture Status */}
      <div className="p-5 rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-zinc-950 to-blue-950/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white flex items-center gap-1.5 uppercase shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                Ghidra SRE Compromised · Architecture Hardened
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                Active Deception Grid ({honeypots.length} Honeypots Armed)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700">
                MITRE D3FEND: Decoy Environment & Canary Tokens
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Ghidra Zero-Trust Hardening & Defensive Honeypot Telemetry Console
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Assuming direct adversary compromise of the Ghidra reverse-engineering workstation. The architecture severs Java RMI and host IPC, isolates workers into air-gapped <code className="text-cyan-300">Firecracker/seccomp</code> microVMs, and deploys high-interaction honeypots (RMI decoys, canary binaries, SLEIGH spec tripwires, and breadcrumb tokens) for early intrusion detection and real-time telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleEmergencyLockdown}
              disabled={isLockingDown}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/60"
            >
              <Lock className="w-4 h-4" />
              <span>{isLockingDown ? 'Executing Lockdown...' : 'Emergency Host Lockdown'}</span>
            </button>

            <button
              onClick={() => setShowDeployModal(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Canary Trap</span>
            </button>

            <button
              onClick={handleResetAlarms}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all cursor-pointer flex items-center gap-2"
              title="Reset all honeypots to ACTIVE_LISTENING"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Re-arm Tripwires</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Lockdown Report Modal / Banner */}
      {lockdownResult && (
        <div className="p-4 rounded-xl border border-emerald-500/60 bg-emerald-950/40 text-emerald-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Emergency Lockdown Executed ({lockdownResult.lockdownId})</span>
            </div>
            <button
              onClick={() => setLockdownResult(null)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lockdownResult.actionsExecuted.map((act: string, idx: number) => (
              <div
                key={idx}
                className="p-2 rounded bg-zinc-950/80 border border-emerald-800/40 text-[11px] font-mono text-zinc-300 flex items-start gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Armed Decoy Honeypots</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">{honeypots.length}</span>
            <span className="text-xs text-emerald-400 font-mono">100% Active</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            RMI listeners, Canary ELFs, SLEIGH traps & breadcrumbs
          </p>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Tripped Canary Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {events.length}
            </span>
            <span className="text-xs text-rose-400 font-mono">
              ({criticalCount} Critical, {highCount} High)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Intrusion attempts intercepted prior to data access
          </p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Adversary Fingerprints</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {new Set(events.map((e) => e.attackerSignature.sourceIp)).size}
            </span>
            <span className="text-xs text-purple-400 font-mono">Isolated in Null Netns</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Unique attacker IPs & tools fingerprinted via decoy probes
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Automated Containment</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300">&lt; 12 ms</span>
            <span className="text-xs text-emerald-400 font-mono">Kernel eBPF</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Instant PID termination and network socket severing
          </p>
        </div>
      </div>

      {/* Main Grid: Honeypot Fleet on Left, Adversary Simulator & Event Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Honeypots Fleet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Honeypot Fleet ({honeypots.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Click to Select & Probe</span>
            </div>

            <div className="space-y-3">
              {honeypots.map((hp) => {
                const isSelected = hp.id === selectedHoneypotId;
                const isTripped = hp.status === 'TRIPPED_ALARM';

                return (
                  <div
                    key={hp.id}
                    onClick={() => setSelectedHoneypotId(hp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/20 shadow-md ring-1 ring-blue-500/40'
                        : isTripped
                        ? 'border-rose-800/80 bg-zinc-950 hover:border-rose-600'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                          {getTypeIcon(hp.type)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">
                            {hp.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {hp.decoySurface}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            isTripped
                              ? 'bg-rose-950 border border-rose-500 text-rose-300 animate-pulse'
                              : 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                          }`}
                        >
                          {hp.status === 'TRIPPED_ALARM' ? 'ALARM TRIPPED' : 'ARMED / LISTENING'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Tripped: {hp.tripCount}x
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {hp.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                        {hp.mitreDefendTactic}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateProbe(hp.id);
                        }}
                        disabled={isSimulating}
                        className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Simulate Probe</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Architecture Hardening Checklist */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ghidra Workstation Hardening Verification</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-300">Java RMI Server Port 13100</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  SEVERED / HONEYPOT DECOY
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-300">Native Decompiler Execution</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  FIRECRACKER SECCOMP MICROVM
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-300">SLEIGH .sla Spec Tamper Protection</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  FIPS 204 ML-DSA-87 SIGNED
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-300">Binary Lifter Quorum</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  3-WAY BFT (RIZIN + ANGR + GHIDRA)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Adversary Probe Simulator & Live Telemetry Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Adversary Probe Simulator */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Adversary Probe Simulation Console
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Test Detection & Automated Containment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Target Honeypot Decoy</label>
                <select
                  value={selectedHoneypotId}
                  onChange={(e) => setSelectedHoneypotId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-blue-500"
                >
                  {honeypots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Simulated Adversary IP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAttackerIp}
                    onChange={(e) => setCustomAttackerIp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="198.51.100.94"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomAttackerIp(
                        `198.51.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`
                      )
                    }
                    className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    title="Randomize IP"
                  >
                    Rand
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="text-[11px] text-zinc-400">
                Selected: <strong className="text-zinc-200">{honeypots.find((h) => h.id === selectedHoneypotId)?.name}</strong>
              </div>
              <button
                type="button"
                onClick={() => handleSimulateProbe()}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-rose-950/50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Transmitting Probe...' : 'Fire Adversary Probe into Honeypot'}</span>
              </button>
            </div>
          </div>

          {/* Live Honeypot Telemetry Event Stream */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Real-Time Honeypot Telemetry Stream ({filteredEvents.length})
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <Filter className="w-3 h-3 text-zinc-400" />
                  <span className="text-zinc-400">Filter:</span>
                  {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        filterSeverity === sev
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportStix}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                  title="Export STIX 2.1 Threat Intel Bundle"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>STIX 2.1 Export</span>
                </button>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                No telemetry events matching filter. Fire a probe using the console above!
              </div>
            ) : (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                      evt.severity === 'CRITICAL'
                        ? 'border-rose-500/50 bg-rose-950/20'
                        : evt.severity === 'HIGH'
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : evt.severity === 'HIGH'
                              ? 'bg-amber-600 text-black'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {evt.severity}
                        </span>
                        <span className="font-bold text-white text-xs">{evt.honeypotName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(evt.timestamp).toLocaleTimeString()} ·{' '}
                        {new Date(evt.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 font-mono text-[11px]">
                      <div>
                        <span className="text-zinc-500">Attacker IP: </span>
                        <span className="text-rose-400 font-bold">
                          {evt.attackerSignature.sourceIp}
                          {evt.attackerSignature.sourcePort ? `:${evt.attackerSignature.sourcePort}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Tool / Agent: </span>
                        <span className="text-cyan-300">
                          {evt.attackerSignature.userAgentOrTool || 'Automated Scanner'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500">Payload Fingerprint: </span>
                        <code className="text-amber-300 break-all">
                          {evt.attackerSignature.payloadFingerprint}
                        </code>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 leading-relaxed">
                      {evt.telemetryDetails}
                    </div>

                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2 text-[11px] text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Defensive Action:</strong> {evt.mitigationTaken}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deploy Custom Canary Trap Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Deploy Defensive Canary Honeypot</span>
              </h3>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleDeployTrap} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Honeypot Decoy Name</label>
                <input
                  type="text"
                  required
                  value={newTrapName}
                  onChange={(e) => setNewTrapName(e.target.value)}
                  placeholder="e.g. Canary Vault Private Key Decoy"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Decoy Category</label>
                <select
                  value={newTrapType}
                  onChange={(e) => setNewTrapType(e.target.value as HoneypotType)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="CANARY_BINARY_TRAP">Canary Binary Trap (Honey-ELF / Honey-PE)</option>
                  <option value="RMI_SERVER_DECOY">RMI Server Decoy (Java ObjectInputStream Trap)</option>
                  <option value="SLEIGH_SPEC_DECOY">SLEIGH Processor Spec Tripwire (.sla)</option>
                  <option value="CREDENTIAL_BREADCRUMB">Admin Credential Breadcrumb (.xml / .json)</option>
                  <option value="NETWORK_BEACON_TRAP">Network Egress Decoy Beacon Token (DNS/HTTP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Decoy Surface / Path / Port</label>
                <input
                  type="text"
                  required
                  value={newTrapSurface}
                  onChange={(e) => setNewTrapSurface(e.target.value)}
                  placeholder="e.g. /analysis_queue/cnsa_key_vault.elf"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Defensive Description</label>
                <textarea
                  rows={3}
                  value={newTrapDescription}
                  onChange={(e) => setNewTrapDescription(e.target.value)}
                  placeholder="Describes how this decoy intercepts unauthorized discovery or tampering..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Deploy Honeypot Trap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
