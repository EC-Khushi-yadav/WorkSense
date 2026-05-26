/**
 * SessionStats - Displays current or last session metrics with animated score ring
 */

import React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";
import { Target, Clock, Zap, ZapOff, Activity } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { getIntentLabel, calculateProductivityScore, Intent } from "../utils/productivityEngine";
import { cn } from "../utils";

const ScoreRing = ({ score }: { score: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [score, count]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return { start: "#10B981", end: "#059669", text: "text-[#10B981]", label: "Excellent!" };
    if (s >= 60) return { start: "#5B8CFF", end: "#4F46E5", text: "text-[#5B8CFF]", label: "Good" };
    if (s >= 40) return { start: "#F59E0B", end: "#D97706", text: "text-[#F59E0B]", label: "Fair" };
    return { start: "#EF4444", end: "#DC2626", text: "text-[#EF4444]", label: "Needs Work" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.1)_0%,transparent_70%)] blur-xl" />

      <svg className="h-full w-full -rotate-90 transform relative z-10" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="stroke-slate-200/30 dark:stroke-white/[0.05]"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-20">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className={cn("text-3xl font-extrabold tracking-tighter", colors.text)}
        >
          <motion.span>{rounded}</motion.span>%
        </motion.span>
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-0.5">
          {colors.label}
        </span>
      </div>
    </div>
  );
};

const StatItem = ({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
}) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30"
  >
    <div className={cn("p-2 rounded-lg", color)}>
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export const SessionStats: React.FC = () => {
  const { session, sessionHistory } = useSession();

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Show active session stats or last session
  const isActive = session.isActive;
  const lastSession = sessionHistory[sessionHistory.length - 1];

  const taskName = isActive ? session.taskName : (lastSession?.taskName ?? "No sessions yet");
  const intent = isActive ? session.intent : (lastSession?.intent ?? "");
  const productiveTime = isActive ? session.productiveTime : (lastSession?.productiveTime ?? 0);
  const distractionTime = isActive ? session.distractionTime : (lastSession?.distractionTime ?? 0);
  const elapsed = isActive ? session.elapsedSeconds : (lastSession ? Math.floor((lastSession.endTime - lastSession.startTime) / 1000) : 0);
  const totalActive = productiveTime + distractionTime;
  const score = isActive
    ? calculateProductivityScore(productiveTime, totalActive > 0 ? totalActive : elapsed)
    : (lastSession?.score ?? 0);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-lg dark:border-slate-800/50 dark:bg-[#111827]/50 p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-[#5B8CFF]" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {isActive ? "Live Session Stats" : "Last Session"}
        </h3>
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)] ml-1"
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score Ring */}
        <ScoreRing score={score} />

        {/* Stats Grid */}
        <div className="flex-1 w-full space-y-2">
          <StatItem
            icon={Activity}
            label="Task"
            value={taskName}
            color="bg-[#5B8CFF]/10 text-[#5B8CFF]"
            delay={0.1}
          />
          {intent && (
            <StatItem
              icon={Target}
              label="Intent"
              value={getIntentLabel(intent as Intent)}
              color="bg-[#7C3AED]/10 text-[#7C3AED]"
              delay={0.15}
            />
          )}
          <StatItem
            icon={Clock}
            label="Duration"
            value={formatTime(elapsed)}
            color="bg-slate-500/10 text-slate-500"
            delay={0.2}
          />
          <div className="grid grid-cols-2 gap-2">
            <StatItem
              icon={Zap}
              label="Productive"
              value={formatTime(productiveTime)}
              color="bg-[#10B981]/10 text-[#10B981]"
              delay={0.25}
            />
            <StatItem
              icon={ZapOff}
              label="Distracted"
              value={formatTime(distractionTime)}
              color="bg-[#EF4444]/10 text-[#EF4444]"
              delay={0.3}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
