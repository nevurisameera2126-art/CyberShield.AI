import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  MessageSquareWarning, 
  Link as LinkIcon, 
  GraduationCap, 
  History, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Zap, 
  Flame, 
  Award,
  EyeOff,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from './Header';
import { HistoryItem, SessionStats } from '../types';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  stats: SessionStats;
  recentScans: HistoryItem[];
  onOpenPrivacyModal: () => void;
}

const CYBER_TIPS = [
  {
    title: 'The "Pause & Call" Rule',
    text: 'If a message claims your bank account is suspended, never use the link or phone number in that text. Open your banking app directly or call the number printed on the back of your physical debit card.',
    category: 'Smishing Defense'
  },
  {
    title: 'Check the Root Domain, Not Subdomains',
    text: 'In "login.wellsfargo.com.account-update.xyz", the actual destination is "account-update.xyz", NOT Wells Fargo. The true domain is always immediately to the left of the final ".com" or top-level extension.',
    category: 'URL Vigilance'
  },
  {
    title: 'Hardware & App-Based MFA Over SMS',
    text: 'Whenever possible, switch from SMS two-factor codes to an authenticator app (Google Authenticator) or security key. SMS is vulnerable to SIM-swapping attacks by mobile carrier impostors.',
    category: 'Account Hardening'
  },
  {
    title: 'Passphrases Trump Passwords',
    text: 'A passphrase of 4 random words (e.g. "sunset-purple-cactus-violin") has over 60 bits of entropy and is practically impossible to brute-force while remaining easy for humans to memorize.',
    category: 'Password Security'
  }
];

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  stats,
  recentScans,
  onOpenPrivacyModal
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  const currentTip = CYBER_TIPS[tipIndex % CYBER_TIPS.length];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % CYBER_TIPS.length);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Scam Defense & Education Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Protect Yourself from Digital Scams with Confidence
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            CyberShield AI combines instant structural heuristics with security reasoning to inspect suspicious messages and phishing links before you click.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('message-detector')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>Scan Suspicious Message</span>
            </button>

            <button
              onClick={() => setActiveTab('url-checker')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4 text-cyan-400" />
              <span>Check Suspicious Link</span>
            </button>

            <button
              onClick={() => setActiveTab('learning-center')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Learning Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-World Truthfulness Scope Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-3.5 text-xs text-slate-300">
        <EyeOff className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-sky-300 font-semibold block">
            Session Activity Scope (Privacy Guarantee)
          </strong>
          <span className="text-slate-400">
            The figures below reflect exclusively scans and quizzes executed in your current browser session. 
            CyberShield AI does <strong className="text-slate-200">not</strong> inspect background network packets, monitor device files, or track browsing habits.
          </span>
          <button
            onClick={onOpenPrivacyModal}
            className="text-cyan-400 hover:underline block pt-0.5 font-medium"
          >
            Read our complete Privacy & Limitations Policy →
          </button>
        </div>
      </div>

      {/* Session Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Session Scans */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-750 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Session Scans</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {stats.totalScans}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active inputs evaluated
          </div>
        </div>

        {/* High Risk Flags */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-750 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Potential Scams</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">
            {stats.highRiskScans}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Critical red flags identified
          </div>
        </div>

        {/* Suspicious Flags */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-750 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {stats.suspiciousScans}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Questionable anomalies
          </div>
        </div>

        {/* Clean / Low Risk */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-750 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Low Risk Scans</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {stats.lowRiskScans}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            No obvious scam traits
          </div>
        </div>

      </div>

      {/* Cyber Defense Tip of the Day */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Flame className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-bold font-mono tracking-wider text-cyan-400">
                Security Habit of the Day • {currentTip.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white pt-1">
              {currentTip.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {currentTip.text}
            </p>
          </div>

          <button
            onClick={handleNextTip}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Tip</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          CyberShield Defense Modules
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => setActiveTab('message-detector')}
            className="p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                AI Scam Message Detector
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Paste suspicious SMS, emails, or chat messages. Evaluates urgency hooks, OTP demands, and impersonation.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Open Message Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('url-checker')}
            className="p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                Phishing URL Checker
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Check links without visiting them. Inspects IP addresses, brand typosquatting, shorteners, and dangerous file extensions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Open URL Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('learning-center')}
            className="p-6 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Cybersecurity Learning Center
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                9 essential modules on phishing, ransomware, SQL injection, MFA, brute force, and social engineering with interactive quizzes.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Open Learning Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

        </div>
      </div>

      {/* Recent Session Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Recent Activity in This Session</span>
          </div>

          {recentScans.length > 0 && (
            <button
              onClick={() => setActiveTab('scan-history')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              View Full History ({recentScans.length}) →
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center space-y-2">
            <p className="text-sm text-slate-400">
              No scans performed yet in this browser session.
            </p>
            <p className="text-xs text-slate-500">
              Try analyzing a sample message or link using the quick actions above.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentScans.slice(0, 4).map((scan) => {
              const badgeColor = scan.riskLevel === 'high'
                ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                : scan.riskLevel === 'medium'
                ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10';

              return (
                <div
                  key={scan.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono uppercase font-bold text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                      {scan.type}
                    </span>
                    <span className="text-slate-300 font-mono truncate max-w-xs sm:max-w-md">
                      "{scan.inputSnippet}"
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full font-semibold border ${badgeColor}`}>
                      {scan.verdictLabel}
                    </span>
                    <span className="font-mono text-slate-400">
                      {scan.riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
