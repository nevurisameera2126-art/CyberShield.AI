import { MessageAnalysisResult, UrlAnalysisResult, HistoryItem, SessionStats, RiskLevel } from '../types';
import { analyzeMessageLocally } from '../utils/messageRules';
import { analyzeUrlLocally } from '../utils/urlRules';
import { 
  createSafeSnippet, 
  stripSensitiveCredentialsBeforeTransmission, 
  fastSimpleHash 
} from '../utils/security';
import { 
  generateActionableStepsForMessage, 
  generateActionableStepsForUrl 
} from '../utils/safetyActionGenerator';

const STORAGE_KEY_HISTORY = 'cybershield_scan_history';
const STORAGE_KEY_SETTINGS = 'cybershield_privacy_settings';

// In-Memory Fast Cache to reduce duplicate API calls and speed up repeated scans
const messageCache = new Map<string, MessageAnalysisResult>();
const urlCache = new Map<string, UrlAnalysisResult>();
const MAX_CACHE_SIZE = 50;

export interface PrivacySettings {
  saveHistoryToStorage: boolean;
  clearOnSessionEnd: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  saveHistoryToStorage: true,
  clearOnSessionEnd: true
};

/**
 * Checks server health and Gemini API availability.
 */
export async function checkServerHealth(): Promise<{
  ok: boolean;
  geminiConfigured: boolean;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check returned non-200');
    const data = await res.json();
    return {
      ok: true,
      geminiConfigured: Boolean(data.geminiConfigured)
    };
  } catch {
    return {
      ok: false,
      geminiConfigured: false
    };
  }
}

/**
 * Analyzes a text message with fast caching, pre-transmission credential scrubbing,
 * AbortController timeout protection, and actionable suggestion generation.
 */
export async function analyzeMessage(rawText: string): Promise<MessageAnalysisResult> {
  const startTime = performance.now();
  const trimmed = rawText.trim();
  const cacheKey = fastSimpleHash(trimmed);

  // Fast Path: Check in-memory cache
  if (messageCache.has(cacheKey)) {
    const cached = messageCache.get(cacheKey)!;
    const elapsed = Math.max(1, Math.round(performance.now() - startTime));
    return {
      ...cached,
      executionTimeMs: elapsed,
      isCached: true
    };
  }

  // Privacy Rule: Scrub any live passwords or active OTP codes before sending to network/AI
  const sanitizedForTransmission = stripSensitiveCredentialsBeforeTransmission(trimmed);

  let result: MessageAnalysisResult | null = null;

  // Try server-side analysis with strict 3.8s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3800);

  try {
    const res = await fetch('/api/analyze-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sanitizedForTransmission }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      result = data as MessageAnalysisResult;
    }
  } catch (err) {
    // Graceful offline / timeout fallback: network slow, aborted, or offline
    clearTimeout(timeoutId);
    console.info('Switching to fast local heuristic engine (network offline/timeout):', err);
  }

  // If server did not return result, execute deterministic local engine
  if (!result) {
    result = analyzeMessageLocally(trimmed);
  }

  const elapsed = Math.max(1, Math.round(performance.now() - startTime));

  // Generate tailored Actionable Safety Suggestions ("What Should You Do Next?")
  const actionableSteps = generateActionableStepsForMessage(result);

  const finalResult: MessageAnalysisResult = {
    ...result,
    actionableSteps,
    executionTimeMs: elapsed,
    isCached: false
  };

  // Cache in-memory
  if (messageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = messageCache.keys().next().value;
    if (firstKey) messageCache.delete(firstKey);
  }
  messageCache.set(cacheKey, finalResult);

  return finalResult;
}

/**
 * Analyzes a URL with fast caching, timeout protection, and actionable suggestion generation.
 */
export async function analyzeUrl(rawUrl: string): Promise<UrlAnalysisResult> {
  const startTime = performance.now();
  const trimmed = rawUrl.trim();
  const cacheKey = fastSimpleHash(trimmed.toLowerCase());

  // Fast Path: Check in-memory cache
  if (urlCache.has(cacheKey)) {
    const cached = urlCache.get(cacheKey)!;
    const elapsed = Math.max(1, Math.round(performance.now() - startTime));
    return {
      ...cached,
      executionTimeMs: elapsed,
      isCached: true
    };
  }

  let result: UrlAnalysisResult | null = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch('/api/analyze-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmed }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      result = data as UrlAnalysisResult;
    }
  } catch {
    clearTimeout(timeoutId);
    // Offline fallback
  }

  if (!result) {
    result = analyzeUrlLocally(trimmed);
  }

  const elapsed = Math.max(1, Math.round(performance.now() - startTime));

  // Generate tailored Actionable Safety Suggestions ("What Should You Do Next?")
  const actionableSteps = generateActionableStepsForUrl(result);

  const finalResult: UrlAnalysisResult = {
    ...result,
    actionableSteps,
    executionTimeMs: elapsed,
    isCached: false
  };

  // Cache in-memory
  if (urlCache.size >= MAX_CACHE_SIZE) {
    const firstKey = urlCache.keys().next().value;
    if (firstKey) urlCache.delete(firstKey);
  }
  urlCache.set(cacheKey, finalResult);

  return finalResult;
}

/**
 * History & Privacy Storage Management
 */
export function getPrivacySettings(): PrivacySettings {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PRIVACY_SETTINGS;
}

export function savePrivacySettings(settings: PrivacySettings): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    if (!settings.saveHistoryToStorage) {
      clearAllHistory();
    }
  } catch {
    // fallback
  }
}

export function getScanHistory(): HistoryItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      const items = JSON.parse(raw);
      if (Array.isArray(items)) return items;
    }
  } catch {
    // fallback
  }
  return [];
}

export function addMessageToHistory(text: string, result: MessageAnalysisResult): void {
  const settings = getPrivacySettings();
  if (!settings.saveHistoryToStorage) return;

  const riskLevel: RiskLevel = result.riskScore >= 65 ? 'high' : result.riskScore >= 30 ? 'medium' : 'low';
  
  // Privacy protection: create masked snippet so no private passwords or numbers persist
  const item: HistoryItem = {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type: 'message',
    inputSnippet: createSafeSnippet(text, 90),
    fullLength: text.length,
    verdictLabel: result.verdictLabel,
    riskScore: result.riskScore,
    riskLevel,
    timestamp: result.timestamp || Date.now(),
    engine: result.analysisEngine
  };

  const history = getScanHistory();
  // Keep last 30 scans
  const updated = [item, ...history].slice(0, 30);
  try {
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function addUrlToHistory(url: string, result: UrlAnalysisResult): void {
  const settings = getPrivacySettings();
  if (!settings.saveHistoryToStorage) return;

  const riskLevel: RiskLevel = result.riskScore >= 65 ? 'high' : result.riskScore >= 30 ? 'medium' : 'low';
  const item: HistoryItem = {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type: 'url',
    inputSnippet: createSafeSnippet(url, 90),
    fullLength: url.length,
    verdictLabel: result.verdictLabel,
    riskScore: result.riskScore,
    riskLevel,
    timestamp: result.timestamp || Date.now(),
    engine: 'url_analyzer'
  };

  const history = getScanHistory();
  const updated = [item, ...history].slice(0, 30);
  try {
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getScanHistory();
  const filtered = history.filter(item => item.id !== id);
  try {
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
  return filtered;
}

export function clearAllHistory(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_HISTORY);
    messageCache.clear();
    urlCache.clear();
  } catch {
    // ignore
  }
}

export function calculateSessionStats(history: HistoryItem[]): SessionStats {
  let totalScans = history.length;
  let highRiskScans = 0;
  let suspiciousScans = 0;
  let lowRiskScans = 0;

  for (const item of history) {
    if (item.riskLevel === 'high') highRiskScans++;
    else if (item.riskLevel === 'medium') suspiciousScans++;
    else lowRiskScans++;
  }

  let quizzesAnswered = 0;
  let quizzesCorrect = 0;
  try {
    const quizData = sessionStorage.getItem('cybershield_quiz_stats');
    if (quizData) {
      const parsed = JSON.parse(quizData);
      quizzesAnswered = parsed.answered || 0;
      quizzesCorrect = parsed.correct || 0;
    }
  } catch {
    // ignore
  }

  return {
    totalScans,
    highRiskScans,
    suspiciousScans,
    lowRiskScans,
    quizzesAnswered,
    quizzesCorrect
  };
}
