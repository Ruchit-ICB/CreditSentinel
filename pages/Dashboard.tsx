import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, AlertTriangle, DollarSign, Shield } from 'lucide-react';
import { loanService } from '../services/loanService';
import { generateSmartAlerts } from '../services/geminiService';
import { KPI, Loan } from '../types';
import { useAIContext } from '../contexts/AIContext';

const KPICard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { setContext } = useAIContext();

  useEffect(() => {
    const fetchData = async () => {
      const kpis = await loanService.getKPIs();
      const allLoans = await loanService.getAllLoans();
      setKpi(kpis);
      setLoans(allLoans);
      setLoading(false);

      // Set AI Context
      const contextSummary = `
      VIEW: Executive Dashboard
      KPIs:
      - Total Exposure: $${(kpis.totalExposure / 1000000).toFixed(1)}M
      - Avg Risk Score: ${kpis.avgRiskScore.toFixed(0)}
      - Watchlist Count: ${kpis.watchlistCount}
      - Value at Risk: $${(kpis.loansAtRiskValue / 1000000).toFixed(1)}M
      
      LOAN PORTFOLIO SNAPSHOT:
      ${allLoans.map(l => `- ${l.borrower.name}: Status=${l.status}, Risk=${l.riskProfile.level}, Score=${l.riskProfile.score}`).join('\n')}
      `;
      setContext('dashboard', contextSummary);

      // Async fetch AI insights to not block UI
      if (allLoans.length > 0) {
        generateSmartAlerts(allLoans).then(setAiInsight);
      }
    };
    fetchData();
  }, [setContext]);

  if (loading || !kpi) return <div className="p-8 text-slate-500">Loading Dashboard Data...</div>;

  const chartData = [
    { name: 'Active', value: loans.filter(l => l.status === 'Active').length },
    { name: 'Watchlist', value: loans.filter(l => l.status === 'Watchlist').length },
    { name: 'Distressed', value: loans.filter(l => l.status === 'Distressed').length },
    { name: 'Repaid', value: loans.filter(l => l.status === 'Repaid').length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#64748b'];

  const industryRisk = loans.reduce((acc, loan) => {
    const found = acc.find(x => x.name === loan.borrower.industry);
    if (found) {
        found.exposure += loan.amount;
    } else {
        acc.push({ name: loan.borrower.industry, exposure: loan.amount });
    }
    return acc;
  }, [] as {name: string, exposure: number}[]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Overview</h1>
        <p className="text-slate-500 mt-1">Real-time risk monitoring and exposure analysis.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Exposure" 
          value={`$${(kpi.totalExposure / 1000000).toFixed(1)}M`} 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <KPICard 
          title="Avg. Risk Score" 
          value={kpi.avgRiskScore.toFixed(0)} 
          icon={Shield} 
          color="bg-emerald-500" 
        />
        <KPICard 
          title="Watchlist Loans" 
          value={kpi.watchlistCount.toString()} 
          icon={Activity} 
          color="bg-orange-500" 
        />
        <KPICard 
          title="Value at Risk" 
          value={`$${(kpi.loansAtRiskValue / 1000000).toFixed(1)}M`} 
          icon={AlertTriangle} 
          color="bg-rose-500" 
        />
      </div>

      {/* AI Insight Banner */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="flex items-center gap-2 text-indigo-900 font-bold mb-2">
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">GEMINI AI</span>
              Portfolio Intelligence
            </h3>
            <p className="text-indigo-800 leading-relaxed max-w-4xl">{aiInsight}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Loan Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm text-slate-600">
            {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i]}}></div>
                    {d.name} ({d.value})
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Industry Exposure</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryRisk}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tickFormatter={(val) => `$${val/1000000}M`} />
                <Tooltip formatter={(val: number) => `$${(val/1000000).toFixed(1)}M`} />
                <Bar dataKey="exposure" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};