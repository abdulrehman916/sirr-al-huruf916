import {
  ShoppingBag, ExternalLink, MessageCircle, Mail, Sun,
} from "lucide-react";
import { useCountryProfile } from "@/hooks/useCountryProfile";
import { openMarketplaceLink } from "@/lib/marketplaceDeepLinks";
import { trackMarketplaceClick } from "@/lib/shopAnalytics";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)", glow: "rgba(212,175,55,0.18)",
};

const ICON_MAP = { ShoppingBag, ExternalLink, MessageCircle, Mail, Sun };

function getIcon(mp) {
  return ICON_MAP[mp.icon] || ExternalLink;
}

function handleClick(btn, product) {
  const pid = product.product_id || product.id;
  const pname = product.name || "";
  if (btn.type === "affiliate") {
    const clickType = btn.isAmazon ? "amazon_click"
      : btn.mp?.id === "noon" ? "noon_click"
      : btn.mp?.id === "flipkart" ? "flipkart_click"
      : "custom_click";
    trackMarketplaceClick(pid, pname, btn.mp?.id || "custom", clickType);
    openMarketplaceLink(btn.mp.id, btn.link.url);
  } else if (btn.type === "whatsapp") {
    trackMarketplaceClick(pid, pname, "whatsapp", "whatsapp_click");
    const num = String(btn.value).replace(/[^0-9]/g, "");
    const msg = `Hi, I'm interested in: ${product.name}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  } else if (btn.type === "email") {
    trackMarketplaceClick(pid, pname, "email", "email_click");
    const subject = `Inquiry: ${product.name}`;
    window.open(`mailto:${btn.value}?subject=${encodeURIComponent(subject)}`, "_blank");
  }
}

/**
 * Country-aware marketplace buttons.
 * compact=true: renders a single button (top priority marketplace) for product cards.
 * compact=false: renders full vertical list for product detail page.
 * Falls back to External Website if no country-specific marketplace exists.
 */
export default function MarketplaceButtons({ product, compact = false }) {
  const { getMarketplaceButtons } = useCountryProfile();
  const buttons = getMarketplaceButtons(product);

  if (buttons.length === 0) return null;

  if (compact) {
    const first = buttons[0];
    const Icon = getIcon(first.mp);
    const label = product.is_out_of_stock
      ? "Out of Stock"
      : first.type === "affiliate"
        ? (first.link.label || `Buy on ${first.mp.name}`)
        : first.mp.name;
    // Amazon gold button (Sirr al-Huruf theme); other marketplaces use brand color
    const gold = "#D4AF37";
    const accent = first.isAmazon ? gold : first.mp.color;

    return (
      <button
        onClick={(e) => { e.stopPropagation(); if (!product.is_out_of_stock) handleClick(first, product); }}
        disabled={product.is_out_of_stock}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-inter text-[11px] font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)`,
          border: `1px solid ${accent}55`,
          color: G.text,
          boxShadow: first.isAmazon ? `0 0 16px ${accent}33` : "none",
        }}
      >
        <Icon className="w-3 h-3" style={{ color: accent }} />
        {label}
      </button>
    );
  }

  // Full mode — product detail page
  const gold = "#D4AF37";
  return (
    <div className="space-y-2">
      {buttons.map((btn, i) => {
        const Icon = getIcon(btn.mp);
        const label = btn.type === "affiliate"
          ? (btn.link.label || `Buy on ${btn.mp.name}`)
          : btn.mp.name;
        // Amazon gets gold styling; primary (first) non-Amazon gets its brand color highlight
        const accent = btn.isAmazon ? gold : btn.mp.color;
        const isPrimary = i === 0;

        return (
          <button
            key={i}
            onClick={() => { if (!product.is_out_of_stock) handleClick(btn, product); }}
            disabled={product.is_out_of_stock}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-bold transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: (isPrimary || btn.isAmazon)
                ? `linear-gradient(135deg, ${accent}28 0%, ${accent}10 100%)`
                : "rgba(8,16,38,0.60)",
              border: `1px solid ${(isPrimary || btn.isAmazon) ? `${accent}66` : G.border}`,
              color: G.text,
              boxShadow: (isPrimary || btn.isAmazon) ? `0 0 24px ${accent}22` : "none",
            }}
          >
            <Icon className="w-4 h-4" style={{ color: accent }} />
            {product.is_out_of_stock ? "Unavailable" : label}
          </button>
        );
      })}
    </div>
  );
}