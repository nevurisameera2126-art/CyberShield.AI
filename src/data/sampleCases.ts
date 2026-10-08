export interface MessageSample {
  id: string;
  title: string;
  type: 'scam' | 'suspicious' | 'normal';
  preview: string;
  fullText: string;
}

export interface UrlSample {
  id: string;
  title: string;
  type: 'malicious' | 'suspicious' | 'safe';
  url: string;
  description: string;
}

export const SAMPLE_MESSAGES: MessageSample[] = [
  {
    id: 'sample-msg-bank-otp',
    title: 'Urgent Bank OTP Lock (Scam)',
    type: 'scam',
    preview: 'Wells Fargo urgent notice requesting 6-digit OTP',
    fullText: 'URGENT SECURITY ALERT: Wells Fargo account #8821 has been restricted due to unrecognized device login in Moscow, RU. Reply immediately with the 6-digit verification code sent to your phone to cancel this transfer and preserve your funds: http://wellsfargo-verify-account.biz'
  },
  {
    id: 'sample-msg-lottery',
    title: 'Anniversary Lottery Winner (Scam)',
    type: 'scam',
    preview: 'Unsolicited $50,000 cash prize with claim link',
    fullText: 'CONGRATULATIONS! You have been randomly selected as our 2nd prize winner for the Walmart 60th Anniversary Customer Giveaway! You won $50,000 in cash. Claim your cash prize immediately before it expires in 2 hours: http://walmart-cash-reward2026.top/claim'
  },
  {
    id: 'sample-msg-irs-arrest',
    title: 'IRS Arrest Warrant Threat (Scam)',
    type: 'scam',
    preview: 'Tax penalty summons demanding immediate gift card settlement',
    fullText: 'FINAL LEGAL NOTICE: IRS Notice of Intent to Levy. An arrest warrant has been approved for tax evasion ($3,280.00). Police will be dispatched to your residence within 2 hours unless settled immediately via Apple Gift Card or Bitcoin deposit. Call our federal agent desk at 1-800-555-0199 now.'
  },
  {
    id: 'sample-msg-delivery-fee',
    title: 'Postal Delivery Redirection (Suspicious)',
    type: 'suspicious',
    preview: 'Incomplete package delivery fee notification',
    fullText: 'USPS Notice: Your parcel package #US940283 cannot be delivered due to an incomplete street address. Please update your address and pay the $1.95 redelivery fee to avoid return to sender: http://track-usps-redelivery.info/pay'
  },
  {
    id: 'sample-msg-normal-coffee',
    title: 'Friend Coffee Catch-up (Normal)',
    type: 'normal',
    preview: 'Ordinary casual message from a friend',
    fullText: 'Hey Alex! Are we still on for coffee tomorrow at 10 AM at the corner bakery? Let me know if you need to reschedule or want to grab lunch instead.'
  },
  {
    id: 'sample-msg-normal-library',
    title: 'University Library Reminder (Normal)',
    type: 'normal',
    preview: 'Informational academic loan reminder',
    fullText: 'Campus Library Notification: Your checked-out book "Introduction to Computer Networking" is due in 3 days on Friday. You can renew your loan through your standard student university account portal.'
  }
];

export const SAMPLE_URLS: UrlSample[] = [
  {
    id: 'sample-url-ip',
    title: 'Direct IP Address with Login Script',
    type: 'malicious',
    url: 'http://192.168.1.45/secure/login.php?session=active',
    description: 'Raw IP address host with unencrypted HTTP login script.'
  },
  {
    id: 'sample-url-typosquat',
    title: 'Brand Impersonation (PayPal Typosquat)',
    type: 'malicious',
    url: 'https://paypa1-account-security-update.com/verify-identity',
    description: 'Replaces letter "l" with digit "1" and uses fake hyphenated security phrasing.'
  },
  {
    id: 'sample-url-at-symbol',
    title: 'Credential Deception (@ Symbol Trick)',
    type: 'malicious',
    url: 'http://apple.com@scam-auth-server.xyz/icloud/signin',
    description: 'Tricks users into seeing apple.com, while the browser actually connects to scam-auth-server.xyz.'
  },
  {
    id: 'sample-url-shortener',
    title: 'Obfuscated Link (URL Shortener)',
    type: 'suspicious',
    url: 'https://bit.ly/3xSuspiciousBankPortal',
    description: 'Conceals the true destination server behind a third-party shortener.'
  },
  {
    id: 'sample-url-google',
    title: 'Official Google Portal (Standard)',
    type: 'safe',
    url: 'https://www.google.com',
    description: 'Standard, genuine HTTPS verified domain.'
  },
  {
    id: 'sample-url-wiki',
    title: 'Wikipedia Educational Article (Standard)',
    type: 'safe',
    url: 'https://en.wikipedia.org/wiki/Phishing',
    description: 'Legitimate encyclopedia reference with HTTPS encryption.'
  }
];
