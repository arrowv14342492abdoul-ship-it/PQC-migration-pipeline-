import {
  WhiteRabbitStatus,
  WhiteRabbitAuditResult,
} from '../types/whiterabbit';

export const whiteRabbitConnector = {
  async getStatus(): Promise<WhiteRabbitStatus> {
    const res = await fetch('/api/whiterabbitneo/status');
    if (!res.ok) {
      throw new Error(`Failed to fetch WhiteRabbitNeo status: ${res.statusText}`);
    }
    return res.json();
  },

  async testConnection(): Promise<{
    success: boolean;
    latencyMs: number;
    model: string;
    endpoint: string;
    message: string;
    timestamp: string;
  }> {
    const res = await fetch('/api/whiterabbitneo/test-connection', {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Connection test failed: ${res.statusText}`);
    }
    return res.json();
  },

  async configure(params: {
    endpoint?: string;
    activeModel?: string;
    temperature?: number;
    guardrailProfile?: string;
  }): Promise<{ success: boolean; status: WhiteRabbitStatus }> {
    const res = await fetch('/api/whiterabbitneo/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`Failed to configure WhiteRabbitNeo: ${res.statusText}`);
    }
    return res.json();
  },

  async reset(): Promise<{ success: boolean; status: WhiteRabbitStatus }> {
    const res = await fetch('/api/whiterabbitneo/reset', {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to reset WhiteRabbitNeo: ${res.statusText}`);
    }
    return res.json();
  },

  async runAudit(
    sourceCode: string,
    fileName: string = 'target_module.py',
    enableDualConsensus: boolean = true
  ): Promise<WhiteRabbitAuditResult> {
    const res = await fetch('/api/whiterabbitneo/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceCode,
        fileName,
        enableDualConsensus,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `WhiteRabbitNeo audit failed: ${res.statusText}`);
    }
    return res.json();
  },
};
