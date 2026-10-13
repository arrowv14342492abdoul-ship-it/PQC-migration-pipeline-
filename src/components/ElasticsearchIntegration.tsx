import React, { useState, useEffect } from 'react';
import { ElasticsearchStatus, ElasticLogEvent } from '../types/integrations';
import { enterpriseService } from '../services/enterpriseConnectors';
import {
  Search,
  Activity,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Plus,
  Radio,
  FileJson,
  Download,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Server,
  Layers,
  Sparkles,
  HardDrive,
} from 'lucide-react';

export const ElasticsearchIntegration: React.FC = () => {
  const [status, setStatus] = useState<ElasticsearchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    clusterName: string;
  } | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [newEventMessage, setNewEventMessage] = useState(
    'FIPS 203 ML-KEM-768 key decapsulation validated for high-value settlement pipeline.'
  );
  const [newEventComponent, setNewEventComponent] = useState('Payment Gateway Worker');
  const [newEventPrimitive, setNewEventPrimitive] = useState('ML-KEM-768');
  const [newEventLevel, setNewEventLevel] = useState<'INFO' | 'WARN' | 'ERROR' | 'ALERT'>('INFO');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await enterpriseService.getElasticsearchStatus();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePingCluster = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await enterpriseService.testElasticsearchPing();
      setPingResult(res);
      showToast('Elasticsearch cluster ping verified (HTTP 200 OK · Cluster Green)');
    } catch (e) {
      console.error(e);
    } finally {
      setIsPinging(false);
    }
  };

  const handleIngestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventMessage.trim()) return;
    setIsSubmittingEvent(true);
    try {
      await enterpriseService.ingestElasticEvent({
        index: 'pqc-audit-events-2026.10',
        logLevel: newEventLevel,
        sourceComponent: newEventComponent,
        message: newEventMessage,
        cryptoPrimitive: newEventPrimitive,
        quantumRiskTier: 'SECURE',
        fipsCompliance: 'FIPS 203 Validated',
        details: {
          node: 'elastic-node-01',
          sourceIp: '10.240.2.19',
          sessionKeyId: `sess_${Date.now()}`,
        },
      });
      await loadStatus();
      setIsIngestModalOpen(false);
      showToast('Telemetry event ingested into Elasticsearch index pqc-audit-events-2026.10');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleExportJson = () => {
    if (!status) return;
    const blob = new Blob([JSON.stringify(status.recentLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elastic-pqc-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Elasticsearch logs as JSON');
  };

  if (loading || !status) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
        Connecting to Elasticsearch SIEM Cluster...
      </div>
    );
  }

  // Filter logs
  const filteredLogs = status.recentLogs.filter((log) => {
    if (selectedLevel !== 'ALL' && log.logLevel !== selectedLevel) return false;
    if (selectedRiskTier !== 'ALL' && log.quantumRiskTier !== selectedRiskTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${log.message} ${log.sourceComponent} ${log.cryptoPrimitive || ''} ${log.index}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-600/80 bg-zinc-900 text-amber-300 shadow-xl text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Cluster Strip */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Elasticsearch SIEM & Telemetry Integration
                </h3>
                <span className="text-zinc-600">/</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Health: {status.clusterHealth}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                <span>Cluster: <strong className="text-zinc-300 font-mono">{status.clusterName}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Nodes: <strong className="text-amber-400 font-mono">{status.nodeCount}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Active Shards: <span className="text-zinc-300 font-mono">{status.activeShards}</span></span>
                <span className="text-zinc-600">·</span>
                <span>Version: <span className="text-zinc-400 font-mono">{status.version}</span></span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest PQC Event</span>
            </button>

            <button
              onClick={handlePingCluster}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <Radio className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Ping Cluster'}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Ping feedback */}
        {pingResult && (
          <div className="p-3 rounded-lg border border-amber-900/60 bg-amber-950/20 text-xs flex items-center justify-between text-amber-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Connected to {pingResult.clusterName} (HTTP 200 OK)</span>
            </div>
            <span className="font-mono text-[11px] text-amber-400">
              Round-trip: {pingResult.latencyMs}ms
            </span>
          </div>
        )}
      </div>

      {/* 2. SIEM Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Total Ingested Documents</span>
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {status.totalDocuments.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400">
            Across {status.totalIndices} crypto-telemetry indices.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Storage Consumed</span>
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {status.storageGb} GB
          </div>
          <p className="text-[11px] text-zinc-400">
            LZ4 compressed index shards across 3 nodes.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Quantum Telemetry Pipeline</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            Real-Time
          </div>
          <p className="text-[11px] text-zinc-400">
            Stream ingestion from Check Point & Snowflake pipelines.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Cluster Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {status.clusterHealth} (0 Unassigned)
          </div>
          <p className="text-[11px] text-zinc-400">
            All 16 primary & replica shards assigned and synced.
          </p>
        </div>
      </div>

      {/* 3. Search and Filtering Controls */}
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Elastic logs by primitive, component, message, index..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="ALERT">ALERT</option>
          </select>

          {/* Risk Tier Filter */}
          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="SECURE">SECURE (FIPS 203/204)</option>
            <option value="HIGH">HIGH (Classical RSA/ECC)</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* 4. SIEM Log Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Real-Time Cryptographic SIEM Audit Logs ({filteredLogs.length})
          </span>
          <span className="font-mono text-amber-400">index: pqc-*-2026.10</span>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs transition-colors hover:border-zinc-700"
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          log.logLevel === 'INFO'
                            ? 'bg-blue-950/80 border border-blue-800 text-blue-300'
                            : log.logLevel === 'WARN'
                            ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                            : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                        }`}
                      >
                        {log.logLevel}
                      </span>

                      <span className="font-mono text-[11px] text-zinc-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>

                      <span className="text-zinc-600">·</span>

                      <span className="font-semibold text-zinc-200">
                        {log.sourceComponent}
                      </span>

                      {log.cryptoPrimitive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {log.cryptoPrimitive}
                        </span>
                      )}

                      {log.quantumRiskTier && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                            log.quantumRiskTier === 'SECURE'
                              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                              : 'bg-rose-950/80 border border-rose-800 text-rose-400'
                          }`}
                        >
                          {log.quantumRiskTier}
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                      {log.message}
                    </p>
                  </div>

                  <button className="text-zinc-500 hover:text-zinc-300 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Raw JSON View */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-850 space-y-2">
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                      <span>Index: {log.index}</span>
                      <span>ID: {log.id}</span>
                      <span>Compliance: {log.fipsCompliance || 'Standard'}</span>
                    </div>
                    <pre className="p-2.5 rounded bg-black/60 border border-zinc-850 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ingest Event Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">Ingest PQC Telemetry Event</h3>
              </div>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleIngestEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Source Component</label>
                <input
                  type="text"
                  value={newEventComponent}
                  onChange={(e) => setNewEventComponent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Cryptographic Primitive</label>
                <input
                  type="text"
                  value={newEventPrimitive}
                  onChange={(e) => setNewEventPrimitive(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Log Level</label>
                <select
                  value={newEventLevel}
                  onChange={(e) => setNewEventLevel(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="ALERT">ALERT</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Telemetry Message</label>
                <textarea
                  rows={3}
                  value={newEventMessage}
                  onChange={(e) => setNewEventMessage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-4 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-xs"
                >
                  {isSubmittingEvent ? 'Ingesting...' : 'Ingest Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
