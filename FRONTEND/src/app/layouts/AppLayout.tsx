import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useMode } from "../context/ModeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

import { LayoutDashboard, Target, LogOut, ChevronRight, BarChart2, FileText, User, Menu, X } from "lucide-react";
import { cn } from "../utils";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Target, label: "Focus Mode", href: "/focus" },
];

export const AppLayout = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { mode } = useMode();
  const isStudent = mode === "student";
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>

      
      <div className={cn(
        "flex h-screen w-full overflow-hidden font-sans relative",
        isStudent 
          ? "bg-gradient-to-br from-[#F0F4FF] via-white to-[#F8F5FF] dark:from-[#09090b] dark:via-[#09090b] dark:to-[#09090b] text-slate-900 dark:text-white transition-colors" 
          : "bg-[#09090b] text-white tracking-tight"
      )}>
      {/* Background Orbs for Light Mode (Student) */}
      {isStudent && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20">
          <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.25)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.15)_0%,transparent_60%)]" />
          <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.2)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_60%)]" />
        </div>
      )}

      {/* FIX 9: Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ Desktop Sidebar (hidden on mobile) ═══ */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={cn(
          "relative z-50 w-64 flex-col justify-between border-r p-6 transition-colors",
          "hidden lg:flex",
          mode === "student"
            ? "border-slate-200/50 bg-white/60 backdrop-blur-md dark:border-slate-800/50 dark:bg-[#111827]/60"
            : "border-white/10 bg-[#09090b]"
        )}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#7C3AED] shadow-lg">
              <div className="h-4 w-4 rounded-full bg-white/90 shadow-inner" />
            </div>
            <span className="text-xl font-bold tracking-tight">WorkSense</span>
          </div>

          <nav className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex items-center justify-between rounded-2xl px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-[#5B8CFF]/10 text-[#5B8CFF] dark:bg-[#5B8CFF]/20"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute inset-0 rounded-2xl border border-[#5B8CFF]/30 dark:border-[#5B8CFF]/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md p-4 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Plan</p>
            <p className="mt-1 text-sm font-bold bg-gradient-to-r from-[#5B8CFF] to-[#7C3AED] bg-clip-text text-transparent capitalize">
              {mode} Version
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#5B8CFF] to-[#7C3AED] shadow-[0_0_10px_rgba(91,140,255,0.4)]" />
            </div>
          </div>
          <Link to="/">
            <motion.button
              whileHover={{ x: 4 }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </motion.button>
          </Link>
        </div>
      </motion.aside>

      {/* ═══ Mobile Sidebar (slides in from left, lg:hidden) ═══ */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r p-6 lg:hidden",
              mode === "student"
                ? "border-slate-200/50 bg-white backdrop-blur-md dark:border-slate-800/50 dark:bg-[#111827]"
                : "border-white/10 bg-[#09090b]"
            )}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#7C3AED] shadow-lg">
                    <div className="h-4 w-4 rounded-full bg-white/90 shadow-inner" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">WorkSense</span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setIsMobileSidebarOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`group relative flex items-center justify-between rounded-2xl px-4 py-3 transition-colors ${
                          isActive
                            ? "bg-[#5B8CFF]/10 text-[#5B8CFF] dark:bg-[#5B8CFF]/20"
                            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Link to="/" onClick={() => setIsMobileSidebarOpen(false)}>
              <motion.button
                whileHover={{ x: 4 }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </motion.button>
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className={cn(
          "flex h-20 items-center justify-between border-b px-8 backdrop-blur-md transition-colors",
          mode === "student"
            ? "border-white/40 bg-white/40 dark:border-slate-800/50 dark:bg-[#0F172A]/50 shadow-sm"
            : "border-white/10 bg-[#09090b]/80"
        )}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {/* FIX 9: Mobile hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden mr-2"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span>WorkSense</span>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize text-slate-900 dark:text-slate-100">
              {location.pathname.substring(1) || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Open profile"
              className="h-10 w-10 overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-transform hover:scale-105 active:scale-95 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B8CFF] focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]"
            >
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Avatar" className="h-full w-full object-cover" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform, opacity" }}
              className="h-full w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="User Profile">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-200 shadow-sm dark:bg-slate-800">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Chaitanya Singh</h4>
              <p className="text-sm text-slate-500">cs@gmail.com</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium">Role</span>
              <span className="text-sm text-slate-500">Senior Product Manager</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium">Team</span>
              <span className="text-sm text-slate-500">Growth & Analytics</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Timezone</span>
              <span className="text-sm text-slate-500">PST (UTC-8)</span>
            </div>
          </div>
        </div>
      </Modal>

    </div>
    </>
  );
};
