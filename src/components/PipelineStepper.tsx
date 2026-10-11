import React from 'react';
import { Search, Compass, Terminal, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { PipelineStep } from '../types/pqc';

interface PipelineStepperProps {
  currentTab: PipelineStep;
  onSelectTab: (step: PipelineStep) => void;
  activeRunningStep: PipelineStep | 'all' | null;
  completedSteps: Record<PipelineStep, boolean>;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentTab,
  onSelectTab,
  activeRunningStep,
  completedSteps,
}) => {
  const steps: {
    id: PipelineStep;
    num: string;
    name: string;
    role: string;
    deliverable: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'audit',
      num: '01',
      name: 'Auditor Agent',
      role: 'Classical Cryptography Audit',
      deliverable: 'CBOM & Vulnerability Matrix',
      icon: Search,
    },
    {
      id: 'architect',
      num: '02',
      name: 'Crypto-Agility Architect',
      role: 'NIST FIPS 203/204 Design',
      deliverable: 'Hybrid Migration Strategy',
      icon: Compass,
    },
    {
      id: 'implement',
      num: '03',
      name: 'PQC Implementer',
      role: 'liboqs Integration Engineering',
      deliverable: 'Modernized Python Codebase',
      icon: Terminal,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-950/70">
      {steps.map((step, idx) => {
        const isRunning =
          activeRunningStep === 'all' || activeRunningStep === step.id;
        const isCompleted = completedSteps[step.id];
        const isSelected = currentTab === step.id;
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            onClick={() => onSelectTab(step.id)}
            className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all cursor-pointer relative ${
              isSelected
                ? 'bg-zinc-900 border border-zinc-750 shadow-sm'
                : 'hover:bg-zinc-900/50 border border-transparent'
            }`}
          >
            {/* Status indicator icon */}
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold ${
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isCompleted
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : isSelected
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-850'
              }`}
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span>{step.num}</span>
              )}
            </div>

            {/* Step info */}
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold truncate ${
                    isSelected ? 'text-zinc-100' : 'text-zinc-300'
                  }`}
                >
                  {step.name}
                </span>
                {isRunning && (
                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                    Running
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {step.role}
              </div>
              <div className="text-[10px] font-mono text-zinc-400 truncate">
                {step.deliverable}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ArrowRight className="hidden md:block w-3.5 h-3.5 text-zinc-700 absolute -right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            )}
          </button>
        );
      })}
    </div>
  );
};
