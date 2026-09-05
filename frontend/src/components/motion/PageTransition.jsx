import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion, MOTION_TOKENS } from "./motionConfig";

const PageTransition = ({ children, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        duration: MOTION_TOKENS.normal,
        ease: MOTION_TOKENS.easeStandard,
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
