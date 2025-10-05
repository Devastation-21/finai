"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
  duration?: number;
}

export function AnimatedText({ 
  children, 
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.6,
  ...props 
}: AnimatedTextProps) {
  const variants = {
    up: fadeInUp,
    left: fadeInLeft,
    right: fadeInRight
  };

  return (
    <motion.div
      className={cn(className)}
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
