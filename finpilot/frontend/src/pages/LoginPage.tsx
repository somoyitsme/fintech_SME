import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Building2, 
  UserCheck, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { authApi } from '../api';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePortal, setActivePortal] = useState<'manager' | 'salesman'>('manager');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Please enter both your corporate email / username and workspace password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate directly against live SQLite database via db-server API
      const authRes = await authApi.login(cleanIdentifier, cleanPassword);

      if (authRes && authRes.user) {
        const user = {
          name: authRes.user.fullName || authRes.user.username,
          role: authRes.user.role === 'salesman' ? 'Salesman Lead' : 'Managing Director',
          email: authRes.user.email
        };

        if (rememberMe) {
          localStorage.setItem('dhaka_silicon_logged_user_v2', JSON.stringify(user));
          localStorage.setItem('dhaka_silicon_logged_user', JSON.stringify(user));
          if (authRes.token) {
            localStorage.setItem('finpilot_auth_token', authRes.token);
          }
        }

        onLogin(user);
      } else {
        throw new Error('Authentication returned an empty response.');
      }
    } catch (err: any) {
      console.warn('Login failure:', err);
      const msg = err.response?.data?.error || err.message || 'Invalid username or password';
      setErrorMessage(
        msg === 'Invalid username or password'
          ? 'Invalid corporate email / username or workspace password. Please verify your credentials and try again.'
          : `Authentication failed: ${msg}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,163,115,0.18),_transparent_35%),var(--bg-app)] text-content-primary flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-ochre/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-sage/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-ochre text-stone-950 font-extrabold flex items-center justify-center text-xl mx-auto mb-3.5 shadow-md shadow-brand-ochre/25 tracking-tight">
            DS
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-content-primary">
            Dhaka Silicon &amp; Hardware Ltd.
          </h1>
          <p className="text-xs text-content-muted mt-1 font-medium">
            Computer Hardware Wholesale &amp; Retail Enterprise ERP
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-boundary-subtle rounded-2xl p-6 sm:p-7 shadow-xl shadow-stone-900/5 backdrop-blur-md transition-colors">
          {/* Header & Portal Switcher */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-boundary-subtle">
            <div>
              <h2 className="text-sm font-bold text-content-primary">Enterprise Sign In</h2>
              <p className="text-[11px] text-content-muted">Access inventory, orders, and real-time ledger</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-status-successBg text-status-success flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Role Portal Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-secondary rounded-xl mb-4 border border-boundary-subtle text-xs">
            <button
              type="button"
              onClick={() => {
                setActivePortal('manager');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activePortal === 'manager'
                  ? 'bg-surface text-content-primary shadow-xs border border-boundary-subtle'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-brand-ochre" />
              <span>Manager / Owner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('salesman');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activePortal === 'salesman'
                  ? 'bg-surface text-content-primary shadow-xs border border-boundary-subtle'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-sageDark" />
              <span>Sales Staff &amp; POS</span>
            </button>
          </div>

          {/* Portal Information Banner */}
          <div className="mb-4 py-2 px-3 rounded-xl bg-surface-secondary/70 border border-boundary-subtle text-[11px] text-content-secondary flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-ochre shrink-0 mt-0.5" />
            {activePortal === 'manager' ? (
              <span><strong>Manager Portal:</strong> Complete executive access to financial health, P&amp;L reports, cash runway, and inventory.</span>
            ) : (
              <span><strong>Salesman Terminal:</strong> Focused access to Point of Sale (POS), customer orders, and live stock inquiries.</span>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-status-dangerBg border border-status-dangerBorder text-status-danger text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Corporate Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={
                    activePortal === 'manager'
                      ? 'e.g. director@dhakasilicon.com'
                      : 'e.g. sales@dhakasilicon.com'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-surface border border-boundary-subtle focus:border-brand-ochre rounded-xl pl-9 pr-4 py-2.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Workspace Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-boundary-subtle focus:border-brand-ochre rounded-xl pl-9 pr-10 py-2.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none transition font-sans"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-content-muted hover:text-content-primary transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-content-secondary hover:text-content-primary select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-boundary-strong text-brand-ochre focus:ring-0"
                />
                <span className="text-[11px]">Keep me signed in</span>
              </label>
              <span className="text-content-muted text-[10px] font-mono">
                Banani Central Vault #01
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-brand-ochre hover:bg-brand-ochreDark disabled:opacity-50 text-stone-950 rounded-xl text-xs font-bold shadow-sm shadow-brand-ochre/20 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating with Database...</span>
              ) : (
                <>
                  <span>Sign In to {activePortal === 'manager' ? 'Management Console' : 'POS Terminal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-content-muted mt-6">
          &copy; 2026 Dhaka Silicon &amp; Hardware Ltd. &middot; Multiplan Center &amp; Banani Central Vault, Dhaka
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
