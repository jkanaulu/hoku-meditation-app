import React from "react";
import { motion } from "framer-motion";

/** Cute, glowing star that gently "breathes" */
export default function HokuAvatar({ size = 64, paused = false }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ filter: "blur(28px)", background: "rgba(255, 216, 156, 0.45)" }}
        animate={paused ? { opacity: 0.5 } : { opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="relative z-10 drop-shadow-[0_0_22px_rgba(255,216,156,0.45)]"
        width={size}
        height={size}
        animate={paused ? { scale: 1 } : { scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M100 14l22.4 57.7 62.3 2.5-50 37.3 17.7 58.5L100 139l-52.4 31.9 17.7-58.5-50-37.3 62.3-2.5L100 14z"
          fill="#FFD89C"
        />
        <path
          d="M100 14l22.4 57.7 62.3 2.5-50 37.3 17.7 58.5L100 139l-52.4 31.9 17.7-58.5-50-37.3 62.3-2.5L100 14z"
          fill="none"
          stroke="#FFC870"
          strokeWidth="5"
        />
        <circle cx="78" cy="96" r="9" fill="#2b2b2b" />
        <circle cx="122" cy="96" r="9" fill="#2b2b2b" />
        <path d="M85 118c10 10 20 10 30 0" stroke="#2b2b2b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="110" r="8" fill="#FFB09C" opacity="0.35" />
        <circle cx="140" cy="110" r="8" fill="#FFB09C" opacity="0.35" />
      </motion.svg>
    </div>
  );
}
