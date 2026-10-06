import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/api/platformClient";
import { persistSet } from "@/lib/devModePersistence";

export default function AuthCallback() {
  const [message, setMessage] = useState("Verifying your email…");
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("redirect") || "/";
    const returnTo = requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\") ? requested : "/";
    async function finish() {
      try {
        if (!supabase) throw new Error("The sign-in service is not configured.");
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) throw new Error("Your sign-in link may have expired. Please sign in again.");
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("role,status").eq("id", data.user.id).single();
        if (profileError || !profile || profile.status !== "active")
          throw new Error("This account does not have access. Please contact the site owner.");
        const { error: claimError } = await supabase.rpc("claim_base44_legacy_data");
        if (claimError) throw new Error("We could not restore your previous permissions. Please try again.");
        const isAdmin = ["owner", "admin"].includes(profile.role);
        try { persistSet("sirr_admin_session", isAdmin ? "true" : "false"); } catch { /* optional UI hint */ }
        if (active) window.location.replace(returnTo.startsWith("/admin/") && !isAdmin ? "/" : returnTo);
      } catch (error) {
        if (active) setMessage(error.message || "Could not complete sign-in.");
      }
    }
    finish();
    return () => { active = false; };
  }, []);
  return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020710] px-6 text-center text-white"><Loader2 className="h-8 w-8 animate-spin text-yellow-300"/><p className="text-sm text-white/65">{message}</p><a href="/login" className="text-sm text-yellow-300 underline">Sign in again</a></div>;
}
