import { Loan, RiskFactor, RiskLevel, RiskProfile } from '../types';

/**
 * A deterministic, explainable risk engine.
 * In a real app, this would run on the backend or locally in the Tauri process.
 */
export const calculateRiskScore = (loan: Loan): RiskProfile => {
  let score = 100;
  const factors: RiskFactor[] = [];

  // Rule 1: Industry Risk
  const highRiskIndustries = ['Retail', 'Hospitality', 'Construction'];
  if (highRiskIndustries.includes(loan.borrower.industry)) {
    score -= 15;
    factors.push({
      ruleId: 'IND-01',
      description: `High-risk industry sector: ${loan.borrower.industry}`,
      impact: 'Negative',
      scoreImpact: -15
    });
  } else {
    factors.push({
      ruleId: 'IND-02',
      description: `Stable industry sector: ${loan.borrower.industry}`,
      impact: 'Positive',
      scoreImpact: 0
    });
  }

  // Rule 2: Covenant Status
  if (loan.covenantStatus === 'Breach') {
    score -= 30;
    factors.push({
      ruleId: 'COV-01',
      description: 'Active Covenant Breach detected',
      impact: 'Negative',
      scoreImpact: -30
    });
  } else if (loan.covenantStatus === 'Waiver') {
    score -= 10;
    factors.push({
      ruleId: 'COV-02',
      description: 'Operating under Covenant Waiver',
      impact: 'Negative',
      scoreImpact: -10
    });
  }

  // Rule 3: Credit Rating
  const rating = loan.borrower.creditRating;
  if (['AAA', 'AA', 'A'].includes(rating)) {
    factors.push({ ruleId: 'CR-01', description: `Strong Credit Rating (${rating})`, impact: 'Positive', scoreImpact: 0 });
  } else if (['BBB', 'BB'].includes(rating)) {
    score -= 10;
    factors.push({ ruleId: 'CR-02', description: `Moderate Credit Rating (${rating})`, impact: 'Negative', scoreImpact: -10 });
  } else {
    score -= 25;
    factors.push({ ruleId: 'CR-03', description: `Poor Credit Rating (${rating})`, impact: 'Negative', scoreImpact: -25 });
  }

  // Rule 4: Maturity Proximity (Risk increases as maturity approaches if not refinanced)
  const daysToMaturity = (new Date(loan.maturityDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
  if (daysToMaturity < 90 && loan.status !== 'Repaid') {
     score -= 10;
     factors.push({ ruleId: 'MAT-01', description: 'Maturity within 90 days', impact: 'Negative', scoreImpact: -10 });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let level = RiskLevel.Low;
  if (score < 50) level = RiskLevel.Critical;
  else if (score < 70) level = RiskLevel.High;
  else if (score < 85) level = RiskLevel.Medium;

  return {
    score,
    level,
    factors,
    lastUpdated: new Date().toISOString()
  };
};