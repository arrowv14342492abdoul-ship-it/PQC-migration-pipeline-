import { PresetSample } from '../types/pqc';

export const SAMPLE_PRESETS: PresetSample[] = [
  {
    id: 'rsa-oaep-user-sample',
    title: 'RSA-2048 PKCS1_OAEP Encryption (Default)',
    subtitle: 'Vulnerable to Shor\'s algorithm (integer factorization). Target: FIPS 203 ML-KEM-768 hybrid.',
    primitiveType: 'Asymmetric Encryption',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 203 (ML-KEM)',
    code: `from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

def encrypt_data(message: bytes) -> bytes:
    """
    Encrypts a message using a newly generated 2048-bit RSA key.
    Vulnerable to quantum attacks (Shor's algorithm).
    """
    key = RSA.generate(2048)
    cipher = PKCS1_OAEP.new(key)
    return cipher.encrypt(message)

def decrypt_data(ciphertext: bytes, private_key) -> bytes:
    cipher = PKCS1_OAEP.new(private_key)
    return cipher.decrypt(ciphertext)
`,
  },
  {
    id: 'ecdsa-p256-signature',
    title: 'ECDSA secp256r1 Digital Signature',
    subtitle: 'Vulnerable to Shor\'s algorithm (elliptic curve discrete logarithm). Target: FIPS 204 ML-DSA.',
    primitiveType: 'Digital Signature',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 204 (ML-DSA)',
    code: `from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

def sign_payload(private_key: ec.EllipticCurvePrivateKey, payload: bytes) -> bytes:
    """
    Signs payload with ECDSA P-256 and SHA-256.
    Quantum computers running Shor's algorithm can derive the private key
    from the public key and forged signatures.
    """
    signature = private_key.sign(
        payload,
        ec.ECDSA(hashes.SHA256())
    )
    return signature

def verify_payload(public_key: ec.EllipticCurvePublicKey, payload: bytes, signature: bytes) -> bool:
    try:
        public_key.verify(signature, payload, ec.ECDSA(hashes.SHA256()))
        return True
    except Exception:
        return False
`,
  },
  {
    id: 'ecdh-curve25519-key-exchange',
    title: 'X25519 Diffie-Hellman Key Agreement',
    subtitle: 'Vulnerable to Harvest-Now-Decrypt-Later (HNDL). Target: Hybrid X25519 + ML-KEM-768.',
    primitiveType: 'Key Exchange',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 203 (ML-KEM-768 Hybrid)',
    code: `from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

def establish_session_key(client_private: x25519.X25519PrivateKey, server_public: x25519.X25519PublicKey) -> bytes:
    """
    Derives 256-bit symmetric session key via classical X25519 ECDH.
    Adversaries intercepting TLS/session traffic can store now and decrypt
    once cryptanalytically relevant quantum computers (CRQC) emerge.
    """
    shared_key = client_private.exchange(server_public)
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"pqc-session-v1"
    ).derive(shared_key)
    return derived_key
`,
  },
  {
    id: 'envelope-encryption-vault',
    title: 'Hybrid Data Vault: RSA Envelope + AES-128',
    subtitle: 'Data-at-rest with insufficient classical key wrapping. Target: AES-256 + ML-KEM-1024.',
    primitiveType: 'Envelope Encryption',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 203 + FIPS 197 (AES-256)',
    code: `import os
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES

def envelope_encrypt(data: bytes, recipient_rsa_public) -> dict:
    """
    Encrypts payload using ephemeral AES-128 key, wrapped in RSA-2048.
    Double vulnerability: RSA broken by Shor, AES-128 halved to 64-bit security by Grover.
    """
    aes_dek = os.urandom(16)  # 128-bit DEK (weak against Grover)
    aes_cipher = AES.new(aes_dek, AES.MODE_GCM)
    ciphertext, tag = aes_cipher.encrypt_and_digest(data)

    rsa_cipher = PKCS1_OAEP.new(recipient_rsa_public)
    wrapped_dek = rsa_cipher.encrypt(aes_dek)

    return {
        "wrapped_dek": wrapped_dek,
        "nonce": aes_cipher.nonce,
        "ciphertext": ciphertext,
        "tag": tag
    }
`,
  },
];
