import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Globe, 
  Lock, 
  Unlock, 
  Server, 
  FileCode, 
  Copy, 
  Check, 
  Info,
  Lightbulb,
  Zap
} from 'lucide-react';
import { UrlAnalysisResult } from '../types';
import { RiskMeter } from './RiskMeter';
import { ActionableSuggestions } from './ActionableSuggestions';
import { analyzeUrl, addUrlToHistory } from '../services/api';
import { SAMPLE_URLS, UrlSample } from '../data/sampleCases';
import { MAX_URL_LENGTH } from '../utils/security';

interface UrlCheckerProps {
  onScanCompleted?: () => void;
  initialUrl?: string;
}

export const UrlChecker: React.FC<UrlCheckerProps> = ({ 
  onScanCompleted,
  initialUrl = '' 
}) => {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (urlToScan?: string) => {
    const url = (urlToScan ?? inputUrl).trim();
    if (!url) {
      setErrorMessage('Please enter or paste a web address (URL) to analyze.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const scanResult = await analyzeUrl(url);
      setResult(scanResult);
      addUrlToHistory(url, scanResult);
      if (onScanCompleted) {
        onScanCompleted();
      }
    } catch {
      setErrorMessage('Failed to parse and analyze URL structure. Check format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: UrlSample) => {
    setInputUrl(sample.url);
    setErrorMessage(null);
    handleAnalyze(sample.url);
  };

  const handleClear = () => {
    setInputUrl('');
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `[CyberShield AI Phishing URL Assessment]
Target URL: ${result.url}
Verdict: ${result.verdictLabel} (Risk Score: ${result.riskScore}/100)
Protocol: ${result.isHttps ? 'HTTPS (Encrypted)' : 'HTTP (Unencrypted)'}
Hostname: ${result.hostname}

Findings:
${result.findings.map(f => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.explanation}`).join('\n')}

Recommendations:
${result.safeRecommendations.map(r => `- ${r}`).join('\n')}

Notice: Pattern-based checks cannot guarantee that an external web page is free of compromise.`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Zero-Connect Safe Inspection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Phishing URL Checker
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Inspect suspicious web addresses for IP-based hostnames, brand typosquatting, hidden URL shorteners, deceptive @ symbols, and malicious file downloads.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-cyan-500/20 text-xs text-cyan-300 max-w-xs flex gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
            <span>
              <strong>Safe Sandboxed Analysis:</strong> We do <span className="underline decoration-cyan-500">not</span> visit, curl, or execute submitted URLs, shielding your IP address.
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-4">
        
        {/* Sample presets bar */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Scenarios & Sample Links (Click to inspect):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((s) => {
              const badgeColor = s.type === 'malicious' 
                ? 'border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20'
                : s.type === 'suspicious'
                ? 'border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20';

              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${badgeColor}`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Client-Side Privacy Notice */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-300">Privacy & Sandboxing:</strong> Zero user credentials, accounts, or phone numbers are collected to inspect URLs. Inspection runs safely without connecting to the destination server.
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                if (e.target.value.length <= MAX_URL_LENGTH) {
                  setInputUrl(e.target.value);
                  setErrorMessage(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="Paste or type suspicious URL (e.g. paypa1-verify-account.com/login or http://192.168.1.1/...)"
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 pl-10 pr-4 py-3.5 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading || !inputUrl.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting URL...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze URL</span>
                </>
              )}
            </button>

            {inputUrl && (
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="px-4 py-3.5 rounded-xl font-medium text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Clear input"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-400">
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 shrink-0">
                  URL Inspection
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-cyan-300 truncate bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {result.url}
                </span>
                {result.executionTimeMs !== undefined && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono border border-slate-700 shrink-0" title="Measured scan response time">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>{result.executionTimeMs}ms {result.isCached ? '(Cached)' : ''}</span>
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleCopyReport}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Report Copied' : 'Copy Report'}</span>
              </button>
            </div>

            {/* Visual Risk Meter */}
            <RiskMeter score={result.riskScore} verdictLabel={result.verdictLabel} />

            {/* Structural Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  {result.isHttps ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Protocol</span>
                </div>
                <div className={`text-sm font-mono font-bold ${result.isHttps ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {result.protocol.toUpperCase().replace(':', '') || 'UNKNOWN'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {result.isHttps ? 'Encrypted Channel' : 'Insecure Plaintext'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Host Type</span>
                </div>
                <div className="text-sm font-mono font-bold text-white truncate" title={result.hostname}>
                  {result.isIpAddress ? 'Raw IP Host' : 'Named Domain'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {result.hostname}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shortener / Cloak</span>
                </div>
                <div className={`text-sm font-mono font-bold ${result.isUrlShortener ? 'text-amber-300' : 'text-slate-300'}`}>
                  {result.isUrlShortener ? 'Detected' : 'Standard'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {result.isUrlShortener ? 'Destination Hidden' : 'Direct Target'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>File Extension</span>
                </div>
                <div className={`text-sm font-mono font-bold ${result.hasSuspiciousFileExtension ? 'text-rose-400' : 'text-slate-300'}`}>
                  {result.hasSuspiciousFileExtension ? 'Dangerous File' : 'Standard Web Page'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {result.hasSuspiciousFileExtension ? 'Executable Download' : 'Web Resource'}
                </div>
              </div>
            </div>

            {/* Verdict Explanation */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Structural Assessment Summary
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {result.verdictDescription}
              </p>
            </div>

            {/* Detailed Findings */}
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Structural Inspection Findings ({result.findings.length})</span>
              </div>

              {result.findings.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-200">No Structural Red Flags Detected</strong>
                    <span className="text-xs text-emerald-300/90">
                      Standard HTTPS protocol and valid domain syntax without detected typosquatting, raw IP addresses, or dangerous payload extensions.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.findings.map((f) => {
                    const badgeStyles =
                      f.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : f.severity === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : f.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

                    return (
                      <div
                        key={f.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-white text-sm">
                            {f.title}
                          </span>
                          <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {f.explanation}
                        </p>
                        {f.detail && (
                          <div className="text-xs font-mono text-cyan-300/80 pt-1">
                            Technical Detail: <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{f.detail}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safe Handling Advice</span>
              </div>

              <div className="space-y-2">
                {result.safeRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crucial Safety Notice */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 block mb-0.5">Verification Disclaimer:</strong>
                Pattern-based heuristic inspection cannot guarantee a website is completely benign. Compromised servers belonging to genuine companies can temporarily host phishing pages. Always inspect the browser address bar and security certificates before signing into accounts.
              </div>
            </div>

          </div>

          {/* Actionable Safety Suggestions ("What Should You Do Next?") */}
          {result.actionableSteps && result.actionableSteps.length > 0 && (
            <ActionableSuggestions
              steps={result.actionableSteps}
              riskScore={result.riskScore}
            />
          )}
        </div>
      )}

    </div>
  );
};
