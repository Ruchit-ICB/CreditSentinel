import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Download, Calendar } from 'lucide-react';
import { loanService } from '../services/loanService';
import { generatePortfolioReport } from '../services/geminiService';
import { useAIContext } from '../contexts/AIContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const RiskReports: React.FC = () => {
    const [reportType, setReportType] = useState('Monthly Portfolio Audit');
    const [reportHtml, setReportHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const { setContext } = useAIContext();
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setContext('reports', 'VIEW: Reports Generator. Select a report type to generate.');
    }, [setContext]);

    const handleGenerate = async () => {
        setLoading(true);
        const loans = await loanService.getAllLoans();
        const htmlContent = await generatePortfolioReport(loans, reportType);
        setReportHtml(htmlContent);
        setLoading(false);
        setContext('reports', `VIEW: Generated Report Preview (${reportType}). Ready to print.`);
    };

    const handleDownloadPdf = async () => {
        if (!reportRef.current) return;
        setGeneratingPdf(true);

        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            // Calculate height to fit width for long content scaling
            const imgProps = pdf.getImageProperties(imgData);
            const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Simple single page handling for MVP (multi-page would require splitting)
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImgHeight);
            pdf.save(`CreditSentinel_Report_${Date.now()}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
            {/* Toolbar */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Risk Reporting</h1>
                <p className="text-slate-500 mt-1 mb-6">Generate and export official risk documentation.</p>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                         <Calendar size={18} />
                         <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                    </div>

                    <select 
                        value={reportType} 
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 min-w-[200px]"
                    >
                        <option className="text-slate-900">Monthly Portfolio Audit</option>
                        <option className="text-slate-900">Quarterly Risk Exposure</option>
                        <option className="text-slate-900">Watchlist Summary</option>
                        <option className="text-slate-900">Covenant Compliance Review</option>
                    </select>

                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm ml-auto"
                    >
                        {loading ? 'Generating Report...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Report Preview Area */}
            <div className="flex-1 bg-slate-100/50 rounded-xl flex justify-center p-8 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p>Compiling data & generating analysis...</p>
                    </div>
                ) : !reportHtml ? (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>Select parameters and generate a report to preview.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-[210mm] relative">
                         {/* Action Buttons */}
                        <div className="absolute top-0 right-[-60px] flex flex-col gap-3">
                            <button 
                                onClick={handleDownloadPdf}
                                disabled={generatingPdf}
                                className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100" 
                                title="Download PDF"
                            >
                                {generatingPdf ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Download size={20} />
                                )}
                            </button>
                        </div>

                        {/* Report Container */}
                        <div ref={reportRef} className="bg-white shadow-xl min-h-[297mm] p-[20mm]">
                            {/* Header */}
                            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-serif font-bold text-slate-900">CreditSentinel</h1>
                                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest">Risk Management Division</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-900">{reportType}</div>
                                    <div className="text-slate-500 text-sm">Date: {new Date().toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* AI Generated Content */}
                            <div 
                                className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-p:text-justify prose-p:text-slate-700 prose-td:border-b prose-td:py-2 prose-th:text-left prose-th:py-2 text-sm"
                                dangerouslySetInnerHTML={{ __html: reportHtml }} 
                            />

                            {/* Footer */}
                            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                                <span>Confidential - Internal Use Only</span>
                                <span>Generated via CreditSentinel AI</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};