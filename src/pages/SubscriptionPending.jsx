import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, ArrowLeft } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

export default function SubscriptionPending() {
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Subscription Pending Approval
          </h1>
          <p className="text-white/70 mb-8">
            Your subscription request has been submitted successfully. Our admin team will verify your payment and activate your access within 24 hours.
          </p>
        </motion.div>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">What's Next?</CardTitle>
            <CardDescription className="text-white/70">
              Your subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-white font-medium">Payment Proof Submitted</p>
                <p className="text-white/60 text-sm">Waiting for admin verification</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Admin Verification</p>
                <p className="text-white/60 text-sm">Will be completed within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Access Activated</p>
                <p className="text-white/60 text-sm">You'll receive confirmation email</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/" className="w-full">
              <Button className="w-full h-12" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}