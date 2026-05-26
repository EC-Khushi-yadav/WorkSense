import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Clock, TrendingUp, Zap, ZapOff, Play, CheckCircle, Target, Activity } from "lucide-react";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { DistractionInsights } from "../components/DistractionInsights";
import { DistractionActions } from "../components/DistractionActions";
import { useSession } from "../context/SessionContext";
import { getIntentLabel, calculateProductivityScore, Intent } from "../utils/productivityEngine";
import { cn } from "../utils";
import API_BASE from "../../config/api";

// App usage - user specified
const APP_USAGE_DATA = [
  { name: "Chrome", hours: 14 },
  { name: "VS Code", hours: 12 },
  { name: "MS Word", hours: 10 },
  { name: "Brave", hours: 8 },
  { name: "WhatsApp", hours: 5.5 },
  { name: "MS PowerPoint", hours: 2 },
];

const COLORS = ["#5B8CFF", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#94A3B8"];

const AnimatedScoreRing = ({ score }: { score: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [score, count]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#10B981";
    if (s >= 60) return "#5B8CFF";
    if (s >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="80"
          cy="80"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          style={{ filter: `drop-shadow(0 0 4px ${getColor(score)}60)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white flex items-center">
          <motion.span>{rounded}</motion.span><span className="text-2xl text-slate-400">%</span>
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">
          Avg Score
        </span>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend, positive, delay }: any) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(91,140,255,0.2)" }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex h-full flex-col justify-between rounded-[20px] border border-slate-200 bg-white/90 backdrop-blur-sm p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]/90"
  >
    <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
        positive 
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      )}>
        <TrendingUp className={cn("h-3 w-3", !positive && "rotate-180")} />
        {trend}
      </div>
    </div>
    <div className="mt-4">
      <h4 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h4>
      <p className="mt-1 text-sm font-medium text-slate-500">{title}</p>
    </div>
  </motion.div>
);

export const Analytics = () => {
  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Analytics"; }, []);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const { session, sessionHistory } = useSession();

  // ─── Fetch real analytics from backend ────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await fetch(`${API_BASE}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to fetch analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ─── Derive all data from real session history ─────────────────────────────

  // Calculate total productive, distraction, neutral time across all sessions
  const totalProductive = sessionHistory.reduce((sum, s) => sum + s.productiveTime, 0)
    + (session.isActive ? session.productiveTime : 0);
  const totalDistraction = sessionHistory.reduce((sum, s) => sum + s.distractionTime, 0)
    + (session.isActive ? session.distractionTime : 0);
  const totalSessionTime = sessionHistory.reduce((sum, s) => sum + Math.floor((s.endTime - s.startTime) / 1000), 0)
    + (session.isActive ? session.elapsedSeconds : 0);
  const totalNeutral = Math.max(0, totalSessionTime - totalProductive - totalDistraction);

  // Average score across sessions
  const avgScore = sessionHistory.length > 0
    ? Math.round(sessionHistory.reduce((sum, s) => sum + s.score, 0) / sessionHistory.length)
    : (session.isActive
      ? calculateProductivityScore(session.productiveTime, session.productiveTime + session.distractionTime || session.elapsedSeconds)
      : 0);

  // Format seconds to display
  const formatHM = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Time distribution pie data (from real times)
  const timeDistribution = totalSessionTime > 0
    ? [
        { name: "Productive", value: Math.round((totalProductive / totalSessionTime) * 100) },
        { name: "Neutral", value: Math.round((totalNeutral / totalSessionTime) * 100) },
        { name: "Distraction", value: Math.round((totalDistraction / totalSessionTime) * 100) },
      ]
    : [
        { name: "Productive", value: 0 },
        { name: "Neutral", value: 0 },
        { name: "Distraction", value: 0 },
      ];
  const PIE_COLORS = ["#5B8CFF", "#94A3B8", "#EF4444"];

  // Session trend data (each session as a data point)
  const trendData = sessionHistory.length > 0
    ? sessionHistory.map((s, i) => ({
        name: s.taskName.length > 12 ? s.taskName.slice(0, 12) + "…" : s.taskName,
        score: s.score,
        avg: avgScore,
      }))
    : [{ name: "No data", score: 0, avg: 0 }];

  const hasData = sessionHistory.length > 0 || session.isActive || (analyticsData && analyticsData.top_apps && analyticsData.top_apps.length > 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 font-sans tracking-tight">
      
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
          <p className="mt-1 text-slate-500">
            {hasData
              ? `Tracking ${sessionHistory.length} session${sessionHistory.length !== 1 ? "s" : ""}. Real-time data from your study sessions.`
              : "Start a session from the Dashboard to see real-time analytics here."}
          </p>
        </div>
        <Link to="/dashboard">
          <Button 
            variant="primary" 
            className="shadow-md transition-all hover:shadow-lg dark:shadow-[0_0_15px_rgba(91,140,255,0.2)]"
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {/* Hero Analytics & Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Ring Hero */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="col-span-1 flex flex-col items-center justify-center rounded-[20px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
        >
          <AnimatedScoreRing score={avgScore} />
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Productivity Score</h3>
            <p className="mt-1 text-sm text-slate-500">
              {hasData
                ? `Average across ${sessionHistory.length} session${sessionHistory.length !== 1 ? "s" : ""}`
                : "No sessions recorded yet"}
            </p>
          </div>
        </motion.div>

        {/* 4 Metric Cards */}
        <div className="col-span-1 lg:col-span-2 grid gap-6 sm:grid-cols-2">
          <MetricCard
            title="Study Time"
            value={formatHM(totalProductive)}
            icon={Clock}
            trend={hasData ? `${sessionHistory.length} sessions` : "—"}
            positive
            delay={0}
          />
          <MetricCard
            title="Distraction Time"
            value={formatHM(totalDistraction)}
            icon={ZapOff}
            trend={totalSessionTime > 0 ? `${Math.round((totalDistraction / totalSessionTime) * 100)}%` : "—"}
            positive={totalDistraction < totalProductive}
            delay={0}
          />
          <MetricCard
            title="Neutral / Break Time"
            value={formatHM(totalNeutral)}
            icon={Zap}
            trend={totalSessionTime > 0 ? `${Math.round((totalNeutral / totalSessionTime) * 100)}%` : "—"}
            positive
            delay={0}
          />
          <MetricCard
            title="Tasks Completed"
            value={`${sessionHistory.length}`}
            icon={CheckCircle}
            trend={hasData ? "Live" : "—"}
            positive
            delay={0}
          />
        </div>
      </div>

      {/* Data Visualization Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session Score Trend Chart */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Session Score Trends</h3>
            <p className="text-sm text-slate-500">
              {hasData ? "Score per session vs average" : "Complete sessions to see trends"}
            </p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', color: '#fff' }}
                  itemStyle={{ fontWeight: 500, color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#5B8CFF" strokeWidth={3} dot={{ r: 5, fill: '#5B8CFF', strokeWidth: 0 }} activeDot={{ r: 7 }} name="Score" />
                <Line type="monotone" dataKey="avg" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Average" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Row for Pie & Bar */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart - Time Distribution (real data) */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(124,58,237,0.18)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
          >
            <h3 className="mb-6 w-full text-base font-semibold text-slate-900 dark:text-white">Time Distribution</h3>
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    cornerRadius={3}
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium">
              {timeDistribution.map((entry, index) => (
                <div key={`legend-${entry.name}`} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                  {entry.name} ({entry.value}%)
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bar Chart - Top Apps */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.18)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
          >
            <h3 className="mb-6 w-full text-base font-semibold text-slate-900 dark:text-white">Top Applications</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={APP_USAGE_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} width={85} />
                  <Tooltip 
                    cursor={{fill: 'rgba(91,140,255,0.05)'} as any}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={12}>
                    {APP_USAGE_DATA.map((entry, index) => (
                      <Cell key={`bar-cell-${entry.name}`} fill={COLORS[index % COLORS.length]} fillOpacity={1 - index * 0.08} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Session History Table */}
      {sessionHistory.length > 0 && (
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 16px 40px -10px rgba(91,140,255,0.15)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Session History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Intent</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Duration</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Productive</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Distracted</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Score</th>
                </tr>
              </thead>
              <tbody>
                {[...sessionHistory].reverse().map((s) => {
                  const duration = Math.floor((s.endTime - s.startTime) / 1000);
                  return (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{s.taskName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#5B8CFF]/10 text-[#5B8CFF] border border-[#5B8CFF]/20">
                          {getIntentLabel(s.intent)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatHM(duration)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#10B981]">{formatHM(s.productiveTime)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#EF4444]">{formatHM(s.distractionTime)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          "font-bold",
                          s.score >= 80 ? "text-[#10B981]" :
                          s.score >= 60 ? "text-[#5B8CFF]" :
                          s.score >= 40 ? "text-[#F59E0B]" :
                          "text-[#EF4444]"
                        )}>
                          {s.score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* No data state */}
      {!hasData && (
        <div className="rounded-[20px] border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
          <Target className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Session Data Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Go to the Dashboard, pick a task and intent, then start a session. Your real-time analytics will appear here automatically.
          </p>
          <Link to="/dashboard">
            <Button variant="primary">
              <Play className="h-4 w-4 fill-current mr-2" />
              Start Your First Session
            </Button>
          </Link>
        </div>
      )}

      {/* Distraction Insights & Actions Section */}
      <div className="space-y-8">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
        <DistractionInsights
          analyticsData={analyticsData}
          isLoading={analyticsLoading}
        />
        <DistractionActions
          analyticsData={analyticsData}
          isLoading={analyticsLoading}
          onActionClick={(actionId) => {
            if (import.meta.env.DEV) console.log("Action clicked:", actionId);
          }}
        />
      </div>
    </div>
  );
};
