
import { GoogleGenAI } from "@google/genai";
import { Stock } from "../types";

/**
 * Analyzes a 4-stock portfolio using Gemini for energetic financial analysis.
 */
export const analyzePortfolioWithGemini = async (stocks: Stock[], strategyName: string): Promise<string> => {
  const stockList = stocks.map(s => s.ticker).join(', ');
  const prompt = `
    You are a senior financial analyst for a fintech app called Alpha Seeker.
    Analyze this 4-stock portfolio: ${stockList}.
    The strategy name is "${strategyName}".
    
    Provide a concise (max 3 sentences) energetic analysis of why this portfolio might succeed or fail in the current market environment. 
    Focus on sector exposure and volatility.
  `;

  try {
    // Correct initialization as per guidelines: Use process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI Analysis temporarily unavailable due to network or API limits.";
  }
};

/**
 * Generates a news digest for a list of stocks.
 */
export const generateStockNewsDigest = async (stocks: Stock[]): Promise<string> => {
  const stockList = stocks.map(s => s.ticker).join(', ');
  const prompt = `
    You are a financial news reporter for Alpha Seeker.
    For each of the following stocks: ${stockList}.
    
    Provide a concise, 1-sentence news digest highlight for each stock based on recent real-world events or general market sentiment typical for these companies.
    
    Format exactly like this for each stock (do not use markdown bolding):
    [TICKER]: [News Summary]
  `;

  try {
    // Correct initialization as per guidelines: Use process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "News digest unavailable.";
  } catch (error) {
    console.error("Gemini Digest Error:", error);
    return "AI News Digest temporarily unavailable.";
  }
};

export const generateMarketSentiment = async (): Promise<{sentiment: string, score: number}> => {
   // Simulated for demo robustness
   return {
       sentiment: "Bullish on Tech, Cautious on Consumer Discretionary",
       score: 75 // 0-100
   }
}
