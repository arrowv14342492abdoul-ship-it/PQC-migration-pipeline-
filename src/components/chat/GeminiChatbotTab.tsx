import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Cpu,
  Shield,
  Zap,
  Flame,
  Dna,
  RefreshCw,
  Terminal,
  ChevronDown,
} from 'lucide-react';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export type ChatRole =
  | 'pqc-architect'
  | 'avionics-specialist'
  | 'threat-analyst'
  | 'bioscience-researcher'
  | 'general-assistant';

export type ModelTier = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'intro-msg-1',
    role: 'model',
    text: `Hello! I am your AI Cryptographic & Defense Operations Advisor powered by Google Gemini. 

I can assist you with:
- **NIST FIPS 203 (ML-KEM)** & **FIPS 204 (ML-DSA)** migration architecture
- **CNSA 2.0 timelines** and Harvest-Now-Decrypt-Later (HNDL) risk models
- **F-22 Raptor & F-35 Lightning II** avionics bus cryptographic hardening
- **DeepMind AlphaFold DB** & **AlphaGenome** quantum-safe genomic protection

Select your preferred persona and Gemini model tier below to begin.`,
    timestamp: new Date().toISOString(),
    modelUsed: 'gemini-3.8-flash',
  },
];

export const GeminiChatbotTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_chat_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('pqc-architect');
  const [selectedModel, setSelectedModel] = useState<ModelTier>('gemini-3.8-flash');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('gemini_chat_history_v1', JSON.stringify(messages));
    } catch (e) {
      console.warn('Unable to persist chat history:', e);
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userTurn: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, userTurn];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userTurn.text,
          history: messages.slice(-10),
          model: selectedModel,
          role: selectedRole,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-model`,
          role: 'model',
          text: data.reply || 'No response generated.',
          timestamp: data.timestamp || new Date().toISOString(),
          modelUsed: data.model || selectedModel,
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: 'model',
          text: `[Error: ${err?.message || 'Chat request failed'}] Could not reach Gemini advisor. Please verify connectivity.`,
          timestamp: new Date().toISOString(),
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('gemini_chat_history_v1');
    } catch {}
  };

  const roles = [
    {
      id: 'pqc-architect' as ChatRole,
      label: 'PQC Architect',
      icon: Shield,
      description: 'NIST FIPS 203/204 & CNSA 2.0 Expert',
    },
    {
      id: 'avionics-specialist' as ChatRole,
      label: 'Avionics Specialist',
      icon: Cpu,
      description: 'F-22 & F-35 Cryptographic Bus Engineer',
    },
    {
      id: 'threat-analyst' as ChatRole,
      label: 'Threat Analyst',
      icon: Flame,
      description: 'HNDL, CRQC & Sovereign Cyber Defense',
    },
    {
      id: 'bioscience-researcher' as ChatRole,
      label: 'Bio-Research Lead',
      icon: Dna,
      description: 'AlphaFold DB & Genomic Protection',
    },
    {
      id: 'general-assistant' as ChatRole,
      label: 'Platform Assistant',
      icon: Bot,
      description: 'General Platform Support & Operations',
    },
  ];

  const models = [
    {
      id: 'gemini-4-argon' as ModelTier,
      label: 'gemini-4-argon',
      badge: 'Complex Reasoning & Math',
      color: 'border-purple-600 bg-purple-950/60 text-purple-200',
    },
    {
      id: 'gemini-3.8-flash' as ModelTier,
      label: 'gemini-3.8-flash',
      badge: 'General & Architecture (Default)',
      color: 'border-emerald-600 bg-emerald-950/60 text-emerald-200',
    },
    {
      id: 'gemini-3.1-flash-lite' as ModelTier,
      label: 'gemini-3.1-flash-lite',
      badge: 'Fast & High-Throughput',
      color: 'border-cyan-600 bg-cyan-950/60 text-cyan-200',
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header & Controls Strip */}
      <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                  Gemini Neural Operations Chatbot
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  Multi-Turn Memory
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Context-aware conversational advisor maintaining dialog memory with role-specialized system instructions.
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 hover:text-rose-200 border border-zinc-800 text-xs font-mono text-zinc-400 transition-colors cursor-pointer self-start sm:self-auto"
            title="Reset conversation thread"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* Persona & Model Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Persona Selection */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Advisor Role & System Instruction:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-sm'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-sans text-xs">
                      <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{r.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Tier Selection */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini Model Tier:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {models.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${m.color} shadow-sm font-bold`
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-mono text-xs">{m.label}</div>
                    <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 flex flex-col h-[520px] shadow-2xl overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                    isUser
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'bg-purple-950 border border-purple-500/40 text-purple-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed space-y-1.5 shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`text-[10px] font-mono flex items-center justify-between gap-3 pt-1 border-t ${
                      isUser
                        ? 'border-emerald-500/50 text-emerald-200'
                        : 'border-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {msg.modelUsed && !isUser && (
                      <span className="text-purple-400">{msg.modelUsed}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator Turn */}
          {isLoading && (
            <div className="flex gap-3 max-w-md mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-tl-none flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Thinking with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${selectedRole.replace('-', ' ')} using ${selectedModel}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
