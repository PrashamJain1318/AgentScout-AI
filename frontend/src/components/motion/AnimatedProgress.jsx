import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "./motionConfig";

const AnimatedProgress = ({
  value = 0,
  max = 100,
  height = 8,
  trackColor = "var(--surface-muted)",
  barGradient = "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const safeVal = Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : 0;
  const ratio = max > 0 ? safeVal / max : 0;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${className}`}
      style={{ height, backgroundColor: trackColor }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: ratio }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
        style={{
          height: "100%",
          width: "100%",
          transformOrigin: "left center",
          background: barGradient,
          borderRadius: "999px",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default AnimatedProgress;
