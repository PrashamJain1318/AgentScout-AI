import { useState, useEffect } from "react";

// Central Motion Timing Tokens
export const MOTION_TOKENS = {
  fast: 0.15,
  normal: 0.22,
  slow: 0.35,
  easeStandard: [0.16, 1, 0.3, 1],
  easeEmphasized: [0.2, 0, 0, 1],
};

// Framer Motion Spring Presets
export const SPRING_PRESETS = {
  gentle: { type: "spring", stiffness: 260, damping: 20 },
  bouncy: { type: "spring", stiffness: 350, damping: 15 },
  subtle: { type: "spring", stiffness: 300, damping: 28 },
};

// Hook for detecting user reduced motion preference
export const useReducedMotion = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return shouldReduceMotion;
};
