import React from "react";
import { motion } from "framer-motion";

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startY = React.useRef(0);
  const touchStart = React.useRef(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0 && !isRefreshing) {
      touchStart.current = true;
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStart.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 200));
    }
  };

  const handleTouchEnd = async () => {
    if (!touchStart.current || isRefreshing) return;
    
    touchStart.current = false;
    
    if (pullDistance > 100) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        minHeight: '100%',
      }}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && !isRefreshing && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translateY(${pullDistance - 80}px)`,
            opacity: Math.min(pullDistance / 100, 1),
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-amber-400/50 border-t-amber-400 rounded-full"
          />
        </div>
      )}

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none pt-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-amber-400/50 border-t-amber-400 rounded-full"
          />
        </div>
      )}

      {children}
    </div>
  );
}