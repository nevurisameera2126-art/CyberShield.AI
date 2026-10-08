import { ActionableSafetyStep, MessageAnalysisResult, UrlAnalysisResult } from '../types';

/**
 * Generates situation-specific, prioritized actionable safety suggestions
 * with both clear Simple English and Telugu (తెలుగు) translations.
 */
export function generateActionableStepsForMessage(result: MessageAnalysisResult): ActionableSafetyStep[] {
  const steps: ActionableSafetyStep[] = [];
  const warnings = result.warningSigns || [];
  const risk = result.riskScore;

  const hasCredentialsWarning = warnings.some(w => w.category === 'credentials');
  const hasUrgencyWarning = warnings.some(w => w.category === 'urgency');
  const hasFinancialWarning = warnings.some(w => w.category === 'financial');
  const hasLinksWarning = warnings.some(w => w.category === 'links');
  const hasThreatWarning = warnings.some(w => w.category === 'threat');
  const hasImpersonation = warnings.some(w => w.category === 'impersonation');

  // Scenario 1: OTP or Password Solicitation
  if (hasCredentialsWarning || result.detectedEntities?.requestsSensitiveInfo) {
    steps.push({
      id: 'act-no-otp',
      priority: 'critical',
      actionType: 'block_sender',
      badgeEn: 'Immediate Rule',
      badgeTe: 'తక్షణ నియమం',
      titleEn: 'Never share OTPs, passwords, or verification codes',
      titleTe: 'ఓటీపీ (OTP) లేదా పాస్‌వర్డ్ ఎవరితోనూ పంచుకోవద్దు',
      descriptionEn: 'Legitimate banks and services will NEVER ask you to text back or reveal your 6-digit one-time code. Sharing it allows attackers to take over your account.',
      descriptionTe: 'బ్యాంకులు లేదా ఏ ఇతర సంస్థలు కూడా ఫోన్‌లో లేదా ఎస్సెమ్మెస్ ద్వారా మీ 6-అంకెల ఓటీపీని అడగవు. దాన్ని ఇస్తే మీ ఖాతా ఇతరుల చేతుల్లోకి వెళ్తుంది.'
    });

    steps.push({
      id: 'act-pwd-shared-remedy',
      priority: 'critical',
      actionType: 'password_reset',
      badgeEn: 'If Already Shared',
      badgeTe: 'ఇప్పటికే ఇచ్చి ఉంటే',
      titleEn: 'If you already shared a password, change it immediately',
      titleTe: 'మీరు ఇప్పటికే పాస్‌వర్డ్ ఇచ్చి ఉంటే వెంటనే మార్చండి',
      descriptionEn: 'Use a trusted device to reset your password right now, terminate all other active login sessions in your account settings, and enable Multi-Factor Authentication (MFA).',
      descriptionTe: 'వెంటనే సురక్షితమైన ఫోన్ లేదా కంప్యూటర్ నుండి మీ పాస్‌వర్డ్ మార్చండి, ఖాతా సెట్టింగ్స్‌లో అన్ని ఇతర యాక్టివ్ సెషన్లను లాగ్ అవుట్ చేయండి మరియు 2-స్టెప్ వెరిఫికేషన్ (MFA) ఆన్ చేయండి.'
    });
  }

  // Scenario 2: Financial, Lottery, or Banking Transfer Request
  if (hasFinancialWarning) {
    steps.push({
      id: 'act-bank-freeze',
      priority: 'critical',
      actionType: 'bank_freeze',
      badgeEn: 'Financial Protection',
      badgeTe: 'బ్యాంకింగ్ భద్రత',
      titleEn: 'If banking details were exposed or money sent, alert your bank now',
      titleTe: 'బ్యాంక్ వివరాలు ఇచ్చినా లేదా డబ్బు పంపినా వెంటనే బ్యాంక్‌ను సంప్రదించండి',
      descriptionEn: 'Call your bank immediately using the trusted number printed on the back of your physical card to freeze your card, dispute fraudulent charges, and place a security freeze.',
      descriptionTe: 'వెంటనే మీ డెబిట్/క్రెడిట్ కార్డు వెనుక ఉన్న అధికారిక కస్టమర్ కేర్ నంబర్‌కు కాల్ చేసి, మీ కార్డును బ్లాక్ చేయించండి మరియు మోసాన్ని నివేదించండి.'
    });

    steps.push({
      id: 'act-no-fees-prize',
      priority: 'high',
      actionType: 'verify_channel',
      badgeEn: 'Lottery / Prize Advice',
      badgeTe: 'బహుమతి సలహా',
      titleEn: 'Do not pay "processing fees" or send gift cards to claim prizes',
      titleTe: 'బహుమతుల కోసం ప్రాసెసింగ్ ఫీజులు లేదా గిఫ్ట్ కార్డులు పంపవద్దు',
      descriptionEn: 'Genuine lotteries or company giveaways never require upfront fees, Apple/Google gift cards, or crypto transfers. Demanding untraceable payment is definitive fraud.',
      descriptionTe: 'నిజమైన లక్కీ డ్రాలు లేదా బహుమతులు ముందస్తు రుసుములు, గిఫ్ట్ కార్డులు లేదా క్రిప్టోకరెన్సీని ఎప్పుడూ అడగవు. అలా అడిగితే అది మోసమే.'
    });
  }

  // Scenario 3: Embedded Links
  if (hasLinksWarning || (result.detectedEntities?.urlsFound && result.detectedEntities.urlsFound.length > 0)) {
    steps.push({
      id: 'act-no-click',
      priority: 'high',
      actionType: 'block_sender',
      badgeEn: 'Link Caution',
      badgeTe: 'లింక్ హెచ్చరిక',
      titleEn: 'Do not tap or click the links in this message',
      titleTe: 'ఈ మెసేజ్‌లోని లింక్‌లను క్లిక్ చేయకండి',
      descriptionEn: 'Unexpected links often lead to cloned phishing portals designed to capture login credentials or download stealth trackers.',
      descriptionTe: 'తెలియని లేదా అనుమానాస్పద లింకులు నకిలీ వెబ్‌సైట్లకు దారితీస్తాయి. అవి మీ పాస్‌వర్డ్‌లను దొంగిలించడానికి రూపొందించబడ్డాయి.'
    });
  }

  // Scenario 4: Government, Legal, or Police Arrest Threat
  if (hasThreatWarning || hasUrgencyWarning) {
    steps.push({
      id: 'act-threat-calm',
      priority: 'high',
      actionType: 'verify_channel',
      badgeEn: 'Do Not Panic',
      badgeTe: 'భయపడవద్దు',
      titleEn: 'Pause and do not let fear rush your decision',
      titleTe: 'ఆందోళన చెందవద్దు, తొందరపడి ఎలాంటి నిర్ణయం తీసుకోకండి',
      descriptionEn: 'Police, courts, and tax departments (like the IRS) do not initiate arrest warrants or lawsuits via SMS or WhatsApp messages. Report threatening extortion to your local cyber police.',
      descriptionTe: 'పోలీసులు, కోర్టులు లేదా పన్ను విభాగాల అధికారులు ఎప్పుడూ వాట్సాప్ లేదా ఎస్సెమ్మెస్‌ల ద్వారా అరెస్ట్ చేస్తామని హెచ్చరించరు. స్థానిక సైబర్ క్రైమ్ పోర్టల్‌లో ఫిర్యాదు చేయండి.'
    });
  }

  // Scenario 5: Brand Impersonation
  if (hasImpersonation) {
    steps.push({
      id: 'act-verify-channel',
      priority: 'recommended',
      actionType: 'verify_channel',
      badgeEn: 'Verification',
      badgeTe: 'ధృవీకరణ',
      titleEn: 'Contact the organization independently through official channels',
      titleTe: 'సంస్థను అధికారిక మార్గాల ద్వారా నేరుగా సంప్రదించండి',
      descriptionEn: 'Open the official app on your device or manually type the official website address into your browser rather than relying on phone numbers or links provided in this message.',
      descriptionTe: 'మెసేజ్‌లోని నంబర్లు లేదా లింకులపై ఆధారపడకుండా, మీ ఫోన్‌లోని అధికారిక యాప్‌ను తెరవండి లేదా బ్రౌజర్‌లో అధికారిక వెబ్‌సైట్‌ను నేరుగా టైప్ చేయండి.'
    });
  }

  // Scenario 6: Enable MFA protection
  if (risk >= 30) {
    steps.push({
      id: 'act-enable-mfa',
      priority: 'recommended',
      actionType: 'enable_mfa',
      badgeEn: 'Account Hardening',
      badgeTe: 'ఖాతా భద్రత',
      titleEn: 'Secure your accounts with an Authenticator App (MFA)',
      titleTe: 'మీ ఖాతాలకు 2-స్టెప్ వెరిఫికేషన్ (MFA) ఆన్ చేయండి',
      descriptionEn: 'Enable two-factor authentication on your email, banking, and social accounts using Google Authenticator rather than SMS.',
      descriptionTe: 'మీ ఈమెయిల్, బ్యాంకింగ్ మరియు సోషల్ మీడియా ఖాతాలకు గూగుల్ ఆథెంటికేటర్ (Authenticator) వంటి యాప్‌ల ద్వారా 2-స్టెప్ వెరిఫికేషన్ తప్పకుండా ఆన్ చేయండి.'
    });
  }

  // Scenario 7: Low Risk / No Obvious Indicators
  if (risk < 30 || steps.length === 0) {
    steps.push({
      id: 'act-low-risk-caution',
      priority: 'general',
      actionType: 'low_risk_caution',
      badgeEn: 'Safety Reminder',
      badgeTe: 'భద్రతా గమనిక',
      titleEn: 'No obvious warning signs found, but remain cautious',
      titleTe: 'ప్రమాదకర సంకేతాలు కనిపించలేదు, కానీ జాగ్రత్త అవసరం',
      descriptionEn: 'This text did not trigger known red flags, but automated scans cannot guarantee 100% safety. If this message asks for unexpected favors or payments, confirm with the sender directly.',
      descriptionTe: 'ఈ మెసేజ్‌లో తెలిసిన మోసపూరిత సంకేతాలు లేవు, కానీ కంప్యూటర్ స్కాన్‌లు 100% గ్యారెంటీ ఇవ్వలేవు. ఇది ఊహించని మెసేజ్ అయితే, పంపిన వ్యక్తికి నేరుగా ఫోన్ చేసి నిర్ధారించుకోండి.'
    });
  }

  return steps;
}

/**
 * Generates situation-specific actionable safety suggestions for URL checks.
 */
export function generateActionableStepsForUrl(result: UrlAnalysisResult): ActionableSafetyStep[] {
  const steps: ActionableSafetyStep[] = [];
  const risk = result.riskScore;

  if (result.hasSuspiciousFileExtension) {
    steps.push({
      id: 'act-url-file-delete',
      priority: 'critical',
      actionType: 'file_delete',
      badgeEn: 'Malware Danger',
      badgeTe: 'వైరస్ ప్రమాదం',
      titleEn: 'Do not open downloaded files; delete them immediately',
      titleTe: 'డౌన్‌లోడ్ అయిన ఫైల్స్‌ను ఓపెన్ చేయకండి; వెంటనే డిలీట్ చేయండి',
      descriptionEn: 'This link targets an executable or script payload (.exe, .bat, .apk). If a file downloaded, DO NOT double-click or run it. Delete it from your Downloads folder and run a security scan.',
      descriptionTe: 'ఈ లింక్ ప్రమాదకరమైన ఫైల్ (.exe, .apk) వైపు చూపిస్తోంది. ఫైల్ డౌన్‌లోడ్ అయి ఉంటే దాన్ని ఎట్టిపరిస్థితుల్లోనూ ఓపెన్ చేయకండి, వెంటనే డిలీట్ చేసి యాంటీవైరస్ స్కాన్ చేయండి.'
    });
  }

  if (result.hasTyposquatting || result.brandImpersonationTarget) {
    steps.push({
      id: 'act-url-fake-brand',
      priority: 'critical',
      actionType: 'verify_channel',
      badgeEn: 'Brand Spoofing',
      badgeTe: 'నకిలీ వెబ్‌సైట్',
      titleEn: `Do not log in: This is NOT the real ${result.brandImpersonationTarget || 'official'} site`,
      titleTe: `లాగిన్ అవ్వకండి: ఇది నిజమైన ${result.brandImpersonationTarget || 'అధికారిక'} సైట్ కాదు`,
      descriptionEn: 'The domain name is altered to deceive users. If you entered your username or password on this page, immediately go to the official domain, change your password, and enable MFA.',
      descriptionTe: 'ఈ వెబ్‌సైట్ పేరు అసలు సైట్‌లా కనిపించేలా మార్చబడింది. ఒకవేళ మీరు ఇందులో పాస్‌వర్డ్ ఎంటర్ చేసి ఉంటే, వెంటనే నిజమైన సైట్‌కి వెళ్లి పాస్‌వర్డ్ మార్చండి.'
    });
  }

  if (result.isIpAddress) {
    steps.push({
      id: 'act-url-ip-host',
      priority: 'high',
      actionType: 'block_sender',
      badgeEn: 'Untrusted Server',
      badgeTe: 'అనుమానాస్పద సర్వర్',
      titleEn: 'Avoid entering credentials on numeric IP addresses',
      titleTe: 'సంఖ్యలతో ఉన్న ఐపీ అడ్రస్‌లలో వ్యక్తిగత సమాచారం ఇవ్వవద్దు',
      descriptionEn: 'Legitimate consumer services use registered domains (e.g. google.com), not raw numeric IP addresses. This is typical of disposable attack infrastructure.',
      descriptionTe: 'నమ్మదగిన కంపెనీలు రిజిస్టర్డ్ పేర్లను వాడతాయి తప్ప సంఖ్యల ఐపీలను వాడవు. ఇందులో ఎలాంటి రహస్య సమాచారం లేదా కార్డు నంబర్లు ఇవ్వకండి.'
    });
  }

  if (result.isUrlShortener) {
    steps.push({
      id: 'act-url-shortener-caution',
      priority: 'recommended',
      actionType: 'verify_channel',
      badgeEn: 'Hidden Destination',
      badgeTe: 'దాచబడిన వెబ్‌సైట్',
      titleEn: 'Inspect the destination before opening shortened links',
      titleTe: 'షార్ట్ లింక్స్‌ను నేరుగా తెరవకుండా గమ్యాన్ని తనిఖీ చేయండి',
      descriptionEn: 'Shortened URLs (like bit.ly) hide the true website. Do not enter logins unless you are sure of the final destination domain.',
      descriptionTe: 'షార్ట్ లింకులు అసలు వెబ్‌సైట్‌ను కప్పిపుచ్చుతాయి. పూర్తి అడ్రస్ తెలుసుకోకుండా ఎలాంటి వ్యక్తిగత సమాచారం ఇవ్వకండి.'
    });
  }

  if (!result.isHttps) {
    steps.push({
      id: 'act-url-insecure-http',
      priority: 'high',
      actionType: 'password_reset',
      badgeEn: 'Unencrypted Channel',
      badgeTe: 'ఎన్‌క్రిప్షన్ లేని సైట్',
      titleEn: 'Never submit credit cards or passwords over unencrypted HTTP',
      titleTe: 'సాధారణ HTTP సైట్లలో పాస్‌వర్డ్‌లు లేదా కార్డులు ఇవ్వకండి',
      descriptionEn: 'This link lacks HTTPS encryption. Any passwords or private data submitted can be easily intercepted by anyone sharing your network or Wi-Fi.',
      descriptionTe: 'ఈ సైట్‌లో సురక్షితమైన HTTPS లాక్ లేదు. ఇందులో టైప్ చేసిన పాస్‌వర్డ్‌లు ఇతరులు సులభంగా కాపీ చేయవచ్చు.'
    });
  }

  if (risk < 30 || steps.length === 0) {
    steps.push({
      id: 'act-url-low-risk-caution',
      priority: 'general',
      actionType: 'low_risk_caution',
      badgeEn: 'Safety Reminder',
      badgeTe: 'భద్రతా గమనిక',
      titleEn: 'Standard patterns detected, but always verify before logging in',
      titleTe: 'సాధారణ సైట్‌గా కనిపిస్తోంది, కానీ లాగిన్ అయ్యేముందు సరిచూసుకోండి',
      descriptionEn: 'This URL has no known red flags, but even legitimate websites can occasionally be compromised. Always check the browser address bar for spelling and certificate validity.',
      descriptionTe: 'ఈ లింక్‌లో ఎలాంటి ప్రమాదకర లక్షణాలు లేవు. అయినా సరే, లాగిన్ అయ్యేటప్పుడు బ్రౌజర్ అడ్రస్ బార్‌లో స్పెల్లింగ్ సరిగ్గా ఉందో లేదో చూడండి.'
    });
  }

  return steps;
}
