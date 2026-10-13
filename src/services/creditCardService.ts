import { CreditCardItem, CreditCardTransaction } from '../types/creditCard';
import { MAJOR_CREDIT_CARDS } from '../data/mockCreditCards';

class CreditCardService {
  private cards: CreditCardItem[] = [...MAJOR_CREDIT_CARDS];

  getCards(): CreditCardItem[] {
    return [...this.cards];
  }

  getCardById(id: string): CreditCardItem | undefined {
    return this.cards.find((c) => c.id === id);
  }

  // Provision / Add Card to Apple Pay (Apple Wallet)
  async enrollInApplePay(
    cardId: string,
    deviceType:
      | 'iPhone 15'
      | 'iPhone 15 Pro'
      | 'iPhone 15 Pro Max'
      | 'iPhone 16 Pro Max'
      | 'Apple Watch Ultra 2'
      | 'MacBook Pro M3 Max'
      | 'iPad Pro M4'
      | string = 'iPhone 15'
  ): Promise<{
    success: boolean;
    card: CreditCardItem;
    deviceAccountNumber: string;
    secureElementId: string;
    token: string;
  }> {
    // Simulate Apple TSP handshake delay
    await new Promise((resolve) => setTimeout(resolve, 850));

    const card = this.cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    const dpan = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
    const seId = `04:A2:${Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()
    ).join(':')}`;

    card.applePay = {
      isProvisioned: true,
      provisionedAt: new Date().toISOString(),
      deviceType,
      deviceAccountNumber: dpan,
      secureElementId: seId,
      tokenServiceProvider: `${card.brand} Token Service via Apple Pay TSP`,
      pqcSealed: true,
    };

    return {
      success: true,
      card: { ...card },
      deviceAccountNumber: dpan,
      secureElementId: seId,
      token: `APPLE_PAY_MLDSA_${Date.now()}`,
    };
  }

  // Remove Card from Apple Pay
  removeFromApplePay(cardId: string): CreditCardItem | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      card.applePay = {
        isProvisioned: false,
        deviceType: undefined,
        deviceAccountNumber: undefined,
        pqcSealed: false,
      };
    }
    return card ? { ...card } : undefined;
  }

  // Simulate a charge / transaction on the card
  simulateTransaction(
    cardId: string,
    params: {
      merchant: string;
      merchantCategory: string;
      amount: number;
      paymentMethod: 'Apple Pay (Face ID)' | 'Contactless EMV' | 'Chip & PIN' | 'Online Token';
      cityCountry?: string;
    }
  ): {
    success: boolean;
    card: CreditCardItem;
    transaction: CreditCardTransaction;
  } {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card ${cardId} not found`);
    }

    if (card.isFrozen) {
      throw new Error(`Card ${card.name} is currently FROZEN. Please unfreeze the card first.`);
    }

    // Multiplier calculation based on card and category
    let multiplier = 1;
    if (card.id === 'amex-centurion') {
      multiplier = params.merchantCategory.includes('Aviation') || params.merchantCategory.includes('Hotel') ? 5 : 2;
    } else if (card.id === 'amex-platinum') {
      multiplier = params.merchantCategory.includes('Aviation') ? 5 : 1;
    } else if (card.id === 'chase-sapphire-reserve' || card.id === 'jpm-reserve') {
      multiplier = params.merchantCategory.includes('Dining') || params.merchantCategory.includes('Hotel') ? 3 : 1;
    } else if (card.id === 'capital-one-venture-x') {
      multiplier = 2;
    } else if (card.id === 'apple-card') {
      multiplier = params.paymentMethod === 'Apple Pay (Face ID)' ? (params.merchant.includes('Apple') ? 3 : 2) : 1;
    } else if (card.id === 'brex-corporate-titanium') {
      multiplier = params.merchantCategory.includes('Cloud') ? 2 : 4;
    }

    const pointsEarned =
      card.id === 'apple-card'
        ? Math.round(((params.amount * multiplier) / 100) * 100) / 100
        : Math.round(params.amount * multiplier);

    const newTx: CreditCardTransaction = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      merchant: params.merchant,
      merchantCategory: params.merchantCategory,
      amount: params.amount,
      pointsEarned,
      status: 'POSTED',
      paymentMethod: params.paymentMethod,
      cityCountry: params.cityCountry || 'New York, US',
      pqcSecurityToken: `PQC-MLDSA-87-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    // Update balances
    card.currentBalance += params.amount;
    card.availableCredit = Math.max(0, card.availableCredit - params.amount);
    card.rewardsBalance += pointsEarned;
    card.recentTransactions.unshift(newTx);

    return {
      success: true,
      card: { ...card },
      transaction: newTx,
    };
  }

  // Freeze or unfreeze card
  toggleFreeze(cardId: string): CreditCardItem | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      card.isFrozen = !card.isFrozen;
    }
    return card ? { ...card } : undefined;
  }

  // Toggle specific control
  toggleControl(
    cardId: string,
    key: 'contactlessEnabled' | 'internationalEnabled' | 'onlinePurchasesEnabled'
  ): CreditCardItem | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      card.controls[key] = !card.controls[key];
    }
    return card ? { ...card } : undefined;
  }

  // Update limit
  updateMonthlyLimit(cardId: string, limit: number): CreditCardItem | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      card.controls.spendingLimitMonthly = limit;
    }
    return card ? { ...card } : undefined;
  }

  // Make statement payment
  payStatement(cardId: string, amount: number): CreditCardItem | undefined {
    const card = this.cards.find((c) => c.id === cardId);
    if (card) {
      const payAmount = Math.min(amount, card.currentBalance);
      card.currentBalance = Math.max(0, card.currentBalance - payAmount);
      card.availableCredit += payAmount;
    }
    return card ? { ...card } : undefined;
  }
}

export const creditCardService = new CreditCardService();
