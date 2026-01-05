import React, { useState } from 'react';
import { Icons } from './Icons';

interface AdminPanelProps {
  isKOL: boolean;
  onVerifyKOL: (code: string) => boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isKOL, onVerifyKOL }) => {
  const [activationCode, setActivationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Admin Function
  const generateNewCode = () => {
    const code = 'ALPHA-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    setGeneratedCode(code);
  };

  // KOL Function
  const handleVerify = () => {
    const success = onVerifyKOL(activationCode);
    if (!success) {
      setError('Invalid Activation Code');
    } else {
      setActivationCode('');
      setError('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Verification Section (For potential KOLs) */}
      {!isKOL && (
        <div className="bg-alpha-card rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-alpha-gold/20 rounded-lg">
                <Icons.Lock className="text-alpha-gold" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">KOL Verification</h2>
                <p className="text-sm text-gray-400">Enter your invite code to unlock Portfolio Creation.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="Enter Code (Try 'ALPHA2024')"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-alpha-gold"
            />
            <button 
                onClick={handleVerify}
                className="bg-alpha-gold hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg transition-colors"
            >
              Verify
            </button>
          </div>
          {error && <p className="text-alpha-danger text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Admin Dashboard (Simulated) */}
      <div className="bg-alpha-card rounded-2xl p-6 border border-gray-700">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
                <Icons.ShieldCheck className="text-purple-400" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
                <p className="text-sm text-gray-400">Manage platform codes and users.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gray-800 p-4 rounded-xl">
                <h3 className="font-bold text-gray-300 mb-2">Code Generator</h3>
                <p className="text-xs text-gray-500 mb-4">Create unique one-time codes for influencers.</p>
                <button 
                    onClick={generateNewCode}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm mb-3"
                >
                    Generate New Code
                </button>
                {generatedCode && (
                    <div className="p-3 bg-black/50 border border-green-500/50 rounded text-center">
                        <span className="font-mono text-xl text-green-400 tracking-widest">{generatedCode}</span>
                        <p className="text-[10px] text-gray-500 mt-1">Copy and send to KOL</p>
                    </div>
                )}
             </div>

             <div className="bg-gray-800 p-4 rounded-xl">
                <h3 className="font-bold text-gray-300 mb-2">Platform Stats</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-white font-bold">12,403</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Volume</span>
                        <span className="text-white font-bold">$4.2M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Active Contests</span>
                        <span className="text-white font-bold">84</span>
                    </div>
                </div>
             </div>
          </div>
      </div>
      
      {isKOL && (
           <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center gap-3">
               <Icons.ShieldCheck className="text-green-500" />
               <div className="text-green-100 text-sm">
                   <strong>You are a verified KOL.</strong> You can now create public portfolios that users can back.
               </div>
           </div>
      )}
    </div>
  );
};

export default AdminPanel;