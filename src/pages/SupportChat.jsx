import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const G = {
  border: "rgba(212,175,55,0.35)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
};

export default function SupportChat() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ticketId, setTicketId] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for admin replies
  useEffect(() => {
    if (!ticketId) return;
    const unsub = base44.entities.SupportMessage.subscribe((event) => {
      if (event.data?.ticket_id === ticketId) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === event.data.id);
          return exists ? prev : [...prev, event.data];
        });
      }
    });
    return () => unsub();
  }, [ticketId]);

  const initChat = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      setUser(u);

      // Find or create a chat ticket for this user
      const existing = await base44.entities.SupportTickets.filter({
        email: u.email || "",
        category: "General Question"
      }, "-created_at");

      let tid;
      if (existing.length > 0 && existing[0].status !== "CLOSED") {
        tid = existing[0].ticket_id;
      } else {
        const allTickets = await base44.entities.SupportTickets.list('-created_at', 100);
        const maxNum = allTickets.reduce((max, t) => {
          const n = parseInt(t.ticket_id?.split("-")[1] || "0");
          return n > max ? n : max;
        }, 0);
        const newId = `SUP-${String(maxNum + 1).padStart(6, "0")}`;
        await base44.entities.SupportTickets.create({
          ticket_id: newId,
          name: u.full_name || u.email || "User",
          mobile: "",
          email: u.email || "",
          category: "General Question",
          subject: "Live Chat",
          message: "Chat started",
          status: "OPEN",
          created_at: new Date().toISOString(),
        });
        tid = newId;
      }
      setTicketId(tid);

      // Load messages
      const msgs = await base44.entities.SupportMessage.filter({ ticket_id: tid }, "created_at");
      setMessages(msgs || []);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !ticketId || sending) return;
    setSending(true);
    try {
      const u = user || {};
      const messageId = `MSG-${Date.now()}`;
      const msg = await base44.entities.SupportMessage.create({
        message_id: messageId,
        ticket_id: ticketId,
        sender_type: "CUSTOMER",
        sender_id: u.id || "anonymous",
        sender_name: u.full_name || u.email || "User",
        message: text.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
      });
      setMessages(prev => [...prev, msg]);
      setText("");
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <PageLayout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 130px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-1 py-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link to="/support" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" style={{ color: G.dim }} />
          </Link>
          <div>
            <h2 className="font-inter font-bold text-white text-sm">Live Chat</h2>
            <p className="text-[10px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.30)" }}>
              🛡️ Sirr al-Huruf Support
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block ml-1" />
              <span style={{ color: "rgba(34,197,94,0.60)", fontSize: "10px" }}>Online</span>
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-1 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: G.dim }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.30)" }}>
                Start a conversation with our support team
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.18)" }}>
                We typically respond within a few minutes
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender_type === "ADMIN";
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 ${isAdmin
                    ? "mr-auto rounded-bl-sm"
                    : "ml-auto rounded-br-sm"}`}
                    style={{
                      background: isAdmin ? "rgba(59,130,246,0.08)" : "rgba(212,175,55,0.10)",
                      border: `1px solid ${isAdmin ? "rgba(59,130,246,0.20)" : "rgba(212,175,55,0.20)"}`,
                    }}>
                    <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {isAdmin ? "🛡️ Sirr al-Huruf Support" : (msg.sender_name || "You")}
                      <span className="mx-1.5">·</span>
                      {formatTime(msg.created_at)}
                    </p>
                    <p className="text-white text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-1 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border-white/10 text-white min-h-[48px] max-h-[120px] resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="btn-gold px-4 flex-shrink-0 self-end"
              style={{ height: 48 }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}