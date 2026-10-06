import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Save, RotateCcw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const PLANS = [
  { id: "1_MONTH", label: "1 Month", icon: "📅" },
  { id: "6_MONTHS", label: "6 Months", icon: "📆" },
  { id: "1_YEAR", label: "1 Year", icon: "🗓️" },
  { id: "LIFETIME", label: "Lifetime", icon: "♾️" },
];

const PREMIUM_PAGES = [
  { path: "/abjad", name: "Abjad Kabir" },
  { path: "/hadim", name: "Hadim" },
  { path: "/vefkin-yapilisi", name: "Vefk" },
  { path: "/mizaan9", name: "Mizan" },
  { path: "/magic-sqayer", name: "Magic Sqayer" },
  { path: "/basthul-huroof-2", name: "Bast Huroof" },
  { path: "/faal-hasrath", name: "Faal Hasrath" },
  { path: "/evil-jinn", name: "Evil Jinn" },
  { path: "/holy-names", name: "Holy Names" },
  { path: "/astro-clock", name: "Astro Clock" },
];

const COLORS = {
  bg: "rgba(2,6,16,0.95)",
  card: "rgba(12,22,48,0.60)",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.60)",
  border: "rgba(212,175,55,0.18)",
};

export default function AdminPricingSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState(PREMIUM_PAGES[0]);
  const [pricing, setPricing] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (!["owner", "admin"].includes(u.role)) {
        window.location.href = '/';
      }
    }).catch(() => window.location.href = '/login');
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadPricing();
    }
  }, [selectedPage]);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getPagePricing', { page_path: selectedPage.path });
      if (res.data.success) {
        const pricingMap = {};
        res.data.pricing.forEach((p) => {
          pricingMap[p.plan_name] = { price: p.price, currency: p.currency };
        });
        setPricing(pricingMap);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pricing_updates = PLANS.map((plan) => ({
        plan_name: plan.id,
        price: parseFloat(pricing[plan.id]?.price || 0),
        currency: pricing[plan.id]?.currency || 'AED',
        is_active: true,
      }));

      const res = await base44.functions.invoke('updatePagePricing', {
        page_path: selectedPage.path,
        page_name: selectedPage.name,
        pricing_updates,
      });

      if (res.data.success) {
        toast({
          title: "Pricing Updated",
          description: `${selectedPage.name} pricing saved successfully`,
        });
        loadPricing();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    loadPricing();
  };

  const updatePrice = (planId, value) => {
    setPricing((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], price: value },
    }));
  };

  const updateCurrency = (planId, value) => {
    setPricing((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], currency: value },
    }));
  };

  return (
    <AdminLayout title="Pricing Settings" subtitle="إعدادات الأسعار">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >

        {/* Page Selector */}
        <Card className="mb-6" style={{ background: COLORS.card, borderColor: COLORS.border }}>
          <CardHeader>
            <CardTitle className="text-gold font-amiri text-xl">Select Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PREMIUM_PAGES.map((page) => (
                <Button
                  key={page.path}
                  onClick={() => setSelectedPage(page)}
                  variant={selectedPage.path === page.path ? "default" : "outline"}
                  className={`font-inter text-xs py-2 ${
                    selectedPage.path === page.path
                      ? "bg-gold text-black"
                      : "border-gold-dim text-gold-dim hover:bg-gold-dim/20"
                  }`}
                  style={{
                    background: selectedPage.path === page.path ? COLORS.gold : "transparent",
                    color: selectedPage.path === page.path ? "#000" : COLORS.goldDim,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Editor */}
        <Card style={{ background: COLORS.card, borderColor: COLORS.border }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-amiri text-2xl text-gold">
                {selectedPage.name} - Pricing
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Set custom prices for each subscription plan
              </p>
            </div>
            <Badge variant="outline" style={{ borderColor: COLORS.gold, color: COLORS.gold }}>
              {selectedPage.path}
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ background: "rgba(2,6,16,0.40)", border: `1px solid ${COLORS.border}` }}
                  >
                    <div className="flex items-center gap-3 w-32">
                      <span className="text-2xl">{plan.icon}</span>
                      <div>
                        <p className="font-inter text-sm font-semibold text-white">
                          {plan.label}
                        </p>
                        <p className="font-amiri text-xs text-gold-dim">
                          {plan.id.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-dim" />
                          <Input
                            type="number"
                            value={pricing[plan.id]?.price || ''}
                            onChange={(e) => updatePrice(plan.id, e.target.value)}
                            className="pl-8 bg-transparent border-gold-dim/30 text-white"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-400 mb-1">Currency</Label>
                        <select
                          value={pricing[plan.id]?.currency || 'AED'}
                          onChange={(e) => updateCurrency(plan.id, e.target.value)}
                          className="w-full h-9 px-3 rounded-md bg-transparent border border-gold-dim/30 text-white text-sm"
                        >
                          <option value="AED">AED</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-xs text-gray-400 mb-1">Current Price</p>
                      <p className="font-inter text-lg font-bold text-gold">
                        {pricing[plan.id]?.currency || 'AED'} {pricing[plan.id]?.price || '—'}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-gold-dim text-gold-dim hover:bg-gold-dim/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-gold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Prices'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6" style={{ background: COLORS.card, borderColor: COLORS.border }}>
          <CardContent className="py-4">
            <p className="font-inter text-xs text-gray-400">
              💡 <strong>Tip:</strong> Prices are displayed to users in the subscription modal when they try to access this page. 
              Update prices anytime - changes take effect immediately.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}