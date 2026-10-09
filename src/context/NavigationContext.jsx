import { createContext, useContext, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backDestination } from '@/lib/backNavigation';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBack = useRef(0);

  const startNav = useCallback(() => {
    // Trigger navigation animation/state if needed
  }, []);

  const navigateWithTransition = useCallback((to, options = {}) => {
    startNav();
    navigate(to, options);
  }, [startNav, navigate]);

  const goBack = useCallback((fallback) => {
    if (Date.now() - lastBack.current < 400) return;
    lastBack.current = Date.now();
    const destination = backDestination(window.history.state?.idx, location.pathname, location.search, typeof fallback === 'string' ? fallback : null);
    navigate(destination, destination === -1 ? undefined : { replace: true });
  }, [navigate, location.pathname, location.search]);

  return (
    <NavigationContext.Provider value={{ startNav, navigate: navigateWithTransition, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
