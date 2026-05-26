import React, { useEffect } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from "motion/react";
import { Button } from "../components/Button";
import { TiltCard } from "../components/TiltCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { BrainCircuit, LineChart, Timer, Zap, Activity, Target, Shield, ChevronRight } from "lucide-react";

const FloatingElement = ({ children, offset, mouseX, mouseY, className, animationProps }: any) => {
  const x = useTransform(mouseX, (val: number) => val * offset);
  const y = useTransform(mouseY, (val: number) => val * offset);
  
  return (
    <motion.div
      style={{ x, y, willChange: "transform" }}
      animate={animationProps}
      className={`absolute z-10 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const Landing = () => {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const rotateXTransform = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const rotateX = useSpring(rotateXTransform, { stiffness: 100, damping: 30 });
  
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 50, damping: 20, mass: 0.5 });
  const mouseY = useSpring(rawMouseY, { stiffness: 50, damping: 20, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      rawMouseX.set(x);
      rawMouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawMouseX, rawMouseY]);

  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — AI Productivity Tracker"; }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#F9FAFB] dark:bg-[#0F172A] transition-colors duration-500" />
        <motion.div
          style={{ 
            x: useTransform(mouseX, (v: number) => v * -3), 
            y: useTransform(mouseY, (v: number) => v * -3),
            willChange: "transform" 
          }}
          className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.15)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.1)_0%,transparent_60%)]"
        />
        <motion.div
          style={{ 
            x: useTransform(mouseX, (v: number) => v * 2), 
            y: useTransform(mouseY, (v: number) => v * 2),
            willChange: "transform"
          }}
          className="absolute top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_60%)]"
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-[#0F172A]/80 transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#7C3AED] shadow-lg">
              <div className="h-4 w-4 rounded-full bg-white/90 shadow-inner" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">WorkSense</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative mx-auto mt-20 flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <FloatingElement offset={2} mouseX={mouseX} mouseY={mouseY} className="top-[20%] left-[5%]">
            <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-[#111827]/40">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#5B8CFF]">
                 <span className="text-xs font-bold text-slate-900 dark:text-white">92</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Focus Score</p>
                <p className="font-bold text-slate-900 dark:text-white">Excellent</p>
              </div>
            </div>
          </FloatingElement>

          <FloatingElement offset={-1.5} mouseX={mouseX} mouseY={mouseY} className="top-[30%] right-[5%]">
             <div className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-md dark:border-slate-700/50 dark:bg-[#111827]/40 flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly Productivity</p>
                <div className="flex items-end gap-1.5 h-12">
                  {[40, 70, 45, 90, 65].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-3 rounded-sm bg-gradient-to-t from-[#7C3AED] to-[#5B8CFF]" 
                    />
                  ))}
                </div>
             </div>
          </FloatingElement>

          <FloatingElement offset={3} mouseX={mouseX} mouseY={mouseY} className="bottom-[15%] left-[15%]">
             <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-[#5B8CFF] opacity-60 blur-md" />
          </FloatingElement>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-20 flex flex-col items-center"
        >
          <h1 className="mb-6 max-w-4xl text-6xl font-extrabold tracking-tight text-slate-900 md:text-7xl lg:text-8xl dark:text-white">
            <span className="block mb-2">Measure your focus.</span>
            <motion.span 
               animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
               transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
               style={{ backgroundSize: "200% auto" }}
               className="bg-gradient-to-r from-[#5B8CFF] via-[#7C3AED] to-[#5B8CFF] bg-clip-text text-transparent inline-block pb-2"
            >
              Master your time.
            </motion.span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            The intelligent productivity system designed to track cognitive peaks, block distractions, and optimize your workflow with real-time AI insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" magnetic className="w-full">
                Start for Free
              </Button>
            </Link>
            <Link to="#demo" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" magnetic className="w-full">
                See How It Works
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section id="demo" className="relative mx-auto max-w-6xl px-6 py-12 z-20">
        <motion.div 
          style={{ perspective: 1200 }} 
          className="w-full"
        >
          <motion.div
            style={{ rotateX, willChange: "transform" }}
            className="relative w-full rounded-2xl md:rounded-[2.5rem] border border-slate-200/50 bg-white/50 p-4 md:p-6 shadow-2xl backdrop-blur-md dark:border-slate-700/50 dark:bg-[#0F172A]/80 flex flex-col md:flex-row gap-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-[2.5rem]" />
            
            <div className="hidden md:flex w-48 flex-col gap-4 border-r border-slate-200/50 pr-6 dark:border-slate-700/50">
               <div className="h-8 w-24 rounded bg-slate-200/50 dark:bg-slate-700/50 mb-8" />
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-4 w-full rounded bg-slate-200/30 dark:bg-slate-700/30" />
               ))}
               <div className="mt-auto h-12 w-full rounded-xl bg-gradient-to-r from-[#5B8CFF]/20 to-[#7C3AED]/20 border border-[#5B8CFF]/30" />
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center">
                 <div className="h-6 w-32 rounded bg-slate-200/50 dark:bg-slate-700/50" />
                 <div className="h-8 w-8 rounded-full bg-slate-200/50 dark:bg-slate-700/50" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/50 dark:bg-slate-800/50 p-4 flex flex-col justify-between">
                     <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-600" />
                     <div className="h-6 w-24 rounded bg-slate-300 dark:bg-slate-500" />
                   </div>
                 ))}
              </div>

              <div className="h-48 rounded-xl border border-white/10 bg-white/50 dark:bg-slate-800/50 p-4 flex items-end gap-2">
                 {[30, 50, 40, 80, 60, 90, 75, 45, 85].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: '10%' }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className="flex-1 rounded-t-sm bg-[#5B8CFF]/60 dark:bg-[#5B8CFF]/40"
                    />
                 ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-20 mx-auto max-w-7xl px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Intelligence that scales with you.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            From passive tracking to active improvement, WorkSense builds a custom cognitive profile of your work habits.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12 text-center mt-20">
          <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-0.5 border-t-2 border-dashed border-slate-300 dark:border-slate-700 -z-10" />
          
          {[
            { title: "Track Activity", desc: "Silently monitors your app usage and site visits.", icon: Activity },
            { title: "Analyze Data", desc: "AI builds your peak focus and distraction profile.", icon: BrainCircuit },
            { title: "Improve Focus", desc: "Guides you into deep flow states effectively.", icon: Target },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="flex flex-col items-center group relative"
            >
              <div className="h-24 w-24 mb-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                 <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#5B8CFF]/20 to-[#7C3AED]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                 <step.icon className="h-10 w-10 text-[#5B8CFF]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: BrainCircuit, title: "Smart Focus", desc: "AI-driven cognitive tracking." },
            { icon: LineChart, title: "Deep Analytics", desc: "Visualize your workflow trends." },
            { icon: Timer, title: "Flow States", desc: "Immersive Pomodoro tracking." },
            { icon: Shield, title: "Site Blocker", desc: "Auto-detect productivity drains." },
          ].map((feature, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
              <TiltCard tiltAmount={10} glow className="h-full p-8 text-left shadow-lg bg-white/50 dark:bg-[#111827]/50 backdrop-blur-sm group">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#5B8CFF] transition-all duration-300 group-hover:bg-[#5B8CFF] group-hover:text-white group-hover:scale-110 shadow-sm">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-[#5B8CFF] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                   Explore feature <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      <section className="relative z-20 mx-auto max-w-5xl px-6 py-32 text-center">
         <div className="rounded-[3rem] bg-gradient-to-br from-slate-900 to-[#111827] dark:from-[#050B14] dark:to-[#0F172A] p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#5B8CFF] to-transparent" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to reclaim your time?</h2>
              <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">Join thousands of high-performers tracking their deep work and mastering their schedules.</p>
              <Link to="/login">
                <Button size="lg" variant="primary" magnetic className="mx-auto text-lg px-10 py-5">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-[#5B8CFF]/20 blur-[100px] pointer-events-none" />
         </div>
      </section>
    </div>
  );
};