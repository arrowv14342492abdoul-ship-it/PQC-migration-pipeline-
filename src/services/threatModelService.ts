import { QuantumThreatModelResult, ThreatModelRequestOptions } from '../types/threatModel';

export const threatModelService = {
  async runThreatModel(
    sourceCode: string,
    fileName: string = 'uploaded_source.py',
    options?: ThreatModelRequestOptions
  ): Promise<QuantumThreatModelResult> {
    const response = await fetch('/api/pqc/threat-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCode,
        fileName,
        options,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}: Failed to generate threat model`);
    }

    return response.json();
  },
};
