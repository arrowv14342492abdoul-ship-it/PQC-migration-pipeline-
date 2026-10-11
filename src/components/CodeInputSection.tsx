import React, { useRef } from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { Play, Upload, RotateCcw, Sparkles, FileCode2, ShieldAlert } from 'lucide-react';

interface CodeInputSectionProps {
  code: string;
  setCode: (code: string) => void;
  onRunPipeline: () => void;
  isRunning: boolean;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const CodeInputSection: React.FC<CodeInputSectionProps> = ({
  code,
  setCode,
  onRunPipeline,
  isRunning,
  selectedPresetId,
  onSelectPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCode(text);
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    const first = SAMPLE_PRESETS[0];
    setCode(first.code);
    onSelectPreset(first.id);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3.5">
      {/* Top Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Input Codebase for PQC Migration
          </h2>
          <span className="text-zinc-600 text-xs">/</span>
          <span className="text-[11px] text-zinc-400">Classical Cryptography Target</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.txt,.c,.cpp,.go,.java"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors cursor-pointer"
            title="Upload source file"
          >
            <Upload className="w-3 h-3 text-zinc-400" />
            <span>Upload File</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors cursor-pointer"
            title="Reset to default sample"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span>Reset Sample</span>
          </button>
        </div>
      </div>

      {/* Preset Pill Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-zinc-400 font-medium">
          Load Real-World Cryptographic Presets:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPreset(p.id);
                  setCode(p.code);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-xs'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span className="truncate">{p.title.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono text-rose-400 flex items-center gap-0.5">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    Shor
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {p.subtitle.split('.')[0]}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">
                  Target: {p.targetFips}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Textarea Editor */}
      <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-emerald-500/70 transition-colors">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onSelectPreset('');
          }}
          placeholder="Paste or write Python cryptography code here (e.g. RSA, ECC, Diffie-Hellman, PyCryptodome)..."
          rows={8}
          className="w-full bg-transparent p-3 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-850 bg-zinc-900/50 text-[11px] font-mono text-zinc-400">
          <span>Python 3 · Classical Target</span>
          <span>{code.split('\n').length} lines · {code.length} chars</span>
        </div>
      </div>

      {/* Primary Pipeline Execution CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Orchestrating 3-Agent Chain: <strong>Auditor</strong> → <strong>Architect</strong> → <strong>Implementer</strong></span>
        </div>

        <button
          onClick={onRunPipeline}
          disabled={isRunning || !code.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              <span>Executing Pipeline Chain...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run PQC Migration Pipeline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
