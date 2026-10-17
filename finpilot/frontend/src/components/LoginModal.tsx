import React, { useState } from 'react';
import { Cpu, Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin }) => {
  const [email, setEmail] = useState('tanvir@dhakasilicon.com');
  const [password, setPassword] = useState('password123');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('director') || email.includes('admin')) {
      onLogin({
        name: "Farhan Chowdhury",
        role: "Owner & Managing Director",
        email: email
      });
    } else {
      onLogin({
        name: "Tanvir Ahmed",
        role: "Salesman Lead",
        email: email
      });
    }
  };

  const handleQuickLogin = (role: 'salesman' | 'owner') => {
    if (role === 'salesman') {
      setEmail('tanvir@dhakasilicon.com');
      onLogin({
        name: "Tanvir Ahmed",
        role: "Salesman Lead",
        email: "tanvir@dhakasilicon.com"
      });
    } else {
      setEmail('director@dhakasilicon.com');
      onLogin({
        name: "Farhan Chowdhury",
        role: "Owner & Managing Director",
        email: "director@dhakasilicon.com"
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Dhaka Silicon & Hardware Ltd.</h2>
          <p className="text-xs text-slate-400 mt-1">Computer Components & Hardware Wholesale ERP</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
          >
            <span>Sign In to ERP Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Logins */}
        <div className="mt-6 pt-5 border-t border-[#30363d]/80">
          <div className="text-[11px] font-mono text-slate-400 text-center uppercase tracking-wider mb-2.5">
            1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('salesman')}
              className="p-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-left transition"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Tanvir Ahmed
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Salesman Lead</div>
            </button>
            <button
              onClick={() => handleQuickLogin('owner')}
              className="p-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-left transition"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Farhan C.
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Owner / MD</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
