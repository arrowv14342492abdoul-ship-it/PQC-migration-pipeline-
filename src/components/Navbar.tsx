import React, { useState } from 'react';
import {
  Shield,
  Settings,
  Download,
  ShieldAlert,
  Sparkles,
  Save,
  FolderOpen,
  Layers,
  Landmark,
  CreditCard,
  Menu,
  X,
  FileCheck2,
  Sliders,
  ChevronRight,
  Cpu,
  Radar,
  Flame,
  Target,
  Terminal,
  FolderGit2,
  Binary,
  ShieldCheck,
  Plane,
  Dna,
  MessageSquare,
} from 'lucide-react';
import { PipelineResult } from '../types/pqc';

interface NavbarProps {
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
    | 'kali-linux'
    | 'bioscience'
    | 'gemini-chat'
    | 'zero-trust-compliance';
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
      | 'bioscience'
      | 'gemini-chat'
      | 'zero-trust-compliance'
  ) => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenSaveModal: () => void;
  onOpenSavedDrawer: () => void;
  savedCount: number;
  result: PipelineResult | null;
  isRunning: boolean;
  aikidoGrade?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onSelectView,
  onOpenSettings,
  onOpenExport,
  onOpenSaveModal,
  onOpenSavedDrawer,
  savedCount,
  result,
  isRunning,
  aikidoGrade = 'B',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectViewMobile = (
    view: NavbarProps['activeView']
  ) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  const isAikidoPassing = aikidoGrade === 'A+' || aikidoGrade === 'A';

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-40 backdrop-blur-md w-full pt-[env(safe-area-inset-top,0px)] shadow-md shadow-black/20">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & NIST Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100 uppercase truncate">
                PQC Defense Ops
              </h1>
              <span className="text-zinc-500 text-xs hidden xs:inline">/</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-medium hidden sm:inline">
                FIPS 203 & 204
              </span>
            </div>
            <div className="hidden xs:flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">
              <span className="truncate">Auditor · Architect · Implementer</span>
            </div>
          </div>
        </div>

        {/* Desktop View Switcher: Pipeline vs Aikido Security vs Enterprise Integrations (hidden on mobile, shown md+) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs overflow-x-auto max-w-[calc(100vw-460px)] shrink">
          <button
            onClick={() => onSelectView('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'pipeline'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>PQC Pipeline</span>
          </button>

          <button
            onClick={() => onSelectView('aikido')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'aikido'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aikido Security</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                isAikidoPassing
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/80 border border-amber-800 text-amber-300'
              }`}
            >
              Grade {aikidoGrade}
            </span>
          </button>

          <button
            onClick={() => onSelectView('enterprise')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'enterprise'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enterprise Integrations</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              15 Connectors
            </span>
          </button>

          <button
            onClick={() => onSelectView('banking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'banking'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Banking & Finance</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
              18 Banks
            </span>
          </button>

          <button
            onClick={() => onSelectView('creditcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'creditcards'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
            <span>Credit Cards</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-950 border border-amber-800/80 text-amber-300">
              Centurion & Apple Pay
            </span>
          </button>

          <button
            onClick={() => onSelectView('ot-zerotrust')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'ot-zerotrust'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>NSA OT Zero Trust</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
              CSI Oct 2026
            </span>
          </button>

          <button
            onClick={() => onSelectView('defense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'defense'
                ? 'bg-zinc-800 text-white shadow-xs ring-1 ring-cyan-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Defense</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
              Palantir · Lockheed · Northrop
            </span>
          </button>

          <button
            onClick={() => onSelectView('war')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'war'
                ? 'bg-rose-950/80 text-rose-200 shadow-xs ring-1 ring-rose-500/60'
                : 'text-zinc-400 hover:text-rose-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>War</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-700 text-rose-300">
              Hypersonic & Strike
            </span>
          </button>

          <button
            onClick={() => onSelectView('security-assessment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'security-assessment'
                ? 'bg-purple-950/80 text-purple-200 shadow-xs ring-1 ring-purple-500/60'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Security Assessment</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-950 border border-purple-700 text-purple-300">
              PTES · MITRE
            </span>
          </button>

          <button
            onClick={() => onSelectView('threat-model')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'threat-model'
                ? 'bg-rose-950/90 text-rose-200 shadow-xs ring-1 ring-rose-500/80'
                : 'text-zinc-400 hover:text-rose-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Threat Model</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
              Gemini AI
            </span>
          </button>

          <button
            onClick={() => onSelectView('whiterabbitneo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'whiterabbitneo'
                ? 'bg-emerald-950/90 text-emerald-200 shadow-xs ring-1 ring-emerald-500/80'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhiteRabbitNeo</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
              33B LLM
            </span>
          </button>

          <button
            onClick={() => onSelectView('zero-trust-compliance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'zero-trust-compliance'
                ? 'bg-cyan-950/90 text-cyan-200 shadow-xs ring-1 ring-cyan-500/80'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero Trust Compliance</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Ingress Telemetry
            </span>
          </button>

          <button
            onClick={() => onSelectView('nsa-software')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'nsa-software'
                ? 'bg-blue-950/90 text-blue-200 shadow-xs ring-1 ring-blue-500/80'
                : 'text-zinc-400 hover:text-blue-300'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>NSA Suite</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Zero Trust · Insider Defense
            </span>
          </button>

          <button
            onClick={() => onSelectView('gchq-software')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'gchq-software'
                ? 'bg-teal-950/90 text-teal-200 shadow-xs ring-1 ring-teal-500/80'
                : 'text-zinc-400 hover:text-teal-300'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-teal-400" />
            <span>GCHQ Software</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-teal-950 border border-teal-800 text-teal-300">
              CyberChef · Gaffer
            </span>
          </button>

          <button
            onClick={() => onSelectView('incd-software')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'incd-software'
                ? 'bg-sky-950/90 text-sky-200 shadow-xs ring-1 ring-sky-500/80'
                : 'text-zinc-400 hover:text-sky-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>INCD Israel</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-800 text-sky-300">
              CERT-IL · CDM 2.0
            </span>
          </button>

          <button
            onClick={() => onSelectView('f22-raptor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'f22-raptor'
                ? 'bg-emerald-950/90 text-emerald-200 shadow-xs ring-1 ring-emerald-500/80'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-emerald-400" />
            <span>F-22 Raptor</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
              CIP · Mach 1.82
            </span>
          </button>

          <button
            onClick={() => onSelectView('f35')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'f35'
                ? 'bg-cyan-950/90 text-cyan-200 shadow-xs ring-1 ring-cyan-500/80'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-cyan-400" />
            <span>F-35 Lightning</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-800 text-cyan-300">
              ICP · 14 Arsenal
            </span>
          </button>

          <button
            onClick={() => onSelectView('b21')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'b21'
                ? 'bg-indigo-950/90 text-indigo-200 shadow-xs ring-1 ring-indigo-500/80'
                : 'text-zinc-400 hover:text-indigo-300'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-indigo-400" />
            <span>B-21 Raider</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
              OMS · VLO Nuclear
            </span>
          </button>

          <button
            onClick={() => onSelectView('kali-linux')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'kali-linux'
                ? 'bg-sky-950/90 text-sky-200 shadow-xs ring-1 ring-sky-500/80'
                : 'text-zinc-400 hover:text-sky-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Kali Linux</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-sky-950 border border-sky-800 text-sky-300">
              Full Suite · 3,842 Tools
            </span>
          </button>

          <button
            onClick={() => onSelectView('bioscience')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
              activeView === 'bioscience'
                ? 'bg-emerald-950/90 text-emerald-200 shadow-xs ring-1 ring-emerald-500/80'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Dna className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bioscience & AI</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
              AlphaFold · Gemini
            </span>
          </button>

          <button
            onClick={() => onSelectView('gemini-chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer shrink-0 ${
              activeView === 'gemini-chat'
                ? 'bg-purple-900 text-purple-100 shadow-xs ring-1 ring-purple-400'
                : 'text-purple-300 hover:text-purple-100 bg-purple-950/40 hover:bg-purple-950/80 border border-purple-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Gemini Chat</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-950 border border-purple-700 text-purple-300">
              AI Multi-Turn
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Save Current Project */}
          <button
            onClick={onOpenSaveModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Save migration project (Ctrl+S / Cmd+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Saved Projects Library Drawer */}
          <button
            onClick={onOpenSavedDrawer}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-medium border border-zinc-700/80 hover:border-zinc-600 bg-zinc-900 text-zinc-200 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Open Saved Projects Library"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Library</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {savedCount}
            </span>
          </button>

          {/* Gemini AI Advisor Quick Access Button */}
          <button
            onClick={() => onSelectView('gemini-chat')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
              activeView === 'gemini-chat'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-purple-900/50'
                : 'bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-800/80 hover:border-purple-600'
            }`}
            title="Open Gemini AI Cryptographic & Operations Advisor"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Gemini AI</span>
            <span className="hidden sm:inline px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-900 text-purple-200 border border-purple-700">
              Live
            </span>
          </button>

          {/* Desktop Only: Settings & Export */}
          <button
            onClick={onOpenSettings}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors cursor-pointer"
            title="Configure PQC parameters and libraries"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">Constraints</span>
          </button>

          <button
            onClick={onOpenExport}
            disabled={!result || isRunning}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-zinc-200 hover:text-white border border-zinc-750 hover:border-zinc-600 bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Export full migration dossier and Python files"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Export Dossier</span>
          </button>

          {/* Mobile Menu Hamburger Toggle (Visible on iPhone and small screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center w-8 h-8 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-zinc-200" />
            ) : (
              <Menu className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        </div>
      </div>

      {/* iPhone & Mobile Dedicated View Switcher Bar (Visible on screens < md) */}
      <div className="md:hidden w-full px-2 pb-2 pt-0 border-t border-zinc-900/60">
        <nav
          aria-label="Mobile Navigation"
          className="grid grid-cols-6 gap-1 p-1 bg-zinc-900/90 border border-zinc-800/90 rounded-xl text-xs shadow-inner"
        >
          {/* Tab 1: PQC Pipeline */}
          <button
            onClick={() => handleSelectViewMobile('pipeline')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'pipeline'
                ? 'bg-zinc-800 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold leading-tight text-center">Pipeline</span>
          </button>

          {/* Tab 2: Aikido Security */}
          <button
            onClick={() => handleSelectViewMobile('aikido')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'aikido'
                ? 'bg-zinc-800 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Aikido</span>
            </div>
            <span
              className={`px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none ${
                isAikidoPassing
                  ? 'bg-emerald-950/90 border border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/90 border border-amber-800 text-amber-300'
              }`}
            >
              Gr.{aikidoGrade}
            </span>
          </button>

          {/* Tab 3: Enterprise Integrations */}
          <button
            onClick={() => handleSelectViewMobile('enterprise')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'enterprise'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm ring-1 ring-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Enterp.</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-cyan-950/90 border border-cyan-800 text-cyan-300">
              15 Live
            </span>
          </button>

          {/* Tab 4: Banking & Finance */}
          <button
            onClick={() => handleSelectViewMobile('banking')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'banking'
                ? 'bg-zinc-800 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Banking</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-amber-950/90 border border-amber-800 text-amber-300">
              18 Inst
            </span>
          </button>

          {/* Tab 5: Credit Cards */}
          <button
            onClick={() => handleSelectViewMobile('creditcards')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'creditcards'
                ? 'bg-zinc-800 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Cards</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-zinc-950 border border-amber-800 text-amber-300">
              Amex
            </span>
          </button>

          {/* Tab 6: NSA OT Zero Trust */}
          <button
            onClick={() => handleSelectViewMobile('ot-zerotrust')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'ot-zerotrust'
                ? 'bg-zinc-800 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">OT ZT</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-emerald-950 border border-emerald-800 text-emerald-300">
              NSA
            </span>
          </button>

          {/* Tab 7: Defense */}
          <button
            onClick={() => handleSelectViewMobile('defense')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'defense'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm ring-1 ring-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Radar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Defense</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-cyan-950 border border-cyan-800 text-cyan-300">
              JADC2
            </span>
          </button>

          {/* Tab 8: War */}
          <button
            onClick={() => handleSelectViewMobile('war')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'war'
                ? 'bg-rose-950/80 text-rose-300 shadow-sm ring-1 ring-rose-500/50'
                : 'text-zinc-400 hover:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">War</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-rose-950 border border-rose-800 text-rose-300">
              Strike
            </span>
          </button>

          {/* Tab 9: Security Assessment */}
          <button
            onClick={() => handleSelectViewMobile('security-assessment')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'security-assessment'
                ? 'bg-purple-950/80 text-purple-300 shadow-sm ring-1 ring-purple-500/50'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Security</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-purple-950 border border-purple-800 text-purple-300">
              PTES
            </span>
          </button>

          {/* Tab 10: Threat Model */}
          <button
            onClick={() => handleSelectViewMobile('threat-model')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'threat-model'
                ? 'bg-rose-950/80 text-rose-300 shadow-sm ring-1 ring-rose-500/60'
                : 'text-zinc-400 hover:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Threat</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-rose-950 border border-rose-800 text-rose-300">
              AI
            </span>
          </button>

          {/* Tab 11: WhiteRabbitNeo */}
          <button
            onClick={() => handleSelectViewMobile('whiterabbitneo')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'whiterabbitneo'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-sm ring-1 ring-emerald-500/60'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">WRN</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-emerald-950 border border-emerald-800 text-emerald-300">
              33B
            </span>
          </button>

          {/* Tab: Zero Trust Compliance */}
          <button
            onClick={() => handleSelectViewMobile('zero-trust-compliance')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'zero-trust-compliance'
                ? 'bg-cyan-950/80 text-cyan-300 shadow-sm ring-1 ring-cyan-500/60'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">ZT</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-cyan-950 border border-cyan-800 text-cyan-300">
              Audit
            </span>
          </button>

          {/* Tab 12: NSA Software */}
          <button
            onClick={() => handleSelectViewMobile('nsa-software')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'nsa-software'
                ? 'bg-blue-950/80 text-blue-300 shadow-sm ring-1 ring-blue-500/60'
                : 'text-zinc-400 hover:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">NSA</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-rose-950 border border-rose-800 text-rose-300">
              Hardened
            </span>
          </button>

          {/* Tab 13: GCHQ Software */}
          <button
            onClick={() => handleSelectViewMobile('gchq-software')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'gchq-software'
                ? 'bg-teal-950/80 text-teal-300 shadow-sm ring-1 ring-teal-500/60'
                : 'text-zinc-400 hover:text-teal-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Binary className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">GCHQ</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-teal-950 border border-teal-800 text-teal-300">
              Chef
            </span>
          </button>

          {/* Tab 14: INCD Israel */}
          <button
            onClick={() => handleSelectViewMobile('incd-software')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'incd-software'
                ? 'bg-sky-950/80 text-sky-300 shadow-sm ring-1 ring-sky-500/60'
                : 'text-zinc-400 hover:text-sky-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">INCD</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-sky-950 border border-sky-800 text-sky-300">
              IL
            </span>
          </button>

          {/* Tab 15: F-22 Raptor */}
          <button
            onClick={() => handleSelectViewMobile('f22-raptor')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'f22-raptor'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-sm ring-1 ring-emerald-500/60'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Plane className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">F-22</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-emerald-950 border border-emerald-800 text-emerald-300">
              M1.82
            </span>
          </button>

          {/* Tab 16: F-35 Lightning */}
          <button
            onClick={() => handleSelectViewMobile('f35')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'f35'
                ? 'bg-cyan-950/80 text-cyan-300 shadow-sm ring-1 ring-cyan-500/60'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Plane className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">F-35</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-cyan-950 border border-cyan-800 text-cyan-300">
              14 Wpn
            </span>
          </button>

          {/* Tab 17: B-21 Raider */}
          <button
            onClick={() => handleSelectViewMobile('b21')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'b21'
                ? 'bg-indigo-950/80 text-indigo-300 shadow-sm ring-1 ring-indigo-500/60'
                : 'text-zinc-400 hover:text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Plane className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">B-21</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-indigo-950 border border-indigo-800 text-indigo-300">
              VLO
            </span>
          </button>

          {/* Tab 18: Kali Linux */}
          <button
            onClick={() => handleSelectViewMobile('kali-linux')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'kali-linux'
                ? 'bg-sky-950/80 text-sky-300 shadow-sm ring-1 ring-sky-500/60'
                : 'text-zinc-400 hover:text-sky-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Kali</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-sky-950 border border-sky-800 text-sky-300">
              Tools
            </span>
          </button>

          {/* Tab 19: Gemini Chat */}
          <button
            onClick={() => handleSelectViewMobile('gemini-chat')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-lg font-medium transition-all cursor-pointer min-h-[42px] ${
              activeView === 'gemini-chat'
                ? 'bg-purple-950/80 text-purple-300 shadow-sm ring-1 ring-purple-500/60'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[10px] font-semibold leading-tight text-center">Chat</span>
            </div>
            <span className="px-1 py-0.1 rounded text-[8px] font-mono font-bold leading-none bg-purple-950 border border-purple-800 text-purple-300">
              Gemini
            </span>
          </button>
        </nav>
      </div>

      {/* iPhone Collapsible Quick Actions & Constraints Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/98 px-3 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-mono text-zinc-400 px-1 pb-1 uppercase tracking-wider flex items-center justify-between">
            <span>Mobile Quick Actions</span>
            <span className="text-emerald-400 font-semibold">FIPS 203 / 204 Active</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleSelectViewMobile('gemini-chat');
              }}
              className="col-span-2 flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-purple-900/60 text-zinc-200 hover:text-white hover:border-purple-700 text-xs text-left cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded bg-purple-950/80 border border-purple-700 flex items-center justify-center text-purple-400 shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-purple-300 truncate">Gemini AI Multi-Turn Chatbot</div>
                <div className="text-[10px] text-zinc-400 truncate">PQC Architect, Avionics, Threat & Bio-Research AI</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 text-xs text-left cursor-pointer active:scale-98"
            >
              <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                <Sliders className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-zinc-100 truncate">Constraints</div>
                <div className="text-[10px] text-zinc-400 truncate">Algorithms & Libs</div>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenExport();
                setMobileMenuOpen(false);
              }}
              disabled={!result || isRunning}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 text-xs text-left cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-zinc-100 truncate">Export Dossier</div>
                <div className="text-[10px] text-zinc-400 truncate">CBOM & Python</div>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Saved Projects: <strong className="text-zinc-200">{savedCount}</strong> in Library</span>
            <button
              onClick={() => {
                onOpenSavedDrawer();
                setMobileMenuOpen(false);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Open Library <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
