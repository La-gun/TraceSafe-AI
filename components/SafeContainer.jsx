import React from "react";

/**
 * SafeContainer — wraps app content with env(safe-area-inset-*) padding
 * for notch/home-indicator safe zones on iOS and Android WebView.
 */
export default function SafeContainer({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col min-h-screen ${className}`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        // bottom padding handled by BottomNavigation itself
      }}
    >
      {children}
    </div>
  );
}