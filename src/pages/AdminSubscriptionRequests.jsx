import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, Search, Shield, CheckCircle, Clock, XCircle, 
  Loader2, User, Calendar, ArrowRight
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  PENDING: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  APPROVED: "bg-green-500/20 text-green-500 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-500 border-red-500/30",
};

export default function AdminSubscriptionRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPage, setFilterPage] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser || !["owner", "admin"].includes(currentUser.role)) {
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setUser(currentUser);
      fetchRequests();
    } catch (err) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const allRequests = await base44.entities.AccessRequest.list("-requested_at", 100);
      setRequests(allRequests);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (req) => {
    try {
      await base44.functions.invoke("approveAccessRequest", {
        request_id: req.request_id,
        duration: "1_MONTH"
      });

      toast({
        title: "Approved",
        description: `${req.name || req.email}'s access has been granted for 1 month`,
      });
      fetchRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (reqId) => {
    try {
      const reqs = await base44.entities.AccessRequest.filter({ request_id: reqId });
      if (reqs.length > 0) {
        await base44.entities.AccessRequest.update(reqs[0].id, {
          status: "REJECTED",
          approved_by: user.id,
          approved_at: new Date().toISOString()
        });
      }

      toast({
        title: "Rejected",
        description: "Access request rejected",
      });
      fetchRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === "" || 
      (req.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesPage = filterPage === "all" || req.page_path === filterPage;
    
    return matchesSearch && matchesStatus && matchesPage;
  });

  const uniquePages = [...new Set(requests.map(req => req.page_path))].filter(Boolean);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-gold" />
            Access Requests
          </h1>
          <p className="text-white/70">
            Review and approve manual access requests
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-sm">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{requests.length}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-500/70 text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {requests.filter(r => r.status === "PENDING").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-500/70 text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {requests.filter(r => r.status === "APPROVED").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-500/70 text-sm">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {requests.filter(r => r.status === "REJECTED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-white/10 bg-white/5 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="all" className="text-white">All Status</SelectItem>
                    <SelectItem value="PENDING" className="text-white">Pending</SelectItem>
                    <SelectItem value="APPROVED" className="text-white">Approved</SelectItem>
                    <SelectItem value="REJECTED" className="text-white">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterPage} onValueChange={setFilterPage}>
                  <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by page" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="all" className="text-white">All Pages</SelectItem>
                    {uniquePages.map(page => (
                      <SelectItem key={page} value={page} className="text-white">
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || filterStatus !== "all" || filterPage !== "all") && (
              <div className="text-sm text-white/60 mt-3">
                Found {filteredRequests.length} request(s)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6 text-center text-white/60">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No access requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="border-white/10 bg-white/5 hover:border-white/20 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={STATUS_COLORS[req.status] || STATUS_COLORS.PENDING}>
                          {req.status}
                        </Badge>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-white/50" />
                            <span className="text-white text-sm font-medium truncate">
                              {req.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <span className="truncate">{req.email || req.phone || "No contact"}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <Badge variant="outline" className="border-gold-dim text-gold-dim">
                              {req.page_name}
                            </Badge>
                            {req.message && (
                              <span className="text-white/50 italic max-w-xs truncate">
                                "{req.message}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <div className="text-right hidden md:block">
                          <div className="flex items-center gap-1 justify-end mb-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(req.requested_at).toLocaleDateString()}
                          </div>
                          {req.status === "PENDING" && (
                            <div className="text-orange-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Awaiting approval
                            </div>
                          )}
                          {req.status === "APPROVED" && req.approved_at && (
                            <div className="text-green-500 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Approved {new Date(req.approved_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {req.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/30"
                              onClick={() => handleApprove(req)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 text-red-500 hover:bg-red-500/20"
                              onClick={() => handleReject(req.request_id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {req.status !== "PENDING" && (
                          <ArrowRight className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}