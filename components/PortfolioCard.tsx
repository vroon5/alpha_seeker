
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
    if (aiAnalysis) return; 
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
      className="bg-alpha-card border border-slate-800 rounded-xl overflow-hidden hover:border-alpha-accent/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-black/50"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/30">
        <div className="flex gap-3">
          <img src={portfolio.kolAvatar} alt={portfolio.kolName} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
          <div>
            <h3 className="font-bold text-white text-sm group-hover:text-alpha-accent transition-colors">{portfolio.title}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>by {portfolio.kolName}</span>
              {portfolio.isVerified && <Icons.ShieldCheck size={12} className="text-alpha-success" />}
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${portfolio.totalReturn >= 0 ? 'bg-alpha-success/20 text-alpha-success' : 'bg-alpha-danger/20 text-alpha-danger'}`}>
          {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn.toFixed(2)}%
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="p-4 grid grid-cols-2 gap-2">
        {portfolio.stocks.map((stock) => (
          <div key={stock.ticker} className="bg-slate-900/50 p-2 rounded-lg flex justify-between items-center border border-slate-800/50 hover:border-slate-700 transition-colors">
             <div className="flex flex-col">
               <span className="font-bold text-xs text-slate-300">{stock.ticker}</span>
               <span className="text-[10px] text-slate-500 font-mono">${stock.price.toFixed(2)}</span>
             </div>
             <span className={`text-[10px] font-bold ${stock.changePercent >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
               {stock.changePercent > 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(1)}%
             </span>
          </div>
        ))}
      </div>

      {/* Chart preview */}
      <div className="h-16 w-full opacity-50 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={portfolio.totalReturn >= 0 ? '#0ea5e9' : '#f97316'} 
              fill={portfolio.totalReturn >= 0 ? '#0ea5e9' : '#f97316'} 
              fillOpacity={0.1} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 bg-gradient-to-t from-alpha-card to-transparent pointer-events-none h-full w-full"></div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/20">
        {/* AI Analysis Section */}
        {aiAnalysis ? (
          <div className="p-3 bg-alpha-accent/10 border border-alpha-accent/20 rounded-lg animate-in fade-in" onClick={(e) => e.stopPropagation()}>
             <div className="flex items-center gap-1 text-[10px] text-alpha-accent mb-1 font-bold uppercase tracking-tight">
               <Icons.Zap size={10} /> AI Analyst: {portfolio.title}
             </div>
             <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{aiAnalysis}</p>
          </div>
        ) : (
          <button 
            onClick={handleAiAnalyze}
            disabled={loadingAi}
            className="w-full py-1.5 flex items-center justify-center gap-2 text-xs font-medium text-alpha-accent hover:text-alpha-accent/80 transition-colors"
          >
            {loadingAi ? 'Consulting Gemini...' : <><Icons.Zap size={14} /> Reveal AI Analysis</>}
          </button>
        )}

        <div className="flex justify-between items-center pt-2">
          {!isBacking ? (
            <>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Icons.Users size={12} /> {portfolio.backers} Backers
                </div>
                <button 
                    onClick={handleBackClick}
                    disabled={isBacked}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    isBacked 
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-alpha-success hover:bg-alpha-success/80 text-slate-950 shadow-lg shadow-alpha-success/10 active:scale-95'
                    }`}
                >
                    {isBacked ? 'Backed' : <>Back It <Icons.TrendingUp size={16} /></>}
                </button>
            </>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 px-1">
                    <span>Wager Amount</span>
                    <span className="font-bold">Max: ${userBalance.toFixed(0)}</span>
                </div>
                <div className="flex gap-2">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <input 
                            type="number" 
                            value={wagerAmount}
                            onChange={(e) => setWagerAmount(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-alpha-accent outline-none"
                            autoFocus
                        />
                     </div>
                     <button 
                        onClick={handleConfirmBack} 
                        disabled={Number(wagerAmount) > userBalance || Number(wagerAmount) <= 0}
                        className="bg-alpha-success hover:bg-alpha-success/80 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-3 py-2 rounded-lg text-sm"
                     >
                        Confirm
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setIsBacking(false); }} 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-2 rounded-lg text-sm font-bold"
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
