import React from 'react';
import { X, Settings, Shield, Sliders } from 'lucide-react';
import { PipelineOptions } from '../types/pqc';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: PipelineOptions;
  setOptions: React.Dispatch<React.SetStateAction<PipelineOptions>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  options,
  setOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Pipeline & Architectural Constraints
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Target NIST Security Level */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Target NIST Security Level</span>
              <span className="text-[11px] text-zinc-500 font-normal">FIPS 203 / 204</span>
            </label>
            <select
              value={options.nistLevel}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  nistLevel: e.target.value as any,
                }))
              }
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            >
              <option value="Level 1 (ML-KEM-512 / ML-DSA-44)">
                Level 1 (AES-128 equivalent · ML-KEM-512 / ML-DSA-44)
              </option>
              <option value="Level 3 (ML-KEM-768 / ML-DSA-65)">
                Level 3 (AES-192 equivalent · ML-KEM-768 / ML-DSA-65) [Recommended]
              </option>
              <option value="Level 5 (ML-KEM-1024 / ML-DSA-87)">
                Level 5 (AES-256 equivalent · ML-KEM-1024 / ML-DSA-87) [Maximum Defense]
              </option>
            </select>
            <p className="text-[11px] text-zinc-500">
              NIST Level 3 is the industry standard baseline for cloud, banking, and TLS 1.3 key exchange.
            </p>
          </div>

          {/* Target PQC Library */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Target PQC Implementation Library</span>
              <span className="text-[11px] text-zinc-500 font-normal">Python Environment</span>
            </label>
            <select
              value={options.library}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  library: e.target.value as any,
                }))
              }
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            >
              <option value="liboqs-python (Open Quantum Safe)">
                liboqs-python (Open Quantum Safe C wrapper · Official NIST standards)
              </option>
              <option value="cryptography >= 43.0 (Python Standard)">
                cryptography &gt;= 43.0 (PyCA standard library with X25519MLKEM768)
              </option>
              <option value="pqcrypto (Pure bindings)">
                pqcrypto (Rust/C standalone bindings for Kyber and Dilithium)
              </option>
            </select>
          </div>

          {/* Hybrid Combiner Strategy */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>Crypto-Agility Hybrid Strategy</span>
              <span className="text-[11px] text-zinc-500 font-normal">Dual-Algorithm Safety</span>
            </label>
            <select
              value={options.hybridMode}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  hybridMode: e.target.value as any,
                }))
              }
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            >
              <option value="Dual-KEM Composite (KDF Combiner)">
                Dual-KEM Composite (HKDF combines Classical and PQC shared secrets)
              </option>
              <option value="Concatenated Signatures">
                Concatenated Dual-Signatures (Classical and PQC both verified)
              </option>
              <option value="Pure PQC Only">
                Pure PQC Only (Direct FIPS 203/204 without legacy wrapper)
              </option>
            </select>
          </div>

          {/* Model & Determinism notice */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 space-y-2">
            <div className="font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Orchestration Parameters & Quotas</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                High-Assurance Safe
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span>Agent Temperature:</span>
              <span className="text-emerald-400 font-semibold">0.0 (Deterministic)</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span>Primary Engine:</span>
              <span className="text-zinc-200">{options.model}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono">
              <span>Rate Limit (429) Handling:</span>
              <span className="text-emerald-400 font-medium">Automatic Zero-Downtime Fallback</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-850 pt-2">
              If the Gemini free-tier daily quota (20 req/day) is reached, the platform automatically synthesizes full CBOM audits and liboqs implementations using the built-in deterministic cryptographic engine. You can also attach your own project API key in the AI Studio <strong>Settings &gt; Secrets</strong> panel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
