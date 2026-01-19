
import { GoogleGenAI, Type } from "@google/genai";
import { Stock, ChartDataPoint } from "../types";

const CACHE: Record<string, { price: number; change: number; timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes cache

/**
 * Fetches multiple real-time prices in a single batch to avoid rate limits and improve performance.
 */
export const fetchPricesBatch = async (tickers: string[]): Promise<Record<string, { price: number; change: number }>> => {
  if (tickers.length === 0) return {};
  
  const results: Record<string, { price: number; change: number }> = {};
  const toFetch: string[] = [];
  const now = Date.now();

  tickers.forEach(t => {
    const upper = t.toUpperCase();
    if (CACHE[upper] && now - CACHE[upper].timestamp < CACHE_TTL) {
      results[upper] = { price: CACHE[upper].price, change: CACHE[upper].change };
    } else {
      toFetch.push(upper);
    }
  });

  if (toFetch.length === 0) return results;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use a single prompt to fetch all needed prices
    const prompt = `Search Google Finance and provide the current real-time stock price and today's percentage change for these tickers: ${toFetch.join(', ')}.
    Return the data as a JSON object where the keys are the tickers.
    Format: {"TICKER": {"price": number, "change": number}}.
    Only return the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0,
      }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      Object.keys(data).forEach(ticker => {
        const upper = ticker.toUpperCase();
        if (data[ticker] && typeof data[ticker].price === 'number') {
          const item = { 
            price: Number(data[ticker].price), 
            change: Number(data[ticker].change || 0) 
          };
          CACHE[upper] = { ...item, timestamp: now };
          results[upper] = item;
        }
      });
    }
  } catch (error) {
    console.error("Batch price fetch failed:", error);
  }

  return results;
};

/**
 * Fetches a single real-time price (Fallback/Convenience wrapper)
 */
export const fetchRealTimePrice = async (ticker: string): Promise<{ price: number; change: number }> => {
  const batch = await fetchPricesBatch([ticker]);
  return batch[ticker.toUpperCase()] || { price: 0, change: 0 };
};

/**
 * Fetches comprehensive stock data and sources for search grounding display.
 */
export const fetchStockQuote = async (ticker: string): Promise<{ stock: Stock, sources: {title: string, uri: string}[] }> => {
  const upperTicker = ticker.toUpperCase();
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide the current price, percentage change, and full company name for ${upperTicker} based on real-time data.
    Also return grounding sources. Output JSON: {"price": number, "change": number, "name": "string"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri || '#'
      })) || [];

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    let price = 0;
    let change = 0;
    let name = upperTicker;

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      price = Number(data.price) || 0;
      change = Number(data.change) || 0;
      name = data.name || upperTicker;
    }

    return {
      stock: {
        ticker: upperTicker,
        name: name,
        price: price,
        changePercent: change
      },
      sources
    };
  } catch (error) {
    console.error("Quote Error:", error);
    return {
      stock: { ticker: upperTicker, name: 'Market Asset', price: 0, changePercent: 0 },
      sources: []
    };
  }
};

export const getLivePriceUpdate = (currentPrice: number): number => {
  return getLiveTick(currentPrice);
};

export const generateHistoricalData = (currentValue: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const count = 20;
  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000 * 60 * 60 * 24);
    const factor = 0.95 + (Math.random() * 0.1);
    data.push({
      time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Number((currentValue * factor).toFixed(2))
    });
  }
  return data;
};

export const getLiveTick = (price: number): number => {
  if (price <= 0) return price;
  const movement = price * 0.00015 * (Math.random() - 0.5);
  return Number((price + movement).toFixed(2));
};
