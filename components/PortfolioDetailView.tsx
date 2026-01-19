
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
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <Icons.TrendingDown className="rotate-90" size={16} />
        <span className="font-bold text-sm">Back to Feed</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4">
                <img src={portfolio.kolAvatar} alt={portfolio.kolName} className="w-16 h-16 rounded-full border-2 border-alpha-accent" />
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{portfolio.title}</h1>
                  <p className="text-gray-400">Curated by <span className="text-white font-bold">{portfolio.kolName}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${portfolio.totalReturn >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                  {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn}%
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold">Real-Time Performance</div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis hide />
                  <YAxis orientation="right" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="value" stroke={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.1} fill={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Icons.Briefcase className="text-alpha-gold" /> Strategy Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.stocks.map(stock => (
                <div key={stock.ticker} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-lg font-mono">{stock.ticker}</div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
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
            <p className="mt-6 text-[10px] text-gray-500 italic text-center">Data verified via Google Finance and Yahoo Finance search grounding.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold">
                <Icons.Zap size={20} /> AI Strategy Review
             </div>
             {!digest ? (
                <button 
                  onClick={handleGenerateDigest} disabled={loadingDigest}
                  className="w-full bg-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-500"
                >
                  {loadingDigest ? 'Analyzing Real Data...' : 'Generate AI News Digest'}
                </button>
             ) : (
                <p className="text-sm text-gray-300 leading-relaxed italic">"{digest}"</p>
             )}
          </div>

          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-8">
              {!isBacked ? (
                  !isWagering ? (
                    <button onClick={() => setIsWagering(true)} className="w-full bg-alpha-success py-4 rounded-xl font-bold text-lg">Back Strategy</button>
                  ) : (
                    <div className="space-y-4">
                        <input type="number" value={wagerAmount} onChange={(e)=>setWagerAmount(e.target.value)} className="w-full bg-gray-900 p-3 rounded-xl font-bold border border-gray-600" />
                        <div className="flex gap-2">
                            <button onClick={()=>setIsWagering(false)} className="flex-1 bg-gray-800 py-3 rounded-xl font-bold">Cancel</button>
                            <button onClick={() => { onWager(portfolio.id, Number(wagerAmount)); setIsWagering(false); }} className="flex-1 bg-alpha-success py-3 rounded-xl font-bold">Confirm</button>
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
