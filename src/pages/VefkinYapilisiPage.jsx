import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import TanzimVefki from "../components/TanzimVefki";
import AnaVefk from "../components/AnaVefk";
import { VefkSessionProvider, useVefkSession } from "../context/VefkSessionContext";
import { VefkSessionIndicator } from "../components/VefkSessionManager";
import FeatureLockedCard from "../components/FeatureLockedCard";
import { checkFeatureAccess } from "../lib/featurePermission";
import { getFeatures } from "../lib/featureRegistry";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
};

const PAGE_PATH = "/vefkin-yapilisi";
const FEATURES = getFeatures(PAGE_PATH);
const TABS = [
  { id: "ana",    label: "📜 Ana Vefk",    arabic: "الوفق الأصلي" },
  { id: "tanzim", label: "✨ Tanzim Vefki", arabic: "تنظيم الوفق" },
];

function VefkinYapilisiContent() {
  const { session, updateAnaData, updateTanzimData } = useVefkSession();
  const activeTab = session.mode;
  const [lockedFeature, setLockedFeature] = useState(null);

  const featureForTab = (tabId) => FEATURES.find(f => f.tab === tabId);

  const setActiveTab = (tab) => {
    const feat = featureForTab(tab);
    if (feat && !checkFeatureAccess(PAGE_PATH, feat.id)) {
      setLockedFeature(feat);
      return;
    }
    setLockedFeature(null);
    if (tab === 'ana') {
      updateAnaData(session.anaData);
    } else {
      updateTanzimData(session.tanzimData);
    }
  };

  return (
    <div className="space-y-4" style={{ willChange: "transform" }}>
      <VefkSessionIndicator />
      <PageTitle arabic="طريقة الوفق" latin="Vefkin Yapılışı" subtitle="Ottoman Manuscript Method" icon="📜" />
      <div className="grid grid-cols-2 gap-2">
        {TABS.map(tab => {
          const active = activeTab === tab.id && !lockedFeature;
          const feat = featureForTab(tab.id);
          const isLocked = feat && !checkFeatureAccess(PAGE_PATH, feat.id);
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: active ? 1 : 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl py-3.5 px-3 flex flex-col items-center gap-1 border transition-all relative overflow-hidden"
              style={{
                background: active
                  ? "linear-gradient(145deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.06) 100%)"
                  : "linear-gradient(145deg, rgba(4,12,34,0.99) 0%, rgba(2,8,22,0.99) 100%)",
                borderColor: active ? G.borderHi : "rgba(255,255,255,0.08)",
                boxShadow: active ? `0 0 24px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.15)` : "none",
              }}
            >
              {active && (
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)` }} />
              )}
              <span className="font-inter text-xs font-bold tracking-wide flex items-center gap-1" style={{ color: active ? G.text : "rgba(255,255,255,0.40)" }}>
                {isLocked && <Lock className="w-3 h-3 opacity-60" />}
                {tab.label}
              </span>
              <span className="font-amiri text-sm" style={{ color: active ? "rgba(212,175,55,0.75)" : "rgba(255,255,255,0.22)" }}>
                {tab.arabic}
              </span>
            </motion.button>
          );
        })}
      </div>
      {lockedFeature ? (
        <FeatureLockedCard
          pagePath={PAGE_PATH}
          featureId={lockedFeature.id}
          featureLabel={lockedFeature.label}
          onBack={() => setLockedFeature(null)}
          onUnlocked={() => { setLockedFeature(null); window.location.reload(); }}
        />
      ) : (
        <>
          <div style={{ display: activeTab === "ana" ? "block" : "none" }}>
            <AnaVefk />
          </div>
          <div style={{ display: activeTab === "tanzim" ? "block" : "none" }}>
            <TanzimVefki />
          </div>
        </>
      )}
    </div>
  );
}

export default function VefkinYapilisiPage() {
  return (
    <PageLayout>
      <VefkSessionProvider>
        <VefkinYapilisiContent />
      </VefkSessionProvider>
    </PageLayout>
  );
}