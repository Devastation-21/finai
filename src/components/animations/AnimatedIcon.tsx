"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { scaleIn, floatVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedIconProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  float?: boolean;
  delay?: number;
  size?: "sm" | "md" | "lg";
}

export function AnimatedIcon({ 
  children, 
  className = "",
  float = false,
  delay = 0,
  size = "md",
  ...props 
}: AnimatedIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <motion.div
      className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      variants={float ? floatVariants : scaleIn}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
