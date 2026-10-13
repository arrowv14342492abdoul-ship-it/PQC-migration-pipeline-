import { AikidoFinding, AikidoIntegrationStatus } from '../types/aikido';

export const INITIAL_AIKIDO_STATUS: AikidoIntegrationStatus = {
  connected: true,
  apiKeyMasked: 'aik_live_9f8a************4b12',
  workspaceName: 'Acme Cryptographic Defense',
  workspaceId: 'ws_aikido_78129',
  repository: 'acme-corp/pqc-secure-vault',
  defaultBranch: 'main',
  lastScanTimestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
  securityScore: 78,
  securityGrade: 'B',
  gateStatus: 'WARNING',
  webhookStatus: 'HEALTHY',
  scannersEnabled: {
    SAST: true,
    SCA: true,
    SECRETS: true,
    IAC: true,
    CONTAINER: true,
    CLOUD: true,
  },
  counts: {
    total: 6,
    critical: 1,
    high: 2,
    medium: 2,
    low: 1,
    reachable: 4,
    pqcRelevant: 3,
  },
};

export const INITIAL_AIKIDO_FINDINGS: AikidoFinding[] = [
  {
    id: 'AIK-9401',
    title: 'CWE-327: Use of Quantum-Vulnerable Asymmetric Encryption (RSA-2048 PKCS#1 OAEP)',
    description:
      'Static analysis detected RSA-2048 key generation used for message encapsulation. Shor’s algorithm can break this integer factorization in polynomial time, leaving payloads open to Harvest-Now-Decrypt-Later (HNDL) attacks.',
    scanner: 'SAST',
    severity: 'CRITICAL',
    reachability: 'REACHABLE',
    status: 'OPEN',
    cweId: 'CWE-327',
    filePath: 'services/vault/crypto_handler.py',
    lineRange: '14-22',
    introducedDate: '2026-09-12',
    autoTriageReason:
      'Reachable via public API route POST /api/v1/vault/encrypt. Directly handles external payloads.',
    remediationSummary:
      'Migrate to NIST FIPS 203 (ML-KEM-768) in hybrid composition with AES-256-GCM data encryption.',
    isPqcRelated: true,
    affectedCodeSnippet: `from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

def encrypt_data(message: bytes) -> bytes:
    key = RSA.generate(2048)
    cipher = PKCS1_OAEP.new(key)
    return cipher.encrypt(message)`,
    remediationPatch: {
      resolutionNotes:
        'Replaced quantum-vulnerable RSA-2048 with NIST FIPS 203 (ML-KEM-768) + AES-256-GCM hybrid key encapsulation.',
      diff: `--- services/vault/crypto_handler.py (Legacy RSA-2048)
+++ services/vault/crypto_handler.py (FIPS 203 Hybrid PQC)
@@ -14,8 +14,15 @@
-from Crypto.PublicKey import RSA
-from Crypto.Cipher import PKCS1_OAEP
+import oqs
+from Crypto.Cipher import AES
+from cryptography.hazmat.primitives.kdf.hkdf import HKDF
+from cryptography.hazmat.primitives import hashes

 def encrypt_data(message: bytes, recipient_pqc_pub: bytes) -> dict:
-    key = RSA.generate(2048)
-    cipher = PKCS1_OAEP.new(key)
-    return cipher.encrypt(message)
+    with oqs.KeyEncapsulation("ML-KEM-768") as kem:
+        pqc_ct, pqc_ss = kem.encap_secret(recipient_pqc_pub)
+    aes_cipher = AES.new(pqc_ss[:32], AES.MODE_GCM)
+    ct, tag = aes_cipher.encrypt_and_digest(message)
+    return {"kem_ct": pqc_ct, "ciphertext": ct, "nonce": aes_cipher.nonce, "tag": tag}`,
    },
  },
  {
    id: 'AIK-8812',
    title: 'Outdated Asymmetric Signing: Deprecated ECDSA secp256r1 Without Quantum Agility',
    description:
      'Digital signature module relies exclusively on classical elliptic curve ECDSA (secp256r1). Lacks post-quantum crypto-agility fallback or dual-signature verification required by CNSA 2.0 standards.',
    scanner: 'SAST',
    severity: 'HIGH',
    reachability: 'REACHABLE',
    status: 'OPEN',
    cweId: 'CWE-347',
    filePath: 'services/auth/signer.py',
    lineRange: '45-62',
    introducedDate: '2026-08-20',
    autoTriageReason:
      'Active in token authentication middleware pipeline. Used for JWT signature verification.',
    remediationSummary:
      'Upgrade to NIST FIPS 204 (ML-DSA-65) hybrid composite with dual-signature verification.',
    isPqcRelated: true,
    affectedCodeSnippet: `from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

def sign_payload(private_key, payload: bytes) -> bytes:
    return private_key.sign(payload, ec.ECDSA(hashes.SHA256()))`,
    remediationPatch: {
      resolutionNotes:
        'Upgraded ECDSA secp256r1 to dual-signature hybrid with NIST FIPS 204 (ML-DSA-65 / Dilithium).',
      diff: `--- services/auth/signer.py (Classical ECDSA)
+++ services/auth/signer.py (FIPS 204 ML-DSA Hybrid)
@@ -45,3 +45,9 @@
+import oqs
 def sign_payload(private_key, payload: bytes) -> dict:
-    return private_key.sign(payload, ec.ECDSA(hashes.SHA256()))
+    classical_sig = private_key.sign(payload, ec.ECDSA(hashes.SHA256()))
+    with oqs.Signature("ML-DSA-65") as pqc_signer:
+        pqc_sig = pqc_signer.sign(payload)
+    return {"classical": classical_sig, "pqc": pqc_sig}`,
    },
  },
  {
    id: 'AIK-7734',
    title: 'Hardcoded Classical RSA Private Key Material in Environment Test Fixture',
    description:
      'Secrets scanner flagged an unencrypted 2048-bit RSA PEM private key block committed inside test fixtures.',
    scanner: 'SECRETS',
    severity: 'HIGH',
    reachability: 'REACHABLE',
    status: 'OPEN',
    cweId: 'CWE-798',
    filePath: 'tests/fixtures/keys/legacy_private_key.pem',
    lineRange: '1-28',
    introducedDate: '2026-07-15',
    autoTriageReason:
      'Live secret pattern matched. Statically referenced in staging test runners.',
    remediationSummary:
      'Revoke leaked key pair, purge from Git history via BFG/git-filter-repo, and transition to KMS.',
    isPqcRelated: true,
    affectedCodeSnippet: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0N3K...[TRUNCATED 2048-BIT KEY]...
-----END RSA PRIVATE KEY-----`,
    remediationPatch: {
      resolutionNotes:
        'Purged plaintext private key from Git history. Key revoked; replaced with ephemeral KMS test provider injected via environment variable.',
      diff: `--- tests/fixtures/keys/legacy_private_key.pem (Exposed Secret)
+++ tests/fixtures/keys/legacy_private_key.pem (Purged & Revoked)
@@ -1,5 +1,2 @@
------BEGIN RSA PRIVATE KEY-----
-MIIEowIBAAKCAQEA0N3K...[TRUNCATED 2048-BIT KEY]...
------END RSA PRIVATE KEY-----
+# REVOKED: Replaced by AWS KMS / HashiCorp Vault dynamic token
+# Loaded securely via VAULT_MOCK_SECRET_ARN in staging environment`,
    },
  },
  {
    id: 'AIK-6219',
    title: 'CVE-2024-41110: Docker Engine AuthZ Plugin Bypass Vulnerability',
    description:
      'Outdated Docker client library version exposes daemon communication to authorization bypass in CI environments.',
    scanner: 'SCA',
    severity: 'MEDIUM',
    reachability: 'REACHABLE',
    status: 'OPEN',
    cweId: 'CVE-2024-41110',
    filePath: 'infrastructure/docker-compose.yml',
    lineRange: '8-14',
    introducedDate: '2026-09-01',
    autoTriageReason:
      'Runtime container build actively mounts docker.sock in deployment pipelines.',
    remediationSummary:
      'Upgrade docker engine to version >= 26.1.4 and enforce rootless daemon configuration.',
    isPqcRelated: false,
    remediationPatch: {
      resolutionNotes:
        'Upgraded Docker Engine to 26.1.4 and enforced rootless execution with security_opt no-new-privileges.',
      diff: `--- infrastructure/docker-compose.yml
+++ infrastructure/docker-compose.yml
@@ -8,3 +8,5 @@
-    image: docker:24.0.5-dind
+    image: docker:26.1.4-dind
+    security_opt:
+      - no-new-privileges:true`,
    },
  },
  {
    id: 'AIK-5103',
    title: 'CVE-2023-38545: libcurl SOCKS5 Heap Buffer Overflow in Unused Sub-dependency',
    description:
      'Vulnerable libcurl C package bundled within base Linux layer. Aikido call graph analysis verified the SOCKS5 proxy protocol is never initiated.',
    scanner: 'SCA',
    severity: 'MEDIUM',
    reachability: 'NOT_REACHABLE',
    status: 'OPEN',
    cweId: 'CVE-2023-38545',
    filePath: 'Dockerfile',
    lineRange: '3',
    introducedDate: '2026-05-10',
    autoTriageReason:
      'Aikido Reachability Engine confirmed SOCKS5 proxy handlers are never invoked in runtime execution graph.',
    remediationSummary:
      'Auto-triaged as benign noise; upgrade base image during next scheduled quarterly maintenance.',
    isPqcRelated: false,
    remediationPatch: {
      resolutionNotes:
        'Bumped base container image to Alpine 3.20.2 including patched libcurl >= 8.4.0.',
      diff: `--- Dockerfile
+++ Dockerfile
@@ -1,3 +1,3 @@
-FROM alpine:3.18.2
+FROM alpine:3.20.2
 RUN apk add --no-cache curl>=8.4.0`,
    },
  },
  {
    id: 'AIK-4028',
    title: 'IaC Misconfiguration: Insecure TLS 1.0/1.1 Permitted in Ingress Controller',
    description:
      'Kubernetes ingress manifest permits legacy TLS versions with broken classical cipher suites (3DES, CBC-mode ciphers).',
    scanner: 'IAC',
    severity: 'LOW',
    reachability: 'NOT_REACHABLE',
    status: 'OPEN',
    cweId: 'CWE-326',
    filePath: 'k8s/ingress/tls-policy.yaml',
    lineRange: '19-24',
    introducedDate: '2026-06-18',
    autoTriageReason:
      'Overridden by upstream Cloudflare Edge SSL proxy; direct ingress is internal-only.',
    remediationSummary:
      'Set ssl-ciphersuite to TLS 1.3 strict with quantum-hybrid cipher negotiation.',
    isPqcRelated: false,
    remediationPatch: {
      resolutionNotes:
        'Configured ingress SSL policy to strict TLS 1.3 with post-quantum hybrid ciphersuites.',
      diff: `--- k8s/ingress/tls-policy.yaml
+++ k8s/ingress/tls-policy.yaml
@@ -19,4 +19,4 @@
-  ssl-protocols: "TLSv1 TLSv1.1 TLSv1.2 TLSv1.3"
+  ssl-protocols: "TLSv1.3"
+  ssl-ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256"`,
    },
  },
];
