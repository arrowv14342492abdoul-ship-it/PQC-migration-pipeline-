import { BankAccount, BankTransaction, TransactionType, TransactionDirection, VirtualCard } from '../types/banking';

export const INITIAL_BANK_ACCOUNT: BankAccount = {
  accountName: 'LatticeOps Treasury & Global Settlement LLC',
  accountNumber: '884901923841',
  maskedAccountNumber: '•••• •••• 3841',
  routingNumber: '021000021', // Fedwire ABA
  swiftBic: 'CHASUS33PQC',
  iban: 'US88 CHAS 0210 0002 1019 2384 10',
  accountType: 'Institutional Custody Reserve',
  institutionName: 'JPMorgan Chase & Co. (PQC Gateway Rail)',
  primaryCurrency: 'USD',
  availableBalance: 4829350.28,
  ledgerBalance: 4912100.0,
  pendingFunds: 82749.72,
  accruedYield: 18450.45,
  yieldApyPercent: 5.18,
  hsmFipsLevel: 'FIPS 140-3 Level 4 (Cold-Vault Sealed)',
  quantumKeyId: 'ML-KEM-1024-HSM-VAULT-08X',
  dualSignatureRequired: true,
  dailyWireLimit: 25000000.0,
  dailyWireUsed: 1350000.0,
  subBalances: [
    {
      currency: 'USD',
      symbol: '$',
      balance: 4829350.28,
      usdEquivalent: 4829350.28,
      exchangeRateToUsd: 1.0,
      flag: '🇺🇸',
    },
    {
      currency: 'EUR',
      symbol: '€',
      balance: 1450200.0,
      usdEquivalent: 1566216.0,
      exchangeRateToUsd: 1.08,
      flag: '🇪🇺',
    },
    {
      currency: 'GBP',
      symbol: '£',
      balance: 890400.0,
      usdEquivalent: 1148616.0,
      exchangeRateToUsd: 1.29,
      flag: '🇬🇧',
    },
    {
      currency: 'JPY',
      symbol: '¥',
      balance: 145000000.0,
      usdEquivalent: 966666.67,
      exchangeRateToUsd: 0.00667,
      flag: '🇯🇵',
    },
    {
      currency: 'CHF',
      symbol: 'CHF',
      balance: 620000.0,
      usdEquivalent: 700600.0,
      exchangeRateToUsd: 1.13,
      flag: '🇨🇭',
    },
  ],
  virtualCards: [
    {
      id: 'card-1',
      cardholderName: 'LATTICEOPS TREASURY OPS',
      cardNumber: '4829 •••• •••• 9102',
      expiryMonth: '09',
      expiryYear: '29',
      cvv: '849',
      dynamicPqcToken: 'PQC-MLDSA-87-CVV-9X28A',
      type: 'Corporate Physical Metal',
      network: 'Visa Infinite Business',
      status: 'ACTIVE',
      monthlyLimit: 250000,
      spentThisMonth: 42190.5,
      currency: 'USD',
      pqcRotationSeconds: 300,
    },
    {
      id: 'card-2',
      cardholderName: 'CLOUD INFRA & GPU RESERVES',
      cardNumber: '4532 •••• •••• 4419',
      expiryMonth: '11',
      expiryYear: '30',
      cvv: '312',
      dynamicPqcToken: 'PQC-MLDSA-87-CVV-1F89C',
      type: 'Cloud SaaS Virtual',
      network: 'Mastercard World Elite',
      status: 'ACTIVE',
      monthlyLimit: 100000,
      spentThisMonth: 18450.0,
      currency: 'USD',
      pqcRotationSeconds: 60,
    },
    {
      id: 'card-3',
      cardholderName: 'FEDNOW LIQUIDITY DISBURSEMENT',
      cardNumber: '4111 •••• •••• 7720',
      expiryMonth: '04',
      expiryYear: '28',
      cvv: '904',
      dynamicPqcToken: 'PQC-MLKEM-768-DYN-44A',
      type: 'Virtual Quantum Token',
      network: 'FedNow Virtual Rail',
      status: 'ACTIVE',
      monthlyLimit: 500000,
      spentThisMonth: 120500.0,
      currency: 'USD',
      pqcRotationSeconds: 30,
    },
  ],
};

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-001',
    uetr: '4f89d312-7bb3-41c8-a9f2-9018e472091c',
    date: '2026-10-10',
    timestamp: '19:42:18 UTC',
    description: 'FedNow Instant Liquidity Inflow - Clearing Member Rebalance',
    counterpartyName: 'Federal Reserve Bank of New York (FedNow Rail)',
    counterpartyBank: 'Federal Reserve Banks / FedNow Core',
    counterpartyAccount: 'FED-RTGS-0192841',
    counterpartyRouting: '011000015',
    type: 'FedNow Instant',
    direction: 'CREDIT',
    amount: 750000.0,
    currency: 'USD',
    fee: 0.25,
    balanceAfter: 4829350.28,
    status: 'SETTLED',
    category: 'Interbank Rail',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'FedNow instant interbank gross settlement corridor #4',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-1024 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-87 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-512:d8a9e01f2...c83b92',
      signatureDigest: 'ML-DSA-87:7f991c0e3a5824b029...e491',
      zkAttestationProof: 'ZK-SNARK-GROTH16-CIRCUIT-FED-VERIFIED',
      nonce: '0x99482710afb7321e',
      hsmSealedAt: '2026-10-10T19:42:17.810Z',
      entropySource: 'TRNG True Quantum Hardware Quantum Random Generator',
      quantumResistanceScore: 99,
    },
    timeline: [
      { step: 'Payment Initiated by Fed Member', timestamp: '19:42:16.120', status: 'COMPLETED', detail: 'Originator submitted pacs.008 message via ISO 20022 API' },
      { step: 'Lattice Key Encapsulation (ML-KEM-1024)', timestamp: '19:42:16.890', status: 'COMPLETED', detail: 'Shared secret derived in 4.2ms over hybrid TLS 1.3' },
      { step: 'FedNow Clearing & Settlement Engine', timestamp: '19:42:17.400', status: 'COMPLETED', detail: 'Central ledger debited sender, credited recipient RTGS account' },
      { step: 'Cryptographic Dual-Signature Sealed', timestamp: '19:42:17.810', status: 'COMPLETED', detail: 'ML-DSA-87 signed audit manifest stored in CBOM' },
      { step: 'Funds Settled & Available', timestamp: '19:42:18.000', status: 'COMPLETED', detail: 'Real-time ledger credited +$750,000.00' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>FEDNOW-20261010-09182371</MsgId>
      <CreDtTm>2026-10-10T19:42:16.120Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>FEDNOW</Prtry></ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-FED-9918274</EndToEndId>
        <UETR>4f89d312-7bb3-41c8-a9f2-9018e472091c</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">750000.00</IntrBkSttlmAmt>
      <Dbtr><Nm>Federal Reserve Clearing Unit</Nm></Dbtr>
      <Cdtr><Nm>LatticeOps Treasury LLC</Nm></Cdtr>
      <PqcShield>
        <Fips203Kem>ML-KEM-1024</Fips203Kem>
        <Fips204Sig>ML-DSA-87</Fips204Sig>
        <CertRef>HSM-VAULT-FEDNY-01</CertRef>
      </PqcShield>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
    },
  },
  {
    id: 'tx-002',
    uetr: '88b201a4-92ef-479c-b1d5-99882201e741',
    date: '2026-10-10',
    timestamp: '18:15:02 UTC',
    description: 'SWIFT GPI Cross-Border Settlement - BNP Paribas Paris',
    counterpartyName: 'BNP Paribas S.A. Institutional Paris',
    counterpartyBank: 'BNP Paribas (BNPAFR22PQC)',
    counterpartyAccount: 'FR76 3000 4001 2345 6789 0123 456',
    counterpartyRouting: 'BNPAFR22XXX',
    type: 'SWIFT GPI Cross-Border',
    direction: 'DEBIT',
    amount: 320000.0,
    currency: 'USD',
    fee: 18.5,
    balanceAfter: 4079350.28,
    status: 'SETTLED',
    category: 'Vendor Settlement',
    isoMessageType: 'pacs.009.001.09',
    referenceNote: 'Quantum hardware appliance procurement - Series QX8',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-768 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-256:4a88bc91...71ef02',
      signatureDigest: 'ML-DSA-65:982b1c4e7...09a1',
      zkAttestationProof: 'SWIFT-GPI-TRACKER-PQC-STAGE-4',
      nonce: '0x12bb49f8721c440a',
      hsmSealedAt: '2026-10-10T18:15:01.210Z',
      entropySource: 'Entropy Beacon European Metrology Cloud',
      quantumResistanceScore: 98,
    },
    timeline: [
      { step: 'SWIFT MT103/pacs.009 Formatted', timestamp: '18:14:58.200', status: 'COMPLETED', detail: 'Message encrypted with recipient public lattice key' },
      { step: 'SWIFT GPI Interbank Routing', timestamp: '18:14:59.800', status: 'COMPLETED', detail: 'Routed across London & Frankfurt clearing nodes' },
      { step: 'AML/OFAC Screening & FIPS 204 Verification', timestamp: '18:15:00.600', status: 'COMPLETED', detail: 'Sanctions list clear; signature verified' },
      { step: 'Beneficiary Bank Credit (BNP Paris)', timestamp: '18:15:02.000', status: 'COMPLETED', detail: 'Target account credited; SWIFT confirmation received' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.09">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>SWIFT-20261010-BNP-38192</MsgId>
      <CreDtTm>2026-10-10T18:14:58.200Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <UETR>88b201a4-92ef-479c-b1d5-99882201e741</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">320000.00</IntrBkSttlmAmt>
      <DbtrAgt><FinInstnId><BICFI>CHASUS33PQC</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>BNPAFR22PQC</BICFI></FinInstnId></CdtrAgt>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`,
    },
  },
  {
    id: 'tx-003',
    uetr: '12e9481b-5134-45b0-8c29-3019485728a0',
    date: '2026-10-10',
    timestamp: '16:00:00 UTC',
    description: 'Overnight Treasury Sweep Yield Distribution (5.18% APY)',
    counterpartyName: 'JPMorgan Chase Treasury Securities Liquidity Pool',
    counterpartyBank: 'JPMorgan Chase Custody Services',
    counterpartyAccount: 'JPM-REPO-TREASURY-01',
    counterpartyRouting: '021000021',
    type: 'Treasury Yield Interest',
    direction: 'CREDIT',
    amount: 12450.45,
    currency: 'USD',
    fee: 0.0,
    balanceAfter: 4399350.28,
    status: 'SETTLED',
    category: 'Interest Income',
    isoMessageType: 'camt.054.001.08',
    referenceNote: 'Daily compounding yield sweep on 4-Week US Treasury Bills',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-1024 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-87 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-512:19c00b...aa419',
      signatureDigest: 'ML-DSA-87:bb1190a...55f2',
      zkAttestationProof: 'ZK-TREASURY-REPO-AUDIT-VERIFIED',
      nonce: '0x884910283741aa89',
      hsmSealedAt: '2026-10-10T16:00:00.010Z',
      entropySource: 'Internal Quantum Vault Random Generator',
      quantumResistanceScore: 100,
    },
    timeline: [
      { step: 'Overnight Repo Settlement Calculated', timestamp: '15:59:59.100', status: 'COMPLETED', detail: 'T-Bills repo yield rate pegged to 5.18% APY' },
      { step: 'Interest Credit Issued', timestamp: '16:00:00.010', status: 'COMPLETED', detail: 'Automated CAMT.054 debit/credit notification generated' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtNtfctn>
    <Ntfctn>
      <Id>YIELD-20261010-REPO-001</Id>
      <Amt Ccy="USD">12450.45</Amt>
      <CdtDbtInd>CRDT</CdtDbtInd>
      <NtryDtls>
        <TxDtls>
          <Refs><EndToEndId>US-TBILL-REPO-SWEEP</EndToEndId></Refs>
          <AmtDtls><TxAmt><Amt Ccy="USD">12450.45</Amt></TxAmt></AmtDtls>
        </TxDtls>
      </NtryDtls>
    </Ntfctn>
  </BkToCstmrDbtCdtNtfctn>
</Document>`,
    },
  },
  {
    id: 'tx-004',
    uetr: '77ac9014-4112-4ee1-b992-099481273981',
    date: '2026-10-10',
    timestamp: '14:22:45 UTC',
    description: 'Enterprise Bi-Weekly Engineering Payroll Distribution',
    counterpartyName: 'Automated Clearing House (NACHA PQC Gateway)',
    counterpartyBank: 'Federal Reserve Bank ACH Processing',
    counterpartyAccount: 'NACHA-BATCH-99482',
    counterpartyRouting: '021000021',
    type: 'ACH Direct Deposit',
    direction: 'DEBIT',
    amount: 185420.0,
    currency: 'USD',
    fee: 4.5,
    balanceAfter: 4386899.83,
    status: 'SETTLED',
    category: 'Payroll & HR',
    isoMessageType: 'pain.001.001.11',
    referenceNote: 'Direct deposit payroll batch for 68 engineers & cryptography researchers',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-768 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-256:88ee114...99ac4',
      signatureDigest: 'ML-DSA-65:5512bc9...881a',
      zkAttestationProof: 'ZK-NACHA-PAYROLL-MERKLE-ROOT-OK',
      nonce: '0x004918237192ba88',
      hsmSealedAt: '2026-10-10T14:22:44.910Z',
      entropySource: 'TRNG True Hardware Quantum Device',
      quantumResistanceScore: 97,
    },
    timeline: [
      { step: 'NACHA PAIN.001 File Built', timestamp: '14:22:40.000', status: 'COMPLETED', detail: '68 batch items validated against recipient bank transit numbers' },
      { step: 'Post-Quantum Batch Signing', timestamp: '14:22:42.500', status: 'COMPLETED', detail: 'ML-DSA-65 multi-sig signed by dual authorized officers' },
      { step: 'ACH Network Cleared', timestamp: '14:22:45.000', status: 'COMPLETED', detail: 'FedACH distributed funds to employee domestic accounts' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.11">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>PAYROLL-20261010-NACHA</MsgId>
      <NbOfTxs>68</NbOfTxs>
      <CtrlSum>185420.00</CtrlSum>
    </GrpHdr>
    <PmtInf>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>2026-10-10</ReqdExctnDt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`,
    },
  },
  {
    id: 'tx-005',
    uetr: '55bc9981-1249-4aa8-b112-984018274199',
    date: '2026-10-10',
    timestamp: '11:10:30 UTC',
    description: 'Cloud Infrastructure & High-Performance Compute Cluster',
    counterpartyName: 'Google Cloud Platform & Vertex AI Services',
    counterpartyBank: 'Citigroup North America',
    counterpartyAccount: 'GCP-BILLING-CORP-01',
    counterpartyRouting: '021000089',
    type: 'Commercial Card Authorization',
    direction: 'DEBIT',
    amount: 14250.0,
    currency: 'USD',
    fee: 0.0,
    balanceAfter: 4572319.83,
    status: 'SETTLED',
    category: 'Cloud Infrastructure',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'GPU clusters for post-quantum lattice verification and CI/CD pipelines',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-1024 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-87 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-512:33ff88...991a',
      signatureDigest: 'ML-DSA-87:1122aabb...7788',
      zkAttestationProof: 'ZK-TOKENIZED-CARD-AUTH-CONFIRMED',
      nonce: '0x448821901a8b',
      hsmSealedAt: '2026-10-10T11:10:29.800Z',
      entropySource: 'Hardware Quantum Random RNG',
      quantumResistanceScore: 99,
    },
    timeline: [
      { step: 'Card Token Pre-Auth', timestamp: '11:10:28.100', status: 'COMPLETED', detail: 'Dynamic CVV rotated and verified via HSM' },
      { step: 'Settlement Confirmed', timestamp: '11:10:30.000', status: 'COMPLETED', detail: 'Merchant received instantaneous authorization' },
    ],
    rawPayload: {
      format: 'JSON_API',
      content: JSON.stringify({
        event: 'card.authorized',
        card_token: '4532-CARD-SAAS-4419',
        amount: 14250.0,
        currency: 'USD',
        merchant: 'Google Cloud EMEA & Americas',
        auth_code: 'AUTH-GCP-99482',
        pqc_signature: 'ML-DSA-87:valid',
      }, null, 2),
    },
  },
  {
    id: 'tx-006',
    uetr: 'aa912847-cc81-4209-9118-0192847291aa',
    date: '2026-10-09',
    timestamp: '21:05:14 UTC',
    description: 'Multi-Currency Foreign Exchange Swap (USD to EUR Hedging)',
    counterpartyName: 'Deutsche Bank FX Prime Brokerage',
    counterpartyBank: 'Deutsche Bank AG Frankfurt (DEUTDEDBFXX)',
    counterpartyAccount: 'DE89 5007 0010 0987 6543 21',
    counterpartyRouting: 'DEUTDEDBFXX',
    type: 'Multi-Currency FX Settlement',
    direction: 'DEBIT',
    amount: 500000.0,
    currency: 'USD',
    fee: 25.0,
    balanceAfter: 4586569.83,
    status: 'SETTLED',
    category: 'FX Hedging',
    isoMessageType: 'pacs.009.001.09',
    referenceNote: 'Spot swap: $500,000 USD exchanged for €462,962.96 EUR @ 1.0800',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-1024 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-87 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-512:991188...44bb',
      signatureDigest: 'ML-DSA-87:443322...11ff',
      zkAttestationProof: 'ZK-CLS-FX-PQC-PROOF',
      nonce: '0x9922114488aa',
      hsmSealedAt: '2026-10-09T21:05:13.500Z',
      entropySource: 'German BSI-Compliant TRNG',
      quantumResistanceScore: 100,
    },
    timeline: [
      { step: 'FX Rate Locked with Deutsche Bank', timestamp: '21:05:10.000', status: 'COMPLETED', detail: 'Rate 1.0800 USD/EUR locked for 180 seconds' },
      { step: 'Payment-versus-Payment (PvP) CLS Settled', timestamp: '21:05:12.000', status: 'COMPLETED', detail: 'Continuous Linked Settlement simultaneously exchanged funds' },
      { step: 'Sub-account Credited', timestamp: '21:05:14.000', status: 'COMPLETED', detail: 'EUR reserve wallet credited +€462,962.96' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.09">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>FX-CLS-20261009-DB-001</MsgId>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>FX-SWAP-USD-EUR</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="USD">500000.00</IntrBkSttlmAmt>
      <DbtrAgt><FinInstnId><BICFI>CHASUS33PQC</BICFI></FinInstnId></DbtrAgt>
      <CdtrAgt><FinInstnId><BICFI>DEUTDEDBFXX</BICFI></FinInstnId></CdtrAgt>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`,
    },
  },
  {
    id: 'tx-007',
    uetr: 'bb334411-9988-4712-a102-881928374655',
    date: '2026-10-09',
    timestamp: '15:30:22 UTC',
    description: 'Post-Quantum Hardware Security Module Maintenance Retainer',
    counterpartyName: 'Thales DIS CPL & Utimaco Security Hardware',
    counterpartyBank: 'UBS Switzerland AG',
    counterpartyAccount: 'CH93 0023 0230 4567 8901 2',
    counterpartyRouting: 'UBSWCHZH80A',
    type: 'Fedwire RTGS',
    direction: 'DEBIT',
    amount: 45000.0,
    currency: 'USD',
    fee: 15.0,
    balanceAfter: 5086569.83,
    status: 'SETTLED',
    category: 'Vendor Settlement',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'FIPS 140-3 Level 4 HSM key ceramic tamper firmware updates',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-768 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-65 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-256:77bb00...33aa',
      signatureDigest: 'ML-DSA-65:99aabb...44cc',
      zkAttestationProof: 'ZK-FEDWIRE-FIPS-PROOF',
      nonce: '0x12903847a98b',
      hsmSealedAt: '2026-10-09T15:30:21.000Z',
      entropySource: 'Swiss Quantum Cryptography Generator',
      quantumResistanceScore: 98,
    },
    timeline: [
      { step: 'Fedwire Funds Request Queued', timestamp: '15:30:19.000', status: 'COMPLETED', detail: 'Fedwire funds transfer message submitted' },
      { step: 'Immediate Real-Time Gross Settlement', timestamp: '15:30:22.000', status: 'COMPLETED', detail: 'Final and irrevocable settlement completed' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr><MsgId>FEDWIRE-20261009-0918</MsgId></GrpHdr>
    <CdtTrfTxInf>
      <IntrBkSttlmAmt Ccy="USD">45000.00</IntrBkSttlmAmt>
      <Dbtr><Nm>LatticeOps LLC</Nm></Dbtr>
      <Cdtr><Nm>Thales Security Services</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
    },
  },
  {
    id: 'tx-008',
    uetr: 'cc445522-0099-4823-b213-992039485766',
    date: '2026-10-09',
    timestamp: '09:12:00 UTC',
    description: 'Enterprise Client License Inflow - Global PQC Migration Platform',
    counterpartyName: 'Morgan Stanley Institutional Services',
    counterpartyBank: 'Morgan Stanley Bank N.A. (MSNYUS33)',
    counterpartyAccount: 'MS-CORP-CLIENT-77291',
    counterpartyRouting: '026014496',
    type: 'FedNow Instant',
    direction: 'CREDIT',
    amount: 1250000.0,
    currency: 'USD',
    fee: 0.25,
    balanceAfter: 5131569.83,
    status: 'SETTLED',
    category: 'Treasury & Reserves',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'Annual enterprise multi-node post-quantum compliance license',
    pqcCertificate: {
      encapsulationAlgorithm: 'ML-KEM-1024 (NIST FIPS 203)',
      signatureAlgorithm: 'ML-DSA-87 (NIST FIPS 204)',
      kemPublicKeyFingerprint: 'SHA3-512:445566...7788',
      signatureDigest: 'ML-DSA-87:a1b2c3d4...e5f6',
      zkAttestationProof: 'ZK-FEDNOW-CLIENT-RECEIPT-VERIFIED',
      nonce: '0x33445566778899aa',
      hsmSealedAt: '2026-10-09T09:11:59.200Z',
      entropySource: 'True Quantum Laser Noise Generator',
      quantumResistanceScore: 100,
    },
    timeline: [
      { step: 'License Invoice Paid by Morgan Stanley', timestamp: '09:11:57.000', status: 'COMPLETED', detail: 'Client initiated instant FedNow wire payment' },
      { step: 'Cryptographic Signature Verified', timestamp: '09:11:58.500', status: 'COMPLETED', detail: 'Client PQC public key authenticated' },
      { step: 'Settled to Operating Reserve', timestamp: '09:12:00.000', status: 'COMPLETED', detail: '+$1,250,000.00 available immediately' },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr><MsgId>FEDNOW-20261009-MS-1250</MsgId></GrpHdr>
    <CdtTrfTxInf>
      <IntrBkSttlmAmt Ccy="USD">1250000.00</IntrBkSttlmAmt>
      <Dbtr><Nm>Morgan Stanley Institutional</Nm></Dbtr>
      <Cdtr><Nm>LatticeOps Treasury LLC</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`,
    },
  },
];

// Presets for the Transaction Generator
export interface TransactionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: TransactionType;
  direction: TransactionDirection;
  suggestedAmount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
  counterpartyName: string;
  counterpartyBank: string;
  counterpartyAccount: string;
  counterpartyRouting: string;
  category: BankTransaction['category'];
  isoMessageType: string;
  referenceNote: string;
}

export const TRANSACTION_PRESETS: TransactionPreset[] = [
  {
    id: 'fednow-liquidity',
    name: 'FedNow Instant Settlement',
    description: 'Real-time 24/7/365 US central bank clearing with sub-second finality',
    icon: 'Zap',
    type: 'FedNow Instant',
    direction: 'CREDIT',
    suggestedAmount: 500000.0,
    currency: 'USD',
    counterpartyName: 'Federal Reserve Bank of New York (FedNow)',
    counterpartyBank: 'FedNow Central Rail Services',
    counterpartyAccount: 'FED-RTGS-0192841',
    counterpartyRouting: '011000015',
    category: 'Interbank Rail',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'FedNow interbank liquidity replenishment corridor',
  },
  {
    id: 'swift-wholesale',
    name: 'SWIFT GPI Cross-Border Wire',
    description: 'High-value international wholesale wire with end-to-end tracking',
    icon: 'Globe',
    type: 'SWIFT GPI Cross-Border',
    direction: 'DEBIT',
    suggestedAmount: 850000.0,
    currency: 'USD',
    counterpartyName: 'Barclays International Corp (London)',
    counterpartyBank: 'Barclays Bank PLC (BARCGB22PQC)',
    counterpartyAccount: 'GB29 BARC 2000 0012 3456 78',
    counterpartyRouting: 'BARCGB22XXX',
    category: 'Vendor Settlement',
    isoMessageType: 'pacs.009.001.09',
    referenceNote: 'Institutional cross-border clearing settlement',
  },
  {
    id: 'treasury-yield',
    name: 'Overnight Treasury Yield Distribution',
    description: 'Interest credit from short-term US Treasury Bills (5.18% APY)',
    icon: 'TrendingUp',
    type: 'Treasury Yield Interest',
    direction: 'CREDIT',
    suggestedAmount: 18720.5,
    currency: 'USD',
    counterpartyName: 'JPMorgan Chase Treasury Securities Liquidity Pool',
    counterpartyBank: 'JPMorgan Custody Reserve Vault',
    counterpartyAccount: 'JPM-REPO-TREASURY-01',
    counterpartyRouting: '021000021',
    category: 'Interest Income',
    isoMessageType: 'camt.054.001.08',
    referenceNote: 'Daily compounding yield on treasury reserve balance',
  },
  {
    id: 'nacha-payroll',
    name: 'Corporate Engineering Payroll Run',
    description: 'Automated Clearing House (ACH) direct deposit disbursement',
    icon: 'Users',
    type: 'ACH Direct Deposit',
    direction: 'DEBIT',
    suggestedAmount: 195000.0,
    currency: 'USD',
    counterpartyName: 'Automated Clearing House (NACHA Gateway)',
    counterpartyBank: 'Federal Reserve ACH Central',
    counterpartyAccount: 'NACHA-BATCH-77401',
    counterpartyRouting: '021000021',
    category: 'Payroll & HR',
    isoMessageType: 'pain.001.001.11',
    referenceNote: 'Direct payroll distribution for technical staff & research fellows',
  },
  {
    id: 'fx-eur-swap',
    name: 'Multi-Currency Foreign Exchange Swap',
    description: 'Spot foreign exchange liquidity swap with PvP CLS protection',
    icon: 'RefreshCw',
    type: 'Multi-Currency FX Settlement',
    direction: 'DEBIT',
    suggestedAmount: 250000.0,
    currency: 'USD',
    counterpartyName: 'UBS AG Zurich Multi-Currency Desk',
    counterpartyBank: 'UBS Switzerland AG (UBSWCHZH80A)',
    counterpartyAccount: 'CH93 0023 0230 4567 8901 2',
    counterpartyRouting: 'UBSWCHZH80A',
    category: 'FX Hedging',
    isoMessageType: 'pacs.009.001.09',
    referenceNote: 'USD/EUR spot currency swap @ 1.0815 rate',
  },
  {
    id: 'fedwire-rtgs',
    name: 'Fedwire RTGS Wholesale Transfer',
    description: 'Immediate, final, and irrevocable central bank funds transfer',
    icon: 'Shield',
    type: 'Fedwire RTGS',
    direction: 'DEBIT',
    suggestedAmount: 1200000.0,
    currency: 'USD',
    counterpartyName: 'The Bank of New York Mellon Custody',
    counterpartyBank: 'BNY Mellon (BKTRUS33)',
    counterpartyAccount: 'BNY-CUSTODY-881920',
    counterpartyRouting: '021000018',
    category: 'Treasury & Reserves',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'Custody capital allocation to sovereign reserve vault',
  },
  {
    id: 'quantum-escrow',
    name: 'PQC Smart Escrow Attestation',
    description: 'Cryptographically secured multi-signature conditional escrow',
    icon: 'Lock',
    type: 'PQC Smart Contract Escrow',
    direction: 'CREDIT',
    suggestedAmount: 640000.0,
    currency: 'USD',
    counterpartyName: 'Apex Cryptographic Escrow Vault',
    counterpartyBank: 'State Street Global Markets (SBOSUS33)',
    counterpartyAccount: 'ESCROW-PQC-VAULT-99',
    counterpartyRouting: '011000028',
    category: 'Treasury & Reserves',
    isoMessageType: 'pacs.008.001.10',
    referenceNote: 'Escrow release milestone #2 verified with ML-DSA-87 signatures',
  },
];

// Helper to generate a realistic random UUID for UETR
export function generateRandomUetr(): string {
  const hex = (len: number) =>
    Array.from({ length: len }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

// Generate single transaction with full details
let bankTxCounter = 0;

export function generateFullTransaction(
  customParams?: Partial<BankTransaction> & {
    pqcLevel?: 'FIPS 203 ML-KEM-1024' | 'FIPS 203 ML-KEM-768';
  },
  currentBalance = 4829350.28
): BankTransaction {
  const randomPreset =
    TRANSACTION_PRESETS[
      Math.floor(Math.random() * TRANSACTION_PRESETS.length)
    ];

  const now = new Date();
  const timeString = now.toTimeString().split(' ')[0] + ' UTC';
  const dateString = now.toISOString().split('T')[0];
  const uetr = generateRandomUetr();

  const direction = customParams?.direction || randomPreset.direction;
  const amount = customParams?.amount || randomPreset.suggestedAmount;
  const currency = customParams?.currency || randomPreset.currency;
  const type = customParams?.type || randomPreset.type;
  const fee = direction === 'DEBIT' ? (type.includes('FedNow') ? 0.25 : type.includes('SWIFT') ? 18.5 : 5.0) : 0.0;
  
  const balanceAfter =
    direction === 'CREDIT'
      ? currentBalance + amount
      : currentBalance - amount - fee;

  const pqcLevel = customParams?.pqcLevel || 'FIPS 203 ML-KEM-1024';
  const kemAlgo =
    pqcLevel === 'FIPS 203 ML-KEM-1024'
      ? 'ML-KEM-1024 (NIST FIPS 203)'
      : 'ML-KEM-768 (NIST FIPS 203)';
  const sigAlgo =
    pqcLevel === 'FIPS 203 ML-KEM-1024'
      ? 'ML-DSA-87 (NIST FIPS 204)'
      : 'ML-DSA-65 (NIST FIPS 204)';

  const nonce = '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  const pubFingerprint = 'SHA3-512:' + Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 6);
  const sigDigest = `${sigAlgo.split(' ')[0]}:${Math.random().toString(36).substring(2, 12)}...${Math.random().toString(36).substring(2, 8)}`;

  const counterpartyName = customParams?.counterpartyName || randomPreset.counterpartyName;
  const counterpartyBank = customParams?.counterpartyBank || randomPreset.counterpartyBank;
  const counterpartyAccount = customParams?.counterpartyAccount || randomPreset.counterpartyAccount;
  const counterpartyRouting = customParams?.counterpartyRouting || randomPreset.counterpartyRouting;
  const category = customParams?.category || randomPreset.category;
  const isoMessageType = customParams?.isoMessageType || randomPreset.isoMessageType;
  const referenceNote = customParams?.referenceNote || randomPreset.referenceNote;
  const description =
    customParams?.description ||
    `${type} - ${direction === 'CREDIT' ? 'Inbound' : 'Outbound'} Settlement with ${counterpartyName}`;

  const rawXml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${isoMessageType}">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>GEN-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 900000 + 100000)}</MsgId>
      <CreDtTm>${now.toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys><Prtry>${type.replace(/ /g, '_').toUpperCase()}</Prtry></ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>E2E-GEN-${Math.floor(Math.random() * 9000000 + 1000000)}</EndToEndId>
        <UETR>${uetr}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${currency}">${amount.toFixed(2)}</IntrBkSttlmAmt>
      <Dbtr><Nm>${direction === 'CREDIT' ? counterpartyName : 'LatticeOps Treasury LLC'}</Nm></Dbtr>
      <Cdtr><Nm>${direction === 'CREDIT' ? 'LatticeOps Treasury LLC' : counterpartyName}</Nm></Cdtr>
      <PqcShield>
        <Fips203Kem>${kemAlgo}</Fips203Kem>
        <Fips204Sig>${sigAlgo}</Fips204Sig>
        <Nonce>${nonce}</Nonce>
        <EntropyLevel>Hardware TRNG FIPS 140-3 L4</EntropyLevel>
      </PqcShield>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;

  return {
    id: customParams?.id || `tx-${Date.now()}-${++bankTxCounter}-${Math.random().toString(36).substring(2, 9)}`,
    uetr,
    date: dateString,
    timestamp: timeString,
    description,
    counterpartyName,
    counterpartyBank,
    counterpartyAccount,
    counterpartyRouting,
    type,
    direction,
    amount,
    currency,
    fee,
    balanceAfter,
    status: customParams?.status || 'SETTLED',
    category,
    isoMessageType,
    referenceNote,
    pqcCertificate: {
      encapsulationAlgorithm: kemAlgo,
      signatureAlgorithm: sigAlgo,
      kemPublicKeyFingerprint: pubFingerprint,
      signatureDigest: sigDigest,
      zkAttestationProof: `ZK-SNARK-ISO20022-${Math.random().toString(36).substring(2, 8).toUpperCase()}-VERIFIED`,
      nonce,
      hsmSealedAt: now.toISOString(),
      entropySource: 'TRNG True Quantum Hardware Quantum Random Generator',
      quantumResistanceScore: Math.floor(Math.random() * 3) + 98,
    },
    timeline: [
      {
        step: 'Transaction Payload Generated & Formatted',
        timestamp: `${timeString} - 3.2s`,
        status: 'COMPLETED',
        detail: `ISO 20022 ${isoMessageType} message structured with end-to-end UETR`,
      },
      {
        step: `Lattice Key Encapsulation (${kemAlgo.split(' ')[0]})`,
        timestamp: `${timeString} - 2.1s`,
        status: 'COMPLETED',
        detail: 'NIST FIPS 203 shared secret negotiated in 3.8ms over hybrid TLS 1.3',
      },
      {
        step: `Dual Post-Quantum Signature (${sigAlgo.split(' ')[0]})`,
        timestamp: `${timeString} - 1.1s`,
        status: 'COMPLETED',
        detail: 'HSM cryptographic manifest signed and submitted to clearing network',
      },
      {
        step: 'Interbank Network Clearing & Settlement',
        timestamp: `${timeString} - 0.2s`,
        status: 'COMPLETED',
        detail: `${type} settlement validated across counterparty rails`,
      },
      {
        step: 'Ledger Settlement Finalized',
        timestamp: timeString,
        status: 'COMPLETED',
        detail: `Ledger balance updated. Final and irrevocable confirmation recorded.`,
      },
    ],
    rawPayload: {
      format: 'ISO_20022_XML',
      content: rawXml,
    },
  };
}
