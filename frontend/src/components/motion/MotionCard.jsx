import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion, SPRING_PRESETS } from "./motionConfig";

const MotionCard = ({
  children,
  className = "",
  onClick,
  hoverElevation = -2,
  tapScale = 0.98,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { y: hoverElevation } : {}}
      whileTap={onClick ? { scale: tapScale } : {}}
      transition={SPRING_PRESETS.subtle}
      className={className}
      onClick={onClick}
      style={{ willChange: "transform" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
