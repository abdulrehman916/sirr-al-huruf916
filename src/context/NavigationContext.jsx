import { createContext, useContext, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const navigate = useNavigate();

  const startNav = useCallback(() => {
    // Trigger navigation animation/state if needed
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const navigateWithTransition = useCallback((to, options = {}) => {
    startNav();
    navigate(to, options);
  }, [startNav, navigate]);

  return (
    <NavigationContext.Provider value={{ startNav, navigate: navigateWithTransition }}>
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