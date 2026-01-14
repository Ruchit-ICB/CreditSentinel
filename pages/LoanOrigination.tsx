import React, { useState } from 'react';
import { ArrowLeft, Save, Building, DollarSign, Calendar, FileText } from 'lucide-react';
import { loanService } from '../services/loanService';
import { Loan, LoanStatus, RiskLevel } from '../types';
import { useAIContext } from '../contexts/AIContext';

interface LoanOriginationProps {
  onBack: () => void;
  onComplete: () => void;
}

export const LoanOrigination: React.FC<LoanOriginationProps> = ({ onBack, onComplete }) => {
  const { setContext } = useAIContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    borrowerName: '',
    industry: 'Technology',
    creditRating: 'BBB',
    revenue: '',
    amount: '',
    currency: 'USD',
    interestRate: '',
    maturityDate: '',
    notes: ''
  });

  // Update AI context when entering this page
  React.useEffect(() => {
    setContext('origination', 'VIEW: New Loan Origination Form. User is entering details for a new credit facility.');
  }, [setContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newLoan: Loan = {
        id: `LN-${new Date().getFullYear()}-${idSuffix}`,
        borrowerId: `BR-${idSuffix}`,
        borrower: {
          id: `BR-${idSuffix}`,
          name: formData.borrowerName,
          industry: formData.industry,
          creditRating: formData.creditRating,
          annualRevenue: Number(formData.revenue)
        },
        amount: Number(formData.amount),
        currency: formData.currency,
        interestRate: Number(formData.interestRate),
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: formData.maturityDate,
        status: LoanStatus.Active,
        covenantStatus: 'Compliant',
        // Initial placeholder, will be recalculated by service
        riskProfile: { 
            score: 100, 
            level: RiskLevel.Low, 
            factors: [], 
            lastUpdated: new Date().toISOString() 
        },
        documents: [],
        notes: formData.notes
      };

      await loanService.createLoan(newLoan);
      onComplete();
    } catch (error) {
      console.error("Error creating loan:", error);
      alert("Failed to create loan. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-2 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Cancel & Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">New Origination</h1>
          <p className="text-slate-500 mt-1">Enter borrower details and loan terms for risk assessment.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Borrower Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            <Building size={20} className="text-blue-500" />
            Borrower Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                required
                name="borrowerName"
                value={formData.borrowerName}
                onChange={handleChange}
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry Sector</label>
              <select 
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option>Technology</option>
                <option>Retail</option>
                <option>Manufacturing</option>
                <option>Healthcare</option>
                <option>Hospitality</option>
                <option>Transportation</option>
                <option>Construction</option>
                <option>Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Credit Rating</label>
              <select 
                name="creditRating"
                value={formData.creditRating}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option>AAA</option>
                <option>AA</option>
                <option>A</option>
                <option>BBB</option>
                <option>BB</option>
                <option>B</option>
                <option>CCC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                  required
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  type="number" 
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Terms Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            <DollarSign size={20} className="text-emerald-500" />
            Loan Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount</label>
              <input 
                required
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                type="number" 
                min="1000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="1,000,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
              <input 
                required
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                type="number" 
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="5.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maturity Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  required
                  name="maturityDate"
                  value={formData.maturityDate}
                  onChange={handleChange}
                  type="date" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            <FileText size={20} className="text-slate-500" />
            Internal Notes
          </h3>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
            placeholder="Add context about the deal, rationale, or specific risk concerns..."
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                </>
            ) : (
                <>
                    <Save size={18} />
                    Originate Loan
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};