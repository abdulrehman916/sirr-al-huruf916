import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import MysticalBackground from "../components/MysticalBackground";
import HeroSection from "../components/HeroSection";
import CardsSection from "../components/CardsSection";
import PageLayout from "../components/PageLayout";
import PullToRefresh from "../components/PullToRefresh";
import useMouseParallax from "../hooks/useMouseParallax";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mouse = useMouseParallax(1);

  const handleRefresh = () => new Promise(res => setTimeout(res, 800));

  return (
    <PageLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}>
          <MysticalBackground mouse={mouse} />
        </div>

        <div className="relative z-10" style={{
          minHeight: "100%",
          width: "100%",
        }}>
          <div style={{ width: "100%", margin: 0, padding: 0 }}>
            <HeroSection mouse={mouse} />
          </div>

          <div style={{ width: "100%", margin: 0, padding: 0 }}>
            <CardsSection />
          </div>

          <footer className="px-4 pb-28 pt-8 sm:px-6 sm:pb-20">
            <div
              className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t pt-6 text-center sm:flex-row sm:text-left"
              style={{ borderColor: "rgba(212,175,55,0.12)" }}
            >
              <div>
                <p className="font-amiri text-xl" style={{ color: "rgba(245,236,212,0.82)" }}>سرّ الحروف</p>
                <p className="mt-1 font-inter text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(148,163,184,0.48)" }}>
                  Sirr Al-Huruf Knowledge Website
                </p>
              </div>
            </div>
          </footer>
        </div>
      </PullToRefresh>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/rules-conditions")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg"
        style={{
          background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
          boxShadow: "0 4px 24px rgba(212,175,55,0.35), 0 0 48px rgba(212,175,55,0.15)",
        }}
      >
        <ScrollText className="w-5 h-5" style={{ color: "#0d1b2a" }} />
        <span className="font-inter font-bold text-sm" style={{ color: "#0d1b2a" }}>
          {t("btn_rules", "Rules")}
        </span>
      </motion.button>
    </PageLayout>
  );
}
