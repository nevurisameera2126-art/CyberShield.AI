import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  MessageSquareWarning, 
  Link as LinkIcon, 
  Clock, 
  Lock, 
  FileText, 
  Check, 
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { HistoryItem } from '../types';
import { 
  getScanHistory, 
  deleteHistoryItem, 
  clearAllHistory, 
  getPrivacySettings, 
  savePrivacySettings, 
  PrivacySettings 
} from '../services/api';

interface ScanHistoryProps {
  onHistoryUpdated?: () => void;
  onNavigateToMessage?: (snippet: string) => void;
  onNavigateToUrl?: (url: string) => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  onHistoryUpdated,
  onNavigateToMessage,
  onNavigateToUrl
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(getScanHistory());
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(getPrivacySettings());
  const [copiedExport, setCopiedExport] = useState(false);

  const handleDeleteItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    if (onHistoryUpdated) onHistoryUpdated();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all session scan records?')) {
      clearAllHistory();
      setHistoryItems([]);
      if (onHistoryUpdated) onHistoryUpdated();
    }
  };

  const handleToggleStorage = () => {
    const updated: PrivacySettings = {
      ...privacySettings,
      saveHistoryToStorage: !privacySettings.saveHistoryToStorage
    };
    savePrivacySettings(updated);
    setPrivacySettings(updated);
    if (!updated.saveHistoryToStorage) {
      setHistoryItems([]);
    }
    if (onHistoryUpdated) onHistoryUpdated();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybershield-scan-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySummary = () => {
    const textReport = historyItems.map((item, idx) => {
      const date = new Date(item.timestamp).toLocaleTimeString();
      return `${idx + 1}. [${item.type.toUpperCase()}] ${item.verdictLabel} (Score: ${item.riskScore}/100) at ${date}\n   Snippet: "${item.inputSnippet}"`;
    }).join('\n\n');

    navigator.clipboard.writeText(
      `CyberShield AI Session Scan Log (${historyItems.length} entries)\nGenerated: ${new Date().toLocaleString()}\n\n${textReport}`
    );
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Session Activity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Session Scan History
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Review and manage recent scans performed during your current browser session. Redacted previews ensure passwords and phone numbers are not exposed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {historyItems.length > 0 && (
              <>
                <button
                  onClick={handleCopySummary}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExport ? 'Copied' : 'Copy Log'}</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Control Box */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Ephemeral Session Storage
            </div>
            <div className="text-[11px] text-slate-400">
              History is stored only within this browser tab and wiped when closed. PII is automatically masked.
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleStorage}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700 transition-colors"
        >
          {privacySettings.saveHistoryToStorage ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-400" />
              <span>Saving Active</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-500" />
              <span className="text-slate-400">Disabled (Incognito)</span>
            </>
          )}
        </button>
      </div>

      {/* History Items Table / Cards */}
      {historyItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">No Scan History Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Scan a suspicious text message or analyze a web URL. Scans will be logged here for this active session.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => {
            const isHigh = item.riskScore >= 65;
            const isMedium = item.riskScore >= 30 && item.riskScore < 65;
            
            const badgeBorder = isHigh
              ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
              : isMedium
              ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
              : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10';

            const Icon = item.type === 'message' ? MessageSquareWarning : LinkIcon;

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase font-bold font-mono tracking-wider text-slate-400">
                        {item.type === 'message' ? 'Message Scan' : 'URL Scan'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBorder}`}>
                        {item.verdictLabel}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {item.riskScore}/100
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 font-mono truncate bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      "{item.inputSnippet}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>Length: {item.fullLength} chars</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete entry"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
