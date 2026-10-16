import {
  NSARepository,
  GhidraAnalysisResult,
  GhidraCompromiseHardeningStatus,
  WalkoffPlaybook,
  GhidraHoneypot,
  HoneypotTelemetryEvent,
  ZeroTrustPillarControl,
  CompromisedPersonnelRecord,
  TwoPersonAuthorizationRequest,
  ZeroTrustGlobalStatus,
} from '../types/nsaSoftware';

export const nsaService = {
  async getRepositories(): Promise<NSARepository[]> {
    const res = await fetch('/api/nsa/repositories');
    if (!res.ok) throw new Error('Failed to fetch NSA repositories');
    const data = await res.json();
    return data.repositories;
  },

  async getGhidraPresets(): Promise<any[]> {
    const res = await fetch('/api/nsa/ghidra/presets');
    if (!res.ok) throw new Error('Failed to fetch Ghidra presets');
    const data = await res.json();
    return data.presets;
  },

  async getGhidraHardeningStatus(): Promise<GhidraCompromiseHardeningStatus> {
    const res = await fetch('/api/nsa/ghidra/hardening-status');
    if (!res.ok) throw new Error('Failed to fetch Ghidra hardening status');
    return res.json();
  },

  async runGhidraAnalysis(
    presetId: string = 'rsa-montgomery',
    customCode?: string
  ): Promise<GhidraAnalysisResult> {
    const res = await fetch('/api/nsa/ghidra/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presetId, customCode }),
    });
    if (!res.ok) throw new Error('Ghidra analysis execution failed');
    return res.json();
  },

  async getWalkoffPlaybook(): Promise<WalkoffPlaybook> {
    const res = await fetch('/api/nsa/walkoff/playbook');
    if (!res.ok) throw new Error('Failed to fetch WALKOFF playbook');
    return res.json();
  },

  async executeWalkoff(): Promise<any> {
    const res = await fetch('/api/nsa/walkoff/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('WALKOFF execution failed');
    return res.json();
  },

  async getHoneypots(): Promise<{ activeCount: number; honeypots: GhidraHoneypot[] }> {
    const res = await fetch('/api/nsa/ghidra/honeypots');
    if (!res.ok) throw new Error('Failed to fetch Ghidra honeypots');
    return res.json();
  },

  async getHoneypotEvents(): Promise<{ totalEvents: number; events: HoneypotTelemetryEvent[] }> {
    const res = await fetch('/api/nsa/ghidra/honeypots/events');
    if (!res.ok) throw new Error('Failed to fetch honeypot telemetry events');
    return res.json();
  },

  async simulateHoneypotProbe(
    honeypotId: string,
    attackerIp?: string
  ): Promise<{ honeypot: GhidraHoneypot; event: HoneypotTelemetryEvent }> {
    const res = await fetch('/api/nsa/ghidra/honeypots/simulate-probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ honeypotId, attackerIp }),
    });
    if (!res.ok) throw new Error('Failed to simulate honeypot probe');
    return res.json();
  },

  async deployHoneypotTrap(
    trapData: Partial<GhidraHoneypot>
  ): Promise<{ success: boolean; deployedTrap: GhidraHoneypot }> {
    const res = await fetch('/api/nsa/ghidra/honeypots/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trapData),
    });
    if (!res.ok) throw new Error('Failed to deploy honeypot trap');
    return res.json();
  },

  async resetHoneypotAlarms(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/nsa/ghidra/honeypots/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset honeypot alarms');
    return res.json();
  },

  async triggerEmergencyLockdown(): Promise<{
    lockdownId: string;
    status: string;
    timestamp: string;
    actionsExecuted: string[];
  }> {
    const res = await fetch('/api/nsa/ghidra/emergency-lockdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Emergency lockdown failed');
    return res.json();
  },

  async getZeroTrustStatus(): Promise<ZeroTrustGlobalStatus> {
    const res = await fetch('/api/nsa/zero-trust/status');
    if (!res.ok) throw new Error('Failed to fetch Zero Trust status');
    return res.json();
  },

  async getZeroTrustPillars(): Promise<{ totalPillars: number; pillars: ZeroTrustPillarControl[] }> {
    const res = await fetch('/api/nsa/zero-trust/pillars');
    if (!res.ok) throw new Error('Failed to fetch Zero Trust pillars');
    return res.json();
  },

  async getCompromisedPersonnel(): Promise<{
    totalPersonnel: number;
    roster: CompromisedPersonnelRecord[];
  }> {
    const res = await fetch('/api/nsa/zero-trust/personnel');
    if (!res.ok) throw new Error('Failed to fetch compromised personnel roster');
    return res.json();
  },

  async getTwoPersonRequests(): Promise<{
    totalRequests: number;
    requests: TwoPersonAuthorizationRequest[];
  }> {
    const res = await fetch('/api/nsa/zero-trust/two-person-requests');
    if (!res.ok) throw new Error('Failed to fetch two-person requests');
    return res.json();
  },

  async enforceZeroTrustAllLevels(): Promise<{
    status: string;
    timestamp: string;
    actionsExecuted: string[];
  }> {
    const res = await fetch('/api/nsa/zero-trust/enforce-all-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Global Zero Trust enforcement failed');
    return res.json();
  },

  async quarantinePersonnel(
    personnelId: string,
    reason: string
  ): Promise<{ success: boolean; record: CompromisedPersonnelRecord }> {
    const res = await fetch('/api/nsa/zero-trust/quarantine-personnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personnelId, reason }),
    });
    if (!res.ok) throw new Error('Failed to quarantine personnel');
    return res.json();
  },

  async approveTwoPersonAuth(
    requestId: string,
    approverId: string,
    approverName: string
  ): Promise<{ success: boolean; request: TwoPersonAuthorizationRequest }> {
    const res = await fetch('/api/nsa/zero-trust/two-person-auth/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, approverId, approverName }),
    });
    if (!res.ok) throw new Error('Failed to approve two-person auth');
    return res.json();
  },
};

