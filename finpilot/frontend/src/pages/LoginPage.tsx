import React, { useState } from 'react';
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Verify authentic enterprise credentials
      if (
        (cleanEmail === 'director@dhakasilicon.com' || cleanEmail === 'admin@dhakasilicon.com' || cleanEmail === 'farhan@dhakasilicon.com') &&
        (cleanPass === 'admin123' || cleanPass === 'password123' || cleanPass === 'director123')
      ) {
        const user = {
          name: "Farhan Chowdhury",
          role: "Owner & Managing Director",
          email: cleanEmail
        };
        if (rememberMe) {
          localStorage.setItem('dhaka_silicon_logged_user', JSON.stringify(user));
        }
        onLogin(user);
      } else if (
        (cleanEmail === 'tanvir@dhakasilicon.com' || cleanEmail === 'sales@dhakasilicon.com' || cleanEmail === 'salesman@dhakasilicon.com') &&
        (cleanPass === 'sales123' || cleanPass === 'password123' || cleanPass === 'tanvir123')
      ) {
        const user = {
          name: "Tanvir Ahmed",
          role: "Salesman Lead",
          email: cleanEmail
        };
        if (rememberMe) {
          localStorage.setItem('dhaka_silicon_logged_user', JSON.stringify(user));
        }
        onLogin(user);
      } else {
        setErrorMessage("Invalid corporate email or password. Access denied. Please verify your credentials below.");
      }
    }, 600);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-xl shadow-cyan-500/10">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dhaka Silicon ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Computer Hardware Wholesale & Retail Enterprise Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#30363d]/80">
            <div>
              <h2 className="text-base font-bold text-white">Staff & Admin Authentication</h2>
              <p className="text-[11px] text-slate-400">Sign in to access POS, catalog, and wholesale ledger</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@dhakasilicon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Workspace Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0d1117] border-[#30363d] text-blue-600 focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-500 text-[11px] font-mono">Banani Vault Terminal #01</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to ERP Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Authorized Credentials Helper Guide */}
          <div className="mt-6 pt-5 border-t border-[#30363d]/70 space-y-2">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Authorized Corporate Accounts:
            </div>
            
            <button
              type="button"
              onClick={() => handleFillDemo('tanvir@dhakasilicon.com', 'sales123')}
              className="w-full p-2.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] flex items-center justify-between text-left text-xs transition"
            >
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Tanvir Ahmed</span>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.2 rounded font-mono font-normal">Sales Staff</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">tanvir@dhakasilicon.com · Pass: sales123</div>
              </div>
              <span className="text-[11px] text-blue-400 font-semibold hover:underline">Select</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('director@dhakasilicon.com', 'admin123')}
              className="w-full p-2.5 rounded-xl bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] flex items-center justify-between text-left text-xs transition"
            >
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Farhan Chowdhury</span>
                  <span className="text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800/50 px-1.5 py-0.2 rounded font-mono font-normal">Owner / Admin</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">director@dhakasilicon.com · Pass: admin123</div>
              </div>
              <span className="text-[11px] text-blue-400 font-semibold hover:underline">Select</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 mt-6">
          © 2026 Dhaka Silicon & Hardware Ltd. · All rights reserved · Multiplan Center & Banani Vault, Dhaka
        </div>
      </div>
    </div>
  );
};
