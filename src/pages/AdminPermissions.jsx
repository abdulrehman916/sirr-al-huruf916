import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Users, Shield, Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, Edit, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ROUTE_PERMISSION_MAP } from "@/lib/permissionCodes";
import { getAdminVisiblePages } from "@/lib/pageRegistry";

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

const DURATION_OPTIONS = [
  { value: "1", label: "1 Day", days: 1 },
  { value: "3", label: "3 Days", days: 3 },
  { value: "7", label: "7 Days", days: 7 },
  { value: "15", label: "15 Days", days: 15 },
  { value: "30", label: "30 Days", days: 30 },
  { value: "90", label: "3 Months", days: 90 },
  { value: "180", label: "6 Months", days: 180 },
  { value: "365", label: "1 Year", days: 365 },
  { value: "permanent", label: "Permanent", days: 36500 } // ~100 years
];

const PAGE_OPTIONS = Object.entries(ROUTE_PERMISSION_MAP)
  .filter(([_, config]) => config.requiresPermission)
  .map(([path, config]) => ({
    path,
    name: config.name,
    code: config.code
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function AdminPermissions() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [grantForm, setGrantForm] = useState({
    user_id: "",
    page_path: "",
    duration: "7"
  });
  const [extendForm, setExtendForm] = useState({
    duration: "7"
  });
  const [processing, setProcessing] = useState(false);
  const [visibilityProcessing, setVisibilityProcessing] = useState(false);
  const [loadingVisibility, setLoadingVisibility] = useState(true);
  const [pageVisibility, setPageVisibility] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPageVisibility();
    }
  }, [isAdmin]);

  const loadPageVisibility = async () => {
    setLoadingVisibility(true);
    try {
      const visiblePaths = new Set(getAdminVisiblePages().map(p => p.path));
      const configs = await base44.entities.PageVisibilityConfig.list(null, 500);
      const visibilityList = Object.entries(ROUTE_PERMISSION_MAP)
        .filter(([path]) => visiblePaths.has(path))
        .map(([path, config]) => {
          const dbConfig = configs.find(c => c.page_path === path);
          return {
            path,
            name: config.name,
            requiresPermission: dbConfig !== undefined ? dbConfig.requires_permission : config.requiresPermission,
            adminOnly: config.adminOnly || false
          };
        });
      setPageVisibility(visibilityList);
    } catch (error) {
      console.error('Error loading page visibility:', error);
    } finally {
      setLoadingVisibility(false);
    }
  };

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
        return;
      }
      setIsAdmin(true);
      await loadData();
    } catch (error) {
      setIsAdmin(false);
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
        variant: "destructive"
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allPermissions] = await Promise.all([
        base44.entities.User.list(null, 500),
        base44.entities.PagePermission.list(null, 500)
      ]);
      setUsers(allUsers);
      setPermissions(allPermissions);
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!grantForm.user_id || !grantForm.page_path || !grantForm.duration) {
      toast({
        title: "Missing Information",
        description: "Please select user, page, and duration",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const user = users.find(u => u.id === grantForm.user_id);
      const page = PAGE_OPTIONS.find(p => p.path === grantForm.page_path);
      const duration = DURATION_OPTIONS.find(d => d.value === grantForm.duration);

      const now = new Date();
      const startDate = now.toISOString();
      const expiryDate = duration.value === "permanent" 
        ? new Date(now.getTime() + (duration.days * 24 * 60 * 60 * 1000)).toISOString()
        : new Date(now.getTime() + (duration.days * 24 * 60 * 60 * 1000)).toISOString();

      await base44.functions.invoke("grantPagePermission", {
        user_id: grantForm.user_id,
        page_path: grantForm.page_path,
        page_name: page?.name,
        permission_code: page?.code,
        start_date: startDate,
        expiry_date: expiryDate
      });

      toast({
        title: "Permission Granted",
        description: `Access granted to ${user?.full_name || 'user'} for ${page?.name}`
      });

      setGrantDialogOpen(false);
      setGrantForm({ user_id: "", page_path: "", duration: "7" });
      await loadData();
    } catch (error) {
      toast({
        title: "Grant Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleExtendPermission = async () => {
    if (!selectedPermission || !extendForm.duration) {
      toast({
        title: "Missing Information",
        description: "Please select duration",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const duration = DURATION_OPTIONS.find(d => d.value === extendForm.duration);
      const currentExpiry = new Date(selectedPermission.expiry_date);
      const now = new Date();
      
      // If already expired, start from now; otherwise extend from current expiry
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate.getTime() + (duration.days * 24 * 60 * 60 * 1000));

      await base44.functions.invoke("extendPermissionExpiry", {
        permission_id: selectedPermission.permission_id,
        new_expiry_date: newExpiry.toISOString(),
        extended_by: (await base44.auth.me()).id
      });

      toast({
        title: "Permission Extended",
        description: `Expiry extended by ${duration.label}`
      });

      setExtendDialogOpen(false);
      setExtendForm({ duration: "7" });
      setSelectedPermission(null);
      await loadData();
    } catch (error) {
      toast({
        title: "Extend Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokePermission = async (permission) => {
    if (!confirm(`Revoke access for ${permission.page_name}?`)) return;

    setProcessing(true);
    try {
      await base44.functions.invoke("revokePagePermission", {
        permission_id: permission.permission_id,
        revoked_by: (await base44.auth.me()).id,
        reason: "Revoked by admin"
      });

      toast({
        title: "Permission Revoked",
        description: "Access has been revoked"
      });

      await loadData();
    } catch (error) {
      toast({
        title: "Revoke Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleVisibility = async (pagePath, newVisibility) => {
    const action = newVisibility ? 'PRIVATE' : 'PUBLIC';
    if (!confirm(`Make this page ${action}? This will ${newVisibility ? 'require permission' : 'allow public access'}.`)) return;

    setVisibilityProcessing(true);
    try {
      await base44.functions.invoke("updatePageVisibility", {
        page_path: pagePath,
        requires_permission: newVisibility
      });

      toast({
        title: "Visibility Updated",
        description: `Page is now ${action}`
      });

      await loadData();
      await loadPageVisibility();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setVisibilityProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getUserPermissions = (userId) => {
    return permissions.filter(p => p.user_id === userId && p.is_active && !p.is_revoked);
  };

  const getPermissionStatus = (permission) => {
    if (permission.is_revoked) return { label: "Revoked", color: "bg-red-500/20 text-red-400 border-red-500/50" };
    if (isExpired(permission.expiry_date)) return { label: "Expired", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" };
    return { label: "Active", color: "bg-green-500/20 text-green-400 border-green-500/50" };
  };

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  if (isAdmin === null || loading) {
    return (
      <AdminLayout title="Loading..." showBackButton={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading permissions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Permission Management" subtitle="Admin Access Control">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0" style={{ background: G.bg }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0" style={{ background: G.bg }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-1">Active Permissions</p>
                  <p className="text-2xl font-bold text-white">{permissions.filter(p => p.is_active && !p.is_revoked && !isExpired(p.expiry_date)).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0" style={{ background: G.bg }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-1">Expired</p>
                  <p className="text-2xl font-bold text-white">{permissions.filter(p => isExpired(p.expiry_date) && !p.is_revoked).length}</p>
                </div>
                <Clock className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0" style={{ background: G.bg }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-1">Revoked</p>
                  <p className="text-2xl font-bold text-white">{permissions.filter(p => p.is_revoked).length}</p>
                </div>
                <XCircle className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Visibility Manager */}
        <Card className="border-0" style={{ background: G.bg }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-inter text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: G.text }} />
                Page Visibility Manager
              </h2>
              <Badge variant="outline" className="border-gold text-gold">
                Owner Control
              </Badge>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Make pages PUBLIC (no permission needed) or PRIVATE (requires manual permission grant)
            </p>

            {loadingVisibility ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-white/60 text-sm">Loading visibility settings...</p>
              </div>
            ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pageVisibility.filter(p => !p.adminOnly).map(page => (
                <div
                  key={page.path}
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: G.border
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{page.name}</span>
                      <Badge className={`${page.requiresPermission ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'} border font-semibold text-xs`}>
                        {page.requiresPermission ? 'PRIVATE' : 'PUBLIC'}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 font-mono">{page.path}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={visibilityProcessing}
                    className={`${page.requiresPermission ? 'border-green-400 text-green-400 hover:bg-green-400/10' : 'border-red-400 text-red-400 hover:bg-red-400/10'}`}
                    onClick={() => handleToggleVisibility(page.path, !page.requiresPermission)}
                  >
                    {page.requiresPermission ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Make Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Make Private
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Grant Permission Button */}
        <div className="flex justify-end">
          <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Grant Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Grant Page Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white/80">Select User *</Label>
                  <Select 
                    value={grantForm.user_id} 
                    onValueChange={(value) => setGrantForm(prev => ({ ...prev, user_id: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white/80">Select Page *</Label>
                  <Select 
                    value={grantForm.page_path} 
                    onValueChange={(value) => setGrantForm(prev => ({ ...prev, page_path: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_OPTIONS.map(page => (
                        <SelectItem key={page.path} value={page.path}>
                          {page.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white/80">Duration *</Label>
                  <Select 
                    value={grantForm.duration} 
                    onValueChange={(value) => setGrantForm(prev => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choose duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGrantPermission}
                  disabled={processing}
                  className="w-full btn-gold"
                >
                  {processing ? "Granting..." : "Grant Access"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <h2 className="font-inter text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: G.text }} />
            Users & Permissions
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: G.dim }} />
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map(user => {
                const userPerms = getUserPermissions(user.id);
                return (
                  <Card key={user.id} className="border-0" style={{ background: G.bg }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-white">{user.full_name || "Unnamed User"}</h3>
                          <p className="text-sm text-white/60">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="border-white/20 text-white/70">
                          {userPerms.length} Permissions
                        </Badge>
                      </div>

                      {userPerms.length === 0 ? (
                        <p className="text-white/50 text-sm">No active permissions</p>
                      ) : (
                        <div className="space-y-2">
                          {userPerms.map(permission => {
                            const status = getPermissionStatus(permission);
                            return (
                              <div
                                key={permission.id}
                                className="p-3 rounded-lg border flex items-center justify-between"
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  borderColor: G.border
                                }}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white">{permission.page_name}</span>
                                    <Badge className={`${status.color} border font-semibold text-xs`}>
                                      {status.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-white/60">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Granted: {formatDate(permission.granted_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Expires: {formatDate(permission.expiry_date)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {!permission.is_revoked && !isExpired(permission.expiry_date) && (
                                    <>
                                      <Dialog open={extendDialogOpen && selectedPermission?.id === permission.id} onOpenChange={(open) => {
                                        setExtendDialogOpen(open);
                                        if (!open) setSelectedPermission(null);
                                      }}>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-gold text-gold hover:bg-gold/10"
                                            onClick={() => setSelectedPermission(permission)}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md bg-slate-900 border-slate-700">
                                          <DialogHeader>
                                            <DialogTitle className="text-white">Extend Permission</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 mt-4">
                                            <div>
                                              <p className="text-white/80 mb-2">
                                                <strong>Page:</strong> {selectedPermission?.page_name}
                                              </p>
                                              <p className="text-white/60 text-sm mb-4">
                                                <strong>Current Expiry:</strong> {formatDate(selectedPermission?.expiry_date)}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className="text-white/80">Extend By</Label>
                                              <Select 
                                                value={extendForm.duration} 
                                                onValueChange={(value) => setExtendForm(prev => ({ ...prev, duration: value }))}
                                              >
                                                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                                                  <SelectValue placeholder="Choose duration" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {DURATION_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                      {opt.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <Button
                                              onClick={handleExtendPermission}
                                              disabled={processing}
                                              className="w-full btn-gold"
                                            >
                                              {processing ? "Extending..." : "Extend Access"}
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-400 text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleRevokePermission(permission)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
}