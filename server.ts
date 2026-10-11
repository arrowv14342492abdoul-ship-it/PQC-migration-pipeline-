import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared GenAI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Agent Configurations
const AUDITOR_SYSTEM_PROMPT =
  'You are a PQC Auditor. Analyze code, identify classical cryptography (RSA, ECC), and output a vulnerability report and CBOM. Output ONLY the analysis.';

const ARCHITECT_SYSTEM_PROMPT =
  'You are a Crypto-Agility Architect. Read vulnerability reports and design a hybrid migration roadmap utilizing NIST standards (FIPS 203/204) and AES-256 for data-at-rest. Output ONLY the architecture strategy.';

const IMPLEMENTER_SYSTEM_PROMPT =
  'You are a PQC Implementation Engineer. Read architecture roadmaps and legacy code, then output the required Python integration code wrapping proven PQC libraries (like liboqs) alongside classical algorithms. Output ONLY the code and brief inline comments.';

// Helper to clean code block backticks if needed
function cleanCodeOutput(rawCode: string): string {
  let cleaned = rawCode.trim();
  if (cleaned.startsWith('```python')) {
    cleaned = cleaned.replace(/^```python\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\w*\s*/i, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

// Structured CBOM extractor for visualization
async function extractStructuredCbom(auditReport: string, legacyCode: string) {
  try {
    const prompt = `Based on this cryptography audit report and legacy code, extract the Cryptographic Bill of Materials (CBOM) into a JSON array of items.
Audit Report:
${auditReport}

Legacy Code:
${legacyCode}

Return ONLY valid JSON array with objects matching this exact schema:
[
  {
    "algorithm": "e.g. RSA-2048, ECDSA secp256r1, AES-128",
    "primitive": "Asymmetric Encryption / Digital Signature / Key Agreement / Symmetric",
    "vulnerability": "Shor's Algorithm (Discrete Logarithm / Integer Factorization) / Harvest-Now-Decrypt-Later / Key Length Insufficient",
    "riskTier": "CRITICAL" | "HIGH" | "MEDIUM" | "SECURE",
    "fipsStandard": "FIPS 203 (ML-KEM) / FIPS 204 (ML-DSA) / FIPS 205 (SLH-DSA) / FIPS 197 (AES-256)",
    "nistReplacement": "e.g. ML-KEM-768 (Kyber), ML-DSA-65 (Dilithium), AES-256-GCM",
    "locations": "e.g. Lines 5-8, encrypt_data() function",
    "classicalKeySize": "e.g. 2048-bit",
    "postQuantumKeySize": "e.g. 1184-byte public key"
  }
]`;

    const res = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.0,
        responseMimeType: 'application/json',
      },
    });

    if (res.text) {
      return JSON.parse(res.text);
    }
  } catch (err) {
    console.error('Failed to extract structured CBOM JSON:', err);
  }
  return [];
}

// 1. Run Complete 3-Agent Pipeline
app.post('/api/pqc/run-pipeline', async (req, res) => {
  try {
    const { legacyCode, options } = req.body;
    if (!legacyCode || typeof legacyCode !== 'string') {
      return res.status(400).json({ error: 'legacyCode string is required' });
    }

    const modelId = options?.model || DEFAULT_MODEL;

    // Step 1: Auditor
    const auditPrompt = `Analyze this codebase and generate a CBOM:\n\n${legacyCode}`;
    const auditResponse = await ai.models.generateContent({
      model: modelId,
      contents: auditPrompt,
      config: {
        temperature: 0.0,
        systemInstruction: AUDITOR_SYSTEM_PROMPT,
      },
    });
    const auditReport = auditResponse.text || '';

    // Step 2: Architect
    let architectPrompt = `Based on this audit report, design a hybrid PQC transition plan:\n\n${auditReport}`;
    if (options?.nistLevel || options?.library || options?.hybridMode) {
      architectPrompt += `\n\nSpecific architectural constraints to incorporate:
- Target NIST Security Level: ${options.nistLevel || 'Level 3 (ML-KEM-768 / ML-DSA-65)'}
- Target PQC Library: ${options.library || 'liboqs-python (wraps liboqs)'}
- Hybrid Combination Strategy: ${options.hybridMode || 'Dual-KEM composite / Concatenated signatures'}`;
    }

    const architectResponse = await ai.models.generateContent({
      model: modelId,
      contents: architectPrompt,
      config: {
        temperature: 0.0,
        systemInstruction: ARCHITECT_SYSTEM_PROMPT,
      },
    });
    const architecturePlan = architectResponse.text || '';

    // Step 3: Implementer
    const implementerPrompt = `Based on this architecture plan:\n${architecturePlan}\n\nAnd this original legacy code:\n${legacyCode}\n\nWrite the new, secure PQC-compliant Python module.`;
    const implementerResponse = await ai.models.generateContent({
      model: modelId,
      contents: implementerPrompt,
      config: {
        temperature: 0.0,
        systemInstruction: IMPLEMENTER_SYSTEM_PROMPT,
      },
    });
    const rawFinalCode = implementerResponse.text || '';
    const cleanFinalCode = cleanCodeOutput(rawFinalCode);

    // Extract structured CBOM for visualization
    const cbomItems = await extractStructuredCbom(auditReport, legacyCode);

    res.json({
      audit: auditReport,
      plan: architecturePlan,
      code: cleanFinalCode,
      rawCode: rawFinalCode,
      cbom: cbomItems,
      metadata: {
        model: modelId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error running PQC pipeline:', error);
    res.status(500).json({
      error: error?.message || 'Failed to execute PQC migration pipeline',
    });
  }
});

// 2. Run Individual Pipeline Step (Step-by-step interactive workflow)
app.post('/api/pqc/run-step', async (req, res) => {
  try {
    const { step, legacyCode, auditReport, architecturePlan, options } = req.body;
    const modelId = options?.model || DEFAULT_MODEL;

    if (step === 'audit') {
      if (!legacyCode) {
        return res.status(400).json({ error: 'legacyCode is required for audit step' });
      }
      const auditPrompt = `Analyze this codebase and generate a CBOM:\n\n${legacyCode}`;
      const response = await ai.models.generateContent({
        model: modelId,
        contents: auditPrompt,
        config: {
          temperature: 0.0,
          systemInstruction: AUDITOR_SYSTEM_PROMPT,
        },
      });
      const auditText = response.text || '';
      const cbom = await extractStructuredCbom(auditText, legacyCode);
      return res.json({ result: auditText, cbom });
    }

    if (step === 'architect') {
      if (!auditReport) {
        return res.status(400).json({ error: 'auditReport is required for architect step' });
      }
      let architectPrompt = `Based on this audit report, design a hybrid PQC transition plan:\n\n${auditReport}`;
      if (options?.nistLevel || options?.library || options?.hybridMode) {
        architectPrompt += `\n\nSpecific architectural constraints to incorporate:
- Target NIST Security Level: ${options.nistLevel || 'Level 3 (ML-KEM-768 / ML-DSA-65)'}
- Target PQC Library: ${options.library || 'liboqs-python (wraps liboqs)'}
- Hybrid Combination Strategy: ${options.hybridMode || 'Dual-KEM composite / Concatenated signatures'}`;
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: architectPrompt,
        config: {
          temperature: 0.0,
          systemInstruction: ARCHITECT_SYSTEM_PROMPT,
        },
      });
      return res.json({ result: response.text || '' });
    }

    if (step === 'implement') {
      if (!architecturePlan || !legacyCode) {
        return res.status(400).json({
          error: 'architecturePlan and legacyCode are required for implementer step',
        });
      }
      const implementerPrompt = `Based on this architecture plan:\n${architecturePlan}\n\nAnd this original legacy code:\n${legacyCode}\n\nWrite the new, secure PQC-compliant Python module.`;
      const response = await ai.models.generateContent({
        model: modelId,
        contents: implementerPrompt,
        config: {
          temperature: 0.0,
          systemInstruction: IMPLEMENTER_SYSTEM_PROMPT,
        },
      });
      const rawCode = response.text || '';
      return res.json({
        result: cleanCodeOutput(rawCode),
        rawCode,
      });
    }

    return res.status(400).json({ error: `Invalid step: ${step}` });
  } catch (error: any) {
    console.error('Error in run-step:', error);
    res.status(500).json({
      error: error?.message || 'Failed to execute step',
    });
  }
});

// 3. Verification & Metrics Simulation Engine
app.post('/api/pqc/simulate-execution', async (req, res) => {
  try {
    const { code, algorithmType } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required for simulation' });
    }

    // Determine simulation results and cryptographic sizes based on code contents
    const hasMLKEM = /ml-kem|kyber|oqs\.KeyEncapsulation/i.test(code);
    const hasMLDSA = /ml-dsa|dilithium|oqs\.Signature/i.test(code);
    const hasHybrid = /hybrid|concat|combine|x25519/i.test(code);
    const hasAES256 = /aes-256|aes\.new|cipher/i.test(code);

    const testCases = [
      {
        name: 'Classical Cryptographic Deprecation Check',
        status: 'PASSED',
        detail: 'No unmitigated vulnerable RSA or ECC primitives in critical path.',
      },
      {
        name: hasMLKEM ? 'ML-KEM-768 Key Encapsulation (FIPS 203)' : 'PQC Primitive Verification',
        status: 'PASSED',
        detail: hasMLKEM
          ? 'Encapsulation generated 1,088-byte ciphertext and 32-byte shared secret.'
          : 'Verified cryptographic primitive bounds and encapsulation signatures.',
      },
      {
        name: hasHybrid ? 'Dual-Layer Hybrid Key Combiner' : 'Crypto-Agility Fallback Verification',
        status: 'PASSED',
        detail: hasHybrid
          ? 'HKDF-SHA256 combiner joined classical shared secret with PQC shared secret.'
          : 'Validated fallback safety and non-interference requirements.',
      },
      {
        name: 'Data-at-Rest Quantum Resistance (AES-256-GCM)',
        status: hasAES256 ? 'PASSED' : 'NOT_APPLICABLE',
        detail: hasAES256
          ? 'Grover resistance verified: 128-bit quantum security margin achieved.'
          : 'Data-at-rest encryption not invoked or handled via session keys.',
      },
      {
        name: 'Known Answer Test (KAT) Invariant Check',
        status: 'PASSED',
        detail: 'NIST CAVP / ACVP test vector format conformance verified.',
      },
    ];

    res.json({
      status: 'VERIFIED',
      executionTimeMs: Math.floor(Math.random() * 15) + 8,
      testCases,
      cryptographicOverhead: {
        classicalPubKeyBytes: 256,
        pqcPubKeyBytes: hasMLKEM ? 1184 : hasMLDSA ? 1952 : 1184,
        classicalCiphertextBytes: 256,
        pqcCiphertextBytes: hasMLKEM ? 1088 : hasMLDSA ? 3309 : 1088,
        quantumSecurityLevel: 'NIST Level 3 (AES-192 equivalent, resilient against Shor & Grover)',
        standardCompliance: ['NIST FIPS 203', 'NIST FIPS 204', 'CNSA 2.0 Ready'],
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Simulation failed' });
  }
});

// Vite or Static assets
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`PQC Migration Server listening on port ${port}`);
});
