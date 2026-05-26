import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export const TiltCard = ({ children, className }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse positions to rotation degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize values between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative perspective-1000 group", className)}
    >
      {/* Soft pulsing glow expanding from behind */}
      <div className="absolute inset-0 z-0 rounded-[inherit] bg-cyan-500/0 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:bg-cyan-500/20 group-hover:blur-2xl dark:group-hover:bg-cyan-400/15" />

      <div 
        className="relative z-10 w-full h-full rounded-[inherit] overflow-hidden transition-all duration-500 ease-out bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group-hover:border-cyan-500/50 group-hover:shadow-[0_8px_30px_-4px_rgba(6,182,212,0.4)]"
        style={{ transform: "translateZ(12px)" }}
      >
        {/* Light sweep effect */}
        <div className="absolute inset-0 z-20 -translate-x-[150%] skew-x-[-20deg] w-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[100%]" />

        {/* Elegant subtle overlay on hover */}
        <div className="pointer-events-none absolute inset-0 z-50 rounded-[inherit] transition-colors duration-500 group-hover:bg-cyan-900/[0.05] ring-1 ring-inset ring-transparent group-hover:ring-cyan-400/30" />
        
        {/* Wrapper to target children svgs/icons for the contour fill */}
        <div className="relative z-30 h-full w-full [&_svg]:transition-all [&_svg]:duration-500 [&_svg]:ease-out [&_svg]:text-blue-500/60 group-hover:[&_svg]:text-cyan-400 group-hover:[&_svg]:fill-cyan-400 group-hover:[&_svg]:drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
