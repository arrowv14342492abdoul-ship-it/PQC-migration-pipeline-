import React, { useState, useEffect } from 'react';
import {
  AikidoFinding,
  AikidoIntegrationStatus,
  AikidoSeverity,
  AikidoScannerType,
  FindingStatus,
} from '../types/aikido';
import { aikidoConnector } from '../services/aikidoConnector';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Zap,
  Key,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Code,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  Wand2,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

interface SecurityIntegrationsProps {
  onRemediateInPqcPipeline?: (codeSnippet: string, findingTitle: string) => void;
  onGradeChange?: (grade: string) => void;
}

export const SecurityIntegrations: React.FC<SecurityIntegrationsProps> = ({
  onRemediateInPqcPipeline,
  onGradeChange,
}) => {
  const [status, setStatus] = useState<AikidoIntegrationStatus | null>(null);
  const [findings, setFindings] = useState<AikidoFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [isRemediatingAll, setIsRemediatingAll] = useState(false);
  const [remediateStage, setRemediateStage] = useState('');

  // Notify parent on grade change
  useEffect(() => {
    if (status?.securityGrade && onGradeChange) {
      onGradeChange(status.securityGrade);
    }
  }, [status?.securityGrade, onGradeChange]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedScanner, setSelectedScanner] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyReachable, setOnlyReachable] = useState<boolean>(false);
  const [onlyPqc, setOnlyPqc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>('AIK-9401');
  const [expandedPatchId, setExpandedPatchId] = useState<string | null>(null);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [triageToast, setTriageToast] = useState<string | null>(null);

  // Load initial status and findings
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [currentStatus, currentFindings] = await Promise.all([
          aikidoConnector.getStatus(),
          aikidoConnector.getFindings(),
        ]);
        setStatus(currentStatus);
        setFindings(currentFindings);
      } catch (err) {
        console.error('Failed to load Aikido integration data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setTriageToast(msg);
    setTimeout(() => setTriageToast(null), 3500);
  };

  // Trigger simulated scan
  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanStage('Initializing scan...');
    try {
      const result = await aikidoConnector.triggerScan((stage) => {
        setScanStage(stage);
      });
      setStatus(result.status);
      setFindings(result.findings);
      showToast('Aikido Scan completed successfully · Findings updated');
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
      setScanStage('');
    }
  };

  // Fix all findings
  const handleFixAllFindings = async () => {
    setIsRemediatingAll(true);
    setRemediateStage('Synthesizing security fixes & PQC migrations...');
    try {
      const result = await aikidoConnector.remediateAllFindings((finding, idx) => {
        setRemediateStage(
          `Fixing ${finding.id} (${finding.scanner}): ${finding.title.slice(0, 40)}...`
        );
      });
      setStatus(result.status);
      setFindings(result.findings);
      showToast('🎉 All 6 Aikido Security findings successfully remediated! Grade A+ achieved.');
    } catch (err) {
      console.error('Error fixing all findings:', err);
    } finally {
      setIsRemediatingAll(false);
      setRemediateStage('');
    }
  };

  // Fix single finding
  const handleFixSingleFinding = async (findingId: string) => {
    const res = await aikidoConnector.remediateFinding(findingId);
    if (res.finding) {
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? res.finding! : f))
      );
      setStatus(res.status);
      showToast(`Resolved ${findingId}: Applied security patch & PQC replacement.`);
    }
  };

  // Reset to original vulnerable state
  const handleResetToInitial = () => {
    const res = aikidoConnector.resetToInitial();
    setStatus(res.status);
    setFindings(res.findings);
    showToast('Reset findings to initial vulnerable state for demonstration.');
  };

  // Test webhook
  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    setWebhookResult(null);
    try {
      const res = await aikidoConnector.testWebhook();
      setWebhookResult(res);
      setTimeout(() => setWebhookResult(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setWebhookTesting(false);
    }
  };

  // Update finding status manually
  const handleUpdateStatus = async (
    findingId: string,
    newStatus: FindingStatus
  ) => {
    const updated = await aikidoConnector.updateFindingStatus(
      findingId,
      newStatus
    );
    if (updated) {
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, status: newStatus } : f))
      );
      const newStatusObj = await aikidoConnector.getStatus();
      setStatus(newStatusObj);
      showToast(`Finding ${findingId} marked as ${newStatus}`);
    }
  };

  // Filtered findings list
  const filteredFindings = findings.filter((item) => {
    if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) {
      return false;
    }
    if (selectedScanner !== 'ALL' && item.scanner !== selectedScanner) {
      return false;
    }
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (onlyReachable && item.reachability !== 'REACHABLE') {
      return false;
    }
    if (onlyPqc && !item.isPqcRelated) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.id} ${item.title} ${item.description} ${item.filePath} ${item.cveId || ''} ${item.cweId || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const getSeverityBadgeClass = (severity: AikidoSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-800 text-rose-300';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-800 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/70 border-yellow-800/80 text-yellow-300';
      case 'LOW':
        return 'bg-blue-950/70 border-blue-800/80 text-blue-300';
    }
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'B':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      case 'C':
        return 'text-orange-400 border-orange-500/40 bg-orange-950/40';
      default:
        return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    }
  };

  const uncompletedCount = findings.filter((f) => f.status !== 'RESOLVED').length;
  const allResolved = uncompletedCount === 0;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {triageToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-600/80 bg-zinc-900 text-emerald-300 shadow-xl text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{triageToast}</span>
        </div>
      )}

      {/* Celebration Banner when all findings are resolved */}
      {allResolved && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/30 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <span>All Aikido Security Findings Successfully Remediated</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-900 border border-emerald-600 text-emerald-300">
                  Grade A+ · Gate PASSED
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                All classical cryptographic keys migrated to FIPS 203/204 hybrid standards, hardcoded secrets revoked, and containers secured.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetToInitial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      )}

      {/* 1. Integration Status Banner & Connector Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Aikido Security Integration
                </h2>
                <span className="text-zinc-600">/</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected via Mock API
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                <span>Workspace: <strong className="text-zinc-300">{status?.workspaceName}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Repo: <span className="font-mono text-zinc-300">{status?.repository}</span></span>
                <span className="text-zinc-600">·</span>
                <span>Branch: <span className="font-mono text-zinc-300">{status?.defaultBranch}</span></span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary CTA: Fix All Findings */}
            <button
              onClick={handleFixAllFindings}
              disabled={isRemediatingAll || allResolved}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md ${
                allResolved
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400 cursor-default opacity-80'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20 active:scale-98'
              }`}
            >
              {isRemediatingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fixing All Findings...</span>
                </>
              ) : allResolved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All Findings Resolved</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Fix All ({uncompletedCount}) Findings</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerScan}
              disabled={isScanning || isRemediatingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Trigger Scan'}</span>
            </button>

            <button
              onClick={handleTestWebhook}
              disabled={webhookTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>{webhookTesting ? 'Pinging...' : 'Test Webhook'}</span>
            </button>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>
          </div>
        </div>

        {/* Remediate in progress alert */}
        {isRemediatingAll && (
          <div className="p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-xs flex items-center justify-between text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="font-mono">{remediateStage}</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">FIPS 203/204 & Secret Purge</span>
          </div>
        )}

        {/* Scan in progress alert */}
        {isScanning && (
          <div className="p-3 rounded-lg border border-indigo-900/60 bg-indigo-950/20 text-xs flex items-center justify-between text-indigo-300 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-indigo-400 animate-bounce" />
              <span className="font-mono">{scanStage}</span>
            </div>
            <span className="text-[11px] text-zinc-400">SAST · SCA · Secrets · Reachability</span>
          </div>
        )}

        {/* Webhook test feedback */}
        {webhookResult && (
          <div className="p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-xs flex items-center justify-between text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{webhookResult.message}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">
              Latency: {webhookResult.latencyMs}ms
            </span>
          </div>
        )}

        {/* Mock API Connector Config Drawer */}
        {showConfigDrawer && (
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/70 text-xs space-y-3 pt-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aikido Mock API Connector Configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToInitial}
                  className="px-2 py-1 rounded text-[11px] border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 cursor-pointer"
                >
                  Reset to Initial Findings
                </button>
                <span className="text-[11px] text-zinc-500 font-mono">REST API v1</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Mock API Token (Masked)</label>
                <input
                  type="text"
                  readOnly
                  value={status?.apiKeyMasked || 'aik_live_9f8a...'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-zinc-300 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Aikido Workspace ID</label>
                <input
                  type="text"
                  readOnly
                  value={status?.workspaceId || 'ws_aikido_78129'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-zinc-300 text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Target CI/CD Repository</label>
                <input
                  type="text"
                  readOnly
                  value={status?.repository || 'acme-corp/pqc-secure-vault'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-zinc-300 text-[11px]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Aikido Security Metrics & Reachability Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Security Grade */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Aikido Security Score</span>
            <span className="text-[11px] font-mono text-zinc-500">Benchmark</span>
          </div>
          <div className="flex items-baseline gap-3">
            <div
              className={`w-12 h-12 rounded-lg border flex items-center justify-center text-xl font-bold font-mono ${getGradeColor(
                status?.securityGrade
              )}`}
            >
              {status?.securityGrade || 'A+'}
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
                {status?.securityScore ?? 100}
                <span className="text-xs text-zinc-500 font-normal"> / 100</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Gate:{' '}
                <strong
                  className={`font-mono ${
                    status?.gateStatus === 'PASSED'
                      ? 'text-emerald-400'
                      : status?.gateStatus === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {status?.gateStatus}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Reachable vs Total */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Reachable Issues</span>
            <span className="text-[11px] text-emerald-400 font-mono">Active Path</span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
              {allResolved ? 0 : status?.counts.reachable || 0}
              <span className="text-xs text-zinc-500 font-normal"> / {findings.length}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {allResolved
                ? 'Zero reachable vulnerabilities remaining.'
                : 'Prioritized by runtime call-graph reachability.'}
            </p>
          </div>
        </div>

        {/* Metric 3: Critical & High Exposure */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Pending Unresolved</span>
            <span className="text-[11px] text-zinc-500 font-mono">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                allResolved
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-300'
              }`}
            >
              {uncompletedCount} Remaining
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-850 border border-zinc-750 text-zinc-300">
              {findings.filter((f) => f.status === 'RESOLVED').length} Resolved
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {allResolved ? 'All security barriers passed.' : 'Blocking production CI/CD gating.'}
          </p>
        </div>

        {/* Metric 4: PQC Migration Relevance */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Post-Quantum Exposure</span>
            <span className="text-[11px] text-emerald-400 font-mono">FIPS 203/204</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {allResolved ? '0 Vulnerable' : `${status?.counts.pqcRelevant || 3} Vulnerable`}
          </div>
          <p className="text-[11px] text-zinc-400">
            {allResolved
              ? 'All classical ciphers migrated to PQC.'
              : 'Target for multi-agent PQC pipeline.'}
          </p>
        </div>
      </div>

      {/* 3. Filter Controls & Search Bar */}
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search findings by CVE, CWE, title, file path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Quick toggle checkboxes */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyReachable}
                onChange={(e) => setOnlyReachable(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-emerald-400">Reachable Only</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyPqc}
                onChange={(e) => setOnlyPqc(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-indigo-300">PQC / Crypto Only</span>
            </label>
          </div>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-850 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 mr-1">Status:</span>
            {['ALL', 'OPEN', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 mr-1">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 mr-1">Scanner:</span>
            {['ALL', 'SAST', 'SCA', 'SECRETS', 'IAC'].map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScanner(sc)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  selectedScanner === sc
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Findings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <div>
            Showing <strong className="text-zinc-200">{filteredFindings.length}</strong> of{' '}
            <strong className="text-zinc-200">{findings.length}</strong> Aikido Security Findings
          </div>
          <div className="text-[11px] text-zinc-500">
            {allResolved ? (
              <span className="text-emerald-400 font-medium">✓ All 6 issues resolved</span>
            ) : (
              `${uncompletedCount} open issues need remediation`
            )}
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-200">
              No Findings Match Selected Filters
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try resetting your status or severity filters to view resolved findings.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFindings.map((finding) => {
              const isExpanded = expandedFindingId === finding.id;
              const isReachable = finding.reachability === 'REACHABLE';
              const isResolved = finding.status === 'RESOLVED';
              const isPatchExpanded = expandedPatchId === finding.id;

              return (
                <div
                  key={finding.id}
                  className={`rounded-xl border transition-all ${
                    isResolved
                      ? 'border-emerald-950/80 bg-zinc-950/60'
                      : isExpanded
                      ? 'border-zinc-700 bg-zinc-900/60 shadow-lg'
                      : 'border-zinc-800 hover:border-zinc-750 bg-zinc-950/70'
                  }`}
                >
                  {/* Card Main Row */}
                  <div
                    onClick={() =>
                      setExpandedFindingId(isExpanded ? null : finding.id)
                    }
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Status indicator */}
                      {isResolved ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border bg-emerald-950/80 border-emerald-800 text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border ${getSeverityBadgeClass(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                      )}

                      {/* Scanner pill */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-850 border border-zinc-750 text-zinc-300 shrink-0">
                        {finding.scanner}
                      </span>

                      {/* Reachability tag */}
                      {!isResolved && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${
                            isReachable
                              ? 'bg-rose-950/60 border border-rose-900 text-rose-300'
                              : 'bg-zinc-850 border border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {isReachable ? '● Reachable' : '○ Not Reachable'}
                        </span>
                      )}

                      {/* Title & file */}
                      <div className="min-w-0 space-y-0.5">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isResolved ? 'text-zinc-400 line-through' : 'text-zinc-100'
                          }`}
                        >
                          {finding.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                          <span className="text-zinc-500">{finding.id}</span>
                          <span className="text-zinc-700">·</span>
                          <span className="truncate text-zinc-400">{finding.filePath}</span>
                          {finding.lineRange && (
                            <span className="text-zinc-500">:{finding.lineRange}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {finding.isPqcRelated && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          PQC Target
                        </span>
                      )}

                      {/* Individual Fix Button */}
                      {!isResolved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFixSingleFinding(finding.id);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Fix</span>
                        </button>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/90 p-4 space-y-4 bg-zinc-950/80 text-xs rounded-b-xl">
                      {/* Description & Aikido Reachability Graph Reason */}
                      <div className="space-y-2">
                        <p className="text-zinc-300 leading-relaxed">
                          {finding.description}
                        </p>

                        {finding.autoTriageReason && (
                          <div className="p-3 rounded-lg border border-indigo-900/40 bg-indigo-950/20 text-indigo-300 text-xs flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-semibold text-zinc-200">
                                Aikido Reachability Engine Insight:
                              </span>
                              <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                                {finding.autoTriageReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Code Snippet if present */}
                      {finding.affectedCodeSnippet && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-300 flex items-center gap-1">
                              <Code className="w-3.5 h-3.5 text-rose-400" />
                              Original Vulnerable Code:
                            </span>
                            <span className="font-mono text-zinc-500">{finding.filePath}</span>
                          </div>
                          <pre className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-[11px] text-zinc-200 overflow-x-auto leading-relaxed">
                            <code>{finding.affectedCodeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Remediation Patch & Unified Git Diff Viewer */}
                      {finding.remediationPatch && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedPatchId(
                                  isPatchExpanded ? null : finding.id
                                )
                              }
                              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>
                                {isPatchExpanded ? 'Hide' : 'View'} Automated Remediation Patch & Diff
                              </span>
                            </button>
                            {isResolved && (
                              <span className="text-[11px] font-mono text-emerald-400">
                                ✓ Applied and Verified
                              </span>
                            )}
                          </div>

                          {isPatchExpanded && (
                            <div className="p-3.5 rounded-lg border border-emerald-900/60 bg-zinc-900 space-y-2">
                              <div className="text-[11px] text-zinc-300">
                                <strong>Resolution Notes:</strong> {finding.remediationPatch.resolutionNotes}
                              </div>
                              <pre className="p-3 rounded bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto leading-relaxed whitespace-pre">
                                <code>{finding.remediationPatch.diff}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Remediation summary */}
                      <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-1">
                        <span className="font-semibold text-zinc-200 text-xs">
                          Remediation Target:
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {finding.remediationSummary}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-850">
                        {/* Bridge to PQC Pipeline CTA */}
                        {finding.isPqcRelated && finding.affectedCodeSnippet && onRemediateInPqcPipeline ? (
                          <button
                            onClick={() =>
                              onRemediateInPqcPipeline(
                                finding.affectedCodeSnippet!,
                                finding.title
                              )
                            }
                            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Remediate in PQC Migration Pipeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="text-[11px] text-zinc-500 font-mono">
                            CWE: {finding.cweId || 'N/A'} · Introduced: {finding.introducedDate}
                          </div>
                        )}

                        {/* Triage Status & Fix Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isResolved && (
                            <button
                              onClick={() => handleFixSingleFinding(finding.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Wand2 className="w-3 h-3" />
                              <span>Apply Fix</span>
                            </button>
                          )}

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-zinc-500 mr-1">Status:</span>
                            {(['OPEN', 'IN_TRIAGE', 'RESOLVED', 'IGNORED'] as FindingStatus[]).map(
                              (st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateStatus(finding.id, st)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                                    finding.status === st
                                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                                      : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
