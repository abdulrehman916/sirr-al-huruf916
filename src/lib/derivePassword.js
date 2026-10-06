// Deterministic password for OTP-based authentication.
// Both Onboarding and OTPLogin use the same password so loginViaEmailPassword works.
export function derivePassword(email) {
  // Simple hash of email to produce a consistent, platform-compatible password
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  const suffix = Math.abs(hash).toString(36).padStart(6, '0');
  return `Sah${suffix}!A1`;
}