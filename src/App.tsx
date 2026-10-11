/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SAMPLE_PRESETS } from './data/presets';
import { INITIAL_PRESET_RESULT } from './data/initialResult';
import {
  PipelineResult,
  PipelineStep,
  PipelineOptions,
} from './types/pqc';
import { Navbar } from './components/Navbar';
import { PipelineStepper } from './components/PipelineStepper';
import { CodeInputSection } from './components/CodeInputSection';
import { AgentView } from './components/AgentView';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

export default function App() {
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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Authoritative Navigation */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        result={result}
        isRunning={isRunning}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Automated 3-agent pipeline analyzing classical RSA and ECC vulnerabilities, generating Cryptographic Bills of Materials (CBOM), designing FIPS 203/204 hybrid roadmaps, and synthesizing liboqs Python modules.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <div className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-right">
              <div className="text-[10px] text-zinc-400">Execution Temperature</div>
              <div className="font-mono text-emerald-400 font-semibold">0.0 (Deterministic)</div>
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
      </main>

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
    </div>
  );
}
