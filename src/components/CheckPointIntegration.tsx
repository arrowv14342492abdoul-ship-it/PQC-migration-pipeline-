import React, { useState, useEffect } from 'react';
import { CheckPointSecurityStatus } from '../types/integrations';
import { enterpriseService } from '../services/enterpriseConnectors';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Radio,
  Lock,
  Network,
  Zap,
  ArrowRight,
  Server,
  Globe,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const CheckPointIntegration: React.FC = () => {
  const [status, setStatus] = useState<CheckPointSecurityStatus | null>(null);
  const [deployingPolicy, setDeployingPolicy] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    enterpriseService.getCheckPointStatus().then(setStatus);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeployPolicy = async () => {
    setDeployingPolicy(true);
    try {
      const updated = await enterpriseService.deployCheckPointQuantumPolicy();
      setStatus(updated);
      showToast(
        'Check Point Quantum Policy successfully deployed to all gateways (FIPS 203 ML-KEM enforced).'
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDeployingPolicy(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await enterpriseService.testCheckPointConnection();
      setTestResult(res);
      setTimeout(() => setTestResult(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setTestingConnection(false);
    }
  };

  if (!status) return null;

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-600/80 bg-zinc-900 text-emerald-300 shadow-xl text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Connector Strip */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Check Point Quantum Security Integration
                </h3>
                <span className="text-zinc-600">/</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Management API Connected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                <span>Management Server: <strong className="text-zinc-300 font-mono">{status.managementServer}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Defense Level: <strong className="text-emerald-400 font-mono">{status.quantumDefenseLevel}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Last Policy: <span className="text-zinc-400">{new Date(status.lastPolicyInstall).toLocaleTimeString()}</span></span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDeployPolicy}
              disabled={deployingPolicy}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${deployingPolicy ? 'animate-bounce' : ''}`} />
              <span>{deployingPolicy ? 'Enforcing Policy...' : 'Enforce FIPS 203 Policy'}</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-red-400" />
              <span>{testingConnection ? 'Testing API...' : 'Test SmartConsole API'}</span>
            </button>
          </div>
        </div>

        {/* API test feedback */}
        {testResult && (
          <div className="p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-xs flex items-center justify-between text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{testResult.message}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">
              Latency: {testResult.latencyMs}ms
            </span>
          </div>
        )}
      </div>

      {/* 2. Check Point Telemetry & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Quantum-Safe VPN Tunnels</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {status.metrics.quantumSafeTunnelsPercent}%
          </div>
          <p className="text-[11px] text-zinc-400">
            Encapsulated using NIST FIPS 203 ML-KEM-768 hybrid key agreement.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Packets Inspected Today</span>
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {status.metrics.totalInspectedPacketsM}M
          </div>
          <p className="text-[11px] text-zinc-400">
            Deep Packet Inspection verifying quantum-resilient TLS 1.3 ciphers.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">ThreatCloud AI Defense</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {status.metrics.blockedThreatsToday}
          </div>
          <p className="text-[11px] text-zinc-400">
            Zero-day exploits & classical cryptanalytic downgrade attacks prevented.
          </p>
        </div>
      </div>

      {/* 3. Managed Gateways Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Check Point Quantum Gateways ({status.gateways.length})
          </span>
          <span>Titan R81.20 Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {status.gateways.map((gw) => (
            <div
              key={gw.id}
              className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">{gw.name}</h4>
                  <div className="text-[11px] font-mono text-zinc-400">{gw.ipAddress}</div>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  {gw.status}
                </span>
              </div>

              <div className="space-y-1 text-xs border-t border-zinc-850 pt-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-zinc-200">{gw.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="text-zinc-200 font-mono">{gw.throughputGbps} Gbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantum VPN:</span>
                  <span className="text-emerald-400 font-mono">{gw.quantumVpnStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL Inspection:</span>
                  <span className="text-zinc-300 font-mono text-[11px]">{gw.sslInspectionMode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quantum-Safe IPsec / IKEv2 VPN Tunnels Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Active Quantum-Resilient Site-to-Site VPN Tunnels
          </span>
          <span className="font-mono text-emerald-400">IKEv2 + ML-KEM-768</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3.5 font-medium">Peer Node</th>
                <th className="py-2.5 px-3.5 font-medium">IKE Version & KEM</th>
                <th className="py-2.5 px-3.5 font-medium">Bulk Cipher</th>
                <th className="py-2.5 px-3.5 font-medium">Status</th>
                <th className="py-2.5 px-3.5 font-medium">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {status.tunnels.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-zinc-100">{t.peerName}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{t.peerIp}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-mono text-emerald-400">{t.ikeVersion}</div>
                    <div className="text-[11px] text-zinc-400">{t.kemAlgorithm}</div>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-zinc-300">
                    {t.encryptionCipher}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-zinc-400">
                    {t.uptimeHours} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
