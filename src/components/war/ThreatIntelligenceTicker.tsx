import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Target,
  Activity,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Play,
  Pause,
  FastForward,
  RefreshCw,
  Zap,
  Search,
  Filter,
  X,
  Lock,
  Unlock,
  Cpu,
  Terminal,
  Crosshair,
  Radar,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { StrikeTarget } from '../../types/war';
import {
  ThreatIntelCve,
  CveSeverity,
  TickerFilterOptions,
} from '../../types/threatIntel';
import {
  INITIAL_CVE_THREAT_INTEL,
  generateSimulatedLiveCve,
} from '../../data/cveThreatIntelData';

interface ThreatIntelligenceTickerProps {
  selectedTarget: StrikeTarget;
  onSelectTargetById?: (targetId: string) => void;
  onNavigateToCyberConsole?: (payloadId?: string) => void;
}

export const ThreatIntelligenceTicker: React.FC<ThreatIntelligenceTickerProps> = ({
  selectedTarget,
  onSelectTargetById,
  onNavigateToCyberConsole,
}) => {
  // State for live CVE items
  const [cveList, setCveList] = useState<ThreatIntelCve[]>(
    INITIAL_CVE_THREAT_INTEL
  );
  const [selectedCve, setSelectedCve] = useState<ThreatIntelCve | null>(null);

  // Playback & Ingestion controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 5>(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [recentAlert, setRecentAlert] = useState<{
    message: string;
    cveId: string;
    timestamp: string;
  } | null>(null);

  // Filter options
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | CveSeverity>('ALL');
  const [cisaKevOnly, setCisaKevOnly] = useState<boolean>(false);
  const [zeroDayOnly, setZeroDayOnly] = useState<boolean>(false);
  const [pqcOnly, setPqcOnly] = useState<boolean>(false);
  const [targetSpecificOnly, setTargetSpecificOnly] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Copy feedback state
  const [copiedCveId, setCopiedCveId] = useState<string | null>(null);

  // Ref to pause marquee on mouse hover
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const tickerContainerRef = useRef<HTMLDivElement>(null);

  // Target context change notification
  const prevTargetIdRef = useRef<string>(selectedTarget.id);
  useEffect(() => {
    if (prevTargetIdRef.current !== selectedTarget.id) {
      prevTargetIdRef.current = selectedTarget.id;
      setRecentAlert({
        message: `Tuned stream to target: ${selectedTarget.designation} (${selectedTarget.id})`,
        cveId: 'TARGET-RE-TUNED',
        timestamp: new Date().toLocaleTimeString(),
      });
      const timer = setTimeout(() => setRecentAlert(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [selectedTarget.id, selectedTarget.designation]);

  // Periodic Live Ingestion Engine
  useEffect(() => {
    if (!isPlaying) return;

    // Interval based on speed: 1x = 12s, 2x = 6s, 5x = 2.4s
    const intervalMs = speedMultiplier === 5 ? 2400 : speedMultiplier === 2 ? 6000 : 12000;

    const interval = setInterval(() => {
      const newCve = generateSimulatedLiveCve(selectedTarget.id);
      setCveList((prev) => [newCve, ...prev.slice(0, 35)]);

      setRecentAlert({
        message: `New Ingest: ${newCve.id} [${newCve.cvssScore} ${newCve.cvssSeverity}] - ${newCve.title}`,
        cveId: newCve.id,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Clear alert after 4.5 seconds
      const timer = setTimeout(() => {
        setRecentAlert(null);
      }, 4500);

      return () => clearTimeout(timer);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, selectedTarget.id]);

  // Manual Trigger: Force Ingest
  const handleForceIngest = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newCve = generateSimulatedLiveCve(selectedTarget.id);
      setCveList((prev) => [newCve, ...prev.slice(0, 35)]);
      setIsSyncing(false);
      setRecentAlert({
        message: `Force Ingested: ${newCve.id} (${newCve.title})`,
        cveId: newCve.id,
        timestamp: new Date().toLocaleTimeString(),
      });
      setTimeout(() => setRecentAlert(null), 4500);
    }, 500);
  };

  // Manual Trigger: Inject Zero-Day
  const handleInjectZeroDay = () => {
    const zeroDay: ThreatIntelCve = {
      id: `CVE-2026-${Math.floor(80000 + Math.random() * 9999)}`,
      title: `CRITICAL ZERO-DAY: Remote Bus Injection against ${selectedTarget.targetType}`,
      targetEnvironmentIds: [selectedTarget.id],
      targetCategory:
        selectedTarget.hardenedTier === 'HEAVILY_DEFENDED_A2AD'
          ? 'Radar & RF A2/AD'
          : selectedTarget.hardenedTier === 'DEEP_UNDERGROUND_BUNKER'
          ? 'Subterranean C4I'
          : selectedTarget.hardenedTier === 'MARITIME_EXPEDITIONARY'
          ? 'Maritime Fleet / SAG'
          : 'Mobile TEL Battery',
      cvssScore: 10.0,
      cvssSeverity: 'CRITICAL',
      epssScore: 0.994,
      cisaKev: true,
      zeroDay: true,
      publishedDate: new Date().toISOString(),
      affectedComponents: [
        `${selectedTarget.designation} Integrated Command Bus`,
        'Embedded RTOS Firmware Kernel',
      ],
      attackVector: 'ADJACENT_RF',
      attackComplexity: 'LOW',
      mitreTechnique: 'T1190 - Initial Exploit & Command Injection',
      mitreTactic: 'Execution',
      description: `Unauthenticated over-the-air instruction injection vulnerability observed actively weaponized against ${selectedTarget.designation}.`,
      impact:
        'Immediate loss of defense coordination and weapon bus spoofing capability.',
      tacticalRelevance: `Direct operational bypass for current strike mission against ${selectedTarget.locationName}.`,
      pqcRelevance: {
        vulnerableCrypto: 'Legacy unsigned datalink firmware packets',
        pqcFix: 'NIST FIPS 204 ML-DSA-87 Signed Microcode',
        harvestNowRisk: true,
      },
      suggestedCyberPayloadId: 'cyber-rf-aesa-injector',
      exploitStatus: 'UNPATCHED_ZERO_DAY',
      feedSource: 'DOD-CYBERCOM',
    };

    setCveList((prev) => [zeroDay, ...prev]);
    setRecentAlert({
      message: `🚨 ZERO-DAY INJECTED: ${zeroDay.id} - ${zeroDay.title}`,
      cveId: zeroDay.id,
      timestamp: new Date().toLocaleTimeString(),
    });
    setSelectedCve(zeroDay);
    setTimeout(() => setRecentAlert(null), 6000);
  };

  // Filtered list of CVEs
  const filteredCves = useMemo(() => {
    return cveList.filter((cve) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          cve.id.toLowerCase().includes(q) ||
          cve.title.toLowerCase().includes(q) ||
          cve.description.toLowerCase().includes(q) ||
          cve.affectedComponents.some((comp) => comp.toLowerCase().includes(q)) ||
          cve.mitreTechnique.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Severity filter
      if (severityFilter !== 'ALL' && cve.cvssSeverity !== severityFilter) {
        return false;
      }

      // CISA KEV
      if (cisaKevOnly && !cve.cisaKev) {
        return false;
      }

      // Zero-Day only
      if (zeroDayOnly && !cve.zeroDay) {
        return false;
      }

      // PQC only
      if (pqcOnly && !cve.pqcRelevance) {
        return false;
      }

      // Target specific only
      if (targetSpecificOnly) {
        const matches =
          cve.targetEnvironmentIds.includes(selectedTarget.id) ||
          cve.targetEnvironmentIds.includes('ALL');
        if (!matches) return false;
      }

      return true;
    });
  }, [
    cveList,
    searchQuery,
    severityFilter,
    cisaKevOnly,
    zeroDayOnly,
    pqcOnly,
    targetSpecificOnly,
    selectedTarget.id,
  ]);

  // Target-relevant CVE count
  const targetRelevantCount = useMemo(() => {
    return cveList.filter(
      (c) =>
        c.targetEnvironmentIds.includes(selectedTarget.id) ||
        c.targetEnvironmentIds.includes('ALL')
    ).length;
  }, [cveList, selectedTarget.id]);

  const zeroDayCount = useMemo(() => cveList.filter((c) => c.zeroDay).length, [cveList]);
  const cisaKevCount = useMemo(() => cveList.filter((c) => c.cisaKev).length, [cveList]);
  const pqcCount = useMemo(() => cveList.filter((c) => !!c.pqcRelevance).length, [cveList]);

  // Copy CVE JSON / summary
  const handleCopyCve = (cve: ThreatIntelCve) => {
    navigator.clipboard.writeText(JSON.stringify(cve, null, 2));
    setCopiedCveId(cve.id);
    setTimeout(() => setCopiedCveId(null), 2500);
  };

  return (
    <div className="space-y-2.5">
      {/* Top Threat Intel Ticker Bar Header */}
      <div className="rounded-2xl border border-rose-900/60 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-black p-3.5 sm:p-4 text-white shadow-xl relative overflow-hidden">
        {/* Ambient tactical scanlines / glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-rose-600/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
          {/* Brand & Target Environment Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 font-mono text-xs font-bold shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>LIVE THREAT INTEL TICKER</span>
            </div>

            {/* Target Context Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-zinc-300">
              <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-zinc-500 hidden sm:inline">TARGET CONTEXT:</span>
              <span className="text-amber-300 font-bold truncate max-w-[200px] sm:max-w-xs">
                {selectedTarget.designation}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800 text-[10px] text-amber-300 font-bold">
                {targetRelevantCount} Relevant CVEs
              </span>
            </div>

            {/* Ingestion feed badge */}
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>FEEDS: CISA KEV · DOD CYBERCOM · NVD</span>
            </div>
          </div>

          {/* Telemetry Stats & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick telemetry badges */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                Total: <strong className="text-white">{cveList.length}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300">
                0-Day: <strong className="text-rose-200">{zeroDayCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300">
                KEV: <strong className="text-amber-200">{cisaKevCount}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 hidden md:inline">
                PQC: <strong className="text-cyan-200">{pqcCount}</strong>
              </span>
            </div>

            {/* Play/Pause & Speed */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause live ticker' : 'Resume live ticker'}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isPlaying
                    ? 'text-emerald-400 hover:bg-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center text-[10px] font-mono text-zinc-400 px-1 border-l border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-1.5 py-0.5 rounded ${
                    speedMultiplier === 1 ? 'bg-zinc-800 text-white font-bold' : 'hover:text-zinc-200'
                  }`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(2)}
                  className={`px-1.5 py-0.5 rounded ${
                    speedMultiplier === 2 ? 'bg-zinc-800 text-white font-bold' : 'hover:text-zinc-200'
                  }`}
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(5)}
                  className={`px-1.5 py-0.5 rounded ${
                    speedMultiplier === 5 ? 'bg-rose-900 text-rose-200 font-bold' : 'hover:text-zinc-200'
                  }`}
                >
                  5x
                </button>
              </div>
            </div>

            {/* Trigger Force Ingest */}
            <button
              type="button"
              onClick={handleForceIngest}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
              title="Force ingest of simulated CVE stream"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            {/* Trigger 0-Day Drop */}
            <button
              type="button"
              onClick={handleInjectZeroDay}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-700 text-xs font-mono text-rose-200 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Inject simulated Zero-Day against selected target"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Drop 0-Day</span>
            </button>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1 font-mono ${
                isFilterOpen || severityFilter !== 'ALL' || cisaKevOnly || zeroDayOnly || pqcOnly || targetSpecificOnly
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Live Alert Banner if recent bulletin popped */}
        {recentAlert && (
          <div className="mt-2.5 py-1 px-3 rounded-lg bg-rose-950/90 border border-rose-700/80 text-rose-200 text-xs font-mono flex items-center justify-between gap-2 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="font-bold text-amber-300 shrink-0">[{recentAlert.timestamp}]</span>
              <span className="truncate">{recentAlert.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setRecentAlert(null)}
              className="text-rose-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Expandable Filter & Search Drawer */}
        {isFilterOpen && (
          <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-2.5 animate-in fade-in duration-150">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search CVE ID, tech (e.g. SCADA, radar, Modbus, FPGA, VxWorks)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono outline-none focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400 shrink-0">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-rose-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical (9.0 - 10.0)</option>
                <option value="HIGH">High (7.0 - 8.9)</option>
                <option value="MEDIUM">Medium (4.0 - 6.9)</option>
              </select>
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTargetSpecificOnly(!targetSpecificOnly)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  targetSpecificOnly
                    ? 'bg-amber-950 border border-amber-600 text-amber-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Active Target Only
              </button>

              <button
                type="button"
                onClick={() => setZeroDayOnly(!zeroDayOnly)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  zeroDayOnly
                    ? 'bg-rose-950 border border-rose-600 text-rose-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                0-Day Only
              </button>

              <button
                type="button"
                onClick={() => setCisaKevOnly(!cisaKevOnly)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  cisaKevOnly
                    ? 'bg-orange-950 border border-orange-600 text-orange-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CISA KEV
              </button>

              <button
                type="button"
                onClick={() => setPqcOnly(!pqcOnly)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  pqcOnly
                    ? 'bg-cyan-950 border border-cyan-600 text-cyan-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                PQC Flaws
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONTINUOUS REAL-TIME TICKER TAPE */}
      <div
        className="relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient Left & Right Fade Masks for marquee smoothness */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

        {/* Ticker Items Container: Horizontal scroll / Marquee */}
        <div
          ref={tickerContainerRef}
          className="flex items-center gap-3 py-2.5 px-4 overflow-x-auto scrollbar-none select-none scroll-smooth"
        >
          {filteredCves.length === 0 ? (
            <div className="py-2 px-4 text-xs font-mono text-zinc-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-600" />
              <span>No CVE bulletins match current filter. Adjust filters or click "Sync Live".</span>
            </div>
          ) : (
            filteredCves.map((cve) => {
              const isTargetDirectMatch =
                cve.targetEnvironmentIds.includes(selectedTarget.id) ||
                cve.targetEnvironmentIds.includes('ALL');

              return (
                <div
                  key={cve.id}
                  onClick={() => setSelectedCve(cve)}
                  className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] ${
                    isTargetDirectMatch
                      ? 'bg-rose-950/40 border-rose-700/80 hover:border-rose-500 hover:bg-rose-950/70 shadow-sm'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  {/* Target match crosshair */}
                  {isTargetDirectMatch && (
                    <span title="Matches current target environment!">
                      <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                    </span>
                  )}

                  {/* CVE ID */}
                  <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{cve.id}</span>
                  </div>

                  {/* CVSS Score Badge */}
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                      cve.cvssSeverity === 'CRITICAL'
                        ? 'bg-rose-900 text-rose-200 border border-rose-600'
                        : cve.cvssSeverity === 'HIGH'
                        ? 'bg-amber-900 text-amber-200 border border-amber-600'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {cve.cvssScore.toFixed(1)}
                  </span>

                  {/* Badges: 0-Day or CISA */}
                  {cve.zeroDay && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-700 font-bold uppercase">
                      0-Day
                    </span>
                  )}
                  {cve.cisaKev && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-700 font-bold uppercase">
                      KEV
                    </span>
                  )}
                  {cve.pqcRelevance && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold uppercase">
                      PQC Risk
                    </span>
                  )}

                  {/* Title Preview */}
                  <span className="text-xs text-zinc-300 max-w-[240px] sm:max-w-[320px] truncate">
                    {cve.title}
                  </span>

                  {/* View Details Icon */}
                  <Eye className="w-3 h-3 text-zinc-500 hover:text-white shrink-0 ml-1" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DETAILED CVE THREAT INTELLIGENCE DOSSIER MODAL */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-rose-800 bg-zinc-950 p-5 sm:p-7 text-white shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-mono font-black text-red-400">
                    {selectedCve.id}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedCve.cvssSeverity === 'CRITICAL'
                        ? 'bg-rose-950 border-rose-600 text-rose-300'
                        : selectedCve.cvssSeverity === 'HIGH'
                        ? 'bg-amber-900/80 border-amber-600 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    CVSS {selectedCve.cvssScore.toFixed(1)} {selectedCve.cvssSeverity}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    EPSS {Math.round(selectedCve.epssScore * 100)}%
                  </span>
                  {selectedCve.zeroDay && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300">
                      ACTIVE ZERO-DAY
                    </span>
                  )}
                  {selectedCve.cisaKev && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-950 border border-orange-700 text-orange-300">
                      CISA KEV CATALOG
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedCve.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCve(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Technical Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <span className="text-[10px] text-zinc-400 uppercase block">Target Category</span>
                <strong className="text-amber-300">{selectedCve.targetCategory}</strong>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <span className="text-[10px] text-zinc-400 uppercase block">Attack Vector</span>
                <strong className="text-cyan-300">{selectedCve.attackVector}</strong>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <span className="text-[10px] text-zinc-400 uppercase block">Exploit Status</span>
                <strong className="text-rose-300">{selectedCve.exploitStatus}</strong>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <span className="text-[10px] text-zinc-400 uppercase block">Source Feed</span>
                <strong className="text-emerald-300">{selectedCve.feedSource}</strong>
              </div>
            </div>

            {/* Target Environment Operational Correlation Card */}
            <div className="p-4 rounded-xl border border-amber-900/70 bg-gradient-to-br from-amber-950/30 to-black space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  OPERATIONAL TARGET CORRELATION
                </span>
                <span className="text-zinc-400">
                  Target: <strong className="text-white">{selectedTarget.id}</strong>
                </span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {selectedCve.tacticalRelevance}
              </p>
              <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                Target Defenses Exposed: <em>{selectedTarget.defenses}</em>
              </div>
            </div>

            {/* Vulnerability Description & Impact */}
            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <div className="space-y-1">
                <span className="font-mono text-zinc-400 uppercase font-bold text-[11px] block">
                  Technical Vulnerability Description:
                </span>
                <p className="p-3 rounded-lg border border-zinc-800 bg-black/60">
                  {selectedCve.description}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-zinc-400 uppercase font-bold text-[11px] block">
                  Operational Mission Impact:
                </span>
                <p className="p-3 rounded-lg border border-zinc-800 bg-black/60 text-red-300">
                  {selectedCve.impact}
                </p>
              </div>
            </div>

            {/* Affected Hardware & Software Components */}
            <div className="space-y-1.5">
              <span className="font-mono text-zinc-400 uppercase font-bold text-[11px] block">
                Affected Target Components:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCve.affectedComponents.map((comp, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* MITRE ATT&CK Matrix Technique */}
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-zinc-400">MITRE ATT&CK:</span>
                <span className="text-white font-bold">{selectedCve.mitreTechnique}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                Tactic: {selectedCve.mitreTactic}
              </span>
            </div>

            {/* Post-Quantum Cryptography & Quantum Transition Analysis (if applicable) */}
            {selectedCve.pqcRelevance && (
              <div className="p-3.5 rounded-xl border border-cyan-800/80 bg-cyan-950/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-cyan-400 font-mono font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    POST-QUANTUM CRYPTOGRAPHIC IMPACT (NIST FIPS 203 / 204)
                  </span>
                  {selectedCve.pqcRelevance.harvestNowRisk && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-[10px] text-rose-300">
                      HARVEST-NOW-DECRYPT RISK
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-black/60 border border-zinc-800">
                    <span className="text-zinc-500 block">Vulnerable Cryptographic Primitive:</span>
                    <strong className="text-rose-400">{selectedCve.pqcRelevance.vulnerableCrypto}</strong>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-zinc-800">
                    <span className="text-zinc-500 block">Mandated PQC Mitigation:</span>
                    <strong className="text-emerald-400">{selectedCve.pqcRelevance.pqcFix}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleCopyCve(selectedCve)}
                className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copiedCveId === selectedCve.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Dossier Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Intel JSON</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {onNavigateToCyberConsole && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToCyberConsole(selectedCve.suggestedCyberPayloadId);
                      setSelectedCve(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950 to-red-900 hover:from-rose-900 hover:to-red-800 border border-rose-700 text-xs font-mono text-rose-200 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Arm Exploitation Payload in Cyber Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCve(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
