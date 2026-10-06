import { useState, useEffect } from 'react';
import RulesConditions from '@/pages/RulesConditions';
import { RULES_STORAGE_KEY } from '@/lib/rulesContent';
import { persistGet, persistSet, persistRemove, isDevMode } from '@/lib/devModePersistence';
import { useAuth } from '@/lib/AuthContext';
import { ROLES } from '@/lib/rbac';
import { base44 } from '@/api/base44Client';

/**
 * Dev-only: clears ALL onboarding state (rules, splash, Google prompt)
 * so the developer can re-test the first-time user experience.
 * No effect in production.
 */
export function resetDevOnboarding() {
  if (!isDevMode) return;
  persistRemove(RULES_STORAGE_KEY);
  persistRemove('sirr_rules_accepted_date');
  persistRemove('sirr_onboarding_reset_date');
  persistRemove('sirr_google_prompt_dismissed');
  persistRemove('hasSeenSplash');
  try { sessionStorage.removeItem('hasSeenSplash'); } catch { /* ignore */ }
  try { sessionStorage.removeItem('sirr_onboarding_reset_cached'); } catch { /* ignore */ }
}

function DevResetButton() {
  const handleReset = () => {
    resetDevOnboarding();
    window.location.reload();
  };
  return (
    <button
      onClick={handleReset}
      className="fixed bottom-4 left-4 z-[9999] px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-40 hover:opacity-90 transition-opacity font-inter"
      style={{
        background: 'rgba(212,175,55,0.12)',
        border: '1px solid rgba(212,175,55,0.30)',
        color: 'rgba(212,175,55,0.70)',
      }}
      title="Reset all onboarding state (rules, splash, Google prompt) and reload"
    >
      🔄 DEV RESET
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#020710' }}>
      <div className="w-8 h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT-BASED ONBOARDING GATE
// ═══════════════════════════════════════════════════════════════
// Rules are shown ONLY ONCE per authenticated user, tied to the
// Google account (not the browser session).
//
// FLOW:
//   1. Guest (not authenticated) → no rules (render app directly)
//   2. Owner/Admin → always skip onboarding completely
//   3. Authenticated user, rules_accepted=true AND accepted after
//      last admin reset → skip (stored on account)
//   4. Authenticated user, not accepted OR accepted before last
//      admin reset → show RulesConditions
//   5. On accept → base44.auth.updateMe({ rules_accepted: true,
//      rules_accepted_date: now }) + localStorage cache
//
// ADMIN RESET:
//   The admin sets a system-wide onboarding_reset_date in SystemSettings
//   via the resetOnboarding backend function. Each user's
//   rules_accepted_date is compared to this timestamp. If the reset
//   date is newer, the user sees rules again.
//
// localStorage is a FAST-PATH cache only — the server-side flag on the
// user's account is the single source of truth.
// ═══════════════════════════════════════════════════════════════

const RESET_DATE_CACHE_KEY = 'sirr_onboarding_reset_date';
const RESET_DATE_SESSION_CACHE = 'sirr_onboarding_reset_cached';
const ACCEPTED_DATE_KEY = 'sirr_rules_accepted_date';

// Fetch the onboarding reset date from the server (cached in sessionStorage)
async function fetchOnboardingResetDate() {
  // Check sessionStorage cache first (5-minute TTL)
  try {
    const cached = sessionStorage.getItem(RESET_DATE_SESSION_CACHE);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expiresAt > Date.now()) {
        return parsed.date;
      }
    }
  } catch { /* ignore */ }

  // Fetch from server
  try {
    const res = await base44.functions.invoke('getOnboardingResetDate', {});
    const date = res.data?.onboarding_reset_date || null;
    // Cache in sessionStorage for 5 minutes
    try {
      sessionStorage.setItem(RESET_DATE_SESSION_CACHE, JSON.stringify({
        date,
        expiresAt: Date.now() + 5 * 60 * 1000,
      }));
    } catch { /* ignore */ }
    // Also cache in localStorage for fast-path comparison
    if (date) persistSet(RESET_DATE_CACHE_KEY, date);
    return date;
  } catch {
    return null;
  }
}

// Compare two ISO timestamps: returns true if `accepted` is after or equal to `reset`
function acceptedAfterReset(acceptedDate, resetDate) {
  if (!resetDate) return true; // No reset → any acceptance is valid
  if (!acceptedDate) return false; // No acceptance → not valid
  return new Date(acceptedDate).getTime() >= new Date(resetDate).getTime();
}

export default function RulesGate({ children }) {
  const { user, role, isAuthenticated, authResolved } = useAuth();
  const [localAccepted] = useState(() => persistGet(RULES_STORAGE_KEY) === 'true');
  const [localAcceptedDate] = useState(() => persistGet(ACCEPTED_DATE_KEY) || null);
  const [localResetDate] = useState(() => persistGet(RESET_DATE_CACHE_KEY) || null);
  const [showRules, setShowRules] = useState(false);
  const [gateResolved, setGateResolved] = useState(false);

  // ── Fetch onboarding reset date on mount ──
  const [serverResetDate, setServerResetDate] = useState(localResetDate);

  useEffect(() => {
    fetchOnboardingResetDate().then((date) => {
      setServerResetDate(date);
    });
  }, []);

  // ── Phase 2: When auth resolves, verify against the server ──
  useEffect(() => {
    if (!authResolved) return;

    // Owner/Admin → always skip onboarding completely
    if (role === ROLES.OWNER || role === ROLES.ADMIN) {
      persistSet(RULES_STORAGE_KEY, 'true');
      setShowRules(false);
      setGateResolved(true);
      return;
    }

    // Not authenticated → guests don't see rules (onboarding is post-login)
    if (!isAuthenticated) {
      setShowRules(false);
      setGateResolved(true);
      return;
    }

    // Authenticated guest → check server-side flag (tied to Google account)
    const userAccepted = user?.rules_accepted === true;
    const userAcceptedDate = user?.rules_accepted_date || null;
    const isValid = userAccepted && acceptedAfterReset(userAcceptedDate, serverResetDate);

    if (isValid) {
      persistSet(RULES_STORAGE_KEY, 'true');
      persistSet(ACCEPTED_DATE_KEY, userAcceptedDate);
      setShowRules(false);
      setGateResolved(true);
    } else {
      // Server says NOT accepted OR accepted before last admin reset → show rules
      persistRemove(RULES_STORAGE_KEY);
      persistRemove(ACCEPTED_DATE_KEY);
      setShowRules(true);
      setGateResolved(true);
    }
  }, [authResolved, role, isAuthenticated, user, serverResetDate]);

  // ── PREVIEW BYPASS ──
  // In Base44 Preview (dev mode), completely skip onboarding so every
  // build refresh opens directly to the working page. Production APK
  // is unaffected — isDevMode is false in production builds.
  if (isDevMode) {
    return (
      <>
        {children}
        <DevResetButton />
      </>
    );
  }

  // ── Phase 1: Fast path — localStorage cache says accepted AND
  //    accepted date is after the cached reset date ──
  // Render children immediately to prevent flash on refresh/navigation/reload.
  // Phase 2 (above) will verify against the server in the background.
  const fastPathValid = localAccepted && acceptedAfterReset(localAcceptedDate, localResetDate);

  if (fastPathValid && !gateResolved) {
    return (
      <>
        {children}
        {isDevMode && <DevResetButton />}
      </>
    );
  }

  // ── Loading: auth not resolved and no valid fast-path cache ──
  if (!gateResolved) {
    return <LoadingScreen />;
  }

  // ── Show Rules & Conditions (first login or after admin reset) ──
  if (showRules) {
    const handleAccept = async () => {
      const now = new Date().toISOString();
      // Persist acceptance to the authenticated user's account (tied to Google account)
      try {
        await base44.auth.updateMe({
          rules_accepted: true,
          rules_accepted_date: now,
        });
      } catch { /* best-effort — still proceed with local cache */ }
      // Set localStorage as fast-path cache for future visits
      persistSet(RULES_STORAGE_KEY, 'true');
      persistSet(ACCEPTED_DATE_KEY, now);
      setShowRules(false);
    };

    return (
      <RulesConditions
        mode="gate"
        onAccept={handleAccept}
      />
    );
  }

  // ── Normal operation: render the app ──
  return (
    <>
      {children}
      {isDevMode && <DevResetButton />}
    </>
  );
}