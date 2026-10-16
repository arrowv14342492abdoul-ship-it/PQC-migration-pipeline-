import {
  ZeroTrustComplianceOverview,
  IncomingConnectionAttempt,
} from '../types/zeroTrustCompliance';

export const zeroTrustComplianceService = {
  async getOverview(): Promise<ZeroTrustComplianceOverview> {
    const res = await fetch('/api/zero-trust/compliance/overview');
    if (!res.ok) throw new Error('Failed to fetch Zero Trust compliance overview');
    return res.json();
  },

  async getConnections(): Promise<{
    total: number;
    connections: IncomingConnectionAttempt[];
  }> {
    const res = await fetch('/api/zero-trust/compliance/connections');
    if (!res.ok) throw new Error('Failed to fetch incoming connections');
    return res.json();
  },

  async simulateConnection(
    scenario:
      | 'QUANTUM_DOWNGRADE_ATTEMPT'
      | 'GHIDRA_RMI_DESERIALIZATION'
      | 'LATTICE_MODULUS_POISONING'
      | 'CANARY_ELF_ACCESS'
      | 'VALID_ZERO_TRUST_MTLS'
      | 'SUSPICIOUS_INSIDER_PROBE',
    sourceIp?: string
  ): Promise<{
    success: boolean;
    connection: IncomingConnectionAttempt;
    overview: ZeroTrustComplianceOverview;
  }> {
    const res = await fetch('/api/zero-trust/compliance/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, sourceIp }),
    });
    if (!res.ok) throw new Error('Failed to simulate connection attempt');
    return res.json();
  },

  async severConnection(connId: string): Promise<{
    success: boolean;
    message: string;
    connection?: IncomingConnectionAttempt;
  }> {
    const res = await fetch(`/api/zero-trust/compliance/connections/${connId}/sever`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to sever connection');
    return res.json();
  },

  async severAllQuarantined(): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> {
    const res = await fetch('/api/zero-trust/compliance/quarantine/sever-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to bulk sever quarantined connections');
    return res.json();
  },

  exportComplianceReport(
    overview: ZeroTrustComplianceOverview,
    connections: IncomingConnectionAttempt[]
  ) {
    const exportData = {
      specVersion: 'STIX-2.1-ZERO-TRUST-COMPLIANCE',
      reportType: 'ZERO_TRUST_NETWORK_AUDIT_REPORT',
      generatedAt: new Date().toISOString(),
      standardsCompliance: {
        nistSp800207: `${overview.nistSp800207Alignment}%`,
        dodZta20: `${overview.dodZta20Alignment}%`,
        cnsa20: `${overview.cnsa20Readiness}%`,
        globalScore: `${overview.globalComplianceScore}%`,
      },
      auditSummary: {
        totalConnections24h: overview.totalConnections24h,
        allowedZeroTrustCount: overview.allowedCount,
        honeypotTrippedCount: overview.honeypotTrippedCount,
        quarantinedCount: overview.quarantinedCount,
        severedCount: overview.severedCount,
        activeHoneypotsListening: overview.activeHoneypotsListening,
        continuousVerificationsSec: overview.continuousVerificationsSec,
      },
      pillarScores: overview.pillarAuditScores,
      observedThreatSignatures: connections
        .filter((c) => c.anomalySignature)
        .map((c) => ({
          connectionId: c.id,
          timestamp: c.timestamp,
          sourceIp: c.sourceIp,
          sourceAsnOrOrg: c.sourceAsnOrOrg,
          targetEndpoint: c.targetEndpoint,
          honeypotHit: c.honeypotDecoyHit?.honeypotName || 'N/A',
          signature: c.anomalySignature,
          containmentAction: c.anomalySignature?.containmentEnforced,
        })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zero_trust_compliance_audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
