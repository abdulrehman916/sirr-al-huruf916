import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    const errorHandler = (error) => {
      console.error('[ErrorBoundary] Caught error:', error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "linear-gradient(180deg, #020710 0%, #050d1a 100%)",
        }}>
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl"
            style={{
              background: "rgba(220,38,38,0.15)",
              border: "2px solid rgba(220,38,38,0.40)",
            }}>
            ⚠️
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white mb-3">{t("error_title", "Something went wrong")}</h2>
          <p className="font-inter text-sm text-white/60 mb-6">
            {t("error_desc", "The application encountered an unexpected error. Please try refreshing the page.")}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-inter text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.30), rgba(212,175,55,0.15))",
              border: "1px solid rgba(212,175,55,0.40)",
              color: "#E8C84A",
            }}>
            {t("error_refresh", "Refresh Page")}
          </button>
        </div>
      </div>
    );
  }

  return children;
}