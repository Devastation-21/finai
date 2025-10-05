"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function AnimatedContainer({ 
  children, 
  className = "", 
  stagger = false,
  ...props 
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : undefined}
      initial="initial"
      animate="animate"
      {...props}
    >
      {stagger ? (
        <>
          {Array.isArray(children) 
            ? children.map((child, index) => (
                <motion.div key={index} variants={staggerItem}>
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
