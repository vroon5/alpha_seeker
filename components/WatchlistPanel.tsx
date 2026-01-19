
import React, { useState, useEffect } from 'react';
import { WatchlistItem, Stock } from '../types';
import { Icons } from './Icons';
import { fetchStockQuote, getLivePriceUpdate } from '../services/stockData';

interface WatchlistPanelProps {
  watchlist: WatchlistItem[];
  addToWatchlist: (ticker: string) => void;
}

const WatchlistPanel: React.FC<WatchlistPanelProps> = ({ watchlist, addToWatchlist }) => {
  const [items, setItems] = useState<WatchlistItem[]>(watchlist);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Stock | null>(null);
  const [searchSources, setSearchSources] = useState<{title: string, uri: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => { setItems(watchlist); }, [watchlist]);

  // Handle price ticks for a "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        currentPrice: item.currentPrice ? getLivePriceUpdate(item.currentPrice) : item.currentPrice
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    
    try {
      const res = await fetchStockQuote(searchQuery);
      if (res.stock && res.stock.price > 0) {
        setSearchResult(res.stock);
        setSearchSources(res.sources);
      } else {
        setSearchError("Ticker not found or market data unavailable.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("An error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const onAddClick = () => {
    if (searchResult) {
      addToWatchlist(searchResult.ticker);
      setSearchResult(null);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
        <p className="text-gray-400 text-sm">Monitor your personal asset performance in real-time.</p>
      </div>

      {/* Search & Add Bar */}
      <div className="bg-alpha-card border border-gray-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <Icons.Search className="text-blue-400" size={20} /> Add New Asset
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 relative z-10">
          <input 
            type="text" 
            placeholder="Enter Ticker Symbol (e.g. BTC, NVDA, TSLA)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all font-mono"
          />
          <button 
            type="submit" 
            disabled={isSearching} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-bold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSearching ? <Icons.Clock className="animate-spin" size={18} /> : <Icons.Zap size={18} />}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && (
          <p className="mt-3 text-red-400 text-xs font-bold animate-in fade-in">{searchError}</p>
        )}

        {/* Search Result Card */}
        {searchResult && (
          <div className="mt-6 p-5 bg-gray-900/60 rounded-xl border border-blue-500/20 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white font-mono">{searchResult.ticker}</h3>
                  <span className="text-xs text-gray-500 uppercase font-medium">{searchResult.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold text-white font-mono">${searchResult.price.toFixed(2)}</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${searchResult.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {searchResult.changePercent > 0 ? <Icons.TrendingUp size={14}/> : <Icons.TrendingDown size={14}/>}
                    {searchResult.changePercent > 0 ? '+' : ''}{searchResult.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <button 
                onClick={onAddClick}
                className="w-full sm:w-auto bg-green-500/90 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
              >
                <Icons.Plus size={20} /> Track Ticker
              </button>
            </div>
            
            {searchSources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Verified Sources:</span>
                {searchSources.map((s, i) => (
                  <a 
                    key={i} 
                    href={s.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded hover:underline flex items-center gap-1"
                  >
                    <Icons.Globe size={10} /> {s.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watchlist Table */}
      <div className="bg-alpha-card border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-700 bg-gray-800/30 flex justify-between items-center">
             <h3 className="font-bold text-white text-sm flex items-center gap-2">
               <Icons.Chart size={16} className="text-blue-400" /> Current Positions
             </h3>
             <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
               LIVE DATA
             </span>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-[10px] text-gray-500 uppercase tracking-widest">
                      <tr>
                          <th className="px-6 py-4">Asset Symbol</th>
                          <th className="px-6 py-4 text-right">Market Price</th>
                          <th className="px-6 py-4 text-right">24h Change</th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                      {items.length > 0 ? items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-800/20 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-white font-mono">{item.ticker}</span>
                                  <span className="text-[10px] text-gray-500">Regular Market</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-white">
                                {item.currentPrice && item.currentPrice > 0 
                                  ? `$${item.currentPrice.toFixed(2)}` 
                                  : <span className="text-blue-400 animate-pulse text-[10px]">Syncing...</span>}
                              </td>
                              <td className={`px-6 py-4 text-right font-bold text-sm ${item.dayChangePercent && item.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {item.dayChangePercent ? `${item.dayChangePercent > 0 ? '+' : ''}${item.dayChangePercent.toFixed(2)}%` : '--'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                                      <Icons.TrendingDown className="rotate-45" size={16} title="Remove from Watchlist" />
                                  </button>
                              </td>
                          </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <Icons.Chart className="mx-auto text-gray-700 mb-4" size={48} />
                            <h3 className="text-gray-400 font-bold">Your Watchlist is Empty</h3>
                            <p className="text-gray-600 text-xs">Search and add symbols above to start tracking.</p>
                          </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default WatchlistPanel;
