import React, { useState, useRef } from 'react';
import {
  X,
  FolderOpen,
  Search,
  Trash2,
  Clock,
  ArrowRight,
  Download,
  Upload,
  CheckCircle2,
  FileCode2,
  Sparkles,
  ShieldCheck,
  Tag,
  Plus,
} from 'lucide-react';
import { SavedProject } from '../types/pqc';
import { storageService } from '../services/storageService';

interface SavedProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedProject) => void;
  onNewProject: () => void;
  activeProjectId?: string | null;
}

export const SavedProjectsDrawer: React.FC<SavedProjectsDrawerProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onNewProject,
  activeProjectId,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects whenever drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setProjects(storageService.getSavedProjects());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete saved project "${name}"? This cannot be undone.`)) {
      storageService.deleteProject(id);
      setProjects(storageService.getSavedProjects());
      showToast(`Deleted "${name}"`);
    }
  };

  const handleExportJson = () => {
    const jsonStr = storageService.exportAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pqc-saved-projects-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported projects backup as JSON');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = storageService.importFromJson(text);
        if (res.success) {
          setProjects(storageService.getSavedProjects());
          showToast(`Successfully imported ${res.count} project(s)`);
        } else {
          alert(`Failed to import projects: ${res.error}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags || []))
  );

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (selectedTag !== 'ALL' && !(p.tags || []).includes(selectedTag)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = `${p.name} ${p.description || ''} ${p.primitiveSummary || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Saved Migration Library</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.2 rounded">
                  {projects.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Manage, restore, and organize post-quantum transition projects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action strip & Search */}
        <div className="p-3.5 border-b border-zinc-850 bg-zinc-900/40 space-y-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search saved migrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>

            {/* Import / Export controls */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Import backup JSON"
            >
              <Upload className="w-3 h-3 text-zinc-400" />
              <span>Import</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Export all saved projects"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>Backup</span>
            </button>
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
              <span className="text-zinc-500 shrink-0">Filter:</span>
              <button
                onClick={() => setSelectedTag('ALL')}
                className={`px-2 py-0.5 rounded shrink-0 transition-colors cursor-pointer ${
                  selectedTag === 'ALL'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded shrink-0 transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-850'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-2.5 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 px-4 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center space-y-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <FileCode2 className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-semibold text-zinc-300">
                No Saved Projects Found
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Save your active migration workspace using the <strong>Save</strong> button to preserve code, audits, and PQC modules.
              </p>
            </div>
          ) : (
            filteredProjects.map((proj) => {
              const isActive = activeProjectId === proj.id;
              const hasPqc = Boolean(proj.result?.code);
              const cbomCount = proj.result?.cbom?.length || 0;
              const lines = (proj.legacyCode || '').split('\n').length;
              const timeFormatted = new Date(proj.updatedAt || proj.savedAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );

              return (
                <div
                  key={proj.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                    isActive
                      ? 'border-emerald-500/70 bg-emerald-950/20 shadow-md'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-100 line-clamp-1">
                          {proj.name}
                        </h4>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                        <span>{proj.primitiveSummary}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {timeFormatted}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(proj.id, proj.name)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Notes / description if provided */}
                  {proj.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {/* Tags */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-850 border border-zinc-750 text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats & Load Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span>{lines} lines</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-emerald-400">{cbomCount} CBOM assets</span>
                      <span className="text-zinc-600">·</span>
                      <span className={hasPqc ? 'text-cyan-400' : 'text-zinc-500'}>
                        {hasPqc ? 'liboqs Ready' : 'Audit Only'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onLoadProject(proj);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Load into Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
