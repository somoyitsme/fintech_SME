import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  User, 
  Cpu, 
  LogOut, 
  ChevronDown, 
  Check, 
  Search, 
  Bell, 
  MessageSquare, 
  Sun, 
  Moon, 
  Maximize2,
  X,
  Send,
  Truck,
  AlertTriangle,
  CreditCard,
  Package,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  companyName: string;
  industry: string;
  currency: string;
  healthScore: number;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSwitchUser?: (user: { name: string; role: string; email: string }) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyName,
  industry,
  currency,
  healthScore,
  userName = "Tanvir Ahmed",
  userRole = "Salesman Lead",
  userEmail = "tanvir@dhakasilicon.com",
  onLogout,
  onSwitchUser,
  isDarkMode = true,
  onToggleTheme
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(3);
  const [hasUnreadChat, setHasUnreadChat] = useState(true);

  // Quick Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Rahim (Banani Vault)', time: '10:45 AM', text: '10x ASUS ROG Motherboards received at Vault Shelf #M2.' },
    { id: 2, sender: 'Farhan (Director)', time: '11:15 AM', text: 'Corporate bulk quotations approved for 50x NVMe SSDs.' },
    { id: 3, sender: 'You', time: '11:30 AM', text: 'Steadfast Courier scheduled for Multiplan client delivery.' }
  ]);
  const [newChatText, setNewChatText] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setChatOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'You',
        time: 'Just now',
        text: newChatText.trim()
      }
    ]);
    setNewChatText('');
  };

  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const isOwner = userRole.toLowerCase().includes('owner') || 
                  userRole.toLowerCase().includes('director') || 
                  userRole.toLowerCase().includes('admin');

  return (
    <header className="h-16 bg-[#161b22]/95 backdrop-blur-md border-b border-[#30363d] sticky top-0 z-40 flex items-center justify-between px-6 ml-64">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search products, invoices, clients, or commands..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* BUTTON 1: Internal Store Chat (Staff Comms) */}
        <div className="relative" ref={chatRef}>
          <button
            onClick={() => {
              setChatOpen(!chatOpen);
              setAlertsOpen(false);
              setDropdownOpen(false);
              setHasUnreadChat(false);
            }}
            className={`p-2 rounded-xl transition relative ${
              chatOpen 
                ? 'bg-[#21262d] text-[#f0f6fc]' 
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
            title="Internal Store & Vault Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {hasUnreadChat && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute top-1 right-1 ring-2 ring-[#161b22]"></span>
            )}
          </button>

          {/* Chat Popover */}
          {chatOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#f0f6fc] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">Store & Vault Comms</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">● 4 Staff Active</span>
              </div>

              {/* Chat Thread */}
              <div className="my-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`p-2 rounded-xl text-xs ${
                    msg.sender === 'You' 
                      ? 'bg-blue-600/20 border border-blue-500/30 ml-4' 
                      : 'bg-[#0d1117] border border-[#30363d] mr-4'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] text-[#8b949e] mb-1 font-semibold">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="text-slate-200">{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Quick reply form */}
              <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-2 border-t border-[#30363d]">
                <input
                  type="text"
                  placeholder="Type staff broadcast message..."
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* BUTTON 2: Operational Alerts (Low stock, couriers, payments) */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setChatOpen(false);
              setDropdownOpen(false);
            }}
            className={`p-2 rounded-xl transition relative ${
              alertsOpen 
                ? 'bg-[#21262d] text-[#f0f6fc]' 
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
            title="Operational & Courier Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-1 ring-2 ring-[#161b22]"></span>
            )}
          </button>

          {/* Alerts Popover */}
          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#f0f6fc] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Real-time ERP Alerts</span>
                </div>
                {unreadAlerts > 0 ? (
                  <button
                    onClick={() => setUnreadAlerts(0)}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">All cleared</span>
                )}
              </div>

              {/* Alerts List */}
              <div className="my-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {/* Alert 1 */}
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-200">Low Stock Threshold Warning</div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      AMD Ryzen 7 7800X3D has only 9 units remaining in Banani Central Vault.
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">15 mins ago</span>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-200">Steadfast Courier Dispatched</div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Consignment #STEADFAST-DHK-48210 was handed to courier rider.
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">1 hour ago</span>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-200">bKash Payment Verified</div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Apex Computer Systems paid ৳ 280,770 for Order ORD-DS-2026-1049.
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative pl-3 border-l border-[#30363d]" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setChatOpen(false);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#21262d] transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="text-left text-xs leading-tight hidden sm:block">
              <div className="font-semibold text-[#f0f6fc] flex items-center gap-1">
                {userName}
                <ChevronDown className="w-3 h-3 text-[#8b949e]" />
              </div>
              <div className="text-[#8b949e] text-[10px] font-mono">
                {isOwner ? "Owner / Admin" : "Sales Staff"}
              </div>
            </div>
          </button>

          {/* Dropdown Menu - Styled with high z-index and clean backdrop */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl py-2 z-50 text-xs text-[#f0f6fc] animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-[#30363d]/70">
                <div className="font-semibold text-white">{userName}</div>
                <div className="text-[11px] text-[#8b949e] font-mono truncate">{userEmail}</div>
                <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                  isOwner
                    ? 'bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30'
                    : 'bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30'
                }`}>
                  {userRole}
                </div>
              </div>

              {/* Active Session Info */}
              <div className="px-4 py-2 text-[11px] text-[#8b949e] border-b border-[#30363d]/70 space-y-1">
                <div>Terminal: <span className="font-mono text-white">Banani Vault Terminal #01</span></div>
                <div>Status: <span className="text-emerald-400 font-semibold">● Active Session</span></div>
              </div>

              {/* Logout Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 text-left font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out / Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
