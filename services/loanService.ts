import { Loan, LoanStatus, KPI } from '../types';
import { calculateRiskScore } from './riskEngine';
import { db } from './db';

class LoanService {
  
  async getAllLoans(): Promise<Loan[]> {
    return await db.loans.toArray();
  }

  async getLoanById(id: string): Promise<Loan | undefined> {
    const loan = await db.loans.get(id);
    return loan;
  }

  async updateLoan(loan: Loan): Promise<Loan> {
    // Re-calculate risk on update to ensure data consistency
    const updatedLoan = { ...loan, riskProfile: calculateRiskScore(loan) };
    await db.loans.put(updatedLoan);
    return updatedLoan;
  }

  async createLoan(loan: Loan): Promise<Loan> {
      const newLoan = { ...loan, riskProfile: calculateRiskScore(loan) };
      await db.loans.add(newLoan);
      return newLoan;
  }

  async getKPIs(): Promise<KPI> {
    const loans = await this.getAllLoans();
    
    const totalExposure = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const avgRiskScore = loans.length > 0 
        ? loans.reduce((sum, loan) => sum + loan.riskProfile.score, 0) / loans.length
        : 0;
        
    const watchlistCount = loans.filter(l => l.status === LoanStatus.Watchlist || l.status === LoanStatus.Distressed).length;
    
    const loansAtRiskValue = loans
      .filter(l => l.riskProfile.level === 'High' || l.riskProfile.level === 'Critical')
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      totalExposure,
      avgRiskScore,
      watchlistCount,
      loansAtRiskValue
    };
  }
}

export const loanService = new LoanService();