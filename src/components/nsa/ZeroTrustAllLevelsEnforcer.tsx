import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  UserX,
  UserCheck,
  AlertTriangle,
  Radio,
  RotateCw,
  Terminal,
  Cpu,
  Layers,
  Key,
  Flame,
  CheckCircle2,
  FileCode,
  Shield,
  Server,
  Activity,
  Copy,
  Check,
  Eye,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ZeroTrustGlobalStatus,
  ZeroTrustPillarControl,
  CompromisedPersonnelRecord,
  TwoPersonAuthorizationRequest,
  ZeroTrustPillar,
} from '../../types/nsaSoftware';
import { nsaService } from '../../services/nsaService';

interface ZeroTrustAllLevelsEnforcerProps {
  onNotify?: (msg: string) => void;
  onNavigateToHoneypots?: () => void;
}

export const ZeroTrustAllLevelsEnforcer: React.FC<ZeroTrustAllLevelsEnforcerProps> = ({
  onNotify,
  onNavigateToHoneypots,
}) => {
  const [status, setStatus] = useState<ZeroTrustGlobalStatus | null>(null);
  const [pillars, setPillars] = useState<ZeroTrustPillarControl[]>([]);
  const [personnel, setPersonnel] = useState<CompromisedPersonnelRecord[]>([]);
  const [requests, setRequests] = useState<TwoPersonAuthorizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLockingDown, setIsLockingDown] = useState<boolean>(false);
  const [lockdownResult, setLockdownResult] = useState<any | null>(null);

  // Form to isolate a new personnel
  const [newSuspectId, setNewSuspectId] = useState<string>('');
  const [newSuspectReason, setNewSuspectReason] = useState<string>('');
  const [isQuarantining, setIsQuarantining] = useState<boolean>(false);

  // Filter pillar
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, pillarsRes, personnelRes, requestsRes] = await Promise.all([
        nsaService.getZeroTrustStatus(),
        nsaService.getZeroTrustPillars(),
        nsaService.getCompromisedPersonnel(),
        nsaService.getTwoPersonRequests(),
      ]);
      setStatus(statusRes);
      setPillars(pillarsRes.pillars);
      setPersonnel(personnelRes.roster);
      setRequests(requestsRes.requests);
    } catch (err) {
      console.error('Failed to load Zero Trust data:', err);
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

  const handleEnforceAllLevels = async () => {
    setIsLockingDown(true);
    try {
      const res = await nsaService.enforceZeroTrustAllLevels();
      setLockdownResult(res);
      await loadData();
      if (onNotify) {
        onNotify('GLOBAL ZERO TRUST ENFORCED: Implicit trust revoked across all personnel.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLockingDown(false);
    }
  };

  const handleQuarantinePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuspectId) return;
    setIsQuarantining(true);
    try {
      const res = await nsaService.quarantinePersonnel(
        newSuspectId,
        newSuspectReason || 'Compromised personnel zero-trust immediate isolation'
      );
      setPersonnel((prev) => [res.record, ...prev.filter((p) => p.id !== res.record.id)]);
      setNewSuspectId('');
      setNewSuspectReason('');
      if (onNotify) {
        onNotify(`ISOLATION ENFORCED: ${res.record.name} quarantined in null netns microVM.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuarantining(false);
    }
  };

  const handleApproveTwoPerson = async (
    reqId: string,
    approverId: string,
    approverName: string
  ) => {
    try {
      const res = await nsaService.approveTwoPersonAuth(reqId, approverId, approverName);
      setRequests((prev) => prev.map((r) => (r.id === res.request.id ? res.request : r)));
      if (onNotify) {
        onNotify(`TWO-PERSON INTEGRITY SIGNED: ${approverName} ratified request ${reqId}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPillars = pillars.filter((p) => {
    if (selectedPillarFilter === 'ALL') return true;
    return p.pillar === selectedPillarFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Compromised Personnel & Zero Trust Architecture Alert */}
      <div className="p-5 rounded-2xl border border-rose-500/60 bg-gradient-to-r from-rose-950/80 via-zinc-950 to-amber-950/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white flex items-center gap-1.5 uppercase shadow-sm animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                CRITICAL: COMPROMISED NSA PERSONNEL CONTAINMENT ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Trust Enforced Across All 6 Pillars
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700">
                Two-Person Integrity (2-of-3 M-of-N Quorum)
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Zero Trust All-Levels Architecture & Insider Threat Neutralization
            </h3>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Assuming direct adversary compromise of internal personnel within the research and engineering directorate. <strong>Implicit trust is completely abolished</strong> across all ranks and clearances. No single operator or administrator can commit code, export private keys, or alter decompiler verification rules unilaterally. Workstations are isolated in confidential microVMs, lateral movement is severed, and all actions require cryptographic dual-authorization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleEnforceAllLevels}
              disabled={isLockingDown}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/60"
            >
              <Lock className="w-4 h-4" />
              <span>{isLockingDown ? 'Enforcing Global Lockdown...' : 'Enforce Zero Trust on All Levels'}</span>
            </button>

            {onNavigateToHoneypots && (
              <button
                onClick={onNavigateToHoneypots}
                className="px-3.5 py-2.5 rounded-xl text-xs font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>View Insider Canary Traps</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lockdown Execution Feedback */}
      {lockdownResult && (
        <div className="p-4 rounded-xl border border-emerald-500/60 bg-emerald-950/40 text-emerald-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Global Zero Trust Enforced Across All Levels ({lockdownResult.timestamp})</span>
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-rose-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Implicit Trust Posture</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-300">0% (REVOKED)</span>
            <span className="text-xs text-emerald-400 font-mono">100% Enforced</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            All personnel identity & clearance levels require continuous attestation
          </p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Quarantined Personnel</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {personnel.length}
            </span>
            <span className="text-xs text-rose-400 font-mono">Isolated in Null Netns</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Rogue analysts restricted from crypto keys & code repositories
          </p>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Two-Person Integrity</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">2-of-3 Quorum</span>
            <span className="text-xs text-emerald-400 font-mono">ML-DSA-87 Signed</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Single admin access hard-blocked across all critical systems
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-mono font-bold">Zero Trust Pillars</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300">6 of 6</span>
            <span className="text-xs text-emerald-400 font-mono">Hardened</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Identity, Device, Network, Application, Data & Visibility
          </p>
        </div>
      </div>

      {/* Two-Person Integrity (TPI) Dual-Authorization Simulator */}
      <div className="p-5 rounded-xl border border-cyan-500/40 bg-zinc-900/70 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase">
              Two-Person Integrity (TPI) Dual-Authorization Gate (M-of-N Quorum)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            NIST FIPS 204 ML-DSA-87 Hardware Attestation
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          To neutralize insider threats, any high-assurance action (committing SLEIGH processor specs, rotating master keys, or releasing decompilation audit reports) requires <strong>two independent cryptographic sign-offs</strong>. Even a compromised NSA Director or senior analyst cannot execute actions alone.
        </p>

        <div className="space-y-3">
          {requests.map((req) => {
            const isApproved = req.status === 'APPROVED_RATIFIED';
            const hasApprover1 = !!req.approver1Id;
            const hasApprover2 = !!req.approver2Id;

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isApproved
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{req.action}</span>
                      <span className="text-[10px] font-mono text-zinc-400">({req.id})</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Target Asset: <code className="text-cyan-300">{req.targetAsset}</code> · Requester: {req.requesterName}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isApproved
                        ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                        : 'bg-amber-950 border border-amber-600 text-amber-300 animate-pulse'
                    }`}
                  >
                    {isApproved ? 'RATIFIED (2-OF-2 APPROVALS)' : 'AWAITING SECOND APPROVER'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block">Approver 1 (Crypto Officer):</span>
                      <span className="text-zinc-200 font-bold">
                        {req.approver1Id || 'Not Signed'}
                      </span>
                      {req.approver1Sig && (
                        <span className="text-[10px] text-emerald-400 block truncate max-w-[200px]">
                          {req.approver1Sig}
                        </span>
                      )}
                    </div>
                    {!hasApprover1 ? (
                      <button
                        onClick={() =>
                          handleApproveTwoPerson(req.id, 'NSA-DIRECTOR-02', 'Director Vance')
                        }
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Sign Approval 1
                      </button>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block">Approver 2 (Security Chief):</span>
                      <span className="text-zinc-200 font-bold">
                        {req.approver2Id || 'Awaiting Sign-off'}
                      </span>
                      {req.approver2Sig && (
                        <span className="text-[10px] text-emerald-400 block truncate max-w-[200px]">
                          {req.approver2Sig}
                        </span>
                      )}
                    </div>
                    {hasApprover1 && !hasApprover2 ? (
                      <button
                        onClick={() =>
                          handleApproveTwoPerson(
                            req.id,
                            'NSA-SECURITY-CHIEF-01',
                            'Chief Inspector Miller'
                          )
                        }
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Ratify Approval 2
                      </button>
                    ) : hasApprover2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 italic">Needs Approval 1 First</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Compromised Personnel Triage (Left 5 cols) & Zero Trust 6 Pillars (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compromised Personnel Triage Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-rose-500/40 bg-zinc-900/60 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Compromised Personnel Roster ({personnel.length})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Zero-Trust Quarantine</span>
            </div>

            <div className="space-y-3">
              {personnel.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">({p.callsign})</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">{p.assignedDivision}</div>
                      <div className="text-[10px] font-mono text-amber-300">{p.clearanceLevel}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                        p.containmentStatus === 'QUARANTINED_NULL_NETNS'
                          ? 'bg-rose-950 border border-rose-600 text-rose-300'
                          : 'bg-amber-950 border border-amber-600 text-amber-300'
                      }`}
                    >
                      {p.containmentStatus}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-zinc-900 border border-rose-900/40 text-xs text-rose-200">
                    <strong className="text-zinc-200">Indicator of Compromise:</strong>{' '}
                    {p.compromiseIndicator}
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Hardware Token: {p.hardwareTokenRevoked ? 'REVOKED' : 'ACTIVE'}</span>
                    <span>Two-Person Required: YES</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Form to Isolate Suspect Personnel */}
            <form onSubmit={handleQuarantinePersonnel} className="pt-3 border-t border-zinc-800 space-y-2">
              <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 block">
                Isolate Suspect Operator under Zero-Trust Quarantine
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={newSuspectId}
                  onChange={(e) => setNewSuspectId(e.target.value)}
                  placeholder="Personnel ID (e.g., NSA-OP-4491)"
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-hidden focus:border-rose-500"
                />
                <input
                  type="text"
                  value={newSuspectReason}
                  onChange={(e) => setNewSuspectReason(e.target.value)}
                  placeholder="Compromise indicator / anomaly reason..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={isQuarantining}
                  className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{isQuarantining ? 'Quarantining...' : 'Revoke Clearance & Isolate in MicroVM'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Zero Trust 6 Pillars Architecture Hardening Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  NSA Zero Trust 6-Pillar Hardening Matrix
                </h4>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono">
                <span className="text-zinc-400">Pillar:</span>
                {(['ALL', 'IDENTITY', 'DEVICE', 'NETWORK', 'APPLICATION', 'DATA'] as const).map(
                  (pil) => (
                    <button
                      key={pil}
                      onClick={() => setSelectedPillarFilter(pil)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        selectedPillarFilter === pil
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {pil}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredPillars.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 border border-blue-700 text-blue-300">
                        {p.pillar}
                      </span>
                      <span className="text-xs font-bold text-white">{p.title}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
                      {p.status}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500">
                    Standard: {p.standardReference}
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-cyan-300">Enforcement Mechanism:</strong>{' '}
                    {p.enforcementMechanism}
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-emerald-900/40 text-xs text-emerald-300 leading-relaxed">
                    <strong>Insider Threat Mitigation:</strong> {p.insiderThreatMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
