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
      {/* Top Bar for Mobile/Desktop Balance Display */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-alpha-card/90 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(View.HOME)}>
          <div className="w-8 h-8 bg-gradient-to-tr from-alpha-success to-alpha-accent rounded-lg flex items-center justify-center">
            <Icons.Zap className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">Alpha<span className="text-alpha-success">Seeker</span></span>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Streak Indicator */}
           {streakDays > 0 && (
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-orange-900/20 border border-orange-500/30 rounded-full" title="Daily Login Streak">
               <Icons.Zap size={14} className="text-orange-500 fill-orange-500" />
               <span className="text-orange-200 font-bold text-xs">{streakDays} Day Streak</span>
             </div>
           )}

          <div className="bg-gray-800 rounded-full px-3 py-1 flex items-center gap-2 border border-gray-700">
            <Icons.Wallet className="text-alpha-gold" size={16} />
            <span className="font-mono font-bold text-alpha-gold">${virtualBalance.toFixed(2)}</span>
          </div>
          <button onClick={() => setView(View.ADMIN)} className="p-2 text-gray-400 hover:text-white">
            <Icons.ShieldCheck size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-alpha-card border-t border-gray-700 flex sm:hidden items-center justify-around z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === item.view ? 'text-alpha-accent' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden sm:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-alpha-card border-r border-gray-700 p-4 z-40">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentView === item.view 
                  ? 'bg-alpha-accent/10 text-alpha-accent border border-alpha-accent/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="p-4 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30">
            <h4 className="text-sm font-bold text-white mb-1">Go Pro</h4>
            <p className="text-xs text-indigo-200 mb-3">Unlock real-money contests & detailed analytics.</p>
            <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;