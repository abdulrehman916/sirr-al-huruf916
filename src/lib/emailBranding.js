/**
 * EMAIL BRANDING CONFIGURATION
 * 
 * Centralized configuration for all customer-facing email branding.
 * Never expose personal email addresses - use branded addresses only.
 * 
 * After domain verification, update the SUPPORT_EMAIL and NOREPLY_EMAIL
 * values here without changing any email templates in the codebase.
 */

export const EMAIL_BRANDING = {
  // ── SENDER IDENTITIES ──────────────────────────────────────────────
  
  /**
   * Support email address (customer-facing)
   * Update after domain verification: support@yourdomain.com
   */
  SUPPORT_EMAIL: "support@sirralhuruf.com",
  
  /**
   * No-reply email address (automated emails)
   * Update after domain verification: noreply@yourdomain.com
   */
  NOREPLY_EMAIL: "noreply@sirralhuruf.com",
  
  /**
   * Admin email address (internal only - never shown to customers)
   * This is the ONLY place owner personal email is stored
   */
  ADMIN_EMAIL: "abdulrehmanrehman916@gmail.com",
  
  /**
   * Sender display name (appears in "From:" field)
   * All customer emails use this branding
   */
  SENDER_NAME: "Sirr al-Huruf",
  
  /**
   * Support team display name
   * Used in customer service communications
   */
  SUPPORT_TEAM_NAME: "Sirr al-Huruf Support",
  
  // ── BRANDING ELEMENTS ──────────────────────────────────────────────
  
  /**
   * App name (used in email signatures, footers, logos)
   */
  APP_NAME: "Sirr al-Huruf",
  
  /**
   * App tagline (optional, used in email headers)
   */
  APP_TAGLINE: "Secret of Letters",
  
  /**
   * Copyright notice (email footers)
   */
  COPYRIGHT: "© Sirr al-Huruf. All rights reserved.",
  
  // ── PRIVACY & SECURITY RULES ───────────────────────────────────────
  
  /**
   * CRITICAL: Never expose these in customer-facing communications
   * This array is used for automated audits
   */
  PROTECTED_EMAILS: [
    "abdulrehmanrehman916@gmail.com",
    // Add any other personal/internal emails here
  ],
  
  /**
   * Email footer disclaimer (required by CAN-SPAM Act)
   * Add physical mailing address after domain verification
   */
  FOOTER_DISCLAIMER: "This is an automated message, please do not reply.",
  
  /**
   * Physical mailing address (add after business registration)
   * Currently null - update when available
   */
  MAILING_ADDRESS: null, // e.g., "Dubai, UAE" or full address
  
  // ── CUSTOMER SERVICE TEMPLATES ─────────────────────────────────────
  
  /**
   * WhatsApp support number (international format, no + or spaces)
   */
  WHATSAPP_SUPPORT: "971522308926",
  
  /**
   * WhatsApp display format
   */
  WHATSAPP_DISPLAY: "+971 52 230 8926",
  
  /**
   * Support hours (displayed to customers)
   */
  SUPPORT_HOURS: "24/7 Automated Support",
  
  /**
   * Expected response time
   */
  RESPONSE_TIME: "24-48 hours",
};

/**
 * Helper function to get sender identity for emails
 * @param {string} type - 'support' | 'noreply' | 'admin'
 * @returns {string} Formatted sender: "Sirr al-Huruf <email@domain.com>"
 */
export function getSenderIdentity(type = 'noreply') {
  const { SENDER_NAME, SUPPORT_EMAIL, NOREPLY_EMAIL, ADMIN_EMAIL } = EMAIL_BRANDING;
  
  switch (type) {
    case 'support':
      return `${SENDER_NAME} <${SUPPORT_EMAIL}>`;
    case 'admin':
      return ADMIN_EMAIL; // Internal use only
    case 'noreply':
    default:
      return `${SENDER_NAME} <${NOREPLY_EMAIL}>`;
  }
}

/**
 * Audit function to check if an email contains protected addresses
 * @param {string} email - Email address to check
 * @returns {boolean} True if email is protected (should not be exposed)
 */
export function isProtectedEmail(email) {
  return EMAIL_BRANDING.PROTECTED_EMAILS.includes(email);
}

/**
 * Get customer-facing support contact info
 * Safe to display anywhere in the application
 */
export function getSupportContact() {
  const { SUPPORT_TEAM_NAME, WHATSAPP_DISPLAY, SUPPORT_HOURS, RESPONSE_TIME } = EMAIL_BRANDING;
  
  return {
    teamName: SUPPORT_TEAM_NAME,
    whatsapp: WHATSAPP_DISPLAY,
    hours: SUPPORT_HOURS,
    responseTime: RESPONSE_TIME,
    email: EMAIL_BRANDING.SUPPORT_EMAIL
  };
}