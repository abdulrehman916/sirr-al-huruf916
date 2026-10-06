/**
 * MyRequests — User inbox page showing all access requests and conversations.
 * Public route — uses session_id (localStorage) to identify the user.
 * Features: search, status filter, file attachment, reopen closed requests.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getSessionId } from "@/lib/sessionId";
import { REQUEST_STATUSES, STATUS_FILTERS, getStatusConfig } from "@/lib/accessRequestStatus";
import { Inbox, RefreshCw, ChevronLeft, Send, Loader2, AlertCircle, KeyRound, Paperclip, X, RotateCcw, Search } from "lucide-react";
import RequestConversation from "@/components/RequestConversation";

const G = {
  border: "rgba(212,175,55,0.30)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [attachmentUrl, setAttachmentUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getUserRequests", {
        session_id: getSessionId(),
      });
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      } else {
        setError(res.data?.error || "Failed to load requests");
      }
    } catch (e) {
      setError(e.message || "Failed to load requests");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleReply = async (requestId, reopen = false) => {
    if (!replyText.trim() && !attachmentUrl) return;
    setReplying(true);
    try {
      await base44.functions.invoke("replyToAccessRequest", {
        request_id: requestId,
        session_id: getSessionId(),
        message: replyText.trim(),
        attachment_url: attachmentUrl,
        reopen,
      });
      setReplyText("");
      setAttachmentUrl(null);
      await loadRequests();
    } catch (e) {
      setError(e.message);
    }
    setReplying(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentUrl(file_url);
    } catch (e) {
      setError("Failed to upload file: " + e.message);
    }
    setUploading(false);
  };

  const filtered = requests.filter(r => {
    const statusMatch = statusFilter === "ALL" ? true : r.status === statusFilter;
    if (!statusMatch) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.request_id || "").toLowerCase().includes(q) ||
      (r.page_name || "").toLowerCase().includes(q) ||
      (r.plan_name || "").toLowerCase().includes(q) ||
      (r.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen" style={{ background: "#020710" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-inter text-xs font-semibold"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}>
              <ChevronLeft className="w-4 h-4" />
              Home
            </Link>
            <h1 className="font-amiri text-2xl font-bold" style={{ color: G.text }}>
              My Requests
            </h1>
          </div>
          <button onClick={loadRequests} disabled={loading}
            className="p-2 rounded-xl" style={{ border: `1px solid ${G.border}`, background: G.bg, color: G.text }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Request ID, page, plan..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none placeholder-white/30"
              style={{ background: G.bg, border: `1px solid ${G.border}`, fontSize: "16px" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-xl text-sm font-inter outline-none"
            style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text, fontSize: "16px" }}
          >
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border p-3 flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)" }}>
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: G.text }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ background: G.bg, borderColor: G.border }}>
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: G.text }} />
            <p className="font-inter text-sm text-white/40 mb-2">
              {requests.length === 0 ? "No requests yet" : "No matching requests"}
            </p>
            <p className="font-inter text-xs text-white/30">
              {requests.length === 0
                ? "When you request access to a premium feature, your requests and conversations will appear here."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const isExpanded = expandedId === req.request_id;
              const sc = getStatusConfig(req.status);
              const lastMsg = req.messages?.[req.messages.length - 1];
              const isClosed = req.status === "CLOSED";
              return (
                <div key={req.request_id} className="rounded-2xl border overflow-hidden"
                  style={{ background: G.bg, borderColor: G.border }}>
                  {/* Request summary — clickable */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.request_id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${sc.color}1a`, border: `1px solid ${sc.color}66`, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span className="font-mono text-[10px] text-white/40">{req.request_id}</span>
                    </div>
                    <p className="font-inter text-sm font-semibold text-white/80 mb-1">{req.page_name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40 flex-wrap">
                      {req.plan_name && <span style={{ color: G.text }}>{req.plan_name}</span>}
                      {req.price != null && <span>· {req.currency} {req.price}</span>}
                      <span>· {fmtDate(req.requested_at)}</span>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-white/50 mt-2 truncate">
                        <span className="text-white/30">{lastMsg.sender_type === "ADMIN" ? "Admin: " : "You: "}</span>
                        {lastMsg.message}
                      </p>
                    )}
                  </button>

                  {/* Expanded conversation + reply */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: G.border }}>
                      {/* Request details */}
                      <div className="pt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-white/30">Created: </span>
                          <span className="text-white/60">{fmtDate(req.requested_at)}</span>
                        </div>
                        <div>
                          <span className="text-white/30">Status: </span>
                          <span style={{ color: sc.color }}>{sc.label}</span>
                        </div>
                        {req.plan_name && (
                          <div>
                            <span className="text-white/30">Plan: </span>
                            <span className="text-white/60">{req.plan_name}</span>
                          </div>
                        )}
                        {req.price != null && (
                          <div>
                            <span className="text-white/30">Price: </span>
                            <span className="text-white/60">{req.currency} {req.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Conversation */}
                      <div>
                        <p className="font-inter text-[10px] text-white/30 uppercase tracking-wider mb-2">Conversation</p>
                        <RequestConversation messages={req.messages || []} />
                      </div>

                      {/* Attachment preview */}
                      {attachmentUrl && (
                        <div className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
                          <img src={attachmentUrl} alt="Attachment" className="w-full max-h-32 object-cover" />
                          <button
                            onClick={() => setAttachmentUrl(null)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Reply box */}
                      <div className="flex gap-2 items-end">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || replying}
                          className="p-2.5 rounded-xl flex-shrink-0"
                          style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
                        >
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                        </button>
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder={isClosed ? "Type to reopen this request..." : "Type your reply..."}
                          rows={1}
                          className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none placeholder-white/20 resize-none"
                          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
                        />
                        <button
                          onClick={() => handleReply(req.request_id, isClosed)}
                          disabled={replying || (!replyText.trim() && !attachmentUrl)}
                          className="p-2.5 rounded-xl disabled:opacity-50 flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
                        >
                          {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : isClosed ? <RotateCcw className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Redeem code prompt if CODE_UPDATED */}
                      {req.status === "CODE_UPDATED" && (
                        <div className="rounded-xl border p-3 flex items-center gap-2"
                          style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.35)" }}>
                          <KeyRound className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <p className="text-xs text-blue-300">
                            Your Reading Code has been updated. Please redeem it again to unlock this feature.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}