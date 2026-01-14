import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Loan } from "../types";

const createClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key missing");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
}

export interface NewsBriefing {
    summary: string;
    articles: NewsArticle[];
}

/**
 * RAG Implementation: Uses Google Search Grounding to fetch live data
 * and generate a synthesized briefing.
 */
export const fetchMarketNews = async (query: string = "Global Credit Markets and Banking Regulation"): Promise<NewsBriefing> => {
    try {
        const ai = createClient();
        
        // Using gemini-3-flash-preview as it supports search grounding efficiently
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Provide a comprehensive news briefing on: ${query}. 
            Focus on financial stability, interest rates, and major corporate debt events.
            Summarize the key points in 2 paragraphs.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const summary = response.text || "No summary available.";
        
        // Extract Grounding Metadata (Citations/Sources)
        const candidates = response.candidates;
        const articles: NewsArticle[] = [];
        
        if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
            candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web && chunk.web.uri) {
                    articles.push({
                        title: chunk.web.title || "Source Article",
                        url: chunk.web.uri,
                        source: new URL(chunk.web.uri).hostname.replace('www.', '')
                    });
                }
            });
        }

        // Deduplicate articles based on URL
        const uniqueArticles = Array.from(new Map(articles.map(item => [item.url, item])).values()).slice(0, 6);

        return {
            summary,
            articles: uniqueArticles
        };

    } catch (e) {
        console.error("News fetch failed", e);
        return {
            summary: "Unable to connect to market intelligence network at this time.",
            articles: []
        };
    }
};

export const generateRiskAnalysis = async (loan: Loan): Promise<string> => {
    try {
        const ai = createClient();
        
        const prompt = `
        You are a senior credit risk analyst at a top-tier bank.
        Review the following loan details and provide a concise, executive-level risk assessment.
        
        Loan Details:
        - Borrower: ${loan.borrower.name} (${loan.borrower.industry})
        - Amount: ${loan.amount} ${loan.currency}
        - Current Status: ${loan.status}
        - Covenant Status: ${loan.covenantStatus}
        - Calculated Risk Score: ${loan.riskProfile.score}/100 (${loan.riskProfile.level})
        - Key Risk Factors Detected: ${loan.riskProfile.factors.map(f => f.description).join('; ')}
        - Internal Notes: ${loan.notes}

        Output Structure:
        1. **Executive Summary**: 2-3 sentences.
        2. **Critical Vulnerabilities**: Bullet points of what could go wrong.
        3. **Recommended Action**: What should the loan officer do next? (e.g., Request audit, Restructure, Hold).

        Keep the tone professional, objective, and direct.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "Analysis generation failed.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Unable to generate AI analysis at this time. Please check API configuration.";
    }
};

export const generateStressTestReport = async (loan: Loan, scenarios: { rateHike: number, revenueDrop: number, marketCondition: string }): Promise<string> => {
    try {
        const ai = createClient();
        const prompt = `
        PERFORM A STRESS TEST SIMULATION.
        
        Subject: ${loan.borrower.name} (${loan.borrower.industry})
        Current Risk Score: ${loan.riskProfile.score}/100
        
        SIMULATION PARAMETERS:
        1. Interest Rates increase by: +${scenarios.rateHike}% (Base: ${loan.interestRate}%)
        2. Borrower Revenue drops by: -${scenarios.revenueDrop}%
        3. Market Condition: ${scenarios.marketCondition}
        
        TASK:
        Predict the impact on the borrower's ability to service debt (DSCR) and liquidity.
        Provide a "Post-Stress Viability Assessment".
        Would this trigger a default?
        
        Format:
        **Projected Outlook**: [Survival | Distressed | Default]
        **Analysis**: Short paragraph explaining the mechanics of the failure or survival.
        **Mitigation**: One key step to take NOW to prepare for this scenario.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "Simulation failed.";
    } catch (e) {
        return "AI Stress Test unavailable.";
    }
};

export const generateSmartAlerts = async (loans: Loan[]): Promise<string> => {
     try {
        const ai = createClient();
        const riskyLoans = loans.filter(l => l.riskProfile.score < 70);
        
        const dataSummary = riskyLoans.map(l => 
            `${l.borrower.name} (Score: ${l.riskProfile.score}, Ind: ${l.borrower.industry})`
        ).join('\n');

        const prompt = `
        Analyze this list of high-risk loans in our portfolio:
        ${dataSummary}

        Identify if there is a systemic risk pattern (e.g., industry concentration, widespread credit rating drops).
        Provide a 1-paragraph "Portfolio Health Warning".
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "No systemic risks detected.";
    } catch (error) {
        return "Systemic risk analysis unavailable.";
    }
}

export interface AlertItem {
    id: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    loanId: string;
    actionItem: string;
}

export const generateDailyAlerts = async (loans: Loan[]): Promise<AlertItem[]> => {
    try {
        const ai = createClient();
        
        // Provide a summarized view of the portfolio to avoid token limits if list is huge
        // In a real app, this would be chunked or pre-filtered.
        const portfolioContext = loans.map(l => ({
            id: l.id,
            borrower: l.borrower.name,
            industry: l.borrower.industry,
            status: l.status,
            covenant: l.covenantStatus,
            score: l.riskProfile.score,
            maturity: l.maturityDate
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Scan this portfolio data and generate 3-5 critical risk alerts. 
            Focus on covenant breaches, low scores, and upcoming maturities.
            Data: ${JSON.stringify(portfolioContext)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            loanId: { type: Type.STRING },
                            actionItem: { type: Type.STRING },
                        },
                        required: ['severity', 'title', 'description', 'loanId', 'actionItem']
                    }
                }
            }
        });

        const rawJSON = response.text;
        if (!rawJSON) return [];
        
        const parsed = JSON.parse(rawJSON) as Omit<AlertItem, 'id'>[];
        return parsed.map((item, idx) => ({...item, id: `alert-${Date.now()}-${idx}`}));

    } catch (e) {
        console.error("Alert generation failed", e);
        return [];
    }
}

export const generatePortfolioReport = async (loans: Loan[], reportType: string): Promise<string> => {
    try {
        const ai = createClient();
        const portfolioSummary = JSON.stringify(loans.map(l => ({
            borrower: l.borrower.name,
            amount: l.amount,
            risk: l.riskProfile.level,
            score: l.riskProfile.score
        })));

        const prompt = `
        Generate a professional HTML report for a bank executive.
        Report Type: ${reportType}
        Portfolio Data: ${portfolioSummary}

        Requirements:
        1. Use Tailwind CSS classes for styling (e.g., text-xl, font-bold, border-b, p-4, bg-gray-50).
        2. Include a "Market Overview" section (hallucinate plausible market context based on the industries present).
        3. Include a "Risk Distribution" table.
        4. Include a "Recommendations" section.
        5. DO NOT include <html>, <head>, or <body> tags. Just return the content div.
        6. Make it look like a formal printed document (clean, serif headings, sans-serif body).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "<p>Report generation failed.</p>";

    } catch (e) {
        return "<p>Error generating report.</p>";
    }
}

export class AIChatService {
    private chat: Chat | null = null;
    private currentContextId: string = '';

    constructor() {}

    private getClient() {
        if (!process.env.API_KEY) throw new Error("API Key missing");
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }

    async sendMessage(message: string, contextData: string, contextId: string): Promise<string> {
        // If context changed, start a new chat with new system instruction
        if (!this.chat || this.currentContextId !== contextId) {
            const ai = this.getClient();
            this.chat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: `You are CreditSentinel Copilot, an expert credit risk assistant. 
                    
                    CURRENT CONTEXT:
                    ${contextData}
                    
                    INSTRUCTIONS:
                    1. Answer questions strictly based on the provided context.
                    2. If asked to draft emails or letters, use a professional banking tone.
                    3. Keep responses concise and actionable.
                    4. If the user asks about something not in the context, politely explain you only have access to the current view's data.
                    `
                }
            });
            this.currentContextId = contextId;
        }

        try {
            const result = await this.chat.sendMessage({ message });
            return result.text || "I couldn't generate a response.";
        } catch (e) {
            console.error(e);
            return "Error communicating with AI service.";
        }
    }
}

export const aiChatService = new AIChatService();