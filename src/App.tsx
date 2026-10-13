/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SAMPLE_PRESETS } from './data/presets';
import { INITIAL_PRESET_RESULT } from './data/initialResult';
import {
  PipelineResult,
  PipelineStep,
  PipelineOptions,
  SavedProject,
} from './types/pqc';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { PipelineStepper } from './components/PipelineStepper';
import { CodeInputSection } from './components/CodeInputSection';
import { AgentView } from './components/AgentView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { SavedProjectsDrawer } from './components/SavedProjectsDrawer';
import { SecurityIntegrations } from './components/SecurityIntegrations';
import { EnterpriseIntegrations } from './components/EnterpriseIntegrations';
import { BankingTab } from './components/BankingTab';
import { CreditCardsTab } from './components/CreditCardsTab';
import { OTZeroTrustTab } from './components/ot/OTZeroTrustTab';
import { DefenseTab } from './components/defense/DefenseTab';
import { WarTab } from './components/war/WarTab';
import { SecurityFrameworksTab } from './components/security/SecurityFrameworksTab';
import { QuantumThreatModelTab } from './components/threat/QuantumThreatModelTab';
import { WhiteRabbitNeoIntegration } from './components/whiterabbit/WhiteRabbitNeoIntegration';
import { NSASoftwareTab } from './components/nsa/NSASoftwareTab';
import { GCHQSoftwareTab } from './components/gchq/GCHQSoftwareTab';
import { IsraelCyberTab } from './components/israel/IsraelCyberTab';
import { F22RaptorSimulatorTab } from './components/f22/F22RaptorSimulatorTab';
import { F35LightningSimulatorTab } from './components/f35/F35LightningSimulatorTab';
import { B21RaiderSimulatorTab } from './components/b21/B21RaiderSimulatorTab';
import { KaliLinuxTab } from './components/kali/KaliLinuxTab';
import { IPhone15SimulatorModal } from './components/iphone/IPhone15SimulatorModal';
import { AlertCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<
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
  >('kali-linux');
  const [code, setCode] = useState<string>(SAMPLE_PRESETS[0].code);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SAMPLE_PRESETS[0].id
  );
  const [result, setResult] = useState<PipelineResult | null>(
    INITIAL_PRESET_RESULT
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeRunningStep, setActiveRunningStep] = useState<
    PipelineStep | 'all' | null
  >(null);
  const [currentTab, setCurrentTab] = useState<PipelineStep>('audit');
  const [completedSteps, setCompletedSteps] = useState<
    Record<PipelineStep, boolean>
  >({
    audit: true,
    architect: true,
    implement: true,
  });

  const [options, setOptions] = useState<PipelineOptions>({
    model: 'gemini-3.8-flash',
    nistLevel: 'Level 3 (ML-KEM-768 / ML-DSA-65)',
    library: 'liboqs-python (Open Quantum Safe)',
    hybridMode: 'Dual-KEM Composite (KDF Combiner)',
  });

  // Modals & Drawers state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isIPhoneSimulatorOpen, setIsIPhoneSimulatorOpen] = useState(false);

  // Active saved project tracking
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    'proj_rsa_vault_demo'
  );
  const [activeProjectName, setActiveProjectName] = useState<string | null>(
    'Production Payment Vault: RSA-2048 to ML-KEM-768'
  );
  const [savedCount, setSavedCount] = useState<number>(() => {
    return storageService.getSavedProjects().length;
  });

  const [aikidoGrade, setAikidoGrade] = useState<string>('B');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [aikidoTransferNotice, setAikidoTransferNotice] = useState<string | null>(
    null
  );

  // Global Keyboard Shortcut: Ctrl+S / Cmd+S to Save Project
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setIsSaveModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autosave draft of code into storageService
  useEffect(() => {
    storageService.saveDraft({
      code,
      options,
      result,
    });
  }, [code, options, result]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Run full 3-agent pipeline
  const handleRunFullPipeline = async () => {
    setIsRunning(true);
    setActiveRunningStep('all');
    setErrorMessage(null);
    setCompletedSteps({ audit: false, architect: false, implement: false });

    try {
      const response = await fetch('/api/pqc/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legacyCode: code,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Pipeline failed with status ${response.status}`
        );
      }

      const data: PipelineResult = await response.json();
      setResult(data);
      setCompletedSteps({ audit: true, architect: true, implement: true });
      setCurrentTab('implement'); // Switch to generated code tab on completion
    } catch (err: any) {
      console.error('Error executing pipeline:', err);
      setErrorMessage(
        err?.message || 'An error occurred while orchestrating the PQC agents.'
      );
    } finally {
      setIsRunning(false);
      setActiveRunningStep(null);
    }
  };

  // Run a single agent step
  const handleRunSingleStep = async (step: PipelineStep) => {
    setIsRunning(true);
    setActiveRunningStep(step);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/pqc/run-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          legacyCode: code,
          auditReport: result?.audit,
          architecturePlan: result?.plan,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Step ${step} failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      setResult((prev) => {
        if (!prev) {
          return {
            audit: step === 'audit' ? data.result : '',
            plan: step === 'architect' ? data.result : '',
            code: step === 'implement' ? data.result : '',
            cbom: data.cbom || [],
          };
        }
        return {
          ...prev,
          audit: step === 'audit' ? data.result : prev.audit,
          plan: step === 'architect' ? data.result : prev.plan,
          code: step === 'implement' ? data.result : prev.code,
          cbom: data.cbom || prev.cbom,
        };
      });

      setCompletedSteps((prev) => ({ ...prev, [step]: true }));
      setCurrentTab(step);
    } catch (err: any) {
      console.error(`Error in step ${step}:`, err);
      setErrorMessage(err?.message || `Failed to run ${step} step.`);
    } finally {
      setIsRunning(false);
      setActiveRunningStep(null);
    }
  };

  // Bridge from Aikido Finding directly to PQC Pipeline
  const handleRemediateFromAikido = (
    codeSnippet: string,
    findingTitle: string
  ) => {
    setCode(codeSnippet);
    setSelectedPresetId('');
    setActiveView('pipeline');
    setCurrentTab('audit');
    setAikidoTransferNotice(
      `Vulnerable code from Aikido Security ("${findingTitle}") loaded into the PQC Pipeline. Ready to execute!`
    );
    setTimeout(() => setAikidoTransferNotice(null), 6000);
  };

  // Save project completion handler
  const handleSaveSuccess = (project: SavedProject) => {
    setActiveProjectId(project.id);
    setActiveProjectName(project.name);
    setSavedCount(storageService.getSavedProjects().length);
    showToast(`Saved "${project.name}" to Migration Library!`);
  };

  // Load project from Saved Library Drawer
  const handleLoadProject = (project: SavedProject) => {
    setCode(project.legacyCode);
    setResult(project.result);
    setOptions(project.options);
    setActiveProjectId(project.id);
    setActiveProjectName(project.name);
    setSelectedPresetId('');
    setActiveView('pipeline');
    setCurrentTab(project.result?.code ? 'implement' : 'audit');
    showToast(`Loaded "${project.name}" into workspace.`);
  };

  // Start fresh project
  const handleNewProject = () => {
    const first = SAMPLE_PRESETS[0];
    setCode(first.code);
    setSelectedPresetId(first.id);
    setResult(null);
    setActiveProjectId(null);
    setActiveProjectName(null);
    setCurrentTab('audit');
    setCompletedSteps({ audit: false, architect: false, implement: false });
    showToast('Started new migration project workspace.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 w-full overflow-x-hidden">
      {/* Authoritative Navigation */}
      <Navbar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenIPhoneSimulator={() => setIsIPhoneSimulatorOpen(true)}
        savedCount={savedCount}
        result={result}
        isRunning={isRunning}
        aikidoGrade={aikidoGrade}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 w-full">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg border border-rose-800 bg-rose-950/50 text-rose-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Generic Success / Storage Toast notice */}
        {toastNotice && (
          <div className="p-3.5 rounded-lg border border-emerald-700/80 bg-emerald-950/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastNotice}</span>
            </div>
            <button
              onClick={() => setToastNotice(null)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Transfer from Aikido toast notice */}
        {aikidoTransferNotice && (
          <div className="p-3.5 rounded-lg border border-emerald-700/80 bg-emerald-950/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{aikidoTransferNotice}</span>
            </div>
            <button
              onClick={() => setAikidoTransferNotice(null)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quota Fallback Notification Banner */}
        {result?.fallbackUsed && (
          <div className="p-3.5 rounded-lg border border-amber-800/80 bg-amber-950/30 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-zinc-100">
                  High-Assurance Cryptographic Engine Active:
                </span>{' '}
                <span className="text-zinc-300">
                  {result.fallbackReason ||
                    'Gemini Free-Tier rate limit reached. Synthesized with zero downtime via the built-in FIPS 203/204 rule engine.'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded shrink-0">
              100% Operational
            </span>
          </div>
        )}

        {/* View 1: Aikido Security Integration Dashboard */}
        {activeView === 'aikido' && (
          <SecurityIntegrations
            onRemediateInPqcPipeline={handleRemediateFromAikido}
            onGradeChange={setAikidoGrade}
          />
        )}

        {/* View 2: Enterprise Integrations (Check Point · Snowflake · Elasticsearch) */}
        {activeView === 'enterprise' && <EnterpriseIntegrations />}

        {/* View 3: Banking & Major Financial Institutions */}
        {activeView === 'banking' && <BankingTab />}

        {/* View 4: Executive Credit Cards & Apple Pay (Amex Centurion, Platinum, JP Morgan Reserve, Apple Card) */}
        {activeView === 'creditcards' && <CreditCardsTab />}

        {/* View 5: NSA CSI Operational Technology (OT) Zero Trust Hardening */}
        {activeView === 'ot-zerotrust' && (
          <OTZeroTrustTab
            onLoadOTPresetToPipeline={() => {
              const otPreset = SAMPLE_PRESETS.find(
                (p) => p.id === 'nsa-csi-ot-modbus-signer'
              );
              if (otPreset) {
                setCode(otPreset.code);
                setSelectedPresetId(otPreset.id);
                setActiveView('pipeline');
                setCurrentTab('audit');
                showToast('Loaded NSA CSI OT Modbus / DNP3 preset into PQC Pipeline.');
              }
            }}
          />
        )}

        {/* View 6: Defense Prime Software Ecosystem (Palantir, Lockheed, Northrop, Raytheon, Anduril, etc.) */}
        {activeView === 'defense' && (
          <DefenseTab
            onLoadDefensePresetToPipeline={() => {
              const defensePreset = SAMPLE_PRESETS.find(
                (p) => p.id === 'defense-tactical-oms-signer'
              );
              if (defensePreset) {
                setCode(defensePreset.code);
                setSelectedPresetId(defensePreset.id);
                setActiveView('pipeline');
                setCurrentTab('audit');
                showToast('Loaded Defense Tactical PQC Sensor-to-Shooter preset into Pipeline.');
              }
            }}
          />
        )}

        {/* View 7: Offensive Warfare & Hypersonic Strike Wing (Offensive Weapons, Software Stacks & Cyber Injections) */}
        {activeView === 'war' && (
          <WarTab
            onLoadWarPresetToPipeline={() => {
              const warPreset = SAMPLE_PRESETS.find(
                (p) => p.id === 'war-offensive-hypersonic-pqc-link'
              );
              if (warPreset) {
                setCode(warPreset.code);
                setSelectedPresetId(warPreset.id);
                setActiveView('pipeline');
                setCurrentTab('audit');
                showToast('Loaded Offensive Hypersonic PQC Command Uplink preset into Pipeline.');
              }
            }}
          />
        )}

        {/* View 8: Security Assessment & Methodologies (PTES, NIST 800-115, OWASP, MITRE ATT&CK) */}
        {activeView === 'security-assessment' && (
          <SecurityFrameworksTab
            onLoadDefensivePresetToPipeline={() => {
              const defPreset =
                SAMPLE_PRESETS.find((p) => p.id === 'pqc-defensive-hybrid-tls') ||
                SAMPLE_PRESETS[0];
              if (defPreset) {
                setCode(defPreset.code);
                setSelectedPresetId(defPreset.id);
                setActiveView('pipeline');
                setCurrentTab('audit');
                showToast('Loaded NIST FIPS 203 Post-Quantum Hybrid TLS preset into Pipeline.');
              }
            }}
          />
        )}

        {/* View 9: Automated Quantum Threat Modeling Tool (Gemini API) */}
        {activeView === 'threat-model' && (
          <QuantumThreatModelTab
            onLoadCodeToPipeline={(migratedCode) => {
              setCode(migratedCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('Uploaded source code loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 10: WhiteRabbitNeo Cybersecurity LLM Integration */}
        {activeView === 'whiterabbitneo' && (
          <WhiteRabbitNeoIntegration
            onLoadCodeToPipeline={(patchedCode) => {
              setCode(patchedCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('WhiteRabbitNeo patched code loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 11: NSA Open Source Software Ecosystem (Ghidra, WALKOFF, SIMP, NiFi) */}
        {activeView === 'nsa-software' && (
          <NSASoftwareTab
            onLoadCodeToPipeline={(decompiledCode) => {
              setCode(decompiledCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('NSA Ghidra decompiled C code loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 12: GCHQ Open Source Software Ecosystem (CyberChef, Gaffer, Stroom, Bailo) */}
        {activeView === 'gchq-software' && (
          <GCHQSoftwareTab
            onLoadCodeToPipeline={(decodedPayload) => {
              setCode(decodedPayload);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('GCHQ CyberChef decoded payload loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 13: Israel National Cyber Directorate (INCD / Unit 8200 Ecosystem) */}
        {activeView === 'incd-software' && (
          <IsraelCyberTab
            onLoadCodeToPipeline={(remediationCode) => {
              setCode(remediationCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('INCD CDM 2.0 remediation code loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 14: F-22 Raptor Full Suite Simulator & CIP Avionics Architecture */}
        {activeView === 'f22-raptor' && (
          <F22RaptorSimulatorTab
            onLoadCodeToPipeline={(avionicsCode) => {
              setCode(avionicsCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('F-22 Ada/C++ avionics software loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 15: F-35 Lightning II Full Suite Simulator & ICP Avionics Architecture */}
        {activeView === 'f35' && (
          <F35LightningSimulatorTab
            onLoadCodeToPipeline={(avionicsCode) => {
              setCode(avionicsCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('F-35 C++/Ada avionics software loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 16: B-21 Raider Full Suite Simulator & OMS Architecture */}
        {activeView === 'b21' && (
          <B21RaiderSimulatorTab
            onLoadCodeToPipeline={(avionicsCode) => {
              setCode(avionicsCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('B-21 Raider OMS Ada/Rust avionics software loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 17: Kali Linux 2026.1 Full Suite Integration */}
        {activeView === 'kali-linux' && (
          <KaliLinuxTab
            onLoadCodeToPipeline={(remediationCode) => {
              setCode(remediationCode);
              setActiveView('pipeline');
              setCurrentTab('audit');
              showToast('Kali Linux remediation patch loaded into PQC Migration Pipeline.');
            }}
          />
        )}

        {/* View 5: PQC Migration Pipeline Chain */}
        {activeView === 'pipeline' && (
          <>
            {/* Hero Concept & Status Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Post-Quantum Cryptography Migration Engine
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">
                    CNSA 2.0 & NIST Standardization
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {activeProjectName ? (
                    <span className="text-zinc-200 font-semibold truncate">
                      Project: {activeProjectName}
                    </span>
                  ) : (
                    <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                      Automated 3-agent pipeline analyzing classical RSA and ECC vulnerabilities, generating Cryptographic Bills of Materials (CBOM), designing FIPS 203/204 hybrid roadmaps, and synthesizing liboqs Python modules.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-right">
                  <div className="text-[10px] text-zinc-400">Workspace Status</div>
                  <div className="font-mono text-emerald-400 font-semibold">
                    {activeProjectId ? 'Project Saved' : 'Unsaved Draft'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-right">
                  <div className="text-[10px] text-zinc-400">NIST Standard</div>
                  <div className="font-mono text-zinc-200 font-semibold">FIPS 203 / 204</div>
                </div>
              </div>
            </div>

            {/* 1. Code Input & Presets Section */}
            <CodeInputSection
              code={code}
              setCode={setCode}
              onRunPipeline={handleRunFullPipeline}
              isRunning={isRunning}
              selectedPresetId={selectedPresetId}
              onSelectPreset={setSelectedPresetId}
            />

            {/* 2. Visual 3-Agent Stepper */}
            <PipelineStepper
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              activeRunningStep={activeRunningStep}
              completedSteps={completedSteps}
            />

            {/* 3. Deliverables View for Active Agent */}
            <AgentView
              currentTab={currentTab}
              result={result}
              legacyCode={code}
              options={options}
              isRunningStep={isRunning}
              onRunSingleStep={handleRunSingleStep}
            />
          </>
        )}
      </main>

      {/* Save Project Modal */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        legacyCode={code}
        result={result}
        options={options}
        activeProjectId={activeProjectId}
        activeProjectName={activeProjectName}
      />

      {/* Saved Projects Library Drawer */}
      <SavedProjectsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        onLoadProject={handleLoadProject}
        onNewProject={handleNewProject}
        activeProjectId={activeProjectId}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={options}
        setOptions={setOptions}
      />

      {/* Export Dossier Modal */}
      {result && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={result}
          legacyCode={code}
        />
      )}

      {/* iPhone 15 Hardware & Apple Pay Simulator Modal */}
      <IPhone15SimulatorModal
        isOpen={isIPhoneSimulatorOpen}
        onClose={() => setIsIPhoneSimulatorOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
      />
    </div>
  );
}
