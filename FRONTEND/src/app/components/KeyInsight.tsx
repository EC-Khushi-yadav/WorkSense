import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "../utils";

interface KeyInsightProps {
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  intensity?: "high" | "medium" | "low";
}

export const KeyInsight: React.FC<KeyInsightProps> = ({
  title,
  description,
  metric,
  metricLabel,
  action,
  className,
  intensity = "high",
}) => {
  const getBgStyles = () => {
    switch (intensity) {
      case "high":
        return "from-[#5B8CFF]/20 via-[#7C3AED]/15 to-transparent dark:from-[#5B8CFF]/10 dark:via-[#7C3AED]/5 dark:to-transparent";
      case "medium":
        return "from-[#5B8CFF]/15 via-[#7C3AED]/10 to-transparent dark:from-[#5B8CFF]/5 dark:via-[#7C3AED]/0 dark:to-transparent";
      default:
        return "from-[#5B8CFF]/10 to-transparent dark:from-[#5B8CFF]/0 dark:to-transparent";
    }
  };

  const getBorderStyles = () => {
    switch (intensity) {
      case "high":
        return "border-[#5B8CFF]/40 dark:border-[#5B8CFF]/20 shadow-[0_0_30px_rgba(91,140,255,0.15)] dark:shadow-[0_0_30px_rgba(91,140,255,0.05)]";
      case "medium":
        return "border-[#5B8CFF]/30 dark:border-[#5B8CFF]/15 shadow-[0_0_20px_rgba(91,140,255,0.1)] dark:shadow-[0_0_20px_rgba(91,140,255,0.03)]";
      default:
        return "border-[#5B8CFF]/20 dark:border-[#5B8CFF]/10 shadow-sm";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border-2 p-8 md:p-10",
        "bg-gradient-to-br backdrop-blur-xl",
        getBgStyles(),
        getBorderStyles(),
        className
      )}
    >
      {/* Animated Background Elements */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-[#5B8CFF]/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-5 w-5 text-[#5B8CFF] dark:text-cyan-400" />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#5B8CFF] dark:text-cyan-400">
                Key Insight
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-base text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          {/* Metric Box */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-shrink-0 text-right"
          >
            <div className="px-6 py-4 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                {metricLabel}
              </p>
              <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#5B8CFF] via-[#7C3AED] to-cyan-400 bg-clip-text text-transparent">
                {metric}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        {action && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={action.onClick}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
              "bg-white/20 hover:bg-white/30 dark:bg-white/10 hover:dark:bg-white/15",
              "border border-white/30 dark:border-white/10 backdrop-blur-md",
              "text-slate-900 dark:text-white transition-all duration-200",
              "shadow-[0_8px_32px_0_rgba(91,140,255,0.1)]"
            )}
          >
            {action.label}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#5B8CFF]/0 via-white/0 to-[#7C3AED]/0 opacity-0 hover:opacity-20 transition-opacity duration-700 rounded-[2rem] pointer-events-none" />
    </motion.div>
  );
};
