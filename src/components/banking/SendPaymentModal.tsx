import React, { useState } from 'react';
import {
  X,
  Send,
  Building2,
  Lock,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { BankTransaction, TransactionType } from '../../types/banking';
import { bankingService } from '../../services/bankingService';

interface SendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onPaymentSent: (tx: BankTransaction) => void;
}

export const SendPaymentModal: React.FC<SendPaymentModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onPaymentSent,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientRouting, setRecipientRouting] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [rail, setRail] = useState<TransactionType>('FedNow Instant');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<'input' | 'signing' | 'confirmed'>('input');
  const [confirmedTx, setConfirmedTx] = useState<BankTransaction | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > availableBalance) return;

    setStep('signing');
    setIsSending(true);

    setTimeout(() => {
      const { newTransaction } = bankingService.addCustomTransaction({
        type: rail,
        direction: 'DEBIT',
        amount: Number(amount),
        currency: currency as any,
        counterpartyName: recipientName,
        counterpartyBank: recipientBank || 'Interbank Receiving Member',
        counterpartyAccount: recipientAccount || 'ACCT-99201948',
        counterpartyRouting: recipientRouting || '021000021',
        category: 'Vendor Settlement',
        isoMessageType: rail.includes('SWIFT') ? 'pacs.009.001.09' : 'pacs.008.001.10',
        referenceNote: memo || `Wholesale wire disbursement to ${recipientName}`,
        pqcLevel: 'FIPS 203 ML-KEM-1024',
      });

      setIsSending(false);
      setConfirmedTx(newTransaction);
      setStep('confirmed');
      onPaymentSent(newTransaction);
    }, 1100);
  };

  const handleReset = () => {
    setStep('input');
    setRecipientName('');
    setRecipientBank('');
    setRecipientAccount('');
    setRecipientRouting('');
    setAmount(50000);
    setMemo('');
    setConfirmedTx(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Send Quantum-Protected Wire / Payment
              </h3>
              <p className="text-xs text-zinc-400">
                Lattice encapsulated transfer across FedNow, Fedwire, and SWIFT rails.
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

        <div className="p-5 overflow-y-auto max-h-[64vh]">
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Rail Selection */}
              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Settlement Rail
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRail('FedNow Instant')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      rail === 'FedNow Instant'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> FedNow
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">&lt; 1s Finality</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRail('SWIFT GPI Cross-Border')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      rail === 'SWIFT GPI Cross-Border'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" /> SWIFT GPI
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Cross-Border</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRail('Fedwire RTGS')}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      rail === 'Fedwire RTGS'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Fedwire
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Wholesale RTGS</div>
                  </button>
                </div>
              </div>

              {/* Amount and Currency */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-mono text-[11px]">
                    Transfer Amount
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Available: {availableBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={availableBalance}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="text-xs font-semibold text-zinc-300">
                  Beneficiary & Routing Information
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                      Recipient / Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Microelectronics LLC"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                        Routing (ABA) / SWIFT BIC
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 021000021"
                        value={recipientRouting}
                        onChange={(e) => setRecipientRouting(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                        Account # / IBAN
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4829103948"
                        value={recipientAccount}
                        onChange={(e) => setRecipientAccount(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                      Beneficiary Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Citigroup North America N.A."
                      value={recipientBank}
                      onChange={(e) => setRecipientBank(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                  Payment Reference / Invoice Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #2026-881 Hardware Supply Settlement"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Security Shield Callout */}
              <div className="p-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20 flex items-center gap-2.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Outgoing wire will be encapsulated with NIST FIPS 203 ML-KEM-1024 and signed via dual FIPS 204 ML-DSA-87 keys.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Authorize & Disburse {amount.toLocaleString('en-US', { style: 'currency', currency })}
              </button>
            </form>
          )}

          {step === 'signing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white text-base">
                  Encapsulating via ML-KEM-1024 & Signing...
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  Performing HSM multi-party computation handshake with Federal Reserve / SWIFT nodes...
                </div>
              </div>
            </div>
          )}

          {step === 'confirmed' && confirmedTx && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white text-lg">
                  Wire Successfully Disbursed!
                </div>
                <div className="text-xs text-zinc-400">
                  {confirmedTx.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: confirmedTx.currency,
                  })}{' '}
                  settled to {confirmedTx.counterpartyName}.
                </div>
              </div>

              <div className="w-full p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">UETR:</span>
                  <span className="text-zinc-300 truncate max-w-[240px]">
                    {confirmedTx.uetr}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rail:</span>
                  <span className="text-cyan-300">{confirmedTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PQC Proof:</span>
                  <span className="text-emerald-400">
                    {confirmedTx.pqcCertificate.signatureAlgorithm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-emerald-300 font-bold">{confirmedTx.status}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
