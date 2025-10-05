"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { bounceVariants, shakeVariants } from "@/lib/animations";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AnimatedNotificationProps {
  children: ReactNode;
  className?: string;
  type?: "success" | "error" | "warning" | "info";
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    iconClassName: "text-green-600 dark:text-green-400"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    iconClassName: "text-red-600 dark:text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
    iconClassName: "text-yellow-600 dark:text-yellow-400"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
    iconClassName: "text-blue-600 dark:text-blue-400"
  }
};

export function AnimatedNotification({ 
  children,
  className = "",
  type = "info",
  show,
  onClose,
  autoClose = true,
  duration = 5000
}: AnimatedNotificationProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (autoClose && show && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, show, onClose, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "fixed top-4 right-4 z-50 max-w-sm w-full mx-auto",
            "border rounded-lg p-4 shadow-lg backdrop-blur-sm",
            config.className,
            className
          )}
          variants={bounceVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
        >
          <div className="flex items-start space-x-3">
            <motion.div
              variants={shakeVariants}
              animate={type === "error" ? "animate" : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", config.iconClassName)} />
            </motion.div>
            <div className="flex-1 min-w-0">
              {children}
            </div>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
