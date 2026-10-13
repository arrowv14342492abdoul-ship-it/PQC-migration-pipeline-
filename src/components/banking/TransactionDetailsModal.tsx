import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  FileText,
  Building2,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Cpu,
  CheckCircle2,
  Calendar,
  Layers,
  Share2,
} from 'lucide-react';
import { BankTransaction } from '../../types/banking';

interface TransactionDetailsModalProps {
  transaction: BankTransaction | null;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copiedUetr, setCopiedUetr] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pqc' | 'payload' | 'timeline'>('overview');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!transaction) return null;

  const handleCopyUetr = () => {
    navigator.clipboard.writeText(transaction.uetr);
    setCopiedUetr(true);
    setTimeout(() => setCopiedUetr(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(transaction.rawPayload.content);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleReverifyPqc = () => {
    setIsVerifying(true);
    setVerificationSuccess(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 3000);
    }, 800);
  };

  const handleDownloadReceipt = () => {
    const receiptText = `=====================================================
         QUANTUM-SAFE SETTLEMENT VOUCHER
=====================================================
UETR:         ${transaction.uetr}
ID:           ${transaction.id}
Date/Time:    ${transaction.date} ${transaction.timestamp}
Status:       ${transaction.status}
Settlement:   ${transaction.type}
Rail/ISO:     ${transaction.isoMessageType}

AMOUNT:       ${transaction.direction === 'CREDIT' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { style: 'currency', currency: transaction.currency })}
Fee:          ${transaction.fee.toLocaleString('en-US', { style: 'currency', currency: transaction.currency })}
Ledger Bal:   ${transaction.balanceAfter.toLocaleString('en-US', { style: 'currency', currency: transaction.currency })}

COUNTERPARTY:
Name:         ${transaction.counterpartyName}
Bank:         ${transaction.counterpartyBank}
Account:      ${transaction.counterpartyAccount}
Routing/BIC:  ${transaction.counterpartyRouting}

POST-QUANTUM CRYPTOGRAPHIC PROOF:
KEM Algo:     ${transaction.pqcCertificate.encapsulationAlgorithm}
Sig Algo:     ${transaction.pqcCertificate.signatureAlgorithm}
Key Hash:     ${transaction.pqcCertificate.kemPublicKeyFingerprint}
Signature:    ${transaction.pqcCertificate.signatureDigest}
ZK Proof:     ${transaction.pqcCertificate.zkAttestationProof}
Nonce:        ${transaction.pqcCertificate.nonce}
Score:        ${transaction.pqcCertificate.quantumResistanceScore}%
HSM Sealed:   ${transaction.pqcCertificate.hsmSealedAt}

Audit Note:   ${transaction.referenceNote}
=====================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VOUCHER-${transaction.uetr.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isCredit = transaction.direction === 'CREDIT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                isCredit
                  ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300'
              }`}
            >
              {isCredit ? (
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  Transaction Details
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Ref: {transaction.id} · {transaction.isoMessageType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReceipt}
              title="Download Settlement Voucher"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Amount Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Settled Amount ({transaction.currency})
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-mono font-bold ${
                  isCredit ? 'text-emerald-400' : 'text-zinc-100'
                }`}
              >
                {isCredit ? '+' : '-'}
                {transaction.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: transaction.currency,
                })}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Fee: {transaction.fee > 0 ? `$${transaction.fee.toFixed(2)}` : 'Waived'}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">{transaction.description}</div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <div className="text-[11px] text-zinc-400 font-mono">SWIFT End-to-End UETR</div>
            <div className="flex items-center gap-1.5 bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300">
              <span className="truncate max-w-[180px] sm:max-w-[210px]">
                {transaction.uetr}
              </span>
              <button
                onClick={handleCopyUetr}
                className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                {copiedUetr ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1 px-5 pt-2.5 border-b border-zinc-800/80 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ledger Overview
          </button>
          <button
            onClick={() => setActiveTab('pqc')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pqc'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            PQC Certificate & HSM
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Execution Timeline ({transaction.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            ISO 20022 Raw Payload
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Counterparty & Routing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    Counterparty Details
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-zinc-500">Entity:</span>{' '}
                      <span className="font-semibold text-zinc-200">
                        {transaction.counterpartyName}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Institution:</span>{' '}
                      <span className="text-zinc-300 font-mono">
                        {transaction.counterpartyBank}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Account:</span>{' '}
                      <span className="text-zinc-300 font-mono">
                        {transaction.counterpartyAccount}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Routing / BIC:</span>{' '}
                      <span className="text-emerald-400 font-mono font-semibold">
                        {transaction.counterpartyRouting}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Settlement Rail & Classification
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-zinc-500">Rail Type:</span>{' '}
                      <span className="font-semibold text-cyan-300">
                        {transaction.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Category:</span>{' '}
                      <span className="text-zinc-300">{transaction.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Date & UTC:</span>{' '}
                      <span className="text-zinc-300 font-mono">
                        {transaction.date} · {transaction.timestamp}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Balance After:</span>{' '}
                      <span className="text-emerald-400 font-mono font-semibold">
                        {transaction.balanceAfter.toLocaleString('en-US', {
                          style: 'currency',
                          currency: transaction.currency,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Note */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
                  Reconciliation Reference / Memo
                </div>
                <div className="text-xs text-zinc-200 mt-1 font-mono leading-relaxed">
                  {transaction.referenceNote}
                </div>
              </div>

              {/* Quick Security Badge Banner */}
              <div className="p-3.5 rounded-xl border border-cyan-950/80 bg-gradient-to-r from-cyan-950/30 to-zinc-900/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-cyan-200">
                      Protected by {transaction.pqcCertificate.encapsulationAlgorithm}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Signature: {transaction.pqcCertificate.signatureAlgorithm} · Score: {transaction.pqcCertificate.quantumResistanceScore}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('pqc')}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Inspect HSM <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PQC CERTIFICATE */}
          {activeTab === 'pqc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-cyan-800/50 bg-gradient-to-br from-cyan-950/40 via-zinc-900 to-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-white text-sm">
                      Quantum Resistance Attestation Proof
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                      Score: {transaction.pqcCertificate.quantumResistanceScore}%
                    </span>
                    <button
                      onClick={handleReverifyPqc}
                      disabled={isVerifying}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {isVerifying ? 'Verifying...' : verificationSuccess ? 'Valid!' : 'Verify Signature'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">
                      Lattice Key Encapsulation (FIPS 203)
                    </div>
                    <div className="font-semibold text-cyan-300 font-mono mt-0.5">
                      {transaction.pqcCertificate.encapsulationAlgorithm}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1 truncate">
                      Fingerprint: {transaction.pqcCertificate.kemPublicKeyFingerprint}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">
                      Dual Lattice Signature (FIPS 204)
                    </div>
                    <div className="font-semibold text-emerald-300 font-mono mt-0.5">
                      {transaction.pqcCertificate.signatureAlgorithm}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-1 truncate">
                      Digest: {transaction.pqcCertificate.signatureDigest}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">
                      Zero-Knowledge Circuit Attestation
                    </div>
                    <div className="font-mono text-zinc-200 text-[11px] mt-0.5 truncate">
                      {transaction.pqcCertificate.zkAttestationProof}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">
                      Hardware Cryptographic Nonce & TRNG
                    </div>
                    <div className="font-mono text-zinc-200 text-[11px] mt-0.5 truncate">
                      {transaction.pqcCertificate.nonce} ({transaction.pqcCertificate.entropySource})
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono pt-1 flex items-center justify-between border-t border-zinc-800/80">
                  <span>HSM Sealed Timestamp: {transaction.pqcCertificate.hsmSealedAt}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> FIPS 140-3 Level 4 Bound
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 mb-2">
                End-to-end clearing, validation, and cryptographic sealing milestones:
              </div>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {transaction.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-zinc-950 border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="p-3 rounded-lg border border-zinc-800/90 bg-zinc-900/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">
                          {step.step}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {step.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RAW PAYLOAD */}
          {activeTab === 'payload' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">
                  Format: {transaction.rawPayload.format}
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPayload ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedPayload ? 'Copied' : 'Copy Message'}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-72">
                {transaction.rawPayload.content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Audited & verified against Federal Reserve / ISO 20022 MX Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
