/**
 * RequestConversation — Shared component displaying messages for an AccessRequest.
 * Used by both MyRequests (user) and RequestDetail (admin).
 */
import { User, Shield } from "lucide-react";

export default function RequestConversation({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-white/30">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-none">
      {messages.map((msg, i) => {
        const isAdmin = msg.sender_type === "ADMIN";
        return (
          <div key={i} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
            <div
              className="max-w-[85%] rounded-xl p-2.5"
              style={{
                background: isAdmin ? "rgba(59,130,246,0.10)" : "rgba(212,175,55,0.10)",
                border: isAdmin ? "1px solid rgba(59,130,246,0.30)" : "1px solid rgba(212,175,55,0.30)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isAdmin ? (
                  <Shield className="w-3 h-3" style={{ color: "#60a5fa" }} />
                ) : (
                  <User className="w-3 h-3" style={{ color: "#F5D060" }} />
                )}
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: isAdmin ? "#60a5fa" : "#F5D060" }}
                >
                  {isAdmin ? "Admin" : "You"}
                </span>
                {msg.status_change && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    → {msg.status_change.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 whitespace-pre-wrap break-words">{msg.message}</p>
              {msg.attachment_url && (
                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                  <img src={msg.attachment_url} alt="Attachment" className="rounded-lg max-w-full max-h-40 object-cover" />
                </a>
              )}
              <p className="text-[9px] text-white/30 mt-1">
                {new Date(msg.created_at).toLocaleString("en-GB", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}