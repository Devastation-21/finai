"use client";

import { motion } from "framer-motion";
import { ReactNode, ComponentProps } from "react";
import { buttonVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Button, buttonVariants as buttonVariantsCVA } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps extends 
  ComponentProps<"button">,
  VariantProps<typeof buttonVariantsCVA> {
  children: ReactNode;
  delay?: number;
  className?: string;
  asChild?: boolean;
}

export function AnimatedButton({ 
  children, 
  delay = 0,
  className = "",
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ delay }}
    >
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
