"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full"
};

const paddingClasses = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6", 
  lg: "p-6 sm:p-8"
};

const spacingClasses = {
  none: "",
  sm: "space-y-2 sm:space-y-3",
  md: "space-y-3 sm:space-y-4",
  lg: "space-y-4 sm:space-y-6",
  xl: "space-y-6 sm:space-y-8"
};

export function ResponsiveContainer({ 
  children, 
  className = "",
  maxWidth = "full",
  padding = "md",
  spacing = "md",
  ...props 
}: ResponsiveContainerProps) {
  return (
    <motion.div
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
