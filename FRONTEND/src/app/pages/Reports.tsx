import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Download, Sparkles, Brain, AlertCircle, CheckCircle2, TrendingUp, Mail } from "lucide-react";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { TiltCard } from "../components/TiltCard";
import { KeyInsight } from "../components/KeyInsight";
import { cn } from "../utils";
import API_BASE from "../../config/api";

// Fallback Mock Data - REMOVED (use real data from backend)
const defaultRawData = [
  { id: 0, date: "Loading...", session: "Loading...", duration: "0h 0m", efficiency: 0, status: "Loading" },
];

const defaultInsights = [
  {
    type: "neutral",
    title: "Waiting for data...",
    description: "Start tracking your activities to see insights.",
    icon: "TrendingUp"
  }
];

const InsightCard = ({ title, description, icon: Icon, type, delay }: any) => {
  const isPositive = type === "positive";
  const isWarning = type === "warning";
  const isNeutral = type === "neutral";

  return (
    <TiltCard className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="flex h-full items-start gap-4 rounded-[20px] border border-slate-200 bg-white/90 backdrop-blur-sm p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]/90"
        style={{ willChange: "transform, opacity" }}
      >
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner",
          isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
          isWarning ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
          "bg-[#5B8CFF]/10 text-[#5B8CFF]"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </TiltCard>
  );
};

export const Reports = () => {
  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Reports"; }, []);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reportSessions, setReportSessions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports and insights
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [sessionsRes, insightsRes] = await Promise.all([
          fetch(`${API_BASE}/reports/sessions`),
          fetch(`${API_BASE}/reports/insights`)
        ]);
        
        if (!sessionsRes.ok || !insightsRes.ok) {
          throw new Error("Failed to fetch reports");
        }
        
        const sessionsData = await sessionsRes.json();
        const insightsData = await insightsRes.json();
        
        setReportSessions(sessionsData.sessions || defaultRawData);
        setInsights(insightsData.insights || defaultInsights);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to fetch reports:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch reports");
        setReportSessions(defaultRawData);
        setInsights(defaultInsights);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    
    // Poll every 15 seconds
    const interval = setInterval(fetchReports, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const confirmExport = () => {
    setIsExportModalOpen(false);
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1500); // Mock export delay
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 font-sans tracking-tight">
      
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & AI Insights</h1>
          <p className="mt-1 text-slate-500">System generated behavioral analysis and raw data exports.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white dark:bg-[#111827]">
            <FileText className="mr-2 h-4 w-4" />
            CSV Data
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExport}
            disabled={isExporting}
            className="shadow-md transition-all w-40 justify-center"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Generating...
              </span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4 fill-current" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Insight Section - Highlighted Top Insight */}
      <KeyInsight
        title="Your Peak Productivity Window"
        description="Data shows you're most productive between 9:00 AM and 11:30 AM. Consider scheduling your most important tasks during this window to maximize output."
        metric="09:00 - 11:30"
        metricLabel="Peak Hours"
        intensity="high"
        action={{
          label: "View Full Analysis",
          onClick: () => { if (import.meta.env.DEV) console.log("View analysis"); },
        }}
      />

      {/* AI Insights Section (Great for FYP presentation to show "Smart" features) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Predictive Insights</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(loading ? defaultInsights : insights).map((insight, index) => (
            <InsightCard 
              key={`insight-${index}`}
              type={insight.type}
              icon={
                insight.icon === "TrendingUp" ? TrendingUp :
                insight.icon === "AlertCircle" ? AlertCircle :
                CheckCircle2
              }
              title={insight.title}
              description={insight.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Raw Data Table (Crucial for academic projects to show data tracking) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Raw Session Logs</h2>
        <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-[#111827]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Session Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Duration</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Efficiency</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">System Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <div className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white mx-auto" />
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  reportSessions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{row.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{row.session}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{row.duration}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                row.efficiency > 80 ? "bg-emerald-500" : 
                                row.efficiency > 70 ? "bg-[#5B8CFF]" : "bg-rose-500"
                              )}
                              style={{ width: `${row.efficiency}%` }}
                            />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-200">{row.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          row.status === "Excellent" || row.status === "Great" 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : row.status === "Good"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-center dark:border-slate-800 dark:bg-slate-800/20">
            <button className="text-sm font-medium text-[#5B8CFF] hover:text-[#7C3AED] transition-colors">
              View All {reportSessions.length || 142} Records
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Report">
        <div className="space-y-4">
          <p className="text-sm">Choose your export preferences for the behavior analysis report.</p>
          <div className="space-y-3 mt-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input type="radio" name="export-type" className="h-4 w-4 text-[#5B8CFF] focus:ring-[#5B8CFF]" defaultChecked />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Full Analysis Report</p>
                <p className="text-xs text-slate-500">Includes AI insights and graphs (PDF)</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input type="radio" name="export-type" className="h-4 w-4 text-[#5B8CFF] focus:ring-[#5B8CFF]" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Executive Summary</p>
                <p className="text-xs text-slate-500">1-page high-level metrics (PDF)</p>
              </div>
            </label>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmExport}>
              <Mail className="mr-2 h-4 w-4" />
              Send to Email
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};