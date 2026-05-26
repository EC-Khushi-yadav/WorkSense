import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", magnetic = false, children, ...props },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;
      const { clientX, clientY } = e;
      const { height, width, left, top } = buttonRef.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const handleMouseLeave = () => {
      if (!magnetic) return;
      setPosition({ x: 0, y: 0 });
    };

    const variants = {
      primary: "relative overflow-hidden bg-gradient-to-r from-[#5B8CFF] to-[#4F46E5] text-white shadow-[0_0_20px_rgba(91,140,255,0.4)] border-none group",
      secondary: "relative overflow-hidden bg-white/5 dark:bg-[#111827]/30 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-[#5B8CFF]/50 shadow-sm group",
      outline: "border-2 border-[#5B8CFF] text-[#5B8CFF] hover:bg-[#5B8CFF]/10",
      ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-xl",
      md: "px-5 py-2.5 text-base rounded-2xl",
      lg: "px-8 py-4 text-lg font-medium rounded-2xl",
    };

    return (
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        className={cn(
          "flex items-center justify-center gap-2 transition-all",
          variants[variant],
          sizes[size],
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={magnetic ? { x: position.x, y: position.y } : undefined}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {variant === "primary" && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            animate={{ x: ["-200%", "300%"] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
          />
        )}
        {variant === "secondary" && (
          <div className="pointer-events-none absolute inset-0 z-0 bg-[#5B8CFF] opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";
