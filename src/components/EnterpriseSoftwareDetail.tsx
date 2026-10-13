import React, { useState, useEffect } from 'react';
import { EnterpriseConnectorStatus } from '../types/integrations';
import { enterpriseService } from '../services/enterpriseConnectors';
import {
  Shield,
  Key,
  Lock,
  Cloud,
  FileCheck2,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  Check,
  Send,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EnterpriseSoftwareDetailProps {
  connectorId: string;
  onBackToCatalog?: () => void;
}

export const EnterpriseSoftwareDetail: React.FC<EnterpriseSoftwareDetailProps> = ({
  connectorId,
  onBackToCatalog,
}) => {
  const [status, setStatus] = useState<EnterpriseConnectorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'sandbox' | 'logs'>('inventory');
  const [testingConnection, setTestingConnection] = useState(false);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>('');
  const [sandboxMethod, setSandboxMethod] = useState<'GET' | 'POST'>('POST');
  const [sandboxPayload, setSandboxPayload] = useState<string>('');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [runningSandbox, setRunningSandbox] = useState(false);

  useEffect(() => {
    loadConnector();
  }, [connectorId]);

  const loadConnector = async () => {
    setLoading(true);
    try {
      const data = await enterpriseService.getConnectorStatus(connectorId);
      setStatus(data);
      if (data) {
        initSandboxPresets(data.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const initSandboxPresets = (id: string) => {
    switch (id) {
      case 'hashicorp-vault':
        setSandboxEndpoint('/v1/transit/encrypt/pqc-transit-db-kek');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              plaintext: 'ZXhhbXBsZS1zZWNyZXQtZGF0YWJhc2UtcGFzc3dvcmQ=',
              kem_algorithm: 'ML-KEM-768',
              envelope: 'AES-256-GCM',
            },
            null,
            2
          )
        );
        break;
      case 'thales-luna':
        setSandboxEndpoint('/api/v3/pkcs11/slot/0/sign');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              mechanism: 'CKM_ML_DSA_87_SIGN',
              data_hash_sha3_512: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
              key_handle: '0x0001004a',
            },
            null,
            2
          )
        );
        break;
      case 'venafi-clm':
        setSandboxEndpoint('/vedauth/certificates/request');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              policyDN: '\\VED\\Policy\\Certificates\\PQC_Hybrid',
              commonName: 'api.enterprise.corp',
              keyAlgorithm: 'Dual-Signature (RSA-4096 + ML-DSA-87)',
              validityDays: 365,
            },
            null,
            2
          )
        );
        break;
      case 'digicert-one':
        setSandboxEndpoint('/mpki/api/v2/certificate/order');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              certificate_type: 'pqc_composite_tls',
              ca_cert_id: 'digicert-global-quantum-root-g1',
              csr: '-----BEGIN QUANTUM CERTIFICATE REQUEST-----\nMIIB...[ML-DSA-65]...==\n-----END CERTIFICATE REQUEST-----',
            },
            null,
            2
          )
        );
        break;
      case 'cloudflare-one':
        setSandboxEndpoint('/client/v4/zones/zone-id/ssl/post_quantum_tls');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              enabled: true,
              mode: 'strict_pqc_kyber768',
              block_legacy_tls_downgrades: true,
              hndl_shield: true,
            },
            null,
            2
          )
        );
        break;
      case 'okta-workforce':
        setSandboxEndpoint('/api/v1/trustedOrigins/pqc-assertion');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              client_id: 'okta_pqc_client_891a',
              id_token_algorithm: 'ML-DSA-65',
              passkey_enforcement: 'WEBAUTHN_LATTICE_REQUIRED',
            },
            null,
            2
          )
        );
        break;
      case 'cyberark-pam':
        setSandboxEndpoint('/PasswordVault/API/Accounts/Account-1094/Checkout');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              Reason: 'Production DB maintenance with ML-KEM SSH key wrap',
              TicketingSystemName: 'Jira-SecOps-440',
              KeyExchange: 'ML-KEM-1024',
            },
            null,
            2
          )
        );
        break;
      case 'palo-alto-prisma':
        setSandboxEndpoint('/api/v1/compliance/cbom/generate');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              cloud_providers: ['aws', 'gcp', 'azure'],
              format: 'cyclonedx_1.6_cbom_json',
              pqc_standard: 'NIST_FIPS_203_204',
            },
            null,
            2
          )
        );
        break;
      case 'wiz-cloud':
        setSandboxEndpoint('/graphql');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              query: `query CryptographicBlastRadius {
  securityGraph(filter: { cryptoType: "CLASSICAL_RSA" }) {
    nodes { id name vulnerabilityTier blastRadius }
  }
}`,
            },
            null,
            2
          )
        );
        break;
      case 'crowdstrike-falcon':
        setSandboxEndpoint('/sensors/entities/containment/v1');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              action: 'lift_or_contain',
              device_id: 'sensor-us-east-01',
              trigger_reason: 'MITRE T1048 Bulk encrypted exfiltration telemetry anomaly',
            },
            null,
            2
          )
        );
        break;
      case 'splunk-es':
        setSandboxEndpoint('/services/collector/event');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              index: 'crypto_audit',
              sourcetype: 'cim:cryptographic_handshake',
              event: {
                client_ip: '10.200.4.15',
                cipher_negotiated: 'TLS_AES_256_GCM_SHA384',
                kem_algorithm: 'ML-KEM-768',
                quantum_compliant: true,
              },
            },
            null,
            2
          )
        );
        break;
      case 'snyk-appsec':
        setSandboxEndpoint('/v1/org/crypto-migration/project/scan');
        setSandboxMethod('POST');
        setSandboxPayload(
          JSON.stringify(
            {
              repo: 'payment-service-core',
              scan_type: 'cbom_dependency_audit',
              auto_fix_target: 'liboqs_0.10.0',
            },
            null,
            2
          )
        );
        break;
      default:
        setSandboxEndpoint('/api/v1/pqc/status');
        setSandboxMethod('GET');
        setSandboxPayload('{}');
    }
  };

  const handleTestConnection = async () => {
    if (!status) return;
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await enterpriseService.testConnectorConnection(status.id);
      setTestResult(res);
      showToast(`${status.name} connection test succeeded (${res.latencyMs}ms).`);
      setTimeout(() => setTestResult(null), 5000);
    } catch (e: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: e?.message || 'Connection failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleExecuteAction = async (actionType: string) => {
    if (!status) return;
    setExecutingAction(actionType);
    try {
      const res = await enterpriseService.executeConnectorAction(status.id, actionType);
      setStatus(res.updatedStatus);
      showToast(res.message);
    } catch (e: any) {
      showToast(`Action failed: ${e?.message}`);
    } finally {
      setExecutingAction(null);
    }
  };

  const handleRunSandbox = async () => {
    setRunningSandbox(true);
    setSandboxResponse(null);
    await new Promise((r) => setTimeout(r, 650));

    let mockResp: any = {
      status: 200,
      statusText: 'OK',
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': 'application/json',
        'x-pqc-cipher-suite': status?.pqcAlgorithm || 'ML-KEM-768',
        'x-fips-validation': status?.nistStandard || 'NIST FIPS 203',
        'server': status?.vendor || 'Enterprise Security Server',
      },
      data: {
        operation: 'SUCCESS',
        verified: true,
        quantum_resistance: '128_BIT_GROVER_RESILIENT',
        execution_time_ms: Math.floor(Math.random() * 25) + 8,
      },
    };

    if (status?.id === 'hashicorp-vault') {
      mockResp.data.ciphertext = 'vault:v1:pqc_kem768:4a8f9c1b2d0e...[2400 bytes ciphertext]';
      mockResp.data.wrapped_dek = 'aes256_gcm_dek_fips203_encapsulated';
    } else if (status?.id === 'thales-luna') {
      mockResp.data.hardware_signature = '0x9fa4b01...[4627 bytes ML-DSA-87 signature]';
      mockResp.data.fips_140_3_hsm_state = 'TAMPER_PROOF_SECURE';
    } else if (status?.id === 'venafi-clm') {
      mockResp.data.issued_certificate_serial = '49:2a:8f:10:bc:91:de:00';
      mockResp.data.dual_signatures = ['sha256WithRSAEncryption', 'ml-dsa-87'];
    } else if (status?.id === 'digicert-one') {
      mockResp.data.order_id = 'ORD-2026-DIGICERT-PQC-9941';
      mockResp.data.certificate_chain = 'Root G1 -> Intermediate Sub-CA -> Issued TLS Cert';
    } else if (status?.id === 'cloudflare-one') {
      mockResp.data.edge_pops_updated = 330;
      mockResp.data.handshake_mode = 'X25519_MLKEM768_DRAFT00';
    } else if (status?.id === 'okta-workforce') {
      mockResp.data.assertion_jws = 'eyJhbGciOiJNTC1EU0EtNjUiLCJ0eXAiOiJKV1QifQ...';
      mockResp.data.claims = { sub: 'arrowv14342492abdoul@gmail.com', pqc_mfa: true };
    } else if (status?.id === 'palo-alto-prisma') {
      mockResp.data.cbom_assets_cataloged = 14800;
      mockResp.data.cyclonedx_version = '1.6';
    }

    setSandboxResponse(JSON.stringify(mockResp, null, 2));
    setRunningSandbox(false);
    showToast(`Sandbox executed: 200 OK (${mockResp.data.execution_time_ms}ms)`);
  };

  if (loading || !status) {
    return (
      <div className="p-12 text-center text-zinc-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
        <p className="text-sm">Loading enterprise integration profile...</p>
      </div>
    );
  }

  // Define primary and secondary actions based on connector id
  const getActionConfig = (id: string) => {
    switch (id) {
      case 'hashicorp-vault':
        return {
          primaryLabel: 'Rotate Transit KEK (ML-KEM)',
          primaryAction: 'rotate_key',
          primaryIcon: RotateCw,
          secondaryLabel: 'Encrypt Transit Test Payload',
          secondaryAction: 'encrypt_transit',
          secondaryIcon: Lock,
        };
      case 'thales-luna':
        return {
          primaryLabel: 'Hardware ML-DSA-87 Sign',
          primaryAction: 'sign_hash',
          primaryIcon: Shield,
          secondaryLabel: 'Generate Hardware Keypair',
          secondaryAction: 'gen_keypair',
          secondaryIcon: Key,
        };
      case 'venafi-clm':
        return {
          primaryLabel: 'Issue Dual-Sign Hybrid Cert',
          primaryAction: 'issue_hybrid',
          primaryIcon: FileCheck2,
          secondaryLabel: 'Run Machine Discovery Scan',
          secondaryAction: 'discover',
          secondaryIcon: Search,
        };
      case 'digicert-one':
        return {
          primaryLabel: 'Issue Quantum Sub-CA Chain',
          primaryAction: 'issue_subca',
          primaryIcon: Key,
          secondaryLabel: 'Validate OCSP Responder',
          secondaryAction: 'check_ocsp',
          secondaryIcon: Check,
        };
      case 'cloudflare-one':
        return {
          primaryLabel: 'Enforce Strict Edge PQC',
          primaryAction: 'strict_pqc',
          primaryIcon: Shield,
          secondaryLabel: 'Simulate HNDL Shield Test',
          secondaryAction: 'simulate_hndl',
          secondaryIcon: Zap,
        };
      case 'okta-workforce':
        return {
          primaryLabel: 'Rotate OIDC Signer (ML-DSA)',
          primaryAction: 'rotate_oidc',
          primaryIcon: RotateCw,
          secondaryLabel: 'Enforce FIDO2 Lattice MFA',
          secondaryAction: 'enforce_mfa',
          secondaryIcon: Lock,
        };
      case 'cyberark-pam':
        return {
          primaryLabel: 'Checkout Quantum SSH Session',
          primaryAction: 'checkout_session',
          primaryIcon: Key,
          secondaryLabel: 'Rotate Vaulted SSH Keys',
          secondaryAction: 'rotate_ssh',
          secondaryIcon: RotateCw,
        };
      case 'palo-alto-prisma':
        return {
          primaryLabel: 'Auto-Remediate Ingress Listener',
          primaryAction: 'remediate',
          primaryIcon: CheckCircle2,
          secondaryLabel: 'Run Multi-Cloud CSPM Scan',
          secondaryAction: 'run_scan',
          secondaryIcon: Search,
        };
      case 'wiz-cloud':
        return {
          primaryLabel: 'Remediate Blast Radius Node',
          primaryAction: 'remediate_blast',
          primaryIcon: Shield,
          secondaryLabel: 'Query Security Graph',
          secondaryAction: 'run_graph',
          secondaryIcon: Activity,
        };
      case 'crowdstrike-falcon':
        return {
          primaryLabel: 'Falcon Host Containment',
          primaryAction: 'isolate',
          primaryIcon: Shield,
          secondaryLabel: 'Stream eBPF Threat Audit',
          secondaryAction: 'stream_audit',
          secondaryIcon: Activity,
        };
      case 'splunk-es':
        return {
          primaryLabel: 'Execute SOAR PQC Playbook',
          primaryAction: 'run_playbook',
          primaryIcon: Play,
          secondaryLabel: 'Ingest Batch HEC Events',
          secondaryAction: 'ingest_hec',
          secondaryIcon: Send,
        };
      case 'snyk-appsec':
        return {
          primaryLabel: 'Create GitHub PR (liboqs)',
          primaryAction: 'create_pr',
          primaryIcon: Sparkles,
          secondaryLabel: 'Run CBOM Dependency Scan',
          secondaryAction: 'scan_cbom',
          secondaryIcon: Search,
        };
      default:
        return {
          primaryLabel: 'Synchronize Cryptography',
          primaryAction: 'sync',
          primaryIcon: RefreshCw,
          secondaryLabel: 'Audit Security Hooks',
          secondaryAction: 'audit',
          secondaryIcon: Shield,
        };
    }
  };

  const actionConfig = getActionConfig(status.id);
  const PrimaryIcon = actionConfig.primaryIcon;
  const SecondaryIcon = actionConfig.secondaryIcon;

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-600/80 bg-zinc-900 text-emerald-300 shadow-xl text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Card with Live Status & Controls */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                  {status.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-900 text-zinc-300">
                  {status.vendor}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-purple-800/80 bg-purple-950/40 text-purple-300">
                  {status.category}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono mt-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status.health === 'HEALTHY'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-zinc-300">{status.endpoint}</span>
                </span>
                <span>·</span>
                <span>Version: {status.version}</span>
                <span>·</span>
                <span className="text-emerald-400">{status.latencyMs}ms Latency</span>
              </div>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onBackToCatalog && (
              <button
                onClick={onBackToCatalog}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Catalog View
              </button>
            )}

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-zinc-400 ${
                  testingConnection ? 'animate-spin' : ''
                }`}
              />
              <span>{testingConnection ? 'Pinging...' : 'Test TLS Link'}</span>
            </button>

            <button
              onClick={() => handleExecuteAction(actionConfig.secondaryAction)}
              disabled={executingAction !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <SecondaryIcon
                className={`w-3.5 h-3.5 text-cyan-400 ${
                  executingAction === actionConfig.secondaryAction
                    ? 'animate-spin'
                    : ''
                }`}
              />
              <span>{actionConfig.secondaryLabel}</span>
            </button>

            <button
              onClick={() => handleExecuteAction(actionConfig.primaryAction)}
              disabled={executingAction !== null}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <PrimaryIcon
                className={`w-3.5 h-3.5 text-emerald-400 ${
                  executingAction === actionConfig.primaryAction
                    ? 'animate-spin'
                    : ''
                }`}
              />
              <span>{actionConfig.primaryLabel}</span>
            </button>
          </div>
        </div>

        {/* Live Test Connection Result Notification */}
        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              testResult.success
                ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                : 'border-red-800/80 bg-red-950/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">{testResult.message}</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300">
              {testResult.latencyMs} ms
            </span>
          </div>
        )}

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-900">
          {Object.entries(status.metrics).map(([label, val]) => (
            <div
              key={label}
              className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/40 space-y-1"
            >
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                {label}
              </span>
              <div className="text-sm font-bold text-zinc-100 font-mono truncate">
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sub-Navigation Switcher (Inventory, Sandbox, Logs) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Cryptographic Inventory & Policies ({status.items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'sandbox'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive REST / Hook Sandbox</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Cryptographic Audit Trail ({status.auditLogs.length})</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content Views */}

      {/* VIEW A: Cryptographic Inventory */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Managed Cryptographic Primitives & Assets
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Real-time status of post-quantum and hybrid algorithms deployed across {status.name}.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                {status.nistStandard}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {status.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/60 hover:border-zinc-750 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold font-mono text-zinc-100 flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'PROTECTED'
                              ? 'bg-emerald-400'
                              : item.status === 'FLAGGED'
                              ? 'bg-red-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        {item.title}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{item.meta}</span>
                    <span
                      className={`font-semibold ${
                        item.status === 'PROTECTED'
                          ? 'text-emerald-400'
                          : item.status === 'FLAGGED'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: Interactive Sandbox */}
      {activeSubTab === 'sandbox' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Interactive API & Hook Simulator
              </h4>
              <p className="text-[11px] text-zinc-400">
                Execute live simulated requests against {status.name} to test post-quantum token issuance, key wrapping, and telemetry.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => initSandboxPresets(status.id)}
                className="px-2.5 py-1 rounded text-[11px] font-mono border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 transition-all cursor-pointer"
              >
                Reset Preset
              </button>
            </div>
          </div>

          {/* Request URL Input */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 text-cyan-300 font-mono text-xs font-bold">
              {sandboxMethod}
            </span>
            <input
              type="text"
              value={sandboxEndpoint}
              onChange={(e) => setSandboxEndpoint(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
              placeholder="/v1/endpoint"
            />
            <button
              onClick={handleRunSandbox}
              disabled={runningSandbox}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{runningSandbox ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Payload Editor and Live Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-400">
                Request JSON Payload
              </span>
              <textarea
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                rows={10}
                className="w-full p-3 rounded-lg border border-zinc-850 bg-zinc-900 text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  Response (HTTP 200 OK)
                </span>
                {sandboxResponse && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    Verified FIPS 203/204
                  </span>
                )}
              </div>
              <div className="w-full h-[216px] overflow-auto p-3 rounded-lg border border-zinc-850 bg-zinc-900 text-emerald-400 font-mono text-xs leading-relaxed">
                {sandboxResponse ? (
                  <pre>{sandboxResponse}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-center">
                    Click "Send Request" to invoke API hook.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: Live Cryptographic Audit Trail */}
      {activeSubTab === 'logs' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Cryptographic Audit Trail
              </h4>
              <p className="text-[11px] text-zinc-400">
                Real-time cryptographic operations logged by {status.name}.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              Streaming Active
            </span>
          </div>

          <div className="space-y-2">
            {status.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[10px]">{log.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.level === 'SUCCESS'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : log.level === 'ALERT'
                        ? 'bg-red-950/80 text-red-400 border border-red-800'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-zinc-200 text-[11px]">{log.event}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-purple-300 shrink-0 self-start sm:self-auto">
                  {log.primitive}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
