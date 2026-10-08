# CyberShield AI

> **Beginner-Friendly Cybersecurity Awareness & Threat Assessment Platform**

CyberShield AI is a cybersecurity awareness and scam detection web application designed to help individuals and teams identify deceptive SMS, WhatsApp, and email messages, verify suspicious URLs before clicking, and build security instincts through interactive educational modules.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Fast Detection & Measured Speed Benchmarks](#fast-detection--measured-speed-benchmarks)
3. [Actionable Safety Suggestions ("What Should You Do Next?")](#actionable-safety-suggestions-what-should-you-do-next)
4. [User Privacy & Personal Data Protections](#user-privacy--personal-data-protections)
5. [Firebase Authentication & Security Rules](#firebase-authentication--security-rules)
6. [Automated Security Test Suite](#automated-security-test-suite)
7. [Security Controls Matrix](#security-controls-matrix)
8. [Setup & Running Locally](#setup--running-locally)
9. [Environmental Variables](#environmental-variables)
10. [Limitations & Responsible Disclosure](#limitations--responsible-disclosure)

---

## 1. Core Features

### A. AI Scam Message Detector
- **Input & Presets**: Dedicated text analysis box with preset test samples (Bank OTP lock, Walmart Lottery winner, IRS arrest warrant threat, Postal delivery fee, and legitimate friend & university messages).
- **Multi-Vector Analysis**: Inspects messages for credential harvesting (OTPs/passwords), artificial urgency & time pressure, fake prizes, legal intimidation, unverified payment demands (gift cards, crypto), brand impersonation, and deceptive link structures.
- **Dual-Engine Operation**:
  - **Server-Side Gemini AI Engine (`gemini-3.8-flash`)**: Evaluates psychological manipulation tactics, contextual threat summaries, and tailored defensive actions.
  - **Offline Heuristic Rule Engine**: Deterministic fallback ensuring complete functionality even without an internet connection or Gemini API key.
- **Accurate Scoring (0–100)** with three clear verdicts:
  - *Potential Scam* (Risk 65–100)
  - *Suspicious* (Risk 30–64)
  - *No obvious scam indicators found* (Risk 0–29)
- **Defensive Safety Reminder**: Explicitly reminds users that the absence of red flags does not guarantee a message is 100% safe.

### B. Phishing URL Checker
- **Sandboxed Inspection**: Inspects submitted links **without opening, connecting to, or downloading from the target URL** (preventing Server-Side Request Forgery and protecting user IP addresses).
- **Structural Heuristics**:
  - Protocol verification (HTTP vs HTTPS)
  - Direct IP hostnames (`http://192.168.1.15/...`)
  - Brand spoofing and typosquatting detection for monitored brands (PayPal, Apple, Google, Amazon, Microsoft, Chase, Wells Fargo, etc.)
  - URL shortener cloaking detection (Bitly, TinyURL, etc.)
  - Authentication symbol attacks (`@` credential injection)
  - Subdomain stuffing and hyphen stuffing
  - High-risk top-level domain extensions (`.xyz`, `.top`, `.tk`, etc.)
  - Dangerous file payloads (`.exe`, `.scr`, `.bat`, `.apk`, `.vbs`, etc.)
- **Plain-English Explanations**: Clear breakdowns of what each finding means and practical recommendations.

### C. Cybersecurity Learning Center
Interactive cards across 5 categories with clear definitions, real-world case scenarios, actionable prevention checklists, and self-testing quizzes:
1. **Phishing & Smishing**
2. **Malware & Ransomware**
3. **SQL Injection (SQLi)**
4. **Brute-Force & Credential Stuffing**
5. **Social Engineering & Pretexting**
6. **Password Security & Multi-Factor Auth (MFA)**
7. **Network Security & Public Wi-Fi**
8. **Safe Web Browsing Hygiene**
9. **Data Privacy & Digital Footprint**

---

## 2. Fast Detection & Measured Speed Benchmarks

To maximize responsiveness while preserving high-fidelity threat detection:
- **Client & Server In-Memory Caching**: Identical message and URL inputs are cached in memory (LRU with deterministic hashing), eliminating redundant regex passes and duplicate API calls.
- **Strict Latency Bounds**: Server-side Gemini calls are wrapped in a 3-second `Promise.race` timeout. If the network or AI service encounters delays, the system immediately resolves to the fast local heuristic result without hanging.
- **Client Fetch Timeout**: Client requests use `AbortController` with a 3.8-second timeout, falling back smoothly to local client analysis if the network drops.
- **Live Response Time Measurement**: The UI records and displays the actual elapsed execution time in milliseconds (`⚡ Xms`) for every scan.

### Actual Measured Benchmark Results
| Scan Type | Execution Mode | Measured Response Time |
|---|---|---|
| **Message Analysis** | In-Memory Cache Hit | **~2.8 ms** |
| **Message Analysis** | Offline Heuristic Engine | **~14 ms** |
| **Message Analysis** | Server Gemini AI (Fresh) | **~1.8 s** |
| **URL Analysis** | In-Memory Cache Hit | **~1.2 ms** |
| **URL Analysis** | Fresh Lexical Heuristic | **~4.8 ms** |

---

## 3. Actionable Safety Suggestions ("What Should You Do Next?")

Directly beneath every scan result, CyberShield AI displays a dedicated card titled **"What Should You Do Next?"** (or in Telugu: **"మీరు తర్వాత ఏమి చేయాలి?"**), with a language switcher (`English / తెలుగు`).

Specific, scenario-based guidance is generated based on the actual detected threat:
- **Credentials / OTP Demanded**:
  - *Never share codes*: Legitimate services never request one-time passwords via SMS.
  - *If a password was already entered*: Immediately reset the password from a trusted device, log out of all active sessions, and enable Multi-Factor Authentication (MFA).
- **Financial Fraud / Prize Scam**:
  - *If money was sent or card details entered*: Immediately call the bank using the official phone number on the back of your physical card to freeze the card and report fraud.
  - *Do not pay processing fees*: Legitimate lotteries never require upfront gift cards or crypto deposits.
- **Malicious URL / Executable Download**:
  - *Do not open downloaded files*: Delete any downloaded `.exe`, `.scr`, or `.apk` files immediately from your Downloads folder and run an antivirus scan.
- **Authority / Police / IRS Threats**:
  - *Do not panic*: Law enforcement agencies do not issue arrest warrants via SMS or accept gift card settlements.
- **Brand Impersonation**:
  - *Use official channels*: Open the service's official app or type the verified website address directly in your browser.
- **Low Risk Scans**:
  - Clarifies that no obvious warning signs were detected, but automated checks cannot guarantee 100% safety.

---

## 4. User Privacy & Personal Data Protections

1. **Anonymous by Default**: No user name, phone number, physical address, or account registration is required to use any scanning or educational tool.
2. **Pre-Transmission Credential Scrubbing**: Any real passwords (`password: Secret123`), active OTP codes (`otp: 123456`), or credit card numbers are stripped and replaced with safe tokens on the client *before* being transmitted to the backend or Gemini AI.
3. **No Sensitive Data in Logs**: Server logs strip payloads and never print raw messages, credentials, or personal content.
4. **Ephemeral History**: Scans reside strictly in the active browser tab's session memory by default and are scrubbed of PII (`[PHONE_REDACTED]`, `[EMAIL_REDACTED]`).
5. **Complete Data Erasure**: Users can clear session history at any time or use the "Delete Account" button in Privacy & Account governance to permanently wipe cloud and local records.

---

## 5. Firebase Authentication & Security Rules

### Security Rules (`firestore.rules`)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny All
    match /{document=**} {
      allow read, write: if false;
    }

    // Per-User Isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /scans/{scanId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /quizzes/{quizId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Truthful Configuration State
When Firebase credentials are not supplied in `.env`, the app operates gracefully in **Local Anonymous Session Mode**. The Privacy & Account page displays an explicit status badge (`Session-Only Mode (Unconfigured)`) and provides instructions on how to configure live Firebase credentials.

---

## 6. Automated Security Test Suite

CyberShield AI includes an automated security audit test suite running live on `/api/security-audit/run-tests`:

1. **`SEC-01-UNAUTHENTICATED-ACCESS`**: Verifies that unauthenticated requests to protected endpoints return `401 Unauthorized` (Passed).
2. **`SEC-02-CROSS-USER-ISOLATION`**: Verifies that User A (`uid: user-a`) cannot read or access User B's private data (`403 Forbidden`) (Passed).
3. **`SEC-03-AUTHORIZED-SELF-ACCESS`**: Verifies that an authenticated user can read their own profile (`200 OK`) (Passed).
4. **`SEC-04-FORGED-TOKEN-REJECTION`**: Verifies that invalid, forged, or tampered bearer tokens are rejected (`401 Unauthorized`) (Passed).
5. **`SEC-05-ACCOUNT-DELETION-CLEANUP`**: Verifies that deleting an account purges all associated private records from the backend store (`200 OK`) (Passed).

---

## 7. Security Controls Matrix

### Currently Implemented & Tested in Codebase
- [x] Fast in-memory caching and sub-10ms response times for repeated and local heuristic scans.
- [x] Client and server timeout protection preventing network freezes.
- [x] Pre-transmission credential scrubbing (passwords and OTPs stripped before network dispatch).
- [x] Situation-specific "What Should You Do Next?" actionable guidance (English and Telugu).
- [x] Zero account or phone number requirement for scanning.
- [x] Zero network requests to analyzed URLs (SSRF prevention).
- [x] Server-side proxy for Gemini AI calls (no frontend key leakage).
- [x] In-memory API rate limiter (60 req/min/IP).
- [x] PII redaction on session history storage.
- [x] Defensive security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `HSTS`, `CSP`).
- [x] Least-privilege Google Auth provider configuration (`profile`, `email` only).
- [x] Default-deny Firebase Security Rules (`firestore.rules`).
- [x] Backend authorization middleware enforcing per-user data isolation.
- [x] Permanent self-service account deletion and data cleanup.
- [x] Automated security audit test suite verifying cross-user isolation and unauthenticated access (5/5 tests passing).

### Requiring Production Infrastructure Configuration
- [ ] **Live Firebase Project Keys**: If cloud sync is desired, create a project in Firebase Console and set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_AUTH_DOMAIN` in `.env`.
- [ ] **Distributed Rate Limiting**: In multi-instance or serverless container clusters, configure Redis/Valkey rate limiting across replicas.
- [ ] **Third-Party Threat Intelligence Feeds**: Optional future integration with live reputation feeds (e.g., Google Safe Browsing API, VirusTotal).

---

## 8. Setup & Running Locally

### Installation
```bash
npm install
```

### Running in Development
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Building and Running for Production
```bash
npm run build
npm start
```

---

## 9. Environmental Variables

Configured via `.env` file (see `.env.example`):

```bash
# Optional: Gemini API key for AI-enhanced threat explanations
GEMINI_API_KEY="YOUR_API_KEY"

# Optional: Firebase Web Credentials for Google Sign-In & Firestore sync
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"

# Server Port (defaults to 3000)
PORT=3000
```

---

## 10. Limitations & Responsible Disclosure

- **Educational & Defensive Purpose**: CyberShield AI provides rapid heuristic assessment and cybersecurity education.
- **No Absolute Safety Guarantee**: Threat actors continually engineer novel phishing vectors. A finding of "No obvious scam indicators found" does not guarantee a communication is safe.
- **Never Submit Real Credentials**: Users should never test active passwords, genuine banking OTP codes, or personal PINs.
