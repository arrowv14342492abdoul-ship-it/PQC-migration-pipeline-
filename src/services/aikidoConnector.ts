import {
  AikidoFinding,
  AikidoIntegrationStatus,
  FindingStatus,
} from '../types/aikido';
import {
  INITIAL_AIKIDO_FINDINGS,
  INITIAL_AIKIDO_STATUS,
} from '../data/mockAikidoData';

class MockAikidoConnector {
  private status: AikidoIntegrationStatus = { ...INITIAL_AIKIDO_STATUS };
  private findings: AikidoFinding[] = [...INITIAL_AIKIDO_FINDINGS];

  // Helper to recompute counts
  private recomputeCounts() {
    this.status.counts = {
      total: this.findings.length,
      critical: this.findings.filter((f) => f.severity === 'CRITICAL').length,
      high: this.findings.filter((f) => f.severity === 'HIGH').length,
      medium: this.findings.filter((f) => f.severity === 'MEDIUM').length,
      low: this.findings.filter((f) => f.severity === 'LOW').length,
      reachable: this.findings.filter((f) => f.reachability === 'REACHABLE')
        .length,
      pqcRelevant: this.findings.filter((f) => f.isPqcRelated).length,
    };

    // Calculate score based on open reachable findings
    const openReachableCritical = this.findings.filter(
      (f) =>
        f.severity === 'CRITICAL' &&
        f.reachability === 'REACHABLE' &&
        f.status === 'OPEN'
    ).length;
    const openReachableHigh = this.findings.filter(
      (f) =>
        f.severity === 'HIGH' &&
        f.reachability === 'REACHABLE' &&
        f.status === 'OPEN'
    ).length;

    let score = 100 - openReachableCritical * 15 - openReachableHigh * 7;
    score = Math.max(20, Math.min(100, score));
    this.status.securityScore = score;

    if (score >= 95) this.status.securityGrade = 'A+';
    else if (score >= 90) this.status.securityGrade = 'A';
    else if (score >= 75) this.status.securityGrade = 'B';
    else if (score >= 60) this.status.securityGrade = 'C';
    else if (score >= 40) this.status.securityGrade = 'D';
    else this.status.securityGrade = 'F';

    this.status.gateStatus =
      openReachableCritical > 0
        ? 'FAILED'
        : openReachableHigh > 0
        ? 'WARNING'
        : 'PASSED';
  }

  // 1. Fetch current status
  async getStatus(): Promise<AikidoIntegrationStatus> {
    try {
      const res = await fetch('/api/aikido/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to in-memory state
    }
    return { ...this.status };
  }

  // 2. Fetch all findings
  async getFindings(): Promise<AikidoFinding[]> {
    try {
      const res = await fetch('/api/aikido/findings');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return [...this.findings];
  }

  // 3. Trigger simulated on-demand scan
  async triggerScan(
    onProgress?: (stage: string) => void
  ): Promise<{ status: AikidoIntegrationStatus; findings: AikidoFinding[] }> {
    const stages = [
      'Authenticating with Aikido API Gateway...',
      'Initiating SAST (Static Application Security Testing)...',
      'Scanning SCA Open Source Dependencies & SBOM...',
      'Running Entropy & Pattern Match Secrets Detection...',
      'Analyzing Infrastructure as Code (IaC) & Cloud policies...',
      'Executing Reachability Engine (Building runtime call graph)...',
      'Finalizing findings and computing security score...',
    ];

    for (const stage of stages) {
      if (onProgress) onProgress(stage);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    this.status.lastScanTimestamp = new Date().toISOString();
    this.recomputeCounts();

    return {
      status: { ...this.status },
      findings: [...this.findings],
    };
  }

  // 4. Update finding triage status
  async updateFindingStatus(
    findingId: string,
    newStatus: FindingStatus
  ): Promise<AikidoFinding | null> {
    const idx = this.findings.findIndex((f) => f.id === findingId);
    if (idx !== -1) {
      this.findings[idx] = {
        ...this.findings[idx],
        status: newStatus,
      };
      this.recomputeCounts();
      return this.findings[idx];
    }
    return null;
  }

  // 5. Test webhook connector
  async testWebhook(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      latencyMs: 142,
      message: 'Aikido Webhook endpoint verified (HTTP 200 OK · HMAC signature valid)',
    };
  }

  // 6. Connect / Disconnect toggle
  toggleConnection(connected: boolean): AikidoIntegrationStatus {
    this.status.connected = connected;
    return { ...this.status };
  }

  // 7. Fix a single finding by ID
  async remediateFinding(findingId: string): Promise<{
    finding: AikidoFinding | null;
    status: AikidoIntegrationStatus;
  }> {
    const idx = this.findings.findIndex((f) => f.id === findingId);
    if (idx !== -1) {
      this.findings[idx] = {
        ...this.findings[idx],
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
      };
      this.recomputeCounts();
      return { finding: this.findings[idx], status: { ...this.status } };
    }
    return { finding: null, status: { ...this.status } };
  }

  // 8. Fix all findings at once
  async remediateAllFindings(
    onProgress?: (finding: AikidoFinding, index: number) => void
  ): Promise<{ status: AikidoIntegrationStatus; findings: AikidoFinding[] }> {
    const now = new Date().toISOString();

    for (let i = 0; i < this.findings.length; i++) {
      this.findings[i] = {
        ...this.findings[i],
        status: 'RESOLVED',
        resolvedAt: now,
      };
      if (onProgress) {
        onProgress(this.findings[i], i);
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    this.recomputeCounts();
    try {
      fetch('/api/aikido/remediate-all', { method: 'POST' }).catch(() => {});
    } catch {}
    return {
      status: { ...this.status },
      findings: [...this.findings],
    };
  }

  // 9. Reset to original initial findings (for testing re-runs)
  resetToInitial(): { status: AikidoIntegrationStatus; findings: AikidoFinding[] } {
    this.status = { ...INITIAL_AIKIDO_STATUS };
    this.findings = JSON.parse(JSON.stringify(INITIAL_AIKIDO_FINDINGS));
    this.recomputeCounts();
    try {
      fetch('/api/aikido/reset', { method: 'POST' }).catch(() => {});
    } catch {}
    return {
      status: { ...this.status },
      findings: [...this.findings],
    };
  }
}

export const aikidoConnector = new MockAikidoConnector();
