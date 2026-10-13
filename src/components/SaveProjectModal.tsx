import React, { useState, useEffect } from 'react';
import { X, Bookmark, Save, Tag, FileCode, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { PipelineResult, PipelineOptions, SavedProject } from '../types/pqc';
import { storageService } from '../services/storageService';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (project: SavedProject) => void;
  legacyCode: string;
  result: PipelineResult | null;
  options: PipelineOptions;
  activeProjectId?: string | null;
  activeProjectName?: string | null;
}

const COMMON_TAGS = [
  'FIPS 203 (ML-KEM)',
  'FIPS 204 (ML-DSA)',
  'Production',
  'Staging',
  'Audit Complete',
  'liboqs-python',
  'Hybrid Combiner',
  'High-Priority',
];

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  legacyCode,
  result,
  options,
  activeProjectId,
  activeProjectName,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['FIPS 203 (ML-KEM)', 'Audit Complete']);
  const [customTag, setCustomTag] = useState('');
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

  // Auto-generate a suitable project title based on code contents
  useEffect(() => {
    if (isOpen) {
      if (activeProjectId && activeProjectName) {
        setName(activeProjectName);
        setIsUpdatingExisting(true);
      } else {
        setIsUpdatingExisting(false);
        let defaultTitle = 'PQC Migration Project';
        if (/rsa/i.test(legacyCode)) {
          defaultTitle = 'RSA-2048 to ML-KEM-768 Hybrid Migration';
        } else if (/ecdsa|secp256/i.test(legacyCode)) {
          defaultTitle = 'ECDSA to ML-DSA-65 Signature Migration';
        } else if (/x25519|ecdh/i.test(legacyCode)) {
          defaultTitle = 'X25519 + ML-KEM-768 Session Key Migration';
        } else if (/aes/i.test(legacyCode)) {
          defaultTitle = 'Data Vault AES-256 Quantum Resistance';
        }
        setName(`${defaultTitle} (${new Date().toLocaleDateString()})`);
      }
    }
  }, [isOpen, legacyCode, activeProjectId, activeProjectName]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
      }
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved = storageService.saveProject({
      id: isUpdatingExisting && activeProjectId ? activeProjectId : undefined,
      name: name.trim(),
      description: description.trim(),
      legacyCode,
      result,
      options,
      tags: selectedTags,
    });
    onSaveSuccess(saved);
    onClose();
  };

  const codeLines = (legacyCode || '').split('\n').length;
  const cbomCount = result?.cbom?.length || 0;
  const hasCode = Boolean(result?.code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {isUpdatingExisting ? 'Update Saved Migration Project' : 'Save Migration Project'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Persist code, audit reports, CBOM inventory, and PQC implementations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Project Title *</span>
              <span className="text-[10px] text-zinc-500 font-normal">Identifies your migration</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Payment Vault PQC Migration"
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-medium text-xs"
            />
          </div>

          {/* Scope / Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Notes & Operational Scope</span>
              <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Transitioning RSA-2048 to FIPS 203 ML-KEM-768 for backend API service."
              className="w-full rounded bg-zinc-950 border border-zinc-800 p-2.5 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-zinc-400" />
                <span>Classification Tags</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">Click to toggle</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Add custom tag (press Enter)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Summary of Saved Assets */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 space-y-1.5">
            <div className="font-semibold text-zinc-300 text-[11px] flex items-center justify-between">
              <span>Saved Assets Breakdown</span>
              <span className="text-zinc-500 font-mono">Local & Cloud Session</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400 pt-0.5">
              <div>
                <span className="text-zinc-500">Legacy Code:</span>{' '}
                <strong className="text-zinc-200">{codeLines} lines</strong>
              </div>
              <div>
                <span className="text-zinc-500">CBOM Assets:</span>{' '}
                <strong className="text-emerald-400">{cbomCount} identified</strong>
              </div>
              <div>
                <span className="text-zinc-500">PQC Code:</span>{' '}
                <strong className={hasCode ? 'text-emerald-400' : 'text-zinc-500'}>
                  {hasCode ? 'Synthesized' : 'Pending'}
                </strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUpdatingExisting ? 'Update Project' : 'Save Project to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
