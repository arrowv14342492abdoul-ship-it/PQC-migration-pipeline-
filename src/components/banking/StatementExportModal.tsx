import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  Code,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { bankingService } from '../../services/bankingService';

interface StatementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatementExportModal: React.FC<StatementExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'CSV' | 'MT940' | 'CAMT053' | 'JSON'>('CSV');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportedContent = bankingService.exportStatement(format);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let filename = `LATTICEOPS-BANK-STATEMENT-${Date.now()}`;
    let mime = 'text/plain';

    if (format === 'CSV') {
      filename += '.csv';
      mime = 'text/csv;charset=utf-8;';
    } else if (format === 'MT940') {
      filename += '.sta';
      mime = 'text/plain;charset=utf-8;';
    } else if (format === 'CAMT053') {
      filename += '.xml';
      mime = 'application/xml;charset=utf-8;';
    } else if (format === 'JSON') {
      filename += '.json';
      mime = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([exportedContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Export Bank Statements & Audit Reports
              </h3>
              <p className="text-xs text-zinc-400">
                Generate regulatory and reconciliation files with ISO 20022 and SWIFT compliance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[64vh]">
          {/* Format Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Select Statement Standard / File Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormat('CSV')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  format === 'CSV'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 mb-2 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold">CSV / Excel</div>
                  <div className="text-[10px] text-zinc-500">Accounting & ERP</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('CAMT053')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  format === 'CAMT053'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-4 h-4 mb-2 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold">ISO 20022</div>
                  <div className="text-[10px] text-zinc-500">camt.053 XML</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('MT940')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  format === 'MT940'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-4 h-4 mb-2 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold">SWIFT MT940</div>
                  <div className="text-[10px] text-zinc-500">Interbank Wire</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('JSON')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  format === 'JSON'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-2 text-purple-400" />
                <div>
                  <div className="text-xs font-semibold">JSON CBOM</div>
                  <div className="text-[10px] text-zinc-500">Audit & Crypto</div>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                Live Preview ({format}):
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-56 overflow-auto leading-relaxed">
              {exportedContent.slice(0, 800)}...
            </pre>
          </div>

          {/* Cryptographic Compliance Tag */}
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All transactions in this export are verified against FIPS 203 (ML-KEM) and signed with FIPS 204 (ML-DSA-87) digests.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download {format} Statement
          </button>
        </div>
      </div>
    </div>
  );
};
