import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  UserCheck, 
  Trash2, 
  LogOut, 
  LogIn, 
  AlertTriangle, 
  Server, 
  FileText, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Play, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signOutUser, 
  deleteUserAccount, 
  getFirebaseConfigStatus, 
  isFirebaseConfigured, 
  subscribeToAuth 
} from '../services/firebase';
import { User } from 'firebase/auth';
import { clearAllHistory, getScanHistory } from '../services/api';

interface SecurityAuditResult {
  testId: string;
  description: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  error?: string;
}

interface SecurityAuditReport {
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: SecurityAuditResult[];
  auditTimestamp: number;
}

interface PrivacyPageProps {
  onHistoryCleared?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onHistoryCleared }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [configStatus] = useState(getFirebaseConfigStatus());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Security test suite state
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditReport, setAuditReport] = useState<SecurityAuditReport | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(!configStatus.isConfigured);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setActionMessage(null);
    if (!isFirebaseConfigured) {
      setActionMessage({
        text: 'Firebase credentials are not configured in your environment. Please view the setup instructions below to configure Firebase Authentication.',
        type: 'info'
      });
      setShowConfigHelp(true);
      return;
    }

    const res = await signInWithGoogle();
    if (res.success) {
      setActionMessage({
        text: `Signed in successfully as ${res.user?.displayName || res.user?.email}.`,
        type: 'success'
      });
    } else {
      setActionMessage({
        text: res.error || 'Failed to complete Google Sign-In.',
        type: 'error'
      });
    }
  };

  const handleSignOut = async () => {
    setActionMessage(null);
    const res = await signOutUser();
    if (res.success) {
      setActionMessage({ text: 'Signed out successfully.', type: 'info' });
    } else {
      setActionMessage({ text: res.error || 'Failed to sign out.', type: 'error' });
    }
  };

  const handleClearHistory = () => {
    clearAllHistory();
    if (onHistoryCleared) onHistoryCleared();
    setActionMessage({ text: 'Session scan history cleared.', type: 'success' });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setActionMessage(null);

    const res = await deleteUserAccount();
    setIsDeleting(false);
    setDeleteConfirmOpen(false);

    if (res.success) {
      clearAllHistory();
      if (onHistoryCleared) onHistoryCleared();
      setActionMessage({
        text: 'Your account and all associated records have been permanently deleted.',
        type: 'success'
      });
    } else {
      setActionMessage({
        text: res.error || 'Account deletion failed. Try signing in again first.',
        type: 'error'
      });
    }
  };

  const runSecurityAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await fetch('/api/security-audit/run-tests');
      const data = await res.json();
      setAuditReport(data);
    } catch {
      setActionMessage({ text: 'Failed to run security audit tests.', type: 'error' });
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy-by-Design & Security Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy, Account & Security Controls
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Transparent information on data collection, Google Sign-In authentication status, backend isolation verification, and self-service account deletion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border flex items-center gap-1.5 ${
              isFirebaseConfigured
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{isFirebaseConfigured ? 'Firebase Auth: Ready' : 'Session-Only Mode (Unconfigured)'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : actionMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Section 1: Account & Authentication Management */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Account Status & Google Authentication</h2>
              <p className="text-xs text-slate-400">Firebase Auth with Google Sign-In (Least-Privilege Scopes)</p>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border border-cyan-500/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.displayName || 'Google User'}</div>
                  <div className="text-xs font-mono text-cyan-300">{currentUser.email}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">UID: {currentUser.uid}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {isFirebaseConfigured ? 'Sign in with Google' : 'Local Anonymous Session Active'}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  {isFirebaseConfigured
                    ? 'Sign in to access your private scans and synchronize learning achievements across devices.'
                    : 'The app is running in local anonymous session mode. You do not need an account to use the Scam Detector, URL Checker, or Learning Center.'}
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
              >
                <LogIn className="w-4 h-4 text-slate-900" />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Toggle Configuration Assistance */}
            <div className="pt-2">
              <button
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{showConfigHelp ? 'Hide' : 'Show'} Firebase Configuration Status & Instructions</span>
                {showConfigHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showConfigHelp && (
                <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Truthful Configuration Status</span>
                  </div>
                  <p className="text-slate-400">
                    Firebase Authentication status:{' '}
                    <strong className={isFirebaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                      {isFirebaseConfigured ? 'Configured & Ready' : 'Unconfigured'}
                    </strong>
                  </p>

                  {!isFirebaseConfigured && (
                    <div className="space-y-2">
                      <p className="text-slate-400">
                        Missing environment variables in your <code className="text-cyan-300">.env</code>:
                      </p>
                      <ul className="list-disc list-inside font-mono text-[11px] text-amber-300 space-y-0.5">
                        {configStatus.missingKeys.map(k => <li key={k}>{k}</li>)}
                      </ul>
                      <p className="text-slate-400 pt-1">
                        To enable live Google Sign-In, obtain web credentials from your Firebase Console (Project Settings &gt; General &gt; Your Apps) and specify them in your environment.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clear History Shortcut */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Session history currently holds <strong className="text-white">{getScanHistory().length}</strong> local scan records.
          </div>
          <button
            onClick={handleClearHistory}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Session Scan History</span>
          </button>
        </div>
      </div>

      {/* Section 2: Privacy-by-Design Transparency Matrix */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Data Collection & Privacy Disclosure</h2>
            <p className="text-xs text-slate-400">Strict adherence to Privacy-by-Design and Least-Privilege Principles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>What We Collect & Why</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <li>• <strong className="text-white">Display Name:</strong> Personalization in dashboard greetings.</li>
              <li>• <strong className="text-white">Email Address:</strong> Unique user ID and account verification.</li>
              <li>• <strong className="text-white">Profile Photo:</strong> Visual avatar in interface header only.</li>
              <li>• <strong className="text-white">Redacted Scans:</strong> Masked snippets for review in current session.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>What We NEVER Request or Store</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <li>• <strong className="text-white">Phone Numbers:</strong> Never requested under any circumstance.</li>
              <li>• <strong className="text-white">Google Passwords / OTPs:</strong> Authentication is handled by Google. We never see or store passwords.</li>
              <li>• <strong className="text-white">Google Workspace Data:</strong> No access to Gmail, Drive, Docs, or Contacts.</li>
              <li>• <strong className="text-white">Unredacted Passwords/Cards:</strong> Masked automatically before storage.</li>
            </ul>
          </div>

        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1.5">
          <div className="font-semibold text-slate-200">How You Can Delete Your Data:</div>
          <p>
            1. <strong>Local Session Data:</strong> Click "Clear Session Scan History" above or close this browser tab.
          </p>
          <p>
            2. <strong>Account & Cloud Data:</strong> Click "Delete Account" while signed in. This triggers atomic deletion of your Firebase user document, private scan subcollections, and terminates your authentication account.
          </p>
        </div>
      </div>

      {/* Section 3: Interactive Automated Security & Isolation Testing */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Automated Security & Access-Control Verification</h2>
              <p className="text-xs text-slate-400">Rigorous backend testing: Unauthenticated access, User A vs User B isolation, and deletion</p>
            </div>
          </div>

          <button
            onClick={runSecurityAudit}
            disabled={isRunningAudit}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunningAudit ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Audit Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Live Security Tests</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The test suite executes live requests against protected backend endpoints to verify that unauthenticated calls are rejected with <code className="text-cyan-300">401 Unauthorized</code>, User A cannot read or modify User B's private data (<code className="text-cyan-300">403 Forbidden</code>), tampered tokens are rejected, and account deletion cleans up data.
        </p>

        {auditReport ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Audit Summary: {auditReport.passedTests} / {auditReport.totalTests} Security Assertions Passed
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                auditReport.allPassed 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {auditReport.allPassed ? 'ALL TESTS PASSED' : 'FAILURES DETECTED'}
              </span>
            </div>

            <div className="space-y-2">
              {auditReport.results.map((r) => (
                <div
                  key={r.testId}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-white">{r.testId}: {r.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Expected HTTP {r.expectedStatus} • Received HTTP {r.actualStatus}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                    r.passed 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
            Click "Run Live Security Tests" above to verify backend authorization, cross-user isolation, and access controls.
          </div>
        )}
      </div>

      {/* Confirmation Modal for Account Deletion */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Permanent Account Deletion</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action is permanent and cannot be undone. All your account details, private scan history, and Firestore records will be completely purged from our database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
