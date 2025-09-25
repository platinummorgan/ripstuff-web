"use client";

import React from "react";

export function ParallaxLayers({
  view,
  worldSize,
  mode = "day",
}: {
  view: { scale: number; tx: number; ty: number };
  worldSize: number;
  mode?: "day" | "night";
}) {
  function t(f: number) {
    const a = (view.tx * (f - 1)) / Math.max(view.scale, 0.0001);
    const b = (view.ty * (f - 1)) / Math.max(view.scale, 0.0001);
    return `translate(${a}px, ${b}px)`;
  }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {mode === "day" ? (
        <>
          {/* high clouds */}
          <div
            className="absolute inset-0 opacity-18"
            style={{
              transform: t(0.9),
              backgroundImage:
                "radial-gradient(600px_300px_at_20%_10%, rgba(255,255,255,0.35), transparent 65%), radial-gradient(800px_400px_at_70%_20%, rgba(255,255,255,0.28), transparent 60%)",
              animation: "cloud-drift 30s linear infinite",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 0, 0 0",
            }}
          />
          <style jsx>{`
            @keyframes cloud-drift {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 200px 0, -200px 0; }
            }
          `}</style>
        </>
      ) : (
        <>
          {/* drifting fog bands */}
          <div
            className="absolute inset-0 opacity-22"
            style={{
              transform: t(0.85),
              backgroundImage:
                "linear-gradient( to right, rgba(200,220,255,0.06), rgba(200,220,255,0.02) 30%, rgba(200,220,255,0.06) 60%, rgba(200,220,255,0.02) 90% )",
              filter: "blur(1px)",
              animation: "fog-drift 28s ease-in-out infinite",
            }}
          />
          <style jsx>{`
            @keyframes fog-drift {
              0%, 100% { transform: ${t(0.85)} translateX(0px); }
              50% { transform: ${t(0.85)} translateX(120px); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
