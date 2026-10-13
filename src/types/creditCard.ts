export type CreditCardTier =
  | 'Ultra-Exclusive / Invitation Only'
  | 'Luxury Metal'
  | 'Premium Travel & Lifestyle'
  | 'Titanium Consumer'
  | 'Enterprise Corporate';

export type CreditCardNetwork =
  | 'American Express'
  | 'Visa Infinite'
  | 'Mastercard World Elite'
  | 'Mastercard Titanium';

export type CardMaterial =
  | 'Anodized Titanium'
  | 'Machined Stainless Steel'
  | 'Palladium & 23K Gold'
  | 'Embedded Core Metal'
  | 'Laser-Etched Pure Titanium'
  | 'PVD Stainless Steel & Carbon'
  | 'Brushed Dark Anthracite';

export interface ApplePayStatus {
  isProvisioned: boolean;
  provisionedAt?: string;
  deviceType?:
    | 'iPhone 15'
    | 'iPhone 15 Pro'
    | 'iPhone 15 Pro Max'
    | 'iPhone 16 Pro Max'
    | 'Apple Watch Ultra 2'
    | 'MacBook Pro M3 Max'
    | 'iPad Pro M4'
    | string;
  deviceAccountNumber?: string; // DPAN e.g. "•••• 9021"
  secureElementId?: string;
  tokenServiceProvider?: string;
  pqcSealed?: boolean;
}

export interface CreditCardBenefit {
  category: 'Travel & Aviation' | 'Dining & Wine' | 'Hotel & Resorts' | 'Concierge' | 'Security & Tech' | 'Lifestyle';
  title: string;
  description: string;
  valueAnnual?: string;
  highlight?: boolean;
}

export interface CreditCardTransaction {
  id: string;
  date: string;
  time: string;
  merchant: string;
  merchantCategory: string;
  amount: number;
  pointsEarned: number;
  status: 'POSTED' | 'PENDING' | 'AUTHORIZED';
  paymentMethod: 'Apple Pay (Face ID)' | 'Contactless EMV' | 'Chip & PIN' | 'Online Token';
  cityCountry: string;
  pqcSecurityToken: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  subName: string;
  issuer: string;
  brand: 'American Express' | 'Chase' | 'J.P. Morgan' | 'Capital One' | 'Apple' | 'Luxury Card' | 'Brex';
  tier: CreditCardTier;
  network: CreditCardNetwork;
  material: CardMaterial;
  weightGrams: number;
  annualFee: number;
  initiationFee?: number;
  isInvitationOnly: boolean;
  creditLimit: number | 'No Preset Spending Limit';
  dynamicLimitDisplay: string;
  availableCredit: number;
  currentBalance: number;
  rewardsBalance: number;
  rewardsCurrency: string;
  cardNumber: string; // Masked or full e.g. "3714 •••••• ••001"
  rawCardNumber: string; // Full 15/16 digits for reveal
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  memberSince: string;
  accentColor: string;
  theme: {
    bgGradient: string;
    borderColor: string;
    textColor: string;
    chipColor: string;
    metalType: 'titanium' | 'steel' | 'palladium' | 'sapphire' | 'whitetitanium' | 'blackpvd' | 'carbon';
  };
  applePay: ApplePayStatus;
  isFrozen: boolean;
  controls: {
    contactlessEnabled: boolean;
    internationalEnabled: boolean;
    onlinePurchasesEnabled: boolean;
    spendingLimitMonthly: number;
  };
  benefits: CreditCardBenefit[];
  recentTransactions: CreditCardTransaction[];
  conciergeDetails?: {
    desk: string;
    phone: string;
    assignedManager: string;
    availableHours: string;
  };
}
