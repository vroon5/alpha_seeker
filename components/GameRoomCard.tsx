import React from 'react';
import { GameRoom } from '../types';
import { Icons } from './Icons';

interface GameRoomCardProps {
    room: GameRoom;
    onJoin?: (id: string) => void;
    onView?: (room: GameRoom) => void;
}

const GameRoomCard: React.FC<GameRoomCardProps> = ({ room, onJoin, onView }) => {
    const handleJoin = (e: React.MouseEvent) => {
        e.stopPropagation();
        onJoin && onJoin(room.id);
    };

    return (
        <div 
            onClick={() => onView && onView(room)}
            className="bg-alpha-card border border-gray-700 rounded-xl overflow-hidden hover:border-alpha-accent/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-black/50 p-4"
        >
            <div className="flex justify-between items-start mb-4">
                <img src={room.avatar} alt={room.name} className="w-12 h-12 rounded-xl object-cover border border-gray-600" />
                {room.isPrivate ? (
                     <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-wider border border-gray-700">
                        <Icons.Lock size={10} /> Private
                     </div>
                ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-alpha-accent/10 rounded-md text-[10px] text-alpha-accent font-bold uppercase tracking-wider border border-alpha-accent/20">
                        <Icons.Globe size={10} /> Public
                     </div>
                )}
            </div>
            
            <h3 className="font-bold text-white text-lg mb-1 group-hover:text-alpha-accent transition-colors">{room.name}</h3>
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
                    className="px-3 py-1.5 bg-gray-700 hover:bg-white hover:text-black text-white text-xs font-bold rounded-lg transition-colors z-10"
                >
                    {room.isPrivate ? 'Request' : 'Join'}
                </button>
            </div>
        </div>
    );
};

export default GameRoomCard;