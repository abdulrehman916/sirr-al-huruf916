import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clock, Loader2, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const DURATION_OPTIONS = [
  { id: "1_MONTH", name: "1 Month" },
  { id: "3_MONTHS", name: "3 Months" },
  { id: "6_MONTHS", name: "6 Months" },
  { id: "1_YEAR", name: "1 Year" },
  { id: "PERMANENT", name: "Permanent" },
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

export default function PremiumAccessRequest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(PREMIUM_PAGES[0]);
  const [selectedDuration, setSelectedDuration] = useState("1_MONTH");
  const [message, setMessage] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
    }).catch(() => navigate("/otp-login"));
  }, [navigate]);

  const handleSubmitRequest = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("submitAccessRequest", {
        name: user.full_name || "",
        phone: "",
        email: user.email || "",
        page_path: selectedPage.path,
        page_name: selectedPage.name,
        message: `Duration: ${selectedDuration}${message ? " · " + message : ""}`,
      });

      if (response.data.success) {
        toast({
          title: "Access Request Submitted",
          description: "Admin will review your request shortly",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to submit request",
          variant: "destructive",
        });
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

  if (!user) {
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
      <div className="max-w-3xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Request Page Access
          </h1>
          <p className="text-white/70">
            Submit a request for manual approval by the admin
          </p>
        </motion.div>

        {/* User Info Card */}
        <Card className="mb-6 border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-500 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              Logged in as
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Name</p>
                <p className="text-white font-medium">{user.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Email</p>
                <p className="text-white font-medium">{user.email || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page Selection */}
        <Card className="mb-6 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Select Page</CardTitle>
            <CardDescription className="text-white/70">
              Choose which page you want to access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedPage.path} 
              onValueChange={(value) => setSelectedPage(PREMIUM_PAGES.find(p => p.path === value))}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {PREMIUM_PAGES.map((page) => (
                  <SelectItem key={page.path} value={page.path} className="text-white">
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Duration Selection */}
        <Card className="mb-6 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Requested Duration</CardTitle>
            <CardDescription className="text-white/70">
              How long do you need access?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-white">
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Message */}
        <Card className="mb-6 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Message (Optional)</CardTitle>
            <CardDescription className="text-white/70">
              Add any notes or reason for your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why do you need access? Any special requirements?"
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-white/20 text-white/70 hover:bg-white/10 h-12"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 btn-gold h-12"
            onClick={handleSubmitRequest}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>

        {/* Info Box */}
        <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm">Manual Approval Required</h4>
                <p className="text-white/70 text-xs mt-1">
                  Your request will be reviewed by the admin. You'll be notified once access is granted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}