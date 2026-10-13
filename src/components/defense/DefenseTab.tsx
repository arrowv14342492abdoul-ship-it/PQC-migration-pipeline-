import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Radio,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Server,
  Crosshair,
  ExternalLink,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Eye,
  Radar,
  Flame,
  Globe2,
  Sliders,
  Send,
  Boxes,
  Rocket,
  Play,
  RotateCcw,
  Target,
  FastForward,
} from 'lucide-react';
import {
  DEFENSE_PRIMES,
  DEFENSE_SOFTWARE_PRODUCTS,
  MOCK_SENSOR_TRACKS,
  MOCK_AIP_LOGS,
  DEFENSE_MISSION_SUITES,
} from '../../data/defenseData';
import {
  DefensePrimeId,
  DefenseDomain,
  DefenseSoftwareProduct,
  SensorToShooterTrack,
  PalantirAIPPromptLog,
  ClassificationLevel,
  DefenseMissionSuite,
} from '../../types/defense';

interface DefenseTabProps {
  onLoadDefensePresetToPipeline?: () => void;
}

export const DefenseTab: React.FC<DefenseTabProps> = ({
  onLoadDefensePresetToPipeline,
}) => {
  const [selectedContractor, setSelectedContractor] = useState<DefensePrimeId | 'ALL'>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<DefenseDomain | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<
    'launcher' | 'matrix' | 'sensor-to-shooter' | 'palantir-aip' | 'crypto-gateway'
  >('launcher');

  // Mission Suite Launcher State
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>(
    DEFENSE_MISSION_SUITES[0].id
  );
  const [launchState, setLaunchState] = useState<
    'STANDBY' | 'LAUNCH_IN_PROGRESS' | 'ACTIVE_OPERATIONAL' | 'ABORTED'
  >('STANDBY');
  const [currentLaunchStage, setCurrentLaunchStage] = useState<number>(1);
  const [isLaunchingSuite, setIsLaunchingSuite] = useState<boolean>(false);
  const [pqcEnforceOverride, setPqcEnforceOverride] = useState<boolean>(true);
  const [suiteLogs, setSuiteLogs] = useState<string[]>([
    '[SUITE-INIT] Mission Suite Tactical Launcher ready.',
    '[PQC-READY] CNSA 2.0 Level 5 Hardware Crypto security root initialized.',
    '[NET-STATUS] Joint IFCN & MADL tactical datalinks standing by.',
  ]);

  // Selected mission suite
  const selectedSuite =
    DEFENSE_MISSION_SUITES.find((s) => s.id === selectedSuiteId) ||
    DEFENSE_MISSION_SUITES[0];

  // Initiate Mission Suite Launch
  const handleInitiateLaunchSuite = async () => {
    setIsLaunchingSuite(true);
    setLaunchState('LAUNCH_IN_PROGRESS');
    setCurrentLaunchStage(1);

    const stages = selectedSuite.stages;
    const initialLog = `[LAUNCH-SEQUENCE] Initiating operational launch for ${selectedSuite.name} (${selectedSuite.codeName})...`;
    setSuiteLogs((prev) => [initialLog, ...prev]);

    for (let i = 0; i < stages.length; i++) {
      await new Promise((r) => setTimeout(r, 750));
      const stage = stages[i];
      setCurrentLaunchStage(i + 1);
      const stageLog = `[STAGE ${stage.stage}: ${stage.name}] ${stage.description} -> Telemetry: ${stage.telemetryMetric}`;
      setSuiteLogs((prev) => [stageLog, ...prev]);
    }

    await new Promise((r) => setTimeout(r, 500));
    setLaunchState('ACTIVE_OPERATIONAL');
    setSuiteLogs((prev) => [
      `[MISSION-ACTIVE] Mission Suite ${selectedSuite.codeName} is fully OPERATIONAL in ${selectedSuite.theater}. Sub-second C2 loop locked.`,
      ...prev,
    ]);
    setIsLaunchingSuite(false);
  };

  // Step Launch Stage Manually
  const handleStepLaunchStage = () => {
    if (currentLaunchStage < selectedSuite.stages.length) {
      const nextStage = currentLaunchStage + 1;
      setCurrentLaunchStage(nextStage);
      const stage = selectedSuite.stages[nextStage - 1];
      setSuiteLogs((prev) => [
        `[MANUAL-STEP: STAGE ${stage.stage}] ${stage.name} -> ${stage.telemetryMetric}`,
        ...prev,
      ]);
      if (nextStage === selectedSuite.stages.length) {
        setLaunchState('ACTIVE_OPERATIONAL');
      }
    }
  };

  // Abort Mission Suite & Zeroize
  const handleAbortSuite = () => {
    setIsLaunchingSuite(false);
    setLaunchState('ABORTED');
    setCurrentLaunchStage(0);
    setSuiteLogs((prev) => [
      `[EMERGENCY-ABORT] Mission Suite ${selectedSuite.codeName} aborted by operator authority.`,
      `[ZEROIZE] Hardware Security Module session keys wiped (CNSA 2.0 Zeroize Trigger).`,
      '[STANDBY] Launcher returned to safe quiescent state.',
      ...prev,
    ]);
  };

  // Selected product for API inspection modal / side panel
  const [inspectedProduct, setInspectedProduct] = useState<DefenseSoftwareProduct | null>(null);

  // Sensor to shooter interactive state
  const [tracks, setTracks] = useState<SensorToShooterTrack[]>([...MOCK_SENSOR_TRACKS]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(MOCK_SENSOR_TRACKS[0].id);
  const [engagementMode, setEngagementMode] = useState<'PQC_HARDENED' | 'LEGACY_CLASSICAL'>('PQC_HARDENED');
  const [isEngaging, setIsEngaging] = useState(false);
  const [engagementLogs, setEngagementLogs] = useState<string[]>([
    '[JADC2-INIT] Connected to Joint Fire Control Network (IFCN). Sensor fusion nodes online.',
    '[IBCS-NODE] Ingesting AN/SPY-6(V)1 and SDA Tranche 2 tracking constellation telemetry.',
    '[CRYPTO-STATUS] CNSA 2.0 PQC Policy Enforcement Point active. FIPS 204 ML-DSA-87 ready.',
  ]);

  // Palantir AIP interactive state
  const [aipLogs, setAipLogs] = useState<PalantirAIPPromptLog[]>([...MOCK_AIP_LOGS]);
  const [aipPromptInput, setAipPromptInput] = useState('');
  const [isAipProcessing, setIsAipProcessing] = useState(false);

  // TACLANE Crypto Gateway state
  const [taclaneMode, setTaclaneMode] = useState<'CNSA_2_0_PQC' | 'LEGACY_SUITE_B'>('CNSA_2_0_PQC');
  const [tunnelEncryptedPackets, setTunnelEncryptedPackets] = useState(2847920);

  // Filtered software products
  const filteredProducts = DEFENSE_SOFTWARE_PRODUCTS.filter((product) => {
    const matchesContractor =
      selectedContractor === 'ALL' || product.contractorId === selectedContractor;
    const matchesDomain =
      selectedDomain === 'ALL' || product.category === selectedDomain;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.interoperabilityStandards.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesContractor && matchesDomain && matchesSearch;
  });

  const selectedTrack =
    tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  // Execute Sensor-to-Shooter Engagement
  const handleExecuteEngagement = async () => {
    setIsEngaging(true);
    const newLogs: string[] = [
      `[INITIATE] Engaging track ${selectedTrack.id} (${selectedTrack.designation})`,
      `[SENSORS] Multi-static radar lock confirmed via ${selectedTrack.detectingSensor}`,
      `[FUSION] Track composite validated by ${selectedTrack.fusionSystem}`,
      `[WEAPON-ASSIGNMENT] Assigned shooter: ${selectedTrack.recommendedShooter}`,
    ];

    if (engagementMode === 'PQC_HARDENED') {
      newLogs.push(
        '[PQC-SIGN] Generating NIST FIPS 204 ML-DSA-87 digital signature for fire authorization...',
        '[PQC-VERIFY] Hardware Root of Trust verified signature in 0.6ms (Lattice Level 5 Key ID: DOD-CNSA2-SEC-99)',
        '[ANTI-REPLAY] Monotonic counter validated. Nonce synchronized with weapon bus',
        '[UPLINK] Transmitting quantum-resistant encrypted guidance package over Link-16 JREAP-C',
        `[INTERCEPT] Direct kinetic impact confirmed. Threat neutralized at ${Math.round(selectedTrack.altitudeMeters / 1000)}km altitude.`
      );
    } else {
      newLogs.push(
        '[WARNING] Legacy RSA-2048 signature generated over tactical link (Vulnerable to Shor / Harvest-Now)',
        '[DISPATCH] Command released with legacy classical authentication',
        `[INTERCEPT] Interceptor launched. Telemetry flagged for retroactive crypto compromise vulnerability.`
      );
    }

    await new Promise((r) => setTimeout(r, 800));

    setEngagementLogs((prev) => [...newLogs, ...prev.slice(0, 15)]);
    setTracks((prev) =>
      prev.map((t) =>
        t.id === selectedTrack.id ? { ...t, status: 'INTERCEPTED' } : t
      )
    );
    setIsEngaging(false);
  };

  // Submit Palantir AIP Query
  const handleRunAipQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aipPromptInput.trim()) return;

    setIsAipProcessing(true);
    const userPrompt = aipPromptInput;
    setAipPromptInput('');

    await new Promise((r) => setTimeout(r, 900));

    const newLog: PalantirAIPPromptLog = {
      id: `AIP-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      prompt: userPrompt,
      operatorClearance: 'TOP SECRET // SCI',
      ontologyEntities: [
        'Integrated Battle Command System (IBCS)',
        'Carrier Strike Group 5 (USS Ronald Reagan)',
        'Joint Space Operations Center (CSpOC)',
        'PQC Key Distribution Relay #14',
      ],
      guardrailChecks: {
        lawOfArmedConflict: 'PASSED',
        rulesOfEngagement: 'AUTHORIZED',
        pqcAttestation: 'FIPS_204_VERIFIED',
      },
      recommendedAction:
        'Palantir AIP Ontological Consensus: Authorized decentralized tactical swarm defense response. Transmit FIPS 204 signed mission package to assigned autonomous edge assets with zero operator override delay.',
      auditHash: `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
    };

    setAipLogs((prev) => [newLog, ...prev]);
    setIsAipProcessing(false);
  };

  // Export Defense Dossier
  const handleExportDossier = () => {
    const data = {
      title: 'Defense Prime Software Integration & PQC Interoperability Dossier',
      timestamp: new Date().toISOString(),
      standards: ['NIST FIPS 203', 'NIST FIPS 204', 'DoD CNSA 2.0', 'DFARS 252.204-7012', 'NIST SP 800-161'],
      primes: DEFENSE_PRIMES,
      softwareCatalog: DEFENSE_SOFTWARE_PRODUCTS,
      sensorTracks: tracks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defense-primes-interoperability-dossier-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Defense Prime Command & C4ISR Architecture */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 sm:p-7 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/90">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 font-bold shrink-0 shadow-inner">
                <Radar className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
                    JOINT ALL-DOMAIN C4ISR & JADC2
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    CNSA 2.0 PQC Mandate
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 flex items-center gap-2">
                  <span>Defense Prime Software Ecosystem</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-zinc-800 text-zinc-300">
                    8 Prime Contractors · 12 Major Software Suites
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onLoadDefensePresetToPipeline && (
                <button
                  type="button"
                  onClick={onLoadDefensePresetToPipeline}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Load Defense Tactical PQC Preset</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportDossier}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Defense Dossier</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">
            Complete, authoritative architectural integration for the flagship software platforms of{' '}
            <strong className="text-cyan-300">Palantir Technologies</strong> (AIP, Gotham, Apollo, Foundry),{' '}
            <strong className="text-blue-300">Lockheed Martin</strong> (Aegis Combat System Baseline 10, DiamondShield, HiveStar),{' '}
            <strong className="text-emerald-300">Northrop Grumman</strong> (IBCS, FAAD C2, B-21 Raider Digital Thread),{' '}
            <strong className="text-amber-300">RTX Raytheon & Collins</strong> (SM-6 Guidance, KuRFS, Athena),{' '}
            <strong className="text-violet-300">Anduril</strong> (Lattice OS),{' '}
            <strong className="text-indigo-300">General Dynamics</strong> (TACLANE Type 1),{' '}
            <strong className="text-rose-300">L3Harris</strong> (Falcon IV SDR), and{' '}
            <strong className="text-teal-300">BAE Systems</strong> (SOCET GXP).
            Enforcing NIST FIPS 203/204 post-quantum cryptographic transitions across all tactical links and classified enclaves.
          </p>

          {/* Quick Telemetry & Program Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Integrated Software Platforms</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">12 Mission Suites</div>
              <div className="text-[10px] text-zinc-400">8 Global Defense Primes</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">PQC Modernization Standard</div>
              <div className="text-sm font-bold text-emerald-300 mt-1 font-mono">DoD CNSA 2.0</div>
              <div className="text-[10px] text-zinc-400">FIPS 203 ML-KEM · FIPS 204 ML-DSA</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Tactical Zero Trust Rate</div>
              <div className="text-sm font-bold text-amber-300 mt-1 font-mono">5.2M / sec</div>
              <div className="text-[10px] text-zinc-400">Continuous Link Attestation</div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70">
              <div className="text-[10px] text-zinc-400 font-mono uppercase">Multi-Domain Sensor Tracks</div>
              <div className="text-sm font-bold text-rose-400 mt-1 font-mono">4 Active Threats</div>
              <div className="text-[10px] text-zinc-400">Hypersonic · Swarm · Cruise</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('launcher')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'launcher'
              ? 'bg-blue-950 border border-blue-600 text-blue-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Rocket className="w-4 h-4 text-blue-400" />
          <span>Mission Suites Launcher ({DEFENSE_MISSION_SUITES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'matrix'
              ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Prime Software Catalog & Interoperability ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sensor-to-shooter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'sensor-to-shooter'
              ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Crosshair className="w-4 h-4 text-rose-400" />
          <span>IBCS & Aegis Sensor-to-Shooter Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('palantir-aip')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'palantir-aip'
              ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Palantir AIP & Gotham Mission Console</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('crypto-gateway')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'crypto-gateway'
              ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>TACLANE Type 1 & Tactical SDR Gateway</span>
        </button>
      </div>

      {/* SUB-TAB 0: MISSION SUITES LAUNCHER */}
      {activeSubTab === 'launcher' && (
        <div className="space-y-6">
          {/* Top Mission Launcher Console Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400 animate-pulse" />
                <span>Operational Mission Suites Tactical Execution Deck</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Launch, stage, and simulate multi-domain battle command suites with NIST FIPS 204/203 quantum-resistant security envelopes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded font-bold ${
                  launchState === 'ACTIVE_OPERATIONAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : launchState === 'LAUNCH_IN_PROGRESS'
                    ? 'bg-blue-950 text-blue-300 border border-blue-700 animate-pulse'
                    : launchState === 'ABORTED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                STATUS: {launchState.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1 & 2: Suite Selection & Active Stage Progression */}
            <div className="lg:col-span-2 space-y-5">
              {/* Suite Selection Cards */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase">
                  Select Mission Suite to Launch:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEFENSE_MISSION_SUITES.map((suite) => (
                    <button
                      key={suite.id}
                      type="button"
                      onClick={() => {
                        setSelectedSuiteId(suite.id);
                        setLaunchState('STANDBY');
                        setCurrentLaunchStage(1);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                        selectedSuite.id === suite.id
                          ? 'border-blue-600 bg-blue-950/30 ring-1 ring-blue-500 shadow-md'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">
                          {suite.codeName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-cyan-300 border border-zinc-800">
                          {suite.classification}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200 line-clamp-1">
                        {suite.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">
                        {suite.theater}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/80">
                        <span className="text-blue-400 font-bold">{suite.contractorName}</span>
                        <span className="text-emerald-400">{suite.readinessLevel}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Selected Suite Details Card */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {selectedSuite.codeName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-zinc-400 border border-zinc-800">
                        {selectedSuite.theater}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">{selectedSuite.name}</h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold">
                    {selectedSuite.operationalRole}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-white">Mission Objective: </strong>
                  {selectedSuite.objective}
                </p>

                {/* Integrated Software Platforms */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Integrated Prime Software Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSuite.integratedSoftware.map((sw, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2 py-1 rounded bg-black/60 text-zinc-200 border border-zinc-800"
                      >
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quantum Cryptographic Configuration */}
                <div className="p-3 rounded-xl border border-emerald-950/80 bg-emerald-950/20 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Cryptographic Security Policy:</span>
                    <span>{selectedSuite.quantumCryptoConfig.cryptoLevel}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                    <div>Key Encapsulation: <strong className="text-emerald-400">{selectedSuite.quantumCryptoConfig.keyExchange}</strong></div>
                    <div>Digital Signature: <strong className="text-cyan-400">{selectedSuite.quantumCryptoConfig.signatureAuth}</strong></div>
                  </div>
                </div>

                {/* 4-Stage Operational Pipeline Visualizer */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center justify-between">
                    <span>Operational Launch Progression Checklist:</span>
                    <span className="text-zinc-400 text-[11px]">Stage {currentLaunchStage} of {selectedSuite.stages.length}</span>
                  </span>

                  <div className="space-y-2.5">
                    {selectedSuite.stages.map((stage) => {
                      const isComplete = currentLaunchStage > stage.stage || launchState === 'ACTIVE_OPERATIONAL';
                      const isCurrent = currentLaunchStage === stage.stage && launchState !== 'ACTIVE_OPERATIONAL';
                      return (
                        <div
                          key={stage.stage}
                          className={`p-3 rounded-xl border transition-all ${
                            isComplete
                              ? 'border-emerald-800 bg-emerald-950/30'
                              : isCurrent
                              ? 'border-blue-600 bg-blue-950/40 ring-1 ring-blue-500'
                              : 'border-zinc-800 bg-zinc-900/40 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold font-mono ${
                                  isComplete
                                    ? 'bg-emerald-500 text-black'
                                    : isCurrent
                                    ? 'bg-blue-500 text-white animate-pulse'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {isComplete ? '✓' : stage.stage}
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                {stage.name}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                isComplete
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : isCurrent
                                  ? 'bg-blue-950 text-blue-300 border border-blue-700 animate-pulse'
                                  : 'bg-zinc-900 text-zinc-500'
                              }`}
                            >
                              {isComplete ? 'VERIFIED' : isCurrent ? 'EXECUTING' : 'PENDING'}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-300 mt-1 pl-7">{stage.description}</p>
                          <div className="pl-7 mt-1 text-[10px] font-mono text-cyan-300">
                            Telemetry: {stage.telemetryMetric}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Command Bar: Launch, Step, Abort */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleInitiateLaunchSuite}
                    disabled={isLaunchingSuite || launchState === 'ACTIVE_OPERATIONAL'}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                      launchState === 'ACTIVE_OPERATIONAL'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                        : isLaunchingSuite
                        ? 'bg-blue-950 text-blue-300 border border-blue-700 animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-blue-500'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {launchState === 'ACTIVE_OPERATIONAL'
                        ? 'Suite Active'
                        : isLaunchingSuite
                        ? 'Launching Suite...'
                        : 'Launch Mission Suite'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStepLaunchStage}
                    disabled={launchState === 'ACTIVE_OPERATIONAL' || isLaunchingSuite}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FastForward className="w-4 h-4 text-cyan-400" />
                    <span>Step Next Stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAbortSuite}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-xs font-mono text-rose-300 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Abort & Zeroize</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Live Telemetry Gauges & Terminal */}
            <div className="space-y-4">
              {/* Telemetry Dials */}
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3">
                <span className="text-xs font-mono font-bold text-white uppercase block pb-2 border-b border-zinc-800">
                  Live Mission Telemetry Gauges
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">C2 Network Latency</span>
                    <div className="text-base font-bold text-emerald-400">
                      {selectedSuite.telemetryGauges.latencyMs} ms
                    </div>
                    <span className="text-[10px] text-zinc-400">Lattice Crypto Verified</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">Mesh Throughput</span>
                    <div className="text-base font-bold text-cyan-400">
                      {selectedSuite.telemetryGauges.bandwidthGbps} Gbps
                    </div>
                    <span className="text-[10px] text-zinc-400">Directional MADL/IFCN</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">Node Sync State</span>
                    <div className="text-base font-bold text-white">
                      {selectedSuite.telemetryGauges.nodeSyncPct}%
                    </div>
                    <span className="text-[10px] text-emerald-400">All Nodes Locked</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">Quantum Security</span>
                    <div className="text-base font-bold text-amber-400">
                      {selectedSuite.telemetryGauges.quantumAssurancePct}%
                    </div>
                    <span className="text-[10px] text-zinc-400">CNSA 2.0 Hardened</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                  <span className="text-zinc-400 font-mono text-[10px] block">Active Threat Scenario:</span>
                  <div className="text-rose-400 font-medium text-[11px]">
                    {selectedSuite.activeThreatScenario}
                  </div>
                  <div className="text-zinc-400 text-[10px]">
                    Tactical Output: {selectedSuite.tacticalOutput}
                  </div>
                </div>
              </div>

              {/* Terminal Log Stream */}
              <div className="rounded-2xl border border-zinc-800 bg-black/90 p-4 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold text-[11px] uppercase">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    Suite Telemetry Stream
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {suiteLogs.length} Events
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-none text-[11px] leading-relaxed">
                  {suiteLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`p-1.5 rounded ${
                        log.includes('ACTIVE') || log.includes('Confirmed') || log.includes('VERIFIED')
                          ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                          : log.includes('ABORT') || log.includes('ZEROIZE')
                          ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                          : log.includes('STAGE') || log.includes('LAUNCH')
                          ? 'bg-blue-950/40 text-blue-300 border-l-2 border-blue-500'
                          : 'bg-zinc-950/60 text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: PRIME SOFTWARE CATALOG & SUITE BROWSER */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-5">
          {/* Prime Contractor Quick Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                Filter by Prime Contractor:
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Showing {filteredProducts.length} of {DEFENSE_SOFTWARE_PRODUCTS.length} software platforms
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedContractor('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                  selectedContractor === 'ALL'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Primes (8)
              </button>

              {DEFENSE_PRIMES.map((prime) => (
                <button
                  key={prime.id}
                  type="button"
                  onClick={() => setSelectedContractor(prime.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                    selectedContractor === prime.id
                      ? `${prime.badgeBg} border-current shadow`
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{prime.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-70 font-mono">({prime.ticker})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Domain & Search Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search software by name, acronym, standard (Link-16, OMS, DDS), or capability..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as DefenseDomain | 'ALL')}
              className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Mission Domains</option>
              <option value="Multi-Domain C2 (JADC2)">Multi-Domain C2 (JADC2)</option>
              <option value="Air & Missile Defense">Air & Missile Defense</option>
              <option value="Autonomous Swarms & AI">Autonomous Swarms & AI</option>
              <option value="Avionics & Open Mission Systems">Avionics & Open Mission Systems</option>
              <option value="High-Assurance Crypto & EW">High-Assurance Crypto & EW</option>
              <option value="Geospatial & Targeting Intelligence">Geospatial & Targeting Intelligence</option>
            </select>
          </div>

          {/* Grid of Software Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const prime = DEFENSE_PRIMES.find((p) => p.id === product.contractorId);
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 hover:border-zinc-700 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Name, Acronym & Classification */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              prime?.badgeBg || 'bg-zinc-900 text-zinc-300'
                            }`}
                          >
                            {product.contractorName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                          <span>{product.name}</span>
                          <span className="text-xs font-mono text-cyan-400">[{product.acronym}]</span>
                        </h3>
                      </div>

                      {/* Classification Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap border shrink-0 ${
                          product.classification === 'TOP SECRET // SCI'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                            : product.classification === 'SECRET // NOFORN'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        }`}
                      >
                        {product.classification}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 italic">
                      &ldquo;{product.tagline}&rdquo;
                    </p>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Core Capabilities */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                        Core Mission Capabilities:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {product.coreCapabilities.map((cap, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-zinc-300 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800/80"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantum Resistance & Standards */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-400 text-[11px]">PQC Status:</span>
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.2 rounded ${
                            product.quantumResistance.status === 'PQC_NATIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          }`}
                        >
                          {product.quantumResistance.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-400 text-[11px]">Algorithm Target:</span>
                        <span className="font-mono text-[11px] text-cyan-300 font-bold">
                          {product.quantumResistance.targetAlgorithm}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-800">
                        {product.interoperabilityStandards.map((std, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-400 border border-zinc-800"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action & Live Telemetry */}
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span>Nodes: <strong className="text-white">{product.telemetry.activeNodes}</strong></span>
                      <span>Latency: <strong className="text-emerald-400">{product.telemetry.latencyMs}ms</strong></span>
                      <span>Throughput: <strong className="text-cyan-400">{product.telemetry.throughputGbps} Gbps</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const matchedSuite =
                            DEFENSE_MISSION_SUITES.find(
                              (s) => s.contractorId === product.contractorId
                            ) || DEFENSE_MISSION_SUITES[0];
                          setSelectedSuiteId(matchedSuite.id);
                          setActiveSubTab('launcher');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-700 text-xs font-mono text-blue-300 font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Rocket className="w-3.5 h-3.5 text-blue-400" />
                        <span>Launch Suite</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectedProduct(product)}
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect API</span>
                      </button>

                      {onLoadDefensePresetToPipeline && (
                        <button
                          type="button"
                          onClick={onLoadDefensePresetToPipeline}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-xs font-mono text-cyan-300 font-bold transition-colors cursor-pointer"
                        >
                          Audit in PQC Pipeline
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: IBCS & AEGIS SENSOR-TO-SHOOTER SIMULATOR */}
      {activeSubTab === 'sensor-to-shooter' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-rose-400 animate-pulse" />
                <span>Multi-Domain Sensor-to-Shooter Engagement Simulator</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Fusing radar tracks from AN/SPY-6 and Space Development Agency constellations through Northrop IBCS and Lockheed Aegis Baseline 10 to cue interceptors with NIST FIPS 204 signed commands.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950 border border-rose-800 text-rose-300">
              REAL-TIME COMBAT AIR PICTURE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1 & 2: Active Radar Tracks Table & Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-zinc-400 uppercase">
                  Select Track to Engage:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                        selectedTrack.id === track.id
                          ? 'border-rose-600 bg-rose-950/30 ring-1 ring-rose-500 shadow-md'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{track.id}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            track.status === 'INTERCEPTED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          }`}
                        >
                          {track.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-200">{track.designation}</div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Speed: <strong className="text-amber-400">Mach {track.velocityMach}</strong></span>
                        <span>Alt: <strong className="text-cyan-400">{Math.round(track.altitudeMeters / 1000)} km</strong></span>
                        <span>Range: <strong className="text-white">{track.rangeKm} km</strong></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Track Detailed Engagement Envelope */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    Track Tactical Envelope: {selectedTrack.id}
                  </span>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    Target Class: {selectedTrack.threatType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px] block">Detecting Sensor:</span>
                    <span className="text-zinc-200 font-medium">{selectedTrack.detectingSensor}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px] block">JADC2 Battle Manager:</span>
                    <span className="text-zinc-200 font-medium">{selectedTrack.fusionSystem}</span>
                  </div>
                  <div className="sm:col-span-2 p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px] block">Recommended Weapon System:</span>
                    <span className="text-emerald-300 font-bold font-mono">{selectedTrack.recommendedShooter}</span>
                  </div>
                </div>

                {/* Cryptographic Engagement Mode Selection */}
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono text-zinc-400 block">
                    Select Tactical Command Signature Protocol:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEngagementMode('PQC_HARDENED')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        engagementMode === 'PQC_HARDENED'
                          ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200 ring-1 ring-emerald-500'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>NIST FIPS 204 ML-DSA-87 (PQC)</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        DoD CNSA 2.0 mandated lattice signature with monotonic anti-replay counter.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngagementMode('LEGACY_CLASSICAL')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        engagementMode === 'LEGACY_CLASSICAL'
                          ? 'bg-amber-950/70 border-amber-600 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Legacy RSA-2048 / CNSA 1.0</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Vulnerable to Shor algorithm factoring and harvest-now-decrypt-later interception.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Engagement Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isEngaging}
                    onClick={handleExecuteEngagement}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isEngaging ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Computing Fire Solution & Verifying PQC Keys...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-4 h-4" />
                        <span>Authorize Fire Direction Order & Dispatch Interceptor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Live Sensor-to-Shooter Terminal Logs */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-black font-mono text-xs space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-zinc-200">IFCN Fire Control Log</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">LINK-16 ACTIVE</span>
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 text-[11px] leading-relaxed">
                  {engagementLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`${
                        log.includes('PQC-VERIFY') || log.includes('INTERCEPT')
                          ? 'text-emerald-400'
                          : log.includes('WARNING')
                          ? 'text-amber-400'
                          : log.includes('INITIATE')
                          ? 'text-rose-400 font-bold'
                          : 'text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Latency: 0.8ms</span>
                <span>JADC2 Enclave: TS//NOFORN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PALANTIR AIP & GOTHAM MISSION CONSOLE */}
      {activeSubTab === 'palantir-aip' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>Palantir AIP (Artificial Intelligence Platform) for Defense</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Evaluating operational queries with ontological safety bounds, Law of Armed Conflict checks, and FIPS 204 cryptographic audit attestation.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              PALANTIR TITAN & MAVEN INTEGRATION
            </span>
          </div>

          {/* AIP Query Input Form */}
          <form onSubmit={handleRunAipQuery} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter operational prompt (e.g. 'Evaluate hypersonic intercept trajectory for DDG-125 while respecting civil air corridors')..."
                value={aipPromptInput}
                onChange={(e) => setAipPromptInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 pr-24"
              />
              <button
                type="submit"
                disabled={isAipProcessing || !aipPromptInput.trim()}
                className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                {isAipProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Evaluate</span>
              </button>
            </div>
          </form>

          {/* AIP Prompt Logs List */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold text-zinc-400 uppercase">
              Recent AIP Defensive Inference Logs:
            </span>

            {aipLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{log.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                      {log.operatorClearance}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{log.timestamp}</span>
                </div>

                <div className="text-zinc-200 font-medium">
                  <strong className="text-zinc-400 font-mono block mb-0.5">Operator Directive:</strong>
                  {log.prompt}
                </div>

                {/* Guardrail Check Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-black/60 border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-400">Law of Armed Conflict:</span>
                    <span className="text-emerald-400 font-bold">{log.guardrailChecks.lawOfArmedConflict} ✓</span>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-400">Rules of Engagement:</span>
                    <span className="text-emerald-400 font-bold">{log.guardrailChecks.rulesOfEngagement} ✓</span>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-400">PQC Digital Attestation:</span>
                    <span className="text-cyan-400 font-bold">{log.guardrailChecks.pqcAttestation} ✓</span>
                  </div>
                </div>

                {/* Ontology Entities */}
                <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-mono text-zinc-500">Resolved Ontology Entities:</span>
                  {log.ontologyEntities.map((ent, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[10px]"
                    >
                      {ent}
                    </span>
                  ))}
                </div>

                {/* Proposed Action */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-emerald-200">
                  <span className="font-mono font-bold text-[11px] text-emerald-400 block mb-0.5">
                    Recommended Action & Kinetic Boundary:
                  </span>
                  {log.recommendedAction}
                </div>

                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  Cryptographic Audit Hash: {log.auditHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TACLANE TYPE 1 & TACTICAL CRYPTO GATEWAY */}
      {activeSubTab === 'crypto-gateway' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>General Dynamics TACLANE & L3Harris Tactical Crypto Gateway</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Wire-speed 100 Gbps High Assurance IP Encryptor (HAIPE IS v4.2.5) quantum-resistant network tunnels protecting DoD Global Information Grid communications.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
              NSA TYPE 1 CERTIFIED SUITE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* TACLANE Tunnel Status Card */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">TACLANE KG-175X HAIPE Tunnel #01</h4>
                  <div className="text-xs text-zinc-400">Pentagon NMCC to STRATCOM Offutt AFB</div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                  ONLINE · 100G LINE RATE
                </span>
              </div>

              {/* Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-zinc-400">Active Encryption Protocol:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTaclaneMode('CNSA_2_0_PQC');
                      setTunnelEncryptedPackets((prev) => prev + 1400);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      taclaneMode === 'CNSA_2_0_PQC'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 ring-1 ring-emerald-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">DoD CNSA 2.0 (PQC)</div>
                    <div className="text-[10px] text-zinc-400">ML-KEM-1024 + AES-256-GCM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTaclaneMode('LEGACY_SUITE_B');
                      setTunnelEncryptedPackets((prev) => prev + 800);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      taclaneMode === 'LEGACY_SUITE_B'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-200 ring-1 ring-amber-500'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">Legacy CNSA 1.0</div>
                    <div className="text-[10px] text-zinc-400">ECDH P-384 (Vulnerable)</div>
                  </button>
                </div>
              </div>

              {/* Tunnel Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-2">
                <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Encrypted Packets:</span>
                  <span className="text-white font-bold">{tunnelEncryptedPackets.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Line Latency:</span>
                  <span className="text-emerald-400 font-bold">0.12 ms</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Key Lifetime:</span>
                  <span className="text-cyan-400 font-bold">14m (Ephemeral)</span>
                </div>
              </div>
            </div>

            {/* L3Harris Tactical SDR Network Card */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">L3Harris Falcon IV Tactical SDR Mesh</h4>
                  <div className="text-xs text-zinc-400">AN/PRC-163 Multi-Channel Handheld Swarm</div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
                  ANTI-JAM WAVEFORM ACTIVE
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">Over-The-Air Rekeying (OTAR):</span>
                    <span className="text-emerald-400 font-bold">NIST FIPS 203 ML-KEM-768</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">Waveform:</span>
                    <span className="text-white">ANW2 Tactical Mobile Ad-Hoc Network (MANET)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">Cross-Domain Hardware Guard:</span>
                    <span className="text-rose-400 font-bold">L3Harris Vigilant CDS (TS to Secret)</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400">
                  Autonomous frequency-hopping protects infantry voice and situational awareness telemetry from Russian and Chinese electronic warfare jamming systems.
                </p>
              </div>

              {onLoadDefensePresetToPipeline && (
                <button
                  type="button"
                  onClick={onLoadDefensePresetToPipeline}
                  className="w-full py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  Load TACLANE / Falcon SDR Preset into PQC Pipeline
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTED PRODUCT API MODAL */}
      {inspectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    {inspectedProduct.contractorName}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {inspectedProduct.acronym}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {inspectedProduct.name} - API Interface
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedProduct(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 text-[11px]">Simulated Tactical Endpoint:</span>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-300 break-all select-all">
                  {inspectedProduct.apiEndpointSimulated}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 text-[11px]">PQC Cryptographic Profile:</span>
                <div className="p-3 rounded-lg bg-black border border-zinc-800 space-y-1 text-zinc-300 text-[11px]">
                  <div>Target Algorithm: <strong className="text-emerald-400">{inspectedProduct.quantumResistance.targetAlgorithm}</strong></div>
                  <div>Standard Compliance: <strong className="text-cyan-400">{inspectedProduct.quantumResistance.fipsCompliance}</strong></div>
                  <div>Deployment: <strong className="text-zinc-200">{inspectedProduct.deploymentEnvironment}</strong></div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 text-[11px]">Supported Interoperability Standards:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedProduct.interoperabilityStandards.map((std, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px]"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectedProduct(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
