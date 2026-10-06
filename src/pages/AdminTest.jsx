import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, User, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.50)",
  error: "rgba(239,68,68,0.15)",
  errorBorder: "rgba(239,68,68,0.50)",
};

export default function AdminTest() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Checking authentication...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-amiri text-2xl font-bold text-center" style={{ color: G.text }}>
          Admin Authentication Test
        </h1>

        {user ? (
          <Card className="border-0" style={{ background: G.success }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8" style={{ color: "#22c55e" }} />
                <h2 className="font-inter text-lg font-bold text-white">Authenticated Successfully</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/70" />
                  <span className="text-white/80">Email:</span>
                  <span className="text-white font-semibold">{user.email}</span>
                </div>

                {user.full_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/70" />
                    <span className="text-white/80">Name:</span>
                    <span className="text-white font-semibold">{user.full_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-white/70" />
                  <span className="text-white/80">Role:</span>
                  <Badge className={`${user.role === 'admin' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'} border font-semibold`}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>

                {user.role === 'admin' && (
                  <div className="mt-4 p-3 rounded-lg border" style={{ background: G.bg, borderColor: G.border }}>
                    <p className="text-white/70 text-sm mb-2">
                      <strong className="text-gold">✓ Admin Access Confirmed</strong>
                    </p>
                    <p className="text-white/60 text-xs">
                      You have full access to all admin pages including /admin/page-permissions
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => window.location.href = '/admin/page-permissions'}
                  className="btn-gold"
                >
                  Go to Page Permissions
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-gold text-gold"
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0" style={{ background: G.error }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-8 h-8" style={{ color: "#ef4444" }} />
                <h2 className="font-inter text-lg font-bold text-white">Not Authenticated</h2>
              </div>
              <p className="text-white/70 mb-4">{error || "No user session found"}</p>
              <Button onClick={() => window.location.href = '/login'} className="btn-gold">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}