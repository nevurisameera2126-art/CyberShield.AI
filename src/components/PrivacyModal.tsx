import React from 'react';
import { X, ShieldCheck, EyeOff, AlertOctagon, Lock, Globe, Server } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 id="privacy-modal-title" className="text-xl font-bold text-white">
              Privacy Policy & Security Boundaries
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1.5">
              <EyeOff className="w-4 h-4" />
              <span>Zero Passive Monitoring</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              CyberShield AI operates exclusively on the text messages and URLs you voluntarily submit for analysis. 
              We do <strong className="text-white">not</strong> listen to network traffic, inspect browser tabs, access device storage, or monitor background activity.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5">
              <Globe className="w-4 h-4" />
              <span>Zero Outgoing URL Connections (SSRF Prevention)</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              When analyzing submitted links, CyberShield inspects lexical structure, hostnames, IP characteristics, and top-level domains. 
              To protect you and internal systems, the application <strong className="text-white">never opens, visits, or runs code</strong> from submitted web addresses.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1.5">
              <Lock className="w-4 h-4" />
              <span>Credential & Sensitive Data Redaction</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Never submit real active passwords, confidential PINs, or valid bank OTP codes. 
              When scans are temporarily indexed in your current session history, detection algorithms automatically redact phone numbers, email addresses, and security codes to protect personal data.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Important Limitations Notice</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              An assessment of <em>"No obvious scam indicators found"</em> or <em>"Standard Web Link"</em> does <strong className="text-white">not</strong> guarantee a communication or website is completely safe. 
              Newly crafted scams and spear-phishing campaigns may bypass known signatures. Always confirm identity through established, independent channels before sharing information or money.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1.5">
              <Server className="w-4 h-4" />
              <span>Data Retention</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Scans are maintained in temporary browser session storage by default and can be deleted individually or wiped completely at any time from the Scan History tab.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors shadow-lg shadow-sky-600/20"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
