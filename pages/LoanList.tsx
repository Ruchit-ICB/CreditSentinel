import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { loanService } from '../services/loanService';
import { Loan, LoanStatus } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAIContext } from '../contexts/AIContext';

export const LoanList: React.FC<{ onView: (id: string) => void; onCreate: () => void }> = ({ onView, onCreate }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LoanStatus | 'All'>('All');
  const { setContext } = useAIContext();

  useEffect(() => {
    loanService.getAllLoans().then((data) => {
        setLoans(data);
        const summary = `
        VIEW: Loan Portfolio List
        TOTAL LOANS: ${data.length}
        
        LOANS:
        ${data.map(l => `- ${l.id}: ${l.borrower.name} (${l.borrower.industry}), ${l.status}, ${l.amount} ${l.currency}`).join('\n')}
        `;
        setContext('loan-list', summary);
    });
  }, [setContext]);

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.borrower.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || l.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Loan Portfolio</h1>
           <p className="text-slate-500 mt-1">Manage and audit active credit facilities.</p>
        </div>
        <button 
            onClick={onCreate}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
            + New Origination
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by borrower or loan ID..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400" size={18} />
            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="All" className="text-slate-900">All Statuses</option>
              <option value={LoanStatus.Active} className="text-slate-900">Active</option>
              <option value={LoanStatus.Watchlist} className="text-slate-900">Watchlist</option>
              <option value={LoanStatus.Distressed} className="text-slate-900">Distressed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{loan.borrower.name}</div>
                        <div className="text-xs text-slate-500">{loan.borrower.industry}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{loan.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium text-right">
                        {loan.amount.toLocaleString()} {loan.currency}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            loan.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                            loan.status === 'Watchlist' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-red-100 text-red-700 border-red-200'
                        }`}>
                            {loan.status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <RiskBadge level={loan.riskProfile.level} score={loan.riskProfile.score} />
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => onView(loan.id)}
                            className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                            title="View Details"
                        >
                            <Eye size={20} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};