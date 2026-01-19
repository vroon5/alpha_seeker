
import React from 'react';
import { View } from '../types';
import { Icons } from './Icons';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  virtualBalance: number;
  streakDays?: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, virtualBalance, streakDays = 0 }) => {
  const navItems = [
    { view: View.HOME, label: 'Discover', icon: <Icons.Dashboard size={20} /> },
    { view: View.CONTESTS, label: 'Contests', icon: <Icons.Trophy size={20} /> },
    { view: View.WATCHLIST, label: 'Watchlist', icon: <Icons.Chart size={20} /> },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-alpha-card/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(View.HOME)}>
          <div className="w-8 h-8 bg-gradient-to-tr from-alpha-accent to-alpha-gold rounded-lg flex items-center justify-center shadow-lg shadow-alpha-accent/20">
            <Icons.Zap className="text-slate-950 fill-slate-950" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block text-white">Alpha<span className="text-alpha-accent">Seeker</span></span>
        </div>
        
        <div className="flex items-center gap-3">
           {streakDays > 0 && (
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-alpha-accent/10 border border-alpha-accent/30 rounded-full" title="Daily Login Streak">
               <Icons.Zap size={14} className="text-alpha-accent fill-alpha-accent" />
               <span className="text-alpha-accent font-bold text-xs">{streakDays} Day Streak</span>
             </div>
           )}

          <div className="bg-slate-950 rounded-full px-3 py-1 flex items-center gap-2 border border-slate-800 shadow-inner">
            <Icons.Wallet className="text-alpha-gold" size={16} />
            <span className="font-mono font-bold text-alpha-gold">${virtualBalance.toFixed(2)}</span>
          </div>
          <button onClick={() => setView(View.ADMIN)} className="p-2 text-slate-400 hover:text-alpha-accent transition-colors">
            <Icons.ShieldCheck size={20} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-alpha-card border-t border-slate-800 flex sm:hidden items-center justify-around z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              currentView === item.view ? 'text-alpha-accent' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="hidden sm:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-alpha-card border-r border-slate-800 p-4 z-40">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                currentView === item.view 
                  ? 'bg-alpha-accent/10 text-alpha-accent border-alpha-accent/30' 
                  : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="p-4 bg-gradient-to-br from-alpha-accent/10 to-alpha-gold/10 rounded-xl border border-alpha-accent/20">
            <h4 className="text-sm font-bold text-white mb-1">Go Pro</h4>
            <p className="text-xs text-slate-300 mb-3">Unlock real-money contests & detailed analytics.</p>
            <button className="w-full py-2 bg-alpha-accent hover:bg-alpha-accent/80 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
