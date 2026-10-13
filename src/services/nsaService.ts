import {
  NSARepository,
  GhidraAnalysisResult,
  WalkoffPlaybook,
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
};
