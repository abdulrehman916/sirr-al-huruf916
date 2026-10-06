import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from "lucide-react";

const G = {
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)", borderHi: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
};

/**
 * Premium image gallery with:
 * - Swipe navigation
 * - Pinch zoom (multi-touch)
 * - Double-tap zoom
 * - Full-screen gallery modal
 * - Thumbnail strip
 * - Image counter (1/N)
 * - Smooth cross-fade transitions
 */
export default function PremiumGallery({ images = [], productName = "", initialIndex = 0 }) {
  const safeInitial = images.length > 0 ? Math.min(initialIndex, images.length - 1) : 0;
  const [activeIdx, setActiveIdx] = useState(safeInitial);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);
  const [pinchScale, setPinchScale] = useState(1);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const lastTap = useRef(0);
  const pinchStartDist = useRef(null);
  const pinchStartScale = useRef(1);
  const isPinching = useRef(false);

  const nextImage = useCallback(() => {
    setZoomed(false);
    setPinchScale(1);
    setActiveIdx(i => (i + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setZoomed(false);
    setPinchScale(1);
    setActiveIdx(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const getPinchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      pinchStartDist.current = getPinchDistance(e.touches);
      pinchStartScale.current = pinchScale;
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (isPinching.current && e.touches.length === 2) {
      e.preventDefault();
      const dist = getPinchDistance(e.touches);
      if (pinchStartDist.current > 0) {
        const scale = Math.max(1, Math.min(4, pinchStartScale.current * (dist / pinchStartDist.current)));
        setPinchScale(scale);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (isPinching.current) {
      isPinching.current = false;
      if (pinchScale <= 1.2) setPinchScale(1);
      return;
    }
    if (touchStartX.current === null || !images.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Double-tap detection
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZoomed(z => !z);
        if (!zoomed) setZoomPos({ x: 50, y: 50 });
      }
      lastTap.current = now;
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    // Swipe (only when not zoomed)
    if (!zoomed && pinchScale === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prevImage();
      else nextImage();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (images.length === 0) return null;

  const currentScale = zoomed ? 2.5 : pinchScale;
  const showDots = images.length > 1 && images.length <= 7;

  return (
    <div className="space-y-2.5">
      {/* Main gallery */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 select-none"
        style={{
          border: `1px solid ${G.border}`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.50)",
          touchAction: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <img
              src={images[activeIdx]}
              alt={`${productName} — Image ${activeIdx + 1}`}
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: pinchScale === 1 && !zoomed ? "transform 0.2s ease-out" : "none",
                cursor: zoomed ? "zoom-out" : "zoom-in",
              }}
              onClick={() => { if (!zoomed) setZoomed(true); else setZoomed(false); }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => { setZoomed(false); setPinchScale(1); }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Image counter */}
        {images.length > 1 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg font-inter text-[10px] font-bold"
            style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)", border: `1px solid ${G.faint}`, color: G.text }}
          >
            {activeIdx + 1} / {images.length}
          </div>
        )}

        {/* Zoom hint */}
        {!zoomed && pinchScale === 1 && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg flex items-center gap-1"
            style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)", border: `1px solid ${G.faint}` }}
          >
            <ZoomIn className="w-3 h-3" style={{ color: G.text }} />
            <span className="font-inter text-[9px] font-semibold" style={{ color: G.text }}>Pinch · Double-tap</span>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-3 right-3 p-2 rounded-lg"
          style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)", border: `1px solid ${G.faint}` }}
        >
          <Maximize2 className="w-3.5 h-3.5" style={{ color: G.text }} />
        </button>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-transform hover:scale-110"
              style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)" }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: "rgba(255,255,255,0.80)" }} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-transform hover:scale-110"
              style={{ background: "rgba(2,7,16,0.80)", backdropFilter: "blur(8px)" }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.80)" }} />
            </button>
          </>
        )}

        {/* Progress dots */}
        {showDots && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === activeIdx ? 18 : 6,
                  height: 6,
                  background: idx === activeIdx ? G.text : "rgba(255,255,255,0.30)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
              style={{
                border: idx === activeIdx ? `2px solid ${G.borderHi}` : `1px solid ${G.faint}`,
                opacity: idx === activeIdx ? 1 : 0.5,
                transform: idx === activeIdx ? "scale(1.05)" : "scale(1)",
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen gallery modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
              className="absolute top-4 right-4 p-3 rounded-full z-10"
              style={{ background: "rgba(255,255,255,0.10)" }}
            >
              <X className="w-5 h-5" style={{ color: "#fff" }} />
            </button>

            <div
              className="absolute top-4 left-4 px-3 py-1.5 rounded-lg font-inter text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.10)", color: "#fff" }}
            >
              {activeIdx + 1} / {images.length}
            </div>

            <motion.img
              key={activeIdx}
              src={images[activeIdx]}
              alt={`${productName} — Image ${activeIdx + 1}`}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: "#fff" }} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
                  style={{ background: "rgba(255,255,255,0.10)" }}
                >
                  <ChevronRight className="w-6 h-6" style={{ color: "#fff" }} />
                </button>

                {/* Thumbnails in fullscreen */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                      className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all"
                      style={{
                        border: idx === activeIdx ? `2px solid ${G.text}` : `1px solid rgba(255,255,255,0.20)`,
                        opacity: idx === activeIdx ? 1 : 0.5,
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}