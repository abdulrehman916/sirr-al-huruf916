/**
 * RemainingTime — Live countdown component showing time until expiry.
 * Updates every minute. Shows "Expired" or "Lifetime" when applicable.
 */
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatRemaining, formatRemainingLong, getCodeStatus } from "@/lib/codeDuration";

export default function RemainingTime({ expiryDate, showFull = false }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!expiryDate) {
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "#22c55e" }}>
        <Clock className="w-3 h-3" /> ∞ Lifetime
      </span>
    );
  }

  const isExpired = new Date(expiryDate) < new Date();
  if (isExpired) {
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: "#ef4444" }}>
        <Clock className="w-3 h-3" /> Expired
      </span>
    );
  }

  const remaining = showFull ? formatRemainingLong(expiryDate) : formatRemaining(expiryDate);
  const diff = new Date(expiryDate).getTime() - Date.now();
  const isUrgent = diff < 86400000; // less than 24h

  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: isUrgent ? "#f59e0b" : "rgba(255,255,255,0.50)" }}>
      <Clock className="w-3 h-3" /> {remaining}
    </span>
  );
}