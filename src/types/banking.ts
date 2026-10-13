export type InstitutionTier =
  | 'Tier 1 Global G-SIB'
  | 'Central Clearing & Settlement'
  | 'Global Custodian / Clearing'
  | 'Major Regional / Super-Regional';

export type InstitutionCategory =
  | 'Commercial & Investment Banking'
  | 'Central Settlement & Interbank'
  | 'Custody & Securities Servicing'
  | 'Wealth & Asset Management';

export type IntegrationStatus = 'connected' | 'live-pilot' | 'audited' | 'migrating';

export interface BankingComplianceItem {
  standard: string;
  framework: string;
  status: 'COMPLIANT' | 'IN_PROGRESS' | 'MANDATED';
  deadline: string;
  notes: string;
}

export interface BankingIntegrationCapability {
  id: string;
  title: string;
  protocol: string;
  description: string;
  standardMessage: string;
  samplePayload: string;
  testResponse: string;
  pqcShield: string;
}

export interface BankingCbomItem {
  component: string;
  classicalPrimitive: string;
  postQuantumReplacement: string;
  nistStandard: string;
  keySizeClassical: string;
  keySizePqc: string;
  riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SECURE';
  transitionDeadline: string;
}

export interface FinancialInstitution {
  id: string;
  name: string;
  shortName: string;
  ticker?: string;
  tier: InstitutionTier;
  category: InstitutionCategory;
  headquarters: string;
  totalAssetsAUM: string;
  regulatoryJurisdiction: string[];
  primaryProtocols: string[];
  status: IntegrationStatus;
  quantumReadinessScore: number; // 0 - 100
  pqcStandards: {
    fips203: string;
    fips204: string;
    hybridTlsVersion: string;
    hsmLevel: string;
  };
  apiEndpoint: string;
  sandboxStatus: {
    latencyMs: number;
    uptimePercent: number;
    lastHandshake: string;
    cbomEntriesCount: number;
    activeCorridors: number;
  };
  capabilities: BankingIntegrationCapability[];
  complianceMatrix: BankingComplianceItem[];
  cbomInventory: BankingCbomItem[];
  securityAdvisory: {
    hndlVulnerability: string;
    mitigationPath: string;
    recommendedHybridCiphersuite: string;
  };
  liveEvents: Array<{
    id: string;
    timestamp: string;
    event: string;
    primitive: string;
    status: 'SUCCESS' | 'WARNING' | 'SECURED';
  }>;
}

export type TransactionType =
  | 'FedNow Instant'
  | 'SWIFT GPI Cross-Border'
  | 'Fedwire RTGS'
  | 'ACH Direct Deposit'
  | 'ACH Direct Debit'
  | 'Commercial Card Authorization'
  | 'Treasury Yield Interest'
  | 'Multi-Currency FX Settlement'
  | 'Interbank Liquidity Transfer'
  | 'PQC Smart Contract Escrow';

export type TransactionDirection = 'CREDIT' | 'DEBIT';

export type TransactionStatus =
  | 'SETTLED'
  | 'PROCESSING'
  | 'CRYPTOGRAPHICALLY_VERIFIED'
  | 'PENDING_APPROVAL'
  | 'HELD_COMPLIANCE';

export interface TransactionPqcCertificate {
  encapsulationAlgorithm: string;
  signatureAlgorithm: string;
  kemPublicKeyFingerprint: string;
  signatureDigest: string;
  zkAttestationProof: string;
  nonce: string;
  hsmSealedAt: string;
  entropySource: string;
  quantumResistanceScore: number;
}

export interface TransactionTimelineStep {
  step: string;
  timestamp: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUEUED';
  detail: string;
}

export interface BankTransaction {
  id: string;
  uetr: string;
  date: string;
  timestamp: string;
  description: string;
  counterpartyName: string;
  counterpartyBank: string;
  counterpartyAccount: string;
  counterpartyRouting: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
  fee: number;
  balanceAfter: number;
  status: TransactionStatus;
  category:
    | 'Treasury & Reserves'
    | 'Vendor Settlement'
    | 'Payroll & HR'
    | 'Cloud Infrastructure'
    | 'Interbank Rail'
    | 'Interest Income'
    | 'FX Hedging';
  isoMessageType: string;
  referenceNote: string;
  pqcCertificate: TransactionPqcCertificate;
  timeline: TransactionTimelineStep[];
  rawPayload: {
    format: 'ISO_20022_XML' | 'JSON_API';
    content: string;
  };
}

export interface VirtualCard {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  dynamicPqcToken: string;
  type: 'Corporate Physical Metal' | 'Virtual Quantum Token' | 'Cloud SaaS Virtual' | 'Vendor Single-Use';
  network: 'Visa Infinite Business' | 'Mastercard World Elite' | 'FedNow Virtual Rail';
  status: 'ACTIVE' | 'FROZEN' | 'TERMINATED';
  monthlyLimit: number;
  spentThisMonth: number;
  currency: string;
  pqcRotationSeconds: number;
}

export interface MultiCurrencyBalance {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
  symbol: string;
  balance: number;
  usdEquivalent: number;
  exchangeRateToUsd: number;
  flag: string;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  routingNumber: string;
  swiftBic: string;
  iban: string;
  accountType: 'Commercial Operating' | 'Institutional Custody Reserve' | 'Treasury Swept High-Yield';
  institutionName: string;
  primaryCurrency: 'USD';
  availableBalance: number;
  ledgerBalance: number;
  pendingFunds: number;
  accruedYield: number;
  yieldApyPercent: number;
  hsmFipsLevel: string;
  quantumKeyId: string;
  dualSignatureRequired: boolean;
  dailyWireLimit: number;
  dailyWireUsed: number;
  subBalances: MultiCurrencyBalance[];
  virtualCards: VirtualCard[];
}
