import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Globe,
  TrendingUp,
  Users,
  RefreshCw,
  Shield,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Building2,
  CheckCircle2,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  BankTransaction,
  TransactionType,
  TransactionDirection,
} from '../../types/banking';
import {
  TRANSACTION_PRESETS,
  TransactionPreset,
} from '../../data/mockBankAccounts';
import { bankingService } from '../../services/bankingService';

interface GenerateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionsGenerated: (newTxs: BankTransaction[]) => void;
}

export const GenerateTransactionModal: React.FC<GenerateTransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionsGenerated,
}) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Custom Form State
  const [customType, setCustomType] = useState<TransactionType>('FedNow Instant');
  const [customDirection, setCustomDirection] = useState<TransactionDirection>('CREDIT');
  const [customAmount, setCustomAmount] = useState<number>(250000);
  const [customCurrency, setCustomCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF'>('USD');
  const [customCounterpartyName, setCustomCounterpartyName] = useState('Federal Reserve Bank of New York');
  const [customCounterpartyBank, setCustomCounterpartyBank] = useState('FedNow Interbank Core Rail');
  const [customCounterpartyAccount, setCustomCounterpartyAccount] = useState('FED-RTGS-994821');
  const [customCounterpartyRouting, setCustomCounterpartyRouting] = useState('011000015');
  const [customCategory, setCustomCategory] = useState<BankTransaction['category']>('Interbank Rail');
  const [customIsoMessage, setCustomIsoMessage] = useState('pacs.008.001.10');
  const [customNote, setCustomNote] = useState('Instant gross liquidity settlement with ML-DSA-87 signature');
  const [customPqcLevel, setCustomPqcLevel] = useState<'FIPS 203 ML-KEM-1024' | 'FIPS 203 ML-KEM-768'>('FIPS 203 ML-KEM-1024');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  if (!isOpen) return null;

  // Handle Quick Batch Generation (e.g. 5 transactions)
  const handleGenerateBatch = (count = 5) => {
    setIsGeneratingBatch(true);
    setTimeout(() => {
      const { newTransactions } = bankingService.generateBatchTransactions(count);
      setIsGeneratingBatch(false);
      onTransactionsGenerated(newTransactions);
      onClose();
    }, 550);
  };

  // Handle preset click
  const handleApplyPreset = (preset: TransactionPreset) => {
    const { newTransaction } = bankingService.addCustomTransaction({
      type: preset.type,
      direction: preset.direction,
      amount: preset.suggestedAmount,
      currency: preset.currency,
      counterpartyName: preset.counterpartyName,
      counterpartyBank: preset.counterpartyBank,
      counterpartyAccount: preset.counterpartyAccount,
      counterpartyRouting: preset.counterpartyRouting,
      category: preset.category,
      isoMessageType: preset.isoMessageType,
      referenceNote: preset.referenceNote,
      pqcLevel: 'FIPS 203 ML-KEM-1024',
    });
    onTransactionsGenerated([newTransaction]);
    onClose();
  };

  // Handle Custom Form Submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCustom(true);

    setTimeout(() => {
      const { newTransaction } = bankingService.addCustomTransaction({
        type: customType,
        direction: customDirection,
        amount: Number(customAmount),
        currency: customCurrency,
        counterpartyName: customCounterpartyName,
        counterpartyBank: customCounterpartyBank,
        counterpartyAccount: customCounterpartyAccount,
        counterpartyRouting: customCounterpartyRouting,
        category: customCategory,
        isoMessageType: customIsoMessage,
        referenceNote: customNote,
        pqcLevel: customPqcLevel,
      });
      setIsSubmittingCustom(false);
      onTransactionsGenerated([newTransaction]);
      onClose();
    }, 600);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Users':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'RefreshCw':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'Lock':
        return <Lock className="w-4 h-4 text-indigo-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                Generate Banking Transactions
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Full Details & CBOM
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Simulate instant FedNow, SWIFT GPI wires, Treasury sweeps, or build custom ISO 20022 payloads.
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

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setMode('presets')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'presets'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Curated Presets & Batch
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Custom Transaction Builder
            </button>
          </div>

          {/* Quick Batch 5 Button */}
          <button
            onClick={() => handleGenerateBatch(5)}
            disabled={isGeneratingBatch}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            {isGeneratingBatch ? 'Generating 5 Txs...' : '⚡ Quick Generate 5 Transactions'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-4">
          {mode === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Select an enterprise rail scenario to trigger instantly:
                </span>
                <span className="text-xs text-zinc-500">
                  Includes full cryptographic certificates & ISO 20022 XML
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TRANSACTION_PRESETS.map((preset) => {
                  const isCredit = preset.direction === 'CREDIT';
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                              {getPresetIcon(preset.icon)}
                            </div>
                            <span className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                              {preset.name}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              isCredit
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {isCredit ? '+' : '-'}
                            {preset.suggestedAmount.toLocaleString('en-US', {
                              style: 'currency',
                              currency: preset.currency,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span className="truncate max-w-[160px]">
                          {preset.counterpartyName}
                        </span>
                        <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Execute & Sign →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant 1-Click Mass Injection Banner */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-200">
                    Need stress-test volume for audit simulation?
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Generate an instant batch of 10 multi-rail transactions across FedNow, SWIFT, and CLS.
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateBatch(10)}
                  disabled={isGeneratingBatch}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer shrink-0"
                >
                  Generate 10 Transactions
                </button>
              </div>
            </div>
          )}

          {mode === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
              {/* Type, Direction, and Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                    Rail / Settlement Protocol
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as TransactionType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FedNow Instant">FedNow Instant (Sub-second)</option>
                    <option value="SWIFT GPI Cross-Border">SWIFT GPI Cross-Border Wire</option>
                    <option value="Fedwire RTGS">Fedwire RTGS Wholesale</option>
                    <option value="ACH Direct Deposit">ACH Direct Deposit (Payroll)</option>
                    <option value="ACH Direct Debit">ACH Direct Debit (Vendor)</option>
                    <option value="Commercial Card Authorization">Commercial Card Auth</option>
                    <option value="Treasury Yield Interest">Treasury Yield Interest</option>
                    <option value="Multi-Currency FX Settlement">Multi-Currency FX Settlement</option>
                    <option value="Interbank Liquidity Transfer">Interbank Liquidity Transfer</option>
                    <option value="PQC Smart Contract Escrow">PQC Smart Contract Escrow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                    Flow Direction
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomDirection('CREDIT')}
                      className={`py-2 px-2 rounded-lg font-medium border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                        customDirection === 'CREDIT'
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      Credit (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomDirection('DEBIT')}
                      className={`py-2 px-2 rounded-lg font-medium border text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                        customDirection === 'DEBIT'
                          ? 'bg-rose-950 border-rose-600 text-rose-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      Debit (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-mono text-[11px] mb-1">
                    Amount & Currency
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <select
                      value={customCurrency}
                      onChange={(e) => setCustomCurrency(e.target.value as any)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="CHF">CHF</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Counterparty Fields */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Counterparty Institution & Routing Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                      Beneficiary / Counterparty Name
                    </label>
                    <input
                      type="text"
                      value={customCounterpartyName}
                      onChange={(e) => setCustomCounterpartyName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                      Counterparty Bank / Clearing Entity
                    </label>
                    <input
                      type="text"
                      value={customCounterpartyBank}
                      onChange={(e) => setCustomCounterpartyBank(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                      Account / IBAN / RTGS Identifier
                    </label>
                    <input
                      type="text"
                      value={customCounterpartyAccount}
                      onChange={(e) => setCustomCounterpartyAccount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                      Routing Number (ABA) / SWIFT BIC
                    </label>
                    <input
                      type="text"
                      value={customCounterpartyRouting}
                      onChange={(e) => setCustomCounterpartyRouting(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ISO 20022 and PQC Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                    Ledger Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Treasury & Reserves">Treasury & Reserves</option>
                    <option value="Vendor Settlement">Vendor Settlement</option>
                    <option value="Payroll & HR">Payroll & HR</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Interbank Rail">Interbank Rail</option>
                    <option value="Interest Income">Interest Income</option>
                    <option value="FX Hedging">FX Hedging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                    ISO 20022 Message Schema
                  </label>
                  <select
                    value={customIsoMessage}
                    onChange={(e) => setCustomIsoMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pacs.008.001.10">pacs.008.001.10 (Customer Credit Transfer)</option>
                    <option value="pacs.009.001.09">pacs.009.001.09 (Financial Inst. Transfer)</option>
                    <option value="camt.054.001.08">camt.054.001.08 (Debit/Credit Notification)</option>
                    <option value="pain.001.001.11">pain.001.001.11 (Payment Initiation/Payroll)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                    Post-Quantum Primitive (FIPS)
                  </label>
                  <select
                    value={customPqcLevel}
                    onChange={(e) => setCustomPqcLevel(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FIPS 203 ML-KEM-1024">ML-KEM-1024 + ML-DSA-87 (Max 100%)</option>
                    <option value="FIPS 203 ML-KEM-768">ML-KEM-768 + ML-DSA-65 (NIST L3)</option>
                  </select>
                </div>
              </div>

              {/* Memo Note */}
              <div>
                <label className="block text-zinc-400 text-[10px] font-mono mb-1">
                  Reconciliation Note / Settlement Memo
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Q3 Vendor retainer settlement"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingCustom}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  {isSubmittingCustom
                    ? 'Signing with ML-DSA-87 & Registering on Ledger...'
                    : 'Execute & Record Custom Transaction with Full Details'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Full attestation logs, UETRs, and cryptographic proofs generated automatically</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
