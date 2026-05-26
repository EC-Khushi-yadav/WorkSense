import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../utils";

export interface TaskConfig {
  taskName: string;
  taskDescription: string;
  allowedApps: string[];
  distractingApps: string[];
  alertSensitivity: "low" | "medium" | "high";
  enableMemeAlerts: boolean;
  distractionThreshold: number; // seconds
}

interface TaskConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TaskConfig) => void;
  initialConfig?: TaskConfig;
}

const DEFAULT_ALLOWED_APPS = [
  "VS Code",
  "Visual Studio",
  "IntelliJ IDEA",
  "Figma",
  "Notion",
  "Obsidian",
];

const DEFAULT_DISTRACTING_APPS = [
  "Twitter/X",
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "Netflix",
  "Discord",
  "Slack",
];

export const TaskConfigModal: React.FC<TaskConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [taskName, setTaskName] = useState(initialConfig?.taskName || "");
  const [taskDescription, setTaskDescription] = useState(
    initialConfig?.taskDescription || ""
  );
  const [allowedApps, setAllowedApps] = useState<string[]>(
    initialConfig?.allowedApps || DEFAULT_ALLOWED_APPS
  );
  const [distractingApps, setDisstractingApps] = useState<string[]>(
    initialConfig?.distractingApps || DEFAULT_DISTRACTING_APPS
  );
  const [alertSensitivity, setAlertSensitivity] = useState<"low" | "medium" | "high">(
    initialConfig?.alertSensitivity || "medium"
  );
  const [enableMemeAlerts, setEnableMemeAlerts] = useState(
    initialConfig?.enableMemeAlerts ?? true
  );
  const [threshold, setThreshold] = useState(initialConfig?.distractionThreshold || 30);
  const [newApp, setNewApp] = useState("");
  const [activeTab, setActiveTab] = useState<"allowed" | "distracting">("allowed");

  const handleSave = () => {
    onSave({
      taskName,
      taskDescription,
      allowedApps,
      distractingApps,
      alertSensitivity,
      enableMemeAlerts,
      distractionThreshold: threshold,
    });
  };

  const addApp = () => {
    if (newApp.trim()) {
      if (activeTab === "allowed") {
        setAllowedApps([...allowedApps, newApp.trim()]);
      } else {
        setDisstractingApps([...distractingApps, newApp.trim()]);
      }
      setNewApp("");
    }
  };

  const removeApp = (app: string, type: "allowed" | "distracting") => {
    if (type === "allowed") {
      setAllowedApps(allowedApps.filter((a) => a !== app));
    } else {
      setDisstractingApps(distractingApps.filter((a) => a !== app));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className={cn(
              "rounded-3xl border overflow-hidden shadow-2xl",
              "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90",
              "border-slate-700/50"
            )}>
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Configure Task</h2>
                  <p className="text-sm text-slate-400 mt-1">Define your focus session parameters</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Task Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Task Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      placeholder="e.g., Design Homepage"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-slate-800/50 border border-slate-700/50",
                        "text-white placeholder-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-[#5B8CFF]/50",
                        "transition-all duration-200"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Task Description (optional)
                    </label>
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="What are you trying to accomplish?"
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-slate-800/50 border border-slate-700/50",
                        "text-white placeholder-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-[#5B8CFF]/50",
                        "transition-all duration-200 resize-none"
                      )}
                    />
                  </div>
                </div>

                {/* App Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Application Management</h3>

                  {/* Tabs */}
                  <div className="flex gap-2 bg-slate-800/30 p-1 rounded-xl border border-slate-700/50">
                    {(["allowed", "distracting"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                          activeTab === tab
                            ? "bg-slate-700 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-300"
                        )}
                      >
                        {tab === "allowed" ? "✅ Allowed Apps" : "⚠️ Distracting Apps"}
                      </button>
                    ))}
                  </div>

                  {/* App Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newApp}
                      onChange={(e) => setNewApp(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addApp()}
                      placeholder={`Add ${activeTab === "allowed" ? "allowed" : "distracting"} app...`}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg",
                        "bg-slate-800/50 border border-slate-700/50",
                        "text-white placeholder-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-[#5B8CFF]/50"
                      )}
                    />
                    <Button
                      onClick={addApp}
                      className="px-4 py-2 bg-[#5B8CFF] hover:bg-[#5B8CFF]/80 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Apps List */}
                  <div className="flex flex-wrap gap-2">
                    {(activeTab === "allowed" ? allowedApps : distractingApps).map((app) => (
                      <motion.div
                        key={app}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg",
                          activeTab === "allowed"
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : "bg-red-500/20 border border-red-500/30"
                        )}
                      >
                        <span className={activeTab === "allowed" ? "text-emerald-400" : "text-red-400"}>
                          {app}
                        </span>
                        <button
                          onClick={() => removeApp(app, activeTab)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3 text-slate-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Alert Settings</h3>

                  {/* Sensitivity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Alert Sensitivity: <span className="text-[#5B8CFF]">{alertSensitivity}</span>
                    </label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setAlertSensitivity(level)}
                          className={cn(
                            "flex-1 px-4 py-2 rounded-lg font-medium transition-all border",
                            alertSensitivity === level
                              ? "bg-[#5B8CFF] border-[#5B8CFF] text-white shadow-lg"
                              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Distraction Threshold: <span className="text-amber-400">{threshold}s</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="10"
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Alerts trigger after this duration on a distracting app
                    </p>
                  </div>

                  {/* Meme Toggle */}
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Humor-Based Intervention</p>
                      <p className="text-sm text-slate-400">Show meme alerts at Stage 3</p>
                    </div>
                    <button
                      onClick={() => setEnableMemeAlerts(!enableMemeAlerts)}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors",
                        enableMemeAlerts ? "bg-emerald-500" : "bg-slate-700"
                      )}
                    >
                      <motion.div
                        animate={{ x: enableMemeAlerts ? 24 : 2 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex gap-3 justify-end">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
