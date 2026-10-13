import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Wifi,
  Battery,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Landmark,
  Layers,
  ShieldAlert,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sliders,
  RotateCw,
  Cpu,
  Radar,
  Flame,
  Target,
  Terminal,
} from 'lucide-react';

interface IPhone15SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeView:
    | 'pipeline'
    | 'aikido'
    | 'enterprise'
    | 'banking'
    | 'creditcards'
    | 'ot-zerotrust'
    | 'defense'
    | 'war'
    | 'security-assessment'
    | 'threat-model'
    | 'whiterabbitneo'
    | 'nsa-software'
    | 'gchq-software'
    | 'incd-software'
    | 'f22-raptor'
    | 'f35'
    | 'b21'
    | 'kali-linux';
  onSelectView: (
    view:
      | 'pipeline'
      | 'aikido'
      | 'enterprise'
      | 'banking'
      | 'creditcards'
      | 'ot-zerotrust'
      | 'defense'
      | 'war'
      | 'security-assessment'
      | 'threat-model'
      | 'whiterabbitneo'
      | 'nsa-software'
      | 'gchq-software'
      | 'incd-software'
      | 'f22-raptor'
      | 'f35'
      | 'b21'
      | 'kali-linux'
  ) => void;
}

export const IPhone15SimulatorModal: React.FC<IPhone15SimulatorModalProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
}) => {
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState<boolean>(false);
  const [faceIdSimulating, setFaceIdSimulating] = useState<boolean>(false);
  const [faceIdSuccess, setFaceIdSuccess] = useState<boolean>(false);
  const [colorFinish, setColorFinish] = useState<'Black' | 'Blue' | 'Green' | 'Yellow' | 'Pink'>('Black');
  const [currentTime] = useState<string>('9:41');

  if (!isOpen) return null;

  const handleSimulateFaceId = async () => {
    setFaceIdSimulating(true);
    setDynamicIslandExpanded(true);
    setFaceIdSuccess(false);

    await new Promise((r) => setTimeout(r, 900));
    setFaceIdSimulating(false);
    setFaceIdSuccess(true);

    setTimeout(() => {
      setFaceIdSuccess(false);
      setDynamicIslandExpanded(false);
    }, 3000);
  };

  const getChassisBorder = () => {
    switch (colorFinish) {
      case 'Blue':
        return 'border-sky-800/80 ring-sky-900/40';
      case 'Green':
        return 'border-emerald-800/80 ring-emerald-900/40';
      case 'Yellow':
        return 'border-amber-700/80 ring-amber-900/40';
      case 'Pink':
        return 'border-rose-800/80 ring-rose-900/40';
      default:
        return 'border-zinc-700 ring-zinc-800/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col items-center max-w-4xl w-full my-auto text-zinc-100">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 px-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs tracking-wide">iPhone 15 Simulator</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              6.1″ Super Retina XDR · Dynamic Island · A16 Bionic Secure Enclave
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Color Finish Picker */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-500 px-1 font-mono">Finish:</span>
              {(['Black', 'Blue', 'Green', 'Yellow', 'Pink'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorFinish(c)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    colorFinish === c
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iPhone 15 Hardware Enclosure Frame */}
        <div className="relative flex items-center justify-center">
          {/* Side Buttons (Silent switch, volume, power) */}
          <div className="absolute -left-2 top-28 w-1 h-9 rounded-l bg-zinc-700/80" />
          <div className="absolute -left-2 top-42 w-1 h-12 rounded-l bg-zinc-700/80" />
          <div className="absolute -left-2 top-58 w-1 h-12 rounded-l bg-zinc-700/80" />
          <div className="absolute -right-2 top-36 w-1 h-16 rounded-r bg-zinc-700/80 cursor-pointer" onClick={handleSimulateFaceId} title="Double-click to trigger Apple Pay" />

          {/* Main Chassis */}
          <div
            className={`relative w-[380px] sm:w-[393px] h-[780px] sm:h-[820px] rounded-[52px] p-3.5 bg-zinc-950 border-[6px] shadow-2xl ring-4 ${getChassisBorder()} flex flex-col overflow-hidden select-none`}
          >
            {/* Screen Bezel & Container */}
            <div className="relative w-full h-full rounded-[44px] bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col text-white">
              {/* iPhone 15 Status Bar & Dynamic Island */}
              <div className="relative z-20 w-full pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-zinc-300">
                {/* Clock */}
                <span className="font-mono text-[13px] tracking-tight">{currentTime}</span>

                {/* Dynamic Island Capsule */}
                <div
                  onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                  className={`transition-all duration-300 ease-out bg-black rounded-full border border-zinc-800/80 flex items-center justify-center cursor-pointer shadow-lg hover:border-zinc-700 ${
                    dynamicIslandExpanded
                      ? 'w-56 h-12 px-3 gap-2'
                      : 'w-28 h-7 px-2 gap-2'
                  }`}
                  title="iPhone 15 Dynamic Island - Click to expand or test"
                >
                  {dynamicIslandExpanded ? (
                    <div className="flex items-center justify-between w-full text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
                          {faceIdSuccess ? '✓' : <CreditCard className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="leading-tight">
                          <div className="font-bold text-white text-[11px]">
                            {faceIdSuccess ? 'Apple Pay Approved' : 'Apple Wallet Pass'}
                          </div>
                          <div className="text-[9px] text-zinc-400 font-mono">
                            {faceIdSuccess ? 'ML-DSA-87 Verified' : 'Double Click to Pay'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        NFC
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Left sensor aperture */}
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-600/70" />
                      </div>
                      {/* Right camera aperture */}
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-800" />
                    </>
                  )}
                </div>

                {/* Signal, WiFi, Battery */}
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="text-[10px] font-mono">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* View Header inside iPhone */}
              <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    Q
                  </div>
                  <span className="font-bold text-xs tracking-tight text-white">LatticeOps PQC</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                    iOS 18
                  </span>
                </div>
              </div>

              {/* Scrollable Viewport Content inside iPhone 15 */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-zinc-950 scrollbar-none">
                {/* iPhone 15 Optimized Quick Action Banner */}
                <div className="p-3 rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-900/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                      iPhone 15 Secure Enclave Active
                    </div>
                    <div className="text-xs font-bold text-white">
                      Apple Pay & PQC Vault Ready
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateFaceId}
                    disabled={faceIdSimulating}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-md"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{faceIdSimulating ? 'Scanning...' : 'Test Pay'}</span>
                  </button>
                </div>

                {/* View Switcher Chips for Mobile */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onSelectView('creditcards')}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      activeView === 'creditcards'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Cards & Wallet</div>
                    <div className="text-[9px] text-zinc-400 font-mono">Apple Pay Active</div>
                  </button>

                  <button
                    onClick={() => onSelectView('banking')}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      activeView === 'banking'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Banking</div>
                    <div className="text-[9px] text-zinc-400 font-mono">18 Institutions</div>
                  </button>

                  <button
                    onClick={() => onSelectView('pipeline')}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      activeView === 'pipeline'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold">PQC Migration</div>
                    <div className="text-[9px] text-zinc-400 font-mono">ML-KEM / ML-DSA</div>
                  </button>
                </div>

                {/* Active View Quick Summary for iPhone 15 */}
                {activeView === 'creditcards' && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">American Express Centurion</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        In Wallet
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>DPAN: •••• 9021</span>
                      <span className="text-emerald-400 font-bold">A16 Secure Element</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Tap-to-Pay authorized for contactless transit, point-of-sale, and web checkout without disclosing primary account number.
                    </p>
                  </div>
                )}

                {activeView === 'banking' && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Treasury & Bank Feed</span>
                      <span className="text-[10px] font-mono text-emerald-400">$128.45M USD</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                        <span className="text-zinc-300">J.P. Morgan Chase</span>
                        <span className="text-emerald-400 font-mono font-bold">$42,500,000</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex justify-between">
                        <span className="text-zinc-300">Goldman Sachs</span>
                        <span className="text-emerald-400 font-mono font-bold">$28,150,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeView === 'pipeline' && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">FIPS 204 Lattice Pipeline</span>
                      <span className="text-[10px] font-mono text-emerald-400">100% Post-Quantum</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Transform RSA-2048 and ECDSA keypairs into NIST FIPS 203 ML-KEM-768 and ML-DSA-87 signatures with zero runtime regressions.
                    </p>
                  </div>
                )}

                {activeView === 'ot-zerotrust' && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">NSA OT Zero Trust (CSI)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Oct 8, 2026
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>Modbus PEP: Active</span>
                      <span className="text-emerald-400 font-bold">FIPS 204 Signed</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Hardware data diodes, anti-replay nonces, and unauthenticated PLC command suppression active per NSA/CISA guidance.
                    </p>
                  </div>
                )}

                {activeView === 'defense' && (
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Defense Primes C4ISR</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        JADC2
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>Palantir AIP / Aegis</span>
                      <span className="text-cyan-400 font-bold">FIPS 204 ML-DSA</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Integrated missile defense, Palantir ontology guardrails, and General Dynamics TACLANE wire-speed quantum tunnels.
                    </p>
                  </div>
                )}

                {activeView === 'war' && (
                  <div className="p-3.5 rounded-xl border border-rose-800/80 bg-rose-950/20 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                        <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>Offensive Warfare & Strike Wing</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        DEFCON 2
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>Hypersonic ARRW / PrSM</span>
                      <span className="text-rose-400 font-bold">Mach 5+ PQC Link</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Deep-penetration kinetic glide vehicles, cyber offensive payloads, and quantum-resistant command uplinks.
                    </p>
                  </div>
                )}

                {/* Active View Preview Card for Security Assessment */}
                {activeView === 'security-assessment' && (
                  <div className="p-3.5 rounded-xl border border-purple-500/40 bg-purple-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span>Security Assessment & ATT&CK</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        PTES · NIST
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>MITRE D3FEND Matrix</span>
                      <span className="text-purple-400 font-bold">14 Tactics Covered</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Standardized penetration testing methodologies, Sigma/YARA detection rules, and defensive post-quantum cryptographic remediation playbooks.
                    </p>
                  </div>
                )}

                {/* Active View Preview Card for Automated Threat Modeling */}
                {activeView === 'threat-model' && (
                  <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                        <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span>Quantum Threat Model (Gemini AI)</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        HNDL · Shor
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>Adversary Kill Chains</span>
                      <span className="text-rose-400 font-bold">FIPS 203 Remediation</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Automated analysis of uploaded source code for quantum vulnerabilities, Shor/Grover factorization vectors, and Harvest Now Decrypt Later windows.
                    </p>
                  </div>
                )}

                {/* Active View Preview Card for WhiteRabbitNeo */}
                {activeView === 'whiterabbitneo' && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>WhiteRabbitNeo Cybersecurity LLM</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        33B DeepSeek
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] flex justify-between items-center text-zinc-300">
                      <span>Dual Consensus Engine</span>
                      <span className="text-emerald-400 font-bold">Auto-Patches Ready</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Specialized cybersecurity model for code vulnerability discovery, CWE mapping, and FIPS 203/204 automated code repair.
                    </p>
                  </div>
                )}

                {/* iPhone 15 Technical Specs */}
                <div className="p-3 rounded-xl border border-zinc-800/80 bg-black/60 space-y-1 text-[10px] font-mono text-zinc-400">
                  <div className="text-zinc-300 font-semibold uppercase tracking-wider pb-1 border-b border-zinc-800">
                    iPhone 15 Hardware Architecture
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>SoC Engine:</span>
                    <span className="text-zinc-200">Apple A16 Bionic (4nm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secure Enclave:</span>
                    <span className="text-emerald-400 font-bold">Gen 6 SE w/ PQC Acceleration</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NFC Field:</span>
                    <span className="text-cyan-400">ISO/IEC 18092 (13.56 MHz)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Display:</span>
                    <span className="text-zinc-200">6.1″ Super Retina XDR OLED</span>
                  </div>
                </div>
              </div>

              {/* iPhone 15 Bottom Tab Bar Navigation */}
              <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-950/95 flex items-center justify-around shrink-0">
                <button
                  onClick={() => onSelectView('pipeline')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'pipeline' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[9px]">PQC</span>
                </button>
                <button
                  onClick={() => onSelectView('aikido')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'aikido' ? 'text-indigo-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[9px]">Aikido</span>
                </button>
                <button
                  onClick={() => onSelectView('enterprise')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'enterprise' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-[9px]">Enterprise</span>
                </button>
                <button
                  onClick={() => onSelectView('banking')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'banking' ? 'text-amber-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span className="text-[9px]">Banking</span>
                </button>
                <button
                  onClick={() => onSelectView('creditcards')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'creditcards' ? 'text-amber-300 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[9px]">Cards</span>
                </button>
                <button
                  onClick={() => onSelectView('ot-zerotrust')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'ot-zerotrust' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span className="text-[9px]">OT ZT</span>
                </button>
                <button
                  onClick={() => onSelectView('defense')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'defense' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Radar className="w-4 h-4" />
                  <span className="text-[9px]">Defense</span>
                </button>
                <button
                  onClick={() => onSelectView('war')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'war' ? 'text-rose-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-[9px]">War</span>
                </button>
                <button
                  onClick={() => onSelectView('security-assessment')}
                  className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                    activeView === 'security-assessment' ? 'text-purple-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span className="text-[9px]">Sec</span>
                </button>
              </div>

              {/* iPhone Home Indicator bar */}
              <div className="w-full pb-2 pt-1 flex items-center justify-center bg-zinc-950 shrink-0">
                <div className="w-32 h-1 rounded-full bg-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & close button */}
        <div className="pt-3 text-center">
          <p className="text-[11px] text-zinc-400">
            iPhone 15 viewport and Apple Pay cryptographic pass simulation. Touch or double-click to authorize.
          </p>
        </div>
      </div>
    </div>
  );
};
