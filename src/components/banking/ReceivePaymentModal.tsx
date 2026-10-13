import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Zap,
  Download,
  Share2,
} from 'lucide-react';
import { BankAccount } from '../../types/banking';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Receive Funds / Wire Instructions
              </h3>
              <p className="text-xs text-zinc-400">
                Official deposit routing instructions for FedNow, Fedwire, and SWIFT.
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
          {/* Wire Details List */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Beneficiary Name</div>
                <div className="font-semibold text-zinc-100">{account.accountName}</div>
              </div>
              <button
                onClick={() => copyToClipboard('name', account.accountName)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'name' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Bank Name & Rail</div>
                <div className="font-semibold text-zinc-100">{account.institutionName}</div>
              </div>
              <button
                onClick={() => copyToClipboard('bank', account.institutionName)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'bank' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Routing Number (ABA / Fedwire)</div>
                <div className="font-mono font-bold text-emerald-400 text-sm">{account.routingNumber}</div>
              </div>
              <button
                onClick={() => copyToClipboard('routing', account.routingNumber)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'routing' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Account Number</div>
                <div className="font-mono font-bold text-zinc-200 text-sm">{account.accountNumber}</div>
              </div>
              <button
                onClick={() => copyToClipboard('acc', account.accountNumber)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'acc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">SWIFT / BIC (International)</div>
                <div className="font-mono font-bold text-cyan-300 text-sm">{account.swiftBic}</div>
              </div>
              <button
                onClick={() => copyToClipboard('swift', account.swiftBic)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'swift' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase">IBAN</div>
                <div className="font-mono text-zinc-300 text-xs truncate max-w-[280px]">{account.iban}</div>
              </div>
              <button
                onClick={() => copyToClipboard('iban', account.iban)}
                className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
              >
                {copiedKey === 'iban' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All inbound pacs.008 transfers to this account automatically generate cryptographic ML-DSA-87 deposit attestations.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs">
          <button
            onClick={() => copyToClipboard('all', `Beneficiary: ${account.accountName}\nBank: ${account.institutionName}\nABA Routing: ${account.routingNumber}\nAccount: ${account.accountNumber}\nSWIFT: ${account.swiftBic}\nIBAN: ${account.iban}`)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedKey === 'all' ? 'Copied Full Sheet' : 'Copy Full Wire Sheet'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
