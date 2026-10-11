import React from 'react';
import { ShieldCheck, Calendar, Lock, Cpu, Layers } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface ArchitectRoadmapProps {
  planText: string;
}

export const ArchitectRoadmap: React.FC<ArchitectRoadmapProps> = ({ planText }) => {
  return (
    <div className="space-y-5">
      {/* NIST FIPS Standard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIPS 203 (ML-KEM)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400">Standard</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Module-Lattice Key-Encapsulation Mechanism (formerly CRYSTALS-Kyber). Replaces RSA-OAEP and ECDH key exchanges.
          </p>
          <div className="text-[11px] font-mono text-zinc-300 pt-1 border-t border-zinc-850">
            ML-KEM-512 · ML-KEM-768 · ML-KEM-1024
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIPS 204 (ML-DSA)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400">Standard</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Module-Lattice Digital Signature Algorithm (formerly CRYSTALS-Dilithium). Replaces RSA-PSS, PKCS#1 v1.5, and ECDSA.
          </p>
          <div className="text-[11px] font-mono text-zinc-300 pt-1 border-t border-zinc-850">
            ML-DSA-44 · ML-DSA-65 · ML-DSA-87
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>FIPS 205 (SLH-DSA)</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-400">Stateless Hash</span>
          </div>
          <p className="text-zinc-400 text-xs">
            Stateless Hash-Based Digital Signature Algorithm (formerly SPHINCS+). Security relies solely on hash functions (SHA-2 / SHAKE).
          </p>
          <div className="text-[11px] font-mono text-zinc-300 pt-1 border-t border-zinc-850">
            SLH-DSA-SHA2-128f · SLH-DSA-SHAKE-256s
          </div>
        </div>
      </div>

      {/* Hybrid Architecture Combiner Blueprint */}
      <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-100">
              Hybrid Crypto-Agility Architecture Blueprint
            </span>
          </div>
          <span className="text-zinc-400">Dual-Layer Fallback Safety</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          NIST and ANSSI recommend a <strong>hybrid transition period</strong>: combining classical algorithms (RSA/ECDH/ECDSA) with post-quantum primitives. If either mathematical problem is broken, the combined system remains provably secure.
        </p>

        {/* Combiner Formula & Schema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded border border-zinc-800/90 bg-zinc-950 space-y-1.5">
            <div className="text-zinc-400 font-mono text-[11px]">Key Encapsulation Combiner (KEM)</div>
            <div className="font-mono text-emerald-400 text-xs py-1">
              SS_final = HKDF-SHA256(SS_classical || SS_ML-KEM)
            </div>
            <p className="text-zinc-400 text-[11px]">
              Protects against Harvest-Now-Decrypt-Later (HNDL) attacks while preserving FIPS 140-3 classical compliance.
            </p>
          </div>

          <div className="p-3 rounded border border-zinc-800/90 bg-zinc-950 space-y-1.5">
            <div className="text-zinc-400 font-mono text-[11px]">Digital Signature Combiner (Auth)</div>
            <div className="font-mono text-emerald-400 text-xs py-1">
              Verify(Classical) == TRUE AND Verify(ML-DSA) == TRUE
            </div>
            <p className="text-zinc-400 text-[11px]">
              Concatenated dual signatures ensure legacy verifiers and quantum-ready verifiers can coexist.
            </p>
          </div>
        </div>
      </div>

      {/* CNSA 2.0 Transition Timeline */}
      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-200 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>CNSA 2.0 & NIST Regulatory Timeline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded border border-zinc-850 bg-zinc-900/40">
            <div className="font-mono text-amber-400 font-medium">2025 – Phase 1</div>
            <div className="text-zinc-300 mt-0.5">Software & Firmware</div>
            <p className="text-zinc-400 text-[11px] mt-1">
              Hybrid deployment mandatory for web browsers, TLS, and signing tools.
            </p>
          </div>
          <div className="p-2.5 rounded border border-zinc-850 bg-zinc-900/40">
            <div className="font-mono text-emerald-400 font-medium">2030 – Phase 2</div>
            <div className="text-zinc-300 mt-0.5">Mandatory PQC</div>
            <p className="text-zinc-400 text-[11px] mt-1">
              All newly procured software, hardware, and operating systems must default to PQC.
            </p>
          </div>
          <div className="p-2.5 rounded border border-zinc-850 bg-zinc-900/40">
            <div className="font-mono text-rose-400 font-medium">2033 – Phase 3</div>
            <div className="text-zinc-300 mt-0.5">Legacy Deprecation</div>
            <p className="text-zinc-400 text-[11px] mt-1">
              Complete ban on classical asymmetric algorithms (RSA, DH, ECDH, ECDSA).
            </p>
          </div>
        </div>
      </div>

      {/* Full Generated Architecture Strategy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            Architect Agent Strategy Output
          </span>
          <span className="text-zinc-400">Model: Gemini · Temp: 0.0</span>
        </div>
        <CodeBlock
          code={planText || '# Architecture roadmap pending execution...'}
          language="markdown"
          title="pqc_architecture_strategy.md"
          badge="FIPS 203/204 Roadmap"
        />
      </div>
    </div>
  );
};
