import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";
import { cn } from "../utils";
import { useMode } from "../context/ModeContext";

const JourneyCard = ({ 
  type, title, desc, icon: Icon, badge, color, selected, onClick 
}: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
    setCursorPos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const isSelected = selected === type;
  const isBlue = color === 'blue';

  const themeClasses = {
    activeBorder: isBlue ? "border-[#5B8CFF]" : "border-[#7C3AED]",
    shadowColor: isBlue ? "shadow-[0_0_40px_rgba(91,140,255,0.3)]" : "shadow-[0_0_40px_rgba(124,58,237,0.3)]",
    badgeBg: isBlue ? "bg-[#5B8CFF]/10 text-[#5B8CFF] border border-[#5B8CFF]/20" : "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20",
    iconBg: isBlue ? "bg-[#5B8CFF]/10 text-[#5B8CFF]" : "bg-[#7C3AED]/10 text-[#7C3AED]",
    iconHoverBg: isBlue ? "bg-[#5B8CFF] text-white shadow-[0_0_20px_rgba(91,140,255,0.4)]" : "bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]",
    checkBg: isBlue ? "bg-[#5B8CFF]" : "bg-[#7C3AED]",
    pulseColor: isBlue ? "bg-[#5B8CFF]" : "bg-[#7C3AED]",
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(type)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      animate={{ 
        scale: isSelected ? 1.05 : 1,
        y: isSelected ? -10 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative cursor-pointer rounded-3xl p-8 text-left transition-colors duration-300",
        "border bg-white/60 backdrop-blur-xl dark:bg-[#111827]/60 h-full flex flex-col group",
        isSelected 
          ? cn(themeClasses.activeBorder, themeClasses.shadowColor) 
          : "border-white/20 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Background Spotlight on Hover */}
      <AnimatePresence>
        {isHovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 -z-10 rounded-3xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${cursorPos.x}px ${cursorPos.y}px, ${isBlue ? 'rgba(91,140,255,0.15)' : 'rgba(124,58,237,0.15)'}, transparent 40%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Light Sweep on Hover */}
      <AnimatePresence>
        {isHovered && !isSelected && (
           <motion.div
             initial={{ x: "-100%", opacity: 0 }}
             animate={{ x: "200%", opacity: 0.3 }}
             transition={{ duration: 1, ease: "easeInOut" }}
             className="pointer-events-none absolute inset-0 -z-10 w-[200%] -skew-x-12 bg-gradient-to-r from-transparent via-white dark:via-white/50 to-transparent rounded-3xl overflow-hidden"
           />
        )}
      </AnimatePresence>

      {/* Selected Pulse Glow */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: [0.15, 0.3, 0.15] }}
             exit={{ opacity: 0 }}
             transition={{ repeat: Infinity, duration: 2 }}
             className={cn("absolute inset-0 -z-20 rounded-3xl blur-2xl", themeClasses.pulseColor)}
          />
        )}
      </AnimatePresence>

      {/* Selected Checkmark */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn("absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg z-20", themeClasses.checkBg)}
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content wrapper preserving 3D pop */}
      <div style={{ transform: "translateZ(60px)" }} className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className={cn("inline-flex items-center self-start gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6", themeClasses.badgeBg)}>
          <Sparkles className="h-3 w-3" /> {badge}
        </div>
        
        <div className={cn("mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500", themeClasses.iconBg, (isHovered || isSelected) && themeClasses.iconHoverBg, (isHovered || isSelected) && "scale-110")}>
           <Icon className="h-8 w-8" />
        </div>
        
        <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
          {title}
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-auto">
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

export const VersionSelect = () => {
  const navigate = useNavigate();
  const { setMode } = useMode();
  const [selected, setSelected] = useState<'student' | 'corporate' | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Select Mode"; }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleContinue = () => {
    if (selected) {
      setMode(selected);
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 overflow-hidden font-sans">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#F9FAFB] dark:bg-[#050B14] transition-colors duration-500" />
        
        {/* Soft Mesh Gradients */}
        <motion.div
          animate={{ x: mousePosition.x * -2, y: mousePosition.y * -2 }}
          transition={{ type: "spring", stiffness: 40, damping: 20 }}
          className="absolute top-0 -left-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#5B8CFF]/10 to-transparent blur-[120px] dark:from-[#5B8CFF]/15 mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div
          animate={{ x: mousePosition.x * 2, y: mousePosition.y * 2 }}
          transition={{ type: "spring", stiffness: 30, damping: 15 }}
          className="absolute bottom-[10%] -right-[10%] h-[700px] w-[700px] rounded-full bg-gradient-to-tl from-[#7C3AED]/10 to-transparent blur-[120px] dark:from-[#7C3AED]/15 mix-blend-multiply dark:mix-blend-screen"
        />

        {/* Floating Particles/Abstract Elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -30, 0], 
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5 + i * 2, 
              delay: i, 
              ease: "easeInOut" 
            }}
            className={cn(
              "absolute rounded-full blur-xl",
              i % 2 === 0 ? "bg-[#5B8CFF]/20" : "bg-[#7C3AED]/20"
            )}
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              width: `${50 + i * 20}px`,
              height: `${50 + i * 20}px`,
            }}
          />
        ))}
      </div>

      {/* Top Bar Elements */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#7C3AED] shadow-sm transition-transform duration-300 group-hover:scale-105">
            <div className="h-4 w-4 rounded-full bg-white/90 shadow-inner" />
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-900 dark:text-white group-hover:opacity-80 transition-opacity">WorkSense</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center max-w-2xl"
        >
          <h1 className="mb-4 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Choose Your <motion.span 
               animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
               transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
               style={{ backgroundSize: "200% auto" }}
               className="bg-gradient-to-r from-[#5B8CFF] via-[#7C3AED] to-[#5B8CFF] bg-clip-text text-transparent inline-block pb-2"
            >Journey</motion.span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-slate-500 dark:text-slate-400 font-medium"
          >
            Select the profile that best fits your workflow. You can switch this at any time in settings.
          </motion.p>
        </motion.div>

        {/* Selection Cards Area */}
        <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-0 perspective-1200">
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md mx-auto"
          >
            <JourneyCard
              type="student"
              title="Student"
              desc="Optimized for academics. Track your study sessions, manage assignments, master focus during lectures, and utilize built-in Pomodoro cycles with strict site blockers."
              icon={GraduationCap}
              badge="Best for Academics"
              color="blue"
              selected={selected}
              onClick={setSelected}
            />
          </motion.div>

          {/* Animated Divider */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="hidden md:flex flex-col items-center justify-center relative w-24 shrink-0"
          >
             <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
             {/* Glowing flowing particle along line */}
             <motion.div
               animate={{ y: ["-200%", "200%"] }}
               transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
               className="absolute h-32 w-[2px] bg-gradient-to-b from-transparent via-[#5B8CFF] dark:via-white to-transparent blur-[1px]"
             />
             <div className="z-10 rounded-full border border-slate-200 bg-white/50 p-3 backdrop-blur-md dark:border-slate-700 dark:bg-[#111827]/50 shadow-sm relative overflow-hidden">
               <span className="text-xs font-bold text-slate-400 dark:text-slate-500 relative z-10">OR</span>
             </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 w-full max-w-md mx-auto"
          >
             <JourneyCard
              type="corporate"
              title="Corporate"
              desc="Designed for professionals. Track deep work sessions, auto-categorize app usage across client projects, and seamlessly sync with your work calendar."
              icon={Briefcase}
              badge="For Professionals"
              color="violet"
              selected={selected}
              onClick={setSelected}
            />
          </motion.div>
        </div>

        {/* Continue Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 w-full flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selected}
            variant={selected ? "primary" : "secondary"}
            magnetic={!!selected}
            className={cn(
              "w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-2xl transition-all duration-500",
              selected 
                ? (selected === 'student' ? "bg-gradient-to-r from-[#5B8CFF] to-blue-600 shadow-[0_0_30px_rgba(91,140,255,0.4)]" : "bg-gradient-to-r from-[#7C3AED] to-violet-600 shadow-[0_0_30px_rgba(124,58,237,0.4)]")
                : "opacity-50 cursor-not-allowed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            <span>Continue Setup</span>
            <ArrowRight className={cn("transition-transform", selected && "animate-pulse ml-2")} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
