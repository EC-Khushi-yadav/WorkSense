import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, RotateCcw } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../utils";
import memeImage from "../../../assets/images.jfif";

interface MemeAlertProps {
  isVisible: boolean;
  taskName?: string;
  intent?: string;
  distractingApp?: string;
  onDismiss?: () => void;
  memeImageUrl?: string;
}

export const MemeAlert: React.FC<MemeAlertProps> = ({
  isVisible,
  taskName = "your task",
  intent = "",
  distractingApp = "that app",
  onDismiss,
  memeImageUrl = memeImage,
}) => {
  React.useEffect(() => {
    if (isVisible) {
      // Play sound if available
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==");
      audio.play().catch(() => {});
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40"
          />

          {/* Meme Alert Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 10, y: 30 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 150,
              damping: 25,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className={cn(
              "rounded-3xl overflow-hidden shadow-2xl",
              "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90",
              "border border-slate-700/50",
              "backdrop-blur-3xl"
            )}>
              {/* Animated particles background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: Math.sin(i) * 100,
                      y: Math.cos(i) * 100,
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4 + i,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      "absolute w-32 h-32 rounded-full blur-3xl",
                      i % 2 === 0 ? "bg-red-500/20" : "bg-orange-500/20"
                    )}
                    style={{
                      left: `${i * 25}%`,
                      top: `${i * 25}%`,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 space-y-6">
                {/* Meme Image */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="rounded-2xl overflow-hidden border-3 border-yellow-400/30 shadow-2xl"
                >
                  <img
                    src={memeImageUrl}
                    alt="Distraction Alert Meme"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </motion.div>

                {/* Caption Box - Dynamic based on task */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "p-6 rounded-2xl text-center",
                    "bg-gradient-to-r from-red-500/20 to-orange-500/20",
                    "border border-red-500/30 dark:border-red-500/20",
                    "backdrop-blur-xl"
                  )}
                >
                  <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text">
                    Bro… seriously? 😅
                  </p>
                  <p className="text-lg font-semibold text-white mt-3">
                    You chose <span className="text-blue-300">"{taskName}"</span>… this isn't it.
                  </p>
                  <p className="text-base text-amber-300 font-semibold mt-2">
                    Get back. Now. 🤦
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    Detected on: {distractingApp}
                  </p>
                </motion.div>

                {/* Stats Callout */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <p className="text-xs text-slate-400">Lost Focus</p>
                    <p className="text-xl font-bold text-red-400 mt-1">60s+</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <p className="text-xs text-slate-400">Alert Level</p>
                    <p className="text-xl font-bold text-orange-400 mt-1">🔥 MAX</p>
                  </motion.div>
                </div>

                {/* Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={onDismiss}
                    className={cn(
                      "w-full flex items-center justify-center gap-2",
                      "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500",
                      "hover:from-red-600 hover:via-orange-600 hover:to-yellow-600",
                      "text-white font-bold text-lg shadow-2xl",
                      "transform transition-all duration-200 hover:scale-105",
                      "py-4"
                    )}
                  >
                    <RotateCcw className="h-5 w-5" />
                    Back to Focus
                  </Button>
                </motion.div>

                {/* Motivational Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-xs text-slate-400 flex items-center justify-center gap-2"
                >
                  <Volume2 className="h-3 w-3" />
                  Let's crush this session! 💪
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
