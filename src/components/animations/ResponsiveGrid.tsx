"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ResponsiveGridProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  stagger?: boolean;
  staggerDelay?: number;
}

const gapClasses = {
  none: "",
  sm: "gap-2 sm:gap-3",
  md: "gap-3 sm:gap-4",
  lg: "gap-4 sm:gap-6",
  xl: "gap-6 sm:gap-8"
};

export function ResponsiveGrid({ 
  children,
  className = "",
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  stagger = false,
  staggerDelay = 0.1,
  ...props 
}: ResponsiveGridProps) {
  const gridCols = cn(
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return (
    <motion.div
      className={cn(
        "grid w-full",
        gridCols,
        gapClasses[gap],
        className
      )}
      variants={stagger ? staggerContainer : undefined}
      initial="initial"
      animate="animate"
      {...props}
    >
      {stagger ? (
        <>
          {Array.isArray(children) 
            ? children.map((child, index) => (
                <motion.div 
                  key={index} 
                  variants={staggerItem}
                  transition={{ delay: index * staggerDelay }}
                >
                  {child}
                </motion.div>
              ))
            : <motion.div variants={staggerItem}>{children}</motion.div>
          }
        </>
      ) : (
        children
      )}
    </motion.div>
  );
}
