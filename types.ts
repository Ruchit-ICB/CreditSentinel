export enum LoanStatus {
  Draft = 'Draft',
  Active = 'Active',
  Watchlist = 'Watchlist',
  Distressed = 'Distressed',
  Repaid = 'Repaid',
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface Borrower {
  id: string;
  name: string;
  industry: string;
  creditRating: string;
  annualRevenue: number;
}

export interface RiskFactor {
  ruleId: string;
  description: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  scoreImpact: number;
}

export interface RiskProfile {
  score: number; // 0-100, where 100 is safest
  level: RiskLevel;
  factors: RiskFactor[];
  lastUpdated: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrower: Borrower;
  amount: number;
  currency: string;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  status: LoanStatus;
  riskProfile: RiskProfile;
  covenantStatus: 'Compliant' | 'Breach' | 'Waiver';
  documents: string[]; // Mock document names
  notes: string;
}

export interface KPI {
  totalExposure: number;
  avgRiskScore: number;
  watchlistCount: number;
  loansAtRiskValue: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'System' | 'User' | 'Alert';
}