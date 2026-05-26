import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/Button";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { cn } from "../utils";

const FloatingInput = ({ icon: Icon, label, type = "text", ...props }: any) => {
  const [focused, setFocused] = useState(false);
  const [val, setVal] = useState("");

  return (
    <div className="relative mb-6">
      <div
        className={cn(
          "relative flex items-center rounded-2xl border bg-white/50 px-4 py-3 transition-all backdrop-blur-xl dark:bg-[#111827]/50",
          focused
            ? "border-[#5B8CFF] shadow-[0_0_15px_rgba(91,140,255,0.2)]"
            : "border-slate-200 dark:border-slate-800"
        )}
      >
        <Icon className={cn("mr-3 h-5 w-5 transition-colors", focused ? "text-[#5B8CFF]" : "text-slate-400")} />
        <div className="relative w-full h-6 flex items-center">
          <motion.label
            initial={false}
            animate={{
              y: focused || val ? -18 : 0,
              scale: focused || val ? 0.85 : 1,
              color: focused ? "#5B8CFF" : "#94a3b8",
            }}
            className="pointer-events-none absolute left-0 origin-left font-medium"
          >
            {label}
          </motion.label>
          <input
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full h-full bg-transparent text-slate-900 outline-none placeholder:text-transparent dark:text-white pt-2"
            placeholder={label}
            {...props}
          />
        </div>
      </div>
    </div>
  );
};

export const Login = () => {
  const navigate = useNavigate();

  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Sign In"; }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/select-version");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24 xl:px-32 relative z-10">
        <Link to="/" className="absolute top-8 left-8 md:left-24 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#5B8CFF] to-[#7C3AED] shadow-sm">
            <div className="h-3 w-3 rounded-full bg-white/90 shadow-inner" />
          </div>
          <span className="font-bold tracking-tight">WorkSense</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mb-8 text-slate-500 dark:text-slate-400">
            Log in to continue your focus journey.
          </p>


          <form onSubmit={handleLogin}>
            <FloatingInput icon={Mail} label="Email Address" type="email" required />
            <FloatingInput icon={Lock} label="Password" type="password" required />

            <div className="mb-8 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input type="checkbox" className="accent-[#5B8CFF]" />
                Remember me
              </label>
              <a href="#" className="font-medium text-[#5B8CFF] hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full justify-between" magnetic>
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <a href="#" className="font-medium text-[#5B8CFF] hover:underline">
              Sign up
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right side - 3D/Illustration Visual */}
      <div className="hidden w-1/2 relative md:block bg-slate-100 dark:bg-[#111827]">
        {/* Abstract 3D shape illustration representation using CSS and Framer Motion */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#5B8CFF]/5 to-[#7C3AED]/10 backdrop-blur-3xl">
          <motion.div
            animate={{
              rotateY: [0, 360],
              rotateX: [0, 360],
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="relative h-96 w-96 transform-gpu"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div className="absolute inset-0 rounded-3xl border border-white/20 bg-gradient-to-br from-[#5B8CFF]/40 to-transparent p-8 shadow-2xl backdrop-blur-xl" style={{ transform: 'translateZ(100px)' }}>
               <div className="h-full w-full rounded-2xl border border-white/10 bg-white/10" />
            </div>
            {/* Back */}
            <div className="absolute inset-0 rounded-3xl border border-white/20 bg-gradient-to-tl from-[#7C3AED]/40 to-transparent p-8 shadow-2xl backdrop-blur-xl" style={{ transform: 'translateZ(-100px) rotateY(180deg)' }}>
               <div className="h-full w-full rounded-2xl border border-white/10 bg-white/10" />
            </div>
             {/* Left */}
             <div className="absolute inset-0 rounded-3xl border border-white/20 bg-[#5B8CFF]/20 shadow-2xl backdrop-blur-xl" style={{ transform: 'translateX(-50%) rotateY(-90deg)', width: '200px', left: '50%', marginLeft: '-100px' }} />
             {/* Right */}
             <div className="absolute inset-0 rounded-3xl border border-white/20 bg-[#7C3AED]/20 shadow-2xl backdrop-blur-xl" style={{ transform: 'translateX(50%) rotateY(90deg)', width: '200px', left: '50%', marginLeft: '-100px' }} />
          </motion.div>
          
          <div className="absolute bottom-12 text-center max-w-sm">
            <h3 className="text-xl font-bold mb-2">Master Your Workflow</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Experience the next generation of productivity intelligence and achieve deep work like never before.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
