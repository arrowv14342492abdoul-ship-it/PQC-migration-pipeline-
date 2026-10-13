import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
  Smartphone,
  Zap,
} from 'lucide-react';
import { VirtualCard } from '../../types/banking';
import { bankingService } from '../../services/bankingService';

interface CardsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: VirtualCard[];
  onCardsUpdated: () => void;
}

export const CardsManagerModal: React.FC<CardsManagerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onCardsUpdated,
}) => {
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [applePayEnrolled, setApplePayEnrolled] = useState<Record<string, { enrolled: boolean; device: string }>>({});
  const [applePayTargetDevice, setApplePayTargetDevice] = useState<'iPhone 15' | 'iPhone 15 Pro' | 'iPhone 16 Pro Max' | 'Apple Watch Ultra 2'>('iPhone 15');
  const [isProvisioningApplePay, setIsProvisioningApplePay] = useState<boolean>(false);
  const [applePayMessage, setApplePayMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleToggleFreeze = (cardId: string) => {
    bankingService.toggleCardStatus(cardId);
    onCardsUpdated();
  };

  const handleAddToApplePay = async (cardId: string) => {
    setIsProvisioningApplePay(true);
    setApplePayMessage(`Connecting to ${applePayTargetDevice} Secure Enclave...`);
    await new Promise((r) => setTimeout(r, 600));
    setApplePayMessage('Generating NIST FIPS 204 ML-DSA-87 Device Cryptogram...');
    await new Promise((r) => setTimeout(r, 600));
    setApplePayMessage(`Provisioned into ${applePayTargetDevice} Secure Element!`);
    await new Promise((r) => setTimeout(r, 500));

    setApplePayEnrolled((prev) => ({
      ...prev,
      [cardId]: { enrolled: true, device: applePayTargetDevice },
    }));
    setIsProvisioningApplePay(false);
    setTimeout(() => setApplePayMessage(null), 3500);
  };

  const isRevealed = revealedCardId === selectedCard?.id;
  const enrolledInfo = applePayEnrolled[selectedCard?.id];
  const isInAppleWallet = Boolean(enrolledInfo?.enrolled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Corporate Cards & Virtual Quantum Tokens
              </h3>
              <p className="text-xs text-zinc-400">
                FIPS 204 signed dynamic CVV rotation and instantaneous freeze control.
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

        <div className="p-5 space-y-5 overflow-y-auto max-h-[66vh]">
          {/* Card Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCard?.id === card.id
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {card.type} ({card.cardNumber.slice(-4)})
              </button>
            ))}
          </div>

          {/* Visual Credit Card Preview */}
          {selectedCard && (
            <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col justify-between h-48">
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tracking-wider text-emerald-400 font-bold uppercase">
                      LATTICEOPS TREASURY
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 font-mono">
                      {selectedCard.type}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      selectedCard.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {selectedCard.status}
                  </span>
                </div>

                {/* EMV Chip & Contactless */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-amber-300/80 border border-amber-400/90 flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-800/40 rounded-sm" />
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">PQC-CHIP-FIPS140-3</span>
                </div>

                {/* Card Number */}
                <div>
                  <div className="font-mono text-lg sm:text-xl tracking-widest text-zinc-100 font-bold">
                    {isRevealed
                      ? selectedCard.cardNumber.replace(/••••/g, '8849')
                      : selectedCard.cardNumber}
                  </div>
                </div>

                {/* Card Bottom Row */}
                <div className="flex items-end justify-between text-xs font-mono">
                  <div>
                    <div className="text-[9px] text-zinc-400 uppercase">Cardholder</div>
                    <div className="text-zinc-200 font-medium">
                      {selectedCard.cardholderName}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-zinc-400 uppercase">Expires</div>
                    <div className="text-zinc-200">
                      {selectedCard.expiryMonth}/{selectedCard.expiryYear}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-zinc-400 uppercase">Dynamic CVV</div>
                    <div className="text-emerald-400 font-bold">
                      {isRevealed ? selectedCard.cvv : '•••'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm tracking-wide text-zinc-200">
                      {selectedCard.network}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls & Spend Limits */}
          {selectedCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRevealedCardId(isRevealed ? null : selectedCard.id)}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-200 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isRevealed ? <EyeOff className="w-4 h-4 text-zinc-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                  {isRevealed ? 'Hide Details' : 'Reveal Numbers & CVV'}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFreeze(selectedCard.id)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    selectedCard.status === 'ACTIVE'
                      ? 'border-rose-900/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60'
                      : 'border-emerald-900/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                  }`}
                >
                  {selectedCard.status === 'ACTIVE' ? (
                    <>
                      <Lock className="w-4 h-4 text-rose-400" /> Freeze Card Instantly
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-400" /> Unfreeze Card
                    </>
                  )}
                </button>
              </div>

              {/* Apple Pay Provisioning Button & Status */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-black/60 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black border border-zinc-700 flex items-center justify-center text-white shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>Apple Pay Hardware Provisioning</span>
                        {isInAppleWallet && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Active on {enrolledInfo?.device || 'iPhone 15'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {applePayMessage || (isInAppleWallet ? `Tokenized in ${enrolledInfo?.device || 'iPhone 15'} Secure Element` : 'Add this corporate card to Apple Wallet for contactless Tap-to-Pay')}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToApplePay(selectedCard.id)}
                    disabled={isProvisioningApplePay}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isInAppleWallet
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-white hover:bg-zinc-100 text-black shadow-md'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                    </svg>
                    {isProvisioningApplePay ? (
                      'Provisioning...'
                    ) : isInAppleWallet ? (
                      'In Apple Wallet ✓'
                    ) : (
                      'Add to Apple Wallet'
                    )}
                  </button>
                </div>

                {/* Device Selector for Provisioning */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                  <span className="text-zinc-400">Target Device:</span>
                  <div className="flex items-center gap-1.5">
                    {(['iPhone 15', 'iPhone 15 Pro', 'iPhone 16 Pro Max', 'Apple Watch Ultra 2'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setApplePayTargetDevice(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          applePayTargetDevice === d
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic PQC Rotation Banner */}
              <div className="p-3.5 rounded-xl border border-cyan-950/80 bg-cyan-950/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
                  <div>
                    <div className="font-semibold text-cyan-200">
                      Dynamic CVV Rotation Active ({selectedCard.pqcRotationSeconds}s intervals)
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Token: {selectedCard.dynamicPqcToken}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300">
                  ML-DSA Signed
                </span>
              </div>

              {/* Monthly Spend Limit Progress */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Monthly Spend Progress</span>
                  <span className="font-mono text-zinc-200 font-semibold">
                    ${selectedCard.spentThisMonth.toLocaleString()} / ${selectedCard.monthlyLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (selectedCard.spentThisMonth / selectedCard.monthlyLimit) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-500 text-right font-mono">
                  Available to spend: ${(selectedCard.monthlyLimit - selectedCard.spentThisMonth).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Protected by ML-DSA-87 Tokenization</span>
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
