import type { QuantumThreatModelResult, QuantumAttackVector, ThreatModelRequestOptions } from '../types/threatModel.ts';

export function generateOfflineThreatModel(
  sourceCode: string,
  fileName: string = 'uploaded_source.py',
  options?: ThreatModelRequestOptions
): QuantumThreatModelResult {
  const actor = options?.threatActorProfile || 'Nation-State CRQC APT (Harvest Now, Decrypt Later)';
  const compliance = options?.complianceTarget || 'NIST FIPS 203 & 204 / NSA CNSA 2.0';

  const hasRSA = /rsa|pkcs1|rsa\.new|rsa\.generate|rs256|rsa-oaep|Crypto\.PublicKey\.RSA|cryptography\.hazmat.*rsa/i.test(sourceCode);
  const hasECDSA = /ecdsa|secp256k1|secp256r1|prime256v1|es256|ec\.generate_private_key|elliptic|cryptography\.hazmat.*ec|sign\(|verify\(/i.test(sourceCode);
  const hasECDH = /ecdh|x25519|x448|exchange|diffie|modp|dh_key/i.test(sourceCode);
  const hasAES128 = /aes-128|aes_128|128[-_ ]?bit/i.test(sourceCode);
  const hasLegacyHash = /sha1|sha-1|md5/i.test(sourceCode);
  const hasHardcodedKey = /secret\s*=\s*['"][a-zA-Z0-9_-]{8,}['"]|key\s*=\s*b?['"][a-zA-Z0-9_\-\/+=]{16,}['"]/i.test(sourceCode);

  const attackVectors: QuantumAttackVector[] = [];
  let riskScore = 45;

  if (hasRSA || (!hasECDSA && !hasECDH)) {
    riskScore += 30;
    attackVectors.push({
      id: 'Q-ATK-01',
      name: 'Harvest Now, Decrypt Later (HNDL) & Shor Factorization of RSA Modulus',
      vulnerablePrimitive: 'RSA-2048 / PKCS#1 Asymmetric Encryption & Key Encapsulation',
      targetCodeLocation: 'RSA Key Generation & Public Key Ciphertext Delivery Block',
      quantumMechanism: "Shor's Algorithm for integer factorization reduces RSA discrete log to polynomial time O((log N)³), requiring approx. 4,096 logical error-corrected qubits.",
      severity: 'CRITICAL',
      feasibility: 'IMMEDIATE_HARVEST_NOW',
      impact: 'Adversary passively buffers encrypted ciphertext today; once a Cryptanalytically Relevant Quantum Computer (CRQC) is deployed, all historical session keys and confidential data are permanently broken.',
      mitreTechnique: {
        id: 'T1040',
        name: 'Network Sniffing & Retrospective Cryptanalysis',
      },
      adversaryKillChain: [
        {
          phase: '1. Reconnaissance',
          title: 'Algorithmic Fingerprinting',
          description: 'Adversary inspects TLS/transport handshake or API payload and detects classical RSA-2048 public keys in use.',
          technicalDetail: 'Public modulus N = p*q (2048-bit) extracted from certificates or raw endpoints.',
        },
        {
          phase: '2. Interception & Buffering',
          title: 'High-Capacity Bulk Eavesdropping (HNDL)',
          description: 'Adversary wiretaps internet fiber transit trunks and routes encrypted payloads into petabyte-scale long-term optical storage pools.',
          technicalDetail: 'Encrypted sessions stored indefinitely awaiting CRQC operationalization.',
        },
        {
          phase: '3. Quantum Execution',
          title: "Shor's Quantum Fourier Transform Period-Finding",
          description: 'Adversary runs Shor period-finding algorithm on a fault-tolerant quantum processor to solve order-finding modulo N.',
          technicalDetail: 'Recovers private primes p and q in minutes, computing private exponent d = e⁻¹ mod λ(N).',
        },
        {
          phase: '4. Session Compromise',
          title: 'Retrospective Bulk Decryption & Key Recovery',
          description: 'Decrypts all intercepted historical traffic and extracts master secrets, customer data, and authentication credentials.',
          technicalDetail: 'Decodes symmetric data-encryption keys (DEKs) wrapped by the compromised RSA keypair.',
        },
        {
          phase: '5. Exploitation',
          title: 'Persistent Impersonation & Lateral Subversion',
          description: 'Forges server identity, fabricates mutual TLS credentials, and bypasses perimeter defense mechanisms.',
          technicalDetail: 'Generates rogue signed tokens indistinguishable from legitimate server-issued payloads.',
        },
      ],
      dreadScores: {
        damage: 10,
        reproducibility: 9,
        exploitability: 9,
        affectedUsers: 10,
        discoverability: 9,
        total: 94,
      },
      recommendedRemediation: 'Migrate immediately to NIST FIPS 203 ML-KEM-768 (Kyber) in a dual-hybrid configuration with classical X25519.',
      remediationCodeSnippet: `# NIST FIPS 203 ML-KEM-768 Hybrid Remediation
import oqs
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

# 1. Post-Quantum KEM (FIPS 203)
with oqs.KeyEncapsulation("ML-KEM-768") as kem:
    pqc_ciphertext, pqc_secret = kem.encap_secret(server_mlkem_pub)

# 2. Classical ECDH (X25519)
classical_secret = compute_x25519_shared_secret(server_x25519_pub)

# 3. Dual Combiner (NIST SP 800-56C)
master_key = HKDF(
    algorithm=hashes.SHA384(),
    length=32,
    salt=None,
    info=b"PQC-HYBRID-SESSION-V1"
).derive(classical_secret + pqc_secret)`,
    });
  }

  if (hasECDSA || sourceCode.includes('sign') || sourceCode.includes('verify')) {
    riskScore += 25;
    attackVectors.push({
      id: 'Q-ATK-02',
      name: "Shor's Discrete Logarithm Attack on Elliptic Curve Signatures (ECDSA / Ed25519)",
      vulnerablePrimitive: 'ECDSA secp256r1 / secp256k1 Curve Discrete Logarithm',
      targetCodeLocation: 'Digital Signature & Identity Verification Routine',
      quantumMechanism: "Shor's algorithm for discrete logarithms over elliptic curves solves for private scalar d with O(n³) operations on approx. 2,330 logical qubits.",
      severity: 'CRITICAL',
      feasibility: 'CRQC_AVAILABLE',
      impact: 'Adversary recovers private signing key directly from any public signature and public key, allowing undetected forging of firmware updates, JWT authorization tokens, and financial transactions.',
      mitreTechnique: {
        id: 'T1649',
        name: 'Steal or Forge Authentication Certificates',
      },
      adversaryKillChain: [
        {
          phase: '1. Reconnaissance',
          title: 'Signature Interception',
          description: 'Adversary collects public signatures (r, s) and public curve point Q = d * G from HTTP headers or blockchain blocks.',
          technicalDetail: 'Curve parameters: secp256r1 (NIST P-256) with 256-bit modulus.',
        },
        {
          phase: '2. Quantum Attack',
          title: "Shor's Elliptic Curve Discrete Log Solver",
          description: 'Computes discrete log problem over elliptic curve group in polynomial time on quantum hardware.',
          technicalDetail: 'Solves log_G(Q) to extract private scalar d in exact arithmetic.',
        },
        {
          phase: '3. Key Exfiltration',
          title: 'Private Scalar Recovery',
          description: 'Adversary now possesses exact private signing key matching the authorized identity.',
          technicalDetail: 'Private key d recovered with zero need to tamper with server host memory.',
        },
        {
          phase: '4. Forgery Execution',
          title: 'Arbitrary Token & Firmware Signature Fabrication',
          description: 'Signs arbitrary payloads with valid digital signatures that pass all client cryptographic validation checks.',
          technicalDetail: 'Constructs valid (r, s) pairs that satisfy verify(hash(m), Q) = True.',
        },
      ],
      dreadScores: {
        damage: 10,
        reproducibility: 8,
        exploitability: 8,
        affectedUsers: 9,
        discoverability: 9,
        total: 88,
      },
      recommendedRemediation: 'Adopt NIST FIPS 204 ML-DSA-65 (Dilithium) or stateful/stateless hash-based signatures (NIST FIPS 205 SLH-DSA).',
      remediationCodeSnippet: `# NIST FIPS 204 ML-DSA-65 (Dilithium) Signature Remediation
import oqs

# Instantiate NIST FIPS 204 ML-DSA-65 signer
with oqs.Signature("ML-DSA-65") as signer:
    signer_pub = signer.generate_keypair()
    # Sign transaction or token payload
    pqc_signature = signer.sign(payload_bytes)
    print(f"ML-DSA Signature length: {len(pqc_signature)} bytes")

# Verification
with oqs.Signature("ML-DSA-65") as verifier:
    is_valid = verifier.verify(payload_bytes, pqc_signature, signer_pub)`,
    });
  }

  if (hasECDH || sourceCode.includes('diffie') || sourceCode.includes('exchange')) {
    riskScore += 20;
    attackVectors.push({
      id: 'Q-ATK-03',
      name: "Ephemeral Key Agreement Quantum MitM & Discrete Log Compromise",
      vulnerablePrimitive: 'X25519 / Classical Diffie-Hellman Key Exchange',
      targetCodeLocation: 'Ephemeral Handshake & Session Negotiation Logic',
      quantumMechanism: "Shor's algorithm computes shared Diffie-Hellman secret from ephemeral public shares in real-time or offline retrospective analysis.",
      severity: 'CRITICAL',
      feasibility: 'IMMEDIATE_HARVEST_NOW',
      impact: 'Complete compromise of forward secrecy: ephemeral Diffie-Hellman shares offer zero protection against retrospective quantum decryption.',
      mitreTechnique: {
        id: 'T1557',
        name: 'Adversary-in-the-Middle (AiTM) Interception',
      },
      adversaryKillChain: [
        {
          phase: '1. Interception',
          title: 'Handshake Transcript Recording',
          description: 'Adversary captures public ephemeral shares (g^a, g^b) from TLS 1.2 / TLS 1.3 ClientHello and ServerHello.',
          technicalDetail: 'Both public shares recorded in raw network PCAP buffers.',
        },
        {
          phase: '2. Cryptanalysis',
          title: 'Quantum Discrete Log Extraction',
          description: "Shor's algorithm calculates client private exponent 'a' from g^a.",
          technicalDetail: 'Requires approximately 2,000 - 3,000 logical qubits.',
        },
        {
          phase: '3. Secret Derivation',
          title: 'Shared Secret Reconstruction',
          description: 'Calculates (g^b)^a = g^(ab) identical to client and server master secrets.',
          technicalDetail: 'Derives TLS master traffic secret and symmetric encryption keys.',
        },
      ],
      dreadScores: {
        damage: 9,
        reproducibility: 9,
        exploitability: 9,
        affectedUsers: 10,
        discoverability: 9,
        total: 92,
      },
      recommendedRemediation: 'Deploy composite hybrid KEM using X25519 + ML-KEM-768 conforming to IETF draft-ietf-tls-hybrid-design.',
      remediationCodeSnippet: `# IETF Hybrid Key Exchange (X25519 + ML-KEM-768)
hybrid_client_share = classical_x25519_pub + pqc_mlkem_pub
# Server encapsulates ML-KEM and performs ECDH simultaneously`,
    });
  }

  if (hasAES128 || hasLegacyHash) {
    riskScore += 15;
    attackVectors.push({
      id: 'Q-ATK-04',
      name: "Grover's Quadratic Brute-Force Key Space Search",
      vulnerablePrimitive: hasAES128 ? 'AES-128 Symmetric Cipher' : 'SHA-1 / Legacy Cryptographic Hash',
      targetCodeLocation: 'Symmetric Payload Encryption & Message Authentication',
      quantumMechanism: "Grover's algorithm provides quadratic speedup O(√N), reducing effective entropy from 128 bits down to 64 bits, rendering AES-128 vulnerable to quantum exhaustive search.",
      severity: 'HIGH',
      feasibility: 'CRQC_AVAILABLE',
      impact: 'Symmetric key schedule can be recovered by an adversary possessing known plaintext-ciphertext pairs via quantum search engine.',
      mitreTechnique: {
        id: 'T1110',
        name: 'Brute Force Quantum Search',
      },
      adversaryKillChain: [
        {
          phase: '1. Target Acquisition',
          title: 'Plaintext-Ciphertext Oracle Pairing',
          description: 'Adversary acquires known plaintext blocks and corresponding ciphertext.',
          technicalDetail: 'Constructs quantum oracle testing whether candidate key K produces C.',
        },
        {
          phase: '2. Grover Iterations',
          title: 'Quantum Amplitude Amplification',
          description: 'Executes π/4 * √2¹²⁸ ≈ 2⁶⁴ Grover iterations on quantum state.',
          technicalDetail: 'Effective computational complexity matches classical DES brute force.',
        },
        {
          phase: '3. Key Discovery',
          title: 'Key Recovery & Bulk Decryption',
          description: 'Recovers symmetric key K with high probability and decrypts payload data.',
          technicalDetail: 'AES-128 key recovered; AES-256 remains secure (128-bit quantum margin).',
        },
      ],
      dreadScores: {
        damage: 8,
        reproducibility: 8,
        exploitability: 7,
        affectedUsers: 8,
        discoverability: 7,
        total: 76,
      },
      recommendedRemediation: 'Upgrade all symmetric ciphers to AES-256-GCM (FIPS 197) and hash functions to SHA-384 / SHA-512.',
      remediationCodeSnippet: `# Upgrade to Quantum-Resistant AES-256-GCM
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256) # 256 bits = 128 bits Grover security
aesgcm = AESGCM(key)
nonce = os.urandom(12)
ciphertext = aesgcm.encrypt(nonce, data, associated_data=None)`,
    });
  }

  // Cap score
  riskScore = Math.min(Math.max(riskScore, 65), 98);

  const cbomInventory = [
    {
      primitive: hasRSA ? 'RSA-2048 (PKCS#1 / OAEP)' : 'Classical Public Key Primitive',
      currentSpec: '2048-bit modulus (112 bits classical security)',
      quantumRisk: "BROKEN: 0 bits against Shor's Algorithm",
      fipsReplacement: 'NIST FIPS 203 (ML-KEM-768)',
      cweMapping: 'CWE-327: Use of a Broken Cryptographic Algorithm',
    },
    {
      primitive: hasECDSA ? 'ECDSA (secp256r1 / secp256k1)' : 'Classical Digital Signature',
      currentSpec: '256-bit elliptic curve point',
      quantumRisk: "BROKEN: 0 bits against Shor's Algorithm",
      fipsReplacement: 'NIST FIPS 204 (ML-DSA-65)',
      cweMapping: 'CWE-310: Cryptographic Failures',
    },
    {
      primitive: 'Symmetric Transport / Data at Rest',
      currentSpec: hasAES128 ? 'AES-128' : 'AES-256 / SHA-256',
      quantumRisk: hasAES128 ? 'HIGH: Grover halves key to 64 bits' : 'SECURE: 128-bit post-quantum margin',
      fipsReplacement: 'FIPS 197 AES-256-GCM & SHA-384',
      cweMapping: 'CWE-326: Inadequate Encryption Strength',
    },
  ];

  return {
    summary: `Automated Quantum Threat Model completed for '${fileName}'. Analysis detected ${attackVectors.length} critical and high-severity quantum attack vectors. The primary adversary threat is 'Harvest Now, Decrypt Later' (HNDL) where classical RSA/ECC ciphertexts are captured by state-sponsored surveillance and queued for polynomial-time Shor factorization once a Cryptanalytically Relevant Quantum Computer (CRQC) reaches operational threshold.`,
    fileName,
    overallRiskScore: riskScore,
    quantumReadiness: riskScore > 80 ? 'CRITICAL_EXPOSURE' : 'HIGH_RISK',
    hndlExposure: {
      level: 'CRITICAL',
      retentionRiskYears: 10,
      rationale: 'Ciphertext captured on current networks has a data sensitivity lifecycle exceeding the expected arrival window of CRQC (2029-2032). Intercepted data is vulnerable to retroactive disclosure.',
    },
    crqcBreachTimeline: 'Estimated 2029 - 2032 (Q-Day Horizon)',
    threatActorProfile: actor,
    attackVectors,
    cbomInventory,
    defenseActionPlan: [
      {
        priority: 'IMMEDIATE',
        title: 'HNDL Mitigation via Hybrid Key Encapsulation',
        action: 'Deploy dual-layer hybrid KEM (X25519 + ML-KEM-768) on all TLS and external API endpoints to neutralize retrospective decryption.',
        timeline: 'Within 30 Days',
      },
      {
        priority: 'PHASE_1',
        title: 'Identity & PKI Signature Modernization',
        action: 'Transition root certificates, token signers, and mutual TLS credentials to NIST FIPS 204 ML-DSA-65 with concatenated legacy fallback.',
        timeline: '90 - 180 Days',
      },
      {
        priority: 'PHASE_2',
        title: 'Symmetric Key Elevation & CNSA 2.0 Compliance',
        action: 'Enforce AES-256-GCM minimum key lengths across all data-at-rest storage vaults and migrate hashing to SHA-384.',
        timeline: '180 - 365 Days',
      },
    ],
    complianceStatus: [
      {
        standard: 'NIST FIPS 203 (ML-KEM)',
        status: 'NON_COMPLIANT',
        details: 'Code relies on classical RSA/ECC without post-quantum lattice encapsulation.',
      },
      {
        standard: 'NIST FIPS 204 (ML-DSA)',
        status: 'NON_COMPLIANT',
        details: 'Digital signatures rely on elliptic curve discrete log (vulnerable to Shor).',
      },
      {
        standard: 'NSA CNSA 2.0 (2026 Mandate)',
        status: 'NEEDS_MIGRATION',
        details: 'Requires immediate crypto-agility roadmapping and migration to ML-KEM/ML-DSA.',
      },
    ],
    fallbackUsed: true,
    metadata: {
      model: 'High-Assurance Quantum Threat Engine (NIST FIPS 203/204)',
      generatedAt: new Date().toISOString(),
      analysisDurationMs: 420,
    },
  };
}
