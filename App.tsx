
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PortfolioCard from './components/PortfolioCard';
import PortfolioDetailView from './components/PortfolioDetailView';
import WatchlistPanel from './components/WatchlistPanel';
import AdminPanel from './components/AdminPanel';
import BonusModal from './components/BonusModal';
import GameRoomCard from './components/GameRoomCard';
import GameRoomDetailView from './components/GameRoomDetailView';
import { View, Portfolio, WatchlistItem, GameRoom } from './types';
import { MOCK_PORTFOLIOS, MOCK_GAME_ROOMS } from './services/mockData';
import { Icons } from './components/Icons';
import { fetchStockQuote } from './services/stockData';

const CONTEST_TYPES = [
  { 
    id: 'daily', 
    title: 'Daily Sprint', 
    prize: '1,000', 
    expiry: '1 Day', 
    entry: 'Free',
    color: 'from-orange-500 to-red-600',
    icon: <Icons.Zap size={24} className="text-white" />,
    description: 'Fast-paced action. Highest intraday gainer wins.'
  },
  { 
    id: 'monthly', 
    title: 'Monthly Marathon', 
    prize: '5,000', 
    expiry: '1 Month', 
    entry: '$10',
    color: 'from-blue-600 to-indigo-600',
    icon: <Icons.Trophy size={24} className="text-white" />,
    description: 'Strategy pays off. Best 30-day performance.'
  },
  { 
    id: 'yearly', 
    title: 'Legends League', 
    prize: '50,000', 
    expiry: '1 Year', 
    entry: '$100',
    color: 'from-purple-600 to-fuchsia-600',
    icon: <Icons.Crown size={24} className="text-white" />,
    description: 'For the long-term visionaries. High stakes.'
  },
];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [virtualBalance, setVirtualBalance] = useState(100);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(MOCK_PORTFOLIOS);
  const [gameRooms, setGameRooms] = useState<GameRoom[]>(MOCK_GAME_ROOMS);
  const [backedIds, setBackedIds] = useState<string[]>([]);
  const [isKOL, setIsKOL] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  
  // Navigation State
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedGameRoom, setSelectedGameRoom] = useState<GameRoom | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'PORTFOLIOS' | 'ROOMS'>('PORTFOLIOS');

  // UI States
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
      { id: '1', ticker: 'TSLA', quantity: 10, avgPrice: 165.00 }
  ]);

  const [selectedContestFilter, setSelectedContestFilter] = useState<string>('All');

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Function to sync all unique tickers across watchlists and portfolios
  const syncAllPrices = async () => {
    const allTickers = new Set<string>();
    watchlist.forEach(item => allTickers.add(item.ticker));
    portfolios.forEach(p => p.stocks.forEach(s => allTickers.add(s.ticker)));
    
    setIsSyncingPrices(true);
    try {
      // Map tickers to their new quotes
      const quotesMap: Record<string, any> = {};
      await Promise.all(Array.from(allTickers).map(async (ticker) => {
        const res = await fetchStockQuote(ticker);
        quotesMap[ticker] = res.stock;
      }));

      // Update portfolios
      setPortfolios(prev => prev.map(p => ({
        ...p,
        stocks: p.stocks.map(s => quotesMap[s.ticker] || s)
      })));

      // Update watchlist
      setWatchlist(prev => prev.map(item => {
        const newStock = quotesMap[item.ticker];
        if (newStock) {
          return { 
            ...item, 
            currentPrice: newStock.price, 
            dayChangePercent: newStock.changePercent 
          };
        }
        return item;
      }));

      // If viewing a portfolio, sync it too
      if (selectedPortfolio) {
        setSelectedPortfolio(prev => {
          if (!prev) return null;
          return {
            ...prev,
            stocks: prev.stocks.map(s => quotesMap[s.ticker] || s)
          };
        });
      }

    } catch (err) {
      console.error("Price sync failed", err);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // INITIAL PRICE SYNC
  useEffect(() => {
    syncAllPrices();
  }, []);

  // PERIODIC SYNC: Every 60 seconds (conservative to respect Gemini rate limits)
  useEffect(() => {
    const interval = setInterval(() => {
      syncAllPrices();
    }, 60000);
    return () => clearInterval(interval);
  }, [watchlist, portfolios, selectedPortfolio]);

  useEffect(() => {
      const checkLoginBonus = () => {
          const lastLogin = localStorage.getItem('alpha_last_login');
          const currentStreak = parseInt(localStorage.getItem('alpha_streak') || '0');
          const today = new Date().toDateString();

          if (lastLogin !== today) {
              let newStreak = 1;
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (lastLogin === yesterday.toDateString()) {
                  newStreak = currentStreak + 1;
              }

              const baseBonus = 10;
              const streakBonus = Math.min(newStreak * 2, 50);
              const totalBonus = baseBonus + streakBonus;

              setVirtualBalance(prev => prev + totalBonus);
              setStreakDays(newStreak);
              setBonusAmount(totalBonus);
              setShowBonusModal(true);

              localStorage.setItem('alpha_last_login', today);
              localStorage.setItem('alpha_streak', newStreak.toString());
          } else {
              setStreakDays(currentStreak);
          }
      };

      checkLoginBonus();
  }, []);

  const handleBackPortfolio = (id: string, amount: number) => {
    if (virtualBalance < amount) {
      addToast("Insufficient virtual balance!", "error");
      return;
    }
    setVirtualBalance(prev => prev - amount);
    setBackedIds(prev => [...prev, id]);
    
    setPortfolios(prev => prev.map(p => 
        p.id === id ? { ...p, backers: p.backers + 1 } : p
    ));
    addToast(`Successfully backed portfolio with $${amount}!`, "success");
  };

  const handleAddToWatchlist = (ticker: string, quantity: number, avgPrice: number) => {
      const newItem: WatchlistItem = {
          id: Date.now().toString(),
          ticker,
          quantity,
          avgPrice,
          currentPrice: avgPrice
      };
      setWatchlist(prev => [...prev, newItem]);
      addToast(`${ticker} added to your watchlist.`, "success");
  };

  const verifyKOL = (code: string) => {
      if (code === 'ALPHA2024') {
          setIsKOL(true);
          addToast("KOL Status Verified!", "success");
          return true;
      }
      return false;
  };

  const handleViewPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleViewGameRoom = (room: GameRoom) => {
      setSelectedGameRoom(room);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavChange = (view: View) => {
    setCurrentView(view);
    setSelectedPortfolio(null);
    setSelectedGameRoom(null);
    setSelectedContestFilter('All');
    setSearchQuery('');
  };

  const filteredPortfolios = (currentView === View.CONTESTS && selectedContestFilter !== 'All') 
    ? portfolios.filter(p => p.expiry === selectedContestFilter)
    : searchQuery && searchType === 'PORTFOLIOS'
      ? portfolios.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.kolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.stocks.some(s => s.ticker.includes(searchQuery.toUpperCase()))
        )
      : portfolios;

  const filteredGameRooms = searchQuery && searchType === 'ROOMS'
    ? gameRooms.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : gameRooms;

  const renderContent = () => {
    if (selectedPortfolio) {
      return (
        <PortfolioDetailView 
          portfolio={selectedPortfolio}
          onBack={() => setSelectedPortfolio(null)}
          onWager={handleBackPortfolio}
          userBalance={virtualBalance}
          isBacked={backedIds.includes(selectedPortfolio.id)}
        />
      );
    }
    
    if (selectedGameRoom) {
        return (
            <GameRoomDetailView 
                room={selectedGameRoom}
                portfolios={portfolios}
                onBack={() => setSelectedGameRoom(null)}
                onJoin={(id) => addToast("Join request sent!", "info")}
                onViewPortfolio={handleViewPortfolio}
                onBackPortfolio={handleBackPortfolio}
                userBalance={virtualBalance}
                backedIds={backedIds}
            />
        );
    }

    switch (currentView) {
      case View.HOME:
        return (
          <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
            <div className="relative rounded-2xl overflow-hidden glass p-6 sm:p-10 border-blue-500/30 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
                  BETA ACCESS V1.0
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  Track. Compete. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-alpha-success to-alpha-accent">Real-Time Markets.</span>
                </h1>
                
                <div className="w-full max-w-lg mt-8 bg-black/40 p-2 rounded-2xl border border-gray-600 backdrop-blur-xl">
                   <div className="relative flex items-center mb-2">
                       <Icons.Search className="absolute left-3 text-gray-400" size={20} />
                       <input 
                          type="text" 
                          placeholder={searchType === 'PORTFOLIOS' ? "Search portfolios, tickers, KOLs..." : "Search game rooms & private groups..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-transparent border-none text-white pl-10 pr-4 py-3 focus:outline-none placeholder-gray-500 font-medium"
                       />
                   </div>
                   <div className="flex gap-2">
                       <button 
                         onClick={() => setSearchType('PORTFOLIOS')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${searchType === 'PORTFOLIOS' ? 'bg-alpha-accent text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'}`}
                       >
                           Public Portfolios
                       </button>
                       <button 
                         onClick={() => setSearchType('ROOMS')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${searchType === 'ROOMS' ? 'bg-alpha-accent text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'}`}
                       >
                           Game Rooms
                       </button>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-alpha-accent/10 rounded-full blur-[100px] animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-20 w-48 h-48 bg-alpha-success/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {searchQuery ? <Icons.Search className="text-alpha-accent" /> : <Icons.Flame className="text-orange-500 animate-pulse" />}
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {searchType === 'PORTFOLIOS' ? (searchQuery ? 'Portfolio Results' : 'Trending Portfolios') : (searchQuery ? 'Game Room Results' : 'Active Game Rooms')}
                            {isSyncingPrices && <span className="text-xs font-normal text-alpha-accent animate-pulse flex items-center gap-1"><Icons.Clock size={12}/> Syncing real-time prices...</span>}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchType === 'PORTFOLIOS' ? 
                        filteredPortfolios.map(p => <PortfolioCard key={p.id} portfolio={p} onBack={handleBackPortfolio} isBacked={backedIds.includes(p.id)} userBalance={virtualBalance} onView={handleViewPortfolio} />) :
                        filteredGameRooms.map(r => <GameRoomCard key={r.id} room={r} onJoin={() => addToast("Join request sent!", "info")} onView={handleViewGameRoom} />)
                    }
                    {((searchType === 'PORTFOLIOS' && filteredPortfolios.length === 0) || (searchType === 'ROOMS' && filteredGameRooms.length === 0)) && (
                        <div className="col-span-full text-center py-20 text-gray-500 border border-gray-800 border-dashed rounded-2xl bg-gray-900/20">
                            No results found for "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>
          </div>
        );

      case View.CONTESTS:
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Contest Lobby</h1>
                        <p className="text-gray-400">Battle it out with top-tier strategies.</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-1 flex border border-gray-700">
                         <button className="px-4 py-2 bg-gray-700 rounded-lg text-xs font-bold text-white shadow-md">Public</button>
                         <button className="px-4 py-2 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-400">Private Leagues</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CONTEST_TYPES.map(c => (
                        <div key={c.id} onClick={() => setSelectedContestFilter(c.expiry)} className={`relative cursor-pointer group rounded-2xl p-6 border transition-all duration-300 ${selectedContestFilter === c.expiry ? 'bg-gray-800 border-alpha-accent ring-2 ring-alpha-accent/20' : 'bg-alpha-card border-gray-700 hover:border-gray-500'}`}>
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${c.color} shadow-lg mb-6 w-fit animate-float`}>{c.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
                            <p className="text-sm text-gray-400 mb-6">{c.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                <span className="text-alpha-gold font-bold text-lg">${c.prize}</span>
                                <span className="text-xs font-bold text-gray-500 bg-gray-900 px-3 py-1 rounded-full">{c.expiry}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPortfolios.map(p => <PortfolioCard key={p.id} portfolio={p} onBack={handleBackPortfolio} isBacked={backedIds.includes(p.id)} userBalance={virtualBalance} onView={handleViewPortfolio} />)}
                </div>
            </div>
        );
      
      case View.WATCHLIST:
        return <WatchlistPanel watchlist={watchlist} addToWatchlist={handleAddToWatchlist} />;

      case View.ADMIN:
        return <AdminPanel isKOL={isKOL} onVerifyKOL={verifyKOL} />;

      default:
        return <div className="text-center py-20 text-gray-500">View Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-alpha-dark text-gray-100 font-sans pb-20 sm:pb-0 sm:pl-64">
      <Navbar currentView={currentView} setView={handleNavChange} virtualBalance={virtualBalance} streakDays={streakDays} />
      <main className="pt-24 px-4 sm:px-8 max-w-7xl mx-auto pb-10">{renderContent()}</main>
      {showBonusModal && <BonusModal bonusAmount={bonusAmount} streakDays={streakDays} onClose={() => setShowBonusModal(false)} />}
      
      {/* Toast Notifications */}
      <div className="fixed bottom-20 sm:bottom-6 right-6 z-[100] flex flex-col gap-2">
          {toasts.map(t => (
              <div key={t.id} className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-10 glass border-l-4 ${t.type === 'success' ? 'border-alpha-success' : t.type === 'error' ? 'border-alpha-danger' : 'border-alpha-accent'}`}>
                  {t.type === 'success' ? <Icons.ShieldCheck className="text-alpha-success" size={20} /> : <Icons.Zap size={20} className="text-alpha-accent" />}
                  <span className="text-sm font-bold">{t.message}</span>
              </div>
          ))}
      </div>
    </div>
  );
}

export default App;
