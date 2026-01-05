import React, { useState, useEffect } from 'react';
import { Portfolio, ChartDataPoint, Stock } from '../types';
import { Icons } from './Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateHistoricalData, fetchStockQuote } from '../services/stockData';
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
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1M');
  const [wagerAmount, setWagerAmount] = useState('10');
  const [isWagering, setIsWagering] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);
  
  // Local state for stocks to allow live updating
  const [currentStocks, setCurrentStocks] = useState<Stock[]>(portfolio.stocks);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSources, setDataSources] = useState<{title: string, uri: string}[]>([]);

  useEffect(() => {
    // Simulate fetching historical data based on the portfolio's return
    const points = timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : 30;
    const baseValue = 1000;
    const data = generateHistoricalData(baseValue * (1 + portfolio.totalReturn / 100), points);
    setChartData(data);
  }, [portfolio, timeRange]);

  const handleWagerConfirm = () => {
    const amount = Number(wagerAmount);
    if (amount > 0 && amount <= userBalance) {
      onWager(portfolio.id, amount);
      setIsWagering(false);
    }
  };

  const handleGenerateDigest = async () => {
    setLoadingDigest(true);
    const result = await generateStockNewsDigest(currentStocks);
    setDigest(result);
    setLoadingDigest(false);
  };
  
  const handleRefreshPrices = async () => {
      setIsRefreshing(true);
      try {
          const allSources: {title: string, uri: string}[] = [];
          const updatedStocks = await Promise.all(
              currentStocks.map(async (stock) => {
                  try {
                      const res = await fetchStockQuote(stock.ticker);
                      if (res.sources) allSources.push(...res.sources);
                      return res.stock;
                  } catch (e) {
                      return stock;
                  }
              })
          );
          setCurrentStocks(updatedStocks);
          // Deduplicate and set sources
          const uniqueSources = Array.from(new Map(allSources.map(s => [s.uri, s])).values());
          setDataSources(uniqueSources.slice(0, 5));
      } catch (e) {
          console.error("Failed to refresh portfolio prices", e);
      } finally {
          setIsRefreshing(false);
      }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      {/* Navigation Header */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
      >
        <div className="p-1 rounded-full bg-gray-800 group-hover:bg-gray-700">
             <Icons.TrendingDown className="rotate-90" size={16} />
        </div>
        <span className="font-bold text-sm">Back to Discover</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Chart & Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <img src={portfolio.kolAvatar} alt={portfolio.kolName} className="w-16 h-16 rounded-full border-2 border-alpha-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{portfolio.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="font-medium text-white">{portfolio.kolName}</span>
                    {portfolio.isVerifiedKOL && <Icons.ShieldCheck size={14} className="text-alpha-accent" />}
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span>{portfolio.expiry} Horizon</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${portfolio.totalReturn >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                  {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn}%
                </div>
                <div className="text-xs text-gray-400">Total Return</div>
              </div>
            </div>

            {/* Main Chart */}
            <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right" 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    tickFormatter={(val) => `$${val}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', borderColor: '#374151', color: '#f8fafc', borderRadius: '8px'}}
                    itemStyle={{color: '#fff'}}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={portfolio.totalReturn >= 0 ? '#10b981' : '#ef4444'} 
                    fillOpacity={1} 
                    fill="url(#colorPnL)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Time Range Selectors */}
            <div className="flex gap-2">
              {['1D', '1W', '1M', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${
                    timeRange === range 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Holdings Breakdown */}
          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Icons.Briefcase size={18} className="text-alpha-gold" /> Market Holdings
                </h3>
                <button 
                    onClick={handleRefreshPrices}
                    disabled={isRefreshing}
                    className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    <Icons.Clock size={12} className={isRefreshing ? "animate-spin" : ""} />
                    {isRefreshing ? 'Syncing...' : 'Refresh Live Prices'}
                </button>
            </div>
            
            <div className="space-y-3">
              {currentStocks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center font-bold text-gray-300 text-xs">
                      {stock.ticker[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{stock.ticker}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">${stock.price.toFixed(2)}</div>
                    <div className={`text-xs font-bold ${stock.changePercent >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grounding Sources (Compliant with Google Search tool) */}
            {dataSources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Market Data Sources</p>
                    <div className="flex flex-wrap gap-2">
                        {dataSources.map((source, i) => (
                            <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-alpha-accent px-2 py-1 rounded border border-alpha-accent/20 transition-colors"
                            >
                                {source.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right Column: AI & Actions */}
        <div className="space-y-6">
          <div className="bg-alpha-card border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Icons.Zap className="text-indigo-400" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">AI Strategy Review</h3>
                    <p className="text-xs text-gray-400">Powered by Gemini Search</p>
                </div>
             </div>
             {!digest ? (
                <button 
                    onClick={handleGenerateDigest}
                    disabled={loadingDigest}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loadingDigest ? 'Processing...' : 'Analyze Holdings'}
                </button>
             ) : (
                <p className="text-sm text-gray-300 leading-relaxed italic">"{digest}"</p>
             )}
          </div>

          <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">Total Stakeholders</p>
              <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <Icons.Users className="text-alpha-accent" />
                {portfolio.backers.toLocaleString()}
              </div>
            </div>
            {!isBacked ? (
              !isWagering ? (
                <button 
                  onClick={() => setIsWagering(true)}
                  className="w-full py-4 bg-alpha-success hover:bg-green-600 text-white font-bold rounded-xl text-lg transition-all"
                >
                  Back This KOL
                </button>
              ) : (
                <div className="space-y-4">
                  <input 
                    type="number" 
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    className="w-full bg-black/40 border border-gray-600 rounded-xl px-4 py-3 text-white font-bold"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setIsWagering(false)} className="py-3 bg-gray-700 text-gray-300 font-bold rounded-xl">Cancel</button>
                    <button onClick={handleWagerConfirm} className="py-3 bg-alpha-success text-white font-bold rounded-xl">Confirm</button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                <Icons.ShieldCheck className="text-alpha-success mx-auto mb-2" size={32} />
                <h3 className="text-green-400 font-bold">Successfully Backed</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailView;
