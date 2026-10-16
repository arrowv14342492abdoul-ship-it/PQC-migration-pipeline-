import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Server,
  Zap,
  Flame,
  Terminal,
  Activity,
  Download,
  Filter,
  Check,
  Copy,
  Play,
  RotateCw,
  Cpu,
  Lock,
  Layers,
  FileCode,
  Gauge,
  Key,
  Globe,
  Radar,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  DecoyTlsEndpoint,
  HoneypotSecurityLog,
  HoneypotExploitSignature,
  HoneypotTelemetrySummary,
  LiboqsKemAlgorithm,
  LiboqsSigAlgorithm,
} from '../../types/defenseHoneypot';
import {
  INITIAL_DECOY_ENDPOINTS,
  INITIAL_HONEYPOT_LOGS,
  EXPLOIT_SIGNATURE_CATALOG,
  recordHoneypotProbe,
  getHoneypotTelemetrySummary,
  generateDummyLiboqsPrimitives,
  subscribeToF22HoneypotTelemetry,
} from '../../utils/defenseHoneypotLogger';

interface DefenseHoneypotProps {
  onTelemetryFeed?: (log: HoneypotSecurityLog) => void;
  onNavigateToF22Telemetry?: () => void;
  isEmbeddedInF22?: boolean;
}

export const DefenseHoneypot: React.FC<DefenseHoneypotProps> = ({
  onTelemetryFeed,
  onNavigateToF22Telemetry,
  isEmbeddedInF22 = false,
}) => {
  const [endpoints, setEndpoints] = useState<DecoyTlsEndpoint[]>([...INITIAL_DECOY_ENDPOINTS]);
  const [logs, setLogs] = useState<HoneypotSecurityLog[]>([...INITIAL_HONEYPOT_LOGS]);
  const [summary, setSummary] = useState<HoneypotTelemetrySummary>(getHoneypotTelemetrySummary());
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ep-ifdl-8443');
  const [selectedScenario, setSelectedScenario] = useState<
    | 'QUANTUM_DOWNGRADE'
    | 'LATTICE_MODULUS_ATTACK'
    | 'ROGUE_IFDL_IMPERSONATION'
    | 'BUFFER_FUZZING'
    | 'HEARTBEAT_MEMORY_LEAK'
    | 'NORMAL_DECOY_PROBE'
  >('QUANTUM_DOWNGRADE');
  const [customIp, setCustomIp] = useState<string>('198.51.100.42');
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [lastLoggedEvent, setLastLoggedEvent] = useState<HoneypotSecurityLog | null>(
    INITIAL_HONEYPOT_LOGS[0] || null
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedEndpointForDetail, setSelectedEndpointForDetail] = useState<DecoyTlsEndpoint | null>(
    INITIAL_DECOY_ENDPOINTS[0]
  );
  const [dummyPrimitives, setDummyPrimitives] = useState<any>(
    generateDummyLiboqsPrimitives('ML-KEM-1024', 'ML-DSA-87')
  );

  useEffect(() => {
    // Subscribe to real-time events from logger
    const unsubscribe = subscribeToF22HoneypotTelemetry((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      setSummary(getHoneypotTelemetrySummary());
      setLastLoggedEvent(newLog);
      if (onTelemetryFeed) {
        onTelemetryFeed(newLog);
      }
    });

    return () => unsubscribe();
  }, [onTelemetryFeed]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLaunchProbe = () => {
    setIsProbing(true);
    setTimeout(() => {
      const newLog = recordHoneypotProbe(selectedEndpointId, selectedScenario, customIp);
      setEndpoints([...INITIAL_DECOY_ENDPOINTS]);
      setLogs([...INITIAL_HONEYPOT_LOGS]);
      setSummary(getHoneypotTelemetrySummary());
      setLastLoggedEvent(newLog);
      setIsProbing(false);

      if (onTelemetryFeed) {
        onTelemetryFeed(newLog);
      }
    }, 350);
  };

  const handleSelectEndpoint = (ep: DecoyTlsEndpoint) => {
    setSelectedEndpointId(ep.id);
    setSelectedEndpointForDetail(ep);
    setDummyPrimitives(generateDummyLiboqsPrimitives(ep.kemPrimitive, ep.sigPrimitive));
  };

  const handleExportStix = () => {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--f22-honeypot-${Date.now()}`,
      spec_version: '2.1',
      objects: logs.map((l) => ({
        type: 'indicator',
        id: `indicator--${l.id}`,
        created: l.timestamp,
        modified: l.timestamp,
        name: `F-22 Decoy TLS Tripwire: ${l.endpointName}`,
        description: l.containmentAction,
        pattern: `[ipv4-addr:value = '${l.clientIp}']`,
        pattern_type: 'stix',
        labels: [
          'defense-honeypot',
          'f22-avionics-telemetry',
          l.detectedSignature?.category || 'decoy-traffic',
          l.threatLevel.toLowerCase(),
        ],
        custom_avionics_bus: l.f22AvionicsTelemetryInjected.busChannelAlert,
        custom_bus_opcode: l.f22AvionicsTelemetryInjected.busOpcode,
        custom_hud_warning: l.f22AvionicsTelemetryInjected.hudWarningMessage,
      })),
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f22-defense-honeypot-stix2.1-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((l) => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'CRITICAL') return l.threatLevel === 'DEFCON_1_CRITICAL';
    if (filterSeverity === 'HIGH') return l.threatLevel === 'TACTICAL_HIGH';
    if (filterSeverity === 'PROBE') return l.threatLevel === 'PROBE_INTERCEPTED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Defense Honeypot & Avionics Telemetry Bridge */}
      <div className="p-5 rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-zinc-950 to-blue-950/50 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white flex items-center gap-1.5 uppercase shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                Defense Honeypot · Decoy TLS Endpoints
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                F-22 Avionics Telemetry Stream: LIVE SYNCED
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700">
                Dummy liboqs Primitives (ML-KEM & ML-DSA)
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Avionics Defense Honeypot & Quantum-Safe Decoy TLS Grid
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Deploys tactical decoy TLS listeners across F-22 avionics boundaries (IFDL Tactical Ingress, APG-77 Radar feed, VMS Maintenance, MIL-STD-1760 weapons diode). Employs dummy <code className="text-cyan-300">liboqs</code> primitives (FIPS 203 ML-KEM and FIPS 204 ML-DSA) to trap adversaries probing for classical downgrades, lattice modulus overflows, or rogue flight node impersonation. All security detections are streamed live into the F-22 CIP-1/CIP-2 telemetry bus and HUD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToF22Telemetry && (
              <button
                type="button"
                onClick={onNavigateToF22Telemetry}
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-950/50"
              >
                <Gauge className="w-4 h-4" />
                <span>Open F-22 Avionics HUD Stream</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportStix}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export STIX 2.1 Threat Intel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-rose-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Decoy TLS Endpoints</span>
            <Server className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {summary.totalDecoyEndpoints}
            </span>
            <span className="text-xs text-emerald-400 font-mono">100% Armed</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Ports 8443, 9443, 10443, 11443, 12443 with dummy liboqs
          </p>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Connections Trapped</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {summary.totalConnectionsIntercepted}
            </span>
            <span className="text-xs text-rose-400 font-mono">
              ({summary.criticalExploitsBlocked} Critical)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Unauthorized probes intercepted prior to avionics bus
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Quantum Downgrades Trapped</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {summary.downgradeAttemptsTrapped}
            </span>
            <span className="text-xs text-emerald-400 font-mono">100% Shielded</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            HNDL attacks attempting to strip ML-KEM/ML-DSA
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">CIP Telemetry Bridge</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300">50 Hz CYCLIC</span>
            <span className="text-xs text-emerald-400 font-mono">Synced</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Avg decoy handshake latency: {summary.averageHandshakeLatencyMs} ms
          </p>
        </div>
      </div>

      {/* Main Grid: Decoy TLS Fleet (Left 5 cols), Exploit Simulator & Telemetry Stream (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decoy Endpoints Fleet & Liboqs Keypair Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-rose-400" />
                <span>Decoy TLS Endpoints Fleet ({endpoints.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Click to Inspect liboqs</span>
            </div>

            <div className="space-y-3">
              {endpoints.map((ep) => {
                const isSelected = ep.id === selectedEndpointId;
                const hasAlerts = ep.activeExploitAlerts > 0;

                return (
                  <div
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-950/20 shadow-md ring-1 ring-rose-500/40'
                        : hasAlerts
                        ? 'border-amber-800/80 bg-zinc-950 hover:border-amber-600'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{ep.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-cyan-300">
                            Port {ep.port}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {ep.subsystemRole}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                          hasAlerts
                            ? 'bg-rose-950 border border-rose-500 text-rose-300 animate-pulse'
                            : 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                        }`}
                      >
                        {hasAlerts ? 'EXPLOIT INTERCEPTED' : 'ARMED / LISTENING'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-500 block">KEM Primitive:</span>
                        <span className="text-cyan-300 font-bold">{ep.kemPrimitive}</span>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-500 block">Signature:</span>
                        <span className="text-purple-300 font-bold">{ep.sigPrimitive}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {ep.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Trapped: {ep.totalProbesTrapped} Probes</span>
                      <span className="text-emerald-400">FIPS 203 / 204 Native</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dummy liboqs Keypair Inspector */}
          {selectedEndpointForDetail && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dummy liboqs Keypair & Certificate Parameters</span>
                </h4>
                <span className="text-[10px] font-mono text-purple-400 font-bold">
                  Cat {selectedEndpointForDetail.dummyKeyStats.claimedSecurityCategory}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1 font-mono text-[11px]">
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">X.509 Subject: </span>
                    <span className="text-zinc-200">{selectedEndpointForDetail.decoyCertSubject}</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Cipher Suite: </span>
                    <span className="text-cyan-300">{selectedEndpointForDetail.cipherSuite}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-500 block">Public Key Size:</span>
                    <span className="text-white font-bold">
                      {selectedEndpointForDetail.dummyKeyStats.publicKeyBytes.toLocaleString()} bytes
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-500 block">Ciphertext Size:</span>
                    <span className="text-white font-bold">
                      {selectedEndpointForDetail.dummyKeyStats.ciphertextBytes.toLocaleString()} bytes
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Generated Dummy Public Key (Hex):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(dummyPrimitives.publicKeyHex, 'pubkey')}
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'pubkey' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pubkey' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-300 truncate">
                    {dummyPrimitives.publicKeyHex}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Exploit Simulator Console & Live Avionics Telemetry Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Exploit Pattern Simulator Console */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Adversary Exploit Pattern & Signature Injector
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Tests Decoy TLS Interception & F-22 Telemetry Feed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Exploit Attack Pattern</label>
                <select
                  value={selectedScenario}
                  onChange={(e: any) => setSelectedScenario(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500"
                >
                  <option value="QUANTUM_DOWNGRADE">Quantum Downgrade Exploit (Strip PQC)</option>
                  <option value="LATTICE_MODULUS_ATTACK">Lattice Modulus Injection (NTT Overflow)</option>
                  <option value="ROGUE_IFDL_IMPERSONATION">Rogue IFDL Tactical Flight Node Spoof</option>
                  <option value="BUFFER_FUZZING">MIL-STD-1760 Buffer Overflow Fuzzing</option>
                  <option value="HEARTBEAT_MEMORY_LEAK">Avionics Heartbeat Memory Leak Probe</option>
                  <option value="NORMAL_DECOY_PROBE">Nominal Authorized Decoy Handshake</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Target Decoy Endpoint</label>
                <select
                  value={selectedEndpointId}
                  onChange={(e) => setSelectedEndpointId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500"
                >
                  {endpoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.name} (Port {ep.port})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Simulated Adversary IP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-hidden focus:border-rose-500"
                    placeholder="198.51.100.42"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomIp(
                        `198.51.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`
                      )
                    }
                    className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="text-[11px] text-zinc-400">
                Signature: <strong className="text-rose-400">{selectedScenario}</strong>
              </div>
              <button
                type="button"
                onClick={handleLaunchProbe}
                disabled={isProbing}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-rose-950/60"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isProbing ? 'Transmitting Handshake...' : 'Inject Probe into Decoy TLS Endpoint'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time F-22 Avionics Telemetry Bridge Output (Latest Event) */}
          {lastLoggedEvent && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-zinc-950 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>F-22 Telemetry Stream Real-Time Injection Result</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {new Date(lastLoggedEvent.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-emerald-900/50 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-rose-400 font-bold font-mono">
                    {lastLoggedEvent.f22AvionicsTelemetryInjected.hudWarningMessage}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
                    {lastLoggedEvent.f22AvionicsTelemetryInjected.busChannelAlert}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-300 pt-1 border-t border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block">CIP-1 Load Delta:</span>
                    <span className="text-amber-400 font-bold">
                      +{lastLoggedEvent.f22AvionicsTelemetryInjected.cip1CpuDeltaPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">TRNG Entropy Draw:</span>
                    <span className="text-cyan-300 font-bold">
                      +{lastLoggedEvent.f22AvionicsTelemetryInjected.trngEntropyDrawGbps} Gbps
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Bus Opcode:</span>
                    <span className="text-purple-300 font-bold">
                      {lastLoggedEvent.f22AvionicsTelemetryInjected.busOpcode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Honeypot Security Logs Stream */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Defense Honeypot Security Logs ({filteredLogs.length})
                </h4>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono">
                <Filter className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-400">Severity:</span>
                {(['ALL', 'CRITICAL', 'HIGH', 'PROBE'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      filterSeverity === sev
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => {
                const isCritical = log.threatLevel === 'DEFCON_1_CRITICAL';
                const isHigh = log.threatLevel === 'TACTICAL_HIGH';

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-all ${
                      isCritical
                        ? 'border-rose-500/50 bg-rose-950/20'
                        : isHigh
                        ? 'border-amber-500/40 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isCritical
                              ? 'bg-rose-600 text-white'
                              : isHigh
                              ? 'bg-amber-600 text-black'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {log.threatLevel}
                        </span>
                        <span className="font-bold text-white text-xs">{log.endpointName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {log.detectedSignature && (
                      <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-rose-300 font-bold font-mono text-[11px]">
                          <span>{log.detectedSignature.name}</span>
                          <span className="text-[10px]">{log.detectedSignature.cveReference}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          {log.detectedSignature.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px]">
                      <div>
                        <span className="text-zinc-500">Source: </span>
                        <span className="text-rose-400 font-bold">
                          {log.clientIp}:{log.clientPort}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Negotiated: </span>
                        <span className="text-cyan-300">
                          {log.simulatedHandshake.negotiatedKem} ({log.simulatedHandshake.handshakeDurationMs} ms)
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500">Packet Snippet: </span>
                        <code className="text-amber-300 break-all">{log.rawPayloadSnippet}</code>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2 text-[11px] text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Containment & Telemetry Action:</strong> {log.containmentAction}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
