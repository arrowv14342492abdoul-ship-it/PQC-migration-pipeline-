import {
  GCHQRepository,
  CyberChefRecipeStep,
  CyberChefBakeResult,
  GafferGraphData,
} from '../types/gchqSoftware';

export const gchqService = {
  async getRepositories(): Promise<GCHQRepository[]> {
    const res = await fetch('/api/gchq/repositories');
    if (!res.ok) throw new Error('Failed to fetch GCHQ repositories');
    const data = await res.json();
    return data.repositories;
  },

  async bakeCyberChef(
    input: string,
    recipe: CyberChefRecipeStep[]
  ): Promise<CyberChefBakeResult> {
    const res = await fetch('/api/gchq/cyberchef/bake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, recipe }),
    });
    if (!res.ok) throw new Error('CyberChef execution failed');
    return res.json();
  },

  async getGafferGraph(): Promise<GafferGraphData> {
    const res = await fetch('/api/gchq/gaffer/graph');
    if (!res.ok) throw new Error('Failed to fetch Gaffer graph');
    return res.json();
  },

  async parseStroomLog(rawLog: string): Promise<any> {
    const res = await fetch('/api/gchq/stroom/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawLog }),
    });
    if (!res.ok) throw new Error('Stroom log parsing failed');
    return res.json();
  },
};
