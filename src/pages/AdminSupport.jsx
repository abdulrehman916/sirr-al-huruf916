import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Search, Mail, User, Calendar, CheckCircle, Clock, AlertCircle, XCircle, Mic } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const STATUS_CONFIG = {
  OPEN: { color: "bg-blue-500/20 text-blue-400 border-blue-500/50", icon: Clock, label: "Open" },
  IN_PROGRESS: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: AlertCircle, label: "In Progress" },
  RESOLVED: { color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle, label: "Resolved" },
  CLOSED: { color: "bg-gray-500/20 text-gray-400 border-gray-500/50", icon: XCircle, label: "Closed" }
};

const CATEGORY_ICONS = {
  "Bug Report": "🐛",
  "Feature Request": "✨",
  "Content Correction": "📝",
  "Access Problem": "🔒",
  "General Question": "❓"
};

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)"
};

export default function AdminSupport() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [customerAdminMap, setCustomerAdminMap] = useState({});
  const [adminFilter, setAdminFilter] = useState("all");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await base44.auth.me();
      if (!user || !["owner", "admin"].includes(user.role)) {
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "Only administrators can access this page",
          variant: "destructive"
        });
      } else {
        setIsAdmin(true);
        loadTickets();
      }
    } catch (error) {
      setIsAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
        variant: "destructive"
      });
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageSupportRouting", {
        action: "GET_SCOPED_TICKETS",
      });
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
        setIsOwner(res.data.is_owner || false);
        setAdminProfiles(res.data.admin_profiles || []);
        setCustomerAdminMap(res.data.customer_admin_map || {});
      } else {
        setTickets([]);
      }
    } catch (error) {
      toast({
        title: "Error Loading Tickets",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    const matchesAdmin = !isOwner || adminFilter === "all" ||
      (adminFilter === "unassigned"
        ? !customerAdminMap[ticket.email?.toLowerCase()]
        : customerAdminMap[ticket.email?.toLowerCase()] === adminFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesAdmin;
  });

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await base44.entities.SupportTickets.update(ticketId, { status: newStatus });
      await loadTickets();
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick action buttons for Close / Reopen
  const handleCloseTicket = async (e, ticketId) => {
    e.stopPropagation();
    await handleStatusChange(ticketId, "CLOSED");
  };
  const handleReopenTicket = async (e, ticketId) => {
    e.stopPropagation();
    await handleStatusChange(ticketId, "OPEN");
  };

  const formatAudioDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    try {
      await base44.entities.SupportTickets.update(selectedTicket.id, {
        admin_reply: replyText,
        status: selectedTicket.status === "OPEN" ? "IN_PROGRESS" : selectedTicket.status
      });
      toast({
        title: "Reply Saved",
        description: "Admin reply has been saved to the ticket."
      });
      setReplyText("");
      await loadTickets();
    } catch (error) {
      toast({
        title: "Reply Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isAdmin === false) return <Navigate to="/" replace />;

  if (isAdmin === null) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Support Messages" subtitle="Customer Tickets">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = tickets.filter(t => t.status === status).length;
            const Icon = config.icon;
            return (
              <div key={status} className="rounded-xl border p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                <Icon className="w-4 h-4 mx-auto mb-1 text-white/50" />
                <p className="text-lg font-bold text-white">{count}</p>
                <p className="text-[10px] text-white/40">{config.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_CONFIG).map(status => (
                <SelectItem key={status} value={status}>{STATUS_CONFIG[status].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(CATEGORY_ICONS).map(cat => (
                <SelectItem key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isOwner && (
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admins</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {adminProfiles.map((admin) => (
                  <SelectItem key={admin.admin_profile_id} value={admin.admin_profile_id}>
                    {admin.full_name || admin.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border p-4"
                style={{ background: G.bg, borderColor: G.border }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-white text-xs">{ticket.ticket_id}</span>
                      {getStatusBadge(ticket.status)}
                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                        {CATEGORY_ICONS[ticket.category]} {ticket.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1 truncate">{ticket.subject}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.name}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{ticket.email}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Dialog>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Quick Close / Reopen */}
                      {ticket.status !== "CLOSED" ? (
                        <Button variant="outline" size="sm"
                          className="text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                          onClick={(e) => handleCloseTicket(e, ticket.id)} disabled={updatingStatus}>
                          Close
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm"
                          className="text-xs border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                          onClick={(e) => handleReopenTicket(e, ticket.id)} disabled={updatingStatus}>
                          Reopen
                        </Button>
                      )}
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm"
                          className="text-xs border-gold/40 text-gold hover:bg-gold/10"
                          onClick={() => setSelectedTicket(ticket)}>
                          View
                        </Button>
                      </DialogTrigger>
                    </div>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white text-sm">{ticket.ticket_id} — {ticket.subject}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white/60 text-xs">Status</Label>
                            <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                          </div>
                          <div>
                            <Label className="text-white/60 text-xs">Change Status</Label>
                            <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)} disabled={updatingStatus}>
                              <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(STATUS_CONFIG).map(status => (
                                  <SelectItem key={status} value={status}>{STATUS_CONFIG[status].label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 space-y-1 text-sm">
                          <p className="text-white"><strong>Name:</strong> {ticket.name}</p>
                          <p className="text-white"><strong>Email:</strong> {ticket.email}</p>
                          <p className="text-white"><strong>Mobile:</strong> {ticket.mobile}</p>
                        </div>
                        <div>
                          <Label className="text-white/60 text-xs">Message</Label>
                          <div className="mt-1 p-3 rounded-lg bg-white/5">
                            <p className="text-white text-sm whitespace-pre-wrap">{ticket.message}</p>
                          </div>
                        </div>
                        {ticket.attachment_url && (
                          <div>
                            <Label className="text-white/60 text-xs">Attachment</Label>
                            <div className="mt-1">
                              <a href={ticket.attachment_url} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:underline">View Attachment</a>
                            </div>
                          </div>
                        )}
                        {ticket.audio_url && (
                          <div>
                            <Label className="text-white/60 text-xs">Voice Message</Label>
                            <div className="mt-1 p-3 rounded-lg bg-white/5 border border-gold/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Mic className="w-4 h-4" style={{ color: G.text }} />
                                <span className="text-white text-sm">Voice Message — {ticket.audio_duration ? formatAudioDuration(ticket.audio_duration) : 'N/A'}</span>
                              </div>
                              <audio controls className="w-full">
                                <source src={ticket.audio_url} type="audio/webm" />
                                <source src={ticket.audio_url} type="audio/mp4" />
                                <source src={ticket.audio_url} type="audio/mpeg" />
                              </audio>
                            </div>
                          </div>
                        )}
                        <div>
                          <Label className="text-white/60 text-xs">Reply</Label>
                          <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..." className="mt-1 bg-white/5 border-white/10 text-white text-sm min-h-[80px]" />
                          <Button onClick={handleReplySubmit} disabled={submittingReply || !replyText.trim()}
                            className="mt-2 btn-gold text-sm">
                            {submittingReply ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                        {ticket.admin_reply && (
                          <div>
                            <Label className="text-white/60 text-xs">Previous Reply</Label>
                            <div className="mt-1 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                              <p className="text-white text-sm whitespace-pre-wrap">{ticket.admin_reply}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}