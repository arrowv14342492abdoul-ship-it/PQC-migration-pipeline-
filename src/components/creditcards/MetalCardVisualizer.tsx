import React, { useState } from 'react';
import {
  RotateCcw,
  Wifi,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';
import { CreditCardItem } from '../../types/creditCard';

interface MetalCardVisualizerProps {
  card: CreditCardItem;
  isRevealed: boolean;
  onOpenApplePay: () => void;
}

export const MetalCardVisualizer: React.FC<MetalCardVisualizerProps> = ({
  card,
  isRevealed,
  onOpenApplePay,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Helper styles based on metal type
  const getCardStyle = () => {
    switch (card.theme.metalType) {
      case 'titanium': // Centurion Black Titanium
        return {
          container:
            'bg-gradient-to-br from-zinc-950 via-neutral-900 to-black border-zinc-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]',
          text: 'text-zinc-100',
          subtext: 'text-zinc-400',
          metalLabel: 'ANODIZED TITANIUM · 28G',
          chip: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 border-zinc-400',
        };
      case 'steel': // Amex Platinum Steel
        return {
          container:
            'bg-gradient-to-br from-slate-800 via-zinc-700 to-slate-900 border-slate-500/80 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25)]',
          text: 'text-white',
          subtext: 'text-slate-300',
          metalLabel: 'PRECISION STAINLESS STEEL · 18G',
          chip: 'bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border-amber-300',
        };
      case 'palladium': // JP Morgan Reserve
        return {
          container:
            'bg-gradient-to-br from-zinc-950 via-amber-950/50 to-neutral-900 border-amber-600/70 shadow-[0_20px_50px_rgba(20,10,0,0.8),inset_0_0_12px_rgba(245,158,11,0.2)]',
          text: 'text-amber-100',
          subtext: 'text-amber-300/70',
          metalLabel: 'PALLADIUM & 23K GOLD INLAY · 27G',
          chip: 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-amber-400',
        };
      case 'sapphire': // Chase Sapphire
        return {
          container:
            'bg-gradient-to-br from-sky-950 via-slate-950 to-indigo-950 border-sky-500/70 shadow-[0_20px_50px_rgba(0,10,30,0.8),inset_0_1px_2px_rgba(56,189,248,0.25)]',
          text: 'text-sky-100',
          subtext: 'text-sky-300/70',
          metalLabel: 'EMBEDDED OBSIDIAN CORE · 13G',
          chip: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 border-zinc-400',
        };
      case 'whitetitanium': // Apple Card
        return {
          container:
            'bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 border-zinc-300 shadow-[0_20px_45px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)]',
          text: 'text-zinc-900',
          subtext: 'text-zinc-600',
          metalLabel: 'LASER-ETCHED TITANIUM · 15G',
          chip: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 border-zinc-400',
        };
      case 'blackpvd': // Mastercard Black Card
        return {
          container:
            'bg-gradient-to-br from-black via-zinc-950 to-neutral-950 border-zinc-600 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)]',
          text: 'text-zinc-100',
          subtext: 'text-zinc-400',
          metalLabel: 'PVD STAINLESS STEEL & CARBON · 22G',
          chip: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 border-zinc-400',
        };
      default:
        return {
          container:
            'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-zinc-700 shadow-2xl',
          text: 'text-zinc-100',
          subtext: 'text-zinc-400',
          metalLabel: `${card.material.toUpperCase()} · ${card.weightGrams}G`,
          chip: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-500 border-zinc-400',
        };
    }
  };

  const style = getCardStyle();
  const isAppleCard = card.id === 'apple-card';
  const isCenturion = card.id === 'amex-centurion';
  const isAmex = card.brand === 'American Express';

  return (
    <div className="relative flex flex-col items-center">
      {/* 3D-styled Physical Card Container */}
      <div
        className={`relative w-full max-w-[420px] aspect-[1.586/1] rounded-2xl border p-5 sm:p-6 transition-all duration-300 select-none overflow-hidden ${style.container}`}
      >
        {/* Subtle holographic light sheen overlay */}
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 pointer-events-none" />

        {/* FRONT VIEW */}
        {!isFlipped ? (
          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs tracking-widest font-extrabold uppercase">
                  {isCenturion ? (
                    <span className="tracking-[0.25em] text-zinc-100">AMERICAN EXPRESS</span>
                  ) : isAppleCard ? (
                    <div className="flex items-center gap-1.5 text-zinc-900">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                      </svg>
                      <span className="font-semibold text-xs tracking-tight">Apple Card</span>
                    </div>
                  ) : (
                    <span>{card.brand.toUpperCase()}</span>
                  )}
                </div>
                <div className={`text-[9px] font-mono mt-0.5 tracking-wider ${style.subtext}`}>
                  {style.metalLabel}
                </div>
              </div>

              {/* Status / Contactless Wave */}
              <div className="flex items-center gap-2">
                <Wifi className={`w-4 h-4 rotate-90 ${style.subtext}`} />
                {card.isFrozen ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 border border-rose-800 text-rose-300">
                    FROZEN
                  </span>
                ) : (
                  card.isInvitationOnly && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700/80 text-amber-300">
                      INVITE ONLY
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Middle Row: EMV Chip & Centurion Emblem Watermark */}
            <div className="relative flex items-center justify-between">
              {/* Post-Quantum EMV Chip */}
              {!isAppleCard && (
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-11 h-8 rounded-md border flex items-center justify-center p-1 shadow-inner ${style.chip}`}
                  >
                    <div className="w-full h-full border border-black/30 rounded-xs flex flex-col justify-between p-0.5">
                      <div className="w-full h-px bg-black/20" />
                      <div className="w-full h-px bg-black/20" />
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono ${style.subtext}`}>
                    ML-DSA-87
                  </span>
                </div>
              )}

              {/* Centurion Roman Soldier Emblem Watermark */}
              {isCenturion && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-400 flex items-center justify-center font-serif text-3xl font-black text-zinc-300">
                    𐂂
                  </div>
                  <span className="text-[7px] font-mono tracking-widest text-zinc-400 mt-1">
                    CENTURION
                  </span>
                </div>
              )}
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              {!isAppleCard ? (
                <div className="font-mono text-base sm:text-lg tracking-[0.22em] font-bold drop-shadow-sm">
                  {isRevealed ? card.rawCardNumber : card.cardNumber}
                </div>
              ) : (
                <div className="text-[11px] text-zinc-500 font-mono italic">
                  No printed card numbers on pure titanium body
                </div>
              )}
            </div>

            {/* Bottom Row: Cardholder & Network */}
            <div className="flex items-end justify-between font-mono text-xs">
              <div>
                <div className={`text-[8px] uppercase tracking-wider ${style.subtext}`}>
                  Cardholder
                </div>
                <div className={`font-semibold tracking-wider text-xs sm:text-sm ${style.text}`}>
                  {card.cardholderName}
                </div>
                {isAmex && (
                  <div className={`text-[9px] tracking-wide mt-0.5 ${style.subtext}`}>
                    MEMBER SINCE {card.memberSince}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className={`text-[8px] uppercase tracking-wider ${style.subtext}`}>
                  Expires
                </div>
                <div className={`font-semibold text-xs ${style.text}`}>
                  {isAppleCard ? '••/••' : `${card.expiryMonth}/${card.expiryYear}`}
                </div>
                <div className={`font-bold text-xs sm:text-sm tracking-wide mt-0.5 ${style.text}`}>
                  {card.network}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* BACK VIEW */
          <div className="relative z-10 flex flex-col justify-between h-full text-zinc-100">
            {/* Magnetic Stripe */}
            <div className="-mx-6 -mt-1 h-10 bg-black/90 border-y border-zinc-800 flex items-center px-6">
              <span className="text-[8px] font-mono text-zinc-600">
                PQC LATTICE RESISTANT HIGH-COERCIVITY STRIPE
              </span>
            </div>

            {/* Signature Strip & CVV */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-8 bg-zinc-200 text-zinc-900 px-3 flex items-center justify-between font-serif italic text-xs border border-zinc-400">
                  <span>{card.cardholderName}</span>
                  <span className="text-[8px] font-mono text-zinc-500">AUTHORIZED SIGNATURE</span>
                </div>
                <div className="px-3 py-1 rounded bg-black/80 border border-zinc-700 font-mono text-xs text-amber-400 font-bold">
                  {isRevealed ? card.cvv : '•••'}
                </div>
              </div>
            </div>

            {/* Issuer Disclosures & Concierge */}
            <div className="text-[8px] font-mono text-zinc-400 space-y-1">
              <div>Issued by {card.issuer}. Protected under NIST FIPS 204 ML-DSA cryptography.</div>
              {card.conciergeDetails && (
                <div className="text-amber-300/80">
                  24/7 Priority Concierge: {card.conciergeDetails.phone}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-800">
              <span>{card.subName}</span>
              <span>Made in USA</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Visual Controls Ribbon */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {/* Flip Card Toggle */}
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>{isFlipped ? 'View Front Side' : 'Flip to Back (CVV & Stripe)'}</span>
        </button>

        {/* Authentic Apple Pay Button */}
        {card.applePay.isProvisioned ? (
          <button
            type="button"
            onClick={onOpenApplePay}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-700/80 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {/* Apple Logo SVG */}
            <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
            </svg>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>In Apple Wallet ({card.applePay.deviceAccountNumber})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenApplePay}
            className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
            </svg>
            <span>Add to Apple Wallet</span>
          </button>
        )}
      </div>
    </div>
  );
};
