import { CbomItem, MigrationMode } from '../types/pqc';

export function generateZeroCodePqcProxyConfig(
  targetService: string = 'legacy_backend_service:8080',
  mode: MigrationMode = 'hybrid-x25519-mlkem768',
  cbomItems: CbomItem[] = []
): string {
  const curves =
    mode === 'hybrid-x25519-mlkem768'
      ? 'X25519MLKEM768:SecP256r1MLKEM768:X25519'
      : 'MLKEM1024:MLKEM768';

  const remediatedList =
    cbomItems.length > 0
      ? cbomItems
          .map(
            (i) =>
              `#   - Shielded Asset: ${i.primitive} (${i.fileLocation}) -> ${i.hybridRecommendation}`
          )
          .join('\n')
      : '#   - Shielded Asset: Legacy RSA/ECDSA Upstream Listeners -> Hybrid X25519MLKEM768';

  return `# ============================================================================
# ZERO-CODE PQC CRYPTO-AGILITY SIDECAR (NGINX + OpenSSL 3.5 / oqs-provider)
# Posture: ${
    mode === 'hybrid-x25519-mlkem768'
      ? 'RFC 9370 Hybrid Mode (FIPS 140-3 + FIPS 203)'
      : 'CNSA 2.0 Pure Post-Quantum Mode'
  }
# Countermeasure: Immediate Harvest-Now-Decrypt-Later (HNDL) Network Shielding
# CISA COUN7ER Reference: CNTR-014 (Network-Level Quantum Ingress Shielding)
# ============================================================================
${remediatedList}

# --- 1. docker-compose.pqc-sidecar.yml ---
# Wraps ${targetService} without recompiling legacy application binaries.
services:
  pqc-tls-ingress-sidecar:
    image: openquantumsafe/nginx:latest
    container_name: pqc_crypto_agility_proxy
    ports:
      - "443:8443"
    volumes:
      - ./nginx-pqc.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs/mldsa65_composite_chain.crt:/etc/nginx/certs/server.crt:ro
      - ./certs/mldsa65_composite.key:/etc/nginx/certs/server.key:ro
    environment:
      - OPENSSL_MODULES=/usr/lib/ossl-modules
      - OPENSSL_CONF=/etc/ssl/openssl-pqc.cnf
    restart: unless-stopped

# --- 2. /etc/nginx/conf.d/nginx-pqc.conf ---
server {
    listen 8443 ssl http2;
    listen [::]:8443 ssl http2;
    server_name sovereign-pqc-gateway.internal;

    # Post-Quantum KEM Group curves negotiated via TLS 1.3 ClientHello key_share
    ssl_ecdh_curve ${curves};
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;

    ssl_certificate     /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;

    # Upstream PQC telemetry headers forwarded to protected legacy service
    proxy_set_header X-PQC-Negotiated-Curve $ssl_curve;
    proxy_set_header X-PQC-Cipher           $ssl_cipher;
    proxy_set_header X-PQC-Protocol         $ssl_protocol;

    location / {
        proxy_pass http://${targetService};
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
`;
}
