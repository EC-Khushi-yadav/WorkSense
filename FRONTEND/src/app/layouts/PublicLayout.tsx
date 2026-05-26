import React from "react";
import { Outlet } from "react-router";
import { ThemeToggle } from "../components/ThemeToggle";

export const PublicLayout = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] text-slate-900 transition-colors dark:bg-[#0F172A] dark:text-white overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 -left-1/4 h-[500px] w-[500px] rounded-full bg-[#5B8CFF]/10 blur-[120px] dark:bg-[#5B8CFF]/20" />
      <div className="absolute bottom-0 -right-1/4 h-[500px] w-[500px] rounded-full bg-[#7C3AED]/10 blur-[120px] dark:bg-[#7C3AED]/20" />
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Outlet />
    </div>
  );
};
