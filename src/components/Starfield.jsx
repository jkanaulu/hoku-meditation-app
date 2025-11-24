import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Stable, low-cost starfield:
 * - Stars are generated ONCE (useMemo) to avoid moving when typing.
 * - Subtle, constant drift using linear animation (parallax feel).
 * - Occasional shooting stars with long durations and staggered delays.
 */
function StarfieldImpl({ count = 60, drift = true }) {
  // Generate stars once
  const stars = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.8, // 0.8–2.8px
      twinkleDur: 2.2 + Math.random() * 3.5,
      twinkleDelay: Math.random() * 3,
      driftX: -30 - Math.random() * 30, // -30 to -60 px
      driftY: -60 - Math.random() * 40, // -60 to -100 px
    }));
  }, [count]);

  // Pre-baked shooting stars (very few; performance-friendly)
  const shooting = useMemo(() => {
    const n = 4; // number of streaks
    return Array.from({ length: n }).map((_, i) => ({
      // start near top-right, travel diagonally down-left
      startX: 110 + Math.random() * 20, // vw
      startY: -10 + Math.random() * 30, // vh
      dx: -160 - Math.random() * 60,    // vw
      dy: 140 + Math.random() * 60,     // vh
      delay: i * 4 + Math.random() * 3, // stagger
      duration: 6 + Math.random() * 5,  // seconds
      width: 1 + Math.random() * 2,     // px
      length: 70 + Math.random() * 70,  // px
      opacity: 0.35 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* large soft gradients for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 70% 10%, rgba(46,209,193,0.12), transparent), radial-gradient(900px 500px at 20% 90%, rgba(193,232,255,0.12), transparent)",
        }}
      />

      {/* twinkling + slow drift stars */}
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: 0.9,
            willChange: "transform, opacity",
          }}
          // twinkle
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: s.twinkleDur, repeat: Infinity, delay: s.twinkleDelay, ease: "easeInOut" }}
        >
          {/* drift wrapper – use a separate element for GPU-friendly translate */}
          {drift && (
            <motion.span
              style={{ display: "block", width: "100%", height: "100%" }}
              animate={{ x: [0, s.driftX, 0], y: [0, s.driftY, 0] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.span>
      ))}

      {/* shooting stars */}
      {shooting.map((st, i) => (
        <motion.span
          key={`shoot-${i}`}
          className="absolute"
          style={{
            left: `${st.startX}vw`,
            top: `${st.startY}vh`,
            width: st.length,
            height: st.width,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 40%, rgba(193,232,255,0.8) 80%, rgba(193,232,255,0) 100%)",
            borderRadius: st.width / 2,
            opacity: st.opacity,
            transformOrigin: "left center",
            rotate: "-30deg",
            filter: "drop-shadow(0 0 6px rgba(193,232,255,0.6))",
            willChange: "transform, opacity",
          }}
          animate={{ x: `${st.dx}vw`, y: `${st.dy}vh`, opacity: [0, st.opacity, 0] }}
          transition={{ duration: st.duration, repeat: Infinity, delay: st.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export default React.memo(StarfieldImpl);
