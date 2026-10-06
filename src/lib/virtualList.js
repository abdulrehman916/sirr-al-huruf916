/**
 * Lightweight virtual list renderer — renders only visible items.
 * Use for lists with 100+ items to keep DOM size small.
 *
 * Usage:
 *   <VirtualList items={data} rowHeight={64} overscan={3}>
 *     {(item, index) => <YourRow key={item.id} item={item} />}
 *   </VirtualList>
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export default function VirtualList({
  items = [],
  rowHeight = 64,
  overscan = 3,
  className = '',
  children,
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const totalHeight = items.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
      style={{ contain: 'strict', willChange: 'scroll-position' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {visibleItems.map((item, i) => children(item, startIndex + i))}
        </div>
      </div>
    </div>
  );
}