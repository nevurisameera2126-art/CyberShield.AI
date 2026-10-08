import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Send, 
  RotateCcw, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  BrainCircuit, 
  Lightbulb, 
  Copy, 
  Check, 
  Info,
  ChevronRight,
  Zap,
  Lock
} from 'lucide-react';
import { MessageAnalysisResult } from '../types';
import { RiskMeter } from './RiskMeter';
import { ActionableSuggestions } from './ActionableSuggestions';
import { analyzeMessage, addMessageToHistory } from '../services/api';
import { SAMPLE_MESSAGES, MessageSample } from '../data/sampleCases';
import { MAX_MESSAGE_LENGTH } from '../utils/security';

interface MessageDetectorProps {
  onScanCompleted?: () => void;
  initialMessageText?: string;
}

export const MessageDetector: React.FC<MessageDetectorProps> = ({ 
  onScanCompleted,
  initialMessageText = '' 
}) => {
  const [inputText, setInputText] = useState(initialMessageText);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MessageAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (textToScan?: string) => {
    const text = (textToScan ?? inputText).trim();
    if (!text) {
      setErrorMessage('Please paste or type a message before requesting analysis.');
      return;
    }

    if (text.length < 3) {
      setErrorMessage('The message is too short for meaningful security analysis (minimum 3 characters).');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const scanResult = await analyzeMessage(text);
      setResult(scanResult);
      addMessageToHistory(text, scanResult);
      if (onScanCompleted) {
        onScanCompleted();
      }
    } catch {
      setErrorMessage('Failed to complete message analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: MessageSample) => {
    setInputText(sample.fullText);
    setErrorMessage(null);
    handleAnalyze(sample.fullText);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `[CyberShield AI Analysis Report]
Verdict: ${result.verdictLabel} (Risk Score: ${result.riskScore}/100)
Engine: ${result.analysisEngine === 'ai' ? 'Gemini AI Reasoning' : 'Heuristic Rules Engine'}

Warning Signs:
${result.warningSigns.map(w => `- [${w.severity.toUpperCase()}] ${w.title}: ${w.explanation}`).join('\n')}

Safe Next Steps:
${result.safeNextSteps.map(s => `- ${s.action} (${s.why})`).join('\n')}

Disclaimer: No scam analysis can guarantee 100% safety. Always verify independently through official channels.`;

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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Layer Scam Detection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Scam Message Detector
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Inspect suspicious SMS, WhatsApp, emails, or urgent texts for OTP requests, fake prizes, legal intimidation, unverified payment demands, and credential harvesting.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/20 text-xs text-amber-300 max-w-xs flex gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>Defensive Rule:</strong> Never enter your real active passwords, real bank OTP codes, or personal PINs.
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
            <span>Test Scenarios & Sample Presets (Click to analyze):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((s) => {
              const badgeColor = s.type === 'scam' 
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

        {/* Client-Side Privacy Protection Notice */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-300">Privacy Safeguard:</strong> Any passwords, OTP codes, or credit card numbers are automatically masked on your device before analysis. No phone number or account is ever required.
          </span>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                setInputText(e.target.value);
                setErrorMessage(null);
              }
            }}
            placeholder="Paste suspicious SMS text, WhatsApp message, email excerpt, or notification here...&#10;Example: 'Urgent: Your account is locked! Send the 6-digit OTP code to verify immediately: http://...'"
            rows={5}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans leading-relaxed resize-y"
          />

          <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
            {inputText.length} / {MAX_MESSAGE_LENGTH} chars
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Threat Vector...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Message</span>
                </>
              )}
            </button>

            {inputText && (
              <button
                onClick={handleClear}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl font-medium text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Clear input"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Analysis evaluates urgency, credential demands, links, and financial hooks.</span>
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
          
          {/* Main Verdict Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Security Assessment
                </span>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {result.analysisEngine === 'ai' ? (
                    <>
                      <BrainCircuit className="w-3 h-3 text-cyan-400" />
                      <span>Gemini AI Reasoner</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Heuristic Rule Engine</span>
                    </>
                  )}
                </span>

                {result.executionTimeMs !== undefined && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono border border-slate-700" title="Measured scan response time">
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
                <span>{copied ? 'Report Copied' : 'Copy Analysis'}</span>
              </button>
            </div>

            {/* Visual Risk Meter */}
            <RiskMeter score={result.riskScore} verdictLabel={result.verdictLabel} />

            {/* Verdict Explanation */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Summary Evaluation
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {result.aiExplanation || result.verdictDescription}
              </p>
            </div>

            {/* Warning Signs Detected */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>Warning Signs Detected ({result.warningSigns.length})</span>
                </div>
              </div>

              {result.warningSigns.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-200">No Blatant Red Flags Detected</strong>
                    <span className="text-xs text-emerald-300/90">
                      The analyzer did not match common signatures like OTP demands, urgent legal threats, lottery claims, or deceptive link patterns.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.warningSigns.map((w) => {
                    const badgeStyles =
                      w.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : w.severity === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : w.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

                    return (
                      <div
                        key={w.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-white text-sm">
                            {w.title}
                          </span>
                          <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                            {w.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {w.explanation}
                        </p>
                        {w.evidence && (
                          <div className="text-xs font-mono text-cyan-300/80 pt-1">
                            Detected keyword/pattern: <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{w.evidence}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safe Next Steps */}
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recommended Safe Actions</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.safeNextSteps.map((step) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-2.5"
                  >
                    <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{step.action}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-normal">{step.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Safety Reminder Notice */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 block mb-0.5">Critical Defensive Security Reminder:</strong>
                Never consider any unsolicited message as definitely 100% safe based solely on an automated check. 
                Sophisticated attackers constantly devise new spear-phishing templates. If in doubt, independently contact the alleged sender using verified contact methods.
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
