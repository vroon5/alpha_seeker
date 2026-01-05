
import { GoogleGenAI } from "@google/genai";
import { Stock } from '../types';
import { MOCK_STOCKS } from './mockData';

export interface StockQuoteResponse {
  stock: Stock;
  sources: { title: string; uri: string }[];
}

// Simple in-memory cache to prevent excessive API calls during a short window
const SESSION_CACHE: Record<string, { data: StockQuoteResponse, timestamp: number }> = {};
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetches real-time stock data using Gemini with Google Search Grounding.
 * Targets reliable sources like Google Finance, Yahoo Finance, and Bloomberg.
 */
export const fetchStockQuote = async (ticker: string): Promise<StockQuoteResponse> => {
  const upperTicker = ticker.toUpperCase();
  const now = Date.now();

  if (SESSION_CACHE[upperTicker] && (now - SESSION_CACHE[upperTicker].timestamp < CACHE_TTL)) {
    return SESSION_CACHE[upperTicker].data;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Using Google Search, find the current REAL-TIME market price and daily percentage change for "${upperTicker}".
      Verify the price against sources like Google Finance, Yahoo Finance, or the official exchange data.
      
      Return exactly this JSON structure:
      {
        "price": number,
        "changePercent": number,
        "name": "Full Company Name",
        "lastUpdated": "string"
      }
      
      The price should be a number, not a string. Use the most recent quote available.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
        if (data.price !== undefined) {
           const res: StockQuoteResponse = {
             stock: {
               ticker: upperTicker,
               name: data.name || `${upperTicker} Corp`,
               price: Number(data.price),
               changePercent: Number(data.changePercent || 0),
               sector: 'Market'
             },
             sources: sources.slice(0, 3)
           };
           SESSION_CACHE[upperTicker] = { data: res, timestamp: now };
           return res;
        }
      } catch (e) {
        console.error("JSON parse error for ticker quote", upperTicker, e);
      }
    }
  } catch (error) {
    console.warn(`Real-time fetch failed for ${upperTicker}, falling back.`, error);
  }

  // Fallback
  const existing = MOCK_STOCKS.find(s => s.ticker === upperTicker);
  const fallbackStock = existing || {
    ticker: upperTicker,
    name: `${upperTicker} Corp`,
    price: 150.00,
    changePercent: 0.00,
    sector: 'Unknown'
  };

  return { stock: fallbackStock, sources: [] };
};

export const getLivePriceUpdate = (currentPrice: number): number => {
  // Micro-fluctuations for UI dynamism between real API calls
  const volatility = 0.0002;
  const change = currentPrice * volatility * (Math.random() - 0.5);
  return Number((currentPrice + change).toFixed(2));
};

export const generateHistoricalData = (basePrice: number, points: number = 30) => {
  const data = [];
  let current = basePrice * 0.95;
  for (let i = 0; i < points; i++) {
    const volatility = 0.01;
    current = current * (1 + (Math.random() * volatility - volatility/2));
    data.push({
      time: `T-${points-i}`,
      value: Number(current.toFixed(2))
    });
  }
  data[data.length - 1].value = basePrice;
  return data;
};
