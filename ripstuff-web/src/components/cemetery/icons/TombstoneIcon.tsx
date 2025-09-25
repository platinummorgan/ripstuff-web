import React from "react";

export function TombstoneIcon({ size = 28, mode = "night", className = "" }: { size?: number; mode?: "day" | "night"; className?: string }) {
  const isNight = mode === "night";
  const body = isNight ? "#343b44" : "#4b5561";
  const stroke = isNight ? "#1f242a" : "#2a3138";
  const plinth = isNight ? "#2b3138" : "#596371";
  const highlight = isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)";
  const glow = isNight ? "0 0 10px rgba(150,200,255,0.25)" : "0 0 8px rgba(255,255,255,0.15)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      style={{ filter: glow ? `drop-shadow(${glow})` : undefined }}
    >
      <defs>
        <linearGradient id="ts_body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? "#3c454f" : "#697380"} />
          <stop offset="100%" stopColor={body} />
        </linearGradient>
        <linearGradient id="ts_base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={plinth} />
          <stop offset="100%" stopColor={isNight ? "#242a31" : "#4f5864"} />
        </linearGradient>
      </defs>
      {/* circular soft background */}
      <circle cx="50" cy="50" r="46" fill={isNight ? "#4a535c" : "#707c87"} opacity="0.15" />

      {/* plinth/base */}
      <rect x="22" y="70" width="56" height="12" rx="2" fill="url(#ts_base)" stroke={stroke} strokeWidth="2" />

      {/* tombstone body with arched top */}
      <path
        d="M34 70 V42 C34 30 42 22 50 22 C58 22 66 30 66 42 V70 Z"
        fill="url(#ts_body)"
        stroke={stroke}
        strokeWidth="2.5"
      />

      {/* subtle inner shadow */}
      <path
        d="M36 70 V43 C36 32 43 25 50 25 C57 25 64 32 64 43 V70 Z"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="3"
        opacity="0.4"
      />

      {/* epitaph lines */}
      <rect x="42" y="46" width="16" height="2.5" rx="1.2" fill={highlight} />
      <rect x="42" y="52" width="16" height="2.5" rx="1.2" fill={highlight} />
    </svg>
  );
}

export default TombstoneIcon;
