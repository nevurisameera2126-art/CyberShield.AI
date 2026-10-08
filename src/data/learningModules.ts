import { LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'phishing',
    title: 'Phishing & Smishing Attacks',
    category: 'General',
    iconName: 'Fish',
    summary: 'Deceptive messages designed to trick you into revealing passwords, credit cards, or two-factor codes.',
    definition:
      'Phishing is a cyber attack where criminals impersonate trustworthy institutions (like your bank, delivery services, or employers) via email, SMS ("smishing"), or voice calls ("vishing") to steal confidential information.',
    realWorldScenario:
      'A user receives an SMS: "USPS Alert: Package pending delivery due to incorrect street number. Click here within 12 hours to update address and pay $1.50 handling fee." The link opens an exact clone of the USPS website with a credit card form. Once entered, the card details are harvested immediately.',
    preventionTips: [
      'Check the actual domain name in the address bar, not just the brand logo displayed on the page.',
      'Never give away One-Time Passwords (OTPs) or PINs over SMS or phone calls.',
      'Navigate to services independently by typing the official address directly or using trusted bookmarked links.',
      'Be wary of messages claiming your account will be deleted, suspended, or fined unless you act immediately.'
    ],
    quiz: [
      {
        id: 'q-phishing-1',
        question: 'Your bank texts you that your account has been locked and tells you to reply with your 6-digit OTP code. What should you do?',
        options: [
          'Reply immediately with the code so your funds are not frozen.',
          'Never share the code. Call the bank using the official phone number on the back of your card.',
          'Click any link in the text to inspect the lock reason.',
          'Forward the code to your friend to test if it works.'
        ],
        correctIndex: 1,
        explanation: 'Banks will never ask you to text or read back your one-time authentication codes. That code is what allows someone to break into your account.'
      },
      {
        id: 'q-phishing-2',
        question: 'Which of the following is a classic indicator of a smishing (SMS phishing) attempt?',
        options: [
          'The message includes your full legal name and references a purchase made in a physical store.',
          'The message uses high urgency, an unfamiliar shortened URL, and threatens immediate penalties.',
          'The message comes from a contact saved in your phonebook with an ordinary casual greeting.',
          'The message informs you of an appointment you booked yesterday.'
        ],
        correctIndex: 1,
        explanation: 'Scammers heavily rely on artificial time pressure, vague threats, and deceptive links to induce rapid action before critical thinking kicks in.'
      }
    ]
  },
  {
    id: 'malware-ransomware',
    title: 'Malware & Ransomware',
    category: 'General',
    iconName: 'ShieldAlert',
    summary: 'Harmful software that infects your computer, steals sensitive files, or encrypts your data for ransom.',
    definition:
      'Malware ("malicious software") covers viruses, spyware, keyloggers, and trojans. Ransomware is a specialized type of malware that locks down your personal files with military-grade encryption and demands payment (usually cryptocurrency) to restore them.',
    realWorldScenario:
      'A hospital employee downloads an email attachment labeled "Invoice_March_Final.pdf.exe" believing it to be a billing report. The executable runs silently in the background, encrypting patient health records across the hospital network and displaying a desktop popup demanding $250,000 in Bitcoin.',
    preventionTips: [
      'Never open executable files (.exe, .scr, .bat, .vbs) received in email attachments or unsolicited messages.',
      'Maintain automated offline backups of critical photos, documents, and business files.',
      'Keep your Operating System and installed browsers updated with the latest security patches.',
      'Enable built-in antivirus software (such as Windows Defender or macOS Gatekeeper) and avoid pirated software.'
    ],
    quiz: [
      {
        id: 'q-malware-1',
        question: 'What is the most reliable defense against catastrophic data loss caused by ransomware?',
        options: [
          'Paying the ransom immediately using anonymous cryptocurrency.',
          'Maintaining regular, verified, isolated offline or cloud versioned backups.',
          'Renaming infected files to .txt format.',
          'Leaving the computer turned off for 48 hours.'
        ],
        correctIndex: 1,
        explanation: 'If your computer is infected with ransomware, offline/isolated backups let you wipe and restore your system without funding extortionists.'
      }
    ]
  },
  {
    id: 'sql-injection',
    title: 'SQL Injection (SQLi)',
    category: 'Web Security',
    iconName: 'Database',
    summary: 'A web vulnerability where attackers manipulate database queries to view or delete private data.',
    definition:
      'SQL Injection occurs when user input is concatenated directly into database commands without proper sanitization. Attackers can inject rogue SQL syntax (like "\' OR \'1\'=\'1") to bypass authentication, expose secret databases, or alter balances.',
    realWorldScenario:
      'An online store has a login form with the query: `SELECT * FROM users WHERE user=\'\' AND pass=\'\'`. An attacker inputs `admin\' --` into the username field. The database interprets `--` as a comment, completely skipping password verification and logging the attacker directly into the administrator console.',
    preventionTips: [
      'Always use Parameterized Queries (Prepared Statements) or Object-Relational Mappers (ORMs).',
      'Never concatenate raw user strings directly into SQL commands.',
      'Follow the Principle of Least Privilege: ensure database accounts have only the bare minimum permissions needed.',
      'Use robust input validation frameworks and Web Application Firewalls (WAFs).'
    ],
    quiz: [
      {
        id: 'q-sqli-1',
        question: 'What is the gold standard method to prevent SQL Injection in backend web development?',
        options: [
          'Hiding the database behind an obscure port number.',
          'Using Parameterized Queries (Prepared Statements) so input is never treated as executable SQL code.',
          'Storing all user passwords in plaintext for faster lookup.',
          'Limiting the login page input box to 15 characters.'
        ],
        correctIndex: 1,
        explanation: 'Parameterized queries treat user input strictly as parameters/data rather than executable command tokens, preventing malicious syntax alteration.'
      }
    ]
  },
  {
    id: 'brute-force',
    title: 'Brute-Force & Credential Stuffing',
    category: 'Identity',
    iconName: 'KeyRound',
    summary: 'Automated trial-and-error tools testing millions of password combinations until one succeeds.',
    definition:
      'Brute-force attacks use automated bots to systematically guess login credentials. Credential stuffing is a common variation where bots test millions of stolen username/password pairs leaked from past database breaches across other popular websites.',
    realWorldScenario:
      'A user reuses the password "Summer2024!" on both a small gaming forum and their primary email. When the gaming forum suffers a data breach, hackers load the leaked list into automated credential-stuffing software and test it against banking and email portals, successfully compromising the user\'s primary email.',
    preventionTips: [
      'Never reuse passwords across different accounts or websites.',
      'Enable Multi-Factor Authentication (MFA) on every important service.',
      'Use a password manager to generate and store long, random passwords (16+ characters).',
      'Services should implement account lockouts, rate limiting, and CAPTCHA protections after repeated failed attempts.'
    ],
    quiz: [
      {
        id: 'q-brute-1',
        question: 'Why is reusing the same strong password across multiple websites dangerous?',
        options: [
          'It takes too much computer memory to save one password.',
          'If any single website gets breached, attackers can use your password to unlock all your other accounts.',
          'Websites can automatically detect duplicate passwords and will ban your IP address.',
          'Long passwords cause network latency.'
        ],
        correctIndex: 1,
        explanation: 'This is the core premise of credential stuffing: criminals test credentials leaked from one compromised site against dozens of major services.'
      }
    ]
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering & Pretexting',
    category: 'General',
    iconName: 'Users',
    summary: 'The psychological manipulation of people into performing actions or divulging confidential information.',
    definition:
      'Rather than breaking into code, social engineers exploit human nature—such as trust, fear, helpfulness, curiosity, or obedience to authority—to gain physical or digital access to sensitive systems.',
    realWorldScenario:
      'An attacker phones a company receptionist pretending to be the CEO in an airport: "I am boarding an urgent flight and my laptop died! Please email me the employee quarterly salary spreadsheet immediately or this merger will fall through!" Stressed and intimidated, the employee complies without verification.',
    preventionTips: [
      'Implement strict multi-person verification procedures for financial wire transfers and confidential data requests.',
      'Be cautious of callers demanding you bypass standard security protocols for "emergencies".',
      'Verify the requester\'s identity using an established, independent internal contact method.',
      'Never plug found USB drives ("baiting") into your computer.'
    ],
    quiz: [
      {
        id: 'q-social-1',
        question: 'You find an unlabelled USB flash drive in the office parking lot marked "Confidential Salaries". What is the safest course of action?',
        options: [
          'Plug it into your work laptop to see who lost it and return it.',
          'Hand it over to IT Security or office facilities without plugging it into any device.',
          'Plug it into your personal home computer instead.',
          'Format the drive immediately so you can reuse it.'
        ],
        correctIndex: 1,
        explanation: 'This is a classic "baiting" social engineering tactic. Attackers leave malware-loaded flash drives hoping curiosity will prompt someone to plug it in.'
      }
    ]
  },
  {
    id: 'password-mfa',
    title: 'Password Security & Multi-Factor Auth (MFA)',
    category: 'Identity',
    iconName: 'Lock',
    summary: 'Creating uncrackable credentials and protecting accounts with an essential second layer of verification.',
    definition:
      'Multi-Factor Authentication (MFA) requires two or more distinct types of evidence to log in: something you know (password), something you have (authenticator app, security key), or something you are (biometrics/fingerprint).',
    realWorldScenario:
      'Even though an employee\'s password was compromised in a phishing campaign, the attacker was unable to sign in because the account required an approval prompt generated by an Authenticator App on the employee\'s registered smartphone.',
    preventionTips: [
      'Prefer app-based authenticator apps (like Google Authenticator or hardware FIDO2 keys) over SMS text codes when available.',
      'Use memorable passphrases with 4 or more random words (e.g., "correct-horse-battery-staple").',
      'Use a trusted password manager (1Password, Bitwarden, etc.) so you only need to remember one master password.',
      'Store emergency recovery codes securely offline.'
    ],
    quiz: [
      {
        id: 'q-mfa-1',
        question: 'Why is an Authenticator App (TOTP) safer than SMS text message verification for 2FA?',
        options: [
          'SMS codes are too short to be secure.',
          'SMS codes can be intercepted through SIM-swapping or cellular network flaws; authenticator apps generate codes locally on your device.',
          'Authenticator apps require an internet connection at all times.',
          'SMS text messages expire after 10 seconds.'
        ],
        correctIndex: 1,
        explanation: 'Criminals can perform SIM-swap attacks by tricking mobile carriers into redirecting your phone number. Authenticator app seeds reside safely inside your physical device.'
      }
    ]
  },
  {
    id: 'network-security',
    title: 'Network Security & Public Wi-Fi',
    category: 'Network',
    iconName: 'Wifi',
    summary: 'Guarding data streams across local networks, routers, and unsecured public coffee shop hotspots.',
    definition:
      'Network security encompasses rules, configurations, and tools to safeguard computer networks against unauthorized access, eavesdropping, and Man-in-the-Middle (MitM) interceptions.',
    realWorldScenario:
      'At an airport terminal, an attacker sets up a rogue Wi-Fi hotspot named "Airport_Free_HighSpeed_WiFi". Travelers connect without thinking. The attacker uses packet sniffing software to monitor unencrypted web traffic and spoof DNS queries to redirect travelers to counterfeit login pages.',
    preventionTips: [
      'Avoid conducting sensitive financial transactions or banking on unencrypted public Wi-Fi networks.',
      'Use a reputable Virtual Private Network (VPN) when connecting over public or shared internet.',
      'Change default administrator usernames and passwords on your home Wi-Fi router.',
      'Turn off automatic Wi-Fi connections on your phone so it doesn\'t connect to rogue access points automatically.'
    ],
    quiz: [
      {
        id: 'q-network-1',
        question: 'What is a "Man-in-the-Middle" (MitM) attack in the context of unsecured Wi-Fi?',
        options: [
          'An attacker physically unplugs your Ethernet cable.',
          'An attacker positions themselves between your device and the internet router to intercept or manipulate data in transit.',
          'An attacker calls you pretending to be your internet service provider.',
          'An attacker guesses your computer\'s lock screen PIN.'
        ],
        correctIndex: 1,
        explanation: 'On open or malicious networks, an attacker can secretly relay and possibly alter communications between two parties who believe they are communicating directly.'
      }
    ]
  },
  {
    id: 'safe-browsing',
    title: 'Safe Web Browsing Hygiene',
    category: 'Web Security',
    iconName: 'Globe',
    summary: 'Best practices for navigating the web without getting caught by rogue extensions, drive-by downloads, or fake popups.',
    definition:
      'Safe browsing refers to proactive habits and browser configuration settings that prevent malicious scripts, deceptive redirects, and intrusive ad-trackers from compromising your web experience.',
    realWorldScenario:
      'While visiting a free movie streaming website, an aggressive browser popup appears: "VIRUS DETECTED! Your Windows 11 system has 5 trojans! Call Microsoft Tech Support at 1-800-XXX-XXXX immediately!" The popup is completely fake, designed to frighten the user into calling a fraudulent call center that charges hundreds of dollars for fake cleanup software.',
    preventionTips: [
      'Close unexpected "Virus Detected" browser popups immediately; your web browser cannot scan your hard drive for viruses.',
      'Audit your browser extensions regularly and install only reputable add-ons with millions of verified reviews.',
      'Keep your browser updated so known zero-day vulnerabilities in JavaScript and rendering engines are patched.',
      'Enable "Enhanced Protection" or strict phishing protections in your browser settings.'
    ],
    quiz: [
      {
        id: 'q-browsing-1',
        question: 'A website popup screams that your computer is infected with 7 viruses and tells you to call a toll-free number. What is true about this scenario?',
        options: [
          'The website is being helpful and has scanned your hard drive safely.',
          'Web pages cannot scan your computer\'s internal files; this is a common tech-support scam popup.',
          'You must call the number immediately to avoid police action.',
          'You should download whatever program the popup recommends.'
        ],
        correctIndex: 1,
        explanation: 'Web pages running in a browser sandbox have no permission or ability to run comprehensive antivirus scans on your hard drive. These popups are 100% psychological scams.'
      }
    ]
  },
  {
    id: 'data-privacy',
    title: 'Data Privacy & Digital Footprint',
    category: 'Data Protection',
    iconName: 'EyeOff',
    summary: 'Taking control of the digital breadcrumbs, personal data, and permissions you leave across the web.',
    definition:
      'Data privacy concerns your right and ability to control what information companies, data brokers, and trackers collect about your habits, location, relationships, and identity.',
    realWorldScenario:
      'A user downloads a casual flashlight mobile app. During setup, the app requests access to contacts, precise GPS location, microphone, and call logs. The app creator packages and sells this location tracking data to commercial data brokers without the user realizing it.',
    preventionTips: [
      'Review app permissions: never grant location, microphone, or contacts access unless strictly necessary for core functionality.',
      'Check breach notification portals (like HaveIBeenPwned) to see if your email address has appeared in corporate database leaks.',
      'Opt out of commercial data broker aggregation sites where applicable.',
      'Regularly clear tracking cookies or use privacy-respecting browser settings and container tabs.'
    ],
    quiz: [
      {
        id: 'q-privacy-1',
        question: 'A simple calculator app requests permission to access your smartphone\'s Contacts and Microphone. What is the safest response?',
        options: [
          'Grant permission because apps always need standard permissions to run properly.',
          'Deny permissions or uninstall the app, as a calculator has zero legitimate reason to access contacts or audio.',
          'Allow access only while charging the phone.',
          'Provide fake contacts manually.'
        ],
        correctIndex: 1,
        explanation: 'The principle of least privilege dictates that software should only receive permissions essential to its core purpose. A calculator requesting microphone access is a serious red flag.'
      }
    ]
  }
];
