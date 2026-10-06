import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GitCompare, X, Check } from "lucide-react";
import { getCompareList, toggleCompare, isInCompare, clearCompare } from "@/lib/shopUtils";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  borderHi: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

const COMPARE_FIELDS = [
  { key: "price_display", label: "Price" },
  { key: "rating_display", label: "Rating" },
  { key: "category", label: "Category" },
  { key: "short_description", label: "Summary" },
];

/**
 * Floating compare tray — shows selected products and a "Compare" button.
 * Also exposes a CompareButton for use on product cards.
 */
export function CompareButton({ product }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(isInCompare(product.id));
    const handler = () => setInCompare(isInCompare(product.id));
    window.addEventListener("shop-compare-changed", handler);
    return () => window.removeEventListener("shop-compare-changed", handler);
  }, [product.id]);

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const added = toggleCompare(product.id);
    setInCompare(added);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 rounded-lg transition-all"
      style={{
        background: inCompare ? "rgba(96,165,250,0.20)" : "rgba(2,7,16,0.80)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: inCompare ? "1px solid rgba(96,165,250,0.50)" : "1px solid rgba(212,175,55,0.14)",
      }}
      title={inCompare ? "Remove from compare" : "Add to compare"}
    >
      <GitCompare
        className="w-3 h-3"
        style={{
          color: inCompare ? "#60A5FA" : "rgba(255,255,255,0.70)",
        }}
      />
    </button>
  );
}

export default function CompareBar({ products = [] }) {
  const [compareIds, setCompareIds] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCompareIds(getCompareList());
    const handler = () => setCompareIds(getCompareList());
    window.addEventListener("shop-compare-changed", handler);
    return () => window.removeEventListener("shop-compare-changed", handler);
  }, []);

  const compareProducts = products.filter(p => compareIds.includes(p.id));

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Floating tray */}
      <AnimatePresence>
        {!drawerOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md"
          >
            <div
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(180deg, rgba(5,10,28,0.98) 0%, rgba(2,5,16,1) 100%)",
                border: `1px solid ${G.borderHi}`,
                boxShadow: "0 8px 40px rgba(0,0,0,0.60)",
              }}
            >
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <GitCompare className="w-4 h-4" style={{ color: G.text }} />
                <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>
                  {compareIds.length}/4
                </span>
              </div>
              {/* Thumbnails */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
                {compareProducts.map(p => (
                  <div
                    key={p.id}
                    className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: `1px solid ${G.faint}` }}
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <span className="font-inter text-[7px]" style={{ color: G.dim }}>?</span>
                      </div>
                    )}
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute top-0 right-0 p-0.5"
                      style={{ background: "rgba(0,0,0,0.70)" }}
                    >
                      <X className="w-2 h-2" style={{ color: "#F87171" }} />
                    </button>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <button
                onClick={() => setDrawerOpen(true)}
                disabled={compareIds.length < 2}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg font-inter text-[10px] font-bold disabled:opacity-30"
                style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
              >
                Compare
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
            style={{ background: "rgba(0,0,0,0.80)" }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full lg:w-[800px] max-h-[90vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)",
                border: `1px solid ${G.borderHi}`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sticky top-0" style={{ background: "rgba(5,10,28,0.95)" }}>
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4" style={{ color: G.text }} />
                  <h2 className="font-inter text-sm font-bold" style={{ color: G.text }}>Compare Products</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => clearCompare()}
                    className="px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold"
                    style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}
                  >
                    Clear
                  </button>
                  <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg" style={{ background: G.bg }}>
                    <X className="w-4 h-4" style={{ color: G.dim }} />
                  </button>
                </div>
              </div>

              {/* Comparison table */}
              <div className="p-4 overflow-x-auto">
                {compareProducts.length < 2 ? (
                  <p className="font-inter text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.40)" }}>
                    Add at least 2 products to compare.
                  </p>
                ) : (
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="w-28 text-left p-2 align-top" style={{ borderBottom: `1px solid ${G.faint}` }}>
                          <span className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: G.dim }}>Attribute</span>
                        </th>
                        {compareProducts.map(p => (
                          <th key={p.id} className="text-left p-2 align-top" style={{ borderBottom: `1px solid ${G.faint}`, minWidth: 140 }}>
                            <div className="space-y-1.5">
                              <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto" style={{ border: `1px solid ${G.faint}` }}>
                                {p.images?.[0] ? (
                                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full" style={{ background: "rgba(255,255,255,0.04)" }} />
                                )}
                              </div>
                              <p className="font-inter text-[11px] font-bold leading-tight line-clamp-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                                {p.name}
                              </p>
                              <button
                                onClick={() => navigate(`/shop/${p.slug || p.id}`)}
                                className="font-inter text-[9px] font-bold underline"
                                style={{ color: G.text }}
                              >
                                View →
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_FIELDS.map((field, rowIdx) => (
                        <tr key={field.key}>
                          <td className="p-2 align-top" style={{ borderBottom: rowIdx < COMPARE_FIELDS.length - 1 ? `1px solid ${G.faint}` : "none" }}>
                            <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: G.dim }}>
                              {field.label}
                            </span>
                          </td>
                          {compareProducts.map(p => (
                            <td key={p.id} className="p-2 align-top" style={{ borderBottom: rowIdx < COMPARE_FIELDS.length - 1 ? `1px solid ${G.faint}` : "none" }}>
                              <span className="font-inter text-[11px]" style={{ color: p[field.key] ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.25)" }}>
                                {p[field.key] || "—"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                      {/* Specifications row */}
                      <tr>
                        <td className="p-2 align-top">
                          <span className="font-inter text-[10px] font-semibold uppercase tracking-wider" style={{ color: G.dim }}>Specs</span>
                        </td>
                        {compareProducts.map(p => {
                          const specs = p.specifications || {};
                          const entries = Object.entries(specs).filter(([, v]) => v).slice(0, 4);
                          return (
                            <td key={p.id} className="p-2 align-top">
                              {entries.length > 0 ? (
                                <div className="space-y-0.5">
                                  {entries.map(([k, v]) => (
                                    <p key={k} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
                                      <span style={{ color: G.dim }}>{k}:</span> {v}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}