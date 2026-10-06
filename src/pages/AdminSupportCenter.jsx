import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Search, Filter, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

const STATUS_COLORS = {
  OPEN: "bg-blue-500/15 text-blue-400 border-blue-500/40",
  IN_PROGRESS: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
  WAITING_FOR_CUSTOMER: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  RESOLVED: "bg-green-500/15 text-green-400 border-green-500/40",
  CLOSED: "bg-gray-500/15 text-gray-400 border-gray-500/40",
};

const PRIORITY_COLORS = {
  LOW: "text-gray-400",
  NORMAL: "text-blue-400",
  HIGH: "text-orange-400",
  URGENT: "text-red-400",
};

export default function AdminSupportCenter() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!["owner", "admin"].includes(user?.role)) { setIsAdmin(false); return; }
      setIsAdmin(true);
      loadConversations();
    } catch (e) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke("getSupportConversations", { limit: 100, skip: 0 });
      let convs = result.conversations || [];
      
      if (statusFilter !== "ALL") {
        convs = convs.filter(c => c.status === statusFilter);
      }
      if (search) {
        const s = search.toLowerCase();
        convs = convs.filter(c => 
          (c.subject || "").toLowerCase().includes(s) ||
          (c.user_name || "").toLowerCase().includes(s) ||
          (c.user_email || "").toLowerCase().includes(s)
        );
      }
      
      setConversations(convs);
    } catch (e) {
      toast({ title: "Failed to load conversations", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation_id) => {
    try {
      const result = await base44.functions.invoke("getSupportMessages", { conversation_id, limit: 100 });
      setMessages(result.messages || []);
    } catch (e) {
      toast({ title: "Failed to load messages", description: e.message, variant: "destructive" });
    }
  };

  const sendMessage = async () => {
    if (!replyMessage.trim() || !selectedConv) return;
    
    setSending(true);
    try {
      await base44.functions.invoke("sendSupportMessage", {
        conversation_id: selectedConv.conversation_id,
        message: replyMessage.trim()
      });
      setReplyMessage("");
      loadMessages(selectedConv.conversation_id);
      loadConversations();
      toast({ title: "Message sent" });
    } catch (e) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const updateConversation = async (conversation_id, updates) => {
    try {
      await base44.functions.invoke("updateSupportConversation", { conversation_id, ...updates });
      loadConversations();
      toast({ title: "Conversation updated" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  if (isAdmin === false) return <Navigate to="/" replace />;
  if (isAdmin === null || loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: conversations.length,
    open: conversations.filter(c => c.status === "OPEN").length,
    inProgress: conversations.filter(c => c.status === "IN_PROGRESS").length,
    resolved: conversations.filter(c => c.status === "RESOLVED").length,
    unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  };

  return (
    <AdminLayout title="Support Center" subtitle="Manage customer conversations">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} icon={<MessageSquare className="w-4 h-4" />} />
          <StatCard label="Open" value={stats.open} icon={<AlertCircle className="w-4 h-4" />} color="blue" />
          <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="w-4 h-4" />} color="yellow" />
          <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle className="w-4 h-4" />} color="green" />
          <StatCard label="Unread" value={stats.unread} icon={<MessageSquare className="w-4 h-4" />} color="orange" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border, fontSize: 16 }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border }}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadConversations} className="btn-gold">Refresh</Button>
        </div>

        {/* Conversations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setSelectedConv(conv); loadMessages(conv.conversation_id); setShowDialog(true); }}
              className="rounded-xl border p-4 cursor-pointer transition-all hover:border-yellow-400/40"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] border ${STATUS_COLORS[conv.status]}`}>{conv.status}</Badge>
                    {conv.priority && conv.priority !== "NORMAL" && (
                      <span className={`text-[10px] font-bold ${PRIORITY_COLORS[conv.priority]}`}>{conv.priority}</span>
                    )}
                  </div>
                  <h3 className="font-inter font-semibold text-white text-sm truncate">{conv.subject}</h3>
                  <p className="text-[10px] text-white/40 mt-0.5">{conv.user_name} • {conv.category}</p>
                </div>
                {conv.unread_count > 0 && (
                  <Badge className="bg-blue-500 text-white text-[10px]">{conv.unread_count}</Badge>
                )}
              </div>
              {conv.last_message && (
                <p className="text-[10px] text-white/30 mt-2 truncate">{conv.last_message.message}</p>
              )}
              <p className="text-[9px] text-white/20 mt-1">{new Date(conv.last_message_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Conversation Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col" style={{ background: "#020710", borderColor: G.border }}>
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedConv?.subject}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-[10px] border ${STATUS_COLORS[selectedConv?.status]}`}>{selectedConv?.status}</Badge>
                  <span className="text-[10px] text-white/40">{selectedConv?.user_name}</span>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4" style={{ maxHeight: "400px" }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "ADMIN" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-xl p-3 max-w-[80%] ${
                      msg.sender_type === "ADMIN" 
                        ? "bg-yellow-500/10 border border-yellow-500/30" 
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <p className="text-sm text-white">{msg.message}</p>
                    {msg.attachment_url && (
                      <div className="mt-2">
                        {msg.message_type === "IMAGE" ? (
                          <img src={msg.attachment_url} alt="Attachment" className="rounded-lg max-w-full" />
                        ) : (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 underline">
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-[9px] text-white/30 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor: G.border }}>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="flex-1"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border, fontSize: 16, resize: "none" }}
              />
              <Button onClick={sendMessage} disabled={sending || !replyMessage.trim()} className="btn-gold px-6">
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>

            {/* Actions */}
            <DialogFooter className="flex gap-2">
              <Select value={selectedConv?.status} onValueChange={(v) => updateConversation(selectedConv.conversation_id, { status: v })}>
                <SelectTrigger className="w-[150px]" style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border }}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedConv?.priority} onValueChange={(v) => updateConversation(selectedConv.conversation_id, { priority: v })}>
                <SelectTrigger className="w-[120px]" style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border }}>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, color = "white" }) {
  return (
    <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
      <div className={`flex items-center justify-center mb-1 text-${color}-400`}>{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}