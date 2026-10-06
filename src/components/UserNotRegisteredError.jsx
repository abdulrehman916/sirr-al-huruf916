import React from "react";
import { motion } from "framer-motion";

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, #020710 0%, #050d1a 100%)",
      }}>
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl"
          style={{
            background: "rgba(212,175,55,0.15)",
            border: "2px solid rgba(212,175,55,0.40)",
          }}>
          🔐
        </div>
        <h2 className="font-amiri text-2xl font-bold text-white mb-3">Account Not Found</h2>
        <p className="font-inter text-sm text-white/60 mb-6">
          Your account is not registered in the system. Please contact the administrator to create an account for you.
        </p>
        <div className="text-xs text-white/40 font-inter">
          Error Code: USER_NOT_REGISTERED
        </div>
      </div>
    </div>
  );
}