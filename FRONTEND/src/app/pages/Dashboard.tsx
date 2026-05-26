/**
 * Dashboard - Main productivity dashboard
 * Layout: TaskControlPanel (hero) → SessionStats + TodoList → Stats Grid → Charts
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Clock, TrendingUp, Zap, ZapOff, X as XIcon } from "lucide-react";
import { TiltCard } from "../components/TiltCard";
import { TaskControlPanel } from "../components/TaskControlPanel";
import { SessionStats } from "../components/SessionStats";
import { TaskTodoList } from "../components/TaskTodoList";
import { SoftWarning, StrongWarning, MemeAlert } from "../components/DistractionAlerts";
import { useSession } from "../context/SessionContext";
import { useSessionDistraction } from "../hooks/useSessionDistraction";
import { cn } from "../utils";
import API_BASE from "../../config/api";

// ─── Mock Data (shown when backend is not running) ───────────────────────────

const MOCK_WEEKLY_DATA = [
  { name: "Mon", focus: 4.2 },
  { name: "Tue", focus: 5.1 },
  { name: "Wed", focus: 3.8 },
  { name: "Thu", focus: 6.0 },
  { name: "Fri", focus: 5.5 },
  { name: "Sat", focus: 2.3 },
  { name: "Sun", focus: 3.1 },
];

const MOCK_PIE_DATA = [
  { name: "Productive", value: 58 },
  { name: "Neutral", value: 24 },
  { name: "Distracting", value: 18 },
];

const COLORS = ["#5B8CFF", "#94A3B8", "#EF4444"];

const MOCK_APP_DATA = [
  { name: "Chrome", hours: 14 },
  { name: "VS Code", hours: 12 },
  { name: "MS Word", hours: 10 },
  { name: "Brave", hours: 8 },
  { name: "WhatsApp", hours: 5.5 },
  { name: "MS PowerPoint", hours: 2 },
];

// ─── StatCard ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, trend, positive, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(91,140,255,0.2)" }}
  >
    <div className="relative overflow-hidden rounded-2xl transition-colors group h-full border border-white/60 bg-white/60 backdrop-blur-md shadow-md hover:border-[#5B8CFF]/50 dark:border-slate-800/50 dark:bg-[#111827]/60 dark:hover:border-[#5B8CFF]/50 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-inner bg-white/80 dark:bg-slate-800/80 text-[#5B8CFF] transition-transform duration-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold backdrop-blur-md rounded-full border",
          positive
            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
            : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
        )}>
          <TrendingUp className={cn("h-3 w-3", !positive && 'rotate-180')} />
          {trend}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">{value}</h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">{title}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Time Formatting Helper ──────────────────────────────────────────────────

/**
 * Converts raw seconds into a human-readable "Xm Ys" string.
 * Examples: 177 → "2m 57s", 0 → "0m 0s", 3661 → "61m 1s"
 */
const formatSeconds = (totalSec: number): string => {
  const safeSec = Math.max(0, Math.floor(totalSec || 0));
  const minutes = Math.floor(safeSec / 60);
  const seconds = safeSec % 60;
  return `${minutes}m ${seconds}s`;
};

// ─── Dashboard Component ─────────────────────────────────────────────────────

export const Dashboard = () => {
  const { session } = useSession();
  const { alertLevel, distractingApp, taskName, distractionSeconds, dismissAlert } = useSessionDistraction();

  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Dashboard"; }, []);

  // FIX 5: Backend offline banner
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // State for API data
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/stats`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
        setBackendAvailable(true);
        setIsBackendOffline(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
        setIsBackendOffline(true);
        setBackendAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate derived values - use backend data or mock defaults
  const productiveSeconds = stats?.breakdown?.Productive ?? 0;
  const distractionSecondsTotal = stats?.breakdown?.Distraction ?? 0;
  const neutralSeconds = stats?.breakdown?.Neutral ?? 0;
  const totalSeconds = stats?.total_tracked_seconds ?? 0;

  // For display: use real data if backend available, otherwise show mock values
  const deepWorkDisplay = backendAvailable
    ? formatSeconds(productiveSeconds)
    : "4m 32s";
  const distractionDisplay = backendAvailable
    ? formatSeconds(distractionSecondsTotal)
    : "1m 15s";
  const breakDisplay = backendAvailable
    ? formatSeconds(neutralSeconds)
    : "0m 48s";

  // Charts data - use backend if available, otherwise mock
  const weeklyData = backendAvailable && stats?.weekly_trends?.length > 1
    ? stats.weekly_trends
    : MOCK_WEEKLY_DATA;

  const pieData = backendAvailable && totalSeconds > 0
    ? [
        { name: "Productive", value: Math.round((productiveSeconds / totalSeconds) * 100) },
        { name: "Neutral", value: Math.round((neutralSeconds / totalSeconds) * 100) },
        { name: "Distracting", value: Math.round((distractionSecondsTotal / totalSeconds) * 100) },
      ]
    : MOCK_PIE_DATA;

  const appData = backendAvailable && stats?.top_apps?.length > 0
    ? stats.top_apps
    : MOCK_APP_DATA;

  return (
    <div className="space-y-6 pb-12 relative font-sans">

      {/* FIX 5: Backend Offline Warning Banner */}
      <AnimatePresence>
        {isBackendOffline && !bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <span>⚠️ Backend not connected — showing demo data.</span>
            <button onClick={() => setBannerDismissed(true)} className="rounded-lg p-1 hover:bg-amber-200/50 dark:hover:bg-amber-500/20 transition-colors" aria-label="Dismiss warning">
              <XIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOP: TaskControlPanel (HERO) ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <TaskControlPanel />
      </motion.div>

      {/* ═══ CENTER + RIGHT: SessionStats + Todo List ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-6 lg:grid-cols-5"
      >
        <div className="lg:col-span-3">
          <SessionStats />
        </div>
        <div className="lg:col-span-2">
          <TaskTodoList />
        </div>
      </motion.div>

      {/* ═══ Stats Grid ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Study Time" value={deepWorkDisplay} icon={Clock} trend="+12%" positive delay={0.35} />
        <StatCard title="Distracting Time" value={distractionDisplay} icon={ZapOff} trend="-5%" positive delay={0.42} />
        <StatCard title="Break Time" value={breakDisplay} icon={Zap} trend="+2%" positive={false} delay={0.49} />
        <StatCard title="Focus Streak 🔥" value="4 Days" icon={TrendingUp} trend="+1" positive delay={0.56} />
      </motion.div>

      {/* ═══ Charts: Weekly Trends + Breakdown + Top Apps ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Weekly Trends */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-lg dark:border-slate-800/50 dark:bg-[#111827]/50 p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-slate-900 dark:text-white text-xl font-bold">Weekly Trends</h3>
            <select className="px-3 py-1.5 text-xs cursor-pointer transition-colors outline-none appearance-none rounded-xl border border-slate-200/50 bg-white/50 font-medium shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white focus:ring-[#5B8CFF]/50 focus:outline-none focus:ring-2">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocusDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    padding: '10px'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#5B8CFF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFocusDash)"
                  activeDot={{ r: 6, fill: '#5B8CFF', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Breakdown Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart - Time Breakdown */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(124,58,237,0.18)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-lg dark:border-slate-800/50 dark:bg-[#111827]/50 p-8 flex flex-col items-center"
          >
            <h3 className="mb-4 w-full text-slate-900 dark:text-white text-lg font-bold">Time Breakdown</h3>
            <div className="flex-1 w-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell
                        key={`pie-${index}-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ filter: `drop-shadow(0px 3px 5px ${COLORS[index]}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                      padding: '10px'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[10px] font-medium w-full">
              {pieData.map((entry: any, index: number) => (
                <div key={`legend-${index}`} className="flex items-center gap-1.5 px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full shadow-sm">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-slate-600 dark:text-[#A1A1AA]">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bar Chart - Top Apps */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-xl shadow-lg dark:border-slate-800/50 dark:bg-[#111827]/50 p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Top Apps</h3>
              <button className="text-xs hover:underline font-bold text-[#5B8CFF]">View All</button>
            </div>
            <div className="flex-1 w-full min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} width={70} />
                  <Tooltip
                    cursor={{fill: 'rgba(91,140,255,0.05)', radius: 4} as any}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(12px)',
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="hours" fill="#7C3AED" radius={[0, 6, 6, 0]} barSize={14}>
                    {appData.map((entry: any, index: number) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={index === 0 ? "#5B8CFF" : index === 1 ? "#7C3AED" : index === 2 ? "#EF4444" : "#94A3B8"}
                        fillOpacity={1 - index * 0.1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ Distraction Alerts (Overlays) ═══ */}
      <AnimatePresence>
        {alertLevel === "soft" && (
          <SoftWarning
            isVisible={true}
            taskName={taskName}
            distractingApp={distractingApp}
            onDismiss={dismissAlert}
          />
        )}
      </AnimatePresence>

      <StrongWarning
        isVisible={alertLevel === "strong"}
        taskName={taskName}
        distractingApp={distractingApp}
        distractionSeconds={distractionSeconds}
        onReturn={dismissAlert}
      />

      <MemeAlert
        isVisible={alertLevel === "meme"}
        taskName={taskName}
        distractingApp={distractingApp}
        onDismiss={dismissAlert}
      />
    </div>
  );
};
