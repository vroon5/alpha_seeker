import React from 'react';
import { GameRoom, Portfolio } from '../types';
import PortfolioCard from './PortfolioCard';
import { Icons } from './Icons';

interface GameRoomDetailViewProps {
  room: GameRoom;
  portfolios: Portfolio[]; // Portfolios belonging to this room
  onBack: () => void;
  onJoin: (id: string) => void;
  onViewPortfolio: (portfolio: Portfolio) => void;
  onBackPortfolio: (id: string, amount: number) => void;
  userBalance: number;
  backedIds: string[];
}

const GameRoomDetailView: React.FC<GameRoomDetailViewProps> = ({ 
    room, 
    portfolios, 
    onBack, 
    onJoin, 
    onViewPortfolio, 
    onBackPortfolio,
    userBalance,
    backedIds
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <div className="p-1 rounded-full bg-gray-800 group-hover:bg-gray-700">
             <Icons.TrendingDown className="rotate-90" size={16} />
        </div>
        <span className="font-bold text-sm">Back to Discover</span>
      </button>

      {/* Room Header */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-900 border border-gray-700 rounded-2xl p-8 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
             <img src={room.avatar} alt={room.name} className="w-24 h-24 rounded-2xl border-2 border-alpha-accent shadow-lg" />
             <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{room.name}</h1>
                    {room.isPrivate ? (
                        <span className="px-3 py-1 bg-gray-800 rounded-lg border border-gray-700 text-xs font-bold text-gray-400 flex items-center gap-1">
                            <Icons.Lock size={12} /> PRIVATE
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-alpha-accent/20 rounded-lg border border-alpha-accent/30 text-xs font-bold text-alpha-accent flex items-center gap-1">
                            <Icons.Globe size={12} /> PUBLIC
                        </span>
                    )}
                 </div>
                 <p className="text-gray-300 max-w-2xl mb-4">{room.description}</p>
                 
                 <div className="flex items-center gap-6 text-sm text-gray-400">
                     <div className="flex items-center gap-2">
                         <div className="p-2 bg-gray-800 rounded-lg text-alpha-gold"><Icons.Briefcase size={16} /></div>
                         <span className="font-bold text-white">{room.portfolioCount}</span> Portfolios
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="p-2 bg-gray-800 rounded-lg text-blue-400"><Icons.Users size={16} /></div>
                         <span className="font-bold text-white">{room.memberCount.toLocaleString()}</span> Members
                     </div>
                 </div>
             </div>
             
             <button 
                onClick={() => onJoin(room.id)}
                className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-white/10 whitespace-nowrap"
             >
                {room.isPrivate ? 'Request Access' : 'Join Room'}
             </button>
         </div>
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-alpha-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      {/* Room Portfolios */}
      <div>
         <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
             <Icons.Briefcase className="text-alpha-accent" /> Active Portfolios inside {room.name}
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(portfolio => (
                <PortfolioCard 
                  key={portfolio.id} 
                  portfolio={portfolio} 
                  onBack={onBackPortfolio}
                  isBacked={backedIds.includes(portfolio.id)}
                  userBalance={userBalance}
                  onView={onViewPortfolio}
                />
            ))}
         </div>
      </div>
    </div>
  );
};

export default GameRoomDetailView;