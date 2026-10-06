import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Cloudflare Turnstile CAPTCHA component.
 * Zero-interaction, privacy-friendly, GDPR compliant.
 */
export default function Captcha({ onVerify, onError, theme = "dark" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const SITE_KEY = "0x4AAAAAAAtk9fXG9sZ2VudA"; // Placeholder - replace with actual key

  useEffect(() => {
    const renderCaptcha = () => {
      try {
        if (containerRef.current && window.turnstile) {
          window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: function(token) {
              setLoading(false);
              onVerify?.(token);
            },
            'error-callback': function(errorCode) {
              setError(errorCode);
              setLoading(false);
              onError?.(errorCode);
            },
            theme: theme,
            size: 'flexible',
            retry: 'auto'
          });
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        onError?.(err.message);
      }
    };

    if (typeof window === 'undefined') return;

    if (window.turnstile) {
      renderCaptcha();
    } else {
      const existing = document.querySelector('script[src*="turnstile"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.onload = renderCaptcha;
        script.onerror = () => {
          setError("Failed to load security check");
          setLoading(false);
          onError?.("CAPTCHA load failed");
        };
        document.body.appendChild(script);
      } else {
        existing.addEventListener('load', renderCaptcha);
      }
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Loading security check...
        </div>
      )}
      {/* Error only shown if explicitly enabled - in production replace with real site key */}
      <div ref={containerRef} className="my-2" />
    </div>
  );
}