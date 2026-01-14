import Dexie, { Table } from 'dexie';
import { Loan, LoanStatus } from '../types';
import { calculateRiskScore } from './riskEngine';

// Seed Data used to populate the DB on first run
const SEED_LOANS: Partial<Loan>[] = [
  {
    id: 'LN-2024-001',
    borrowerId: 'BR-101',
    borrower: { id: 'BR-101', name: 'Acme Logistics', industry: 'Transportation', creditRating: 'BBB', annualRevenue: 50000000 },
    amount: 1500000,
    currency: 'USD',
    interestRate: 5.5,
    startDate: '2023-01-15',
    maturityDate: '2026-01-15',
    status: LoanStatus.Active,
    covenantStatus: 'Compliant' as const,
    documents: ['LoanAgreement.pdf', 'Q3_Financials.xlsx'],
    notes: 'Borrower showing steady growth.',
  },
  {
    id: 'LN-2023-882',
    borrowerId: 'BR-105',
    borrower: { id: 'BR-105', name: 'Summit Retail Group', industry: 'Retail', creditRating: 'B-', annualRevenue: 12000000 },
    amount: 5000000,
    currency: 'GBP',
    interestRate: 7.2,
    startDate: '2022-06-01',
    maturityDate: '2025-06-01',
    status: LoanStatus.Watchlist,
    covenantStatus: 'Breach' as const,
    documents: ['Covenant_Compliance_Cert.pdf'],
    notes: 'Missed EBITDA target for Q2. Watchlist triggered.',
  },
  {
    id: 'LN-2024-112',
    borrowerId: 'BR-109',
    borrower: { id: 'BR-109', name: 'TechNova Solutions', industry: 'Technology', creditRating: 'A-', annualRevenue: 85000000 },
    amount: 10000000,
    currency: 'USD',
    interestRate: 4.8,
    startDate: '2024-02-10',
    maturityDate: '2027-02-10',
    status: LoanStatus.Active,
    covenantStatus: 'Compliant' as const,
    documents: ['Term_Sheet.pdf', 'IP_Valuation.pdf'],
    notes: 'High growth potential.',
  },
  {
    id: 'LN-2021-055',
    borrowerId: 'BR-202',
    borrower: { id: 'BR-202', name: 'BlueWater Hospitality', industry: 'Hospitality', creditRating: 'CCC', annualRevenue: 5000000 },
    amount: 2500000,
    currency: 'EUR',
    interestRate: 8.5,
    startDate: '2021-03-20',
    maturityDate: '2024-03-20',
    status: LoanStatus.Distressed,
    covenantStatus: 'Breach' as const,
    documents: ['Restructuring_Plan.pdf'],
    notes: 'Severe cash flow issues.',
  },
];

export class CreditSentinelDB extends Dexie {
  loans!: Table<Loan, string>;

  constructor() {
    super('CreditSentinelDB');
    (this as any).version(1).stores({
      loans: 'id, borrowerId, status, riskProfile.score'
    });
    (this as any).on('populate', this.populate.bind(this));
  }

  async populate() {
    const loansWithRisk = SEED_LOANS.map(l => ({
        ...l,
        riskProfile: calculateRiskScore(l as Loan)
    }));
    await this.loans.bulkAdd(loansWithRisk as Loan[]);
  }
}

export const db = new CreditSentinelDB();