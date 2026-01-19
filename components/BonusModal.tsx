
import React from 'react';
import { Icons } from './Icons';

interface BonusModalProps {
  bonusAmount: number;
  streakDays: number;
  onClose: () => void;
}

const BonusModal: React.FC<BonusModalProps> = ({ bonusAmount, streakDays, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-alpha-accent/30 rounded-2xl max-w-sm w-full p-8 text-center relative shadow-2xl shadow-alpha-accent/10 transform scale-100 transition-all">
        
        {/* Confetti/Rays Effect Background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-alpha-accent/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10">
            <div className="w-20 h-20 bg-alpha-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-alpha-accent/10">
                <Icons.Trophy className="text-alpha-accent w-10 h-10 drop-shadow-lg" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Daily Reward!</h2>
            <p className="text-slate-400 text-sm mb-6">Thanks for coming back to Alpha Seeker.</p>

            <div className="flex justify-center items-center gap-6 mb-8">
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bonus</p>
                    <p className="text-2xl font-bold text-alpha-success">+${bonusAmount}</p>
                </div>
                <div className="w-px h-10 bg-slate-800"></div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Streak</p>
                    <div className="flex items-center gap-1 justify-center">
                         <Icons.Zap className="text-alpha-accent w-4 h-4" fill="currentColor" />
                         <p className="text-2xl font-bold text-white">{streakDays}</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-3 bg-alpha-accent hover:bg-alpha-accent/90 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-alpha-accent/20"
            >
                Claim Reward
            </button>
        </div>
      </div>
    </div>
  );
};

export default BonusModal;
