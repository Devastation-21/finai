"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pulseVariants, loadingVariants } from "@/lib/animations";

interface AnimatedLoaderProps {
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  showSpinner?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8"
};

export function AnimatedLoader({ 
  children,
  className = "",
  size = "md",
  text = "Loading...",
  showSpinner = true
}: AnimatedLoaderProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center space-y-2", className)}
      variants={loadingVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {showSpinner && (
        <motion.div
          className={cn(
            "border-2 border-primary border-t-transparent rounded-full",
            sizeClasses[size]
          )}
          variants={pulseVariants}
          animate="animate"
        />
      )}
      {children || (
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}
