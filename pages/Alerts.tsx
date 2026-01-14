import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { loanService } from '../services/loanService';
import { generateDailyAlerts, AlertItem } from '../services/geminiService';
import { useAIContext } from '../contexts/AIContext';
import { Loan } from '../types';

export const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const { setContext } = useAIContext();

    useEffect(() => {
        // Set initial empty context or previous alerts
        setContext('alerts', 'VIEW: Alerts Dashboard. No alerts loaded yet.');
    }, [setContext]);

    const runRiskScan = async () => {
        setLoading(true);
        const loans = await loanService.getAllLoans();
        const results = await generateDailyAlerts(loans);
        setAlerts(results);
        setLoading(false);
        setScanned(true);

        const summary = `
        VIEW: Active Risk Alerts
        COUNT: ${results.length}
        ALERTS:
        ${results.map(a => `- [${a.severity}] ${a.title}: ${a.description} (Action: ${a.actionItem})`).join('\n')}
        `;
        setContext('alerts', summary);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-rose-50 border-rose-200 text-rose-800';
            case 'High': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'Medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default: return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Risk Radar</h1>
                    <p className="text-slate-500 mt-1">AI-powered daily portfolio screening.</p>
                </div>
                <button 
                    onClick={runRiskScan}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    {loading ? 'Scanning Portfolio...' : 'Run Risk Scan'}
                </button>
            </div>

            {!scanned && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <ShieldAlert size={64} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-slate-600">No Active Scans</h3>
                    <p className="max-w-md text-center mt-2">Run a new risk scan to analyze all active loans for covenant breaches, credit degradation, and systemic risks using Gemini AI.</p>
                </div>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-500">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-medium text-slate-700">Analyzing 43 data points...</h3>
                </div>
            )}

            {scanned && !loading && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700">{alerts.length} Risks Identified</h3>
                        <span className="text-xs text-slate-400">Last scan: Just now</span>
                    </div>

                    {alerts.length === 0 ? (
                        <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4 text-emerald-800">
                            <CheckCircle size={32} />
                            <div>
                                <h4 className="font-bold">All Clear</h4>
                                <p className="text-sm">No critical risks identified in the current portfolio.</p>
                            </div>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className={`p-5 rounded-xl border flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow bg-white`}>
                                <div className={`w-1.5 self-stretch rounded-full ${
                                    alert.severity === 'Critical' ? 'bg-rose-500' : 
                                    alert.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}></div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity}
                                        </span>
                                        <span className="text-xs font-mono text-slate-400 uppercase">Loan ID: {alert.loanId}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{alert.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{alert.description}</p>
                                </div>

                                <div className="md:w-64 flex flex-col justify-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase mb-2">Recommended Action</span>
                                    <p className="text-sm font-medium text-indigo-900 mb-3">{alert.actionItem}</p>
                                    <button className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800">
                                        INITIATE ACTION <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};