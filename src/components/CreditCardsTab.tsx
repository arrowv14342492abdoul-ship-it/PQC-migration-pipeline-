import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Crown,
  ChevronRight,
  Search,
  Sliders,
  DollarSign,
  Smartphone,
  PhoneCall,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Building,
} from 'lucide-react';
import { CreditCardItem } from '../types/creditCard';
import { creditCardService } from '../services/creditCardService';
import { MetalCardVisualizer } from './creditcards/MetalCardVisualizer';
import { AddToApplePayModal } from './creditcards/AddToApplePayModal';
import { SimulateCardChargeModal } from './creditcards/SimulateCardChargeModal';

export const CreditCardsTab: React.FC = () => {
  const [cards, setCards] = useState<CreditCardItem[]>(() => creditCardService.getCards());
  const [selectedCardId, setSelectedCardId] = useState<string>('amex-centurion');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<'benefits' | 'transactions' | 'controls' | 'compare'>('benefits');
  
  // Modals
  const [isApplePayModalOpen, setIsApplePayModalOpen] = useState<boolean>(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState<boolean>(false);
  
  // Concierge interaction simulator
  const [conciergeMsg, setConciergeMsg] = useState<string>('');
  const [conciergeHistory, setConciergeHistory] = useState<Array<{ sender: 'user' | 'concierge'; text: string; time: string }>>([
    {
      sender: 'concierge',
      text: 'Good evening Mr. Sterling. This is Claire Beaumont at the Centurion Executive Desk. How may we assist your itinerary or reservations today?',
      time: '18:30',
    },
  ]);
  const [isConciergeTyping, setIsConciergeTyping] = useState<boolean>(false);

  // Search filter in transactions
  const [txSearch, setTxSearch] = useState<string>('');

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleCardUpdated = () => {
    setCards(creditCardService.getCards());
  };

  const handleToggleFreeze = () => {
    creditCardService.toggleFreeze(selectedCard.id);
    handleCardUpdated();
  };

  const handleToggleControl = (key: 'contactlessEnabled' | 'internationalEnabled' | 'onlinePurchasesEnabled') => {
    creditCardService.toggleControl(selectedCard.id, key);
    handleCardUpdated();
  };

  const handleSendConcierge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeMsg.trim()) return;

    const userText = conciergeMsg;
    setConciergeMsg('');
    setConciergeHistory((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setIsConciergeTyping(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsConciergeTyping(false);

    let reply = `Understood. I have logged this request with your Centurion Private Office manager and coordinated with our global concierge network.`;
    if (userText.toLowerCase().includes('table') || userText.toLowerCase().includes('dinner')) {
      reply = `I have secured a private chef table reservation for 4 this evening with VIP sommelier pairings. A confirmation dossier has been sent to your primary device.`;
    } else if (userText.toLowerCase().includes('flight') || userText.toLowerCase().includes('jet')) {
      reply = `Our private aviation coordinators have reserved a Bombardier Global 7500 charter on standby for your departure. Ground transfers via private Maybach are confirmed.`;
    } else if (userText.toLowerCase().includes('hotel') || userText.toLowerCase().includes('suite')) {
      reply = `Your suite upgrade to the Presidential Residence has been guaranteed with 4 PM late checkout and $200 resort credit applied.`;
    }

    setConciergeHistory((prev) => [
      ...prev,
      { sender: 'concierge', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
  };

  // Aggregated totals
  const totalPurchasingPower = useMemo(() => {
    return cards.reduce((sum, c) => sum + c.availableCredit, 0);
  }, [cards]);

  const totalCurrentBalance = useMemo(() => {
    return cards.reduce((sum, c) => sum + c.currentBalance, 0);
  }, [cards]);

  const applePayProvisionedCount = useMemo(() => {
    return cards.filter((c) => c.applePay.isProvisioned).length;
  }, [cards]);

  // Filtered transactions for active card
  const filteredTransactions = useMemo(() => {
    if (!selectedCard) return [];
    if (!txSearch.trim()) return selectedCard.recentTransactions;
    const q = txSearch.toLowerCase();
    return selectedCard.recentTransactions.filter(
      (t) =>
        t.merchant.toLowerCase().includes(q) ||
        t.merchantCategory.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [selectedCard, txSearch]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* 1. Header Portfolio Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-700/80 text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Luxury & Prestigious Credit Portfolio
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400 font-mono">
                Centurion Black · Platinum · JP Morgan Reserve · Apple Card
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Credit Cards & Apple Pay
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Manage ultra-high-net-worth credit lines, American Express Centurion titanium benefits,
              instant Apple Wallet hardware provisioning, and FIPS 204 ML-DSA quantum-resistant contactless security.
            </p>
          </div>

          {/* Aggregate Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Purchasing Power
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                ${(totalPurchasingPower / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">Combined Reserve</div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                Current Balance
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">
                ${totalCurrentBalance.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">Across {cards.length} Cards</div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
                Apple Wallet Passes
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-1.5">
                <span>{applePayProvisionedCount}</span>
                <span className="text-xs text-zinc-500">/ {cards.length}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Ready for Tap-to-Pay</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card Carousel / Selector Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-semibold text-zinc-200">Select Card to Inspect & Manage:</span>
          <span className="font-mono text-[11px]">{cards.length} Major Luxury & Corporate Cards Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {cards.map((card) => {
            const isSelected = selectedCard.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'border-amber-500 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-lg scale-[1.02]'
                    : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-zinc-400">
                      {card.brand}
                    </span>
                    {card.applePay.isProvisioned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="In Apple Wallet" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-zinc-100 truncate mt-1">
                    {card.name.replace('American Express', 'Amex')}
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                  <span>{card.cardNumber.slice(-4)}</span>
                  <span className="text-zinc-400 font-semibold">{card.material.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Card Inspection Workspace */}
      {selectedCard && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 3D Metal Card Visualizer & Quick Operations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center shadow-xl">
              <MetalCardVisualizer
                card={selectedCard}
                isRevealed={isRevealed}
                onOpenApplePay={() => setIsApplePayModalOpen(true)}
              />

              {/* Action Buttons Row */}
              <div className="w-full mt-6 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApplePayModalOpen(true)}
                  className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-850 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{selectedCard.applePay.isProvisioned ? 'Manage Apple Pay' : 'Add to Apple Pay'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChargeModalOpen(true)}
                  className="p-2.5 rounded-xl border border-amber-700/80 bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Simulate Charge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRevealed(!isRevealed)}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isRevealed ? <EyeOff className="w-4 h-4 text-zinc-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                  <span>{isRevealed ? 'Hide Details' : 'Reveal Numbers & CVV'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFreeze}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    selectedCard.isFrozen
                      ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                      : 'border-rose-900/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
                  }`}
                >
                  {selectedCard.isFrozen ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-400" /> Unfreeze Card
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-rose-400" /> Freeze Card
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Key Card Specs Card */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3 text-xs">
              <div className="font-semibold text-zinc-200 flex items-center justify-between">
                <span>Card Financial Specifications</span>
                <span className="font-mono text-zinc-400">{selectedCard.tier}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-zinc-300 font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 uppercase">Available Power</div>
                  <div className="text-sm font-bold text-emerald-400">
                    ${selectedCard.availableCredit.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 uppercase">Current Balance</div>
                  <div className="text-sm font-bold text-zinc-100">
                    ${selectedCard.currentBalance.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 uppercase">Annual Fee</div>
                  <div className="text-sm font-bold text-zinc-200">
                    ${selectedCard.annualFee.toLocaleString()}
                    {selectedCard.initiationFee ? ` (+$${selectedCard.initiationFee.toLocaleString()})` : ''}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 uppercase">{selectedCard.rewardsCurrency}</div>
                  <div className="text-sm font-bold text-amber-400">
                    {selectedCard.rewardsBalance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Deep Details */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs overflow-x-auto scrollbar-none">
              {[
                { id: 'benefits', label: 'Privileges & Concierge', icon: Award },
                { id: 'transactions', label: `Charges (${selectedCard.recentTransactions.length})`, icon: CreditCard },
                { id: 'controls', label: 'Apple Pay & Controls', icon: Smartphone },
                { id: 'compare', label: 'Compare Major Cards', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = subTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSubTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: PRIVILEGES & CONCIERGE */}
            {subTab === 'benefits' && (
              <div className="space-y-4">
                {/* Concierge Interactive Desk (Centurion / Private Bank) */}
                {selectedCard.conciergeDetails && (
                  <div className="p-4 rounded-xl border border-amber-900/60 bg-gradient-to-br from-amber-950/20 via-zinc-900 to-zinc-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-amber-200 text-xs">
                          {selectedCard.conciergeDetails.desk}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {selectedCard.conciergeDetails.availableHours}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-300">
                      Assigned Relationship Director:{' '}
                      <span className="text-white font-semibold">
                        {selectedCard.conciergeDetails.assignedManager}
                      </span>
                    </div>

                    {/* Chat / Message Stream */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2 max-h-48 overflow-y-auto">
                      {conciergeHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-2 rounded-lg ${
                            item.sender === 'user'
                              ? 'bg-zinc-800 text-zinc-100 ml-6 text-right'
                              : 'bg-amber-950/30 border border-amber-800/40 text-amber-100 mr-6'
                          }`}
                        >
                          <div className="text-[9px] text-zinc-500 mb-0.5">
                            {item.sender === 'user' ? 'You' : selectedCard.conciergeDetails?.assignedManager} · {item.time}
                          </div>
                          <div>{item.text}</div>
                        </div>
                      ))}
                      {isConciergeTyping && (
                        <div className="text-[11px] text-amber-400 font-mono italic animate-pulse">
                          Centurion Concierge typing...
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendConcierge} className="flex gap-2">
                      <input
                        type="text"
                        value={conciergeMsg}
                        onChange={(e) => setConciergeMsg(e.target.value)}
                        placeholder="Request private table, jet charter, or hotel upgrade..."
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={!conciergeMsg.trim()}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Benefits List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-zinc-300">
                    Card Privileges, Lounges & Elite Status
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCard.benefits.map((b, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          b.highlight
                            ? 'border-amber-700/60 bg-amber-950/20'
                            : 'border-zinc-800 bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white text-xs">{b.title}</span>
                          {b.valueAnnual && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-semibold shrink-0">
                              {b.valueAnnual}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: TRANSACTIONS & CHARGES */}
            {subTab === 'transactions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Search recent charges, merchants, or payment methods..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsChargeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>+ Simulate Charge</span>
                  </button>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden divide-y divide-zinc-800/80">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      No matching card charges found. Click "+ Simulate Charge" to test authorization.
                    </div>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <div key={`${tx.id}-${idx}`} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-zinc-900/40">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-white truncate flex items-center gap-2">
                            <span>{tx.merchant}</span>
                            {tx.paymentMethod.includes('Apple Pay') && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black border border-zinc-700 text-zinc-300">
                                Apple Pay
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-2 font-mono">
                            <span>{tx.date} {tx.time}</span>
                            <span>·</span>
                            <span>{tx.merchantCategory}</span>
                            <span>·</span>
                            <span>{tx.cityCountry}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold font-mono text-zinc-100 text-sm">
                            -${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] font-mono text-amber-400">
                            +{tx.pointsEarned.toLocaleString()} {selectedCard.rewardsCurrency.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: APPLE PAY & CONTROLS */}
            {subTab === 'controls' && (
              <div className="space-y-4">
                {/* Apple Pay Integration Status Box */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-black border border-zinc-700 flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-white text-xs">
                        Apple Pay Hardware Tokenization
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        selectedCard.applePay.isProvisioned
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {selectedCard.applePay.isProvisioned ? 'PROVISIONED' : 'NOT PROVISIONED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
                      <div className="text-[10px] text-zinc-500">Device Account Number</div>
                      <div className="text-zinc-200 font-bold">
                        {selectedCard.applePay.deviceAccountNumber || 'None'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
                      <div className="text-[10px] text-zinc-500">Secure Element ID</div>
                      <div className="text-zinc-300 truncate">
                        {selectedCard.applePay.secureElementId || 'None'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsApplePayModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {selectedCard.applePay.isProvisioned
                      ? 'Launch Apple Wallet Simulator & Pass Settings'
                      : 'Add this Card to Apple Pay'}
                  </button>
                </div>

                {/* Physical Card Security Toggles */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3 text-xs">
                  <div className="font-semibold text-white">Hardware & Channel Security Controls</div>

                  <div className="space-y-2">
                    {[
                      {
                        key: 'contactlessEnabled',
                        label: 'NFC Contactless Field (Metal Antenna)',
                        desc: 'Enable 13.56 MHz EMV tap-to-pay payments with physical card',
                      },
                      {
                        key: 'internationalEnabled',
                        label: 'International Roaming & Foreign Currencies',
                        desc: 'Global spending without foreign transaction fee surcharges',
                      },
                      {
                        key: 'onlinePurchasesEnabled',
                        label: 'E-Commerce & Online Card-Not-Present',
                        desc: 'Allow virtual transactions signed with dynamic FIPS 204 tokens',
                      },
                    ].map((item) => {
                      const isEnabled = selectedCard.controls[item.key as keyof typeof selectedCard.controls] as boolean;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-850">
                          <div>
                            <div className="font-semibold text-zinc-200">{item.label}</div>
                            <div className="text-[11px] text-zinc-500">{item.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleControl(item.key as any)}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                              isEnabled ? 'bg-emerald-600' : 'bg-zinc-800'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                                isEnabled ? 'left-6' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: COMPARE MAJOR CARDS */}
            {subTab === 'compare' && (
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-xs">
                    Side-by-Side Comparison: Major Luxury & Metal Cards
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">8 Cards Benchmarked</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                        <th className="py-2 pr-3 font-medium">Card Name</th>
                        <th className="py-2 px-3 font-medium">Material / Weight</th>
                        <th className="py-2 px-3 font-medium">Annual Fee</th>
                        <th className="py-2 px-3 font-medium">Credit Underwriting</th>
                        <th className="py-2 px-3 font-medium">Apple Pay</th>
                        <th className="py-2 pl-3 font-medium">Lounge Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {cards.map((c) => (
                        <tr
                          key={c.id}
                          className={`hover:bg-zinc-900/50 ${
                            selectedCard.id === c.id ? 'bg-amber-950/20 text-amber-200' : 'text-zinc-300'
                          }`}
                        >
                          <td className="py-2.5 pr-3 font-sans font-semibold">
                            {c.name}
                          </td>
                          <td className="py-2.5 px-3">{c.material} ({c.weightGrams}g)</td>
                          <td className="py-2.5 px-3">${c.annualFee.toLocaleString()}/yr</td>
                          <td className="py-2.5 px-3">{c.creditLimit === 'No Preset Spending Limit' ? 'NPSL (Dynamic)' : `$${(c.creditLimit as number).toLocaleString()}`}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-400 font-bold">✓ Ready</span>
                          </td>
                          <td className="py-2.5 pl-3 font-sans text-[11px]">
                            {c.id === 'amex-centurion'
                              ? 'Centurion Lounges + Private Suites'
                              : c.id === 'amex-platinum'
                              ? 'Global Lounge Collection'
                              : c.id === 'jpm-reserve'
                              ? 'United Club Full Membership'
                              : 'Priority Pass Select'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedCard && (
        <>
          <AddToApplePayModal
            isOpen={isApplePayModalOpen}
            onClose={() => setIsApplePayModalOpen(false)}
            card={selectedCard}
            onCardUpdated={handleCardUpdated}
          />

          <SimulateCardChargeModal
            isOpen={isChargeModalOpen}
            onClose={() => setIsChargeModalOpen(false)}
            card={selectedCard}
            onChargeComplete={handleCardUpdated}
          />
        </>
      )}
    </div>
  );
};
