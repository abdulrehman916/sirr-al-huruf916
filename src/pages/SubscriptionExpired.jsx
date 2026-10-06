import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function SubscriptionExpired() {
  const { pagePath } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [expiredSub, setExpiredSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState([]);

  const DECODED_PAGE_PATH = decodeURIComponent(pagePath || "");

  useEffect(() => {
    checkAuthAndSubscription();
  }, []);

  const checkAuthAndSubscription = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check for expired subscription
      const subs = await base44.entities.Subscription.filter({
        user_id: currentUser.id,
        page_path: DECODED_PAGE_PATH,
        status: "EXPIRED"
      });

      if (subs.length > 0) {
        setExpiredSub(subs[0]);
      }

      // Fetch pricing for renewal
      const response = await base44.functions.invoke("getPagePricing", {
        page_path: DECODED_PAGE_PATH
      });

      if (response.data.success) {
        setPricing(response.data.pricing);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = (plan) => {
    navigate(`/subscription-payment/${encodeURIComponent(DECODED_PAGE_PATH)}?plan=${plan.plan_name}`);
  };

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
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Subscription Expired
            </h1>
          </div>
          <p className="text-white/70">
            Your access to {getPageName(DECODED_PAGE_PATH)} has expired. Renew now to continue.
          </p>
        </motion.div>

        {expiredSub && (
          <Card className="border-red-500/20 bg-red-500/5 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Expired Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Previous Plan</p>
                  <p className="text-white font-medium">{expiredSub.plan_name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Expired On</p>
                  <p className="text-white font-medium">
                    {expiredSub.expiry_date ? new Date(expiredSub.expiry_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Choose Renewal Plan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricing.map((plan, idx) => (
              <motion.div
                key={plan.plan_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-white/10 bg-white/5 hover:border-gold/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {plan.plan_name.replace("_", " ")}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {plan.plan_name === "LIFETIME" ? "One-time payment" : "Recurring access"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gold mb-4">
                      {plan.price} {plan.currency}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleRenew(plan)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

function getPageName(pagePath) {
  const pageNames = {
    "/abjad": "Abjad Kabir",
    "/vefkin-yapilisi": "Vefk",
    "/mizaan9": "Mizan",
    "/hadim": "Hadim",
  };
  return pageNames[pagePath] || "Premium Page";
}