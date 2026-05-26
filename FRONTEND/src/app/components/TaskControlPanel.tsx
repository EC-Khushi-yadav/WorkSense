/**
 * TaskControlPanel - Hero component for the dashboard
 * Allows users to define WHAT they're working on and HOW (intent),
 * then start/end tracked sessions.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Video,
  ClipboardList,
  Code2,
  Play,
  Square,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "./Button";
import { useSession } from "../context/SessionContext";
import { Intent, INTENT_CONFIGS, getIntentLabel } from "../utils/productivityEngine";
import { cn } from "../utils";

// ─── Intent Card Data ────────────────────────────────────────────────────────

const INTENT_CARDS: Array<{
  intent: Intent;
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
  glowColor: string;
}> = [
  {
    intent: "solve_questions",
    icon: <Brain className="h-6 w-6" />,
    label: "Solve Questions",
    description: "LeetCode, GFG, HackerRank",
    gradient: "from-violet-500/20 to-purple-500/20",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    intent: "watch_lecture",
    icon: <Video className="h-6 w-6" />,
    label: "Watch Lecture",
    description: "YouTube, Coursera, NPTEL",
    gradient: "from-sky-500/20 to-cyan-500/20",
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  {
    intent: "assignment",
    icon: <ClipboardList className="h-6 w-6" />,
    label: "Do Assignment",
    description: "Docs, Notion, Research",
    gradient: "from-amber-500/20 to-orange-500/20",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    intent: "coding",
    icon: <Code2 className="h-6 w-6" />,
    label: "Coding / Project",
    description: "VS Code, GitHub, Terminal",
    gradient: "from-emerald-500/20 to-teal-500/20",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const TaskControlPanel: React.FC = () => {
  const { session, startSession, endSession } = useSession();
  const [taskInput, setTaskInput] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleStart = () => {
    if (!taskInput.trim() || !selectedIntent) return;
    startSession(taskInput.trim(), selectedIntent);
  };

  const handleEnd = () => {
    endSession();
    setShowEndConfirm(false);
    setTaskInput("");
    setSelectedIntent(null);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // ── Active Session View ──────────────────────────────────────────────────

  if (session.isActive) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.2)" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-2xl dark:border-slate-800/50 dark:bg-[#111827]/50"
      >
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B8CFF]/5 via-transparent to-[#7C3AED]/5 pointer-events-none" />

        {/* Active indicator border */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-[#10B981]/30 pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Status header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              />
              <span className="text-sm font-bold uppercase tracking-widest text-[#10B981]">
                Session Active
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <Timer className="h-4 w-4 text-[#5B8CFF]" />
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {formatTime(session.elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Task info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {session.taskName}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#5B8CFF]/15 text-[#5B8CFF] border border-[#5B8CFF]/20">
                  {getIntentLabel(session.intent as Intent)}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border",
                  session.currentClassification === "productive"
                    ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20"
                    : session.currentClassification === "distraction"
                    ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20"
                    : "bg-slate-500/15 text-slate-500 border-slate-500/20"
                )}>
                  {session.currentClassification === "productive" ? "✅ Productive" :
                   session.currentClassification === "distraction" ? "⚠️ Distracted" :
                   "⏸ Neutral"}
                </span>
              </div>
              {session.currentWindowTitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  📱 {session.currentWindowTitle}
                </p>
              )}
            </div>

            {/* Live stats */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
                <p className="text-xs text-slate-500 dark:text-slate-400">Productive</p>
                <p className="text-lg font-bold text-[#10B981]">{formatTime(session.productiveTime)}</p>
              </div>
              <div className="text-center px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                <p className="text-xs text-slate-500 dark:text-slate-400">Distracted</p>
                <p className="text-lg font-bold text-[#EF4444]">{formatTime(session.distractionTime)}</p>
              </div>
            </div>
          </div>

          {/* End session button */}
          <div className="mt-6 flex justify-end">
            <AnimatePresence mode="wait">
              {showEndConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-300">End session?</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEnd}
                    className="bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    <Square className="h-4 w-4" />
                    Yes, End
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEndConfirm(false)}
                  >
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="end-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowEndConfirm(true)}
                    className="border-red-500/30 hover:border-red-500/50 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-500 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  >
                    <Square className="h-4 w-4" />
                    End Session
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Idle / Setup View ────────────────────────────────────────────────────

  return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.2)" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-2xl dark:border-slate-800/50 dark:bg-[#111827]/50"
      >
        {/* Static decorative gradient */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.1)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute right-40 -bottom-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#5B8CFF]/10 text-[#5B8CFF] border border-[#5B8CFF]/20 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            New Session
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What are you working on?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Define your task and pick your study mode to start tracking.
          </p>
        </div>

        {/* Task Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
            Your Task
          </label>
          <input
            id="task-input"
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder='e.g., "DSA Practice", "Web Dev Project", "ML Assignment"'
            className={cn(
              "w-full px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300",
              "bg-white/70 dark:bg-slate-800/50 backdrop-blur-md",
              "border-2 border-slate-200/60 dark:border-slate-700/50",
              "text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:border-[#5B8CFF] focus:ring-4 focus:ring-[#5B8CFF]/10",
              "shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            )}
            onKeyDown={(e) => e.key === "Enter" && taskInput.trim() && selectedIntent && handleStart()}
          />
        </div>

        {/* Intent Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
            How will you do this?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {INTENT_CARDS.map((card, index) => {
              const isSelected = selectedIntent === card.intent;
              return (
                <motion.button
                  key={card.intent}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 20px ${card.glowColor}`,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedIntent(card.intent)}
                  id={`intent-card-${card.intent}`}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors duration-300 cursor-pointer text-center group",
                    "backdrop-blur-md",
                    isSelected
                      ? "border-[#5B8CFF] bg-[#5B8CFF]/10 dark:bg-[#5B8CFF]/10"
                      : "border-slate-200/60 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                  animate={
                    isSelected
                      ? {
                          boxShadow: [
                            "0 0 15px rgba(91,140,255,0.15)",
                            "0 0 30px rgba(91,140,255,0.35)",
                            "0 0 15px rgba(91,140,255,0.15)",
                          ],
                        }
                      : { boxShadow: "0 0 0px rgba(91,140,255,0)" }
                  }
                  transition={
                    isSelected
                      ? { boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                      : { duration: 0.3 }
                  }
                >
                  {/* Glow effect on selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="intent-glow"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5B8CFF]/8 to-[#7C3AED]/8 pointer-events-none"
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    />
                  )}

                  <div className={cn(
                    "relative z-10 p-2.5 rounded-xl transition-all duration-300",
                    isSelected
                      ? "bg-[#5B8CFF]/20 text-[#5B8CFF] shadow-[0_0_15px_rgba(91,140,255,0.3)]"
                      : `bg-gradient-to-br ${card.gradient} text-slate-600 dark:text-slate-300 group-hover:scale-110`
                  )}>
                    {card.icon}
                  </div>
                  <div className="relative z-10">
                    <p className={cn(
                      "text-sm font-bold transition-colors",
                      isSelected ? "text-[#5B8CFF]" : "text-slate-800 dark:text-slate-200"
                    )}>
                      {card.label}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {card.description}
                    </p>
                  </div>

                  {/* Check indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#5B8CFF] text-white flex items-center justify-center shadow-lg"
                    >
                      <Zap className="h-3 w-3 fill-current" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Start Button with breathing pulse */}
        <div>
          {(() => {
            const isReady = !!(taskInput.trim() && selectedIntent);
            return (
              <motion.div
                animate={
                  isReady
                    ? {
                        boxShadow: [
                          "0 0 20px rgba(91,140,255,0.2)",
                          "0 0 45px rgba(91,140,255,0.5)",
                          "0 0 20px rgba(91,140,255,0.2)",
                        ],
                      }
                    : { boxShadow: "0 0 0px rgba(91,140,255,0)" }
                }
                transition={
                  isReady
                    ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
                className={cn(
                  "w-full md:w-auto min-w-[240px] mx-auto rounded-2xl",
                  !isReady && "opacity-40"
                )}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  disabled={!isReady}
                  id="start-session-btn"
                  className="w-full flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start Session
                </Button>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};
