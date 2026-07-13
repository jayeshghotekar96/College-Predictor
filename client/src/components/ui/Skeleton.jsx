import React from "react";
import { motion } from "framer-motion";

/**
 * A primitive skeleton block with pulse animation
 */
export function Skeleton({ className = "", variant = "rectangular", ...props }) {
  const baseStyles = "bg-slate-800/80 animate-pulse border border-slate-700/30";
  
  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded-sm h-4 w-3/4",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

/**
 * A wrapper to conditionally render children or skeletons,
 * crossfading smoothly using Framer Motion.
 */
export function SkeletonFade({ loading, skeleton, children }) {
  return (
    <>
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
