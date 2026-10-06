/**
 * RedeemCodeApproval — Customer-facing page for submitting reading codes
 * for admin approval and tracking submission status.
 *
 * Flow:
 *   1. Customer enters code + email + name → submits for approval
 *   2. Status becomes PENDING
 *   3. Admin reviews: Approve / Reject / Request Info
 *   4. Customer sees status updates and can respond to info requests
 *
 * This is a SEPARATE workflow from the existing instant redeem flow.
 * The existing RedeemCodeModal / redeemAccessCode flow remains unchanged.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getSessionId } from "@/lib/sessionId";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
};

const STATUS_CONFIG = {
  PENDING: { icon: Loader2, color: "#60a5fa", label: "Pending Approval", spin: true },
  APPROVED: { icon: CheckCircle, color: "#22c55e", label: "Approved", spin: false },
  REJECTED: { icon: XCircle, color: "#ef4444", label: "Rejected", spin: false },
  INFO_REQUESTED: { icon: AlertCircle, color: "#eab308", label: "Information Requested", spin: false },
};

export default function RedeemCodeApproval() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({ code: "", email: "", name: "" });
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseData, setResponseData] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    setLoading(true);
    try {
      let email = null;
      let name = null;
      try {
        const user = await base44.auth.me();
        if (user?.email) {
          email = user.email;
          name = user.full_name || "";
        }
      } catch {}

      if (email) {
        setFormData((prev) => ({ ...prev, email, name }));
        await loadSubmissions(email);
      }
    } catch {
      // Not logged in — user will enter email manually
    }
    setLoading(false);
  };

  const loadSubmissions = async (email) => {
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "GET_MY_SUBMISSIONS",
        email: email,
      });
      if (res.data?.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your code and email.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const sessionId = getSessionId();
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "SUBMIT",
        code: formData.code.trim(),
        email: formData.email.trim(),
        name: formData.name.trim() || null,
        session_id: sessionId,
      });

      if (res.data?.success) {
        toast({
          title: res.data.already_submitted
            ? "Code Already Submitted"
            : "✓ Code Submitted for Approval",
          description: res.data.already_submitted
            ? `Your code is already ${res.data.status.toLowerCase().replace(/_/g, " ")}.`
            : `Approval ID: ${res.data.approval_id}${
                res.data.assigned_admin ? `. Assigned to: ${res.data.assigned_admin}` : ""
              }`,
        });
        setFormData((prev) => ({ ...prev, code: "" }));
        await loadSubmissions(formData.email.trim());
      } else {
        toast({
          title: "Submission Failed",
          description: res.data?.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Submission Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (approvalId) => {
    if (!responseData.trim()) return;
    setResponding(true);
    try {
      const res = await base44.functions.invoke("manageRedeemCodeApproval", {
        action: "RESPOND_INFO",
        approval_id: approvalId,
        customer_response: responseData.trim(),
        email: formData.email,
      });

      if (res.data?.success) {
        toast({ title: "✓ Response Sent", description: "Admin will review your response." });
        setResponseData("");
        setRespondingTo(null);
        await loadSubmissions(formData.email);
      } else {
        toast({ title: "Failed", description: res.data?.error, variant: "destructive" });
      }
    } catch (e) {
      toast({
        title: "Failed",
        description: e?.response?.data?.error || e.message,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  return (
    <PageLayout>
      <PageTitle
        arabic="موافقة رمز الاسترداد"
        latin="REDEEM CODE APPROVAL"
        subtitle="Submit your reading code for admin approval"
        icon="🎫"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Submit Form */}
        <div className="rounded-2xl border p-6" style={{ background: G.bg, borderColor: G.border }}>
          <div className="text-center mb-4">
            <Ticket className="w-10 h-10 mx-auto mb-3" style={{ color: G.text }} />
            <h3 className="font-inter font-bold text-white text-base mb-1">
              Submit Code for Approval
            </h3>
            <p className="text-xs text-white/50">
              Enter your reading code to submit it for admin review and activation
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-white/70 text-xs">Reading Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. ABDUL2026"
                required
                className="bg-white/5 border-white/10 text-white mt-1 uppercase"
                style={{ fontSize: "16px", letterSpacing: "0.05em" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70 text-xs">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="bg-white/5 border-white/10 text-white mt-1"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full btn-gold py-3">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </form>
        </div>

        {/* My Submissions */}
        {formData.email && (
          <div className="space-y-3">
            <h3 className="font-inter font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: G.dim }} />
              My Submissions
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: G.text }} />
              </div>
            ) : submissions.length === 0 ? (
              <div
                className="rounded-xl border p-6 text-center"
                style={{ background: G.bg, borderColor: G.border }}
              >
                <p className="text-sm text-white/40">
                  No submissions yet. Submit a code above to start the approval process.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => {
                  const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={sub.id || sub.approval_id}
                      className="rounded-xl border p-4"
                      style={{ background: G.bg, borderColor: G.border }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{sub.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon
                            className={"w-4 h-4 " + (config.spin ? "animate-spin" : "")}
                            style={{ color: config.color }}
                          />
                          <span className="text-xs font-semibold" style={{ color: config.color }}>
                            {config.label}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/40">
                        <span>ID: {sub.approval_id}</span>
                        <span>
                          Submitted:{" "}
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>

                      {/* Info Request Message */}
                      {sub.status === "INFO_REQUESTED" && sub.info_request_message && (
                        <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <p className="text-yellow-400 text-[10px] font-semibold mb-1">
                            Admin Request:
                          </p>
                          <p className="text-white text-xs whitespace-pre-wrap">
                            {sub.info_request_message}
                          </p>
                        </div>
                      )}

                      {/* Customer Response (already submitted) */}
                      {sub.customer_response && respondingTo !== sub.approval_id && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <p className="text-blue-400 text-[10px] font-semibold mb-1">
                            Your Response:
                          </p>
                          <p className="text-white text-xs whitespace-pre-wrap">
                            {sub.customer_response}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {sub.status === "REJECTED" && sub.rejection_reason && (
                        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="text-red-400 text-[10px] font-semibold mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-white text-xs whitespace-pre-wrap">
                            {sub.rejection_reason}
                          </p>
                        </div>
                      )}

                      {/* Approved Features */}
                      {sub.status === "APPROVED" && sub.activated_features?.length > 0 && (
                        <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                          <p className="text-green-400 text-[10px] font-semibold mb-1">
                            ✅ Approved! You can now redeem your code to activate:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sub.activated_features.map((feat, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Respond Form */}
                      {sub.status === "INFO_REQUESTED" && respondingTo === sub.approval_id && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={responseData}
                            onChange={(e) => setResponseData(e.target.value)}
                            placeholder="Type your response..."
                            className="bg-white/5 border-white/10 text-white text-sm min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRespond(sub.approval_id)}
                              disabled={responding || !responseData.trim()}
                              className="btn-gold text-xs"
                              size="sm"
                            >
                              {responding ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3 mr-1" />
                              )}
                              Send Response
                            </Button>
                            <Button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseData("");
                              }}
                              variant="outline"
                              className="border-white/20 text-white/60 text-xs"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Respond Button */}
                      {sub.status === "INFO_REQUESTED" && respondingTo !== sub.approval_id && (
                        <Button
                          onClick={() => setRespondingTo(sub.approval_id)}
                          variant="outline"
                          className="mt-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                          size="sm"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Note */}
        <div
          className="rounded-xl border p-4 text-center"
          style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.15)" }}
        >
          <p className="text-xs text-white/50 leading-relaxed">
            🎫 Submit your reading code here for admin review. Once approved, you can redeem it
            to activate your purchased features. This is separate from the instant redeem flow.
          </p>
        </div>
      </motion.div>
    </PageLayout>
  );
}