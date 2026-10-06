import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import GoogleLinkingPanel from "@/components/admin/GoogleLinkingPanel";
import { useAuth } from "@/lib/AuthContext";
import { ROLES } from "@/lib/rbac";

export default function AdminGoogleLinked() {
  const { role, adminProfileLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted && adminProfileLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (role !== ROLES.OWNER && role !== ROLES.ADMIN) return <Navigate to="/" replace />;

  return (
    <AdminLayout title="Google Linked Customers" subtitle="ربط حسابات جوجل" showBackButton={true}>
      <div className="max-w-6xl mx-auto">
        <GoogleLinkingPanel role={role} />
      </div>
    </AdminLayout>
  );
}