/**
 * MasterPdfLibrary — OWNER-ONLY Master PDF Library.
 *
 * ARCHITECTURE LAW: This page is the single source of truth for all
 * project knowledge. It lives ONLY in the Owner Panel (Knowledge
 * Management). It is NEVER visible to Admins, Moderators, Editors,
 * Users, Guests, or any future non-Owner role.
 *
 * Gating (defense in depth):
 *   1. rbac ROUTE_ACCESS — route is roles:[OWNER] only (admins never see it).
 *   2. AdminLayout sidebar — section shown only to Owner.
 *   3. This page — client role check (defensive).
 *   4. Backend functions — enforce Owner server-side (403 otherwise).
 *   5. Entity RLS — MasterPdfBook/MasterPdfPage/SirrAuditLog admin-only.
 *
 * No public page exposes uploaded PDFs or cloud storage. Only extracted,
 * verified, Owner-approved knowledge may be published into the app.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Library, Upload, Cloud, BookOpen, FileSearch, ScrollText, ShieldAlert } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/AuthContext";
import MplOverview from "@/components/masterpdflibrary/MplOverview";
import MplUpload from "@/components/masterpdflibrary/MplUpload";
import MplCloudSearch from "@/components/masterpdflibrary/MplCloudSearch";
import MplLibrary from "@/components/masterpdflibrary/MplLibrary";
import MplPages from "@/components/masterpdflibrary/MplPages";
import MplAuditLog from "@/components/masterpdflibrary/MplAuditLog";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

const TABS = [
  { id: "overview", label: "Overview", icon: Library },
  { id: "upload", label: "Upload & Connections", icon: Upload },
  { id: "cloud", label: "Cloud Search", icon: Cloud },
  { id: "library", label: "Library & Queue", icon: BookOpen },
  { id: "pages", label: "Full-Text Search", icon: FileSearch },
  { id: "audit", label: "Audit Log", icon: ScrollText },
];

export default function MasterPdfLibrary() {
  const { role } = useAuth();
  const [tab, setTab] = useState("overview");

  if (role !== "owner") {
    return (
      <AdminLayout title="Master PDF Library">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <ShieldAlert style={{ width: 48, height: 48, color: "#fca5a5" }} />
          <h2 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 18, margin: 0 }}>Owner Access Required</h2>
          <p style={{ fontFamily: "Inter, sans-serif", color: "rgba(255,255,255,0.50)", fontSize: 13, margin: 0, textAlign: "center", maxWidth: 420 }}>
            The Master PDF Library is the private research workspace of the project Owner. It is not visible to any other role.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Master PDF Library" subtitle="Owner Knowledge Management">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>
          Master PDF Library
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", color: G.dim, fontSize: 11, margin: 0, letterSpacing: "0.04em" }}>
          Single source of truth · Owner-only · Append-only · Server-side indexing
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18, padding: 6, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 7, cursor: "pointer",
                background: active ? G.bgHi : "transparent",
                border: active ? `1px solid ${G.borderHi}` : "1px solid transparent",
                color: active ? G.text : "rgba(255,255,255,0.55)",
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: active ? 700 : 500,
                transition: "all 0.15s ease",
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {tab === "overview" && <MplOverview />}
        {tab === "upload" && <MplUpload />}
        {tab === "cloud" && <MplCloudSearch />}
        {tab === "library" && <MplLibrary />}
        {tab === "pages" && <MplPages />}
        {tab === "audit" && <MplAuditLog />}
      </motion.div>
    </AdminLayout>
  );
}