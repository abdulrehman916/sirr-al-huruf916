import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Check, X, Loader2, Users, Calendar, Gift } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const AVAILABLE_PAGES = [
  { path: "/abjad", name: "Abjad Kabir", code: "ABJAD_ACCESS" },
  { path: "/vefkin-yapilisi", name: "Vefk", code: "VEFK_ACCESS" },
  { path: "/mizaan9", name: "Mizan", code: "MIZAN_ACCESS" },
  { path: "/hadim", name: "Hadim", code: "HADIM_ACCESS" },
  { path: "/anasir", name: "Anasir", code: "ANASIR_ACCESS" },
  { path: "/magic-sqayer", name: "Magic Sqayer", code: "MAGIC_SQAYER_ACCESS" },
  { path: "/basthul-huroof-2", name: "Bast Huroof", code: "BAST_ACCESS" },
  { path: "/faal-hasrath", name: "Faal Hasrath", code: "FAAL_ACCESS" },
  { path: "/plants", name: "Plants", code: "PLANTS_ACCESS" },
  { path: "/evil-jinn", name: "Evil Jinn", code: "EVIL_JINN_ACCESS" },
  { path: "/holy-names", name: "Holy Names", code: "HOLY_NAMES_ACCESS" },
  { path: "/astro-clock", name: "Astro Clock", code: "ASTRO_CLOCK_ACCESS" },
];

const DURATION_OPTIONS = [
  { value: "30_DAYS", label: "30 Days", days: 30 },
  { value: "6_MONTHS", label: "6 Months", days: 180 },
  { value: "1_YEAR", label: "1 Year", days: 365 },
  { value: "LIFETIME", label: "Lifetime", days: null },
];

export default function GrantAccessModal({ user, onClose, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [duration, setDuration] = useState("30_DAYS");
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPages(AVAILABLE_PAGES.map(p => p.path));
    } else {
      setSelectedPages([]);
    }
  };

  const handleTogglePage = (pagePath, checked) => {
    if (checked) {
      setSelectedPages(prev => [...prev, pagePath]);
    } else {
      setSelectedPages(prev => prev.filter(p => p !== pagePath));
    }
  };

  const handleGrantAccess = async () => {
    if (selectedPages.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select at least one page",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const grants = selectedPages.map(pagePath => {
        const page = AVAILABLE_PAGES.find(p => p.path === pagePath);
        return {
          page_path: pagePath,
          page_name: page?.name || pagePath,
          plan_name: duration
        };
      });

      const response = await base44.functions.invoke("grantManualAccess", {
        user_id: user.user_id,
        user_name: user.email || user.mobile,
        user_email: user.email || '',
        user_phone: user.mobile || '',
        grants
      });

      if (response.data.success) {
        toast({
          title: "Access Granted",
          description: `Granted access to ${grants.length} page(s)`,
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.error || "Failed to grant access");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            Grant Manual Access
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Grant access to {user.email || user.mobile} without payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <Card className="border-white/10 bg-white/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">User ID</p>
                  <p className="text-white font-medium">{user.user_id}</p>
                </div>
                {user.email && (
                  <div>
                    <p className="text-white/60">Email</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                )}
                {user.mobile && (
                  <div>
                    <p className="text-white/60">Phone</p>
                    <p className="text-white font-medium">{user.mobile}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label className="text-white">Access Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {DURATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white">Select Pages</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="border-white/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <label htmlFor="select-all" className="text-sm text-white/80">
                  Select All ({AVAILABLE_PAGES.length})
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {AVAILABLE_PAGES.map(page => (
                <Card
                  key={page.path}
                  className={`border cursor-pointer transition-all ${
                    selectedPages.includes(page.path)
                      ? "border-gold bg-gold/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                  onClick={() => handleTogglePage(page.path, !selectedPages.includes(page.path))}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Checkbox
                      checked={selectedPages.includes(page.path)}
                      onCheckedChange={(checked) => handleTogglePage(page.path, checked)}
                      className="border-white/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{page.name}</p>
                      <p className="text-white/50 text-xs">{page.path}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-white/80">
              {selectedPages.length} page(s) • {DURATION_OPTIONS.find(d => d.value === duration)?.label}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGrantAccess}
            disabled={loading || selectedPages.length === 0}
            className="bg-gold text-slate-900 hover:bg-gold/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Grant Access ({selectedPages.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}