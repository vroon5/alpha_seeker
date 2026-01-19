
import React from 'react';
import { GameRoom } from '../types';
import { Icons } from './Icons';

interface GameRoomCardProps {
    room: GameRoom;
    onJoin?: (id: string) => void;
    onView?: (room: GameRoom) => void;
    isJoined?: boolean;
}

const GameRoomCard: React.FC<GameRoomCardProps> = ({ room, onJoin, onView, isJoined }) => {
    const handleJoin = (e: React.MouseEvent) => {
        e.stopPropagation();
        onJoin && onJoin(room.id);
    };

    const getContestLabel = () => {
        switch (room.contestId) {
            case 'c1': return { label: 'Daily', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
            case 'c2': return { label: 'Monthly', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
            case 'c3': return { label: 'Yearly', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
            default: return null;
        }
    };

    const contestInfo = getContestLabel();

    return (
        <div 
            onClick={() => onView && onView(room)}
            className="bg-alpha-card border border-gray-700 rounded-xl overflow-hidden hover:border-alpha-accent/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-black/50 p-4 relative"
        >
            {contestInfo && (
                <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold border ${contestInfo.color}`}>
                    {contestInfo.label}
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <img src={room.avatar} alt={room.name} className="w-12 h-12 rounded-xl object-cover border border-gray-600" />
            </div>
            
            <div className="mb-2">
                {room.isPrivate ? (
                     <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-md text-[9px] text-gray-400 font-bold uppercase tracking-wider border border-gray-700 mb-1">
                        <Icons.Lock size={10} /> Private
                     </div>
                ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-alpha-accent/10 rounded-md text-[9px] text-alpha-accent font-bold uppercase tracking-wider border border-alpha-accent/20 mb-1">
                        <Icons.Globe size={10} /> Public
                     </div>
                )}
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-alpha-accent transition-colors">{room.name}</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{room.description}</p>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1" title="Members"><Icons.Users size={12}/> {room.memberCount}</span>
                    
                    {/* Suitcase Button / Indicator reflecting portfolio count */}
                    <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-alpha-gold font-bold border border-gray-700 group-hover:border-alpha-gold/50 transition-colors">
                        <Icons.Briefcase size={12}/> 
                        <span>{room.portfolioCount}</span>
                    </div>
                </div>
                <button 
                    onClick={handleJoin}
                    disabled={isJoined}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors z-10 ${
                        isJoined 
                        ? 'bg-alpha-success/20 text-alpha-success cursor-default' 
                        : 'bg-gray-700 hover:bg-white hover:text-black text-white'
                    }`}
                >
                    {isJoined ? 'Joined' : (room.isPrivate ? 'Request' : 'Join')}
                </button>
            </div>
        </div>
    );
};

export default GameRoomCard;
