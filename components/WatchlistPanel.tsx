import React, { useState, useEffect } from 'react';
import { WatchlistItem, ChartDataPoint, Stock } from '../types';
import { Icons } from './Icons';
import { fetchStockQuote, getLivePriceUpdate } from '../services/stockData';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface WatchlistPanelProps {
  watchlist: WatchlistItem[];
  addToWatchlist: (ticker: string, qty: number, avgPrice: number) => void;
}

const WatchlistPanel: React.FC<WatchlistPanelProps> = ({ watchlist, addToWatchlist }) => {
  const [items, setItems] = useState<WatchlistItem[]>(watchlist);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Stock | null>(null);
  const [searchSources, setSearchSources] = useState<{title: string, uri: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Add Form State
  const [isAddingResult, setIsAddingResult] = useState(false);
  const [addQty, setAddQty] = useState('1');

  // Dashboard Metrics
  const [totalEquity, setTotalEquity] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const initData = async () => {
      const updated = await Promise.all(watchlist.map(async (item) => {
         const res = await fetchStockQuote(item.ticker);
         return { ...item, currentPrice: res.stock.price, dayChangePercent: res.stock.changePercent };
      }));
      setItems(updated);
    };
    initData();
  }, [watchlist]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prevItems => prevItems.map(item => {
        if (!item.currentPrice) return item;
        const newPrice = getLivePriceUpdate(item.currentPrice);
        return { ...item, currentPrice: newPrice };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     let eq = 0;
     let cost = 0;
     items.forEach(item => {
         const price = item.currentPrice || item.avgPrice;
         eq += price * item.quantity;
         cost += item.avgPrice * item.quantity;
     });
     setTotalEquity(eq);
     setTotalPnL(eq - cost);

     setChartData(prev => {
        const next = [...prev, { time: new Date().toLocaleTimeString(), value: eq }];
        return next.slice(-20);
     });
  }, [items]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await fetchStockQuote(searchQuery);
      if (res.stock) {
        setSearchResult(res.stock);
        setSearchSources(res.sources);
      } else {
        setSearchError('Stock not found');
      }
    } catch (err) {
      setSearchError('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!searchResult) return;
    addToWatchlist(searchResult.ticker, Number(addQty), searchResult.price);
    setSearchResult(null);
    setSearchQuery('');
    setIsAddingResult(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-alpha-card border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icons.Search className="text-alpha-accent" size={20} />
            Live Market Search
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter ticker (e.g. AAPL, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-alpha-accent outline-none"
            />
            <button type="submit" disabled={isSearching} className="bg-alpha-accent hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
              {isSearching ? 'Fetching...' : 'Get Live Price'}
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 p-4 bg-gray-800/80 border border-alpha-accent/30 rounded-xl animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-alpha-accent/20 rounded-xl flex items-center justify-center font-bold text-alpha-accent text-lg">
                    {searchResult.ticker[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{searchResult.ticker}</h3>
                    <p className="text-sm text-gray-400">{searchResult.name}</p>
                  </div>
                  <div className="px-4 border-l border-gray-700">
                    <p className="text-xl font-mono text-white font-bold">${searchResult.price.toFixed(2)}</p>
                    <p className={`text-sm font-bold ${searchResult.changePercent >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                      {searchResult.changePercent > 0 ? '+' : ''}{searchResult.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                {!isAddingResult ? (
                  <button onClick={() => setIsAddingResult(true)} className="px-6 py-2 bg-alpha-success hover:bg-green-600 text-white font-bold rounded-lg flex items-center gap-2">
                    <Icons.Plus size={18} /> Add to Watchlist
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} className="w-20 bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-white" />
                    <button onClick={handleConfirmAdd} className="px-4 py-1.5 bg-alpha-success text-white font-bold rounded-lg">Confirm</button>
                    <button onClick={() => setIsAddingResult(false)} className="px-4 py-1.5 bg-gray-700 text-gray-400 font-bold rounded-lg">X</button>
                  </div>
                )}
              </div>
              {searchSources.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {searchSources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener" className="text-[10px] text-alpha-accent whitespace-nowrap bg-black/30 px-2 py-1 rounded">
                            {s.title}
                        </a>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-alpha-card border border-gray-700 p-6 rounded-2xl">
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Equity</p>
              <h2 className="text-3xl font-bold text-white">${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
          <div className="bg-alpha-card border border-gray-700 p-6 rounded-2xl">
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Return</p>
              <h2 className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                  {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </h2>
          </div>
      </div>

      <div className="bg-alpha-card border border-gray-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
              <h3 className="font-bold text-white">Your Watchlist</h3>
              <span className="text-xs text-alpha-accent flex items-center gap-1 animate-pulse"><Icons.Clock size={12}/> LIVE DATA</span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-800/30 text-xs text-gray-400 uppercase">
                      <tr>
                          <th className="px-4 py-3">Ticker</th>
                          <th className="px-4 py-3 text-right">Live Price</th>
                          <th className="px-4 py-3 text-right">Value</th>
                          <th className="px-4 py-3 text-right">Total P&L</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                      {items.map(item => {
                          const price = item.currentPrice || item.avgPrice;
                          const value = price * item.quantity;
                          const pnl = value - (item.avgPrice * item.quantity);
                          return (
                              <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                                  <td className="px-4 py-3 font-bold text-white">{item.ticker}</td>
                                  <td className="px-4 py-3 text-right font-mono text-gray-300">${price.toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right text-white font-bold">${value.toFixed(2)}</td>
                                  <td className={`px-4 py-3 text-right font-bold ${pnl >= 0 ? 'text-alpha-success' : 'text-alpha-danger'}`}>
                                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default WatchlistPanel;
