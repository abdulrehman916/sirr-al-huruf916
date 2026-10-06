import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Search, Clock, X, Send, Image, Mic,
  Square, Play, Pause, ExternalLink
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ADMIN_CONFIG } from "@/lib/adminConfig";
import WhatsAppMessenger from "./WhatsAppMessenger";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const STATUS_COLORS = {
  OPEN: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  RESOLVED: "bg-green-500/20 text-green-400 border-green-500/40",
  CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/40"
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

// ── Voice Recorder ────────────────────────────────────────────────────────────
function VoiceRecorder({ onSend, disabled }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        onSend(file);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stop = () => {
    if (mediaRef.current) mediaRef.current.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };

  return recording ? (
    <button onClick={stop}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.40)", color: "#ef4444" }}>
      <Square className="w-3.5 h-3.5" /> Stop · {seconds}s
    </button>
  ) : (
    <button onClick={start} disabled={disabled}
      className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
      title="Record voice message">
      <Mic className="w-4 h-4" />
    </button>
  );
}

// ── Audio Player ──────────────────────────────────────────────────────────────
function AudioPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button onClick={toggle}
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "rgba(212,175,55,0.20)", border: "1px solid rgba(212,175,55,0.35)" }}>
        {playing ? <Pause className="w-3.5 h-3.5" style={{ color: G.text }} /> : <Play className="w-3.5 h-3.5" style={{ color: G.text }} />}
      </button>
      <span className="text-xs text-white/40">Voice message</span>
    </div>
  );
}

// ── Chat Modal ────────────────────────────────────────────────────────────────
function ChatModal({ ticket, messages, onClose, onRefresh }) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendText = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await base44.functions.invoke("createSupportMessage", {
        ticket_id: ticket.ticket_id,
        message: replyText,
        sender_type: "ADMIN"
      });
      setReplyText("");
      onRefresh();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (file) => {
    setUploading(true);
    try {
      const isAudio = file.type.startsWith("audio/");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.functions.invoke("createSupportMessage", {
        ticket_id: ticket.ticket_id,
        message: isAudio ? "🎙️ Voice message" : `📎 ${file.name}`,
        sender_type: "ADMIN",
        attachment_url: isAudio ? undefined : file_url,
        audio_url: isAudio ? file_url : undefined,
      });
      onRefresh();
      toast({ title: isAudio ? "✓ Voice sent" : "✓ File sent" });
    } catch (e) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.88)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-2xl rounded-2xl flex flex-col"
        style={{ background: "linear-gradient(145deg,#0c1630,#060c1c)", border: `1px solid ${G.borderHi}`, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
          <div className="flex-1 min-w-0">
            <p className="font-inter font-bold text-white text-sm truncate">{ticket.subject}</p>
            <p className="text-xs text-white/40 mt-0.5">{ticket.name} · {ticket.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.40)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {messages.length === 0 && (
            <p className="text-center text-white/25 text-sm py-8">No messages yet.</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_type === "ADMIN" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-xl p-3 ${msg.sender_type === "ADMIN"
                ? "bg-yellow-500/10 border border-yellow-500/20"
                : "bg-white/5 border border-white/8"}`}>
                <p className="text-[10px] mb-1" style={{ color: msg.sender_type === "ADMIN" ? G.dim : "rgba(255,255,255,0.30)" }}>
                  {msg.sender_type === "ADMIN" ? "🛡️ Sirr al-Huruf Support" : msg.sender_name || ticket.name}
                  {" · "}{formatTime(msg.created_at)}
                </p>
                {msg.audio_url
                  ? <AudioPlayer url={msg.audio_url} />
                  : msg.attachment_url
                    ? <a href={msg.attachment_url} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-400 underline flex items-center gap-1">
                        <Image className="w-3 h-3" /> View attachment
                      </a>
                    : <p className="text-white text-sm leading-relaxed">{msg.message}</p>
                }
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-4 border-t flex items-end gap-2" style={{ borderColor: "rgba(212,175,55,0.10)" }}>
          {/* File upload */}
          <input ref={fileInputRef} type="file" className="hidden"
            accept="image/*,application/pdf,.doc,.docx"
            onChange={e => { if (e.target.files[0]) sendFile(e.target.files[0]); e.target.value = ""; }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
            title="Attach file/image">
            <Image className="w-4 h-4" />
          </button>

          {/* Voice */}
          <VoiceRecorder onSend={sendFile} disabled={uploading} />

          {/* Text */}
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Type reply…"
            rows={1}
            className="flex-1 px-3 py-2 rounded-xl text-sm text-white resize-none outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, minHeight: 40, maxHeight: 100 }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
          />
          <button onClick={sendText} disabled={sending || !replyText.trim()}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main MessagesTab ──────────────────────────────────────────────────────────
export default function MessagesTab() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [waTarget, setWaTarget] = useState(null);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await base44.entities.SupportTickets.list("-created_at");
      setTickets(allTickets);
      const messagesMap = {};
      for (const ticket of allTickets) {
        const msgs = await base44.entities.SupportMessage.filter({ ticket_id: ticket.ticket_id }, "created_at");
        messagesMap[ticket.ticket_id] = msgs || [];
      }
      setMessages(messagesMap);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter(t =>
    (t.ticket_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(status => {
          const count = tickets.filter(t => t.status === status).length;
          const colorClass = STATUS_COLORS[status].split(" ")[1];
          return (
            <div key={status} className="rounded-xl border p-3 text-center" style={{ background: G.bg, borderColor: G.border }}>
              <p className={`text-lg font-bold ${colorClass}`}>{count}</p>
              <p className="text-xs text-white/40 mt-0.5">{status.replace("_", " ")}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: G.dim }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search tickets…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}` }}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.25)" }}>
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => {
            const msgCount = (messages[ticket.ticket_id] || []).length;
            return (
              <div key={ticket.id} className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.border }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`${STATUS_COLORS[ticket.status]} border text-[10px] font-semibold px-2 py-0.5`}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-white/30 font-mono">{ticket.ticket_id}</span>
                      {msgCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: G.bgHi, color: G.text }}>
                          {msgCount} msg{msgCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="font-inter font-bold text-white text-sm">{ticket.subject}</p>
                    <p className="text-xs text-white/40 mt-0.5">{ticket.name} · {ticket.email}</p>
                    {ticket.mobile && <p className="text-xs text-white/30 mt-0.5">{ticket.mobile}</p>}
                    <p className="text-xs text-white/25 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatTime(ticket.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                    <button onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}>
                      Open Chat
                    </button>
                    <div className="flex gap-1.5">
                      {ticket.mobile && (
                        <button
                          onClick={() => setWaTarget({ name: ticket.name, mobile: ticket.mobile, email: ticket.email })}
                          className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ background: "rgba(37,211,102,0.10)", border: "1px solid rgba(37,211,102,0.25)", color: "#25D366" }}
                          title="WhatsApp Templates">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedTicket && (
          <ChatModal
            ticket={selectedTicket}
            messages={messages[selectedTicket.ticket_id] || []}
            onClose={() => setSelectedTicket(null)}
            onRefresh={() => { loadTickets(); }}
          />
        )}
        {waTarget && (
          <WhatsAppMessenger user={waTarget} onClose={() => setWaTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}