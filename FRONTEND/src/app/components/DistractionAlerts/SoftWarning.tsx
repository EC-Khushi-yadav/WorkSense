import React from "react";
import { motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../utils";

interface SoftWarningProps {
  isVisible: boolean;
  taskName?: string;
  distractingApp?: string;
  intent?: string;
  onDismiss?: () => void;
}

export const SoftWarning: React.FC<SoftWarningProps> = ({
  isVisible,
  taskName = "your task",
  distractingApp,
  intent,
  onDismiss,
}) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <div className={cn(
        "flex items-center gap-3 px-5 py-4 rounded-2xl",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10",
        "border border-amber-500/40 dark:border-amber-500/20",
        "backdrop-blur-2xl shadow-lg",
        "max-w-sm"
      )}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Stay Focused 👀
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
            You chose <strong>"{taskName}"</strong>… this doesn't look right.
          </p>
          {distractingApp && (
            <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 truncate max-w-[280px]">
              Detected: {distractingApp}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
