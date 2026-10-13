import React, { useState, useEffect } from 'react';
import { SnowflakeStatus, SnowflakeTableAudit } from '../types/integrations';
import { enterpriseService } from '../services/enterpriseConnectors';
import {
  Database,
  ShieldCheck,
  Key,
  Play,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  Terminal,
  FileCode2,
  AlertTriangle,
} from 'lucide-react';

export const SnowflakeIntegration: React.FC = () => {
  const [status, setStatus] = useState<SnowflakeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningQuery, setRunningQuery] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    queryTimeMs: number;
    resultCount: number;
    message: string;
  } | null>(null);
  const [maskingTable, setMaskingTable] = useState<string | null>(null);
  const [rotatingCmk, setRotatingCmk] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SQL Console state
  const [activeQueryPreset, setActiveQueryPreset] = useState<string>(
    'SELECT TABLE_NAME, QUANTUM_SAFE_MARGIN, COLUMN_MASKING_ACTIVE FROM PRODUCTION_VAULT_DB.INFORMATION_SCHEMA.TABLES;'
  );

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await enterpriseService.getSnowflakeStatus();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestQuery = async () => {
    setRunningQuery(true);
    setQueryResult(null);
    try {
      const res = await enterpriseService.testSnowflakeQuery();
      setQueryResult(res);
      showToast('Snowflake query executed successfully with Tri-Secret verification.');
    } catch (e) {
      console.error(e);
    } finally {
      setRunningQuery(false);
    }
  };

  const handleApplyMasking = async (tableName: string) => {
    setMaskingTable(tableName);
    try {
      const updated = await enterpriseService.applySnowflakeQuantumMasking(tableName);
      setStatus(updated);
      showToast(`Dynamic Quantum Masking Policy attached to ${tableName}. Columns secured!`);
    } catch (e) {
      console.error(e);
    } finally {
      setMaskingTable(null);
    }
  };

  const handleRotateCmk = async () => {
    setRotatingCmk(true);
    await new Promise((r) => setTimeout(r, 700));
    if (status) {
      const newKey = `arn:aws:kms:us-east-1:979008636671:key/pqc-aes256-cmk-${Math.random().toString(36).substring(2, 7)}`;
      setStatus({
        ...status,
        cmkKeyArn: newKey,
      });
      showToast('Snowflake Customer-Managed Key (CMK) rotated. Envelope re-encryption initialized.');
    }
    setRotatingCmk(false);
  };

  if (loading || !status) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
        Connecting to Snowflake Cloud Data Warehouse API...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cyan-600/80 bg-zinc-900 text-cyan-300 shadow-xl text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Warehouse Connector Strip */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Snowflake Cloud Data Warehouse Integration
                </h3>
                <span className="text-zinc-600">/</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950/60 border border-cyan-800/80 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Tri-Secret Secure Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                <span>Account: <strong className="text-zinc-300 font-mono">{status.account}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Warehouse: <strong className="text-cyan-400 font-mono">{status.warehouse}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Database: <strong className="text-zinc-300 font-mono">{status.database}</strong></span>
                <span className="text-zinc-600">·</span>
                <span>Role: <span className="text-zinc-400 font-mono">{status.role}</span></span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestQuery}
              disabled={runningQuery}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 ${runningQuery ? 'animate-spin' : ''}`} />
              <span>{runningQuery ? 'Executing SQL...' : 'Run Quantum Query Benchmark'}</span>
            </button>

            <button
              onClick={handleRotateCmk}
              disabled={rotatingCmk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-750 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{rotatingCmk ? 'Rotating CMK...' : 'Rotate Tri-Secret Key'}</span>
            </button>
          </div>
        </div>

        {/* Customer Managed Key ARN Strip */}
        <div className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-zinc-300">Customer Managed Key (CMK):</span>
            <span className="font-mono text-[11px] text-cyan-300 truncate max-w-md">{status.cmkKeyArn}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded shrink-0">
            AES-256 Envelope (Grover 128-bit Margin)
          </span>
        </div>

        {/* Live Query Benchmark Output */}
        {queryResult && (
          <div className="p-3 rounded-lg border border-cyan-900/60 bg-cyan-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-cyan-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{queryResult.message}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-cyan-400 shrink-0">
              <span>Latency: <strong>{queryResult.queryTimeMs}ms</strong></span>
              <span>Scanned: <strong>{queryResult.resultCount.toLocaleString()} rows</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Snowflake Cryptographic Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Quantum-Compliant Tables</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {status.metrics.quantumCompliantTables} / {status.metrics.totalTables}
          </div>
          <p className="text-[11px] text-zinc-400">
            Protected with Tri-Secret AES-256 and resilient against Grover search.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Active Masking Policies</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {status.metrics.activeMaskingPolicies}
          </div>
          <p className="text-[11px] text-zinc-400">
            Dynamic PQC ciphertext & token redacting for unprivileged roles.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Avg Query Latency</span>
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {status.metrics.avgQueryLatencyMs}ms
          </div>
          <p className="text-[11px] text-zinc-400">
            Zero overhead from Tri-Secret hardware acceleration blocks.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Encryption Standard</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            FIPS 197
          </div>
          <p className="text-[11px] text-zinc-400">
            NIST approved AES-256-GCM authenticated envelope encryption.
          </p>
        </div>
      </div>

      {/* 3. Interactive SQL Preset Runner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-zinc-200">Snowflake Quantum-Safe SQL Console</span>
          </div>
          <span className="font-mono text-zinc-500">SnowSQL v2.4</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'SELECT TABLE_NAME, QUANTUM_SAFE_MARGIN, COLUMN_MASKING_ACTIVE FROM PRODUCTION_VAULT_DB.INFORMATION_SCHEMA.TABLES;',
            'SHOW ENCRYPTION STATUS IN PRODUCTION_VAULT_DB;',
            'CREATE OR REPLACE MASKING POLICY pqc_ciphertext_mask AS (val string) -> string;',
          ].map((sql, idx) => (
            <button
              key={idx}
              onClick={() => setActiveQueryPreset(sql)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors text-left truncate max-w-md cursor-pointer ${
                activeQueryPreset === sql
                  ? 'bg-cyan-950/80 border border-cyan-700 text-cyan-300'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sql}
            </button>
          ))}
        </div>

        <div className="p-3 rounded-lg border border-zinc-850 bg-black/60 font-mono text-xs text-zinc-300 flex items-center justify-between">
          <span className="text-cyan-300 truncate">{activeQueryPreset}</span>
          <button
            onClick={handleTestQuery}
            disabled={runningQuery}
            className="ml-3 shrink-0 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-[11px] cursor-pointer"
          >
            Run
          </button>
        </div>
      </div>

      {/* 4. Table Security & Cryptographic Audit Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Vault Tables & Quantum Column Masking Inventory ({status.tables.length})
          </span>
          <span className="font-mono text-cyan-400">PRODUCTION_VAULT_DB Schema</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3.5 font-medium">Table & Schema</th>
                <th className="py-2.5 px-3.5 font-medium">Volume</th>
                <th className="py-2.5 px-3.5 font-medium">Encryption & Quantum Margin</th>
                <th className="py-2.5 px-3.5 font-medium">Dynamic Column Masking</th>
                <th className="py-2.5 px-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {status.tables.map((t) => (
                <tr key={t.table} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-zinc-100 font-mono">{t.table}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{t.database}.{t.schema}</div>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-zinc-300">
                    <div>{t.rowCount.toLocaleString()} rows</div>
                    <div className="text-[11px] text-zinc-500">{t.sizeMb} MB</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-zinc-200 font-medium">{t.encryptionType}</span>
                    </div>
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                        t.quantumSafeMargin === '128_BIT_GROVER_RESILIENT'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                          : 'bg-rose-950/80 border border-rose-800 text-rose-400'
                      }`}
                    >
                      {t.quantumSafeMargin === '128_BIT_GROVER_RESILIENT'
                        ? '128-bit Grover Resilient'
                        : 'Vulnerable to Quantum Re-identification'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    {t.columnMaskingActive ? (
                      <div>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                          Active ({t.maskedColumns.length} cols)
                        </span>
                        <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate max-w-xs">
                          {t.maskedColumns.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-mono text-[11px]">Unmasked</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {!t.columnMaskingActive ? (
                      <button
                        onClick={() => handleApplyMasking(t.table)}
                        disabled={maskingTable === t.table}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors cursor-pointer"
                      >
                        {maskingTable === t.table ? 'Applying...' : 'Apply Masking'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Secured
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
