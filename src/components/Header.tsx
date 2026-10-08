import React, { useState } from 'react';
import { 
  Shield, 
  MessageSquareWarning, 
  Link, 
  GraduationCap, 
  History, 
  LayoutDashboard, 
  Menu, 
  X, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'message-detector' | 'url-checker' | 'learning-center' | 'scan-history' | 'privacy-page';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sessionScanCount: number;
  onOpenPrivacyModal: () => void;
  isAiEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sessionScanCount,
  onOpenPrivacyModal,
  isAiEnabled
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'message-detector' as ActiveTab, label: 'Scam Detector', icon: MessageSquareWarning },
    { id: 'url-checker' as ActiveTab, label: 'Phishing URL Checker', icon: Link },
    { id: 'learning-center' as ActiveTab, label: 'Learning Center', icon: GraduationCap },
    { 
      id: 'scan-history' as ActiveTab, 
      label: 'Scan History', 
      icon: History,
      badge: sessionScanCount > 0 ? sessionScanCount : undefined
    },
    { id: 'privacy-page' as ActiveTab, label: 'Privacy & Account', icon: UserCheck }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    CyberShield<span className="text-cyan-400 font-mono">.AI</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Defensive Engine
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Security Awareness & Scam Defense
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right utility items */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-800 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isAiEnabled ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className="font-mono">{isAiEnabled ? 'AI Enhanced' : 'Heuristic Mode'}</span>
            </div>

            <button
              onClick={onOpenPrivacyModal}
              className="px-3 py-1.5 text-xs rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Privacy & Notice</span>
            </button>
          </div>

          {/* Mobile / Tablet menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-2">
            <button
              onClick={() => {
                onOpenPrivacyModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Privacy Policy & Security Boundaries
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              {isAiEnabled ? 'AI Enhanced' : 'Heuristic Mode'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
