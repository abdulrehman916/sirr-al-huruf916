import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, FileText, ListChecks, Leaf, HeartPulse, BookOpen,
  AlertTriangle, Snowflake, ShieldCheck, CheckCircle, Languages,
} from "lucide-react";
import ShippingInfo from "./ShippingInfo";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)", borderHi: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)", bg: "rgba(212,175,55,0.06)",
};

// Single accordion item with smooth expand/collapse
function AccordionItem({ icon: Icon, title, children, defaultOpen = false, warning = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: "rgba(8,16,38,0.60)",
        border: `1px solid ${open ? (warning ? "rgba(248,113,113,0.30)" : G.border) : G.faint}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: warning ? "#F87171" : G.text }} />
          <span
            className="font-inter text-xs font-bold uppercase tracking-widest"
            style={{ color: warning ? "#FCA5A5" : G.text }}
          >
            {title}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Premium accordion consolidating all product information sections.
 * Each section opens/closes with smooth animation.
 * Sections with no content are hidden automatically.
 */
export default function ProductInfoAccordion({ product, features = [] }) {
  if (!product) return null;

  const specs = product.specifications || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      {/* Description */}
      {product.full_description && (
        <AccordionItem icon={FileText} title="Description" defaultOpen>
          <p
            className="font-inter text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {product.full_description}
          </p>
          {product.malayalam_description && (
            <p
              className="font-malayalam text-sm leading-relaxed mt-3 pt-3"
              style={{ color: "rgba(255,255,255,0.65)", borderTop: `1px solid ${G.faint}` }}
            >
              {product.malayalam_description}
            </p>
          )}
          {product.arabic_description && (
            <p
              className="font-amiri text-sm leading-relaxed mt-3 pt-3"
              dir="rtl"
              style={{ color: "rgba(255,255,255,0.65)", borderTop: `1px solid ${G.faint}` }}
            >
              {product.arabic_description}
            </p>
          )}
        </AccordionItem>
      )}

      {/* Malayalam Description (standalone if no English description) */}
      {!product.full_description && product.malayalam_description && (
        <AccordionItem icon={Languages} title="Malayalam Description" defaultOpen>
          <p
            className="font-malayalam text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {product.malayalam_description}
          </p>
        </AccordionItem>
      )}

      {/* Arabic Description (standalone if no English description) */}
      {!product.full_description && product.arabic_description && (
        <AccordionItem icon={Languages} title="Arabic Description" defaultOpen>
          <p
            className="font-amiri text-sm leading-relaxed"
            dir="rtl"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {product.arabic_description}
          </p>
        </AccordionItem>
      )}

      {/* Features */}
      {features.length > 0 && (
        <AccordionItem icon={CheckCircle} title="Features & Benefits">
          <div className="flex flex-wrap gap-2">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ background: G.bg, border: `1px solid ${G.faint}` }}
              >
                <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: G.text }} />
                <span className="font-inter text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}

      {/* Specifications */}
      {specEntries.length > 0 && (
        <AccordionItem icon={ListChecks} title="Specifications">
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${G.faint}` }}>
            {specEntries.map(([key, value], idx) => (
              <div
                key={key}
                className="flex items-start justify-between px-3 py-2.5"
                style={{ borderBottom: idx < specEntries.length - 1 ? `1px solid ${G.faint}` : "none" }}
              >
                <span className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {key}
                </span>
                <span className="font-inter text-xs font-medium text-right ml-3" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}

      {/* Ingredients */}
      {product.ingredients && (
        <AccordionItem icon={Leaf} title="Ingredients">
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.ingredients}
          </p>
        </AccordionItem>
      )}

      {/* Benefits */}
      {product.benefits && (
        <AccordionItem icon={HeartPulse} title="Benefits">
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.benefits}
          </p>
        </AccordionItem>
      )}

      {/* How to Use */}
      {product.usage_instructions && (
        <AccordionItem icon={BookOpen} title="How to Use">
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.usage_instructions}
          </p>
        </AccordionItem>
      )}

      {/* Warnings */}
      {product.warnings && (
        <AccordionItem icon={AlertTriangle} title="Warnings" warning>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.warnings}
          </p>
        </AccordionItem>
      )}

      {/* Rules & Precautions */}
      {product.rules_precautions && (
        <AccordionItem icon={ShieldCheck} title="Rules & Precautions" warning>
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.rules_precautions}
          </p>
        </AccordionItem>
      )}

      {/* Storage Instructions */}
      {product.storage_instructions && (
        <AccordionItem icon={Snowflake} title="Storage Instructions">
          <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {product.storage_instructions}
          </p>
        </AccordionItem>
      )}

      {/* Shipping Information */}
      <AccordionItem icon={FileText} title="Shipping Information">
        <ShippingInfo />
      </AccordionItem>
    </motion.div>
  );
}