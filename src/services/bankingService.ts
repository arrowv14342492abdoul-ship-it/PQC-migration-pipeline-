import { FinancialInstitution, BankAccount, BankTransaction, VirtualCard } from '../types/banking';
import { MAJOR_FINANCIAL_INSTITUTIONS } from '../data/mockBankingInstitutions';
import {
  INITIAL_BANK_ACCOUNT,
  INITIAL_BANK_TRANSACTIONS,
  generateFullTransaction,
} from '../data/mockBankAccounts';

class BankingService {
  private institutions: FinancialInstitution[] = [...MAJOR_FINANCIAL_INSTITUTIONS];
  private account: BankAccount = { ...INITIAL_BANK_ACCOUNT };
  private transactions: BankTransaction[] = [...INITIAL_BANK_TRANSACTIONS];

  getInstitutions(): FinancialInstitution[] {
    return this.institutions;
  }

  getInstitutionById(id: string): FinancialInstitution | undefined {
    return this.institutions.find((item) => item.id === id);
  }

  getAccount(): BankAccount {
    return { ...this.account };
  }

  getTransactions(): BankTransaction[] {
    return [...this.transactions];
  }

  getTransactionById(id: string): BankTransaction | undefined {
    return this.transactions.find((tx) => tx.id === id);
  }

  // Generate batch of realistic transactions with full details
  generateBatchTransactions(count = 5): {
    newTransactions: BankTransaction[];
    updatedAccount: BankAccount;
  } {
    const generated: BankTransaction[] = [];
    let currentBal = this.account.availableBalance;

    for (let i = 0; i < count; i++) {
      const tx = generateFullTransaction(undefined, currentBal);
      generated.push(tx);
      currentBal = tx.balanceAfter;
    }

    // Add to start of transactions list
    this.transactions = [...generated, ...this.transactions];

    // Update account balances
    const latestTx = generated[0];
    const diff = latestTx.balanceAfter - this.account.availableBalance;
    this.account.availableBalance = latestTx.balanceAfter;
    this.account.ledgerBalance = latestTx.balanceAfter + this.account.pendingFunds;
    if (diff > 0) {
      this.account.accruedYield += Math.round(diff * 0.00014 * 100) / 100;
    }

    // Update primary USD sub-balance
    const usdSub = this.account.subBalances.find((s) => s.currency === 'USD');
    if (usdSub) {
      usdSub.balance = this.account.availableBalance;
      usdSub.usdEquivalent = this.account.availableBalance;
    }

    return {
      newTransactions: generated,
      updatedAccount: { ...this.account },
    };
  }

  // Add custom transaction with full details
  addCustomTransaction(custom: Partial<BankTransaction> & { pqcLevel?: 'FIPS 203 ML-KEM-1024' | 'FIPS 203 ML-KEM-768' }): {
    newTransaction: BankTransaction;
    updatedAccount: BankAccount;
  } {
    const newTx = generateFullTransaction(custom, this.account.availableBalance);
    this.transactions = [newTx, ...this.transactions];

    this.account.availableBalance = newTx.balanceAfter;
    this.account.ledgerBalance = newTx.balanceAfter + this.account.pendingFunds;
    if (newTx.direction === 'DEBIT') {
      this.account.dailyWireUsed += newTx.amount;
    }

    const usdSub = this.account.subBalances.find((s) => s.currency === 'USD');
    if (usdSub) {
      usdSub.balance = this.account.availableBalance;
      usdSub.usdEquivalent = this.account.availableBalance;
    }

    return {
      newTransaction: newTx,
      updatedAccount: { ...this.account },
    };
  }

  toggleCardStatus(cardId: string): VirtualCard | undefined {
    const card = this.account.virtualCards.find((c) => c.id === cardId);
    if (card) {
      card.status = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    }
    return card ? { ...card } : undefined;
  }

  updateCardLimit(cardId: string, newLimit: number): VirtualCard | undefined {
    const card = this.account.virtualCards.find((c) => c.id === cardId);
    if (card) {
      card.monthlyLimit = newLimit;
    }
    return card ? { ...card } : undefined;
  }

  // Export statement in multiple industry formats
  exportStatement(format: 'CSV' | 'MT940' | 'CAMT053' | 'JSON'): string {
    if (format === 'CSV') {
      const headers = 'ID,Date,Time,Description,Counterparty,Type,Direction,Amount,Currency,Fee,BalanceAfter,Status,UETR,PQC_Standard\n';
      const rows = this.transactions
        .map(
          (t) =>
            `"${t.id}","${t.date}","${t.timestamp}","${t.description.replace(/"/g, '""')}","${t.counterpartyName.replace(/"/g, '""')}","${t.type}","${t.direction}",${t.amount},"${t.currency}",${t.fee},${t.balanceAfter},"${t.status}","${t.uetr}","${t.pqcCertificate.encapsulationAlgorithm}"`
        )
        .join('\n');
      return headers + rows;
    }

    if (format === 'MT940') {
      return `:20:LATTICEOPS-STMT-${Date.now()}
:25:${this.account.accountNumber}
:28C:001/1
:60F:C261010USD${this.account.availableBalance.toFixed(2)}
${this.transactions
  .slice(0, 10)
  .map(
    (t, idx) =>
      `:61:${t.date.replace(/-/g, '').slice(2)}${t.direction === 'CREDIT' ? 'C' : 'D'}${t.amount.toFixed(2)}NTRF${t.uetr.slice(0, 16)}//${t.id}
:86:${t.description} // BIC: ${this.account.swiftBic} // PQC: ${t.pqcCertificate.encapsulationAlgorithm}`
  )
  .join('\n')}
:62F:C261010USD${this.account.availableBalance.toFixed(2)}
-}`;
    }

    if (format === 'CAMT053') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>CAMT053-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-${this.account.accountNumber}</Id>
      <Acct>
        <Id><Othr><Id>${this.account.accountNumber}</Id></Othr></Id>
        <Ccy>USD</Ccy>
      </Acct>
      <Bal>
        <Amt Ccy="USD">${this.account.availableBalance.toFixed(2)}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>${new Date().toISOString().split('T')[0]}</Dt></Dt>
      </Bal>
      <NtryCnt>${this.transactions.length}</NtryCnt>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    }

    return JSON.stringify(
      {
        statementMeta: {
          generatedAt: new Date().toISOString(),
          account: this.account,
        },
        transactions: this.transactions,
      },
      null,
      2
    );
  }

  async testConnection(id: string): Promise<{
    success: boolean;
    latencyMs: number;
    tlsVersion: string;
    kemCipher: string;
    handshakeStatus: string;
    timestamp: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 380));
    const inst = this.getInstitutionById(id);
    const latency = inst
      ? Math.max(12, Math.round(inst.sandboxStatus.latencyMs + (Math.random() * 8 - 4)))
      : 32;

    if (inst) {
      inst.liveEvents.unshift({
        id: `ev-ping-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        event: `Handshake validated via ${inst.pqcStandards.fips203} (${latency}ms roundtrip)`,
        primitive: inst.pqcStandards.fips203,
        status: 'SUCCESS',
      });
      inst.sandboxStatus.lastHandshake = 'Just now';
    }

    return {
      success: true,
      latencyMs: latency,
      tlsVersion: inst?.pqcStandards.hybridTlsVersion || 'TLS 1.3 Hybrid',
      kemCipher: inst?.pqcStandards.fips203 || 'ML-KEM-768',
      handshakeStatus: '200 OK - Quantum Lattice Handshake Verified',
      timestamp: new Date().toISOString(),
    };
  }

  async executeTransaction(
    id: string,
    capabilityId: string,
    _customPayload?: string
  ): Promise<{
    success: boolean;
    status: string;
    txHash: string;
    executionTimeMs: number;
    attestationProof: string;
    responsePayload: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const inst = this.getInstitutionById(id);
    const cap = inst?.capabilities.find((c) => c.id === capabilityId) || inst?.capabilities[0];

    const randomHash = `0x${Array.from({ length: 48 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const executionTimeMs = inst
      ? Math.max(14, Math.round(inst.sandboxStatus.latencyMs * 1.1 + Math.random() * 10))
      : 28;

    if (inst && cap) {
      inst.liveEvents.unshift({
        id: `ev-tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toLocaleTimeString(),
        event: `${cap.title} executed: ${cap.standardMessage}`,
        primitive: inst.pqcStandards.fips204,
        status: 'SUCCESS',
      });
    }

    return {
      success: true,
      status: 'ACTC_ACCEPTED_TECHNICAL_VALIDATION',
      txHash: randomHash,
      executionTimeMs,
      attestationProof: `VERIFIED_${inst?.pqcStandards.fips203 || 'ML_KEM_768'}_DIGEST_SHA3_512`,
      responsePayload: cap ? cap.testResponse : JSON.stringify({ status: 'SUCCESS' }, null, 2),
    };
  }
}

export const bankingService = new BankingService();
