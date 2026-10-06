import { Truck, Clock, MapPin, Languages, Receipt } from "lucide-react";
import { useCountryProfile } from "@/hooks/useCountryProfile";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", faint: "rgba(212,175,55,0.14)",
};

/**
 * Dynamic shipping & delivery information based on the user's selected country.
 * Shows delivery time, region, tax label, and language preferences.
 */
export default function ShippingInfo() {
  const { country, profile, shipping } = useCountryProfile();

  if (!shipping) return null;

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
    >
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4" style={{ color: G.text }} />
        <h3
          className="font-inter text-xs font-bold uppercase tracking-widest"
          style={{ color: G.text }}
        >
          Shipping & Delivery
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Delivery time */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#34D399" }} />
          <div>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Estimated Delivery
            </p>
            <p className="font-inter text-xs font-bold" style={{ color: "#34D399" }}>
              {shipping.label}
            </p>
          </div>
        </div>

        {/* Region */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
          <div>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Region
            </p>
            <p className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              {profile.region} · {country}
            </p>
          </div>
        </div>

        {/* Tax */}
        <div className="flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
          <div>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Tax
            </p>
            <p className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              {profile.taxLabel}
            </p>
          </div>
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F472B6" }} />
          <div>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              Languages
            </p>
            <p className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
              {profile.languages.join(" + ")}
            </p>
          </div>
        </div>
      </div>

      {shipping.note && (
        <p className="font-inter text-[10px] pt-1" style={{ color: "rgba(255,255,255,0.35)", borderTop: `1px solid ${G.faint}` }}>
          {shipping.note}
        </p>
      )}
    </div>
  );
}