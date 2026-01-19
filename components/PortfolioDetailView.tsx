
import React, { useState, useEffect } from 'react';
import { Portfolio, ChartDataPoint, Stock } from '../types';
import { Icons } from './Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateHistoricalData } from '../services/stockData';
import { generateStockNewsDigest } from '../services/geminiService';

interface PortfolioDetailViewProps {
  portfolio: Portfolio;
  onBack: () => void;
  onWager: (id: string, amount: number) => void;
  userBalance: number;
  isBacked: boolean;
}

const PortfolioDetailView: React.FC<PortfolioDetailViewProps> = ({ portfolio, onBack, onWager, userBalance, isBacked }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [wagerAmount, setWagerAmount] = useState('10');
  const [isWagering, setIsWagering] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);

  useEffect(() => {
    const baseValue = 1000;
    setChartData(generateHistoricalData(baseValue * (1 + portfolio.totalReturn / 100)));
  }, [portfolio]);

  const handleGenerateDigest = async () => {
    setLoadingDigest(true);
    const result = await generateStockNewsDigest(portfolio.stocks);
    setDigest(result);
    setLoadingDigest(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 group transition-colors">
        <div className="p-1.5 rounded-full bg-slate-800 group-hover:bg-alpha-accent/20">
          <Icons.TrendingDown className="rotate-90" size={16} />
        </div>
        <span className="font-bold text-sm">Back to Feed</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-alpha-card border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4">
                <img src={portfolio.kolAvatar} alt={portfolio.kolName} className="w-16 h-16 rounded-full border-2 border-alpha-accent shadow-lg shadow-alpha-accent/10" />
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{portfolio.title}</h1>
                  <p className="text-slate-400">Curated by <span className="text-white font-bold">{portfolio.kolName}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${portfolio.totalReturn >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                  {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn}%
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Real-Time Delta</div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis hide />
                  <YAxis orientation="right" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px'}} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={portfolio.totalReturn >= 0 ? '#0ea5e9' : '#f97316'} 
                    fillOpacity={0.1} 
                    fill={portfolio.totalReturn >= 0 ? '#0ea5e9' : '#f97316'} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-alpha-card border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Icons.Briefcase className="text-alpha-gold" /> Strategy Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.stocks.map(stock => (
                <div key={stock.ticker} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-alpha-accent/30 transition-all">
                  <div>
                    <div className="font-bold text-white text-lg font-mono group-hover:text-alpha-accent transition-colors">{stock.ticker}</div>
                    <div className="text-xs text-slate-500">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white font-mono">${stock.price.toFixed(2)}</div>
                    <div className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-alpha-accent/10 border border-alpha-accent/30 rounded-2xl p-6 shadow-lg shadow-alpha-accent/5">
             <div className="flex items-center gap-2 mb-4 text-alpha-accent font-bold">
                <Icons.Zap size={20} /> AI Strategy Review
             </div>
             {!digest ? (
                <button 
                  onClick={handleGenerateDigest} disabled={loadingDigest}
                  className="w-full bg-alpha-accent py-3 rounded-xl font-bold text-slate-950 hover:bg-alpha-accent/90 transition-all"
                >
                  {loadingDigest ? 'Analyzing Live Data...' : 'Generate AI News Digest'}
                </button>
             ) : (
                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-alpha-accent pl-4">"{digest}"</p>
             )}
          </div>

          <div className="bg-alpha-card border border-slate-800 rounded-2xl p-8 shadow-xl">
              {!isBacked ? (
                  !isWagering ? (
                    <button onClick={() => setIsWagering(true)} className="w-full bg-alpha-success py-4 rounded-xl font-bold text-lg text-slate-950 hover:bg-alpha-success/90 shadow-lg shadow-alpha-success/10 active:scale-[0.98] transition-all">Back Strategy</button>
                  ) : (
                    <div className="space-y-4 animate-in zoom-in-95">
                        <input type="number" value={wagerAmount} onChange={(e)=>setWagerAmount(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl font-bold border border-slate-700 text-white outline-none focus:border-alpha-accent" />
                        <div className="flex gap-2">
                            <button onClick={()=>setIsWagering(false)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold hover:bg-slate-700">Cancel</button>
                            <button onClick={() => { onWager(portfolio.id, Number(wagerAmount)); setIsWagering(false); }} className="flex-1 bg-alpha-success py-3 rounded-xl font-bold text-slate-950">Confirm</button>
                        </div>
                    </div>
                  )
              ) : (
                  <div className="text-center text-alpha-success font-bold py-4 bg-alpha-success/10 rounded-xl border border-alpha-success/30">
                      Portfolio Backed
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailView;
