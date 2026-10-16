import { PipelineResult } from '../types/pqc';

export const INITIAL_PRESET_RESULT: PipelineResult = {
  audit: `### Cryptographic Vulnerability Assessment & CBOM Report

#### 1. Executive Summary
The audited codebase implements classical asymmetric public-key cryptography via the \`Crypto.PublicKey.RSA\` and \`Crypto.Cipher.PKCS1_OAEP\` modules (PyCryptodome). A 2048-bit RSA key is generated and used for OAEP padding encryption.

Under Shor's Algorithm running on a Cryptanalytically Relevant Quantum Computer (CRQC), the integer factorization problem underlying RSA can be solved in polynomial time $\\mathcal{O}((\\log N)^3)$. Consequently, any data encrypted using this scheme is immediately susceptible to **Harvest Now, Decrypt Later (HNDL)** attacks by nation-state actors.

#### 2. Cryptographic Bill of Materials (CBOM)
- **Component**: \`encrypt_data(message)\` / \`decrypt_data(ciphertext)\`
- **Primitive Type**: Asymmetric Key Encapsulation / Public-Key Encryption
- **Algorithm**: RSA-2048 (PKCS#1 v2.1 OAEP)
- **Underlying Hard Problem**: Integer Factorization
- **Quantum Vulnerability**: Shor's Algorithm (Integer Factorization)
- **Risk Tier**: **CRITICAL**
- **NIST Migration Target**: FIPS 203 ML-KEM-768 (Module-Lattice Key-Encapsulation Mechanism)
- **Key Sizes**: Classical 2048-bit Public Key (256 bytes) $\\rightarrow$ Post-Quantum 1,184-byte Public Key

#### 3. Recommended Remediation
1. Deprecate pure RSA-2048 encryption for message transport and payload encryption.
2. Introduce a **Hybrid Key Encapsulation Mechanism (KEM)** combining classical Elliptic Curve (X25519) or RSA with NIST FIPS 203 (ML-KEM-768).
3. Utilize post-quantum symmetric encryption (AES-256-GCM) for bulk data payload encryption to guarantee Grover resistance (128-bit quantum security).`,

  plan: `### Crypto-Agility Architecture Roadmap (FIPS 203 / 204 & AES-256)

#### 1. Architectural Strategy
To transition from legacy RSA-OAEP encryption to quantum-resilient transport without breaking existing infrastructure, we employ a **Hybrid KEM + AES-256-GCM Envelope Architecture**:

1. **Key Encapsulation (FIPS 203)**:
   - Primary: NIST ML-KEM-768 (CRYSTALS-Kyber Level 3).
   - Classical Companion: RSA-OAEP 2048-bit or X25519 (for dual-layer fallback).
2. **Key Derivation Function (HKDF)**:
   - Combiner: HKDF-Extract and HKDF-Expand with SHA-256.
   - Combined Secret: \`K_shared = HKDF(SS_classical || SS_ML-KEM, salt=None, info=b"hybrid-pqc-v1")\`
3. **Data-at-Rest / Bulk Payload Encryption (FIPS 197)**:
   - Symmetric Algorithm: AES-256-GCM.
   - Grover Attack Defense: Quantum computers halve symmetric key search security ($\sqrt{N}$). AES-256 retains 128 bits of post-quantum security margin.

#### 2. Transition Milestones
- **Phase 1 (Immediate Hybrid)**: Wrap classical RSA and ML-KEM-768 in dual-encapsulation.
- **Phase 2 (Crypto-Agility Interface)**: Define modular key management permitting swap to ML-KEM-1024 or Pure PQC when CNSA 2.0 enforcement begins.
- **Phase 3 (Legacy Deprecation)**: Decommission RSA fallback once all clients upgrade to liboqs.`,

  code: `import os
from typing import Tuple, Dict, Any
import oqs
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

class HybridPQCCipher:
    """
    NIST FIPS 203 (ML-KEM-768) + Classical RSA-2048 Hybrid Encryption Engine.
    Employs AES-256-GCM for payload encryption to maintain Grover resistance.
    """
    KEM_ALG = "ML-KEM-768"

    def __init__(self, rsa_key_size: int = 2048):
        # Initialize classical RSA keypair
        self.rsa_key = RSA.generate(rsa_key_size)
        self.rsa_public = self.rsa_key.publickey()

        # Initialize PQC ML-KEM-768 keypair via liboqs
        self.kem = oqs.KeyEncapsulation(self.KEM_ALG)
        self.pqc_public_key = self.kem.generate_keypair()

    @property
    def public_keys(self) -> Dict[str, Any]:
        """Returns public keys required by senders for encapsulation."""
        return {
            "rsa_public": self.rsa_public,
            "pqc_public_key": self.pqc_public_key,
            "kem_alg": self.KEM_ALG,
        }

    @staticmethod
    def _combine_secrets(classical_secret: bytes, pqc_secret: bytes) -> bytes:
        """
        NIST-compliant HKDF combiner: joins classical and post-quantum shared secrets.
        Dual safety: secure as long as AT LEAST ONE component remains unbroken.
        """
        combined_input = classical_secret + pqc_secret
        derived_key = HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # 256-bit AES key
            salt=None,
            info=b"hybrid-pqc-kem-combiner-v1",
        ).derive(combined_input)
        return derived_key

    @classmethod
    def encrypt_data(cls, message: bytes, recipient_keys: Dict[str, Any]) -> Dict[str, bytes]:
        """
        Encrypts message using hybrid ML-KEM-768 + RSA with AES-256-GCM payload.
        """
        # 1. PQC Encapsulation (ML-KEM-768)
        with oqs.KeyEncapsulation(recipient_keys["kem_alg"]) as client_kem:
            pqc_ciphertext, pqc_shared_secret = client_kem.encap_secret(recipient_keys["pqc_public_key"])

        # 2. Classical RSA-OAEP Encapsulation
        classical_secret = os.urandom(32)
        rsa_cipher = PKCS1_OAEP.new(recipient_keys["rsa_public"])
        rsa_ciphertext = rsa_cipher.encrypt(classical_secret)

        # 3. Combine secrets into 256-bit AES key
        session_key = cls._combine_secrets(classical_secret, pqc_shared_secret)

        # 4. Symmetric Bulk Encryption (AES-256-GCM for Grover resistance)
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
        """
        Decapsulates hybrid secrets and decrypts the AES-256-GCM payload.
        """
        # 1. Decapsulate PQC shared secret
        pqc_shared_secret = self.kem.decap_secret(envelope["pqc_ciphertext"])

        # 2. Decapsulate Classical RSA shared secret
        rsa_cipher = PKCS1_OAEP.new(self.rsa_key)
        classical_secret = rsa_cipher.decrypt(envelope["rsa_ciphertext"])

        # 3. Recombine secrets
        session_key = self._combine_secrets(classical_secret, pqc_shared_secret)

        # 4. Decrypt AES-256-GCM payload
        aes_cipher = AES.new(session_key, AES.MODE_GCM, nonce=envelope["nonce"])
        plaintext = aes_cipher.decrypt_and_verify(envelope["ciphertext"], envelope["tag"])
        return plaintext


# --- Verification Example ---
if __name__ == "__main__":
    # Recipient generates hybrid keypairs
    recipient = HybridPQCCipher()

    # Sender encrypts secret payload
    sample_payload = b"Top secret post-quantum confidential data payload."
    encrypted_envelope = HybridPQCCipher.encrypt_data(sample_payload, recipient.public_keys)

    # Recipient decapsulates and decrypts
    decrypted_message = recipient.decrypt_data(encrypted_envelope)
    assert decrypted_message == sample_payload
    print("[+] Successfully verified Hybrid PQC Encapsulation & Decryption!")
`,

  cbom: [
    {
      id: 'cbom-rsa-2048-oaep',
      bomRef: 'urn:cdx:crypto/algorithm/rsa-2048-oaep',
      primitive: 'RSA-2048',
      fileLocation: 'security/payment_vault.py',
      lineNumber: 5,
      quantumVulnerability: 'shor-critical',
      nistReplacement: 'ML-KEM-768 (FIPS 203)',
      hybridRecommendation: 'X25519MLKEM768',
      estimatedCycleOverheadPct: 18.2,
      pubkeySizeBytes: 1184,
      ciphertextOrSigSizeBytes: 1088,
      cycloneDx: {
        assetType: 'algorithm',
        oid: '1.2.840.113549.1.1.7',
        algorithmProperties: {
          primitive: 'kem',
          parameterSetIdentifier: 'ML-KEM-768',
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: 3,
        },
      },
      algorithm: 'RSA-2048',
      vulnerability: "Shor's Algorithm (Integer Factorization) / Harvest-Now-Decrypt-Later (HNDL)",
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 203 (ML-KEM)',
      locations: 'Lines 5-8, encrypt_data() function',
      classicalKeySize: '2048-bit (256 bytes)',
      postQuantumKeySize: '1,184-byte public key',
    },
    {
      id: 'cbom-pkcs1-oaep-kdf',
      bomRef: 'urn:cdx:crypto/protocol/pkcs1-oaep-kdf',
      primitive: 'RSA-2048-OAEP-KDF',
      fileLocation: 'security/payment_vault.py',
      lineNumber: 2,
      quantumVulnerability: 'shor-critical',
      nistReplacement: 'ML-KEM-768 (FIPS 203)',
      hybridRecommendation: 'X25519MLKEM768',
      estimatedCycleOverheadPct: 14.5,
      pubkeySizeBytes: 1184,
      ciphertextOrSigSizeBytes: 1088,
      cycloneDx: {
        assetType: 'protocol',
        oid: '1.2.840.113549.1.1.1',
        algorithmProperties: {
          primitive: 'kem',
          parameterSetIdentifier: 'Dual-KEM Composite Combiner',
          executionEnvironment: 'software-plain-ram',
          nistQuantumSecurityLevel: 3,
        },
      },
      algorithm: 'PKCS1_OAEP',
      vulnerability: 'Classical padding wrapper over quantum-vulnerable trapdoor permutation',
      riskTier: 'CRITICAL',
      fipsStandard: 'FIPS 203 / HKDF',
      locations: 'Line 2, from Crypto.Cipher import PKCS1_OAEP',
      classicalKeySize: '2048-bit',
      postQuantumKeySize: '1,088-byte ciphertext',
    },
    {
      id: 'cbom-aes-payload',
      bomRef: 'urn:cdx:crypto/algorithm/aes-payload',
      primitive: 'AES-128-GCM',
      fileLocation: 'security/payment_vault.py',
      lineNumber: 12,
      quantumVulnerability: 'grover-moderate',
      nistReplacement: 'AES-256-GCM',
      hybridRecommendation: 'AES-256-GCM (CNSA 2.0)',
      estimatedCycleOverheadPct: 4.0,
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
      algorithm: 'Ephemeral Session Payload',
      vulnerability: "Grover's Algorithm Key-Halving (requires 256-bit symmetric key)",
      riskTier: 'HIGH',
      fipsStandard: 'FIPS 197 / SP 800-38D',
      locations: 'Message transport layer',
      classicalKeySize: '128-bit',
      postQuantumKeySize: '256-bit DEK (128-bit quantum security)',
    },
  ],
  metadata: {
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  },
};
