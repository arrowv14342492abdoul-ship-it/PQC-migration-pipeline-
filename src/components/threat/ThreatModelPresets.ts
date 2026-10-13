export interface ThreatModelPreset {
  id: string;
  name: string;
  fileName: string;
  language: string;
  description: string;
  primaryRisk: string;
  code: string;
}

export const THREAT_MODEL_PRESETS: ThreatModelPreset[] = [
  {
    id: 'legacy-rsa-payment-vault',
    name: 'Banking Payment Vault (RSA-2048 + PKCS#1)',
    fileName: 'payment_vault_service.py',
    language: 'python',
    description: 'Credit card PAN ingestion endpoint using 2048-bit RSA asymmetric encryption and AES-128 transport.',
    primaryRisk: "Shor's Factorization & HNDL Eavesdropping",
    code: `"""
Production Payment Vault Ingestion Gateway
Handles cardholder PAN encryption and storage.
WARNING: Vulnerable to Harvest Now, Decrypt Later (HNDL) and Shor's Algorithm.
"""
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5, AES
from Crypto.Random import get_random_bytes
import base64
import hashlib

class PaymentVaultIngestion:
    def __init__(self, rsa_public_key_pem: str):
        # Classical 2048-bit RSA public key
        self.recipient_pubkey = RSA.import_key(rsa_public_key_pem)

    def encrypt_cardholder_payload(self, pan: str, cvv: str, expiry: str) -> dict:
        # Step 1: Generate ephemeral 128-bit AES data-encryption key (DEK)
        # Quantum Vulnerability: Grover's search halves entropy to 64 bits
        dek = get_random_bytes(16)
        
        # Step 2: Encrypt cardholder data with AES-CBC
        iv = get_random_bytes(16)
        cipher_aes = AES.new(dek, AES.MODE_CBC, iv)
        raw_payload = f"{pan}:{cvv}:{expiry}".encode('utf-8')
        padded_payload = self._pad(raw_payload)
        ciphertext = cipher_aes.encrypt(padded_payload)
        
        # Step 3: Wrap AES DEK using classical RSA-2048 PKCS#1 v1.5
        # CRITICAL VULNERABILITY: Shor's algorithm polynomial-time factoring
        cipher_rsa = PKCS1_v1_5.new(self.recipient_pubkey)
        wrapped_dek = cipher_rsa.encrypt(dek)
        
        # Step 4: Legacy SHA-1 hash for integrity
        # Vulnerable to collision attacks
        integrity_checksum = hashlib.sha1(raw_payload).hexdigest()
        
        return {
            "wrapped_dek": base64.b64encode(wrapped_dek).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode(),
            "iv": base64.b64encode(iv).decode(),
            "integrity_sha1": integrity_checksum,
            "algorithm": "RSA-2048/PKCS1-v1.5 + AES-128-CBC"
        }

    def _pad(self, data: bytes) -> bytes:
        pad_len = 16 - (len(data) % 16)
        return data + bytes([pad_len] * pad_len)
`,
  },
  {
    id: 'crypto-wallet-ecdsa',
    name: 'Crypto Custody Signer (ECDSA secp256k1)',
    fileName: 'cold_storage_signer.py',
    language: 'python',
    description: 'Cryptocurrency transaction authorization module using secp256k1 elliptic curve signatures.',
    primaryRisk: "Shor's Discrete Logarithm Private Key Extraction",
    code: `"""
Institutional Asset Custody Signer
Signs Bitcoin / Ethereum multi-sig withdrawal transactions.
WARNING: secp256k1 discrete log is solvable via Shor's algorithm on CRQC (~2,330 logical qubits).
"""
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
import base64

class CustodyTransactionSigner:
    def __init__(self, private_key_pem: bytes):
        # Classical Elliptic Curve Private Key (secp256k1 / SECP256R1)
        self.signing_key = ec.generate_private_key(ec.SECP256R1())
        self.public_key = self.signing_key.public_key()

    def sign_withdrawal_proposal(self, tx_hash_bytes: bytes) -> dict:
        # Generate ECDSA digital signature over tx hash
        # CRITICAL VULNERABILITY:
        # A quantum adversary with Shor's algorithm can calculate the private scalar 'd'
        # directly from the public key Q = d * G, allowing unauthorized transaction forgery!
        signature = self.signing_key.sign(
            tx_hash_bytes,
            ec.ECDSA(hashes.SHA256())
        )
        
        return {
            "signature_der": base64.b64encode(signature).decode('utf-8'),
            "curve": "SECP256R1 (secp256k1 equivalent)",
            "hash": "SHA-256",
            "quantum_status": "VULNERABLE_TO_SHOR_DISCRETE_LOG"
        }
`,
  },
  {
    id: 'mesh-tls-handshake',
    name: 'Zero-Trust Mesh Gateway (X25519 ECDH + AES-GCM)',
    fileName: 'mesh_tls_handshake.go',
    language: 'go',
    description: 'Cloud-native service mesh inter-cluster tunnel using classical X25519 Diffie-Hellman key exchange.',
    primaryRisk: 'HNDL Passive Interception & Forward Secrecy Nullification',
    code: `package security

import (
	"crypto/cipher"
	"crypto/rand"
	"golang.org/x/crypto/curve25519"
	"io"
)

// InterClusterTunnel negotiates an ephemeral session key between microservice enclaves.
// WARNING: While classical forward secrecy holds today, an adversary buffering wire traffic
// will use Shor's algorithm to compute the discrete log of public shares, breaking all past traffic!
type InterClusterTunnel struct {
	PrivateKey [32]byte
	PublicKey  [32]byte
}

func NewTunnel() (*InterClusterTunnel, error) {
	t := &InterClusterTunnel{}
	if _, err := io.ReadFull(rand.Reader, t.PrivateKey[:]); err != nil {
		return nil, err
	}
	// Classical X25519 Base Point Multiplication
	curve25519.ScalarBaseMult(&t.PublicKey, &t.PrivateKey)
	return t, nil
}

// DeriveSessionSecret computes shared secret with peer's public key.
// QUANTUM VULNERABILITY: Ephemeral DH offers ZERO resistance to retrospective quantum cryptanalysis.
func (t *InterClusterTunnel) DeriveSessionSecret(peerPublic [32]byte) ([]byte, error) {
	var sharedSecret [32]byte
	curve25519.ScalarMult(&sharedSecret, &t.PrivateKey, &peerPublic)
	return sharedSecret[:], nil
}
`,
  },
  {
    id: 'jwt-auth-service',
    name: 'Enterprise SSO & JWT Provider (RS256)',
    fileName: 'jwt_token_provider.ts',
    language: 'typescript',
    description: 'Identity provider issuing RS256-signed JWT access tokens with JWKS public certificate rotation.',
    primaryRisk: 'Quantum Certificate Forgery & Identity Hijack',
    code: `import * as crypto from 'crypto';

/**
 * Enterprise Single Sign-On (SSO) OAuth2 / OIDC Token Provider
 * Issues signed JWT bearer credentials for distributed microservices.
 *
 * QUANTUM ATTACK VECTOR:
 * Shor's algorithm recovers the RSA private key from the published JWKS certificate.
 * Adversary can then forge unrevocable Admin JWTs at will!
 */
export class JwtTokenProvider {
  private rsaPrivateKey: string;
  public rsaPublicKey: string;

  constructor() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Vulnerable classical RSA-2048
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    this.rsaPrivateKey = privateKey;
    this.rsaPublicKey = publicKey;
  }

  public signAccessToken(subject: string, roles: string[]): string {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: subject,
      roles: roles,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'auth.acme-corp.internal'
    })).toString('base64url');

    const unsignedToken = \`\${header}.\${payload}\`;
    
    // RSA-SHA256 signature
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    const signature = signer.sign(this.rsaPrivateKey, 'base64url');

    return \`\${unsignedToken}.\${signature}\`;
  }
}
`,
  },
];
