/**
 * RequestDetail — Admin conversation + reply + status actions for a single AccessRequest.
 * Shown when admin expands a request in AdminAccessRequests.
 */
import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, CheckCircle, DollarSign, KeyRound, XCircle, HelpCircle } from "lucide-react";
import { REQUEST_STATUSES } from "@/lib/accessRequestStatus";
import RequestConversation from "@/components/RequestConversation";

const G = {
  border: "rgba(212,175,55,0.30)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function RequestDetail({ request, onUpdate }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const loadMessages = useCallback(async () => {
    setLoadingMsgs(true);
    try {
      const msgs = await base44.entities.AccessRequestMessage.filter(
        { request_id: request.request_id },
        "created_at",
        200
      );
      setMessages(msgs || []);
    } catch {
      setMessages([]);
    }
    setLoadingMsgs(false);
  }, [request.request_id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Send a message + optionally change status
  const sendAdminMessage = async (message, statusChange = null) => {
    if (!message?.trim() && !statusChange) return;
    setSending(true);
    try {
      const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const now = new Date().toISOString();

      if (message?.trim()) {
        await base44.entities.AccessRequestMessage.create({
          message_id: messageId,
          request_id: request.request_id,
          sender_type: "ADMIN",
          sender_id: user?.id || "admin",
          sender_name: user?.full_name || "Admin",
          message: message.trim(),
          status_change: statusChange || null,
          created_at: now,
          is_read: false,
        });
      }

      if (statusChange === "APPROVED") {
        // Approval triggers automatic code delivery via backend function
        const res = await base44.functions.invoke("approveAccessRequest", {
          request_id: request.request_id,
        });
        if (!res.data?.success) {
          toast({ title: "Approval error", description: res.data?.error || "Failed to deliver access", variant: "destructive" });
          setSending(false);
          return;
        }
        toast({ title: "✓ Approved & code delivered" });
      } else if (statusChange) {
        await base44.entities.AccessRequest.update(request.id, {
          status: statusChange,
          approved_by: user?.id || "admin",
          approved_at: now,
        });
        toast({ title: "✓ Message sent" });
      } else {
        toast({ title: "✓ Message sent" });
      }
      setReply("");
      await loadMessages();
      if (onUpdate) onUpdate();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const handleSendReply = () => sendAdminMessage(reply);

  // Quick actions — each sends a pre-filled message + changes status
  const quickActions = [
    {
      label: "Approve & Deliver",
      icon: CheckCircle,
      color: "#22c55e",
      message: null,
      status: "APPROVED",
    },
    {
      label: "Payment Instructions",
      icon: DollarSign,
      color: "#f97316",
      message: "Please send your payment via WhatsApp. After payment is confirmed, your Reading Code will be updated. You can send the payment screenshot to our WhatsApp.",
      status: "AWAITING_PAYMENT",
    },
    {
      label: "Confirm Payment",
      icon: CheckCircle,
      color: "#22c55e",
      message: "Payment received and confirmed. Your Reading Code is being updated. You will be notified shortly to re-redeem your code.",
      status: "PAYMENT_CONFIRMED",
    },
    {
      label: "Code Updated — Redeem",
      icon: KeyRound,
      color: "#3b82f6",
      message: "Your Reading Code has been updated with the requested feature. Please redeem your code again to unlock access. Go to the locked feature and enter your code.",
      status: "CODE_UPDATED",
    },
    {
      label: "Ask for Info",
      icon: HelpCircle,
      color: "#a855f7",
      message: "Could you please provide additional information about your request? This will help us process it faster.",
      status: "INFO_REQUESTED",
    },
    {
      label: "Reject",
      icon: XCircle,
      color: "#ef4444",
      message: "Your request has been rejected. Please contact us on WhatsApp for more information.",
      status: "REJECTED",
    },
    {
      label: "Close Request",
      icon: XCircle,
      color: "#6b7280",
      message: "This request has been closed. If you need further assistance, you can reply to reopen it.",
      status: "CLOSED",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Conversation */}
      <div>
        <p className="font-inter text-[10px] text-white/30 uppercase tracking-wider mb-2">Conversation</p>
        {loadingMsgs ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: G.text }} />
          </div>
        ) : (
          <RequestConversation messages={messages} />
        )}
      </div>

      {/* Manual status change */}
      <div className="flex items-center gap-2">
        <select
          value={request.status}
          onChange={(e) => sendAdminMessage(null, e.target.value)}
          disabled={sending}
          className="px-3 py-1.5 rounded-lg text-xs font-inter font-semibold outline-none"
          style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
        >
          {Object.entries(REQUEST_STATUSES).map(([value, cfg]) => (
            <option key={value} value={value}>{cfg.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-white/30">Change status</span>
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => sendAdminMessage(action.message, action.status)}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-[10px] font-bold transition-all disabled:opacity-50"
              style={{
                background: `${action.color}15`,
                border: `1px solid ${action.color}50`,
                color: action.color,
              }}
            >
              <Icon className="w-3 h-3" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Custom reply box */}
      <div className="flex gap-2 items-end">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Type a custom reply..."
          rows={2}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none placeholder-white/20 resize-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, fontSize: "16px" }}
        />
        <button
          onClick={handleSendReply}
          disabled={sending || !reply.trim()}
          className="p-2.5 rounded-xl disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", color: "#0d1b2a" }}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}