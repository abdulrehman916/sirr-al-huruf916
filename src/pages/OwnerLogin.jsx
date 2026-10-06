import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { base44 } from "@/api/base44Client";
import { persistRemove, persistSet } from "@/lib/devModePersistence";

export default function OwnerLogin() {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("redirect") || "/admin/access-dashboard";
  const returnTo = requested.startsWith("/admin/") && !requested.startsWith("//") ? requested : "/admin/access-dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function continueWithGoogle() {
    setError("");
    setLoading(true);
    try {
      persistSet("sirr_admin_session", "true");
      await base44.auth.loginWithProvider("google", returnTo);
    } catch (err) {
      persistRemove("sirr_admin_session");
      setError(err?.message || "Google login failed.");
      setLoading(false);
    }
  }

  return <AuthLayout icon={ShieldCheck} title="Sirr al-Huruf" subtitle="Continue securely with your Google account.">
    {error && <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <Button type="button" onClick={continueWithGoogle}
      className="h-12 w-full bg-white font-semibold text-slate-900 hover:bg-white/90" disabled={loading}>
      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Opening Google…</> : <><GoogleIcon className="mr-2 h-5 w-5"/>Continue with Google</>}
    </Button>
  </AuthLayout>;
}
