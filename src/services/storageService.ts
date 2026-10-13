import { SavedProject, PipelineResult, PipelineOptions } from '../types/pqc';
import { SAMPLE_PRESETS } from '../data/presets';
import { INITIAL_PRESET_RESULT } from '../data/initialResult';

const STORAGE_KEY = 'pqc_saved_projects_v1';
const DRAFT_KEY = 'pqc_workspace_draft_v1';

// Seed initial project so user immediately has a working saved project to explore
const DEFAULT_SAVED_PROJECTS: SavedProject[] = [
  {
    id: 'proj_rsa_vault_demo',
    name: 'Production Payment Vault: RSA-2048 to ML-KEM-768',
    description: 'NIST FIPS 203 hybrid migration for payload encryption in core payment service.',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hrs ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    legacyCode: SAMPLE_PRESETS[0].code,
    result: INITIAL_PRESET_RESULT,
    options: {
      model: 'gemini-3.8-flash',
      nistLevel: 'Level 3 (ML-KEM-768 / ML-DSA-65)',
      library: 'liboqs-python (Open Quantum Safe)',
      hybridMode: 'Dual-KEM Composite (KDF Combiner)',
    },
    tags: ['FIPS 203', 'ML-KEM-768', 'Production', 'High-Priority'],
    primitiveSummary: 'RSA-2048 Asymmetric Encryption',
  },
];

export const storageService = {
  // 1. Get all saved projects
  getSavedProjects(): SavedProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read saved projects from localStorage:', e);
    }
    // Initialize with default
    this.saveAllProjects(DEFAULT_SAVED_PROJECTS);
    return DEFAULT_SAVED_PROJECTS;
  },

  // 2. Save all projects to localStorage
  saveAllProjects(projects: SavedProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to write saved projects to localStorage:', e);
    }
  },

  // 3. Save or update a project
  saveProject(params: {
    id?: string;
    name: string;
    description?: string;
    legacyCode: string;
    result: PipelineResult | null;
    options: PipelineOptions;
    tags?: string[];
  }): SavedProject {
    const projects = this.getSavedProjects();
    const now = new Date().toISOString();

    // Determine primitive summary from code
    let primitiveSummary = 'Custom Cryptography';
    if (/rsa/i.test(params.legacyCode)) primitiveSummary = 'RSA-2048 Asymmetric Encryption';
    else if (/ecdsa|secp256/i.test(params.legacyCode)) primitiveSummary = 'ECDSA secp256r1 Digital Signature';
    else if (/x25519|ecdh/i.test(params.legacyCode)) primitiveSummary = 'X25519 Diffie-Hellman Key Agreement';
    else if (/aes/i.test(params.legacyCode)) primitiveSummary = 'Symmetric Envelope Encryption';

    if (params.id) {
      // Update existing
      const index = projects.findIndex((p) => p.id === params.id);
      if (index !== -1) {
        const updated: SavedProject = {
          ...projects[index],
          name: params.name,
          description: params.description,
          legacyCode: params.legacyCode,
          result: params.result,
          options: params.options,
          tags: params.tags || projects[index].tags,
          primitiveSummary,
          updatedAt: now,
        };
        projects[index] = updated;
        this.saveAllProjects(projects);
        return updated;
      }
    }

    // Create new
    const newProject: SavedProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: params.name,
      description: params.description,
      savedAt: now,
      updatedAt: now,
      legacyCode: params.legacyCode,
      result: params.result,
      options: params.options,
      tags: params.tags || ['PQC Migration'],
      primitiveSummary,
    };

    projects.unshift(newProject);
    this.saveAllProjects(projects);
    return newProject;
  },

  // 4. Delete a project
  deleteProject(id: string): void {
    const projects = this.getSavedProjects();
    const filtered = projects.filter((p) => p.id !== id);
    this.saveAllProjects(filtered);
  },

  // 5. Autosave draft in-progress
  saveDraft(draft: {
    code: string;
    options: PipelineOptions;
    result: PipelineResult | null;
  }): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // ignore
    }
  },

  getDraft(): {
    code: string;
    options: PipelineOptions;
    result: PipelineResult | null;
  } | null {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  },

  // 6. Export/Import
  exportAsJson(): string {
    const projects = this.getSavedProjects();
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projects,
      },
      null,
      2
    );
  },

  importFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const incoming = Array.isArray(parsed) ? parsed : parsed.projects;
      if (Array.isArray(incoming)) {
        const existing = this.getSavedProjects();
        const merged = [...incoming, ...existing];
        // Deduplicate by ID
        const uniqueMap = new Map<string, SavedProject>();
        merged.forEach((item) => {
          if (item && item.id && item.name && item.legacyCode) {
            uniqueMap.set(item.id, item);
          }
        });
        const resultList = Array.from(uniqueMap.values());
        this.saveAllProjects(resultList);
        return { success: true, count: incoming.length };
      }
      return { success: false, count: 0, error: 'Invalid file format: projects array not found' };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Failed to parse JSON' };
    }
  },
};
