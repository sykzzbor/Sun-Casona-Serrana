"use client";

import { motion } from "framer-motion";

// Isotipo de SUN según su Instagram: un sol sobre un arco de hojas.
const LEAVES = [205, 232, 259, 281, 308, 335];

export function SunMark({ className = "", sun = "#b24d3a", leaf = "currentColor", animate = true }: { className?: string; sun?: string; leaf?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      {LEAVES.map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x = 32 + 19 * Math.cos(r);
        const y = 15 - 19 * Math.sin(r);
        return (
          <g key={deg} transform={`translate(${x} ${y}) rotate(${-deg + 180})`}>
            <motion.path
              d="M0 0C2.6-3 7.4-3 10 0 7.4 3 2.6 3 0 0Z"
              fill={leaf}
              initial={animate ? { opacity: 0, scale: 0.3 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
            />
          </g>
        );
      })}
      <motion.circle
        cx="32"
        r="5.5"
        fill={sun}
        initial={animate ? { cy: 26, opacity: 0 } : false}
        animate={{ cy: 12, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export default function Logo({ tone = "dark", size = "sm" }: { tone?: "dark" | "light"; size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`flex items-center ${lg ? "flex-col gap-3" : "gap-3"}`}>
      <SunMark className={lg ? "h-14 w-24" : "h-7 w-11"} leaf={tone === "dark" ? "#576e28" : "#c9d3a8"} sun={tone === "dark" ? "#b24d3a" : "#e58a6e"} />
      <span className={`leading-none ${lg ? "text-center" : ""}`}>
        <span className={`block font-display tracking-[0.2em] ${lg ? "text-6xl sm:text-7xl" : "text-2xl"}`}>SUN</span>
        <span className={`block font-display italic tracking-[0.18em] ${lg ? "mt-3 text-base" : "mt-0.5 text-[11px]"} ${tone === "dark" ? "text-ladrillo" : "text-[#e9a68f]"}`}>
          casona — serrana
        </span>
      </span>
    </span>
  );
}
