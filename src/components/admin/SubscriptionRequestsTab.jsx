import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, User, Mail, Phone, Calendar, Search, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)"
};

const STATUS_COLORS = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/50",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/50",
  ACTIVATED: "bg-blue-500/20 text-blue-400 border-blue-500/50"
};

const PLAN_DAYS = {
  "1_MONTH": 30,
  "3_MONTHS": 90,
  "6_MONTHS": 180,
  "12_MONTHS": 365,
  "CUSTOM": 30
};

export default function SubscriptionRequestsTab() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [approving, setApproving] = useState(null);
  const [customDays, setCustomDays] = useState("30");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const allRequests = await base44.entities.SubscriptionRequest.list("-requested_at");
      setRequests(allRequests);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.page_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!approving) return;

    try {
      const days = parseInt(customDays) || 30;
      const now = new Date();
      const expiryDate = new Date(now.getTime() + days * 86400000);
      
      // Find user by email
      const allUsers = await base44.entities.User.list();
      const targetUser = allUsers.find(u => u.email === approving.email);
      
      if (!targetUser) {
        toast({ title: "User Not Found", description: "Please ensure the user has registered first.", variant: "destructive" });
        return;
      }

      // Get permission code
      const permissionCode = approving.page_path.replace("/", "").toUpperCase().replace(/-/g, "_") + "_ACCESS";

      // Grant page permission
      const permResult = await base44.functions.invoke("grantPagePermission", {
        user_id: targetUser.id,
        page_path: approving.page_path,
        page_name: approving.page_name,
        permission_code: permissionCode,
        start_date: now.toISOString(),
        expiry_date: expiryDate.toISOString(),
      });

      // Update subscription request
      await base44.entities.SubscriptionRequest.update(approving.id, {
        status: "ACTIVATED",
        approved_by: (await base44.auth.me()).id,
        approved_at: now.toISOString(),
        activation_duration_days: days,
        expiry_date: expiryDate.toISOString(),
        permission_id: permResult?.permission_id || null,
      });

      toast({ title: "✓ Subscription Activated", description: `${approving.name} granted ${days} days access` });
      setApproving(null);
      loadRequests();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (request) => {
    if (!confirm(`Reject subscription request from ${request.name}?`)) return;
    
    try {
      await base44.entities.SubscriptionRequest.update(request.id, {
        status: "REJECTED",
        approved_by: (await base44.auth.me()).id,
        approved_at: new Date().toISOString(),
      });
      toast({ title: "✓ Request Rejected" });
      loadRequests();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fmt = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const counts = {
    PENDING: requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
    ACTIVATED: requests.filter(r => r.status === "ACTIVATED").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: counts.PENDING, color: "#f59e0b" },
          { label: "Approved", value: counts.APPROVED, color: "#22c55e" },
          { label: "Rejected", value: counts.REJECTED, color: "#ef4444" },
          { label: "Activated", value: counts.ACTIVATED, color: "#60a5fa" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or page..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["PENDING", "APPROVED", "REJECTED", "ACTIVATED"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.25)" }}>
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No subscription requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRequests.map(req => (
            <div key={req.id} className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4" style={{ color: G.text }} />
                    <p className="font-inter font-bold text-white text-sm">{req.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Mail className="w-3 h-3" />{req.email}
                    </span>
                    {req.mobile && (
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Phone className="w-3 h-3" />{req.mobile}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>
                      {req.page_name || req.page_path}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}>
                      {(req.selected_plan || "").replace(/_/g, " ")}
                    </span>
                    {req.activation_duration_days && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(34,197,94,0.10)", color: "#4ade80" }}>
                        {req.activation_duration_days} days
                      </span>
                    )}
                  </div>
                  {req.message && (
                    <p className="text-xs text-white/50 mt-2 italic">"{req.message}"</p>
                  )}
                  <p className="text-xs text-white/30 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Requested {fmt(req.requested_at)}
                  </p>
                  {req.expiry_date && (
                    <p className="text-xs text-white/30 mt-0.5">
                      Expires: {fmt(req.expiry_date)}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge className={`${STATUS_COLORS[req.status] || STATUS_COLORS.PENDING} border text-xs font-semibold`}>
                    {req.status}
                  </Badge>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => { setApproving(req); setCustomDays(PLAN_DAYS[req.selected_plan]?.toString() || "30"); }}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.30)" }}
                      >
                        Activate
                      </button>
                      <button 
                        onClick={() => handleReject(req)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.30)" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {req.approved_at && (
                    <p className="text-xs text-white/30 mt-1">
                      {req.status === "ACTIVATED" ? "Activated" : req.status} {fmt(req.approved_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {approving && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setApproving(null)}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-5"
              style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-inter font-bold text-white text-base">Activate Subscription</h3>
                  <p className="text-xs text-white/40 mt-0.5">{approving.name} · {approving.page_name}</p>
                </div>
                <button onClick={() => setApproving(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.40)" }}>
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-white/45 mb-2">Duration (days)</p>
                <Input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setApproving(null)} className="flex-1 py-3 rounded-xl font-inter font-semibold text-sm"
                  style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.text }}>
                  Cancel
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex-1 py-3 rounded-xl font-inter font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}
                >
                  Activate Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}