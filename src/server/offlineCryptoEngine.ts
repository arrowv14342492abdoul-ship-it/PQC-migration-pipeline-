import type { CbomItem, PipelineOptions } from '../types/pqc.ts';

export interface OfflineAnalysisResult {
  audit: string;
  plan: string;
  code: string;
  cbom: CbomItem[];
}

export function generateOfflinePqcAnalysis(
  legacyCode: string,
  options?: Partial<PipelineOptions>
): OfflineAnalysisResult {
  const nistLevel = options?.nistLevel || 'Level 3 (ML-KEM-768 / ML-DSA-65)';
  const library = options?.library || 'liboqs-python (Open Quantum Safe)';
  const hybridMode = options?.hybridMode || 'Dual-KEM Composite (KDF Combiner)';

  const hasRSA = /rsa|pkcs1|pkcs|cipher\.new/i.test(legacyCode);
  const hasECDSA = /ecdsa|ec\.generate|elliptic|secp256r1|secp384r1|sign/i.test(legacyCode);
  const hasECDH = /ecdh|x25519|x448|exchange|diffie/i.test(legacyCode);
  const hasAES = /aes|cipher|gcm|cbc|ctr/i.test(legacyCode);

  const kemAlg = nistLevel.includes('Level 1')
    ? 'ML-KEM-512'
    : nistLevel.includes('Level 5')
    ? 'ML-KEM-1024'
    : 'ML-KEM-768';

  const dsaAlg = nistLevel.includes('Level 1')
    ? 'ML-DSA-44'
    : nistLevel.includes('Level 5')
    ? 'ML-DSA-87'
    : 'ML-DSA-65';

  const cbom: CbomItem[] = [];

  const nistLevelInt = nistLevel.includes('Level 1') ? 1 : nistLevel.includes('Level 5') ? 5 : 3;

  if (hasRSA) {
    cbom.push({
      id: 'cbom-rsa-2048',
      bomRef: 'urn:cdx:crypto/algorithm/rsa-2048',
      primitive: 'RSA-2048',
      fileLocation: 'security/crypto_vault.py',
      lineNumber: 14,
      quantumVulnerability: 'shor-critical',
      nistReplacement: `${kemAlg} (FIPS 203)`,
      hybridRecommendation: `X25519${kemAlg.replace('-', '')}`,
      estimatedCycleOverheadPct: 18.5,
      pubkeySizeBytes: kemAlg === 'ML-KEM-512' ? 800 : kemAlg === 'ML-KEM-1024' ? 1568 : 1184,
      ciphertextOrSigSizeBytes: kemAlg === 'ML-KEM-512' ? 768 : kemAlg === 'ML-KEM-1024' ? 1568 : 1088,
      cycloneDx: {
        assetType: 'algorithm',
        oid: '1.2.840.113549.1.1.1',
        algorithmProperties: {
          primitive: 'kem',
          parameterSetIdentifier: kemAlg,
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: nistLevelInt as 1 | 3 | 5,
        },
      },
      algorithm: 'RSA-2048',
      vulnerability: "Shor's Algorithm (Integer Factorization) / Harvest-Now-Decrypt-Later (HNDL)",
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 203 (ML-KEM)',
      locations: 'Key generation and encryption blocks',
      classicalKeySize: '2048-bit (256 bytes)',
      postQuantumKeySize: `${kemAlg === 'ML-KEM-512' ? 800 : kemAlg === 'ML-KEM-1024' ? 1568 : 1184}-byte public key`,
    });
  }

  if (hasECDSA) {
    cbom.push({
      id: 'cbom-ecdsa-p256',
      bomRef: 'urn:cdx:crypto/algorithm/ecdsa-p256',
      primitive: 'ECDSA-P256',
      fileLocation: 'security/signature_signer.py',
      lineNumber: 28,
      quantumVulnerability: 'shor-critical',
      nistReplacement: `${dsaAlg} (FIPS 204)`,
      hybridRecommendation: `ECDSA-P256 + ${dsaAlg}`,
      estimatedCycleOverheadPct: 22.0,
      pubkeySizeBytes: dsaAlg === 'ML-DSA-44' ? 1312 : dsaAlg === 'ML-DSA-87' ? 2592 : 1952,
      ciphertextOrSigSizeBytes: dsaAlg === 'ML-DSA-44' ? 2420 : dsaAlg === 'ML-DSA-87' ? 4595 : 3309,
      cycloneDx: {
        assetType: 'algorithm',
        oid: '1.2.840.10045.2.1',
        algorithmProperties: {
          primitive: 'signature',
          parameterSetIdentifier: dsaAlg,
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: nistLevelInt as 1 | 3 | 5,
        },
      },
      algorithm: 'ECDSA secp256r1',
      vulnerability: "Shor's Algorithm (Elliptic Curve Discrete Logarithm)",
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 204 (ML-DSA)',
      locations: 'Signature generation and verification paths',
      classicalKeySize: '256-bit',
      postQuantumKeySize: `${dsaAlg === 'ML-DSA-44' ? 1312 : dsaAlg === 'ML-DSA-87' ? 2592 : 1952}-byte public key`,
    });
  }

  if (hasECDH) {
    cbom.push({
      id: 'cbom-ecdh-x25519',
      bomRef: 'urn:cdx:crypto/protocol/x25519-ecdh',
      primitive: 'X25519 / ECDH',
      fileLocation: 'security/handshake.py',
      lineNumber: 19,
      quantumVulnerability: 'shor-critical',
      nistReplacement: `X25519 + ${kemAlg}`,
      hybridRecommendation: `X25519${kemAlg.replace('-', '')}`,
      estimatedCycleOverheadPct: 15.3,
      pubkeySizeBytes: 32 + (kemAlg === 'ML-KEM-512' ? 800 : kemAlg === 'ML-KEM-1024' ? 1568 : 1184),
      ciphertextOrSigSizeBytes: 32 + (kemAlg === 'ML-KEM-512' ? 768 : kemAlg === 'ML-KEM-1024' ? 1568 : 1088),
      cycloneDx: {
        assetType: 'protocol',
        oid: '1.3.101.110',
        algorithmProperties: {
          primitive: 'kem',
          parameterSetIdentifier: `Hybrid-X25519-${kemAlg}`,
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: nistLevelInt as 1 | 3 | 5,
        },
      },
      algorithm: 'X25519 / ECDH',
      vulnerability: "Shor's Algorithm (Discrete Logarithm) / HNDL Passive Eavesdropping",
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 203 (Hybrid KEM)',
      locations: 'Shared secret derivation routines',
      classicalKeySize: '256-bit',
      postQuantumKeySize: '1,088-byte ciphertext',
    });
  }

  if (hasAES || cbom.length === 0) {
    cbom.push({
      id: 'cbom-aes-256-gcm',
      bomRef: 'urn:cdx:crypto/algorithm/aes-256-gcm',
      primitive: 'AES-256-GCM',
      fileLocation: 'security/payload_cipher.py',
      lineNumber: 45,
      quantumVulnerability: 'grover-moderate',
      nistReplacement: 'AES-256-GCM',
      hybridRecommendation: 'AES-256-GCM (CNSA 2.0)',
      estimatedCycleOverheadPct: 3.5,
      pubkeySizeBytes: 0,
      ciphertextOrSigSizeBytes: 16,
      cycloneDx: {
        assetType: 'algorithm',
        oid: '2.16.840.1.101.3.4.1.46',
        algorithmProperties: {
          primitive: 'ae',
          parameterSetIdentifier: 'AES-256-GCM',
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: 5,
        },
      },
      algorithm: 'AES / Symmetric Transport',
      vulnerability: "Grover's Algorithm quadratic key-search speedup (halves effective bits)",
      riskTier: 'HIGH',
      fipsStandard: 'FIPS 197 / SP 800-38D',
      locations: 'Payload encryption layer',
      classicalKeySize: '128-bit / 256-bit',
      postQuantumKeySize: '256-bit DEK (128-bit quantum security)',
    });
  }

  // Fallback if none detected
  if (cbom.length === 0) {
    cbom.push({
      id: 'cbom-generic-classical',
      bomRef: 'urn:cdx:crypto/algorithm/generic-asymmetric',
      primitive: 'Classical Asymmetric Primitive',
      fileLocation: 'security/crypto_module.py',
      lineNumber: 1,
      quantumVulnerability: 'shor-critical',
      nistReplacement: `${kemAlg} / ${dsaAlg}`,
      hybridRecommendation: `Composite-Hybrid-${kemAlg}`,
      estimatedCycleOverheadPct: 20.0,
      pubkeySizeBytes: 1184,
      ciphertextOrSigSizeBytes: 1088,
      cycloneDx: {
        assetType: 'algorithm',
        algorithmProperties: {
          primitive: 'kem',
          parameterSetIdentifier: kemAlg,
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: nistLevelInt as 1 | 3 | 5,
        },
      },
      algorithm: 'Classical Asymmetric Primitive',
      vulnerability: "Shor's Algorithm Polynomial-Time Decryption",
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 203 & 204',
      locations: 'Codebase crypto imports',
      classicalKeySize: 'Legacy',
      postQuantumKeySize: 'NIST Standard',
    });
  }

  const auditReport = `### Cryptographic Vulnerability Assessment & CBOM (High-Assurance Report)

#### 1. Scope & Executive Overview
The scanned codebase relies on classical asymmetric primitives (${cbom.map((c) => c.algorithm).join(', ')}). 
These algorithms depend directly on the mathematical difficulty of **Integer Factorization** or the **Discrete Logarithm Problem**.

Under **Shor’s Algorithm** running on a Cryptanalytically Relevant Quantum Computer (CRQC), these mathematical problems can be solved in polynomial time $\\mathcal{O}((\\log N)^3)$. Any captured ciphertext is permanently vulnerable to **Harvest Now, Decrypt Later (HNDL)** attacks.

#### 2. Cryptographic Bill of Materials (CBOM)
${cbom
  .map(
    (c, i) => `**Asset #${i + 1}: ${c.algorithm}**
- Primitive Type: \`${c.primitive}\`
- Threat Vector: ${c.vulnerability}
- Risk Level: **${c.riskTier}**
- NIST Standard Replacement: **${c.fipsStandard}** $\\rightarrow$ \`${c.nistReplacement}\`
- Key Metrics: Classical ${c.classicalKeySize} vs Post-Quantum ${c.postQuantumKeySize}
`
  )
  .join('\n')}

#### 3. Immediate Quantum Remediation Requirements
1. **Mandatory Hybrid Transition**: Deploy dual-layer KEM / signature combiners to satisfy CNSA 2.0 guidelines without sacrificing FIPS 140-3 backward compatibility.
2. **Symmetric Margin Hardening**: Enforce **AES-256-GCM** across all data-at-rest to retain a minimum of 128 bits of security against Grover's algorithm.
3. **Crypto-Agility Interface**: Implement modular encapsulation contracts permitting dynamic parameter updates between ${kemAlg} and ${dsaAlg}.`;

  const architecturePlan = `### Crypto-Agility Architecture Roadmap (FIPS 203 / 204 & AES-256)

#### 1. Target Standards Matrix
- **Key Encapsulation (FIPS 203)**: \`${kemAlg}\` (Module-Lattice KEM)
- **Digital Signatures (FIPS 204)**: \`${dsaAlg}\` (Module-Lattice DSA)
- **Stateless Backup (FIPS 205)**: SLH-DSA (SPHINCS+) for long-term root trust
- **Bulk Payload Encryption (FIPS 197)**: AES-256-GCM (Grover-resistant 128-bit quantum security)

#### 2. Hybrid Composability Architecture (${hybridMode})
\`\`\`
   [ Sender / Initiator ]                       [ Receiver / Target ]
             │                                            │
             ├── ML-KEM Encapsulation (PQC) ──────────────►
             ├── Classical RSA/ECDH Encapsulation ────────►
             │                                            │
      ┌──────┴────────────────────────────────────────────┴──────┐
      │   KDF Combiner: SS = HKDF(SS_classical || SS_PQC, salt)  │
      └──────────────────────────┬───────────────────────────────┘
                                 │
                   [ AES-256-GCM Ciphertext Payload ]
\`\`\`

#### 3. Transition Phasing (CNSA 2.0 Compliant)
- **Phase 1 (2025-2027)**: Hybrid Dual-Layer deployment (Classical + ${kemAlg}).
- **Phase 2 (2028-2030)**: Default PQC negotiation in TLS/API handshakes.
- **Phase 3 (2033)**: Mandatory deprecation of RSA-2048 and classical ECC.`;

  let codeOutput = '';

  if (hasECDSA && !hasRSA) {
    codeOutput = `import oqs
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from typing import Tuple, Dict, Any

class HybridPQCSigner:
    """
    NIST FIPS 204 (${dsaAlg}) + Classical ECDSA (P-256) Hybrid Signature Scheme.
    Ensures crypto-agility: both signatures must validate for payload acceptance.
    """
    SIG_ALG = "${dsaAlg}"

    def __init__(self):
        # 1. Classical ECDSA key pair
        self.classical_private = ec.generate_private_key(ec.SECP256R1())
        self.classical_public = self.classical_private.public_key()

        # 2. Post-Quantum Signature key pair via liboqs
        self.signer = oqs.Signature(self.SIG_ALG)
        self.pqc_public_key = self.signer.generate_keypair()

    @property
    def public_keys(self) -> Dict[str, Any]:
        return {
            "classical_public": self.classical_public,
            "pqc_public_key": self.pqc_public_key,
            "sig_alg": self.SIG_ALG,
        }

    def sign_payload(self, message: bytes) -> Dict[str, bytes]:
        """Generates dual concatenated signatures."""
        classical_sig = self.classical_private.sign(message, ec.ECDSA(hashes.SHA256()))
        pqc_sig = self.signer.sign(message)
        return {
            "classical_signature": classical_sig,
            "pqc_signature": pqc_sig,
            "sig_alg": self.SIG_ALG,
        }

    @staticmethod
    def verify_payload(
        message: bytes,
        signatures: Dict[str, bytes],
        public_keys: Dict[str, Any]
    ) -> bool:
        """Verifies both classical and post-quantum signatures."""
        try:
            # 1. Verify Classical ECDSA
            public_keys["classical_public"].verify(
                signatures["classical_signature"],
                message,
                ec.ECDSA(hashes.SHA256())
            )
            # 2. Verify Post-Quantum ML-DSA
            with oqs.Signature(public_keys["sig_alg"]) as verifier:
                is_pqc_valid = verifier.verify(
                    message,
                    signatures["pqc_signature"],
                    public_keys["pqc_public_key"]
                )
            return is_pqc_valid
        except Exception:
            return False

if __name__ == "__main__":
    signer = HybridPQCSigner()
    msg = b"Authenticated post-quantum mission payload."
    sig_bundle = signer.sign_payload(msg)
    valid = HybridPQCSigner.verify_payload(msg, sig_bundle, signer.public_keys)
    assert valid is True
    print("[+] Successfully verified NIST FIPS 204 Hybrid Dual-Signature!")
`;
  } else {
    codeOutput = `import os
from typing import Dict, Any
import oqs
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

class HybridPQCCipher:
    """
    NIST FIPS 203 (${kemAlg}) + Classical RSA-2048 Hybrid Encryption Engine.
    Uses AES-256-GCM for Grover-resistant data payload encryption.
    """
    KEM_ALG = "${kemAlg}"

    def __init__(self, rsa_key_size: int = 2048):
        # 1. Classical RSA key pair
        self.rsa_key = RSA.generate(rsa_key_size)
        self.rsa_public = self.rsa_key.publickey()

        # 2. Post-Quantum ML-KEM key pair via liboqs
        self.kem = oqs.KeyEncapsulation(self.KEM_ALG)
        self.pqc_public_key = self.kem.generate_keypair()

    @property
    def public_keys(self) -> Dict[str, Any]:
        return {
            "rsa_public": self.rsa_public,
            "pqc_public_key": self.pqc_public_key,
            "kem_alg": self.KEM_ALG,
        }

    @staticmethod
    def _combine_secrets(classical_secret: bytes, pqc_secret: bytes) -> bytes:
        """NIST HKDF Combiner: joins classical and PQC secrets."""
        combined_material = classical_secret + pqc_secret
        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # 256-bit AES key
            salt=None,
            info=b"hybrid-pqc-kem-combiner-v1",
        ).derive(combined_material)

    @classmethod
    def encrypt_data(cls, message: bytes, recipient_keys: Dict[str, Any]) -> Dict[str, bytes]:
        """Hybrid encapsulation with AES-256-GCM payload encryption."""
        # 1. PQC Encapsulation (${kemAlg})
        with oqs.KeyEncapsulation(recipient_keys["kem_alg"]) as client_kem:
            pqc_ciphertext, pqc_shared_secret = client_kem.encap_secret(recipient_keys["pqc_public_key"])

        # 2. Classical RSA-OAEP Encapsulation
        classical_secret = os.urandom(32)
        rsa_cipher = PKCS1_OAEP.new(recipient_keys["rsa_public"])
        rsa_ciphertext = rsa_cipher.encrypt(classical_secret)

        # 3. Derive combined 256-bit symmetric session key
        session_key = cls._combine_secrets(classical_secret, pqc_shared_secret)

        # 4. Symmetric encryption with AES-256-GCM (Grover-hardened)
        aes_cipher = AES.new(session_key, AES.MODE_GCM)
        ciphertext, tag = aes_cipher.encrypt_and_digest(message)

        return {
            "pqc_ciphertext": pqc_ciphertext,
            "rsa_ciphertext": rsa_ciphertext,
            "nonce": aes_cipher.nonce,
            "tag": tag,
            "ciphertext": ciphertext,
        }

    def decrypt_data(self, envelope: Dict[str, bytes]) -> bytes:
        """Decapsulates hybrid secrets and verifies AES-256-GCM payload."""
        # 1. Decapsulate PQC shared secret
        pqc_shared_secret = self.kem.decap_secret(envelope["pqc_ciphertext"])

        # 2. Decapsulate Classical RSA secret
        rsa_cipher = PKCS1_OAEP.new(self.rsa_key)
        classical_secret = rsa_cipher.decrypt(envelope["rsa_ciphertext"])

        # 3. Recombine session key
        session_key = self._combine_secrets(classical_secret, pqc_shared_secret)

        # 4. Decrypt AES-256-GCM payload
        aes_cipher = AES.new(session_key, AES.MODE_GCM, nonce=envelope["nonce"])
        return aes_cipher.decrypt_and_verify(envelope["ciphertext"], envelope["tag"])

if __name__ == "__main__":
    recipient = HybridPQCCipher()
    data = b"Confidential payload protected by NIST FIPS 203 Hybrid Encryption."
    envelope = HybridPQCCipher.encrypt_data(data, recipient.public_keys)
    decrypted = recipient.decrypt_data(envelope)
    assert decrypted == data
    print("[+] Successfully verified NIST FIPS 203 (${kemAlg}) Hybrid Encapsulation!")
`;
  }

  return {
    audit: auditReport,
    plan: architecturePlan,
    code: codeOutput,
    cbom,
  };
}
