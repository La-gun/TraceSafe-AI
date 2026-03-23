import { useEffect, useRef, useState, useCallback } from "react";

/**
 * usePullToRefresh
 *
 * Attaches a native-feel pull-to-refresh gesture to a scrollable container.
 *
 * Usage:
 *   const { containerRef, isRefreshing, PullIndicator } = usePullToRefresh(refetchFn);
 *   <div ref={containerRef} className="overflow-y-auto h-full">
 *     <PullIndicator />
 *     ...content...
 *   </div>
 *
 * @param {() => Promise<any>} onRefresh  async function to call on release
 * @param {object}             options
 * @param {number}             options.threshold   px dragged before triggering (default 72)
 */
export default function usePullToRefresh(onRefresh, { threshold = 72 } = {}) {
  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const doRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [isRefreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e) => {
      if (!pulling.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy < 0) { pulling.current = false; return; }
      const dist = Math.min(dy * 0.45, threshold * 1.5);
      setPullDistance(dist);
      if (dy > 8) e.preventDefault();
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDistance >= threshold) {
        doRefresh();
      } else {
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [pullDistance, threshold, doRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const triggered = pullDistance >= threshold;

  const PullIndicator = () => {
    if (pullDistance === 0 && !isRefreshing) return null;
    return (
      <div
        aria-live="polite"
        aria-label={isRefreshing ? "Refreshing content" : triggered ? "Release to refresh" : "Pull to refresh"}
        className="flex items-center justify-center pointer-events-none"
        style={{ height: isRefreshing ? 48 : pullDistance, overflow: "hidden", transition: isRefreshing ? "height 0.2s ease" : "none" }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
            isRefreshing ? "border-emerald-400 animate-spin" : triggered ? "border-emerald-400" : "border-white/20"
          }`}
          style={{ transform: `rotate(${progress * 270}deg)`, transition: isRefreshing ? "none" : "transform 0.05s linear" }}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${triggered || isRefreshing ? "bg-emerald-400" : "bg-white/30"}`} />
        </div>
      </div>
    );
  };

  return { containerRef, isRefreshing, pullDistance, PullIndicator };
}