import { useState, useEffect, useMemo } from "react";
import {
  initCountry,
  subscribeCountry,
  setSelectedCountry,
  getCurrencyForCountry,
  getCachedRates,
  fetchExchangeRates,
  convertAED,
  formatPrice,
  FALLBACK_RATES,
} from "@/lib/shopCurrency";

/**
 * React hook for the Shop Currency System.
 * Each component using this hook shares the same module-level state
 * (country + cached rates) and re-renders when the country changes.
 */
export function useShopCurrency() {
  const [country, setCountry] = useState(() => initCountry());
  const [ratesData, setRatesData] = useState(() => getCachedRates());
  const [loading, setLoading] = useState(() => {
    const cached = getCachedRates();
    return !cached;
  });

  useEffect(() => {
    // Subscribe to country changes from other components (e.g., CurrencySelector)
    const unsub = subscribeCountry((newCountry) => setCountry(newCountry));

    // Fetch fresh rates if no cache or cache is stale
    const cached = getCachedRates();
    if (!cached || cached.source === "stale") {
      fetchExchangeRates().then((data) => {
        setRatesData(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return unsub;
  }, []);

  const currencyInfo = useMemo(() => getCurrencyForCountry(country), [country]);
  const rates = ratesData?.rates || FALLBACK_RATES;

  const handleConvert = useMemo(
    () => (aedAmount) => convertAED(aedAmount, currencyInfo.currency, rates),
    [currencyInfo, rates]
  );

  const handleFormat = useMemo(
    () => (aedAmount) => formatPrice(aedAmount, currencyInfo.currency, currencyInfo, rates),
    [currencyInfo, rates]
  );

  const handleChangeCountry = (code) => setSelectedCountry(code);

  return {
    country,
    currencyInfo,
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    loading,
    ratesSource: ratesData?.source || "fallback",
    convertAED: handleConvert,
    formatPrice: handleFormat,
    showOriginal: currencyInfo.currency !== "AED",
    changeCountry: handleChangeCountry,
  };
}