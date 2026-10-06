import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isDevMode } from '@/lib/devModePersistence';

const PageStateContext = createContext(null);
const STORAGE_KEY = 'app_navigation_state_v2';

// In dev mode (Base44 Preview), use localStorage so UI state survives
// full page reloads across build refreshes. In production, use
// sessionStorage (cleared when tab closes) as before.
const storage = isDevMode ? localStorage : sessionStorage;

export function PageStateProvider({ children }) {
  const [pageStates, setPageStates] = useState({});
  const [navStack, setNavStack] = useState([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPageStates(parsed.pageStates || {});
        setNavStack(parsed.navStack || []);
      }
    } catch (e) {
      console.warn('[PageState] Failed to load from sessionStorage:', e);
    }
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({
        pageStates,
        navStack,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('[PageState] Failed to save to sessionStorage:', e);
    }
  }, [pageStates, navStack]);

  const getPageState = useCallback((pageKey, defaultValue = {}) => {
    return pageStates[pageKey] ?? defaultValue;
  }, [pageStates]);

  const setPageState = useCallback((pageKey, newState) => {
    setPageStates(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        ...newState,
        _timestamp: Date.now()
      }
    }));
  }, []);

  const clearPageState = useCallback((pageKey) => {
    setPageStates(prev => {
      const next = { ...prev };
      delete next[pageKey];
      return next;
    });
  }, []);

  // Push navigation state to stack before navigating to detail
  const pushNavState = useCallback((pageKey, state) => {
    setNavStack(prev => [...prev, {
      pageKey,
      state: { ...state },
      timestamp: Date.now()
    }]);
  }, []);

  // Pop navigation state from stack when returning
  const popNavState = useCallback((pageKey) => {
    let popped = null;
    setNavStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.pageKey === pageKey || !pageKey) {
        popped = last;
        return prev.slice(0, -1);
      }
      return prev;
    });
    return popped;
  }, []);

  // Get last navigation state for a page
  const getLastNavState = useCallback((pageKey) => {
    for (let i = navStack.length - 1; i >= 0; i--) {
      if (navStack[i].pageKey === pageKey) {
        return navStack[i].state;
      }
    }
    return null;
  }, [navStack]);

  // Clear navigation stack (when user intentionally resets)
  const clearNavStack = useCallback(() => {
    setNavStack([]);
  }, []);

  return (
    <PageStateContext.Provider value={{
      getPageState,
      setPageState,
      clearPageState,
      pushNavState,
      popNavState,
      getLastNavState,
      clearNavStack,
      navStack
    }}>
      {children}
    </PageStateContext.Provider>
  );
}

export function usePageState() {
  const context = useContext(PageStateContext);
  if (!context) {
    throw new Error('usePageState must be used within PageStateProvider');
  }
  return context;
}

// Enhanced hook for scroll position persistence with pixel-perfect accuracy
export function useScrollPersist(pageKey = null) {
  const { getPageState, setPageState } = usePageState();
  const scrollContainerRef = useRef(null);
  const rafRef = useRef(null);

  const key = pageKey || `scroll_${window.location.pathname}`;

  useEffect(() => {
    const container = scrollContainerRef.current || document.querySelector('[data-scroll-container="true"]');
    if (!container) return;

    // Restore scroll position immediately
    const savedState = getPageState(key, {});
    const savedScroll = savedState.scrollPosition || savedState.scrollTop;
    
    if (typeof savedScroll === 'number' && !isNaN(savedScroll)) {
      // Use requestAnimationFrame for smooth restoration
      rafRef.current = requestAnimationFrame(() => {
        container.scrollTop = savedScroll;
      });
    }

    // Throttled scroll save using RAF
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const state = getPageState(key, {});
          setPageState(key, {
            scrollPosition: container.scrollTop,
            scrollTop: container.scrollTop
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Save on unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      container.removeEventListener('scroll', handleScroll);
      if (container) {
        const state = getPageState(key, {});
        setPageState(key, {
          scrollPosition: container.scrollTop,
          scrollTop: container.scrollTop
        });
      }
    };
  }, [key, getPageState, setPageState]);

  return scrollContainerRef;
}

// Hook to preserve complete list state (search, filters, sort, expanded items)
export function useListStatePersistence(listKey, initialState = {}) {
  const { getPageState, setPageState } = usePageState();
  
  const state = getPageState(listKey, {
    searchQuery: '',
    filters: {},
    sortField: null,
    sortDirection: 'asc',
    expandedItems: [],
    selectedItems: [],
    currentPage: 1,
    scrollTop: 0,
    ...initialState
  });

  const updateListState = useCallback((updates) => {
    setPageState(listKey, {
      ...state,
      ...updates,
      _lastUpdated: Date.now()
    });
  }, [listKey, state, setPageState]);

  const resetListState = useCallback(() => {
    setPageState(listKey, {
      searchQuery: '',
      filters: {},
      sortField: null,
      sortDirection: 'asc',
      expandedItems: [],
      selectedItems: [],
      currentPage: 1,
      scrollTop: 0,
      _lastUpdated: Date.now()
    });
  }, [listKey, setPageState]);

  return {
    state,
    updateListState,
    resetListState
  };
}