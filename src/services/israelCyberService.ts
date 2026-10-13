import {
  IsraelCyberRepository,
  CdmControlItem,
  CertIlThreatAlert,
  TraceeEbpfEvent,
} from '../types/israelCyberSoftware';

export const israelCyberService = {
  async getRepositories(): Promise<IsraelCyberRepository[]> {
    const res = await fetch('/api/israel-cyber/repositories');
    if (!res.ok) throw new Error('Failed to fetch Israeli Cyber Directorate repositories');
    const data = await res.json();
    return data.repositories;
  },

  async getCdmControls(): Promise<CdmControlItem[]> {
    const res = await fetch('/api/israel-cyber/cdm/compliance');
    if (!res.ok) throw new Error('Failed to fetch CDM controls');
    const data = await res.json();
    return data.controls;
  },

  async evaluateCdmCompliance(code?: string): Promise<any> {
    const res = await fetch('/api/israel-cyber/cdm/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('CDM evaluation failed');
    return res.json();
  },

  async getCertIlAlerts(): Promise<CertIlThreatAlert[]> {
    const res = await fetch('/api/israel-cyber/cert-il/alerts');
    if (!res.ok) throw new Error('Failed to fetch CERT-IL alerts');
    const data = await res.json();
    return data.alerts;
  },

  async getTraceeEvents(): Promise<TraceeEbpfEvent[]> {
    const res = await fetch('/api/israel-cyber/tracee/events');
    if (!res.ok) throw new Error('Failed to fetch Tracee eBPF events');
    const data = await res.json();
    return data.events;
  },
};
