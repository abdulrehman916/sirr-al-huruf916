import { memo, useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Menu, X, User, Shield } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";
import { useTranslation } from "@/i18n/useTranslation";
import AtmosphericBackground from "./AtmosphericBackground";
import AccountModal from "./AccountModal";
import RedeemCodeButton from "./RedeemCodeButton";
import { useAuth } from "@/lib/AuthContext";
import { isAdminRole, isNavTabVisible, getAdminHomePath } from "@/lib/rbac";

const TAB_KEYS = [
  { id: "home", arabicTitle: "الرئيسية", englishSubtitle: "HOME", path: "/" },
  { id: "abjad-kabir", arabicTitle: "الأبجد", englishSubtitle: "ABJAD", path: "/abjad" },
  { id: "anasir", arabicTitle: "العناصر", englishSubtitle: "ANASIR", path: "/anasir" },
  { id: "hadim", arabicTitle: "الخادم", englishSubtitle: "HADIM", path: "/hadim" },
  { id: "mizaan9", arabicTitle: "الميزان", englishSubtitle: "MIZAN", path: "/mizaan9" },
  { id: "magic-sqayer", arabicTitle: "السقاير", englishSubtitle: "SQAYER", path: "/magic-sqayer" },
  { id: "vefkin-yapilisi", arabicTitle: "وفقین", englishSubtitle: "VEFK", path: "/vefkin-yapilisi" },
  { id: "basthul-huroof-2", arabicTitle: "بسط الحروف", englishSubtitle: "BAST", path: "/basthul-huroof-2" },
  { id: "faal-hasrath", arabicTitle: "فال الحسرات", englishSubtitle: "FAAL", path: "/faal-hasrath" },
  { id: "plants", arabicTitle: "النباتات", englishSubtitle: "PLANTS", path: "/plants" },
  { id: "evil-jinn", arabicTitle: "الجن", englishSubtitle: "JINN", path: "/evil-jinn" },
  { id: "holy-names", arabicTitle: "الأسماء", englishSubtitle: "NAMES", path: "/holy-names" },
  { id: "sirr", arabicTitle: "السر", englishSubtitle: "SIRR", path: "/sirr" },
  { id: "astro-clock", arabicTitle: "الساعة", englishSubtitle: "ASTRO", path: "/astro-clock" },
  { id: "shop", arabicTitle: "المتجر", englishSubtitle: "SHOP", path: "/shop" },
  { id: "books", arabicTitle: "الكتب", englishSubtitle: "BOOKS", path: "/books" },
  { id: "admin-shop", arabicTitle: "إدارة المتجر", englishSubtitle: "SHOP ADMIN", path: "/admin/shop" },
  { id: "support", arabicTitle: "الدعم", englishSubtitle: "SUPPORT", path: "/support" },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const CHILD_PAGES = ["/plants/"];

const NavTab = memo(function NavTab({ tab, isActive, onClick }) {
  return (
    <Link
      to={tab.path}
      onClick={onClick}
      className="relative flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200"
      style={{
        minWidth: 62,
        border: isActive ? "1px solid rgba(212,175,55,0.52)" : "1px solid transparent",
        background: isActive
          ? "linear-gradient(145deg, rgba(212,175,55,0.18), rgba(212,175,55,0.055))"
          : "transparent",
        boxShadow: isActive ? "0 0 20px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,232,150,0.12)" : "none",
      }}
    >
      <span
        className="font-amiri font-bold text-[14px] leading-tight"
        style={{ color: isActive ? "#F0D56A" : "rgba(255,255,255,0.62)" }}
      >
        {tab.arabicTitle}
      </span>
      <span
        className="font-inter font-semibold text-[8px] tracking-[0.16em] mt-0.5"
        style={{ color: isActive ? "rgba(240,213,106,0.70)" : "rgba(255,255,255,0.28)" }}
      >
        {tab.englishSubtitle}
      </span>
      {isActive && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: 24, height: 1.5, background: "#E8C84A", boxShadow: "0 0 8px rgba(232,200,74,0.65)" }}
        />
      )}
    </Link>
  );
});

export default function PageLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { startNav, goBack } = useNavigation();
  const { t } = useTranslation();
  const { user, role, adminProfile, isAuthenticated } = useAuth();

  const [showAccount, setShowAccount] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  const isChildPage = CHILD_PAGES.some((p) => location.pathname.startsWith(p));
  const visibleTabs = useMemo(
    () => TAB_KEYS.filter((tab) => isNavTabVisible(tab.id, role, adminProfile)),
    [role, adminProfile]
  );

  const activeId = useMemo(
    () => TAB_KEYS.find((tab) => tab.path === location.pathname)?.id,
    [location.pathname]
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleFocusIn = (e) => {
      const el = e.target;
      if (!el || !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 320);
    };

    container.addEventListener("focusin", handleFocusIn, { passive: true });
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, []);

  useEffect(() => {
    const onPop = () => startNav();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [startNav]);

  const navigateFromMenu = (path) => {
    startNav();
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <div
        className="font-inter relative flex flex-col"
        style={{
          background: "linear-gradient(180deg, #020710 0%, #050d1a 35%, #08101f 70%, #0b1326 100%)",
          minHeight: "100dvh",
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <AtmosphericBackground />

        <header
          className="sticky top-0 z-50 w-full flex-shrink-0"
          style={{
            background: "linear-gradient(180deg, rgba(2,7,18,0.98), rgba(3,9,22,0.94))",
            borderBottom: "1px solid rgba(212,175,55,0.14)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.42)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent 3%, rgba(212,175,55,0.34) 30%, rgba(242,214,105,0.72) 50%, rgba(212,175,55,0.34) 70%, transparent 97%)",
            }}
          />

          <div className="max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-7">
            <div className="h-[66px] flex items-center justify-between gap-3">
              <Link to="/" onClick={startNav} className="flex items-center gap-3 min-w-0">
                <div
                  className="relative flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    border: "1px solid rgba(212,175,55,0.52)",
                    background: "radial-gradient(circle, rgba(212,175,55,0.14), rgba(212,175,55,0.025) 68%)",
                    boxShadow: "0 0 22px rgba(212,175,55,0.12)",
                  }}
                >
                  <span className="font-amiri text-[19px] font-bold" style={{ color: "#F0D56A" }}>سر</span>
                </div>
                <div className="min-w-0">
                  <div className="font-amiri font-bold text-[19px] sm:text-[21px] leading-none" style={{ color: "#F4E8C5" }}>
                    سرّ الحروف
                  </div>
                  <div className="font-inter text-[7px] sm:text-[8px] font-semibold tracking-[0.24em] mt-1" style={{ color: "rgba(212,175,55,0.62)" }}>
                    SIRR AL-HURUF
                  </div>
                </div>
              </Link>

              <div className="hidden xl:flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 justify-center px-3">
                {visibleTabs.map((tab) => (
                  <NavTab key={tab.id} tab={tab} isActive={activeId === tab.id} onClick={startNav} />
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isAuthenticated && isAdminRole(role) && (
                  <Link
                    to={getAdminHomePath(role)}
                    onClick={startNav}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      color: "#E8C84A",
                      border: "1px solid rgba(212,175,55,0.28)",
                      background: "rgba(212,175,55,0.07)",
                    }}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold tracking-wide">{role === "owner" ? "OWNER" : "ADMIN"}</span>
                  </Link>
                )}

                {!isAuthenticated && (
                  <Link
                    to={`/login?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`}
                    onClick={startNav}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      color: "#E8C84A",
                      border: "1px solid rgba(212,175,55,0.30)",
                      background: "rgba(212,175,55,0.07)",
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}

                {isAuthenticated && (
                  <button
                    onClick={() => setShowAccount(true)}
                    aria-label="Account"
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 38,
                      height: 38,
                      color: "#E8C84A",
                      border: "1px solid rgba(212,175,55,0.30)",
                      background: "rgba(212,175,55,0.07)",
                    }}
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                  className="xl:hidden flex items-center justify-center rounded-xl"
                  style={{
                    width: 40,
                    height: 40,
                    color: "#F0D56A",
                    border: "1px solid rgba(212,175,55,0.28)",
                    background: "rgba(212,175,55,0.06)",
                  }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="xl:hidden overflow-hidden"
                style={{ borderTop: "1px solid rgba(212,175,55,0.10)" }}
              >
                <div className="max-w-[1500px] mx-auto px-3 sm:px-5 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[65vh] overflow-y-auto pr-1">
                    {visibleTabs.map((tab) => {
                      const active = activeId === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => navigateFromMenu(tab.path)}
                          className="relative text-left rounded-xl px-3 py-3"
                          style={{
                            border: active ? "1px solid rgba(212,175,55,0.48)" : "1px solid rgba(255,255,255,0.07)",
                            background: active ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.025)",
                          }}
                        >
                          <div className="font-amiri font-bold text-[16px]" style={{ color: active ? "#F0D56A" : "rgba(255,255,255,0.72)" }}>
                            {tab.arabicTitle}
                          </div>
                          <div className="text-[8px] font-semibold tracking-[0.15em] mt-1" style={{ color: active ? "rgba(240,213,106,0.65)" : "rgba(255,255,255,0.30)" }}>
                            {tab.englishSubtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAuthenticated && isAdminRole(role) && (
                    <button
                      onClick={() => navigateFromMenu(getAdminHomePath(role))}
                      className="sm:hidden mt-2 w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl"
                      style={{
                        color: "#E8C84A",
                        border: "1px solid rgba(212,175,55,0.28)",
                        background: "rgba(212,175,55,0.08)",
                      }}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-bold">{role === "owner" ? "OWNER PANEL" : "ADMIN PANEL"}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {isChildPage && (
          <div className="relative z-20 px-3 sm:px-5 pt-3 max-w-[1500px] w-full mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                color: "#D4AF37",
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.17)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-semibold">{t("btn_back", "Back")}</span>
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          data-scroll-container="true"
          className="flex-1"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehaviorX: "none",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100vw",
            position: "relative",
            flex: "1 1 0",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="relative z-10 w-full"
              style={{ minHeight: 0 }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      {isAuthenticated && !isAdminRole(role) && !location.pathname.startsWith("/admin/") && <RedeemCodeButton />}
      <AnimatePresence>
        {showAccount && <AccountModal user={user} onClose={() => setShowAccount(false)} />}
      </AnimatePresence>
    </>
  );
}
