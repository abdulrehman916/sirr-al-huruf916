/**
 * ADMIN CONFIGURATION — Single source of truth for public routing settings.
 *
 * Emergency admin credentials must never be shipped to the browser. Owner and
 * admin access is enforced by Supabase profiles/RLS and server-side RPCs.
 */
export const ADMIN_CONFIG = {
  WHATSAPP_NUMBER: "971522308926",
  WHATSAPP_DISPLAY: "+971 52 230 8926",
  OWNER_EMAIL: "abdulrehmanrehman916@gmail.com",
  EMERGENCY_ADMIN_CODES: [],
};
