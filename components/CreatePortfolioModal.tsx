
import React, { useState } from 'react';
import { Icons } from './Icons';
import { Stock, Portfolio } from '../types';
import { fetchStockQuote } from '../services/stockData';

interface CreatePortfolioModalProps {
  roomId: string;
  onClose: () => void;
  onSave: (portfolio: Portfolio) => void;
}

const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({ roomId, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || selectedStocks.length >= 4) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetchStockQuote(searchQuery);
      if (res.stock && res.stock.price > 0) {
        if (selectedStocks.some(s => s.ticker === res.stock.ticker)) {
          setError("Ticker already in your portfolio.");
        } else {
          setSelectedStocks(prev => [...prev, res.stock]);
          setSearchQuery('');
        }
      } else {
        setError("Ticker not found or invalid.");
      }
    } catch (err) {
      setError("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeStock = (ticker: string) => {
    setSelectedStocks(prev => prev.filter(s => s.ticker !== ticker));
  };

  const handleCreate = () => {
    if (!title || selectedStocks.length !== 4) return;

    const newPortfolio: Portfolio = {
      id: `up-${Date.now()}`,
      kolName: 'You',
      kolAvatar: 'https://i.pravatar.cc/150?u=me',
      isVerified: false,
      title,
      description: description || 'My custom winning strategy.',
      stocks: selectedStocks,
      totalReturn: 0,
      backers: 0,
      expiry: 'End of Season',
      roomId
    };

    onSave(newPortfolio);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-alpha-card border border-gray-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <Icons.Briefcase size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
                <p className="text-xs text-gray-400">Select exactly 4 stocks to compete</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
            <Icons.TrendingDown size={20} className="rotate-45" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-1 gap-4">
             <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Strategy Title</label>
               <input 
                type="text" 
                placeholder="e.g. Blue Chip Giants"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all"
               />
             </div>
             <div>
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
               <textarea 
                placeholder="Explain your market thesis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all resize-none text-sm"
               />
             </div>
          </div>

          {/* Stock Search */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Add Tickers ({selectedStocks.length}/4)</label>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
               <div className="relative flex-1">
                 <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                 <input 
                    type="text" 
                    placeholder="Search NYSE / NASDAQ (e.g. AAPL, TSLA, BTC)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={selectedStocks.length >= 4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all disabled:opacity-50"
                 />
               </div>
               <button 
                  type="submit" 
                  disabled={isSearching || selectedStocks.length >= 4}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-all flex items-center gap-2"
               >
                 {isSearching ? <Icons.Clock className="animate-spin" size={18} /> : <Icons.Plus size={18} />}
                 {isSearching ? '...' : 'Add'}
               </button>
            </form>
            {error && <p className="text-red-400 text-[10px] font-bold mb-2 animate-in fade-in">{error}</p>}

            {/* Selection Grid */}
            <div className="grid grid-cols-2 gap-3">
              {selectedStocks.map(stock => (
                <div key={stock.ticker} className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex justify-between items-center group animate-in zoom-in-95 duration-200">
                  <div>
                    <div className="font-bold text-white text-sm">{stock.ticker}</div>
                    <div className="text-[10px] text-gray-500">${stock.price.toFixed(2)}</div>
                  </div>
                  <button onClick={() => removeStock(stock.ticker)} className="text-gray-500 hover:text-red-400 p-1">
                    <Icons.TrendingDown size={14} className="rotate-45" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 4 - selectedStocks.length }).map((_, i) => (
                <div key={i} className="border border-dashed border-gray-700 rounded-xl p-3 flex items-center justify-center text-gray-700 text-[10px] font-bold uppercase">
                   Slot {selectedStocks.length + i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all">Cancel</button>
          <button 
            onClick={handleCreate}
            disabled={!title || selectedStocks.length !== 4}
            className="flex-[2] py-3 bg-alpha-success hover:bg-green-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-900/20"
          >
            Deploy Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;
