import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings as SettingsIcon, Zap, Eye, Bell, Sliders } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../utils";

interface DistractionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: DistractionSettings) => void;
}

export interface DistractionSettings {
  enableDistractionDetection: boolean;
  alertNotifications: boolean;
  soundAlerts: boolean;
  muteGamers: boolean;
  allowlistMode: boolean;
  blocklistMode: boolean;
  customBlockWords: string[];
}

export const DistractionSettings: React.FC<DistractionSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<DistractionSettings>({
    enableDistractionDetection: true,
    alertNotifications: true,
    soundAlerts: false,
    muteGamers: false,
    allowlistMode: true,
    blocklistMode: false,
    customBlockWords: [],
  });

  const [newBlockWord, setNewBlockWord] = useState("");

  const handleSave = () => {
    localStorage.setItem("distractionSettings", JSON.stringify(settings));
    onSave?.(settings);
    onClose();
  };

  const toggleSetting = (key: keyof DistractionSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addBlockWord = () => {
    if (newBlockWord.trim()) {
      setSettings((prev) => ({
        ...prev,
        customBlockWords: [...prev.customBlockWords, newBlockWord.trim()],
      }));
      setNewBlockWord("");
    }
  };

  const removeBlockWord = (word: string) => {
    setSettings((prev) => ({
      ...prev,
      customBlockWords: prev.customBlockWords.filter((w) => w !== word),
    }));
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className={cn(
              "rounded-3xl border overflow-hidden shadow-2xl",
              "bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90",
              "border-slate-700/50"
            )}>
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SettingsIcon className="h-6 w-6 text-[#5B8CFF]" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Distraction Settings</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Customize alert behavior</p>
                  </div>
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
                {/* Core Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-400" />
                    Core Settings
                  </h3>

                  <SettingToggle
                    label="Enable Distraction Detection"
                    description="Monitor active applications during focus sessions"
                    checked={settings.enableDistractionDetection}
                    onChange={(val) => toggleSetting("enableDistractionDetection", val)}
                  />

                  <SettingToggle
                    label="Alert Notifications"
                    description="Show popup alerts when distracted"
                    checked={settings.alertNotifications}
                    onChange={(val) => toggleSetting("alertNotifications", val)}
                    disabled={!settings.enableDistractionDetection}
                  />

                  <SettingToggle
                    label="Sound Alerts"
                    description="Play notification sound on distraction"
                    checked={settings.soundAlerts}
                    onChange={(val) => toggleSetting("soundAlerts", val)}
                    disabled={!settings.enableDistractionDetection}
                  />
                </div>

                {/* Detection Mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    Detection Mode
                  </h3>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors">
                      <input
                        type="radio"
                        name="mode"
                        checked={settings.allowlistMode}
                        onChange={() => {
                          toggleSetting("allowlistMode", true);
                          toggleSetting("blocklistMode", false);
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-white">Allowlist Mode</p>
                        <p className="text-xs text-slate-400">Only allow specified productive apps</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors">
                      <input
                        type="radio"
                        name="mode"
                        checked={settings.blocklistMode}
                        onChange={() => {
                          toggleSetting("allowlistMode", false);
                          toggleSetting("blocklistMode", true);
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-white">Blocklist Mode</p>
                        <p className="text-xs text-slate-400">Block specific distracting apps</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Block Words */}
                {settings.blocklistMode && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-red-400" />
                      Custom Block Words
                    </h3>
                    <p className="text-sm text-slate-400">
                      Add keywords to automatically block URLs containing these words
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBlockWord}
                        onChange={(e) => setNewBlockWord(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addBlockWord()}
                        placeholder="e.g., reddit, YouTube..."
                        className={cn(
                          "flex-1 px-4 py-2 rounded-lg",
                          "bg-slate-800/50 border border-slate-700/50",
                          "text-white placeholder-slate-500",
                          "focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        )}
                      />
                      <Button
                        onClick={addBlockWord}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {settings.customBlockWords.map((word) => (
                        <motion.div
                          key={word}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30"
                        >
                          <span className="text-red-400 text-sm">{word}</span>
                          <button
                            onClick={() => removeBlockWord(word)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">💡 Tip:</strong> Distraction detection works best when configured during focus session setup. Higher sensitivity means quicker alerts.
                  </p>
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
                  className="px-6 py-3 bg-gradient-to-r from-[#5B8CFF] to-cyan-500 hover:from-[#5B8CFF]/80 hover:to-cyan-500/80 text-white font-semibold"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface SettingToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => (
  <motion.div
    className={cn(
      "p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-between",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div>
      <p className="font-medium text-white">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        checked ? "bg-emerald-500" : "bg-slate-700",
        disabled && "cursor-not-allowed"
      )}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
      />
    </button>
  </motion.div>
);
