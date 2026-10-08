import { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MessageDetector } from './components/MessageDetector';
import { UrlChecker } from './components/UrlChecker';
import { LearningCenter } from './components/LearningCenter';
import { ScanHistory } from './components/ScanHistory';
import { PrivacyPage } from './components/PrivacyPage';
import { PrivacyModal } from './components/PrivacyModal';
import { 
  getScanHistory, 
  calculateSessionStats, 
  checkServerHealth 
} from './services/api';
import { HistoryItem, SessionStats } from './types';
import { Shield, Lock, EyeOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalScans: 0,
    highRiskScans: 0,
    suspiciousScans: 0,
    lowRiskScans: 0,
    quizzesAnswered: 0,
    quizzesCorrect: 0
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  // Synchronize stats and scan history from storage
  const refreshHistoryAndStats = () => {
    const history = getScanHistory();
    setHistoryItems(history);
    setSessionStats(calculateSessionStats(history));
  };

  useEffect(() => {
    refreshHistoryAndStats();

    // Check server backend health and Gemini availability
    checkServerHealth().then(status => {
      setIsAiEnabled(status.geminiConfigured);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sessionScanCount={historyItems.length}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        isAiEnabled={isAiEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            stats={sessionStats}
            recentScans={historyItems}
            onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          />
        )}

        {activeTab === 'message-detector' && (
          <MessageDetector
            onScanCompleted={refreshHistoryAndStats}
          />
        )}

        {activeTab === 'url-checker' && (
          <UrlChecker
            onScanCompleted={refreshHistoryAndStats}
          />
        )}

        {activeTab === 'learning-center' && (
          <LearningCenter />
        )}

        {activeTab === 'scan-history' && (
          <ScanHistory
            onHistoryUpdated={refreshHistoryAndStats}
            onNavigateToMessage={() => setActiveTab('message-detector')}
            onNavigateToUrl={() => setActiveTab('url-checker')}
          />
        )}

        {activeTab === 'privacy-page' && (
          <PrivacyPage
            onHistoryCleared={refreshHistoryAndStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">CyberShield AI</span>
            <span>— Beginner-Friendly Cybersecurity Awareness & Threat Assessment</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('privacy-page')}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Privacy & Account Governance</span>
            </button>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSRF Protected • Strict RBAC</span>
            </div>
            <span className="text-slate-700">•</span>
            <span className="font-mono text-slate-500">v1.1.0</span>
          </div>
        </div>
      </footer>

      {/* Privacy and Security Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

    </div>
  );
}
