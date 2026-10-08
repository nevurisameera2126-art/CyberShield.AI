import { UrlAnalysisResult, UrlCheckFinding } from '../types';

// Common URL shortener services known to mask original destination
const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly',
  'rb.gy', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'goo.gl', 'bl.ink'
]);

// High-risk generic top-level domains (gTLDs) frequently abused in disposable phishing campaigns
const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click', 'cam',
  'buzz', 'surf', 'loan', 'racing', 'win', 'download', 'support-online'
]);

// Target brands frequently targeted by brand spoofing & typosquatting
const MONITORED_BRANDS = [
  { name: 'PayPal', patterns: [/paypa[l1i]/i, /pay-pal/i, /paypaI/i] },
  { name: 'Apple', patterns: [/app[l1]e/i, /icloud/i, /appleid/i] },
  { name: 'Google', patterns: [/g[0o]{2}g[l1]e/i, /goog[l1]e/i, /gmai[l1]/i] },
  { name: 'Microsoft', patterns: [/micr[0o]s[0o]ft/i, /msft/i, /outl[0o]{2}k/i, /office365/i] },
  { name: 'Amazon', patterns: [/amaz[0o]n/i, /arnazon/i, /amzn/i] },
  { name: 'Netflix', patterns: [/netf[l1]ix/i, /netfllx/i] },
  { name: 'Chase Bank', patterns: [/chase-online/i, /chasebank/i] },
  { name: 'Wells Fargo', patterns: [/wells-fargo/i, /wellsfarg[0o]/i] },
  { name: 'Bank of America', patterns: [/bankofamerica/i, /bofa/i] },
  { name: 'USPS', patterns: [/usps-tracking/i, /usps-deliver/i, /post-usps/i] }
];

// Suspicious file extensions often associated with direct malware payloads
const DANGEROUS_EXTENSIONS = [
  '.exe', '.scr', '.bat', '.cmd', '.vbs', '.apk', '.msi', '.ps1', '.iso', '.zip', '.rar'
];

/**
 * Safely parses and conducts deep heuristic structural inspection on a URL.
 * NEVER makes outgoing network requests to the target URL.
 */
export function analyzeUrlLocally(rawInput: string): UrlAnalysisResult {
  const findings: UrlCheckFinding[] = [];
  const safeRecommendations: string[] = [];
  let riskScore = 0;

  let input = rawInput.trim();
  if (!input) {
    throw new Error('Please provide a URL to analyze.');
  }

  // Prepend protocol if missing to allow standard URL parsing
  let hadNoProtocol = false;
  if (!/^https?:\/\//i.test(input)) {
    hadNoProtocol = true;
    input = 'http://' + input;
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    // If standard parser fails, create a fallback analysis object
    return {
      url: rawInput,
      normalizedUrl: rawInput,
      protocol: 'invalid',
      hostname: 'invalid',
      pathname: '',
      search: '',
      isHttps: false,
      isIpAddress: false,
      isUrlShortener: false,
      hasSuspiciousTld: false,
      hasTyposquatting: false,
      hasUnusualCharacters: true,
      hasSuspiciousFileExtension: false,
      riskScore: 60,
      verdict: 'suspicious_characteristics',
      verdictLabel: 'Malformed or Invalid URL',
      verdictDescription: 'This input does not adhere to standard Internet URL syntax (RFC 3986). Malformed URLs are frequently used in obfuscation attempts.',
      findings: [{
        id: 'f-malformed',
        title: 'Syntax Error in URL',
        severity: 'high',
        explanation: 'The provided string cannot be resolved into a valid web address.',
        detail: 'Check for typos or illegal control characters.'
      }],
      safeRecommendations: [
        'Do not paste malformed addresses into browser command bars or terminal shells.',
        'Verify the exact destination using an official search engine if looking for a known company.'
      ],
      timestamp: Date.now()
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();

  // 1. Protocol Inspection (HTTPS vs HTTP)
  const isHttps = protocol === 'https:';
  if (!isHttps) {
    riskScore += 20;
    findings.push({
      id: 'f-insecure-http',
      title: 'Insecure Protocol (HTTP / Unencrypted)',
      severity: 'medium',
      explanation: hadNoProtocol
        ? 'No encryption protocol was specified. Plain HTTP transmits all passwords and sensitive data in unencrypted plaintext.'
        : 'The link uses unencrypted HTTP instead of secure HTTPS. Anyone on the same network or Wi-Fi can intercept data sent to this site.',
      detail: `Protocol is "${protocol.replace(':', '')}". Modern secure websites almost universally enforce HTTPS.`
    });
    safeRecommendations.push('Never enter passwords, credit cards, or personal information on sites without HTTPS.');
  }

  // 2. Direct IP Address Hostname Inspection
  // IPv4 pattern: 4 numbers separated by dots
  const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const isIpAddress = ipv4Pattern.test(hostname) || hostname.startsWith('[') || /^\d+$/.test(hostname);

  if (isIpAddress) {
    riskScore += 35;
    findings.push({
      id: 'f-ip-hostname',
      title: 'Direct IP Address Hostname (Bypasses Domain Name)',
      severity: 'high',
      explanation: 'Legitimate consumer and corporate services use recognizable registered domain names. Using raw IP addresses is common in malicious staging servers to avoid domain registration records and blacklists.',
      detail: `Detected raw address: ${hostname}`
    });
    safeRecommendations.push('Do not proceed to websites hosted directly on IP addresses unless you are managing local internal hardware.');
  }

  // 3. URL Shortener Detection
  const isUrlShortener = SHORTENER_DOMAINS.has(hostname) || hostname.endsWith('.link');
  if (isUrlShortener) {
    riskScore += 25;
    findings.push({
      id: 'f-url-shortener',
      title: 'Shortened Link / Cloaked Destination',
      severity: 'medium',
      explanation: 'Shorteners (like bit.ly or tinyurl) mask the true destination web address. Attackers routinely disguise phishing links behind shortened URLs so victims cannot inspect the final domain beforehand.',
      detail: `Shortener provider: ${hostname}`
    });
    safeRecommendations.push('Use a link expansion previewer or avoid clicking unsolicited shortened URLs from unknown senders.');
  }

  // 4. Embedded Credentials / "@" symbol deception
  if (rawInput.includes('@')) {
    riskScore += 45;
    findings.push({
      id: 'f-at-symbol-trick',
      title: 'Embedded Credentials / Authentication Symbol (@)',
      severity: 'critical',
      explanation: 'In URL syntax, the "@" symbol separates username credentials from the actual host. Browsers ignore everything before the "@" and connect ONLY to what follows it. For example, "http://google.com@evil-site.com" goes to "evil-site.com", NOT Google!',
      detail: 'The "@" character was detected in the URL structure.'
    });
    safeRecommendations.push('Treat links containing "@" symbols with extreme suspicion — this is a classic URL deception tactic.');
  }

  // 5. Typosquatting & Brand Spoofing Check
  let hasTyposquatting = false;
  let brandImpersonationTarget: string | undefined;

  for (const brand of MONITORED_BRANDS) {
    // Check if the brand name or typosquat pattern appears in hostname, but hostname does NOT end with the legitimate official domain
    const matchesBrand = brand.patterns.some(p => p.test(hostname));
    const isOfficialDomain = (
      (brand.name === 'PayPal' && (hostname === 'paypal.com' || hostname.endsWith('.paypal.com'))) ||
      (brand.name === 'Apple' && (hostname === 'apple.com' || hostname.endsWith('.apple.com') || hostname === 'icloud.com' || hostname.endsWith('.icloud.com'))) ||
      (brand.name === 'Google' && (hostname === 'google.com' || hostname.endsWith('.google.com'))) ||
      (brand.name === 'Microsoft' && (hostname === 'microsoft.com' || hostname.endsWith('.microsoft.com') || hostname.endsWith('.live.com'))) ||
      (brand.name === 'Amazon' && (hostname === 'amazon.com' || hostname.endsWith('.amazon.com'))) ||
      (brand.name === 'Netflix' && (hostname === 'netflix.com' || hostname.endsWith('.netflix.com'))) ||
      (brand.name === 'Chase Bank' && (hostname === 'chase.com' || hostname.endsWith('.chase.com'))) ||
      (brand.name === 'Wells Fargo' && (hostname === 'wellsfargo.com' || hostname.endsWith('.wellsfargo.com'))) ||
      (brand.name === 'Bank of America' && (hostname === 'bankofamerica.com' || hostname.endsWith('.bankofamerica.com'))) ||
      (brand.name === 'USPS' && (hostname === 'usps.com' || hostname.endsWith('.usps.com')))
    );

    if (matchesBrand && !isOfficialDomain) {
      hasTyposquatting = true;
      brandImpersonationTarget = brand.name;
      riskScore += 45;
      findings.push({
        id: `f-typosquat-${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Possible Brand Spoofing (${brand.name})`,
        severity: 'critical',
        explanation: `The domain "${hostname}" incorporates elements imitating ${brand.name}, but does NOT originate from their genuine verified domain. Attackers create deceptive lookalike domains to deceive users into submitting passwords.`,
        detail: `Impersonation detected targeting ${brand.name}`
      });
      break;
    }
  }

  // 6. Subdomain Stuffing & Excessive Hyphens
  const domainParts = hostname.split('.');
  if (domainParts.length >= 4 && !isIpAddress) {
    riskScore += 20;
    findings.push({
      id: 'f-excessive-subdomains',
      title: 'Excessive Subdomain Levels',
      severity: 'medium',
      explanation: 'Scammers frequently construct complex multi-level subdomains (e.g., login.chase.com.account-update.xyz) so mobile browsers display only the first part and truncate the deceptive real root domain.',
      detail: `Contains ${domainParts.length} domain label segments.`
    });
  }

  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    riskScore += 20;
    findings.push({
      id: 'f-hyphen-stuffing',
      title: 'Multiple Hyphens in Hostname',
      severity: 'medium',
      explanation: 'A high frequency of hyphens (such as "secure-login-verify-account") is a common signature of throwaway phishing domains trying to look official.',
      detail: `Found ${hyphenCount} hyphens in domain: ${hostname}`
    });
  }

  // 7. Suspicious Top-Level Domains (TLD)
  const tld = domainParts[domainParts.length - 1] || '';
  const hasSuspiciousTld = HIGH_RISK_TLDS.has(tld);
  if (hasSuspiciousTld) {
    riskScore += 25;
    findings.push({
      id: 'f-suspicious-tld',
      title: `High-Risk Top-Level Domain (.${tld})`,
      severity: 'medium',
      explanation: `Domains ending in .${tld} are frequently offered at bulk discount or free rates and are disproportionately utilized in ephemeral scam and phishing operations.`,
      detail: `Top-level domain extension: .${tld}`
    });
  }

  // 8. Punycode & Non-ASCII Homoglyphs
  const hasUnusualCharacters = hostname.includes('xn--') || /[^\x20-\x7E]/.test(rawInput);
  if (hasUnusualCharacters) {
    riskScore += 40;
    findings.push({
      id: 'f-punycode-homoglyph',
      title: 'Internationalized / Punycode (IDN Homoglyph Attack Risk)',
      severity: 'critical',
      explanation: 'The address uses Punycode ("xn--") or non-ASCII characters. Cybercriminals use visually identical foreign Cyrillic or Greek letters (e.g., replacing "a" with Cyrillic "а") to create deceptive clone sites.',
      detail: `Punycode representation detected in: ${hostname}`
    });
  }

  // 9. Dangerous Executable or Script File Extensions
  let hasSuspiciousFileExtension = false;
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (pathname.endsWith(ext) || pathname.includes(`${ext}?`)) {
      hasSuspiciousFileExtension = true;
      riskScore += 50;
      findings.push({
        id: `f-dangerous-file-${ext}`,
        title: `Direct Download of Executable / Script File (${ext})`,
        severity: 'critical',
        explanation: `This link triggers a direct download of a "${ext}" file. Executables or script archives delivered via unsolicited links frequently contain spyware, trojans, or ransomware.`,
        detail: `Path targets ${ext}`
      });
      safeRecommendations.push('DO NOT open or run executable files downloaded from unsolicited links or unfamiliar senders.');
      break;
    }
  }

  // 10. Deceptive Path Keywords (fake login or credential forms)
  const suspiciousPathKeywords = ['login.php', 'wp-login.php', 'signin.html', 'update-password', 'verify-account', 'webscr'];
  const matchedPathKeywords = suspiciousPathKeywords.filter(k => pathname.includes(k) || search.includes(k));
  if (matchedPathKeywords.length > 0 && !isHttps) {
    riskScore += 30;
    findings.push({
      id: 'f-unencrypted-login-path',
      title: 'Unencrypted Authentication Form in URL Path',
      severity: 'high',
      explanation: 'The URL targets a login or verification script over insecure HTTP, which is typical of quickly deployed credential-harvesting kits.',
      detail: `Path includes: ${matchedPathKeywords.join(', ')}`
    });
  }

  // Cap score 0 - 100
  const finalScore = Math.min(100, Math.max(0, riskScore));

  // Determine Verdict
  let verdict: UrlAnalysisResult['verdict'] = 'standard_patterns';
  let verdictLabel = 'No Known Red Flags Found (Standard Web Link)';
  let verdictDescription =
    'This URL does not exhibit obvious phishing signatures (such as brand typosquatting, raw IP hostnames, homoglyphs, or dangerous executable extensions). However, always verify that the site owner is who you expect before entering credentials.';

  if (finalScore >= 65) {
    verdict = 'malicious_or_high_risk';
    verdictLabel = 'Potential Phishing / Malicious Link';
    verdictDescription =
      'Multiple strong security red flags detected! This URL exhibits traits commonly found in credential-theft phishing pages, brand spoofing, or malware distribution campaigns.';
  } else if (finalScore >= 30) {
    verdict = 'suspicious_characteristics';
    verdictLabel = 'Suspicious Characteristics Detected';
    verdictDescription =
      'This URL has unusual properties (such as lack of HTTPS, shortened redirection, or excessive subdomains). Proceed with high caution and do not disclose sensitive information.';
  }

  // Standard safe recommendations if few present
  if (safeRecommendations.length === 0) {
    safeRecommendations.push('Look for the security padlock in your browser and double-check spelling before logging in.');
    safeRecommendations.push('If this was received in an unsolicited message, navigate to the service independently.');
  }

  return {
    url: rawInput,
    normalizedUrl: parsed.toString(),
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    pathname: parsed.pathname,
    search: parsed.search,
    isHttps,
    isIpAddress,
    isUrlShortener,
    hasSuspiciousTld,
    hasTyposquatting,
    brandImpersonationTarget,
    hasUnusualCharacters,
    hasSuspiciousFileExtension,
    riskScore: finalScore,
    verdict,
    verdictLabel,
    verdictDescription,
    findings,
    safeRecommendations,
    timestamp: Date.now()
  };
}
