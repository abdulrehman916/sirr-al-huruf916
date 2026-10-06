import { useShopCurrency } from "@/hooks/useShopCurrency";
import { parsePrice } from "@/lib/shopUtils";

const SIZE_STYLES = {
  sm: { price: "text-[11px] font-bold", compare: "text-[9px]", original: "text-[8px]" },
  lg: { price: "text-lg font-bold", compare: "text-sm", original: "text-[10px]" },
};

/**
 * Displays the product price converted to the user's selected currency.
 * - If price_display has no numeric value (e.g. "Check on Amazon"), shows as-is.
 * - If currency is AED or rates are loading, shows the original price string.
 * - Otherwise shows converted price with original AED below in smaller text.
 * - Does NOT modify stored prices — conversion is display-only.
 */
export default function PriceDisplay({
  priceDisplay,
  comparePriceDisplay,
  outOfStock = false,
  size = "sm",
}) {
  const { formatPrice, currency, showOriginal, loading } = useShopCurrency();
  const styles = SIZE_STYLES[size] || SIZE_STYLES.sm;

  const aedAmount = parsePrice(priceDisplay);
  const aedCompare = parsePrice(comparePriceDisplay);

  // Non-numeric price (e.g., "Check on Amazon", "Free", "Varies") — show as-is
  if (aedAmount === null) {
    return (
      <div className="flex items-baseline gap-1.5">
        {comparePriceDisplay && (
          <span
            className={`font-inter ${styles.compare} line-through`}
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {comparePriceDisplay}
          </span>
        )}
        {priceDisplay && (
          <span
            className={`font-inter ${styles.price}`}
            style={{
              color: outOfStock ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.75)",
            }}
          >
            {priceDisplay}
          </span>
        )}
      </div>
    );
  }

  // AED currency or still loading — show original price strings
  if (currency === "AED" || loading) {
    return (
      <div className="flex items-baseline gap-1.5">
        {comparePriceDisplay && (
          <span
            className={`font-inter ${styles.compare} line-through`}
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {comparePriceDisplay}
          </span>
        )}
        <span
          className={`font-inter ${styles.price}`}
          style={{
            color: outOfStock ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.75)",
          }}
        >
          {priceDisplay}
        </span>
      </div>
    );
  }

  // Converted currency — show converted price + original AED below
  const convertedPrice = formatPrice(aedAmount);
  const convertedCompare =
    aedCompare !== null ? formatPrice(aedCompare) : null;

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1.5">
        {convertedCompare && (
          <span
            className={`font-inter ${styles.compare} line-through`}
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {convertedCompare}
          </span>
        )}
        <span
          className={`font-inter ${styles.price}`}
          style={{
            color: outOfStock ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.75)",
          }}
        >
          {convertedPrice}
        </span>
      </div>
      {showOriginal && (
        <span
          className={`font-inter ${styles.original}`}
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          ≈ AED {aedAmount}
        </span>
      )}
    </div>
  );
}