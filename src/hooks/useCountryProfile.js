import { useShopCurrency } from "./useShopCurrency";
import {
  getCountryProfile,
  getMarketplacesForCountry,
  getMarketplaceButtons,
  getMarketplaceCount,
} from "@/lib/countryProfiles";

/**
 * Extends useShopCurrency with full country profile data:
 * region, languages, tax label, shipping info, marketplace priority.
 * All currency system values are passed through unchanged.
 */
export function useCountryProfile() {
  const currencyHook = useShopCurrency();
  const { country } = currencyHook;

  const profile = getCountryProfile(country);
  const marketplaces = getMarketplacesForCountry(country);

  return {
    ...currencyHook,
    // Country profile data
    profile,
    marketplaces,
    region: profile.region,
    languages: profile.languages || [],
    taxLabel: profile.taxLabel,
    shipping: profile.shipping,
    marketplacePriority: profile.marketplaces || [],
    // Helpers
    getMarketplaceButtons: (product) => getMarketplaceButtons(product, country),
    getMarketplaceCount: (product) => getMarketplaceCount(product, country),
  };
}