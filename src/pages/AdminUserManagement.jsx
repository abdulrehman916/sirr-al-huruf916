import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, Search, Clock, CheckCircle, XCircle, Gift,
  Loader2, Calendar, Phone, Mail, Shield 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GrantAccessModal from "@/components/admin/GrantAccessModal";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountTab, setAccountTab] = useState("active"); // "active" | "deactivated"
  const [grantModalUser, setGrantModalUser] = useState(null);

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
      fetchData();
    } catch (err) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [userProfiles, subs] = await Promise.all([
        base44.entities.UserAccessProfile.list(null, 500),
        base44.entities.Subscription.list('-start_date', 500)
      ]);
      setUsers(userProfiles);
      setSubscriptions(subs);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const handleExtendSubscription = async (subId, days) => {
    try {
      const sub = subscriptions.find(s => s.id === subId);
      if (!sub) return;

      const newExpiry = new Date(sub.expiry_date);
      newExpiry.setDate(newExpiry.getDate() + days);

      await base44.entities.Subscription.update(subId, {
        expiry_date: newExpiry.toISOString(),
        last_modified_by: user.id,
        last_modified_at: new Date().toISOString(),
        notes: `Extended by ${days} days by admin`
      });

      toast({
        title: "Extended",
        description: `Subscription extended by ${days} days`,
      });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeSubscription = async (subId) => {
    try {
      await base44.entities.Subscription.update(subId, {
        status: "CANCELLED",
        last_modified_by: user.id,
        last_modified_at: new Date().toISOString()
      });
      toast({
        title: "Revoked",
        description: "Subscription cancelled",
      });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const INACTIVE_STATUSES = ["DEACTIVATED", "DISMISSED"];

  const filteredUsers = users.filter(u => {
    // Account tab filter
    const isInactive = INACTIVE_STATUSES.includes(u.account_status);
    if (accountTab === "active" && isInactive) return false;
    if (accountTab === "deactivated" && !isInactive) return false;

    // Search filter
    const matchesSearch = searchQuery === "" || 
      ((searchType === "phone" || searchType === "all") && u.mobile?.includes(searchQuery)) ||
      ((searchType === "email" || searchType === "all") && u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((searchType === "name" || searchType === "all") && u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // Subscription status filter (only on active tab)
    if (statusFilter === "all") return true;
    const userSubs = getUserSubscriptions(u.user_id);
    if (statusFilter === "active") {
      return userSubs.some(s => s.status === "ACTIVE" && s.expiry_date && new Date(s.expiry_date) > new Date());
    }
    if (statusFilter === "expired") {
      return userSubs.some(s => s.status === "EXPIRED" || (s.expiry_date && new Date(s.expiry_date) < new Date()));
    }
    if (statusFilter === "lifetime") {
      return userSubs.some(s => s.plan_name === "LIFETIME" && s.status === "ACTIVE");
    }
    return true;
  });

  const getUserSubscriptions = (userId) => {
    return subscriptions.filter(s => s.user_id === userId);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      ACTIVE: "bg-green-500/20 text-green-500 border-green-500/30",
      EXPIRED: "bg-red-500/20 text-red-500 border-red-500/30",
      CANCELLED: "bg-gray-500/20 text-gray-500 border-gray-500/30",
    };
    return variants[status] || variants.PENDING;
  };

  if (loading) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Access Manager" subtitle="Grant manual access, search users, manage subscriptions">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            User Access Manager
          </h1>
          <p className="text-white/70">
            Grant manual access, search users, manage subscriptions
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-white/70 text-sm">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-500/70 text-sm">Active Subs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {subscriptions.filter(s => s.status === "ACTIVE").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-500/70 text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {subscriptions.filter(s => s.status === "PENDING").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-500/70 text-sm">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {subscriptions.filter(s => s.status === "EXPIRED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAccountTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${accountTab === "active" ? "bg-green-500 text-white" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}
          >
            Active Users ({users.filter(u => !["DEACTIVATED","DISMISSED"].includes(u.account_status)).length})
          </button>
          <button
            onClick={() => setAccountTab("deactivated")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${accountTab === "deactivated" ? "bg-red-500 text-white" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}
          >
            Deactivated ({users.filter(u => ["DEACTIVATED","DISMISSED"].includes(u.account_status)).length})
          </button>
        </div>

        {/* Search & Filters */}
        <Card className="border-white/10 bg-white/5 mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      placeholder={
                        searchType === "phone" ? "Search by mobile number..." :
                        searchType === "email" ? "Search by email..." :
                        searchType === "name" ? "Search by name..." :
                        "Search by mobile, email, or name..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Search by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="all" className="text-white">All Fields</SelectItem>
                      <SelectItem value="phone" className="text-white">Mobile Number</SelectItem>
                      <SelectItem value="email" className="text-white">Email</SelectItem>
                      <SelectItem value="name" className="text-white">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-gold text-slate-900 hover:bg-gold/90" : "border-white/20 text-white hover:bg-white/10"}
                >
                  All Users
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                  className={statusFilter === "active" ? "bg-green-500 text-white hover:bg-green-600" : "border-white/20 text-white hover:bg-white/10"}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStatusFilter("expired")}
                  className={statusFilter === "expired" ? "bg-red-500 text-white hover:bg-red-600" : "border-white/20 text-white hover:bg-white/10"}
                >
                  Expired
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStatusFilter("lifetime")}
                  className={statusFilter === "lifetime" ? "bg-purple-500 text-white hover:bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
                >
                  Lifetime
                </Button>
              </div>

              {/* Results Count */}
              {(searchQuery || statusFilter !== "all") && (
                <div className="text-sm text-white/60">
                  Found {filteredUsers.length} user(s)
                  {searchQuery && ` matching "${searchQuery}"`}
                  {statusFilter !== "all" && ` (${statusFilter} access)`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.map((u, idx) => {
            const userSubs = getUserSubscriptions(u.user_id);
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div>
                          <CardTitle className="text-white flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-gold" />
                            {u.full_name || u.email || u.mobile || "User"}
                          </CardTitle>
                          <CardDescription className="text-white/70 flex flex-wrap gap-4">
                            {u.mobile && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {u.mobile}
                              </span>
                            )}
                            {u.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(u.registration_date).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setGrantModalUser(u)}
                          className="bg-gold text-slate-900 hover:bg-gold/90"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Grant Access
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {userSubs.length > 0 && (
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gold" />
                          Subscriptions ({userSubs.length})
                        </h4>
                        {userSubs.map((sub) => (
                          <div 
                            key={sub.id}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-white font-medium">{sub.page_name}</p>
                                <p className="text-white/60 text-sm">
                                  {sub.plan_name.replace("_", " ")} • ₹{sub.amount}
                                </p>
                              </div>
                              <Badge className={getStatusBadge(sub.status)}>
                                {sub.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-white/60 mb-3">
                              {sub.expiry_date ? (
                                <>Expires: {new Date(sub.expiry_date).toLocaleDateString()}</>
                              ) : (
                                <>Lifetime Access</>
                              )}
                            </div>
                            {sub.status === "ACTIVE" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExtendSubscription(sub.id, 30)}
                                >
                                  +30 Days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExtendSubscription(sub.id, 90)}
                                >
                                  +90 Days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRevokeSubscription(sub.id)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Revoke
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}