import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Zap,
  Sparkles,
  ShoppingBag,
  Plane,
  Utensils,
  Building2,
  Cpu,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { CreditCardItem } from '../../types/creditCard';
import { creditCardService } from '../../services/creditCardService';

interface SimulateCardChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCardItem;
  onChargeComplete: () => void;
}

const PRESET_CHARGES = [
  {
    merchant: 'NetJets Private Aviation Charter',
    category: 'Private Aviation Charter',
    amount: 19850,
    icon: Plane,
    cityCountry: 'New York, US',
  },
  {
    merchant: 'Le Bernardin (3 Michelin Star Private Dining)',
    category: 'Fine Dining & Gastronomy',
    amount: 1450,
    icon: Utensils,
    cityCountry: 'New York, US',
  },
  {
    merchant: 'Four Seasons Resort Bora Bora Penthouse Suite',
    category: 'Luxury Hotel & Resort',
    amount: 9200,
    icon: Building2,
    cityCountry: 'Bora Bora, PF',
  },
  {
    merchant: 'Apple Fifth Avenue Flagship (Mac Studio M3 & Vision Pro)',
    category: 'Hardware & Tech',
    amount: 4999,
    icon: Cpu,
    cityCountry: 'New York, US',
  },
  {
    merchant: 'Amazon Web Services (Production GPU Cluster)',
    category: 'Cloud Infrastructure',
    amount: 14200,
    icon: Cpu,
    cityCountry: 'Seattle, US',
  },
  {
    merchant: 'Loro Piana Milan Flagship',
    category: 'Luxury Fashion & Apparel',
    amount: 3850,
    icon: ShoppingBag,
    cityCountry: 'Milan, IT',
  },
];

export const SimulateCardChargeModal: React.FC<SimulateCardChargeModalProps> = ({
  isOpen,
  onClose,
  card,
  onChargeComplete,
}) => {
  const [merchant, setMerchant] = useState<string>(PRESET_CHARGES[0].merchant);
  const [category, setCategory] = useState<string>(PRESET_CHARGES[0].category);
  const [amount, setAmount] = useState<number>(PRESET_CHARGES[0].amount);
  const [cityCountry, setCityCountry] = useState<string>(PRESET_CHARGES[0].cityCountry);
  const [paymentMethod, setPaymentMethod] = useState<
    'Apple Pay (Face ID)' | 'Contactless EMV' | 'Chip & PIN' | 'Online Token'
  >(card.applePay.isProvisioned ? 'Apple Pay (Face ID)' : 'Contactless EMV');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    pointsEarned: number;
    merchant: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (p: (typeof PRESET_CHARGES)[0]) => {
    setMerchant(p.merchant);
    setCategory(p.category);
    setAmount(p.amount);
    setCityCountry(p.cityCountry);
  };

  const handleExecuteCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 650));
      const res = creditCardService.simulateTransaction(card.id, {
        merchant,
        merchantCategory: category,
        amount: Number(amount),
        paymentMethod,
        cityCountry,
      });

      setSuccessResult({
        pointsEarned: res.transaction.pointsEarned,
        merchant: res.transaction.merchant,
        amount: res.transaction.amount,
        paymentMethod: res.transaction.paymentMethod,
      });

      setIsSubmitting(false);
      onChargeComplete();
    } catch (err: any) {
      alert(err.message || 'Error executing charge');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Simulate Card Charge & Reward Points
              </h3>
              <p className="text-xs text-zinc-400">
                Authorizing on {card.name} ({card.cardNumber.slice(-4)})
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[66vh]">
          {successResult ? (
            <div className="p-5 rounded-2xl border border-emerald-700/80 bg-emerald-950/40 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-lg">Transaction Approved!</h4>
              <p className="text-xs text-zinc-300">
                ${successResult.amount.toLocaleString()} charged to {card.name} at {successResult.merchant}
              </p>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-around text-xs font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">Method</div>
                  <div className="font-semibold text-zinc-200">{successResult.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Rewards Accrued</div>
                  <div className="font-bold text-amber-400">
                    +{successResult.pointsEarned.toLocaleString()} {card.rewardsCurrency}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Simulate Another Charge
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteCharge} className="space-y-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CHARGES.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.merchant}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-2 ${
                          merchant === p.merchant
                            ? 'border-amber-500 bg-amber-950/30 text-white'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{p.merchant}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">${p.amount.toLocaleString()}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Merchant & Amount Fields */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-medium">Merchant Name</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-medium">Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-medium">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium">Authorization Rail</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Apple Pay (Face ID)', label: 'Apple Pay (Face ID)', icon: Smartphone },
                    { id: 'Contactless EMV', label: 'Contactless Metal Tap', icon: Zap },
                    { id: 'Chip & PIN', label: 'Titanium Chip & PIN', icon: CreditCard },
                    { id: 'Online Token', label: 'Encrypted Online Token', icon: Sparkles },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-xl border text-left text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? 'Authorizing Cryptogram...' : `Authorize $${amount.toLocaleString()} Charge`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
