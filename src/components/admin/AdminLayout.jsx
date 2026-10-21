import { useNavigation } from "@/context/NavigationContext";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Users, Globe, MessageSquare, Settings, ChevronLeft, PanelLeftOpen, PanelLeftClose, Inbox, Store, LogOut, ListChecks, KeyRound, Library } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { ADMIN_NAVIGATION } from "@/lib/adminNavigation";
import { filterAdminSections } from "@/lib/rbac";
import { platform } from "@/api/platformClient";
import { clearLocalSession } from "@/lib/sessionId";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

const NAV_ICONS = { dashboard: LayoutDashboard, users: Users, codes: KeyRound, requests: Inbox, approvals: ListChecks, pages: Globe, support: MessageSquare, shop: Store, library: Library, settings: Settings };
const SIDEBAR_SECTIONS = ADMIN_NAVIGATION.map(section => ({ ...section, items: section.items.map(item => ({ ...item, icon: NAV_ICONS[item.icon] })) }));

function SidebarContent({ location, onNavigate }) {
  const { role, adminProfile } = useAuth();
  const sections = filterAdminSections(SIDEBAR_SECTIONS, role, adminProfile);
  return (
    <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield style={{ width: 18, height: 18, color: G.text }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>{"Owner Panel"}</span>
        </div>
      </div>

      {/* Sections */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
        {sections.map((section) => (
          <div key={section.label}>
            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.40)",
              marginBottom: 6,
              paddingLeft: 8,
            }}>
              {section.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "9px 10px",
                      borderRadius: 9,
                      background: isActive ? G.bgHi : "transparent",
                      border: isActive ? `1px solid ${G.borderHi}` : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? G.text : "rgba(255,255,255,0.45)" }} />
                    <span style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.60)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div style={{
                        marginLeft: "auto",
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: G.text,
                        flexShrink: 0,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Sidebar footer: Back to Website, then Log Out pinned to bottom ── */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${G.border}` }}>
        <Link
          to="/"
          onClick={onNavigate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14, color: "rgba(255,255,255,0.35)" }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.40)" }}>
            Back to Website
          </span>
        </Link>
        <button
          onClick={async () => {
            clearLocalSession();
            try { sessionStorage.removeItem("sirr_admin_session"); } catch {}
            try { sessionStorage.removeItem("sirr_google_prompt_dismissed"); } catch {}
            if (onNavigate) onNavigate();
            await platform.auth.logout();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            marginTop: 10,
            padding: "10px 10px",
            borderRadius: 8,
            background: "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.10) 100%)",
            border: "1px solid rgba(239,68,68,0.45)",
            color: "#fca5a5",
            cursor: "pointer",
            boxShadow: "0 0 12px rgba(239,68,68,0.10)",
          }}
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title = "", subtitle = "", showBackButton = false, backPath = null }) {
  const location = useLocation();
  const { goBack } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();

  const closeSidebar = () => setSidebarOpen(false);

  // Derive current page label from sidebar sections for the top bar
  const currentPageLabel = useMemo(() => {
    for (const section of SIDEBAR_SECTIONS) {
      for (const item of section.items) {
        if (location.pathname === item.path) return item.label;
      }
    }
    return title || ("Owner");
  }, [location.pathname, title, role]);

  return (
    <div style={{
      display: "flex",
      width: "100%",
      height: "100dvh",
      background: "linear-gradient(180deg, #020710 0%, #060c1c 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 998,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          background: "linear-gradient(180deg, rgba(5,10,28,0.99) 0%, rgba(2,5,16,1) 100%)",
          borderRight: `1px solid ${G.border}`,
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <SidebarContent location={location} onNavigate={closeSidebar} />
      </aside>

      {/* ── Main content column ── */}
      <div
        className="admin-main-content"
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* ── Top bar — contains toggle + breadcrumb, never overlaps content ── */}
        <div
          className="admin-topbar"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
            height: 52,
            minHeight: 52,
            background: "rgba(2,7,16,0.95)",
            borderBottom: `1px solid ${G.border}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Sidebar toggle button — always in flow, never fixed */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="admin-sidebar-toggle"
            aria-label="Toggle sidebar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              background: sidebarOpen
                ? "rgba(212,175,55,0.18)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${sidebarOpen ? G.borderHi : "rgba(255,255,255,0.08)"}`,
              color: sidebarOpen ? G.text : "rgba(255,255,255,0.50)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.2s ease",
              padding: 0,
            }}
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {sidebarOpen
                ? <PanelLeftClose style={{ width: 16, height: 16 }} />
                : <PanelLeftOpen style={{ width: 16, height: 16 }} />
              }
            </motion.div>
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          {/* Back button when showBackButton */}
          {showBackButton && (
            <button
              onClick={() => goBack(backPath)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 7,
                background: G.bg, border: `1px solid ${G.border}`,
                color: G.text, cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "Inter, sans-serif", flexShrink: 0,
              }}
            >
              <ChevronLeft style={{ width: 13, height: 13 }} />
              Back
            </button>
          )}

          {/* Breadcrumb / Page title */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <Shield style={{ width: 13, height: 13, color: G.dim, flexShrink: 0 }} />
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.30)",
              flexShrink: 0,
            }}>
              {"Owner"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, flexShrink: 0 }}>/</span>
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.80)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {currentPageLabel}
            </span>
          </div>

          {/* Subtitle if provided */}
          {subtitle && (
            <>
              <span style={{ color: "rgba(255,255,255,0.10)", fontSize: 11, flexShrink: 0 }}>—</span>
              <span style={{
                fontFamily: "var(--font-amiri)",
                fontSize: 12,
                color: G.dim,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {subtitle}
              </span>
            </>
          )}

        </div>

        {/* ── Scrollable content area ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.14 }}
              style={{ padding: "24px" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Responsive CSS */}
      <style>{`
        .admin-sidebar {
          width: 210px;
          min-width: 210px;
          height: 100%;
          position: sticky;
          top: 0;
          align-self: flex-start;
          z-index: 50;
        }

        /* Desktop: toggle hidden (sidebar always visible) */
        .admin-sidebar-toggle { display: flex; }

        /* On desktop, sidebar is always visible — toggle hides it */

        @media (max-width: 767px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 270px !important; min-width: 270px !important;
            height: 100dvh !important;
            z-index: 999 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-main-content {
            width: 100% !important;
          }
          .admin-topbar {
            padding: 0 16px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 210px !important; min-width: 210px !important;
            height: 100dvh !important;
            z-index: 100 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-main-content {
            width: 100% !important;
          }
        }

        @media (min-width: 1025px) {
          .admin-sidebar {
            transform: translateX(0) !important;
            transition: none !important;
          }
        }

        /* Toggle button hover */
        .admin-sidebar-toggle:hover {
          background: rgba(212,175,55,0.14) !important;
          border-color: ${G.borderHi} !important;
          color: ${G.text} !important;
        }
      `}</style>
    </div>
  );
}
