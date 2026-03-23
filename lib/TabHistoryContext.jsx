import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * TabHistoryContext
 *
 * Tracks a per-tab navigation stack so the TopBar back button knows
 * whether to go back within a tab or return to the tab root.
 *
 * Google Play / TWA compliance:
 *  - Bottom-nav switches use `replace: true` so they don't push browser history.
 *  - stackDepth === 1 at a root tab means the TWA back-press will naturally
 *    exit the app (browser back on the entry point closes the activity).
 */

const TAB_ROOTS = ["/Home", "/Dashboard", "/Enforcement", "/InspectorPortal", "/Contact", "/Settings", "/Solutions"];

function getTabRoot(pathname) {
  if (pathname.startsWith("/touchpoints/")) return "/Home";
  return TAB_ROOTS.find((r) => pathname.startsWith(r)) ?? "/Home";
}

const STORAGE_KEY = "tg_tab_stacks";

function loadStacks() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveStacks(stacks) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stacks)); }
  catch { /* quota exceeded — ignore */ }
}

const TabHistoryContext = createContext({ stackDepth: 1, tabRoot: "/Home", stack: [] });

export function TabHistoryProvider({ children }) {
  const { pathname } = useLocation();
  const stacksRef = useRef(loadStacks());
  // Force re-render when pathname changes so consumers get fresh values
  const [, rerender] = useState(0);

  useEffect(() => {
    const root = getTabRoot(pathname);
    const stacks = stacksRef.current;

    if (!stacks[root]) {
      stacks[root] = [pathname];
    } else {
      const stack = stacks[root];
      const existingIdx = stack.lastIndexOf(pathname);
      if (existingIdx !== -1) {
        // Navigating back — pop to that position
        stacks[root] = stack.slice(0, existingIdx + 1);
      } else {
        // New path within tab — push
        stacks[root] = [...stack, pathname];
      }
    }

    stacksRef.current = { ...stacks };
    saveStacks(stacksRef.current);
    rerender((n) => n + 1);
  }, [pathname]);

  const tabRoot = getTabRoot(pathname);
  const stack = stacksRef.current[tabRoot] ?? [pathname];
  const stackDepth = stack.length; // 1 = at root (TWA back-press exits), >1 = in-tab back

  return (
    <TabHistoryContext.Provider value={{ stackDepth, tabRoot, stack }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  return useContext(TabHistoryContext);
}