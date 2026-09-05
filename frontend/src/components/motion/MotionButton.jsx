import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useReducedMotion, SPRING_PRESETS } from "./motionConfig";

const MotionButton = ({
  children,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  type = "button",
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isInteractive = !disabled && !loading;

  if (shouldReduceMotion) {
    return (
      <button
        type={type}
        className={className}
        onClick={onClick}
        disabled={!isInteractive}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            {loadingText || "Processing..."}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={isInteractive ? { y: -1 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      transition={SPRING_PRESETS.gentle}
      className={className}
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      style={{ willChange: "transform" }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          {loadingText || "Processing..."}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default MotionButton;
