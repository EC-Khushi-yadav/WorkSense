import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, MoveRight, LogIn } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../utils";

interface StrongWarningProps {
  isVisible: boolean;
  distractingApp?: string;
  taskName?: string;
  distractionSeconds?: number;
  onReturn?: () => void;
  onStartFocus?: () => void;
}

export const StrongWarning: React.FC<StrongWarningProps> = ({
  isVisible,
  distractingApp = "that app",
  taskName = "your task",
  distractionSeconds = 0,
  onReturn,
  onStartFocus,
}) => {
  const formatDistractionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onReturn}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className={cn(
              "rounded-3xl border overflow-hidden shadow-2xl",
              "bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90",
              "border-slate-700/50 dark:border-slate-700/50",
              "backdrop-blur-2xl"
            )}>
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex justify-center"
                  >
                    <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Off Track! ⚠️
                    </h2>
                    <p className="text-sm text-slate-300">
                      You chose <span className="font-semibold text-blue-400">"{taskName}"</span>… this isn't it.
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-center text-slate-200 text-sm font-medium">
                    Get back on track. You've been distracted for <strong className="text-red-400">{formatDistractionTime(distractionSeconds)}</strong>.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-slate-400">Distraction Time</p>
                    <p className="text-lg font-bold text-red-400 mt-1">{formatDistractionTime(distractionSeconds)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-slate-400">Detected On</p>
                    <p className="text-sm font-bold text-amber-400 mt-1 truncate">{distractingApp}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={onReturn}
                    className={cn(
                      "w-full flex items-center justify-center gap-2",
                      "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
                      "text-white font-semibold shadow-lg",
                      "transform transition-all duration-200 hover:scale-105"
                    )}
                  >
                    <MoveRight className="h-4 w-4" />
                    Return to Work
                  </Button>
                </div>

                {/* Tip */}
                <p className="text-xs text-center text-slate-400 pt-2">
                  💡 Close the distracting app and focus on your task
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
