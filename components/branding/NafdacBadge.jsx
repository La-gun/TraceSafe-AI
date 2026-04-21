import React, { useMemo, useState } from "react";

const DEFAULT_SRC = "/nafdac-logo.png";

function FallbackMark({ size = 22 }) {
  const s = Number(size) || 22;
  const stroke = Math.max(1, Math.round(s * 0.06));
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth={stroke} opacity="0.9" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth={stroke} opacity="0.35" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill="#ffffff"
        style={{ letterSpacing: 1 }}
      >
        NAF
      </text>
    </svg>
  );
}

/**
 * NAFDAC trust badge for platform branding.
 *
 * Place the official logo at: `public/nafdac-logo.png` (recommended).
 * If missing, a minimal fallback mark is shown instead.
 */
export default function NafdacBadge({
  src = DEFAULT_SRC,
  size = 22,
  label = "NAFDAC",
  showLabel = true,
  className = "",
  pillClassName = "",
  title = "NAFDAC-aligned compliance",
}) {
  const [failed, setFailed] = useState(false);
  const computedAlt = useMemo(() => `${label} logo`, [label]);

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5",
        "backdrop-blur-md",
        pillClassName,
        className,
      ].join(" ")}
      title={title}
    >
      <span
        className="inline-flex items-center justify-center rounded-full bg-white/[0.04] border border-white/10 overflow-hidden"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {failed ? (
          <FallbackMark size={size} />
        ) : (
          <img
            src={src}
            alt={computedAlt}
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="w-full h-full object-contain"
          />
        )}
      </span>
      {showLabel && (
        <span className="text-[11px] font-semibold tracking-wide text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}

