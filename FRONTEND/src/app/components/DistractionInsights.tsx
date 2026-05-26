import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import { TiltCard } from "./TiltCard";
import { cn } from "../utils";
import {
  analyzeDistractionPatterns,
  DistractionPattern,
  AnalyticsData,
} from "../utils/distractionEngine";

interface DistractionInsightsProps {
  analyticsData?: AnalyticsData | null;
  isLoading?: boolean;
}

export const DistractionInsights: React.FC<DistractionInsightsProps> = ({
  analyticsData,
  isLoading = false,
}) => {
  const [pattern, setPattern] = useState<DistractionPattern | null>(null);

  useEffect(() => {
    if (analyticsData) {
      const analyzedPattern = analyzeDistractionPatterns(analyticsData);
      setPattern(analyzedPattern);
    }
  }, [analyticsData]);

  if (isLoading || !pattern) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Distraction Insights
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Determine if distraction is critical
  const isCritical = pattern.distractionPercentage > 40;
  const trendColor =
    pattern.weeklyTrendDirection === "improving"
      ? "emerald"
      : pattern.weeklyTrendDirection === "declining"
        ? "rose"
        : "amber";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Distraction Insights
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isCritical
            ? "⚠️ Your distraction levels are high. Time to take action!"
            : "📊 Your focus patterns and optimization opportunities"}
        </p>
      </div>

      {/* Top Distraction Apps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TiltCard>
          <div className={cn(
            "rounded-2xl border-2 p-6",
            isCritical
              ? "border-rose-500/30 bg-gradient-to-br from-rose-50/50 to-rose-50/20 dark:from-rose-500/10 dark:to-rose-500/5"
              : "border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-amber-50/20 dark:from-amber-500/10 dark:to-amber-500/5"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  isCritical ? "text-rose-500" : "text-amber-500"
                )} />
                Top Distractions
              </h3>
              <span className={cn(
                "text-sm font-bold px-3 py-1 rounded-full",
                isCritical
                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-400"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              )}>
                {pattern.distractionPercentage}%
              </span>
            </div>

            <div className="space-y-3">
              {pattern.topDistractionApps.map((app, idx) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-white/5 group hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {idx + 1}. {app.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-white/30 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${app.score}%` }}
                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                        className={cn(
                          "h-full rounded-full",
                          idx === 0
                            ? "bg-gradient-to-r from-rose-500 to-orange-500"
                            : idx === 1
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-amber-500 to-yellow-500"
                        )}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-7">
                      {Math.round(app.score)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Peak Distraction Hours & Trend Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TiltCard>
            <div className={cn(
              "rounded-2xl border-2 p-6",
              pattern.peakDistractionHour.riskLevel === "high"
                ? "border-red-500/30 bg-gradient-to-br from-red-50/50 to-red-50/20 dark:from-red-500/10 dark:to-red-500/5"
                : pattern.peakDistractionHour.riskLevel === "medium"
                  ? "border-orange-500/30 bg-gradient-to-br from-orange-50/50 to-orange-50/20 dark:from-orange-500/10 dark:to-orange-500/5"
                  : "border-green-500/30 bg-gradient-to-br from-green-50/50 to-green-50/20 dark:from-green-500/10 dark:to-green-500/5"
            )}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className={cn(
                  "h-5 w-5",
                  pattern.peakDistractionHour.riskLevel === "high"
                    ? "text-red-500"
                    : pattern.peakDistractionHour.riskLevel === "medium"
                      ? "text-orange-500"
                      : "text-green-500"
                )} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Peak Distraction Time
                </h3>
              </div>

              <p className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text mb-2">
                {pattern.peakDistractionHour.hour}
              </p>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-block w-2 h-2 rounded-full animate-pulse",
                  pattern.peakDistractionHour.riskLevel === "high"
                    ? "bg-red-500"
                    : pattern.peakDistractionHour.riskLevel === "medium"
                      ? "bg-orange-500"
                      : "bg-green-500"
                )} />
                <p className={cn(
                  "text-sm font-medium",
                  pattern.peakDistractionHour.riskLevel === "high"
                    ? "text-red-700 dark:text-red-400"
                    : pattern.peakDistractionHour.riskLevel === "medium"
                      ? "text-orange-700 dark:text-orange-400"
                      : "text-green-700 dark:text-green-400"
                )}>
                  {pattern.peakDistractionHour.riskLevel === "high"
                    ? "Critical - Block distractions now"
                    : pattern.peakDistractionHour.riskLevel === "medium"
                      ? "Moderate - Be cautious"
                      : "Low risk"}
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Trend Direction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TiltCard>
            <div className={cn(
              "rounded-2xl border-2 p-6",
              pattern.weeklyTrendDirection === "improving"
                ? "border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 dark:from-emerald-500/10 dark:to-emerald-500/5"
                : pattern.weeklyTrendDirection === "declining"
                  ? "border-rose-500/30 bg-gradient-to-br from-rose-50/50 to-rose-50/20 dark:from-rose-500/10 dark:to-rose-500/5"
                  : "border-slate-500/30 bg-gradient-to-br from-slate-50/50 to-slate-50/20 dark:from-slate-500/10 dark:to-slate-500/5"
            )}>
              <div className="flex items-center gap-2 mb-4">
                {pattern.weeklyTrendDirection === "improving" ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : pattern.weeklyTrendDirection === "declining" ? (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                ) : (
                  <Activity className="h-5 w-5 text-slate-500" />
                )}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Weekly Trend
                </h3>
              </div>

              <p className={cn(
                "text-3xl font-extrabold text-transparent bg-clip-text mb-2 capitalize",
                pattern.weeklyTrendDirection === "improving"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                  : pattern.weeklyTrendDirection === "declining"
                    ? "bg-gradient-to-r from-rose-600 to-pink-600"
                    : "bg-gradient-to-r from-slate-600 to-slate-700"
              )}>
                {pattern.weeklyTrendDirection}
              </p>

              <p className={cn(
                "text-sm font-medium",
                pattern.weeklyTrendDirection === "improving"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : pattern.weeklyTrendDirection === "declining"
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-400"
              )}>
                {pattern.weeklyTrendDirection === "improving"
                  ? "✨ Great momentum! Keep it up"
                  : pattern.weeklyTrendDirection === "declining"
                    ? "📉 Focus is declining. Take action"
                    : "➡️ Your focus is stable"}
              </p>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Distraction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TiltCard>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Distraction Time
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ~{Math.round(pattern.estimatedDistractionHours)}h
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    This week
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Impact Level
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {pattern.distractionPercentage > 40
                      ? "🔴 Critical"
                      : pattern.distractionPercentage > 25
                        ? "🟠 High"
                        : "🟢 Low"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    On productivity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
};
