import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { platform, supabase } from '@/api/platformClient';
import { ROLES } from '@/lib/rbac';
import { persistRemove } from '@/lib/devModePersistence';
import { clearLocalSession, setLocalPermissions } from '@/lib/sessionId';
import { AuthContext } from '@/lib/authContextObject';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [role, setRole] = useState(ROLES.GUEST);
  const [adminProfileLoading, setAdminProfileLoading] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [authError, setAuthError] = useState(null);
  const generation = useRef(0);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    const attempt = ++generation.current;
    const current = () => alive.current && generation.current === attempt;
    try {
      const account = await platform.auth.me();
      if (!current()) return;
      if (!account) {
        clearLocalSession();
        setAuthError(null);
        setUser(null); setIsAuthenticated(false); setAdminProfile(null); setRole(ROLES.GUEST);
        return;
      }
      let profile = null;
      let nextRole = account.role === 'owner' ? ROLES.OWNER : ROLES.CUSTOMER;
      const { error: claimError } = await supabase.rpc('claim_base44_legacy_data');
      if (claimError) throw claimError;
      const response = await platform.functions.invoke('loadLinkedPermissions', {});
      if (!current()) return;
      setLocalPermissions(response.data?.permissions || []);
      setUser(account); setIsAuthenticated(true); setAdminProfile(profile); setRole(nextRole);
      setAuthError(null);
    } catch (error) {
      if (!current()) return;
      clearLocalSession();
      setUser(null); setIsAuthenticated(false); setAdminProfile(null); setRole(ROLES.GUEST);
      setAuthError(error.message || 'Login പരിശോധിക്കാൻ കഴിഞ്ഞില്ല.');
    } finally {
      if (current()) { setAdminProfileLoading(false); setAuthResolved(true); }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    refresh();
    const timers = new Set();
    const { data } = supabase?.auth.onAuthStateChange(() => {
      const timer = window.setTimeout(() => { timers.delete(timer); refresh(); }, 0);
      timers.add(timer);
    }) || {};
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive.current = false; generation.current++;
      data?.subscription?.unsubscribe();
      timers.forEach(window.clearTimeout);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (role !== ROLES.OWNER) return;
    import('@/lib/pageSync').then(({ syncPages }) => syncPages().catch(() => {}));
    import('@/lib/moduleSync').then(({ syncModules }) => syncModules().catch(() => {}));
  }, [role]);

  const logout = async () => {
    generation.current++;
    clearLocalSession();
    setUser(null); setIsAuthenticated(false); setAdminProfile(null); setRole(ROLES.GUEST);
    try { persistRemove('sirr_admin_session'); persistRemove('sirr_google_prompt_dismissed'); } catch { /* optional preferences */ }
    await platform.auth.logout();
  };

  return <AuthContext.Provider value={{
    user, isAuthenticated, adminProfile, role, adminProfileLoading,
    isLoadingAuth: !authResolved, authResolved, isLoadingPublicSettings: false,
    authError, appPublicSettings: null, authChecked: authResolved, logout,
    navigateToLogin: () => { window.location.assign('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search)); },
    checkUserAuth: refresh, checkAppState: refresh,
  }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
