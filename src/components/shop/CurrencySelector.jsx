import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Search, Check } from "lucide-react";
import { useShopCurrency } from "@/hooks/useShopCurrency";
import { getAllCountries } from "@/lib/shopCurrency";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
};

export default function CurrencySelector({ compact = false }) {
  const { country, currencyInfo, changeCountry, ratesSource } = useShopCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const countries = useMemo(() => getAllCountries(), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return countries;
    const q = query.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  const sourceLabel = {
    live: "Live",
    cache: "Live",
    stale: "Cached",
    offline: "Offline",
    fallback: "Offline",
  }[ratesSource] || "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
        style={{ background: G.bg, border: `1px solid ${G.faint}` }}
        title="Change currency / country"
      >
        <Globe className="w-3.5 h-3.5" style={{ color: G.text }} />
        <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>
          {currencyInfo?.currency || "AED"}
        </span>
        {!compact && (
          <ChevronDown className="w-3 h-3" style={{ color: G.dim }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.75)" }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-[101] max-w-md mx-auto rounded-t-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)",
                border: `1px solid ${G.border}`,
                maxHeight: "75vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
                <div>
                  <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>
                    Select Your Country
                  </h2>
                  {sourceLabel && (
                    <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Rates: {sourceLabel} · Prices converted from AED
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="font-inter text-[11px] font-semibold px-2 py-1 rounded-lg"
                  style={{ color: G.dim, background: G.bg, border: `1px solid ${G.faint}` }}
                >
                  Done
                </button>
              </div>

              {/* Search */}
              <div className="px-4 pb-2 flex-shrink-0">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
                >
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search country or currency..."
                    className="flex-1 bg-transparent outline-none font-inter text-xs"
                    style={{ color: "rgba(255,255,255,0.90)" }}
                  />
                </div>
              </div>

              {/* Country list */}
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      changeCountry(c.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                    style={{
                      background: country === c.code ? G.bg : "transparent",
                      border: country === c.code ? `1px solid ${G.border}` : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="font-inter text-sm font-bold flex-shrink-0 text-center"
                        style={{ color: G.text, minWidth: 30 }}
                      >
                        {c.symbol}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="font-inter text-xs font-semibold truncate"
                          style={{ color: "rgba(255,255,255,0.85)" }}
                        >
                          {c.name}
                        </p>
                        <p
                          className="font-inter text-[10px] truncate"
                          style={{ color: "rgba(255,255,255,0.40)" }}
                        >
                          {c.currency} · {c.code}
                        </p>
                      </div>
                    </div>
                    {country === c.code && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.text }} />
                    )}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p
                    className="font-inter text-xs text-center py-6"
                    style={{ color: "rgba(255,255,255,0.40)" }}
                  >
                    No countries found
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}