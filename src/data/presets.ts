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
  {
    id: 'nsa-csi-ot-modbus-signer',
    title: 'NSA CSI OT: Unauthenticated Modbus / DNP3 Controller Writes',
    subtitle: 'Zero Trust Hardening per Oct 8, 2026 NSA CSI. Target: NIST FIPS 204 ML-DSA-87 signed PLC commands.',
    primitiveType: 'Industrial Control Signature',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 204 (ML-DSA-87) + Monotonic Nonce',
    code: `import socket
import struct
import time

def send_modbus_coil_write(plc_ip: str, port: int, coil_address: int, state: bool):
    """
    VULNERABLE (NSA CSI Hardening OT With Zero Trust):
    Raw Modbus TCP Function 0x05 (Write Single Coil) sent with ZERO authentication.
    Any adversary pivoting through Level 2/3 can trip circuit breakers or alter turbine setpoints.
    """
    transaction_id = 1
    protocol_id = 0  # Modbus
    length = 6
    unit_id = 1
    function_code = 5  # Write Single Coil
    value = 0xFF00 if state else 0x0000

    # Raw 12-byte Modbus Application Protocol (MBAP) Frame
    packet = struct.pack(">HHHBBHH", transaction_id, protocol_id, length, unit_id, function_code, coil_address, value)

    # Insecure transmission without cryptographic verification
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((plc_ip, port))
    sock.sendall(packet)
    response = sock.recv(1024)
    sock.close()
    return response
`,
  },
  {
    id: 'defense-tactical-oms-signer',
    title: 'Defense Tactical: Palantir AIP, Lockheed Aegis & Northrop IBCS PQC Command Link',
    subtitle: 'NIST FIPS 204 ML-DSA-87 + FIPS 203 ML-KEM-1024 sensor-to-shooter telemetry for JADC2 defense primes.',
    primitiveType: 'Digital Signature',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 204 (ML-DSA-87) + FIPS 203 (ML-KEM-1024)',
    code: `import os
import time
import json
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256

def dispatch_tactical_fire_solution(track_id: str, weapon_system: str, target_coords: dict, private_key_pem: str):
    """
    LEGACY / VULNERABLE DEFENSE TELEMETRY (Pre-PQC CNSA 1.0):
    Classical RSA-2048 signature used over tactical JREAP-C / Link-16 link.
    Vulnerable to harvest-now-decrypt-later and Shor algorithm quantum forging.
    Target replacement: NIST FIPS 204 (ML-DSA-87) and FIPS 203 (ML-KEM-1024)
    per DoD CNSA 2.0 directive across Palantir AIP, Lockheed Aegis, and Northrop IBCS nodes.
    """
    timestamp = int(time.time() * 1000)
    payload = {
        "track_id": track_id,
        "weapon_system": weapon_system,
        "coords": target_coords,
        "timestamp_ms": timestamp,
        "classification": "SECRET//NOFORN"
    }
    
    # Classical vulnerable signing
    message_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
    h = SHA256.new(message_bytes)
    
    rsa_key = RSA.import_key(private_key_pem)
    signature = pkcs1_15.new(rsa_key).sign(h)
    
    return {
        "payload": payload,
        "classical_sig_hex": signature.hex(),
        "key_algorithm": "RSA-2048 (LEGACY)",
        "quantum_status": "VULNERABLE_TO_SHOR"
    }
`,
  },
  {
    id: 'war-offensive-hypersonic-pqc-link',
    title: 'War Strike: Hypersonic Glide & Stand-in Munitions PQC Fire Authorization',
    subtitle: 'NIST FIPS 204 ML-DSA-87 + FIPS 203 ML-KEM-1024 anti-spoofing uplink for AGM-183A ARRW & Dark Eagle LRHW.',
    primitiveType: 'Digital Signature',
    quantumRisk: 'CRITICAL',
    targetFips: 'FIPS 204 (ML-DSA-87) + FIPS 203 (ML-KEM-1024)',
    code: `import os
import time
import json
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA384

def dispatch_hypersonic_strike_authorization(
    target_id: str,
    weapon_system: str, # e.g. 'AGM-183A ARRW' or 'Dark Eagle LRHW'
    terminal_coords: dict,
    mach_velocity: float,
    time_to_impact_sec: float,
    legacy_rsa_key_pem: str
):
    """
    CRITICAL VULNERABILITY IN HIGH-SPEED OFFENSIVE STRIKE BUS (Pre-PQC CNSA 2.0):
    Classical RSA-3072 / ECDSA P-384 signatures are vulnerable to Shor algorithm
    cryptanalytic forgery. An adversary possessing a cryptanalytically relevant
    quantum computer (CRQC) or harvest-now-decrypt-later store can counterfeit
    in-flight divert commands or inject false GPS/INS scene-matching updates.
    
    Target Mitigation:
    1. NIST FIPS 204 (ML-DSA-87) post-quantum digital signature verification in <= 0.4ms
    2. NIST FIPS 203 (ML-KEM-1024) ephemeral session key encapsulation
    3. Hardware Root-of-Trust monotonic sequence counters preventing replay attacks
    """
    strike_manifest = {
        "target_id": target_id,
        "weapon_designation": weapon_system,
        "terminal_intercept_coords": terminal_coords,
        "telemetry": {
            "terminal_velocity_mach": mach_velocity,
            "time_to_impact_seconds": time_to_impact_sec,
            "guidance_mode": "PQC_STELLAR_OPTICAL_FUSION"
        },
        "classification": "TOP SECRET // SCI // EXCLUSIVE",
        "roe_clearance": "TITLE_10_AUTHORIZED",
        "issued_epoch_ms": int(time.time() * 1000)
    }

    manifest_bytes = json.dumps(strike_manifest, sort_keys=True).encode('utf-8')
    digest = SHA384.new(manifest_bytes)

    # Vulnerable Classical Signing Step
    key = RSA.import_key(legacy_rsa_key_pem)
    classical_sig = pkcs1_15.new(key).sign(digest)

    return {
        "status": "DISPATCHED_CLASSICAL_VULNERABLE",
        "manifest": strike_manifest,
        "signature_hex": classical_sig.hex(),
        "pqc_migration_recommendation": "Upgrade to liboqs ML-DSA-87 + ML-KEM-1024 per DoD CNSA 2.0"
    }
`,
  },
  {
    id: 'pqc-defensive-hybrid-tls',
    title: 'NIST FIPS 203 Hybrid Post-Quantum TLS Wrapper',
    subtitle: 'Dual-layer quantum resilience: X25519 classical key agreement combined with ML-KEM-768 lattice KEM.',
    primitiveType: 'Key Exchange',
    quantumRisk: 'CRITICAL',
    targetFips: 'NIST FIPS 203 (ML-KEM-768)',
    code: `import oqs
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

def establish_pqc_hybrid_session(client_classical_pub, client_mlkem_pub):
    """
    Establish zero-trust session combining classical X25519 with post-quantum ML-KEM-768.
    Provides dual-layer defense: unbroken even if quantum computer breaks classical discrete log.
    NIST SP 800-56C dual-KDF combiner architecture.
    """
    # 1. Post-Quantum KEM Encapsulation (ML-KEM-768)
    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
        pqc_ciphertext, pqc_shared_secret = kem.encap_secret(client_mlkem_pub)

    # 2. Classical Diffie-Hellman Shared Secret (e.g., X25519)
    # Simulating classical ECDH derived secret
    classical_shared_secret = hashes.Hash(hashes.SHA256())
    classical_shared_secret.update(client_classical_pub)
    classical_digest = classical_shared_secret.finalize()

    # 3. KDF Combiner (NIST SP 800-56C dual combiner)
    combined_entropy = classical_digest + pqc_shared_secret
    master_key = HKDF(
        algorithm=hashes.SHA384(),
        length=64,
        salt=None,
        info=b"PQC-HYBRID-TLS-MASTER-SECRET-V1",
    ).derive(combined_entropy)

    return {
        "pqc_ciphertext": pqc_ciphertext,
        "master_session_key": master_key,
        "cipher_suite": "X25519_MLKEM768_AES256_GCM_SHA384",
        "compliance": "NIST FIPS 203 & CNSA 2.0 Ready"
    }
`,
  },
];



