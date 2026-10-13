import { FinancialInstitution } from '../types/banking';

export const MAJOR_FINANCIAL_INSTITUTIONS: FinancialInstitution[] = [
  {
    id: 'jpmc',
    name: 'JPMorgan Chase & Co.',
    shortName: 'JPMorgan',
    ticker: 'JPM',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'New York, USA',
    totalAssetsAUM: '$3.9 Trillion (Assets) / $3.4T AUM',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'SEC', 'CFTC', 'PRA', 'ECB'],
    primaryProtocols: ['ISO 20022 MX', 'SWIFT GPI', 'FIX 5.0 SP2', 'Onyx DLT', 'Fedwire Funds'],
    status: 'connected',
    quantumReadinessScore: 95,
    pqcStandards: {
      fips203: 'ML-KEM-768 (Lattice KEM)',
      fips204: 'ML-DSA-65 (Lattice Signature)',
      hybridTlsVersion: 'TLS 1.3 X25519Kyber768 draft-ietf-tls-hybrid',
      hsmLevel: 'FIPS 140-3 Level 4 Thales Luna PQC Partition',
    },
    apiEndpoint: 'https://api.jpmorgan.com/v3/payments/quantum-gateway',
    sandboxStatus: {
      latencyMs: 38,
      uptimePercent: 99.998,
      lastHandshake: '12 seconds ago',
      cbomEntriesCount: 142,
      activeCorridors: 28,
    },
    capabilities: [
      {
        id: 'jpm-pacs008',
        title: 'High-Value Wholesale Wire (ISO 20022 pacs.008)',
        protocol: 'ISO 20022 MX XML / JSON-LD',
        description: 'End-to-end encrypted interbank wholesale credit transfer wrapped in FIPS 203 ML-KEM-768 encapsulation.',
        standardMessage: 'pacs.008.001.10 - Financial Institutional Customer Credit Transfer',
        samplePayload: JSON.stringify({
          GrpHdr: {
            MsgId: 'JPMC-2026-PQC-901844',
            CreDtTm: '2026-10-10T19:40:00Z',
            NbOfTxs: '1',
            SttlmInf: { SttlmMtd: 'CLRG', ClrSys: { Prtry: 'FEDWIRE_PQC' } }
          },
          CdtTrfTxInf: {
            PmtId: { EndToEndId: 'E2E-7788-MLKEM', UETR: '9d41b55a-4b92-4f32-bb91-c128562d91f2' },
            IntrBkSttlmAmt: { Ccy: 'USD', Value: '15000000.00' },
            Dbtr: { Nm: 'Sovereign Treasury Alpha Corp' },
            Cdtr: { Nm: 'Global Liquidity Clearing LP' },
            PqcExt: {
              KdfAlgorithm: 'HKDF-SHA3-512',
              KemEncapsulation: 'ML-KEM-768-DRAFT-FIPS203',
              SignatureVerification: 'ML-DSA-65-DUAL-ECDSA'
            }
          }
        }, null, 2),
        testResponse: JSON.stringify({
          Status: 'ACTC_ACCEPTED_TECHNICAL_VALIDATION',
          TxHash: '0x8f4d92a11b6ec4917a20c382f64e29b1385923ac71829e018d451',
          PqcAttestation: 'VERIFIED_FIPS203_KEM768',
          SettlementTimeMs: 42,
          Corridor: 'JPMC_NY_TO_FEDWIRE_PQC'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 & Dual-ECDSA Signature',
      },
      {
        id: 'jpm-onyx-dlt',
        title: 'Onyx Digital Assets Interbank Repurchase',
        protocol: 'DLT Smart Contract / JSON-RPC',
        description: 'Intraday repo and tokenized collateral clearing with post-quantum key agreement protecting state commits.',
        standardMessage: 'Onyx.Settlement.Repo.v2',
        samplePayload: JSON.stringify({
          settlementId: 'ONYX-REPO-5510',
          collateralAsset: 'US_TREASURY_10Y_TOKENIZED',
          nominalAmountUsd: 50000000,
          pqcProof: 'ZK-SNARK-LATTICE-ML-KEM'
        }, null, 2),
        testResponse: JSON.stringify({
          state: 'COMMITTED',
          blockIndex: 4892019,
          finalityLatencyMs: 85
        }, null, 2),
        pqcShield: 'ML-KEM-768 Dynamic Wrapping',
      }
    ],
    complianceMatrix: [
      { standard: 'FedNow / Fedwire PQC Mandate', framework: 'Federal Reserve Policy 2026', status: 'COMPLIANT', deadline: '2026-Q4', notes: 'All wholesale API ingress authenticated via FIPS 204 signatures.' },
      { standard: 'OCC PQC Circular 2025-14', framework: 'OCC Operational Risk', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'Zero unmapped classical RSA-2048 keys in payment processing pipeline.' },
      { standard: 'NIST SP 800-227 CNSA 2.0', framework: 'NSA / NIST PQC', status: 'COMPLIANT', deadline: '2027-Q1', notes: 'Quantum-safe hybrid TLS 1.3 deployed across tier-1 gateway clusters.' }
    ],
    cbomInventory: [
      { component: 'Corporate Ingress Gateway TLS', classicalPrimitive: 'ECDHE-RSA-2048', postQuantumReplacement: 'X25519 + ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '2048-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'SWIFT GPI Message Signer', classicalPrimitive: 'RSA-PSS-4096', postQuantumReplacement: 'Dual ML-DSA-65 + RSA-PSS', nistStandard: 'FIPS 204', keySizeClassical: '4096-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'Core Ledger Database at Rest', classicalPrimitive: 'AES-128-CBC', postQuantumReplacement: 'AES-256-GCM + Quantum-Derived Keys', nistStandard: 'FIPS 197', keySizeClassical: '128-bit', keySizePqc: '256-bit Key', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Past wire communications recorded prior to 2025 could be susceptible to retrospective Shor factoring if key sizes < 3072-bit were used.',
      mitigationPath: 'Immediate re-keying to ML-KEM-768 with ephemeral key ratcheting on all corporate treasury channels.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 with X25519Kyber768Draft00',
    },
    liveEvents: [
      { id: 'ev-1', timestamp: '19:51:10', event: 'Wholesale pacs.008 wire verified via ML-KEM-768', primitive: 'ML-KEM-768', status: 'SUCCESS' },
      { id: 'ev-2', timestamp: '19:48:42', event: 'Onyx liquidity partition re-keyed with FIPS 204 dual signature', primitive: 'ML-DSA-65', status: 'SECURED' },
      { id: 'ev-3', timestamp: '19:42:15', event: 'Automated CBOM check: 0 classical legacy certificates found in DMZ', primitive: 'CBOM Scan', status: 'SUCCESS' }
    ]
  },
  {
    id: 'bofa',
    name: 'Bank of America Corporation',
    shortName: 'Bank of America',
    ticker: 'BAC',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'Charlotte, NC, USA',
    totalAssetsAUM: '$3.2 Trillion (Assets) / $1.8T AUM',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'SEC', 'FDIC'],
    primaryProtocols: ['CashPro API', 'ISO 20022', 'SWIFT Net', 'NACHA ACH Direct', 'Fedwire'],
    status: 'connected',
    quantumReadinessScore: 92,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 Network HSM',
    },
    apiEndpoint: 'https://cashpro-api.bankofamerica.com/pqc/v2/treasury',
    sandboxStatus: {
      latencyMs: 44,
      uptimePercent: 99.995,
      lastHandshake: '28 seconds ago',
      cbomEntriesCount: 128,
      activeCorridors: 22,
    },
    capabilities: [
      {
        id: 'bofa-cashpro',
        title: 'CashPro Treasury Payment Batch Execution',
        protocol: 'RESTful JSON / ISO 20022 pain.001',
        description: 'Multi-currency commercial payroll and vendor disbursement with post-quantum payload integrity hashing.',
        standardMessage: 'pain.001.001.09 - Customer Credit Transfer Initiation',
        samplePayload: JSON.stringify({
          batchId: 'BAC-CP-2026-8801',
          originatorAccount: 'BOFA-TREASURY-CORP-4402',
          totalAmount: 8450000.00,
          currency: 'USD',
          recipientsCount: 42,
          pqcKemKeyId: 'bofa-ml-kem-key-vault-01'
        }, null, 2),
        testResponse: JSON.stringify({
          batchStatus: 'BATCH_ACKNOWLEDGED',
          validationProof: 'FIPS_203_KEM_ENCRYPTED',
          clearingTime: '2026-10-10T19:50:00Z',
          riskScore: 'LOW_ZERO_DEVIATION'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 + CashPro Signature',
      }
    ],
    complianceMatrix: [
      { standard: 'GLBA 2026 Security Safeguards', framework: 'FTC / FFIEC', status: 'COMPLIANT', deadline: '2026-Q3', notes: 'Quantum-safe customer financial data transmission enabled.' },
      { standard: 'PCI-DSS v4.0.1 PQC Roadmap', framework: 'PCI Security Standards', status: 'COMPLIANT', deadline: '2026-Q4', notes: 'Merchant tokenization channels upgraded to 256-bit equivalent lattice keys.' }
    ],
    cbomInventory: [
      { component: 'CashPro Mobile / Web Gateway', classicalPrimitive: 'ECDHE-P256', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '256-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'ACH Batch NACHA Ingress', classicalPrimitive: 'RSA-2048', postQuantumReplacement: 'Dual ML-DSA-65', nistStandard: 'FIPS 204', keySizeClassical: '2048-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Legacy ACH token files with single RSA-2048 encryption require automated vault rotation.',
      mitigationPath: 'Migrate all automated treasury feeds to CashPro API v2 with ML-KEM envelope encryption.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-bofa-1', timestamp: '19:49:02', event: 'CashPro Treasury batch processed with hybrid ML-KEM-768 encapsulation', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'citi',
    name: 'Citigroup Inc. (Citi)',
    shortName: 'Citi',
    ticker: 'C',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'New York, USA',
    totalAssetsAUM: '$2.4 Trillion (Assets) / $2.2T Custody',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'PRA', 'HKMA', 'MAS'],
    primaryProtocols: ['CitiConnect API', 'CitiDirect', 'SWIFT ISO 20022', 'FIX Protocol', 'CHIPS'],
    status: 'connected',
    quantumReadinessScore: 94,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65 & ML-DSA-87',
      hybridTlsVersion: 'TLS 1.3 Composite Kyber-Draft',
      hsmLevel: 'FIPS 140-3 Level 4 Quantum Partitioned HSM',
    },
    apiEndpoint: 'https://citiconnect.citigroup.com/pqc/v1/crossborder',
    sandboxStatus: {
      latencyMs: 36,
      uptimePercent: 99.999,
      lastHandshake: '14 seconds ago',
      cbomEntriesCount: 164,
      activeCorridors: 35,
    },
    capabilities: [
      {
        id: 'citi-crossborder',
        title: 'CitiDirect NextGen Cross-Border FX Settlement',
        protocol: 'ISO 20022 camt.053 & pacs.009',
        description: 'Multi-corridor real-time foreign exchange liquidity clearing protected against Harvest-Now-Decrypt-Later attacks.',
        standardMessage: 'pacs.009.001.08 - Financial Institution Transfer Core',
        samplePayload: JSON.stringify({
          fxExecutionId: 'CITI-FX-EURUSD-99410',
          sellCurrency: 'EUR',
          sellAmount: 25000000.00,
          buyCurrency: 'USD',
          rate: 1.0845,
          valueDate: '2026-10-11',
          quantumSignature: 'ML-DSA-87-PROT-FIPS204'
        }, null, 2),
        testResponse: JSON.stringify({
          cleared: true,
          fxTradeStatus: 'SETTLED_VALUE_SPOT',
          pqcAuditDigest: 'SHA3_512_KEM_VALIDATED',
          confirmationRef: 'CITI-CONF-778812'
        }, null, 2),
        pqcShield: 'FIPS 204 ML-DSA-87 Quantum Signature',
      }
    ],
    complianceMatrix: [
      { standard: 'DORA Article 9 Cryptographic Resilience', framework: 'European Union (EBA/ESMA)', status: 'COMPLIANT', deadline: '2025-Q1', notes: 'Cross-border EU-US settlement audited for quantum cryptographic agility.' }
    ],
    cbomInventory: [
      { component: 'CitiDirect FX Engine API', classicalPrimitive: 'ECDSA secp384r1', postQuantumReplacement: 'ML-DSA-87 Dual Sign', nistStandard: 'FIPS 204', keySizeClassical: '384-bit', keySizePqc: '4595-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'International clearing telegraph cables vulnerable to strategic foreign adversary traffic interception.',
      mitigationPath: 'Deploy ML-KEM-768 encapsulation across all trans-Atlantic interbank fiber gateways.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-citi-1', timestamp: '19:47:19', event: 'Cross-border EUR/USD wholesale trade signed with ML-DSA-87', primitive: 'ML-DSA-87', status: 'SUCCESS' }
    ]
  },
  {
    id: 'wells-fargo',
    name: 'Wells Fargo & Company',
    shortName: 'Wells Fargo',
    ticker: 'WFC',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'San Francisco, CA, USA',
    totalAssetsAUM: '$1.9 Trillion (Assets)',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'CFPB', 'SEC'],
    primaryProtocols: ['Wells Fargo Gateway API', 'CEO Portal', 'ISO 20022', 'ACH NACHA', 'RTP The Clearing House'],
    status: 'connected',
    quantumReadinessScore: 90,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid Draft',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://api.wellsfargo.com/pqc-gateway/v1/payments',
    sandboxStatus: {
      latencyMs: 41,
      uptimePercent: 99.992,
      lastHandshake: '45 seconds ago',
      cbomEntriesCount: 114,
      activeCorridors: 19,
    },
    capabilities: [
      {
        id: 'wf-rtp',
        title: 'Real-Time Payments (RTP) & Commercial Disbursements',
        protocol: 'JSON REST / ISO 20022 pacs.008 RTP',
        description: 'Instant domestic commercial account-to-account settlement via The Clearing House with quantum-hardened HMAC auth.',
        standardMessage: 'pacs.008.001.08 - Real-Time Payment Instruction',
        samplePayload: JSON.stringify({
          instructionId: 'WFC-RTP-2026-1189',
          amount: 500000.00,
          currency: 'USD',
          debtorAccount: 'WFC-DDA-998811',
          creditorRouting: '121000248',
          pqcToken: 'WFC_FIPS203_KEM_TOKEN'
        }, null, 2),
        testResponse: JSON.stringify({
          settlementStatus: 'SETTLED_INSTANT',
          clearingSystem: 'TCH_RTP_PQC',
          latency: '280ms'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768',
      }
    ],
    complianceMatrix: [
      { standard: 'TCH RTP Quantum Security Specification', framework: 'The Clearing House', status: 'COMPLIANT', deadline: '2026-Q4', notes: 'Immediate clearing validation with quantum HMAC credentials.' }
    ],
    cbomInventory: [
      { component: 'Commercial CEO Portal API', classicalPrimitive: 'RSA-2048', postQuantumReplacement: 'ML-KEM-768 Composite', nistStandard: 'FIPS 203', keySizeClassical: '2048-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Commercial client credentials stored in legacy PKCS#11 tokens require firmware upgrade.',
      mitigationPath: 'Issue FIPS 140-3 compliant hardware authenticators supporting ML-DSA-65.',
      recommendedHybridCiphersuite: 'TLS_CHACHA20_POLY1305_SHA256 (ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-wf-1', timestamp: '19:45:30', event: 'RTP instant payment settled with quantum token authorization', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'goldman-sachs',
    name: 'The Goldman Sachs Group, Inc.',
    shortName: 'Goldman Sachs',
    ticker: 'GS',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'New York, USA',
    totalAssetsAUM: '$1.6 Trillion (Assets) / $2.8T AUM',
    regulatoryJurisdiction: ['Federal Reserve', 'SEC', 'CFTC', 'FINRA', 'PRA', 'BaFin'],
    primaryProtocols: ['Marquee API', 'TxB Transaction Banking', 'FIX 5.0 SP2', 'SWIFT GPI', 'AWS Financial Cloud'],
    status: 'connected',
    quantumReadinessScore: 97,
    pqcStandards: {
      fips203: 'ML-KEM-1024 (Highest Lattice Level)',
      fips204: 'ML-DSA-87 (Security Level 5)',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid + WireGuard PQC',
      hsmLevel: 'FIPS 140-3 Level 4 Dedicated Crypto Vault',
    },
    apiEndpoint: 'https://marquee-api.gs.com/v2/crypto-agility/pqc',
    sandboxStatus: {
      latencyMs: 24,
      uptimePercent: 99.999,
      lastHandshake: '5 seconds ago',
      cbomEntriesCount: 198,
      activeCorridors: 42,
    },
    capabilities: [
      {
        id: 'gs-txb',
        title: 'Transaction Banking (TxB) Global Treasury & Liquidity',
        protocol: 'RESTful API / Webhooks / FIX Protocol',
        description: 'Ultra-low latency institutional API for liquidity sweep, high-frequency currency arbitrage, and smart treasury with Level 5 Lattice protection.',
        standardMessage: 'FIX.5.0SP2 ExecutionReport / TxB Sweep Order',
        samplePayload: JSON.stringify({
          clOrdID: 'GS-MARQUEE-ORD-881920',
          transType: 'INSTITUTIONAL_LIQUIDITY_SWEEP',
          notional: 100000000.00,
          currency: 'USD',
          account: 'GS-TXB-VAULT-CORPORATE',
          pqcKemLevel: 'NIST_LEVEL_5_ML_KEM_1024',
          signatureSpec: 'ML_DSA_87'
        }, null, 2),
        testResponse: JSON.stringify({
          ordStatus: 'FILLED',
          fillExecutionTimeMs: 12,
          pqcProofVerification: 'SUCCESS_ZERO_OVERHEAD',
          cryptoStandard: 'FIPS_203_LEVEL_5'
        }, null, 2),
        pqcShield: 'NIST Level 5 (ML-KEM-1024 / ML-DSA-87)',
      }
    ],
    complianceMatrix: [
      { standard: 'CNSA 2.0 Level 5 Mandate for National Security Sensitive Custody', framework: 'NSA / Federal Reserve', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Implemented ML-KEM-1024 on high-notional algorithmic routes.' }
    ],
    cbomInventory: [
      { component: 'Marquee Algorithmic Trading Feed', classicalPrimitive: 'ECDHE-secp384r1', postQuantumReplacement: 'ML-KEM-1024 Direct Encapsulation', nistStandard: 'FIPS 203', keySizeClassical: '384-bit', keySizePqc: '1568-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Algorithmic trading models and proprietary risk parameters intercepted by adversaries could compromise trading alphas.',
      mitigationPath: 'Full deployment of NIST Level 5 ML-KEM-1024 symmetric key encapsulation.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X448 + ML-KEM-1024)',
    },
    liveEvents: [
      { id: 'ev-gs-1', timestamp: '19:51:22', event: 'High-frequency institutional treasury sweep verified with ML-KEM-1024', primitive: 'ML-KEM-1024', status: 'SUCCESS' }
    ]
  },
  {
    id: 'morgan-stanley',
    name: 'Morgan Stanley',
    shortName: 'Morgan Stanley',
    ticker: 'MS',
    tier: 'Tier 1 Global G-SIB',
    category: 'Wealth & Asset Management',
    headquarters: 'New York, USA',
    totalAssetsAUM: '$1.2 Trillion (Assets) / $5.5T Client Assets',
    regulatoryJurisdiction: ['Federal Reserve', 'SEC', 'FINRA', 'PRA'],
    primaryProtocols: ['Matrix Fixed Income', 'WealthDesk API', 'FIX 5.0', 'SWIFT Net', 'DTC Clearance'],
    status: 'connected',
    quantumReadinessScore: 91,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://matrix-api.morganstanley.com/pqc/v1/clearing',
    sandboxStatus: {
      latencyMs: 39,
      uptimePercent: 99.996,
      lastHandshake: '52 seconds ago',
      cbomEntriesCount: 122,
      activeCorridors: 24,
    },
    capabilities: [
      {
        id: 'ms-wealth',
        title: 'Institutional Wealth Custody & Securities Settlement',
        protocol: 'FIX 5.0 SP2 / ISO 15022 & ISO 20022 sese.023',
        description: 'Multi-custodian securities trade matching and transfer instructions protected with FIPS 204 signatures.',
        standardMessage: 'sese.023.001.09 - Securities Settlement Transaction Instruction',
        samplePayload: JSON.stringify({
          settlementTransactionId: 'MS-SEC-CLEAR-99014',
          isin: 'US91282CDJ71',
          quantity: 250000,
          depository: 'DTC_NEW_YORK',
          pqcSignature: 'ML-DSA-65-DUAL'
        }, null, 2),
        testResponse: JSON.stringify({
          status: 'MATCHED_AND_AFFIRMED',
          pqcValidation: 'PASS',
          dtcTransmissionStatus: 'SCHEDULED'
        }, null, 2),
        pqcShield: 'FIPS 204 ML-DSA-65 Signature',
      }
    ],
    complianceMatrix: [
      { standard: 'SEC Rule 17a-4 Electronic Records Cryptography', framework: 'SEC', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'WORM records encrypted with quantum-resilient envelope keys.' }
    ],
    cbomInventory: [
      { component: 'WealthDesk Clearing Ingress', classicalPrimitive: 'RSA-4096', postQuantumReplacement: 'ML-DSA-65 + RSA-PSS Hybrid', nistStandard: 'FIPS 204', keySizeClassical: '4096-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Long-dated trust and estate custody documents subject to 50-year privacy obligations require quantum encryption.',
      mitigationPath: 'Envelope encryption with AES-256 and ML-KEM-768 key derivation.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-ms-1', timestamp: '19:44:11', event: 'DTC settlement instruction affirmed with dual ML-DSA-65', primitive: 'ML-DSA-65', status: 'SUCCESS' }
    ]
  },
  {
    id: 'hsbc',
    name: 'HSBC Holdings plc',
    shortName: 'HSBC',
    ticker: 'HSBC',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'London, United Kingdom',
    totalAssetsAUM: '$3.0 Trillion (Assets)',
    regulatoryJurisdiction: ['PRA', 'FCA', 'HKMA', 'Federal Reserve', 'MAS'],
    primaryProtocols: ['HSBC Treasury API', 'HSBC Evolve FX', 'SWIFT ISO 20022', 'QKD Testbed', 'FPS / CHAPS'],
    status: 'connected',
    quantumReadinessScore: 96,
    pqcStandards: {
      fips203: 'ML-KEM-768 & QKD Hybrid',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid + Quantum Key Distribution',
      hsmLevel: 'FIPS 140-3 Level 4 Quantum HSM',
    },
    apiEndpoint: 'https://api.hsbc.com/corporate/pqc/v2/fx-corridor',
    sandboxStatus: {
      latencyMs: 32,
      uptimePercent: 99.997,
      lastHandshake: '18 seconds ago',
      cbomEntriesCount: 156,
      activeCorridors: 38,
    },
    capabilities: [
      {
        id: 'hsbc-fx-evolve',
        title: 'HSBC Evolve Quantum-Safe FX Trading & Trade Finance',
        protocol: 'FIX Protocol 4.4 / RESTful JSON / EBICS',
        description: 'Pioneering production trials combining Quantum Key Distribution (QKD) fiber links with NIST FIPS 203 post-quantum algorithms.',
        standardMessage: 'pacs.008.001.10 & FIX 4.4 TradeCaptureReport',
        samplePayload: JSON.stringify({
          tradeId: 'HSBC-EVOLVE-PQC-7741',
          currencyPair: 'GBP/USD',
          notional: 45000000.00,
          settlementCenter: 'HSBC_LONDON_CANARY_WHARF',
          hybridKeys: {
            classical: 'ECDH-P384',
            postQuantum: 'ML-KEM-768',
            qkdToken: 'QKD-FIBER-BT-METRO-01'
          }
        }, null, 2),
        testResponse: JSON.stringify({
          status: 'MATCHED_AND_BOUND',
          executionLatency: '18ms',
          quantumChannelStatus: 'QUANTUM_ENTANGLEMENT_STABLE',
          regulatoryRef: 'PRA_PQC_TRIAL_2026'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 + QKD Hardware Channel',
      }
    ],
    complianceMatrix: [
      { standard: 'UK PRA / Bank of England PQC Roadmap', framework: 'Bank of England', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'CHAPS and wholesale sterling payment systems tested with post-quantum algorithms.' }
    ],
    cbomInventory: [
      { component: 'HSBC Treasury FX Gateway', classicalPrimitive: 'ECDHE-secp256r1', postQuantumReplacement: 'ML-KEM-768 + QKD Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '256-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Global trade finance bills of lading with long lifespans need post-quantum digital signatures to prevent fraudulent forgery.',
      mitigationPath: 'Transition all digital bill of lading smart contracts to FIPS 204 ML-DSA.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-hsbc-1', timestamp: '19:50:45', event: 'GBP/USD institutional trade secured over QKD + ML-KEM-768 corridor', primitive: 'QKD + ML-KEM', status: 'SUCCESS' }
    ]
  },
  {
    id: 'bnp-paribas',
    name: 'BNP Paribas S.A.',
    shortName: 'BNP Paribas',
    ticker: 'BNP',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'Paris, France',
    totalAssetsAUM: '€2.7 Trillion ($2.9T USD)',
    regulatoryJurisdiction: ['ECB', 'ACPR', 'AMF', 'EBA'],
    primaryProtocols: ['Centric B2B API', 'Connexis Cash', 'SEPA Instant Credit Transfer', 'EBICS TS 3.0', 'Target2'],
    status: 'connected',
    quantumReadinessScore: 93,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65 & Falcon (FN-DSA)',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid',
      hsmLevel: 'ANSSI-Certified Post-Quantum HSM',
    },
    apiEndpoint: 'https://centric.bnpparibas.com/api/v2/pqc/payments',
    sandboxStatus: {
      latencyMs: 37,
      uptimePercent: 99.995,
      lastHandshake: '33 seconds ago',
      cbomEntriesCount: 139,
      activeCorridors: 31,
    },
    capabilities: [
      {
        id: 'bnp-sepa',
        title: 'European SEPA Instant PQC Payment Gateway',
        protocol: 'ISO 20022 pacs.008 SCT Inst / EBICS 3.0',
        description: 'Pan-European sub-10 second instant SEPA credit transfer with ANSSI-aligned post-quantum cryptographic validation.',
        standardMessage: 'pacs.008.001.08 - SCT Inst',
        samplePayload: JSON.stringify({
          MsgId: 'BNP-SEPA-2026-44910',
          SttlmAmt: { Ccy: 'EUR', Value: '2500000.00' },
          DbtrAgt: { FinInstnId: { BICFI: 'BNPAFRPP' } },
          CdtrAgt: { FinInstnId: { BICFI: 'DEUTDEDD' } },
          PqcEnvelope: {
            Algorithm: 'ML-KEM-768',
            AnssiCompliance: 'RECOMMENDED_HYBRID'
          }
        }, null, 2),
        testResponse: JSON.stringify({
          Status: 'ACCP_ACCEPTED_SETTLEMENT_COMPLETED',
          Target2Ref: 'T2-EUR-881920-PQC',
          ExecutionDurationMs: 140
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 + ANSSI Hybrid Profile',
      }
    ],
    complianceMatrix: [
      { standard: 'DORA (EU Regulation 2022/2554)', framework: 'European Banking Authority', status: 'COMPLIANT', deadline: '2025-Q1', notes: 'Operational resilience validation with cryptographic agility for pan-EU corridors.' },
      { standard: 'ANSSI PQC Hybrid Transition Guide', framework: 'ANSSI France', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Strict dual-mode enforcement preventing single point of failure in lattice algorithms.' }
    ],
    cbomInventory: [
      { component: 'Connexis Cash EBICS Gateway', classicalPrimitive: 'RSA-3072', postQuantumReplacement: 'Dual RSA + ML-DSA-65', nistStandard: 'FIPS 204', keySizeClassical: '3072-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'SEPA batch payment XML files stored in cold archive must be re-encrypted before quantum cryptanalysis emergence.',
      mitigationPath: 'Automatic AES-256-GCM re-encryption with ML-KEM wrapped master keys.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-bnp-1', timestamp: '19:48:02', event: 'SEPA Instant SCT transfer verified via ANSSI-aligned hybrid profile', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'barclays',
    name: 'Barclays PLC',
    shortName: 'Barclays',
    ticker: 'BARC',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'London, United Kingdom',
    totalAssetsAUM: '£1.5 Trillion ($1.9T USD)',
    regulatoryJurisdiction: ['PRA', 'FCA', 'Bank of England'],
    primaryProtocols: ['Barclays Live API', 'Corporate Gateway', 'Faster Payments Service (FPS)', 'BACS', 'CHAPS'],
    status: 'connected',
    quantumReadinessScore: 91,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Composite Kyber-Draft',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://developer.barclays.com/pqc-gateway/v1/payments',
    sandboxStatus: {
      latencyMs: 35,
      uptimePercent: 99.994,
      lastHandshake: '39 seconds ago',
      cbomEntriesCount: 119,
      activeCorridors: 26,
    },
    capabilities: [
      {
        id: 'barc-fps',
        title: 'UK Faster Payments Service (FPS) Quantum Channel',
        protocol: 'ISO 20022 pacs.008 / UK Open Banking',
        description: 'Instant UK domestic clearing with hybrid post-quantum certificate verification and anti-spoofing.',
        standardMessage: 'pacs.008.001.08 - FPS Core',
        samplePayload: JSON.stringify({
          sortCode: '20-00-00',
          accountNumber: '88776655',
          paymentAmount: 125000.00,
          currency: 'GBP',
          pqcCertThumbprint: 'BARCLAYS-PQC-CA-9921'
        }, null, 2),
        testResponse: JSON.stringify({
          fpsStatus: 'SETTLED',
          scheme: 'FASTER_PAYMENTS_UK_PQC',
          responseTime: '92ms'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 Composite',
      }
    ],
    complianceMatrix: [
      { standard: 'UK Open Banking Security Profile v4', framework: 'OBL', status: 'COMPLIANT', deadline: '2026-Q3', notes: 'FAPI 2.0 with post-quantum client authentication.' }
    ],
    cbomInventory: [
      { component: 'Barclays Live Corporate Portal', classicalPrimitive: 'ECDHE-RSA-2048', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '2048-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Open Banking FAPI client assertions signed with legacy ECDSA could be forged post-quantum.',
      mitigationPath: 'Transition to FIPS 204 ML-DSA-65 client certificates.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-barc-1', timestamp: '19:46:12', event: 'UK Faster Payment settled with ML-KEM authenticated channel', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'deutsche-bank',
    name: 'Deutsche Bank AG',
    shortName: 'Deutsche Bank',
    ticker: 'DB',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'Frankfurt, Germany',
    totalAssetsAUM: '€1.3 Trillion ($1.4T USD)',
    regulatoryJurisdiction: ['BaFin', 'ECB', 'Bundesbank', 'Federal Reserve'],
    primaryProtocols: ['autobahn API', 'Corporate Cash Management', 'Target2', 'SEPA Instant', 'SWIFT Net'],
    status: 'connected',
    quantumReadinessScore: 92,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid (BSI-compliant)',
      hsmLevel: 'BSI TR-02102-1 Post-Quantum HSM',
    },
    apiEndpoint: 'https://autobahn.db.com/pqc-api/v1/settlement',
    sandboxStatus: {
      latencyMs: 34,
      uptimePercent: 99.995,
      lastHandshake: '21 seconds ago',
      cbomEntriesCount: 133,
      activeCorridors: 29,
    },
    capabilities: [
      {
        id: 'db-autobahn',
        title: 'Autobahn Corporate Cash Management & FX Engine',
        protocol: 'RESTful API / ISO 20022 camt.054 / FIX 5.0',
        description: 'Real-time multi-currency corporate treasury pool sweeps compliant with German Federal Office for Information Security (BSI) directives.',
        standardMessage: 'camt.054.001.08 - BankToCustomerDebitCreditNotification',
        samplePayload: JSON.stringify({
          notifId: 'DB-AB-2026-77881',
          accountIban: 'DE89370400440532013000',
          creditAmount: 3400000.00,
          currency: 'EUR',
          bsiProfile: 'TR_02102_PQC_HYBRID'
        }, null, 2),
        testResponse: JSON.stringify({
          autobahnAck: true,
          cryptoAudit: 'BSI_RECOMMENDED_LATTICE_OK',
          latency: '24ms'
        }, null, 2),
        pqcShield: 'BSI TR-02102 Compliant ML-KEM-768',
      }
    ],
    complianceMatrix: [
      { standard: 'BSI TR-02102-1 Cryptographic Mechanisms', framework: 'BSI Germany', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Hybrid key exchange required for all interbank communications.' }
    ],
    cbomInventory: [
      { component: 'Autobahn FX Trading API', classicalPrimitive: 'ECDHE-secp384r1', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '384-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Corporate EBICS electronic signature files require quantum-resilient dual signatures.',
      mitigationPath: 'Upgrade corporate client smart cards to support ML-DSA.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-db-1', timestamp: '19:43:55', event: 'Autobahn corporate sweep validated via BSI-compliant hybrid tunnel', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'ubs',
    name: 'UBS Group AG',
    shortName: 'UBS',
    ticker: 'UBS',
    tier: 'Tier 1 Global G-SIB',
    category: 'Wealth & Asset Management',
    headquarters: 'Zurich, Switzerland',
    totalAssetsAUM: '$1.7 Trillion (Assets) / $5.7T Invested Assets',
    regulatoryJurisdiction: ['FINMA', 'SNB', 'Federal Reserve', 'PRA', 'MAS'],
    primaryProtocols: ['UBS Neo API', 'Swiss Interbank Clearing (SIC)', 'ISO 20022', 'SWIFT Net', 'FIX 5.0'],
    status: 'connected',
    quantumReadinessScore: 95,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65 & ML-DSA-87',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid',
      hsmLevel: 'FINMA-Audited Alpine Bunker Quantum HSM',
    },
    apiEndpoint: 'https://neo-api.ubs.com/pqc/v2/private-wealth',
    sandboxStatus: {
      latencyMs: 31,
      uptimePercent: 99.998,
      lastHandshake: '16 seconds ago',
      cbomEntriesCount: 147,
      activeCorridors: 34,
    },
    capabilities: [
      {
        id: 'ubs-neo',
        title: 'UBS Neo Private Wealth & Institutional Custody Vault',
        protocol: 'JSON API / ISO 20022 / SIC Interbank',
        description: 'Swiss private banking tokenized asset custody protected inside Swiss Alpine bunker data centers with quantum lattice key wrapping.',
        standardMessage: 'pacs.008 / SIC Swiss Interbank Clearing',
        samplePayload: JSON.stringify({
          clientVaultId: 'UBS-CH-PRIV-009918',
          portfolioAllocation: 'SOVEREIGN_BONDS_GOLD_CUSTODY',
          totalValuationChf: 75000000.00,
          custodyJurisdiction: 'SWITZERLAND_FINMA',
          pqcKeyExchange: 'FIPS_203_ML_KEM_768'
        }, null, 2),
        testResponse: JSON.stringify({
          vaultSeal: 'SEALED_PERMANENT_CRYPTOGRAPHIC_PROOFS',
          sicClearingRef: 'SIC-CH-7788192-PQC',
          hsmAttestation: 'ALPINE_HSM_CLUSTER_FIPS140_3'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 + Swiss Banking Privacy Standard',
      }
    ],
    complianceMatrix: [
      { standard: 'FINMA Operational Risk Circular 2023/1', framework: 'FINMA Switzerland', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Cryptographic agility audit completed across private wealth systems.' }
    ],
    cbomInventory: [
      { component: 'UBS Neo Global Trading Gateway', classicalPrimitive: 'ECDHE-RSA-4096', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '4096-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Swiss banking secrecy data must withstand cryptanalysis decades into the future.',
      mitigationPath: 'Immediate deployment of ML-KEM-768 with ephemeral key ratcheting for all client communications.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-ubs-1', timestamp: '19:49:50', event: 'Swiss Interbank Clearing instruction sealed with ML-KEM-768', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'rbc',
    name: 'Royal Bank of Canada (RBC)',
    shortName: 'RBC',
    ticker: 'RY',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'Toronto, Canada',
    totalAssetsAUM: 'CAD $2.1 Trillion ($1.5T USD)',
    regulatoryJurisdiction: ['OSFI', 'Bank of Canada', 'SEC', 'FINTRAC'],
    primaryProtocols: ['RBC PayEdge API', 'Global Connect', 'Lynx High-Value Payments', 'Interac e-Transfer', 'ISO 20022'],
    status: 'connected',
    quantumReadinessScore: 90,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://api.rbc.com/pqc-gateway/v1/treasury',
    sandboxStatus: {
      latencyMs: 42,
      uptimePercent: 99.993,
      lastHandshake: '48 seconds ago',
      cbomEntriesCount: 112,
      activeCorridors: 21,
    },
    capabilities: [
      {
        id: 'rbc-lynx',
        title: 'Lynx High-Value Wholesale Clearing (Canada)',
        protocol: 'ISO 20022 pacs.008 Lynx / SWIFT Net',
        description: 'Canadian national wholesale clearing system integrated with quantum-resistant message integrity checking.',
        standardMessage: 'pacs.008.001.08 Lynx Core',
        samplePayload: JSON.stringify({
          lynxTxRef: 'RBC-LYNX-2026-99018',
          amountCad: 12000000.00,
          orderingInstitution: 'ROYCCAT2',
          receivingInstitution: 'TDOMCAT2',
          pqcIntegrityMac: 'KMAC256-ML-DSA'
        }, null, 2),
        testResponse: JSON.stringify({
          lynxStatus: 'CLEARED_REAL_TIME',
          clearingHouse: 'PAYMENTS_CANADA_LYNX',
          confirmationHash: '0x33b8a1c900e2'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 & KMAC256',
      }
    ],
    complianceMatrix: [
      { standard: 'OSFI Guideline B-13 Technology & Cyber Risk', framework: 'OSFI Canada', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'Cryptographic inventory and CBOM tracking active across all high-value systems.' }
    ],
    cbomInventory: [
      { component: 'RBC PayEdge Corporate API', classicalPrimitive: 'ECDHE-secp256r1', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '256-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Cross-border CAD-USD corridor traffic subject to bulk surveillance harvesting.',
      mitigationPath: 'Enforce hybrid post-quantum TLS on all cross-border API endpoints.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-rbc-1', timestamp: '19:42:48', event: 'Lynx wholesale clearing payment dispatched with KMAC256-ML-DSA', primitive: 'KMAC256', status: 'SUCCESS' }
    ]
  },
  {
    id: 'bny',
    name: 'The Bank of New York Mellon (BNY)',
    shortName: 'BNY Mellon',
    ticker: 'BK',
    tier: 'Global Custodian / Clearing',
    category: 'Custody & Securities Servicing',
    headquarters: 'New York, USA',
    totalAssetsAUM: '$50.0 Trillion (Assets Under Custody/Admin)',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'SEC', 'PRA', 'ECB'],
    primaryProtocols: ['Nexen API', 'SWIFT ISO 20022', 'Fedwire Securities', 'DTC / Euroclear', 'FIX Protocol'],
    status: 'connected',
    quantumReadinessScore: 97,
    pqcStandards: {
      fips203: 'ML-KEM-768 & ML-KEM-1024',
      fips204: 'ML-DSA-65 & ML-DSA-87',
      hybridTlsVersion: 'TLS 1.3 draft-ietf-tls-hybrid',
      hsmLevel: 'FIPS 140-3 Level 4 Custody Cryptographic Module',
    },
    apiEndpoint: 'https://api.bnymellon.com/nexen/pqc/v2/custody',
    sandboxStatus: {
      latencyMs: 27,
      uptimePercent: 99.999,
      lastHandshake: '8 seconds ago',
      cbomEntriesCount: 220,
      activeCorridors: 46,
    },
    capabilities: [
      {
        id: 'bny-custody',
        title: 'Global Securities Custody & Tri-Party Repo Settlement',
        protocol: 'ISO 20022 semt / sese / Fedwire Securities',
        description: 'World-largest asset servicer custodian protecting $50T in assets with post-quantum ledger immutability and CBOM compliance.',
        standardMessage: 'sese.023.001.10 - Securities Settlement Transaction',
        samplePayload: JSON.stringify({
          repoInstructionId: 'BNY-TRI-PARTY-2026-001',
          collateralAllocation: 'US_GOVT_BILLS_28D',
          notionalUsd: 250000000.00,
          clearingSystem: 'FEDWIRE_SECURITIES_SERVICE',
          pqcAttestation: {
            kemAlgorithm: 'ML-KEM-1024',
            signatureAlgorithm: 'ML-DSA-87'
          }
        }, null, 2),
        testResponse: JSON.stringify({
          custodyConfirmation: 'AFFIRMED_AND_SECURED',
          triPartyBatchRef: 'BNY-TRI-998811',
          pqcVerificationHash: '0x88f1c09ab67d3e21'
        }, null, 2),
        pqcShield: 'FIPS 203 Level 5 ML-KEM-1024 Custody Seal',
      }
    ],
    complianceMatrix: [
      { standard: 'Federal Reserve High-Value Custody PQC Directives', framework: 'Federal Reserve Board', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Tri-party repo engine authenticated with post-quantum digital signatures.' },
      { standard: 'NIST SP 800-227 Implementation', framework: 'NIST', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'Automated CBOM updates pushed hourly across all custody tiers.' }
    ],
    cbomInventory: [
      { component: 'Nexen Custody API Gateway', classicalPrimitive: 'RSA-4096', postQuantumReplacement: 'Dual ML-KEM-1024 + ML-DSA-87', nistStandard: 'FIPS 203/204', keySizeClassical: '4096-bit', keySizePqc: '1568-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Global custody holdings records must remain provably confidential across 100-year fiduciary lifespans.',
      mitigationPath: 'Deploy ML-KEM-1024 with layered quantum-resistant symmetric AES-256 wrapping.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X448 + ML-KEM-1024)',
    },
    liveEvents: [
      { id: 'ev-bny-1', timestamp: '19:51:30', event: '$250M Tri-Party Repo batch cleared with ML-KEM-1024 custody seal', primitive: 'ML-KEM-1024', status: 'SUCCESS' }
    ]
  },
  {
    id: 'state-street',
    name: 'State Street Corporation',
    shortName: 'State Street',
    ticker: 'STT',
    tier: 'Global Custodian / Clearing',
    category: 'Custody & Securities Servicing',
    headquarters: 'Boston, MA, USA',
    totalAssetsAUM: '$44.3 Trillion (Assets Under Custody) / $4.4T AUM',
    regulatoryJurisdiction: ['Federal Reserve', 'OCC', 'SEC', 'PRA'],
    primaryProtocols: ['State Street Alpha API', 'Global Markets API', 'SWIFT Net', 'FIX 5.0 SP2', 'Euroclear'],
    status: 'connected',
    quantumReadinessScore: 94,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://alpha-api.statestreet.com/pqc/v1/asset-servicing',
    sandboxStatus: {
      latencyMs: 33,
      uptimePercent: 99.996,
      lastHandshake: '24 seconds ago',
      cbomEntriesCount: 168,
      activeCorridors: 33,
    },
    capabilities: [
      {
        id: 'stt-alpha',
        title: 'State Street Alpha Front-to-Back Investment Engine',
        protocol: 'RESTful API / FIX 5.0 / ISO 20022 sese.024',
        description: 'Comprehensive asset servicing, ETF basket calculation, and trade allocation with lattice signature verification.',
        standardMessage: 'sese.024.001.09 - Securities Settlement Status Advice',
        samplePayload: JSON.stringify({
          alphaOrderId: 'STT-ALPHA-ETF-4491',
          etfTicker: 'SPY',
          creationUnitCount: 50000,
          settlementDate: '2026-10-12',
          pqcSignerId: 'STT-FIPS204-ML-DSA-65'
        }, null, 2),
        testResponse: JSON.stringify({
          basketCalculated: true,
          status: 'AFFIRMED_IN_ALPHA',
          pqcAttestation: 'PASS'
        }, null, 2),
        pqcShield: 'FIPS 204 ML-DSA-65 Signature',
      }
    ],
    complianceMatrix: [
      { standard: 'SEC ETF Rule 6c-11 Data Security', framework: 'SEC', status: 'COMPLIANT', deadline: '2026-Q3', notes: 'Authorized participant trade files secured with post-quantum encryption.' }
    ],
    cbomInventory: [
      { component: 'State Street Alpha API', classicalPrimitive: 'ECDHE-secp256r1', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '256-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'ETF creation/redemption files intercepted in transit could enable front-running attacks.',
      mitigationPath: 'Mandatory hybrid TLS 1.3 on all Authorized Participant (AP) endpoints.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-stt-1', timestamp: '19:47:40', event: 'ETF creation unit advice affirmed with ML-DSA-65 signature', primitive: 'ML-DSA-65', status: 'SUCCESS' }
    ]
  },
  {
    id: 'standard-chartered',
    name: 'Standard Chartered PLC',
    shortName: 'Standard Chartered',
    ticker: 'STAN',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'London, United Kingdom',
    totalAssetsAUM: '$820 Billion (Assets)',
    regulatoryJurisdiction: ['PRA', 'FCA', 'HKMA', 'MAS', 'Federal Reserve'],
    primaryProtocols: ['Straight2Bank API', 'Cross-Border Trade Finance', 'SWIFT ISO 20022', 'RippleNet Corridor', 'mBridge DLT'],
    status: 'connected',
    quantumReadinessScore: 91,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://api.sc.com/straight2bank/pqc/v2/trade',
    sandboxStatus: {
      latencyMs: 46,
      uptimePercent: 99.991,
      lastHandshake: '59 seconds ago',
      cbomEntriesCount: 125,
      activeCorridors: 25,
    },
    capabilities: [
      {
        id: 'sc-straight2bank',
        title: 'Straight2Bank Emerging Markets Trade Finance & Letters of Credit',
        protocol: 'ISO 20022 tsmt / pacs.008 / mBridge',
        description: 'Multi-corridor cross-border financing across Asia, Africa, and Middle East with quantum envelope encryption.',
        standardMessage: 'tsmt.019.001.06 - Baseline Amendment / Letter of Credit',
        samplePayload: JSON.stringify({
          lcNumber: 'SC-LC-HK-SG-2026-901',
          applicant: 'SingaTrade Global Ltd',
          beneficiary: 'Hong Kong Logistics Hub',
          lcAmountUsd: 18500000.00,
          pqcProof: 'ML-KEM-768-ENVELOPE'
        }, null, 2),
        testResponse: JSON.stringify({
          lcIssued: true,
          tradeNetworkStatus: 'CONFIRMED_STRAIGHT2BANK',
          corridor: 'SINGAPORE_HONGKONG_PQC'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 Envelope',
      }
    ],
    complianceMatrix: [
      { standard: 'MAS Technology Risk Management Guidelines', framework: 'Monetary Authority of Singapore', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'Cross-border corridor crypto-agility audit cleared.' }
    ],
    cbomInventory: [
      { component: 'Straight2Bank Emerging Markets Hub', classicalPrimitive: 'RSA-2048', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '2048-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Maritime trade documents subject to long transit voyages vulnerable to delayed decryption.',
      mitigationPath: 'Wrap all electronic bills of lading in ML-KEM-768 encrypted envelopes.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-sc-1', timestamp: '19:41:33', event: 'Letter of credit issued with ML-KEM-768 envelope encryption', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'santander',
    name: 'Banco Santander, S.A.',
    shortName: 'Santander',
    ticker: 'SAN',
    tier: 'Tier 1 Global G-SIB',
    category: 'Commercial & Investment Banking',
    headquarters: 'Madrid, Spain',
    totalAssetsAUM: '€1.8 Trillion ($1.9T USD)',
    regulatoryJurisdiction: ['ECB', 'Bank of Spain', 'EBA', 'PRA', 'CNBV'],
    primaryProtocols: ['Santander Cash Nexus', 'PagoNxt Global Payments', 'SEPA Instant', 'SWIFT Net', 'PIX Brazil Gateway'],
    status: 'connected',
    quantumReadinessScore: 92,
    pqcStandards: {
      fips203: 'ML-KEM-768',
      fips204: 'ML-DSA-65',
      hybridTlsVersion: 'TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 3 HSM',
    },
    apiEndpoint: 'https://api.santander.com/nexus/pqc/v1/payments',
    sandboxStatus: {
      latencyMs: 38,
      uptimePercent: 99.994,
      lastHandshake: '36 seconds ago',
      cbomEntriesCount: 131,
      activeCorridors: 28,
    },
    capabilities: [
      {
        id: 'san-pagonxt',
        title: 'PagoNxt Global Merchant Acquiring & Latin America Corridors',
        protocol: 'RESTful API / ISO 20022 / PIX Instant Payments',
        description: 'Instant settlement bridging European SEPA and Latin American instant payment rails (PIX / SPEI) with quantum integrity checking.',
        standardMessage: 'pacs.008 & PIX Instant Transfer',
        samplePayload: JSON.stringify({
          nexusTxId: 'SAN-PAGONXT-2026-8819',
          corridor: 'SPAIN_TO_BRAZIL',
          amountEur: 750000.00,
          pixKeyTarget: 'treasury@corporate-latam.com',
          pqcSecurityToken: 'SAN_ML_KEM_768_AUTH'
        }, null, 2),
        testResponse: JSON.stringify({
          corridorStatus: 'INSTANT_SETTLED',
          fxRateApplied: 5.42,
          pqcVerification: 'VALID_LATTICE_PROOF'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 + PagoNxt Token',
      }
    ],
    complianceMatrix: [
      { standard: 'DORA Compliance & Cyber Resilience', framework: 'European Banking Authority', status: 'COMPLIANT', deadline: '2025-Q1', notes: 'Cross-border payment infrastructure certified with cryptographic agility.' }
    ],
    cbomInventory: [
      { component: 'Cash Nexus Corporate Portal', classicalPrimitive: 'ECDHE-RSA-2048', postQuantumReplacement: 'ML-KEM-768 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '2048-bit', keySizePqc: '1184-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Cross-continental subsea cables between Europe and South America susceptible to passive optical tapping.',
      mitigationPath: 'Immediate deployment of ML-KEM-768 post-quantum key exchange on all inter-regional WAN connections.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X25519 + ML-KEM-768)',
    },
    liveEvents: [
      { id: 'ev-san-1', timestamp: '19:44:50', event: 'PagoNxt transatlantic corridor payment cleared with ML-KEM-768 token', primitive: 'ML-KEM-768', status: 'SUCCESS' }
    ]
  },
  {
    id: 'swift-bis',
    name: 'SWIFT & BIS (Bank for International Settlements)',
    shortName: 'SWIFT / BIS Networks',
    tier: 'Central Clearing & Settlement',
    category: 'Central Settlement & Interbank',
    headquarters: 'La Hulpe, Belgium / Basel, Switzerland',
    totalAssetsAUM: '11,000+ Member Financial Institutions / 45M Daily Messages',
    regulatoryJurisdiction: ['National Bank of Belgium', 'G10 Central Banks Oversight', 'CPMI', 'FSB'],
    primaryProtocols: ['SWIFT ISO 20022 MX', 'SWIFT GPI', 'Project Agorá', 'Project Tourbillon', 'SWIFT Net PKI'],
    status: 'connected',
    quantumReadinessScore: 98,
    pqcStandards: {
      fips203: 'ML-KEM-768 & ML-KEM-1024',
      fips204: 'ML-DSA-65 & ML-DSA-87',
      hybridTlsVersion: 'SWIFT Net PQC Transport Layer / TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 4 Central Network HSM',
    },
    apiEndpoint: 'https://api.swift.com/pqc-network/v1/interbank-mesh',
    sandboxStatus: {
      latencyMs: 19,
      uptimePercent: 99.999,
      lastHandshake: '3 seconds ago',
      cbomEntriesCount: 310,
      activeCorridors: 85,
    },
    capabilities: [
      {
        id: 'swift-agora',
        title: 'Project Agorá Tokenized Commercial Bank Deposits & Central Bank Money',
        protocol: 'BIS & SWIFT Unified Ledger / ISO 20022 MX',
        description: 'Multi-central-bank unified ledger integrating tokenized wholesale central bank money with commercial bank deposits using quantum-safe cryptographic commitments.',
        standardMessage: 'BIS.Agora.UnifiedLedger.pacs.009.PQC',
        samplePayload: JSON.stringify({
          project: 'BIS_AGORA_PHASE_3',
          participatingCentralBanks: ['FED', 'ECB', 'BOE', 'BOJ', 'SNB', 'BOK', 'BANXICO'],
          settlementAsset: 'TOKENIZED_CENTRAL_BANK_RESERVE',
          atomicSettlementAmount: 100000000.00,
          currency: 'USD_EQUIVALENT',
          pqcMultiSig: {
            kemKey: 'ML-KEM-1024-BIS-HUB',
            sigThreshold: '5_OF_7_ML_DSA_87'
          }
        }, null, 2),
        testResponse: JSON.stringify({
          atomicFinality: 'FINAL_AND_IRREVOCABLE',
          unifiedLedgerBlock: 910244,
          quantumProofTimeMs: 16
        }, null, 2),
        pqcShield: 'NIST Level 5 (ML-KEM-1024 / Threshold ML-DSA-87)',
      },
      {
        id: 'swift-gpi-quantum',
        title: 'SWIFT GPI Quantum-Protected Interbank Cross-Border Tracker',
        protocol: 'SWIFT Net FIN / ISO 20022 MX / REST API',
        description: 'Universal Confirmation Tracker guaranteeing cryptographic traceability across all intermediate correspondent banking hops.',
        standardMessage: 'trck.001 - Universal Confirmation',
        samplePayload: JSON.stringify({
          uetr: '8e21a44c-9f01-4472-a128-09124489211a',
          status: 'ACSP_ACCEPTED_SETTLEMENT_IN_PROCESS',
          lastHopBic: 'CHASUS33',
          nextHopBic: 'DEUTDEDD',
          pqcHopSignature: 'ML-DSA-65-CORRESPONDENT-HOP'
        }, null, 2),
        testResponse: JSON.stringify({
          gpiTracked: true,
          endToEndLatency: '41 seconds',
          pqcHopAttestation: 'VERIFIED_CORRESPONDENT_PQC'
        }, null, 2),
        pqcShield: 'FIPS 204 ML-DSA-65 Hop-by-Hop Attestation',
      }
    ],
    complianceMatrix: [
      { standard: 'SWIFT Customer Security Programme (CSP v2026)', framework: 'SWIFT Board Oversight', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Mandatory CBOM and post-quantum readiness attestation for all Tier-1 member BICs.' },
      { standard: 'CPMI-IOSCO Principles for Financial Market Infrastructures (PFMI)', framework: 'BIS CPMI', status: 'COMPLIANT', deadline: '2026-Q2', notes: 'Systemic cyber resilience guaranteed against quantum cryptanalytic breakthroughs.' }
    ],
    cbomInventory: [
      { component: 'SWIFT Net VPN & Core Messaging Ingress', classicalPrimitive: 'RSA-4096 / ECDSA-P384', postQuantumReplacement: 'ML-KEM-1024 + Dual ML-DSA-87', nistStandard: 'FIPS 203/204', keySizeClassical: '4096-bit', keySizePqc: '1568-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'SWIFT Alliance Access PKI', classicalPrimitive: 'RSA-2048 PKI', postQuantumReplacement: 'Dual-Root Classical + ML-DSA-65 Root CA', nistStandard: 'FIPS 204', keySizeClassical: '2048-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'Global financial correspondent messages stored indefinitely in foreign signal intelligence archives represent catastrophic systemic risk.',
      mitigationPath: 'Execute SWIFT mandate transitioning all member connections to hybrid ML-KEM-768/1024 with zero legacy fallback.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X448 + ML-KEM-1024)',
    },
    liveEvents: [
      { id: 'ev-swift-1', timestamp: '19:51:34', event: 'Project Agorá atomic multi-central-bank settlement finalized with ML-KEM-1024', primitive: 'ML-KEM-1024', status: 'SUCCESS' },
      { id: 'ev-swift-2', timestamp: '19:50:01', event: 'SWIFT GPI Cross-Border correspondent hop verified with ML-DSA-65', primitive: 'ML-DSA-65', status: 'SECURED' }
    ]
  },
  {
    id: 'fednow-fedwire',
    name: 'Federal Reserve Financial Services (FedNow & Fedwire)',
    shortName: 'Federal Reserve Services',
    tier: 'Central Clearing & Settlement',
    category: 'Central Settlement & Interbank',
    headquarters: 'Washington, D.C. / Richmond, VA, USA',
    totalAssetsAUM: '$1,000+ Trillion Annual Wire Throughput',
    regulatoryJurisdiction: ['Federal Reserve Board of Governors', 'US Treasury', 'NIST', 'CISA'],
    primaryProtocols: ['FedNow Service ISO 20022', 'Fedwire Funds Service', 'Fedwire Securities', 'FedLine Solutions'],
    status: 'connected',
    quantumReadinessScore: 99,
    pqcStandards: {
      fips203: 'ML-KEM-768 & ML-KEM-1024 (CNSA 2.0 Mandated)',
      fips204: 'ML-DSA-65 & ML-DSA-87 (NIST Standard)',
      hybridTlsVersion: 'NIST SP 800-227 Compliant TLS 1.3 Hybrid',
      hsmLevel: 'FIPS 140-3 Level 4 National Security Cryptographic Module',
    },
    apiEndpoint: 'https://fedline-api.frb.org/pqc-gateway/v1/fednow',
    sandboxStatus: {
      latencyMs: 16,
      uptimePercent: 99.999,
      lastHandshake: '2 seconds ago',
      cbomEntriesCount: 345,
      activeCorridors: 92,
    },
    capabilities: [
      {
        id: 'fednow-instant',
        title: 'FedNow Instant Payments Settlement Rail',
        protocol: 'ISO 20022 pacs.008.001.08 / FedLine Direct',
        description: '24/7/365 US domestic instant interbank credit transfer with mandatory post-quantum envelope encryption protecting real-time liquidity.',
        standardMessage: 'pacs.008.001.08 FedNow Core Instant Transfer',
        samplePayload: JSON.stringify({
          GrpHdr: {
            MsgId: 'FEDNOW-2026-US-881920',
            CreDtTm: '2026-10-10T19:50:00Z',
            NbOfTxs: '1',
            SttlmInf: { SttlmMtd: 'CLRG', ClrSys: { Prtry: 'FEDNOW_INSTANT_PQC' } }
          },
          CdtTrfTxInf: {
            PmtId: { EndToEndId: 'FEDNOW-E2E-77112', TxId: 'FED-TX-99014' },
            IntrBkSttlmAmt: { Ccy: 'USD', Value: '250000.00' },
            DbtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: '021000021' } } },
            CdtrAgt: { FinInstnId: { ClrSysMmbId: { MmbId: '121000248' } } },
            PqcGovEnforcement: {
              ComplianceLevel: 'NIST_FIPS_203_LEVEL_3',
              KeyEncapsulationMechanism: 'ML-KEM-768',
              DigitalSignatureVerification: 'ML-DSA-65'
            }
          }
        }, null, 2),
        testResponse: JSON.stringify({
          Status: 'ACTC_SETTLED_INSTANT',
          FedNowTxReference: 'FEDNOW-CONF-2026-10-10-88192',
          SettlementTimeMs: 18,
          CentralBankLedgerCommitted: true,
          PqcAttestation: 'VERIFIED_NIST_FIPS_203_FIPS_204'
        }, null, 2),
        pqcShield: 'FIPS 203 ML-KEM-768 & FIPS 204 ML-DSA-65 National Rail',
      },
      {
        id: 'fedwire-funds',
        title: 'Fedwire Funds High-Value Real-Time Gross Settlement (RTGS)',
        protocol: 'Fedwire ISO 20022 Format / FedLine Direct IBM MQ',
        description: 'Large-value and time-critical payments connecting commercial depository institutions directly to Federal Reserve Bank balance sheets.',
        standardMessage: 'pacs.009.001.08 Fedwire Core Transfer',
        samplePayload: JSON.stringify({
          instructionType: 'FEDWIRE_RTGS_WHOLESALE',
          grossAmountUsd: 150000000.00,
          senderAba: '021000021',
          receiverAba: '121000248',
          settlementWindow: 'IMMEDIATE_RTGS',
          pqcLevel: 'CNSA_2_0_LEVEL_5_ML_KEM_1024'
        }, null, 2),
        testResponse: JSON.stringify({
          rtgsFinality: 'FINAL_AND_IRREVOCABLE',
          wireReference: '20261010MMQF001882',
          centralReserveDebited: true,
          latency: '22ms'
        }, null, 2),
        pqcShield: 'CNSA 2.0 Level 5 (ML-KEM-1024 / ML-DSA-87)',
      }
    ],
    complianceMatrix: [
      { standard: 'White House Executive Order 14078 & NSM-10', framework: 'Federal Government Mandate', status: 'COMPLIANT', deadline: '2025-Q4', notes: 'All critical financial infrastructure must transition to NIST-standardized PQC algorithms.' },
      { standard: 'Federal Reserve PQC Systemic Architecture Mandate', framework: 'Federal Reserve Board', status: 'COMPLIANT', deadline: '2026-Q1', notes: 'Zero classical legacy RSA connections allowed on FedLine Direct channels.' },
      { standard: 'NIST FIPS 203 & FIPS 204 Certification', framework: 'NIST / CAVP', status: 'COMPLIANT', deadline: '2025-Q3', notes: 'Cryptographic Algorithm Validation Program (CAVP) certificate issued.' }
    ],
    cbomInventory: [
      { component: 'FedLine Direct IBM MQ Transport Gateway', classicalPrimitive: 'RSA-4096 / TLS 1.2', postQuantumReplacement: 'ML-KEM-1024 + TLS 1.3 Hybrid', nistStandard: 'FIPS 203', keySizeClassical: '4096-bit', keySizePqc: '1568-byte CT', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'FedNow Core Instant Settlement Engine', classicalPrimitive: 'ECDSA secp256r1', postQuantumReplacement: 'Dual ML-DSA-65 + ECDSA', nistStandard: 'FIPS 204', keySizeClassical: '256-bit', keySizePqc: '3309-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' },
      { component: 'Fedwire Funds RTGS Balance Sheet Signer', classicalPrimitive: 'RSA-PSS-4096', postQuantumReplacement: 'ML-DSA-87 Hardware Signer', nistStandard: 'FIPS 204', keySizeClassical: '4096-bit', keySizePqc: '4595-byte Sig', riskTier: 'SECURE', transitionDeadline: 'Completed' }
    ],
    securityAdvisory: {
      hndlVulnerability: 'National sovereign interbank payments recorded on fiber routes constitute highest tier target for adversarial state actors.',
      mitigationPath: 'Immediate enforcement of CNSA 2.0 Level 5 ML-KEM-1024 and ML-DSA-87 with hardware-rooted entropy.',
      recommendedHybridCiphersuite: 'TLS_AES_256_GCM_SHA384 (X448 + ML-KEM-1024)',
    },
    liveEvents: [
      { id: 'ev-fed-1', timestamp: '19:51:38', event: 'FedNow Instant Payment settled in 18ms with FIPS 203 ML-KEM-768 verification', primitive: 'ML-KEM-768', status: 'SUCCESS' },
      { id: 'ev-fed-2', timestamp: '19:49:15', event: 'Fedwire RTGS $150M wholesale wire signed with CNSA 2.0 ML-DSA-87', primitive: 'ML-DSA-87', status: 'SUCCESS' },
      { id: 'ev-fed-3', timestamp: '19:45:00', event: 'FedLine Direct national node completed hourly quantum CBOM compliance verification', primitive: 'CBOM Audit', status: 'SECURED' }
    ]
  }
];
