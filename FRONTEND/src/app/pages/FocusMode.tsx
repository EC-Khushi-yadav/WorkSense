import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Square, X, Maximize2, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "../components/Button";
import { DistractionMonitor } from "../components/DistractionAlerts";
import { TaskConfigModal, TaskConfig } from "../components/DistractionAlerts/TaskConfigModal";
import { useMode } from "../context/ModeContext";
import { cn } from "../utils";
import API_BASE from "../../config/api";

export const FocusMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useMode();
  const isStudent = mode === "student";

  // FIX 8: Page title
  useEffect(() => { document.title = "WorkSense — Focus Mode"; }, []);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentApp, setCurrentApp] = useState(""); // Populated by backend polling
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskConfig, setTaskConfig] = useState<TaskConfig | null>(null);

  // Initialize with session data from Dashboard if provided
  useEffect(() => {
    const state = (location.state as any);
    if (state?.sessionId) {
      setSessionId(state.sessionId);
      if (state?.duration) {
        setTimeLeft(state.duration);
      }
      setIsActive(true);
    }
  }, [location.state]);

  // Poll for current app in real-time from tracker
  useEffect(() => {
    if (!isActive) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/current-app`);
        if (response.ok) {
          const data = await response.json();
          setCurrentApp(data.window_title || "Unknown");
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to fetch current app:", err);
      }
    }, 500); // Poll every 500ms for real-time feel

    return () => clearInterval(pollInterval);
  }, [isActive]);

  // Start a new session with task configuration
  const startSession = async (config?: TaskConfig) => {
    try {
      setLoading(true);
      
      const configToUse = config || taskConfig;
      if (!configToUse) {
        setShowTaskModal(true);
        return;
      }
      
      // Use task-aware session endpoint
      const response = await fetch(`${API_BASE}/session/start-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: timeLeft,
          taskName: configToUse.taskName,
          taskDescription: configToUse.taskDescription,
          allowedApps: configToUse.allowedApps,
          distractingApps: configToUse.distractingApps,
          alertSensitivity: configToUse.alertSensitivity,
          enableMemeAlerts: configToUse.enableMemeAlerts,
          distractionThreshold: configToUse.distractionThreshold
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        setTaskConfig(configToUse);
        setIsActive(true);
        setShowTaskModal(false);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Failed to start session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle task config submission from modal
  const handleTaskConfigSave = (config: TaskConfig) => {
    setTaskConfig(config);
    localStorage.setItem("taskConfig", JSON.stringify(config));
    startSession(config);
  };

  // End session with task awareness
  const endSession = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/session/end-task/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to end session:", err);
      }
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      endSession();
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isActive, timeLeft, sessionId]);

  const toggleTimer = async () => {
    if (!isActive && !sessionId) {
      // If no task config, show modal first
      if (!taskConfig) {
        setShowTaskModal(true);
      } else {
        await startSession(taskConfig);
      }
    } else {
      setIsActive(!isActive);
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    endSession();
    setSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Immersive layout takes over the whole screen (using fixed positioning)
  return (
    <>
      {/* Task Configuration Modal */}
      <TaskConfigModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskConfigSave}
      />

      {/* Distraction Monitoring System */}
      <DistractionMonitor
        sessionActive={isActive}
        sessionDuration={timeLeft}
        currentApp={currentApp}
        sessionId={sessionId}
        taskConfig={taskConfig}
        onTaskConfig={(config) => handleTaskConfigSave(config)}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center text-white", isStudent ? "bg-[#050B14]" : "bg-[#0B1120]")}
      >
      {/* Soft pulsating background when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isStudent ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: isStudent ? 4 : 8, ease: "easeInOut" }}
            className={cn(
              "pointer-events-none absolute inset-0", 
              isStudent 
                ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#5B8CFF]/20 via-transparent to-transparent" 
                : "bg-gradient-to-b from-slate-800/20 to-transparent"
            )}
          />
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-8 flex gap-2 items-center text-white/50 font-medium">
        {isStudent ? <GraduationCap className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
        <span>{isStudent ? "Study Session" : "Deep Work Session"}</span>
      </div>

      <div className="absolute top-8 right-8 flex gap-4 z-10">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors text-red-400 hover:text-red-300"
          aria-label="Exit focus mode"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="z-10 text-center">
        <motion.div
          aria-live="polite"
          aria-atomic="true"
          animate={{ scale: isActive ? (isStudent ? 1.02 : 1.01) : 1 }}
          transition={{ repeat: isActive ? Infinity : 0, repeatType: "reverse", duration: isStudent ? 2 : 4 }}
          className="mb-12 font-mono text-[8rem] md:text-[12rem] font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
          style={{ textShadow: isActive && isStudent ? '0 0 80px rgba(91,140,255,0.4)' : 'none' }}
        >
          {formatTime(timeLeft)}
        </motion.div>

        <div className="flex items-center justify-center gap-6">
          {isActive ? (
             <Button onClick={toggleTimer} variant={isStudent ? "secondary" : "ghost"} size="lg" className={cn("rounded-full h-20 w-20 p-0", isStudent ? "shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)]" : "bg-white/10 hover:bg-white/20")}>
               <Pause className="h-8 w-8 fill-current" />
             </Button>
          ) : (
             <Button 
               onClick={toggleTimer} 
               disabled={loading}
               variant={isStudent ? "primary" : "secondary"} 
               size="lg" 
               className={cn("rounded-full h-20 w-20 p-0", isStudent ? "shadow-[0_0_30px_rgba(91,140,255,0.5)] hover:shadow-[0_0_50px_rgba(91,140,255,0.7)]" : "bg-white text-black hover:bg-slate-200")}
             >
               {loading ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                   <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent" />
                 </motion.div>
               ) : (
                 <>
                   <Play className="h-8 w-8 fill-current ml-2" />
                 </>
               )}
             </Button>
          )}

          <button
            onClick={resetTimer}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 text-white"
          >
            <Square className="h-6 w-6" />
          </button>
        </div>
        
        <p className="mt-12 text-lg text-slate-400 font-medium tracking-wide">
          {isActive ? "Deep work session in progress..." : "Ready to focus?"}
        </p>
      </div>
    </motion.div>
    </>
  );
};
