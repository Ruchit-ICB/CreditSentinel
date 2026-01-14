import React, { useEffect, useState } from 'react';
import { ArrowLeft, BrainCircuit, FileText, CheckCircle, AlertTriangle, Activity, Thermometer, List, Clock, User } from 'lucide-react';
import { loanService } from '../services/loanService';
import { generateRiskAnalysis, generateStressTestReport } from '../services/geminiService';
import { Loan, RiskFactor, AuditLogEntry } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAIContext } from '../contexts/AIContext';

interface LoanDetailProps {
  loanId: string;
  onBack: () => void;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), action: 'Document Uploaded', user: 'System', details: 'Q3_Financials.xlsx received from portal', type: 'System' },
    { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), action: 'Risk Score Updated', user: 'Risk Engine', details: 'Score dropped from 85 to 82 due to Sector Volatility', type: 'Alert' },
    { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), action: 'Covenant Review', user: 'J. Smith', details: 'Marked as Compliant manually', type: 'User' },
    { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), action: 'Loan Originated', user: 'Admin', details: 'Initial approval via Credit Committee', type: 'System' },
];

export const LoanDetail: React.FC<LoanDetailProps> = ({ loanId, onBack }) => {
  const [loan, setLoan] = useState<Loan | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'overview' | 'stress' | 'audit'>('overview');
  
  // AI Analysis State
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Stress Test State
  const [stressResult, setStressResult] = useState<string>('');
  const [isStressing, setIsStressing] = useState(false);
  const [stressParams, setStressParams] = useState({
      rateHike: 2.0,
      revenueDrop: 15,
      marketCondition: 'Recession'
  });

  const { setContext } = useAIContext();

  useEffect(() => {
    loanService.getLoanById(loanId).then((data) => {
        setLoan(data);
        if (data) {
            const contextStr = `
            VIEW: Loan Detail (${activeTab.toUpperCase()})
            LOAN ID: ${data.id}
            BORROWER: ${data.borrower.name}
            INDUSTRY: ${data.borrower.industry}
            STATUS: ${data.status}
            RISK: ${data.riskProfile.level} (${data.riskProfile.score}/100)
            AMOUNT: ${data.amount} ${data.currency}
            `;
            setContext(`loan-${loanId}`, contextStr);
        }
    });
  }, [loanId, setContext, activeTab]);

  const handleGenerateAnalysis = async () => {
    if (!loan) return;
    setIsAnalyzing(true);
    const result = await generateRiskAnalysis(loan);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleRunStressTest = async () => {
      if (!loan) return;
      setIsStressing(true);
      const result = await generateStressTestReport(loan, stressParams);
      setStressResult(result);
      setIsStressing(false);
  };

  if (!loan) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Portfolio
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{loan.borrower.name}</h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono">{loan.id}</span>
            <span>{loan.borrower.industry}</span>
            <span>•</span>
            <span>Originated: {loan.startDate}</span>
          </div>
        </div>
        <div className="text-right">
           <div className="text-3xl font-bold text-slate-900">{loan.amount.toLocaleString()} <span className="text-lg text-slate-500">{loan.currency}</span></div>
           <div className="text-sm text-slate-500 mt-1">{loan.interestRate}% Interest Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Activity size={16} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('stress')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'stress' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <Thermometer size={16} /> Stress Lab
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <List size={16} /> Audit Trail
          </button>
      </div>

      <div className="min-h-[500px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                {/* Risk Scorecard */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Risk Assessment</h3>
                        <RiskBadge level={loan.riskProfile.level} score={loan.riskProfile.score} />
                    </div>
                    
                    <div className="space-y-4">
                        {loan.riskProfile.factors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                {factor.impact === 'Positive' ? (
                                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                ) : factor.impact === 'Negative' ? (
                                    <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-slate-300 mt-1" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{factor.description}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 font-mono">Rule ID: {factor.ruleId} • Impact: {factor.scoreImpact > 0 ? '+' : ''}{factor.scoreImpact}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                            <BrainCircuit size={20} className="text-indigo-600" />
                            AI Risk Analyst
                        </h3>
                        {!analysis && (
                            <button 
                                onClick={handleGenerateAnalysis}
                                disabled={isAnalyzing}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Generate Report'}
                            </button>
                        )}
                    </div>

                    {isAnalyzing && (
                        <div className="py-8 flex flex-col items-center text-indigo-400">
                            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                            <p className="text-sm">Processing loan data...</p>
                        </div>
                    )}

                    {analysis && (
                        <div className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <div className="whitespace-pre-line leading-relaxed">{analysis}</div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={handleGenerateAnalysis}
                                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                                >
                                    Regenerate Analysis
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-4 tracking-wider">Loan Details</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Maturity Date</span>
                                <span className="font-medium text-slate-900">{loan.maturityDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Covenant Status</span>
                                <span className={`font-medium ${loan.covenantStatus === 'Breach' ? 'text-red-600' : 'text-slate-900'}`}>
                                    {loan.covenantStatus}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-500">Credit Rating</span>
                                <span className="font-medium text-slate-900">{loan.borrower.creditRating}</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-slate-500">Revenue</span>
                                <span className="font-medium text-slate-900">${(loan.borrower.annualRevenue / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-4 tracking-wider">Documents</h4>
                        <div className="space-y-3">
                            {loan.documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer group">
                                    <div className="bg-slate-100 p-2 rounded text-slate-500 group-hover:bg-white group-hover:text-blue-500 border border-slate-200">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-sm text-slate-700 font-medium truncate">{doc}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                            + Upload Document
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STRESS TEST TAB */}
        {activeTab === 'stress' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Thermometer className="text-orange-500" size={20} />
                            Simulation Parameters
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Interest Rate Hike</label>
                                    <span className="text-sm font-bold text-slate-900">+{stressParams.rateHike}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="10" step="0.5" 
                                    value={stressParams.rateHike}
                                    onChange={(e) => setStressParams({...stressParams, rateHike: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Simulates central bank tightening.</p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Revenue Shock</label>
                                    <span className="text-sm font-bold text-red-600">-{stressParams.revenueDrop}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="50" step="1" 
                                    value={stressParams.revenueDrop}
                                    onChange={(e) => setStressParams({...stressParams, revenueDrop: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Impact on borrower's top line.</p>
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Market Condition</label>
                                <select 
                                    value={stressParams.marketCondition}
                                    onChange={(e) => setStressParams({...stressParams, marketCondition: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option>Recession</option>
                                    <option>Stagflation</option>
                                    <option>Supply Chain Crisis</option>
                                    <option>Geopolitical Instability</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleRunStressTest}
                                disabled={isStressing}
                                className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isStressing ? 'Running Simulation...' : 'Run Stress Test'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {stressResult ? (
                         <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-4">Simulation Results</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-xs text-orange-600 uppercase font-bold tracking-wider">Projected Risk Score</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {Math.max(10, Math.floor(loan.riskProfile.score - (stressParams.rateHike * 4) - (stressParams.revenueDrop * 0.8)))}
                                        <span className="text-sm text-slate-400 font-normal ml-2">/ 100</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">New Debt Cost</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {(loan.interestRate + stressParams.rateHike).toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none text-slate-700">
                                <div dangerouslySetInnerHTML={{ __html: stressResult.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <h3 className="font-bold text-slate-600 text-lg">No Simulation Run</h3>
                            <p className="max-w-xs mt-2">Adjust the parameters on the left and click "Run Stress Test" to see how this borrower performs under pressure.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User / System</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_AUDIT_LOGS.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        log.type === 'Alert' ? 'bg-orange-100 text-orange-700' :
                                        log.type === 'System' ? 'bg-slate-100 text-slate-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        {log.user}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};