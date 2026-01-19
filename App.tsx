
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from './components/Icons';
import Navbar from './components/Navbar';
import WatchlistPanel from './components/WatchlistPanel';
import PortfolioDetailView from './components/PortfolioDetailView';
import PortfolioCard from './components/PortfolioCard';
import AdminPanel from './components/AdminPanel';
import GameRoomCard from './components/GameRoomCard';
import GameRoomDetailView from './components/GameRoomDetailView';
import CreatePortfolioModal from './components/CreatePortfolioModal';
import { View, Portfolio, Stock, Contest, WatchlistItem, GameRoom } from './types';
import { INITIAL_PORTFOLIOS, CONTEST_LOBBY, MOCK_GAME_ROOMS } from './services/mockData';
import { fetchPricesBatch, getLiveTick } from './services/stockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DISCOVER);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [gameRooms, setGameRooms] = useState<GameRoom[]>(MOCK_GAME_ROOMS);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: 'w1', ticker: 'NVDA', currentPrice: 0, dayChangePercent: 0 },
    { id: 'w2', ticker: 'AAPL', currentPrice: 0, dayChangePercent: 0 }
  ]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedGameRoom, setSelectedGameRoom] = useState<GameRoom | null>(null);
  const [discoverMode, setDiscoverMode] = useState<'PORTFOLIOS' | 'ROOMS'>('PORTFOLIOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuildingPortfolio, setIsBuildingPortfolio] = useState(false);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  
  const [balance, setBalance] = useState(100.00);
  const [streak, setStreak] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [backedIds, setBackedIds] = useState<string[]>([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);

  // Sync real-time prices for all visible assets using batch service
  const syncPrices = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    const uniqueTickers = Array.from(new Set([
      ...portfolios.flatMap(p => p.stocks.map(s => s.ticker)),
      ...watchlist.map(w => w.ticker)
    ])) as string[];

    try {
      const priceMap = await fetchPricesBatch(uniqueTickers);

      // Update Portfolios
      setPortfolios(prev => prev.map(p => {
        const updatedStocks = p.stocks.map(s => {
          const update = priceMap[s.ticker.toUpperCase()];
          return {
            ...s,
            price: update?.price || s.price || 0,
            changePercent: update?.change || s.changePercent || 0
          };
        });
        const validStocks = updatedStocks.filter(s => s.price > 0);
        const avgReturn = validStocks.length > 0 
          ? validStocks.reduce((sum, s) => sum + s.changePercent, 0) / validStocks.length 
          : 0;
        
        return {
          ...p,
          stocks: updatedStocks,
          totalReturn: Number(avgReturn.toFixed(2))
        };
      }));

      // Update Watchlist
      setWatchlist(prev => prev.map(w => {
        const update = priceMap[w.ticker.toUpperCase()];
        return {
          ...w,
          currentPrice: update?.price || w.currentPrice,
          dayChangePercent: update?.change || w.dayChangePercent
        };
      }));
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, portfolios, watchlist]);

  useEffect(() => {
    syncPrices();
  }, []);

  // Visual "Live" Ticking Effect for active prices
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolios(prev => prev.map(p => ({
        ...p,
        stocks: p.stocks.map(s => ({ ...s, price: getLiveTick(s.price) }))
      })));
      setWatchlist(prev => prev.map(w => ({
        ...w,
        currentPrice: w.currentPrice ? getLiveTick(w.currentPrice) : 0
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBackPortfolio = (id: string, amount: number) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setBackedIds(prev => [...prev, id]);
      setPortfolios(prev => prev.map(p => p.id === id ? { ...p, backers: p.backers + 1 } : p));
    }
  };

  const handleSaveBuiltPortfolio = (newPortfolio: Portfolio) => {
    setPortfolios(prev => [...prev, newPortfolio]);
    setIsBuildingPortfolio(false);
    if (newPortfolio.roomId) {
      setGameRooms(prev => prev.map(r => r.id === newPortfolio.roomId ? { ...r, portfolioCount: r.portfolioCount + 1 } : r));
    }
    syncPrices();
  };

  const handleAddToWatchlist = (ticker: string) => {
    const upper = ticker.toUpperCase();
    if (watchlist.some(w => w.ticker === upper)) return;
    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      ticker: upper,
      currentPrice: 0,
      dayChangePercent: 0
    };
    setWatchlist(prev => [...prev, newItem]);
    syncPrices();
  };

  const handleViewPortfolio = (p: Portfolio) => {
    setSelectedPortfolio(p);
  };

  const handleViewGameRoom = (room: GameRoom) => {
    setSelectedGameRoom(room);
  };

  const handleJoinRoom = (roomId: string) => {
    if (joinedRoomIds.includes(roomId)) return;
    setJoinedRoomIds(prev => [...prev, roomId]);
    setGameRooms(prev => prev.map(r => r.id === roomId ? { ...r, memberCount: r.memberCount + 1 } : r));
  };

  const filteredPortfolios = portfolios.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.stocks.some(s => s.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRooms = gameRooms.filter(r => 
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedContestId || r.contestId === selectedContestId)
  );

  const renderCurrentView = () => {
    if (selectedPortfolio) {
      return (
        <PortfolioDetailView 
          portfolio={selectedPortfolio} 
          onBack={() => setSelectedPortfolio(null)} 
          onWager={handleBackPortfolio} 
          userBalance={balance} 
          isBacked={backedIds.includes(selectedPortfolio.id)} 
        />
      );
    }

    if (selectedGameRoom) {
        return (
            <GameRoomDetailView 
                room={selectedGameRoom}
                portfolios={portfolios.filter(p => p.roomId === selectedGameRoom.id)}
                onBack={() => setSelectedGameRoom(null)}
                onJoin={handleJoinRoom}
                onViewPortfolio={handleViewPortfolio}
                onBackPortfolio={handleBackPortfolio}
                onBuildPortfolio={() => setIsBuildingPortfolio(true)}
                userBalance={balance}
                backedIds={backedIds}
                isJoined={joinedRoomIds.includes(selectedGameRoom.id)}
            />
        );
    }

    switch (currentView) {
      case View.DISCOVER:
      case View.HOME:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-alpha-card/50 border border-blue-500/10 rounded-3xl p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Beta Access V1.0</span>
                <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
                  Track. Compete.<br/><span className="text-blue-500">Real-Time Markets.</span>
                </h1>
                
                <div className="mt-8 bg-gray-900/80 rounded-2xl border border-gray-700 p-2 flex items-center gap-2 focus-within:border-blue-500/50 transition-all max-w-md">
                  <Icons.Search size={20} className="text-gray-500 ml-3" />
                  <input 
                    type="text" 
                    placeholder={`Search ${discoverMode === 'PORTFOLIOS' ? 'portfolios, tickers, KOLs...' : 'game rooms...'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-white outline-none flex-1 py-2 text-sm placeholder-gray-600 font-medium"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => { setDiscoverMode('PORTFOLIOS'); setSearchQuery(''); }}
                    className={`text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-lg ${discoverMode === 'PORTFOLIOS' ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-transparent text-gray-400 hover:bg-gray-800'}`}
                  >
                    Public Portfolios
                  </button>
                  <button 
                    onClick={() => { setDiscoverMode('ROOMS'); setSearchQuery(''); }}
                    className={`text-xs font-bold px-5 py-2 rounded-xl transition-all ${discoverMode === 'ROOMS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-transparent text-gray-400 hover:bg-gray-800'}`}
                  >
                    Game Rooms
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icons.Flame className="text-orange-500" /> {discoverMode === 'PORTFOLIOS' ? 'Trending Portfolios' : 'Active Game Rooms'}
                </h2>
                <div className="flex items-center gap-4">
                  {isSyncing && <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold"><Icons.Clock className="animate-spin" size={12} /> Syncing Prices...</div>}
                  <button onClick={syncPrices} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-all">Refresh All</button>
                </div>
              </div>

              {discoverMode === 'PORTFOLIOS' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPortfolios.length > 0 ? filteredPortfolios.map(p => (
                        <PortfolioCard 
                            key={p.id} 
                            portfolio={p} 
                            onBack={handleBackPortfolio}
                            isBacked={backedIds.includes(p.id)}
                            userBalance={balance}
                            onView={handleViewPortfolio}
                        />
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 font-medium border border-dashed border-gray-700 rounded-2xl">No portfolios found matching "{searchQuery}"</div>
                    )}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredRooms.length > 0 ? filteredRooms.map(r => (
                        <GameRoomCard 
                            key={r.id}
                            room={r}
                            onView={handleViewGameRoom}
                            onJoin={handleJoinRoom}
                            isJoined={joinedRoomIds.includes(r.id)}
                        />
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 font-medium border border-dashed border-gray-700 rounded-2xl">No game rooms found matching "{searchQuery}"</div>
                    )}
                  </div>
              )}
            </div>
          </div>
        );

      case View.CONTESTS:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Contest Lobby</h1>
                <p className="text-gray-400 text-sm">Join a specialized arena and compete for the leaderboard.</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 {selectedContestId && (
                    <button 
                        onClick={() => setSelectedContestId(null)} 
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                    >
                        <Icons.Plus className="rotate-45" size={12} /> Clear Filter
                    </button>
                 )}
                <div className="relative">
                    <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                    type="text" 
                    placeholder="Find a room..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all w-64"
                    />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONTEST_LOBBY.map(c => (
                <div 
                    key={c.id} 
                    onClick={() => setSelectedContestId(c.id === selectedContestId ? null : c.id)}
                    className={`bg-alpha-card border rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/20 transition-all cursor-pointer ${
                        selectedContestId === c.id ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10 shadow-2xl scale-[1.02]' : 'border-gray-700/50'
                    }`}
                >
                  <div className={`${c.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 transition-transform`}>
                    {c.icon === 'Zap' && <Icons.Zap size={24} className="text-white fill-white" />}
                    {c.icon === 'Trophy' && <Icons.Trophy size={24} className="text-white" />}
                    {c.icon === 'Crown' && <Icons.Crown size={24} className="text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
                  <p className="text-gray-400 text-xs mb-8 leading-relaxed">{c.description}</p>
                  <div className="pt-6 border-t border-gray-700/50 flex justify-between items-center">
                    <span className="text-xl font-bold text-yellow-500">{c.prize}</span>
                    <span className="bg-gray-900 text-[10px] font-bold text-gray-500 px-3 py-1 rounded-full">{c.expiry}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icons.Globe className="text-blue-500" /> {selectedContestId ? `Rooms in ${CONTEST_LOBBY.find(c => c.id === selectedContestId)?.title}` : 'Active Competition Rooms'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRooms.length > 0 ? filteredRooms.map(r => (
                    <GameRoomCard 
                        key={r.id}
                        room={r}
                        onView={handleViewGameRoom}
                        onJoin={handleJoinRoom}
                        isJoined={joinedRoomIds.includes(r.id)}
                    />
                )) : (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium border border-dashed border-gray-700 rounded-2xl">No competition rooms found for this category.</div>
                )}
              </div>
            </div>
          </div>
        );

      case View.WATCHLIST:
        return (
          <WatchlistPanel 
            watchlist={watchlist} 
            addToWatchlist={(ticker) => handleAddToWatchlist(ticker)} 
          />
        );
        
      case View.ADMIN:
        return <AdminPanel isKOL={false} onVerifyKOL={() => true} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-alpha-dark text-slate-200">
      <Navbar 
        currentView={currentView} 
        setView={(v) => { 
            setCurrentView(v); 
            setSelectedPortfolio(null); 
            setSelectedGameRoom(null); 
            setSearchQuery('');
            setSelectedContestId(null);
        }} 
        virtualBalance={balance} 
        streakDays={streak} 
      />
      <main className="sm:pl-64 pt-20 pb-20 sm:pb-10">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {renderCurrentView()}
        </div>
      </main>

      {isBuildingPortfolio && selectedGameRoom && (
        <CreatePortfolioModal 
          roomId={selectedGameRoom.id}
          onClose={() => setIsBuildingPortfolio(false)}
          onSave={handleSaveBuiltPortfolio}
        />
      )}
    </div>
  );
};

export default App;
