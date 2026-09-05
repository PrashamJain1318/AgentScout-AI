import React, { useEffect, useState } from "react";
import { useReducedMotion } from "./motionConfig";

const AnimatedNumber = ({
  value,
  duration = 800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const safeTarget = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? safeTarget : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(safeTarget);
      return;
    }

    let startTimestamp = null;
    let animationFrameId = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out cubic
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (safeTarget - startValue) * easeOutProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [safeTarget, duration, shouldReduceMotion]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
