
import React, { useState } from 'react';
import { Portfolio } from '../types';
import { Icons } from './Icons';
import { analyzePortfolioWithGemini } from '../services/geminiService';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onBack: (id: string, amount: number) => void;
  isBacked: boolean;
  userBalance: number;
  onView?: (portfolio: Portfolio) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, onBack, isBacked, userBalance, onView }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isBacking, setIsBacking] = useState(false);
  const [wagerAmount, setWagerAmount] = useState<string>('10');

  // Generate simple sparkline data based on return
  const data = Array.from({ length: 10 }, (_, i) => ({
    val: 100 + (portfolio.totalReturn * (i / 10)) + (Math.random() * 2 - 1)
  }));

  const handleAiAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiAnalysis) return; // Already analyzed
    setLoadingAi(true);
    const result = await analyzePortfolioWithGemini(portfolio.stocks, portfolio.title);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const handleConfirmBack = (e: React.MouseEvent) => {
      e.stopPropagation();
      const amount = Number(wagerAmount);
      if (amount <= 0 || amount > userBalance) return;
      onBack(portfolio.id, amount);
      setIsBacking(false);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBacking(true);
  };

  const handleCardClick = () => {
    if (onView) onView(portfolio);
  };

  const stockTickers = portfolio.stocks.map(s => s.ticker).join(', ');

  return (
    <div 
      onClick={handleCardClick}
      className="bg-alpha-card border border-gray-700 rounded-xl overflow-hidden hover:border-alpha-accent/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-black/50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-start bg-gray-800/30">
        <div className="flex gap-3">
          <img src={portfolio.kolAvatar} alt={portfolio.kolName} className="w-10 h-10 rounded-full border border-gray-600" />
          <div>
            <h3 className="font-bold text-white text-sm group-hover:text-alpha-accent transition-colors">{portfolio.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>by {portfolio.kolName}</span>
              {portfolio.isVerifiedKOL && <Icons.ShieldCheck size={12} className="text-alpha-accent" />}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${portfolio.totalReturn >= 0 ? 'bg-alpha-success/20 text-alpha-success' : 'bg-alpha-danger/20 text-alpha-danger'}`}>
          {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn}%
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="p-4 grid grid-cols-2 gap-2">
        {portfolio.stocks.map((stock) => (
          <div key={stock.ticker} className="bg-gray-800/50 p-2 rounded-lg flex justify-between items-center">
             <div className="flex flex-col">
               <span className="font-bold text-xs text-gray-300">{stock.ticker}</span>
               <span className="text-[10px] text-gray-500 font-mono">${stock.price.toFixed(2)}</span>
             </div>
             <span className={`text-xs font-medium ${stock.changePercent >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
               {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
             </span>
          </div>
        ))}
      </div>

      {/* Chart preview */}
      <div className="h-16 w-full opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} 
              fill={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {/* AI Analysis Section */}
        {aiAnalysis ? (
          <div className="p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg" onClick={(e) => e.stopPropagation()}>
             <div className="flex items-center gap-1 text-[10px] text-indigo-400 mb-1 font-bold uppercase tracking-tight">
               <Icons.Zap size={10} /> AI Analyst: {portfolio.title} ({stockTickers})
             </div>
             <p className="text-xs text-gray-300 leading-relaxed">{aiAnalysis}</p>
          </div>
        ) : (
          <button 
            onClick={handleAiAnalyze}
            disabled={loadingAi}
            className="w-full py-1.5 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {loadingAi ? 'Analyzing...' : <><Icons.Zap size={14} /> Reveal AI Analysis</>}
          </button>
        )}

        <div className="flex justify-between items-center pt-2">
          {!isBacking ? (
            <>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Icons.Users size={12} /> {portfolio.backers} Backers
                </div>
                <button 
                    onClick={handleBackClick}
                    disabled={isBacked}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    isBacked 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-alpha-success hover:bg-green-600 text-white shadow-lg shadow-green-900/20'
                    }`}
                >
                    {isBacked ? 'Backed' : <>Back It <Icons.TrendingUp size={16} /></>}
                </button>
            </>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 px-1">
                    <span>Wager Amount</span>
                    <span>Max: ${userBalance.toFixed(0)}</span>
                </div>
                <div className="flex gap-2">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input 
                            type="number" 
                            value={wagerAmount}
                            onChange={(e) => setWagerAmount(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-alpha-accent outline-none"
                        />
                     </div>
                     <button 
                        onClick={handleConfirmBack} 
                        disabled={Number(wagerAmount) > userBalance || Number(wagerAmount) <= 0}
                        className="bg-alpha-success hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-3 py-2 rounded-lg text-sm"
                     >
                        Confirm
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setIsBacking(false); }} 
                        className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-2 rounded-lg text-sm font-bold"
                     >
                        X
                     </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
