import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion, MOTION_TOKENS } from "./motionConfig";

const FadeIn = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 12,
  viewportOnce = true,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const initialOffset = directions[direction] || directions.up;

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-20px" }}
      transition={{
        duration: MOTION_TOKENS.normal,
        delay,
        ease: MOTION_TOKENS.easeStandard,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
