import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Clock,
  Coffee,
  Shield,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Button } from "./Button";
import { TiltCard } from "./TiltCard";
import { cn } from "../utils";
import {
  generateDistractionActions,
  DistractionPattern,
  DistractionAction,
  AnalyticsData,
  analyzeDistractionPatterns,
} from "../utils/distractionEngine";

interface DistractionActionsProps {
  analyticsData?: AnalyticsData | null;
  isLoading?: boolean;
  onActionClick?: (actionId: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "block":
      return <Shield className="h-5 w-5" />;
    case "schedule":
      return <Clock className="h-5 w-5" />;
    case "break":
      return <Coffee className="h-5 w-5" />;
    case "focus":
      return <Zap className="h-5 w-5" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
};

const getCategoryColor = (
  category: string
): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} => {
  switch (category) {
    case "block":
      return {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-900 dark:text-red-300",
        border: "border-red-200 dark:border-red-500/30",
        icon: "text-red-600 dark:text-red-400",
      };
    case "schedule":
      return {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-900 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-500/30",
        icon: "text-blue-600 dark:text-blue-400",
      };
    case "break":
      return {
        bg: "bg-green-50 dark:bg-green-500/10",
        text: "text-green-900 dark:text-green-300",
        border: "border-green-200 dark:border-green-500/30",
        icon: "text-green-600 dark:text-green-400",
      };
    case "focus":
      return {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-900 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-500/30",
        icon: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-900 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-500/30",
        icon: "text-amber-600 dark:text-amber-400",
      };
  }
};

export const DistractionActions: React.FC<DistractionActionsProps> = ({
  analyticsData,
  isLoading = false,
  onActionClick,
}) => {
  const [actions, setActions] = useState<DistractionAction[]>([]);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  useEffect(() => {
    if (analyticsData) {
      const pattern = analyzeDistractionPatterns(analyticsData);
      const generatedActions = generateDistractionActions(pattern);
      setActions(generatedActions);
    }
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Distraction Reduction Actions
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          Reduce Distractions
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Personalized actions to help you stay focused
        </p>
      </div>

      {/* Priority Buttons */}
      <div className="flex flex-wrap gap-2">
        {(["high", "medium"] as const).map((priority) => {
          const count = actions.filter((a) => a.priority === priority).length;
          return (
            <motion.button
              key={priority}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                priority === "high"
                  ? "bg-red-500/20 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                  : "bg-amber-500/20 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
              )}
            >
              {priority === "high" ? "🔴" : "🟠"} {priority.toUpperCase()} ({count})
            </motion.button>
          );
        })}
      </div>

      {/* Actions Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {actions.map((action, index) => {
            const isExpanded = expandedAction === action.id;
            const colors = getCategoryColor(action.category);

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <TiltCard>
                  <motion.div
                    className={cn(
                      "rounded-2xl border-2 p-5 cursor-pointer transition-all",
                      colors.border,
                      colors.bg,
                      isExpanded ? "ring-2 ring-offset-2 ring-slate-400" : ""
                    )}
                    onClick={() =>
                      setExpandedAction(
                        isExpanded ? null : action.id
                      )
                    }
                    layout
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn("p-2 rounded-lg", colors.bg)}>
                          {React.cloneElement(getCategoryIcon(action.category) as React.ReactElement, {
                            className: cn(
                              "h-5 w-5",
                              colors.icon
                            ),
                          })}
                        </div>
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-bold text-lg",
                            colors.text.replace("text-", "").split(" ")[0]
                              ? colors.text
                              : "text-slate-900 dark:text-white"
                          )}>
                            {action.title}
                          </h3>
                          {action.metric && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              💡 {action.metric}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-lg",
                          action.priority === "high"
                            ? "bg-red-500/20 dark:bg-red-500/10"
                            : action.priority === "medium"
                              ? "bg-amber-500/20 dark:bg-amber-500/10"
                              : "bg-blue-500/20 dark:bg-blue-500/10"
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            "h-5 w-5",
                            action.priority === "high"
                              ? "text-red-600 dark:text-red-400"
                              : action.priority === "medium"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                          )}
                        />
                      </motion.div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 pt-4 border-t border-current border-opacity-10"
                        >
                          {/* Description */}
                          <p className={cn(
                            "text-sm leading-relaxed",
                            "text-slate-700 dark:text-slate-200"
                          )}>
                            {action.description}
                          </p>

                          {/* CTA Button */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActionClick?.(action.id);
                            }}
                            className={cn(
                              "w-full font-semibold text-white",
                              action.priority === "high"
                                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                                : action.priority === "medium"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                  : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            )}
                          >
                            {action.actionLabel}
                          </Button>

                          {/* Implementation Tips */}
                          <div className="p-3 rounded-lg bg-white/30 dark:bg-white/5">
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              💡 Pro Tip:
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {getTipForAction(action.id)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {actions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/20"
        >
          <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
            ✨ Perfect Focus Detected!
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-400">
            Your distraction levels are minimal. Keep up the great work!
          </p>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Helper function to get tips for each action
 */
function getTipForAction(actionId: string): string {
  const tips: Record<string, string> = {
    "block-app":
      "Enable browser extensions or system blockers to prevent access to this app during focus sessions.",
    "strict-focus":
      "During this critical period, all notifications should be muted and your phone put away.",
    "structured-breaks":
      "With 50 minutes of work and 10 minutes of break, you'll minimize fatigue-induced distractions.",
    "block-secondary":
      "Since productivity is declining, blocking secondary distractions will help you regain momentum.",
    "deep-work":
      "Your momentum is great! Double down by scheduling 2-3 uninterrupted focus blocks this week.",
    awareness:
      "Turn off email, Slack, and social media notifications during focus sessions to reduce context switching.",
  };

  return tips[actionId] || "Start implementing this action today to see results.";
}
