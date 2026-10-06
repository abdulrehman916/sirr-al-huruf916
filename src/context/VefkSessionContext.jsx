import { createContext, useContext, useState, useEffect } from "react";

const VefkSessionContext = createContext(null);

export function VefkSessionProvider({ children }) {
  const [session, setSession] = useState({
    mode: "ana",
    anaData: null,
    tanzimData: null,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage ONLY on mount, after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vefk_session");
      if (saved) {
        try {
          setSession(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load session:", e);
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever session changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("vefk_session", JSON.stringify(session));
    }
  }, [session, isHydrated]);

  const updateAnaData = (data) => {
    setSession(prev => ({ ...prev, anaData: data, mode: "ana" }));
  };

  const updateTanzimData = (data) => {
    setSession(prev => ({ ...prev, tanzimData: data, mode: "tanzim" }));
  };

  const clearSession = () => {
    setSession({ mode: "ana", anaData: null, tanzimData: null });
    localStorage.removeItem("vefk_session");
  };

  return (
    <VefkSessionContext.Provider value={{ session, updateAnaData, updateTanzimData, clearSession }}>
      {children}
    </VefkSessionContext.Provider>
  );
}

export function useVefkSession() {
  const context = useContext(VefkSessionContext);
  if (!context) {
    throw new Error("useVefkSession must be used within VefkSessionProvider");
  }
  return context;
}