import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Watch,
  Laptop,
  Tablet,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';
import { CreditCardItem } from '../../types/creditCard';
import { creditCardService } from '../../services/creditCardService';

interface AddToApplePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCardItem;
  onCardUpdated: () => void;
}

type DeviceOption =
  | 'iPhone 15'
  | 'iPhone 15 Pro'
  | 'iPhone 16 Pro Max'
  | 'Apple Watch Ultra 2'
  | 'MacBook Pro M3 Max'
  | 'iPad Pro M4';

export const AddToApplePayModal: React.FC<AddToApplePayModalProps> = ({
  isOpen,
  onClose,
  card,
  onCardUpdated,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceOption>(
    (card.applePay.deviceType as DeviceOption) || 'iPhone 15'
  );
  const [provisioningStep, setProvisioningStep] = useState<number>(0);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [testPaySuccess, setTestPaySuccess] = useState<boolean>(false);
  const [isTestingFaceId, setIsTestingFaceId] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAlreadyProvisioned = card.applePay.isProvisioned;

  const handleStartProvisioning = async () => {
    setIsProvisioning(true);
    setProvisioningStep(1);

    await new Promise((r) => setTimeout(r, 600));
    setProvisioningStep(2);

    await new Promise((r) => setTimeout(r, 700));
    setProvisioningStep(3);

    await new Promise((r) => setTimeout(r, 600));
    setProvisioningStep(4);

    await creditCardService.enrollInApplePay(card.id, selectedDevice);
    setIsProvisioning(false);
    onCardUpdated();
  };

  const handleTestFaceIdPay = async () => {
    setIsTestingFaceId(true);
    setTestPaySuccess(false);

    // Simulate double-click side button & Face ID scan
    await new Promise((r) => setTimeout(r, 1000));
    setIsTestingFaceId(false);
    setTestPaySuccess(true);

    setTimeout(() => {
      setTestPaySuccess(false);
    }, 4000);
  };

  const handleRemoveFromApplePay = () => {
    creditCardService.removeFromApplePay(card.id);
    onCardUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
        {/* Apple Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            {/* Apple Glyphs */}
            <div className="w-8 h-8 rounded-lg bg-black border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  Apple Pay & Apple Wallet
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                  EMVCo Token
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Post-Quantum ML-DSA-87 Tokenization with Apple Secure Element
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

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[68vh]">
          {/* Authentic Apple Wallet Digital Pass Preview */}
          <div className="relative mx-auto max-w-sm rounded-2xl border border-zinc-700/80 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-5 shadow-2xl text-white">
            {/* Header row in Wallet pass */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wider uppercase text-zinc-200">
                  {card.brand}
                </span>
                <span className="text-[10px] text-zinc-400">·</span>
                <span className="text-[11px] text-zinc-400">{card.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-zinc-300" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                </svg>
                <span className="text-[10px] font-medium text-zinc-400">Wallet</span>
              </div>
            </div>

            {/* Visual Card art inside Apple Wallet */}
            <div className="my-4 py-4 px-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                  Device Account Number (DAN)
                </div>
                <div className="font-mono text-base font-bold text-white tracking-wider">
                  {isAlreadyProvisioned
                    ? card.applePay.deviceAccountNumber || '•••• 9021'
                    : `•••• ${card.cardNumber.slice(-4)}`}
                </div>
                <div className="text-[11px] text-zinc-400 font-medium">
                  {card.cardholderName}
                </div>
              </div>

              <div className="text-right space-y-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isAlreadyProvisioned
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {isAlreadyProvisioned ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Apple Wallet
                    </>
                  ) : (
                    'Not Provisioned'
                  )}
                </span>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {card.network}
                </div>
              </div>
            </div>

            {/* Apple Wallet Security Specifications */}
            <div className="text-[10px] text-zinc-400 font-mono space-y-1 pt-1 border-t border-zinc-800/60">
              <div className="flex justify-between">
                <span>Secure Element (SEID):</span>
                <span className="text-zinc-300">
                  {card.applePay.secureElementId || '04:A2:9B:7C:1F:EE:88:01'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NFC Contactless Field:</span>
                <span className="text-emerald-400 font-bold">13.56 MHz Active</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Protocol:</span>
                <span className="text-cyan-400 font-bold">FIPS 204 ML-DSA-87</span>
              </div>
            </div>
          </div>

          {/* Device Target Selection */}
          {!isAlreadyProvisioned && !isProvisioning && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Choose Apple Device for Hardware Provisioning:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'iPhone 15', icon: Smartphone, label: 'Dynamic Island · A16 SE', badge: 'Supported' },
                  { name: 'iPhone 15 Pro', icon: Smartphone, label: 'Titanium · A17 Pro SE', badge: 'Supported' },
                  { name: 'iPhone 16 Pro Max', icon: Smartphone, label: 'Flagship · A18 Pro SE' },
                  { name: 'Apple Watch Ultra 2', icon: Watch, label: 'Wrist NFC · S9 SiP' },
                  { name: 'MacBook Pro M3 Max', icon: Laptop, label: 'Safari Web Pay' },
                  { name: 'iPad Pro M4', icon: Tablet, label: 'Ultra Retina · M4 SE' },
                ].map((dev) => {
                  const Icon = dev.icon;
                  const isSelected = selectedDevice === dev.name;
                  return (
                    <button
                      key={dev.name}
                      type="button"
                      onClick={() => setSelectedDevice(dev.name as DeviceOption)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/30'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        {dev.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                            {dev.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{dev.name}</div>
                        <div className="text-[10px] text-zinc-400 leading-tight">{dev.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Provisioning Progress Stepper */}
          {isProvisioning && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Provisioning Pass to Apple Secure Element...</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {[
                  { step: 1, text: `Connecting to ${card.brand} Token Service Provider (TSP)` },
                  { step: 2, text: 'Generating NIST FIPS 204 ML-DSA-87 Lattice Keypair' },
                  { step: 3, text: `Binding Device Account Number into ${selectedDevice} SE` },
                  { step: 4, text: 'Card verified and activated in Apple Wallet!' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`flex items-center gap-2 ${
                      provisioningStep >= s.step
                        ? 'text-emerald-400 font-semibold'
                        : 'text-zinc-600'
                    }`}
                  >
                    {provisioningStep >= s.step ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If already in Apple Wallet: Test Tap to Pay & Face ID Simulator */}
          {isAlreadyProvisioned && (
            <div className="space-y-3">
              {/* Dynamic Island HUD Simulation */}
              <div className="p-3.5 rounded-2xl border border-zinc-700/80 bg-black shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 px-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center gap-2 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500/80 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-300 tracking-wide">
                      {isTestingFaceId
                        ? 'Face ID Scanning...'
                        : testPaySuccess
                        ? 'Apple Pay Verified'
                        : `${card.applePay.deviceType || 'iPhone 15'} · Dynamic Island`}
                    </span>
                  </div>
                </div>

                {isTestingFaceId && (
                  <div className="flex items-center gap-2 py-1 text-xs text-emerald-400 font-mono animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Double-click side button confirmed. Reading Secure Enclave...</span>
                  </div>
                )}

                {testPaySuccess && (
                  <div className="flex items-center gap-2 py-1 text-xs text-emerald-300 font-semibold animate-in zoom-in-95 duration-150">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span>Done · Dynamic FIPS 204 Cryptogram Authorized</span>
                  </div>
                )}

                {!isTestingFaceId && !testPaySuccess && (
                  <div className="text-[11px] text-zinc-400">
                    Hold near contactless POS terminal or double-click side button to pay
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-200">
                      Card is Active & Ready in Apple Wallet
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                      {card.applePay.deviceType || 'iPhone 15'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300">
                  Provisioned on Apple Secure Element with Post-Quantum Lattice Cryptography. Your physical card number is never stored on device or shared with merchants.
                </p>

                {/* Device transfer quick options */}
                <div className="flex items-center justify-between pt-1 border-t border-emerald-900/40 text-[11px]">
                  <span className="text-zinc-400">Target Device:</span>
                  <div className="flex items-center gap-1.5">
                    {(['iPhone 15', 'iPhone 15 Pro', 'iPhone 16 Pro Max', 'Apple Watch Ultra 2'] as DeviceOption[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={async () => {
                          await creditCardService.enrollInApplePay(card.id, d);
                          onCardUpdated();
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          card.applePay.deviceType === d
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {d === 'iPhone 15' ? 'iPhone 15' : d === 'iPhone 15 Pro' ? '15 Pro' : d === 'iPhone 16 Pro Max' ? '16 Pro' : 'Watch'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Face ID / Double Click Simulator */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestFaceIdPay}
                    disabled={isTestingFaceId}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isTestingFaceId ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span>Verifying Face ID (iPhone 15 Secure Enclave)...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Test Face ID & Double-Click Tap to Pay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveFromApplePay}
                    className="py-2.5 px-3 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Remove Pass
                  </button>
                </div>
              </div>

              {/* Simulation Feedback Alert */}
              {testPaySuccess && (
                <div className="p-3.5 rounded-xl border border-emerald-600 bg-emerald-950/90 text-white flex items-center gap-3 animate-in zoom-in-95 duration-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Apple Pay Approved on {card.applePay.deviceType || 'iPhone 15'}</div>
                    <div className="text-emerald-200 text-[11px] font-mono">
                      Dynamic cryptogram verified via ML-DSA-87. Terminal accepted without disclosing physical card details.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Post-Quantum Guarantee Note */}
          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-200 font-semibold">Apple Pay Privacy & PQC Architecture:</span>{' '}
              Apple doesn't keep transaction information that can be tied back to you. Payments are authenticated
              using a unique Device Account Number and a quantum-resistant dynamic transaction cryptogram.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400">
            {isAlreadyProvisioned ? 'Pass Synced with iCloud Keychain' : 'Ready to Provision'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            {!isAlreadyProvisioned && (
              <button
                onClick={handleStartProvisioning}
                disabled={isProvisioning}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {/* Apple logo in button */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.94-14.3-5.77-8.7-10.27-18.78-13.5-30.25-3.23-11.47-4.85-22.37-4.85-32.7 0-14.78 3.75-26.68 11.25-35.71 7.5-9.03 17.06-13.62 28.69-13.78 4.8 0 10.15 1.25 16.05 3.74 5.9 2.5 9.77 3.8 11.6 3.91 2.39-.22 6.44-1.6 12.16-4.13 5.72-2.54 10.81-3.69 15.26-3.47 11.75.86 21.05 5.09 27.91 12.69-10.45 6.32-15.56 15.11-15.34 26.38.22 8.7 3.49 16.03 9.8 22 6.32 5.97 13.82 9.29 22.5 9.97-2.39 7.18-5.33 14.7-8.81 22.56zM119.22 31.81c0-7.18 2.61-13.91 7.83-20.2 5.22-6.28 11.64-10.3 19.26-12.06.44 1.74.66 3.48.66 5.22 0 7.39-2.67 14.35-8.01 20.87-5.34 6.52-11.91 10.43-19.74 11.74-.22-1.96-.33-3.83-.33-5.57z" />
                </svg>
                <span>Add to Apple Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
