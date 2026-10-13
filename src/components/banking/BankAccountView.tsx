import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Send,
  Building2,
  ShieldAlert,
  ChevronRight,
  Filter,
  DollarSign,
  Copy,
  Check,
  Eye,
  EyeOff,
  Download,
  CreditCard,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  TrendingUp,
  Globe,
  Coins,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BankAccount,
  BankTransaction,
  TransactionType,
  TransactionDirection,
} from '../../types/banking';
import { bankingService } from '../../services/bankingService';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { GenerateTransactionModal } from './GenerateTransactionModal';
import { StatementExportModal } from './StatementExportModal';
import { SendPaymentModal } from './SendPaymentModal';
import { ReceivePaymentModal } from './ReceivePaymentModal';
import { CardsManagerModal } from './CardsManagerModal';

export const BankAccountView: React.FC = () => {
  const [account, setAccount] = useState<BankAccount>(bankingService.getAccount());
  const [transactions, setTransactions] = useState<BankTransaction[]>(
    bankingService.getTransactions()
  );

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BankTransaction | null>(null);

  // Mask / unmask account number
  const [showFullAccountNum, setShowFullAccountNum] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Search and filters for the ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [filterRail, setFilterRail] = useState<string>('ALL');

  // Quick 1-click batch generation
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTransactionsGenerated = (newTxs: BankTransaction[]) => {
    setTransactions(bankingService.getTransactions());
    setAccount(bankingService.getAccount());
    if (newTxs.length === 1) {
      // Auto-open detail modal for custom transaction
      setSelectedTransaction(newTxs[0]);
    }
  };

  const handleQuickBatchGenerate = () => {
    setIsQuickGenerating(true);
    setTimeout(() => {
      const { newTransactions } = bankingService.generateBatchTransactions(5);
      setTransactions(bankingService.getTransactions());
      setAccount(bankingService.getAccount());
      setIsQuickGenerating(false);
    }, 600);
  };

  const handleRefreshAccount = () => {
    setAccount(bankingService.getAccount());
    setTransactions(bankingService.getTransactions());
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        searchQuery === '' ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.counterpartyBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.uetr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.amount.toString().includes(searchQuery);

      const matchesDirection =
        filterDirection === 'ALL' || tx.direction === filterDirection;

      const matchesRail =
        filterRail === 'ALL' ||
        tx.type.toLowerCase().includes(filterRail.toLowerCase());

      return matchesSearch && matchesDirection && matchesRail;
    });
  }, [transactions, searchQuery, filterDirection, filterRail]);

  // Aggregate stats
  const totalVolume = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Account Primary Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/20 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Account Identifiers */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/90 border border-emerald-700/80 text-emerald-300">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                {account.accountType}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-300 font-mono">
                {account.institutionName}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/80">
                <ShieldCheck className="w-3 h-3" />
                {account.hsmFipsLevel}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {account.accountName}
              </h2>

              {/* Account Numbers Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Account:</span>
                  <span className="text-zinc-200 font-semibold">
                    {showFullAccountNum ? account.accountNumber : account.maskedAccountNumber}
                  </span>
                  <button
                    onClick={() => setShowFullAccountNum(!showFullAccountNum)}
                    className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
                    title={showFullAccountNum ? 'Mask account' : 'Reveal account'}
                  >
                    {showFullAccountNum ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy('acc', account.accountNumber)}
                    className="text-zinc-500 hover:text-emerald-400 cursor-pointer"
                    title="Copy account number"
                  >
                    {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Routing (ABA):</span>
                  <span className="text-emerald-400 font-semibold">{account.routingNumber}</span>
                  <button
                    onClick={() => handleCopy('routing', account.routingNumber)}
                    className="text-zinc-500 hover:text-emerald-400 cursor-pointer"
                  >
                    {copiedField === 'routing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">SWIFT/BIC:</span>
                  <span className="text-cyan-300 font-semibold">{account.swiftBic}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards Group */}
          <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 shrink-0">
            {/* Available Balance */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-950/90 min-w-[220px] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                <span>Available Balance</span>
                <span className="text-emerald-400 font-semibold">USD</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                {account.availableBalance.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
                <span>Ledger Bal: ${account.ledgerBalance.toLocaleString()}</span>
                <span className="text-zinc-500">Pending: ${account.pendingFunds.toLocaleString()}</span>
              </div>
            </div>

            {/* Treasury Yield Widget */}
            <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 min-w-[190px] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Yield APY
                </span>
                <span className="text-emerald-400 font-bold">{account.yieldApyPercent}%</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
                +${account.accruedYield.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                Overnight T-Bill sweep compounding
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Ribbon */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* PRIMARY: Generate Transactions */}
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>⚡ Generate Transactions</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-700/80 text-[10px] font-mono">
                Full Details
              </span>
            </button>

            {/* Send Wire / Payment */}
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Send Wire / Transfer</span>
            </button>

            {/* Receive / Wire Sheet */}
            <button
              onClick={() => setIsReceiveModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Receive Instructions</span>
            </button>

            {/* Virtual Cards */}
            <button
              onClick={() => setIsCardsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-zinc-100 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Cards ({account.virtualCards.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Statement */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Export Statements</span>
            </button>

            <button
              onClick={handleRefreshAccount}
              title="Refresh ledger state"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Multi-Currency Sub-Accounts & Reserves Strip */}
      <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-900/40 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-200">
              Multi-Currency Reserves & Foreign Exchange Balances
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            CLS PvP Settlement Ready · 5 Currencies Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {account.subBalances.map((sub) => (
            <div
              key={sub.currency}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-1 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold font-mono text-zinc-200">
                  <span>{sub.flag}</span> {sub.currency}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {sub.currency === 'USD' ? '1.0000' : `@ ${sub.exchangeRateToUsd}`}
                </span>
              </div>
              <div className="text-base font-bold font-mono text-zinc-100">
                {sub.symbol}
                {sub.balance.toLocaleString('en-US', {
                  maximumFractionDigits: sub.currency === 'JPY' ? 0 : 2,
                })}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                ≈ ${sub.usdEquivalent.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Transaction Ledger & Audit Log */}
      <div className="space-y-3">
        {/* Ledger Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              Transaction Ledger & Audit Trail
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {transactions.length} Records
              </span>
            </h3>
          </div>

          {/* Quick Batch Generate Button in Ledger Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickBatchGenerate}
              disabled={isQuickGenerating}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              {isQuickGenerating ? 'Generating 5 Records...' : '+5 Realistic Transactions'}
            </button>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Custom Builder
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by counterparty, UETR, message (pacs.008), or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Direction Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setFilterDirection('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterDirection === 'ALL'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterDirection('CREDIT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterDirection === 'CREDIT'
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Credits
            </button>
            <button
              onClick={() => setFilterDirection('DEBIT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterDirection === 'DEBIT'
                  ? 'bg-rose-950 border border-rose-700 text-rose-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-rose-400" /> Debits
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <div className="text-zinc-400 text-sm">No transactions match your search criteria</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterDirection('ALL');
                  setFilterRail('ALL');
                }}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {filteredTransactions.map((tx, idx) => {
                const isCredit = tx.direction === 'CREDIT';

                return (
                  <div
                    key={`${tx.id}-${idx}`}
                    onClick={() => setSelectedTransaction(tx)}
                    className="p-3.5 sm:p-4 hover:bg-zinc-900/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Direction Icon + Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 sm:mt-0 ${
                          isCredit
                            ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-zinc-100 text-xs sm:text-sm group-hover:text-emerald-300 transition-colors truncate">
                            {tx.counterpartyName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-850 text-zinc-300 border border-zinc-750">
                            {tx.type}
                          </span>
                          <span className="hidden md:inline text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
                            {tx.pqcCertificate.encapsulationAlgorithm.split(' ')[0]}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400 truncate max-w-lg">
                          {tx.description}
                        </div>

                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                          <span>{tx.date} · {tx.timestamp}</span>
                          <span>·</span>
                          <span className="truncate max-w-[140px] sm:max-w-[200px]">
                            UETR: {tx.uetr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount, Status, and View Details Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-4">
                      <div className="text-left sm:text-right">
                        <div
                          className={`font-mono font-bold text-sm sm:text-base ${
                            isCredit ? 'text-emerald-400' : 'text-zinc-100'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {tx.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: tx.currency,
                          })}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          Bal: ${tx.balanceAfter.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                          {tx.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Transaction Full Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* 2. Generate Transaction Modal */}
      <GenerateTransactionModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onTransactionsGenerated={handleTransactionsGenerated}
      />

      {/* 3. Export Statements Modal */}
      <StatementExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* 4. Send Payment Modal */}
      <SendPaymentModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        availableBalance={account.availableBalance}
        onPaymentSent={(newTx) => handleTransactionsGenerated([newTx])}
      />

      {/* 5. Receive Payment Modal */}
      <ReceivePaymentModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        account={account}
      />

      {/* 6. Corporate Cards Modal */}
      <CardsManagerModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        cards={account.virtualCards}
        onCardsUpdated={() => setAccount(bankingService.getAccount())}
      />
    </div>
  );
};
