"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cardVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className = "", 
  hover = true,
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      whileTap="tap"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
