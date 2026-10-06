/**
 * WhatsAppSupport — Customer-facing WhatsApp admin selection & routing page.
 *
 * Flow:
 *   1. If logged in, use email from auth; otherwise ask for email.
 *   2. Check if customer has an assigned admin.
 *   3. If assigned & active → auto-open WhatsApp.
 *   4. If assigned & disabled → show "unavailable" message, allow selecting another.
 *   5. If no assignment → show admin selection list → on select, save & open WhatsApp.
 *
 * Uses: manageSupportRouting backend function + existing assigned_admin_id field.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AdminSelectionCard from "@/components/support/AdminSelectionCard";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

export default function WhatsAppSupport() {
  const { toast } = useToast();
  const [phase, setPhase] = useState("loading"); // loading | needEmail | checking | autoOpening | unavailable | showSelection
  const [email, setEmail] = useState("");
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [activeAdmins, setActiveAdmins] = useState([]);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    initFlow();
  }, []);

  const initFlow = async () => {
    setPhase("loading");
    try {
      let userEmail = null;
      try {
        const user = await base44.auth.me();
        if (user?.email) userEmail = user.email;
      } catch {}

      if (userEmail) {
        setEmail(userEmail);
        await checkAssignment(userEmail);
      } else {
        setPhase("needEmail");
      }
    } catch {
      setPhase("needEmail");
    }
  };

  const checkAssignment = async (emailToCheck) => {
    setPhase("checking");
    try {
      const res = await base44.functions.invoke("manageSupportRouting", {
        action: "GET_MY_ASSIGNED_ADMIN",
        email: emailToCheck,
      });

      if (res.data?.success && res.data.admin) {
        setAssignedAdmin(res.data.admin);
        if (res.data.admin.is_active) {
          setPhase("autoOpening");
          openWhatsApp(res.data.admin.whatsapp_number, res.data.admin.full_name);
        } else {
          setPhase("unavailable");
        }
      } else {
        await loadActiveAdmins();
        setPhase("showSelection");
      }
    } catch {
      await loadActiveAdmins();
      setPhase("showSelection");
    }
  };

  const loadActiveAdmins = async () => {
    try {
      const res = await base44.functions.invoke("manageSupportRouting", {
        action: "GET_ACTIVE_ADMINS",
      });
      if (res.data?.success) {
        setActiveAdmins(res.data.admins || []);
      }
    } catch {}
  };

  const openWhatsApp = (number, name) => {
    const cleanNumber = (number || "").replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hello ${name}, I need support from Sirr al-Huruf.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await checkAssignment(email.trim());
  };

  const handleSelectAdmin = async (admin) => {
    setSelecting(true);
    try {
      const res = await base44.functions.invoke("manageSupportRouting", {
        action: "SELF_ASSIGN_ADMIN",
        email: email.trim(),
        admin_profile_id: admin.admin_profile_id,
      });

      if (res.data?.success) {
        setAssignedAdmin(res.data.admin);
        toast({ title: "✓ Admin assigned", description: "Opening WhatsApp..." });
        setPhase("autoOpening");
        openWhatsApp(admin.whatsapp_number, admin.full_name);
      } else {
        toast({
          title: "Assignment failed",
          description: res.data?.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Assignment failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setSelecting(false);
    }
  };

  const handleSelectAnother = async () => {
    await loadActiveAdmins();
    setPhase("showSelection");
  };

  return (
    <PageLayout>
      <PageTitle
        arabic="دعم واتساب"
        latin="WHATSAPP SUPPORT"
        subtitle="Connect with your support representative"
        icon="💬"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Loading */}
        {(phase === "loading" || phase === "checking") && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: G.text }} />
            <p className="text-sm text-white/50">
              {phase === "loading"
                ? "Checking your support assignment..."
                : "Finding your assigned admin..."}
            </p>
          </div>
        )}

        {/* Need Email */}
        {phase === "needEmail" && (
          <div
            className="rounded-2xl border p-6"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <div className="text-center mb-4">
              <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: G.text }} />
              <h3 className="font-inter font-bold text-white text-base mb-1">
                WhatsApp Support
              </h3>
              <p className="text-xs text-white/50">
                Enter your email to connect with your support representative
              </p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <Label className="text-white/70 text-xs">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-white/5 border-white/10 text-white mt-1"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <Button type="submit" className="w-full btn-gold py-3">
                Continue
              </Button>
            </form>
          </div>
        )}

        {/* Auto-Opening WhatsApp */}
        {phase === "autoOpening" && assignedAdmin && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ background: G.bg, borderColor: G.border }}
          >
            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
            <h3 className="font-inter font-bold text-white text-base mb-1">
              Opening WhatsApp...
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Connecting you with{" "}
              <strong style={{ color: G.text }}>{assignedAdmin.full_name}</strong>
            </p>
            <Button
              onClick={() =>
                openWhatsApp(assignedAdmin.whatsapp_number, assignedAdmin.full_name)
              }
              variant="outline"
              className="border-gold/40 text-gold hover:bg-gold/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Reopen WhatsApp
            </Button>
          </div>
        )}

        {/* Admin Unavailable */}
        {phase === "unavailable" && assignedAdmin && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.25)" }}
          >
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <h3 className="font-inter font-bold text-white text-base mb-1">
              Support Representative Unavailable
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Your support representative ({assignedAdmin.full_name}) is currently unavailable.
              Please select another admin below.
            </p>
            <Button onClick={handleSelectAnother} className="btn-gold py-2.5">
              Select Another Admin
            </Button>
          </div>
        )}

        {/* Admin Selection */}
        {phase === "showSelection" && (
          <div className="space-y-4">
            <div
              className="rounded-xl border p-3"
              style={{ background: G.bg, borderColor: G.border }}
            >
              <p className="text-xs text-white/60 leading-relaxed text-center">
                Select a support representative to chat with on WhatsApp.
                Your selection will be saved for future support requests.
              </p>
            </div>

            {activeAdmins.length === 0 ? (
              <div
                className="rounded-xl border p-8 text-center"
                style={{ background: G.bg, borderColor: G.border }}
              >
                <MessageCircle
                  className="w-8 h-8 mx-auto mb-3 opacity-30"
                  style={{ color: G.text }}
                />
                <p className="text-sm text-white/40">
                  No support representatives are currently available.
                  Please try again later or submit a support ticket.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAdmins.map((admin) => (
                  <AdminSelectionCard
                    key={admin.admin_profile_id}
                    admin={admin}
                    onSelect={handleSelectAdmin}
                    disabled={selecting}
                  />
                ))}
              </div>
            )}

            {selecting && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: G.text }} />
                <p className="text-xs text-white/50">Assigning admin...</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}