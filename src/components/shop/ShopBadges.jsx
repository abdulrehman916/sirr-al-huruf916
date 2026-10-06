import { Globe, Truck, Coins, Store, Languages } from "lucide-react";
import { useCountryProfile } from "@/hooks/useCountryProfile";

const G = { dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.14)" };

/**
 * Dynamic shop badges: Country, Currency, Shipping, Marketplace, Language.
 *
 * @param product - if provided, shows product-specific marketplace count
 * @param variant - "compact" for cards, "full" for detail page, "context" for shop-level (no product)
 */
export default function ShopBadges({ product, variant = "compact" }) {
  const { country, currency, symbol, profile, shipping, getMarketplaceCount } = useCountryProfile();

  const marketplaceCount = product ? getMarketplaceCount(product) : 0;

  const badges = [
    { icon: Globe, label: country, sub: profile.region, color: "#60A5FA" },
    { icon: Coins, label: currency, sub: symbol, color: "#FBBF24" },
    { icon: Truck, label: shipping?.label, sub: "Delivery", color: "#34D399" },
  ];

  if (product) {
    badges.push({
      icon: Store,
      label: `${marketplaceCount} Marketplace${marketplaceCount !== 1 ? "s" : ""}`,
      sub: "Available",
      color: "#C084FC",
    });
  }

  if (profile.languages && profile.languages.length > 0) {
    badges.push({
      icon: Languages,
      label: profile.languages.join(" + "),
      sub: "Language",
      color: "#F472B6",
    });
  }

  const visible = badges.filter(b => b.label);
  if (visible.length === 0) return null;

  if (variant === "context") {
    // Shop-page level — inline pill badges
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {visible.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: `${b.color}12`, border: `1px solid ${b.color}25` }}
            >
              <Icon className="w-3 h-3" style={{ color: b.color }} />
              <span className="font-inter text-[10px] font-bold" style={{ color: b.color }}>
                {b.label}
              </span>
              {b.sub && (
                <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {b.sub}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    // Product card — tiny inline badges
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visible.slice(0, 3).map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{ background: `${b.color}15`, border: `1px solid ${b.color}30` }}
            >
              <Icon className="w-2 h-2" style={{ color: b.color }} />
              <span className="font-inter text-[8px] font-semibold" style={{ color: b.color }}>
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Full — product detail page
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visible.map((b, i) => {
        const Icon = b.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: `${b.color}15`, border: `1px solid ${b.color}30` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: b.color }} />
            <span className="font-inter text-[10px] font-bold" style={{ color: b.color }}>
              {b.label}
            </span>
            {b.sub && (
              <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                {b.sub}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}