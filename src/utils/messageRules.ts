import { MessageAnalysisResult, WarningSign, SafeAction } from '../types';

/**
 * Deterministic heuristic rule engine for detecting scam messages.
 * Operates reliably both client-side and as a server-side baseline.
 */
export function analyzeMessageLocally(rawText: string): MessageAnalysisResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const warningSigns: WarningSign[] = [];
  const safeNextSteps: SafeAction[] = [];
  let score = 0;

  // Extract entities
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  const urlsFound = text.match(urlRegex) || [];

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneNumbersFound = text.match(phoneRegex) || [];

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailsFound = text.match(emailRegex) || [];

  // 1. OTP & Credential Harvesting (CRITICAL SEVERITY)
  const otpKeywords = [
    'otp', 'one-time password', 'verification code', 'security code', '6-digit',
    'pin number', 'login password', 'send the code', 'share the code', 'confirm your password'
  ];
  const matchedOtp = otpKeywords.filter(k => lower.includes(k));
  if (matchedOtp.length > 0) {
    score += 45;
    warningSigns.push({
      id: 'ws-otp-credentials',
      category: 'credentials',
      title: 'Requests Security Code or Credentials',
      severity: 'critical',
      explanation: `The message asks for an OTP, security code, or password ("${matchedOtp[0]}"). Legitimate organizations and banks will NEVER ask you to text or read back your one-time passcodes or passwords.`,
      evidence: matchedOtp.join(', ')
    });
    safeNextSteps.push({
      id: 'step-no-otp',
      action: 'Never share verification codes or passwords',
      why: 'OTP codes are meant exclusively for your eyes. Sharing them allows attackers to bypass Two-Factor Authentication (2FA) and access your account.',
      priority: 'must_do'
    });
  }

  // 2. High Urgency & Time Pressure Tactics (HIGH SEVERITY)
  const urgencyKeywords = [
    'immediately', 'urgent', 'urgently', 'act now', 'within 2 hours', 'within 24 hours',
    'expires in', 'final notice', 'time-sensitive', 'immediate response', 'account locked',
    'funds frozen', 'funds will be frozen', 'action required now'
  ];
  const matchedUrgency = urgencyKeywords.filter(k => lower.includes(k));
  if (matchedUrgency.length > 0) {
    score += 25;
    warningSigns.push({
      id: 'ws-urgency',
      category: 'urgency',
      title: 'High Urgency & Pressure Tactics',
      severity: 'high',
      explanation: 'Scammers induce panic by imposing strict deadlines so you react emotionally before verifying the facts.',
      evidence: matchedUrgency.slice(0, 3).join(', ')
    });
    safeNextSteps.push({
      id: 'step-pause',
      action: 'Pause and do not rush',
      why: 'Artificial urgency is a classic manipulation tactic. Legitimate banks don\'t freeze funds without prior formal correspondence.',
      priority: 'recommended'
    });
  }

  // 3. Fake Prizes, Lotteries & Unrealistic Rewards (HIGH SEVERITY)
  const prizeKeywords = [
    'congratulations', 'you won', 'you have won', 'lottery', 'selected for cash',
    'giveaway winner', 'exclusive reward', 'claim your cash', 'anniversary lottery',
    '$50,000', '$10,000', '$1,000,000', 'free gift card'
  ];
  const matchedPrize = prizeKeywords.filter(k => lower.includes(k));
  if (matchedPrize.length > 0) {
    score += 35;
    warningSigns.push({
      id: 'ws-fake-prize',
      category: 'financial',
      title: 'Unsolicited Prize or Cash Reward',
      severity: 'high',
      explanation: 'Offers of unexpected prize money, giveaways, or lotteries you never entered are standard hooks to lure victims into paying fake "processing fees" or sharing banking data.',
      evidence: matchedPrize.slice(0, 3).join(', ')
    });
    safeNextSteps.push({
      id: 'step-prize-warning',
      action: 'Do not click claim links or send processing fees',
      why: 'You cannot win a contest or lottery you never entered. Genuine prizes never require upfront fees.',
      priority: 'must_do'
    });
  }

  // 4. Unusual Payment Methods & Threat / Legal Intimidation (HIGH SEVERITY)
  const threatKeywords = [
    'arrest warrant', 'police', 'irs notice', 'legal summons', 'lawsuit',
    'court summons', 'penalty fee', 'law enforcement', 'jail'
  ];
  const matchedThreat = threatKeywords.filter(k => lower.includes(k));

  const unusualPaymentKeywords = [
    'gift card', 'apple gift card', 'google play card', 'bitcoin', 'crypto',
    'wire transfer', 'western union', 'zelle', 'cash app'
  ];
  const matchedPayment = unusualPaymentKeywords.filter(k => lower.includes(k));

  if (matchedThreat.length > 0) {
    score += 35;
    warningSigns.push({
      id: 'ws-threats',
      category: 'threat',
      title: 'Government or Legal Threat / Arrest Intimidation',
      severity: 'high',
      explanation: 'Government agencies (like the IRS, Police, or Court System) will NEVER initiate legal contact via text message or email threatening immediate arrest.',
      evidence: matchedThreat.slice(0, 2).join(', ')
    });
  }

  if (matchedPayment.length > 0) {
    score += 40;
    warningSigns.push({
      id: 'ws-unusual-payment',
      category: 'financial',
      title: 'Demands Untraceable Payment Method',
      severity: 'critical',
      explanation: 'Demands for gift cards, cryptocurrency, or wire transfers are a definitive red flag of criminal extortion. Once sent, these funds cannot be reversed.',
      evidence: matchedPayment.join(', ')
    });
  }

  // 5. Authority & Brand Impersonation (MEDIUM SEVERITY)
  const brandKeywords = [
    'wells fargo', 'chase', 'bank of america', 'citibank', 'paypal', 'apple',
    'amazon', 'netflix', 'usps', 'ups', 'fedex', 'dhl', 'irs', 'geek squad',
    'microsoft support', 'social security'
  ];
  const matchedBrands = brandKeywords.filter(k => lower.includes(k));
  if (matchedBrands.length > 0) {
    score += 15;
    warningSigns.push({
      id: 'ws-impersonation',
      category: 'impersonation',
      title: 'Brand or Institutional Impersonation',
      severity: 'medium',
      explanation: `The message mentions "${matchedBrands[0]}". Attackers frequently impersonate well-known household names to borrow credibility.`,
      evidence: matchedBrands.slice(0, 2).join(', ')
    });
    safeNextSteps.push({
      id: 'step-official-channel',
      action: `Contact ${matchedBrands[0].toUpperCase()} directly via their official app or website`,
      why: 'Do not click links or use numbers inside this message. Navigate independently to the verified website or check the back of your credit/debit card for customer service numbers.',
      priority: 'must_do'
    });
  }

  // 6. Suspicious URLs in Text (HIGH SEVERITY)
  if (urlsFound.length > 0) {
    score += 20;
    const hasSuspiciousDomain = urlsFound.some(u => {
      const uLower = u.toLowerCase();
      return (
        uLower.includes('.biz') || uLower.includes('.top') || uLower.includes('.xyz') ||
        uLower.includes('.info') || uLower.includes('.tk') || uLower.includes('bit.ly') ||
        uLower.includes('tinyurl') || uLower.includes('-verify') || uLower.includes('-login') ||
        uLower.includes('-secure') || /https?:\/\/\d{1,3}\.\d{1,3}\./.test(uLower)
      );
    });

    if (hasSuspiciousDomain) {
      score += 25;
      warningSigns.push({
        id: 'ws-suspicious-links',
        category: 'links',
        title: 'Contains High-Risk or Shortened Links',
        severity: 'critical',
        explanation: 'The message contains links pointing to suspicious top-level domains, hyphens imitating legitimate brands, or shortened URLs designed to conceal the actual destination.',
        evidence: urlsFound.slice(0, 2).join(', ')
      });
    } else {
      warningSigns.push({
        id: 'ws-unsolicited-links',
        category: 'links',
        title: 'Contains Embedded Web Link',
        severity: 'medium',
        explanation: 'Unexpected links in unsolicited communications are the primary delivery mechanism for credential harvesting landing pages and malicious downloads.',
        evidence: urlsFound.slice(0, 2).join(', ')
      });
    }

    safeNextSteps.push({
      id: 'step-do-not-click',
      action: 'Do not click any embedded links',
      why: 'Links can redirect to counterfeit cloned portals designed to siphon your login credentials or install malicious mobile configuration profiles.',
      priority: 'must_do'
    });
  }

  // 7. Generic Salutations & Poor Grammar / Format
  const genericGreetings = ['dear customer', 'dear valued customer', 'dear user', 'dear beneficiary', 'valued account holder'];
  if (genericGreetings.some(g => lower.includes(g))) {
    score += 10;
    warningSigns.push({
      id: 'ws-generic-greeting',
      category: 'syntax',
      title: 'Generic Impersonal Salutation',
      severity: 'low',
      explanation: 'Legitimate institutions you have accounts with usually address you by your actual first or last name, not generic greetings.',
      evidence: 'Impersonal greeting detected'
    });
  }

  // Cap risk score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine verdict based on threshold
  let verdict: MessageAnalysisResult['verdict'] = 'no_obvious_indicators';
  let verdictLabel = 'No obvious scam indicators found';
  let verdictDescription =
    'This message does not exhibit blatant scam signals (such as OTP requests, urgent threats, fake prize claims, or suspicious link structures). However, you should still exercise normal caution.';

  if (finalScore >= 65) {
    verdict = 'potential_scam';
    verdictLabel = 'Potential Scam';
    verdictDescription =
      'High probability of a scam or phishing attempt. Multiple critical deception indicators were detected, such as urgent demands, credential harvesting, or suspicious links.';
  } else if (finalScore >= 30) {
    verdict = 'suspicious';
    verdictLabel = 'Suspicious';
    verdictDescription =
      'This message contains questionable patterns that warrant caution. Avoid clicking links, providing personal data, or calling numbers provided in the text.';
  }

  // Always supply standard baseline steps if empty
  if (safeNextSteps.length === 0) {
    safeNextSteps.push({
      id: 'step-general-verify',
      action: 'Verify sender identity if requesting any action',
      why: 'Even when no red flags are found, verify unexpected requests directly through an established, known contact method.',
      priority: 'recommended'
    });
    safeNextSteps.push({
      id: 'step-general-protect',
      action: 'Keep your device security and spam filters enabled',
      why: 'Modern smartphone OSs and email clients offer built-in spam protection that catches newly emerging threats.',
      priority: 'optional'
    });
  }

  // Always include reporting advice for scams
  if (verdict === 'potential_scam') {
    safeNextSteps.push({
      id: 'step-report-block',
      action: 'Block the sender and report as spam',
      why: 'Forward suspicious SMS texts to 7726 (SPAM in most regions) or use your email client\'s "Report Phishing" button. Then delete the message.',
      priority: 'recommended'
    });
  }

  return {
    verdict,
    riskScore: finalScore,
    verdictLabel,
    verdictDescription,
    warningSigns,
    safeNextSteps,
    analysisEngine: 'heuristic',
    detectedEntities: {
      urlsFound,
      phoneNumbersFound,
      emailsFound,
      requestsSensitiveInfo: matchedOtp.length > 0 || matchedPayment.length > 0
    },
    timestamp: Date.now()
  };
}
