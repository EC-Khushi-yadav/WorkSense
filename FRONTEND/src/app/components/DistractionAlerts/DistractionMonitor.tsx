import React, { useState, useEffect, useCallback } from "react";
import { SoftWarning } from "./SoftWarning";
import { StrongWarning } from "./StrongWarning";
import { MemeAlert } from "./MemeAlert";
import { TaskConfigModal, TaskConfig } from "./TaskConfigModal";

export interface DistractionMonitorProps {
  sessionActive: boolean;
  sessionDuration?: number;
  currentApp?: string;
  sessionId?: string | null;
  taskConfig?: TaskConfig | null;
  onTaskConfig?: (config: TaskConfig) => void;
  memeImageUrl?: string;
}

export interface DistractionState {
  stage: 0 | 1 | 2 | 3;
  distractingAppName: string;
  distractionSeconds: number;
  totalDistractions: number;
  isBlocked: boolean;
}

export const DistractionMonitor: React.FC<DistractionMonitorProps> = ({
  sessionActive,
  sessionDuration = 1500,
  currentApp = "",
  sessionId,
  taskConfig: propsTaskConfig,
  onTaskConfig,
  memeImageUrl,
}) => {
  const [distractionState, setDistractionState] = useState<DistractionState>({
    stage: 0,
    distractingAppName: "",
    distractionSeconds: 0,
    totalDistractions: 0,
    isBlocked: false,
  });

  const [taskConfig, setTaskConfig] = useState<TaskConfig | null>(propsTaskConfig || null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Use task config from props or localStorage
  useEffect(() => {
    if (propsTaskConfig) {
      setTaskConfig(propsTaskConfig);
      localStorage.setItem("taskConfig", JSON.stringify(propsTaskConfig));
      return;
    }

    const saved = localStorage.getItem("taskConfig");
    if (saved) {
      try {
        setTaskConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load task config:", e);
      }
    }
  }, [propsTaskConfig]);

  // Helper function to check if app is blocked based on task config
  const isAppBlocked = (appName: string, config: TaskConfig): boolean => {
    const appLower = appName.toLowerCase();
    
    // If app is in allowed list, it's NOT blocked
    const isAllowed = config.allowedApps.some(
      (allowed) => allowed.toLowerCase().includes(appLower) || appLower.includes(allowed.toLowerCase())
    );
    
    if (isAllowed) return false;
    
    // Strict fallback: If it's not allowed, it's a distraction!
    return true;
  };

  // Distraction detection logic
  useEffect(() => {
    if (!sessionActive || !taskConfig) return;

    const interval = setInterval(() => {
      const isDistracting = isAppBlocked(currentApp, taskConfig);

      setDistractionState((prev) => {
        if (isDistracting && !isReturning) {
          const newSeconds = prev.distractionSeconds + 1;
          const threshold = taskConfig.distractionThreshold;

          let newStage = prev.stage;

          // Sensitivity-aware stage progression
          const sensitivityMultiplier = taskConfig.alertSensitivity === "high" ? 0.5 : 
                                       taskConfig.alertSensitivity === "low" ? 2 : 1;

          if (newSeconds === threshold * sensitivityMultiplier && newStage < 1) {
            // Soft Warning
            newStage = 1;
          } else if (newSeconds === threshold * 1.5 * sensitivityMultiplier && newStage < 2) {
            // Strong Warning
            newStage = 2;
          } else if (newSeconds >= threshold * 2.5 * sensitivityMultiplier && newStage < 3) {
            // Meme Alert
            newStage = taskConfig.enableMemeAlerts ? 3 : 0;
          }

          return {
            ...prev,
            distractingAppName: currentApp,
            distractionSeconds: newSeconds,
            stage: newStage,
            isBlocked: true,
          };
        } else if (!isDistracting && prev.stage > 0) {
          // Reset when user returns to allowed app
          return {
            stage: 0,
            distractingAppName: "",
            distractionSeconds: 0,
            totalDistractions: prev.totalDistractions + (prev.stage > 0 ? 1 : 0),
            isBlocked: false,
          };
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, taskConfig, currentApp, isReturning]);

  const handleConfigSave = (config: TaskConfig) => {
    setTaskConfig(config);
    localStorage.setItem("taskConfig", JSON.stringify(config));
    setShowConfigModal(false);
    onTaskConfig?.(config);
  };

  const handleReturnToWork = () => {
    setIsReturning(true);
    setDistractionState((prev) => ({
      ...prev,
      stage: 0,
      distractionSeconds: 0,
    }));

    setTimeout(() => setIsReturning(false), 2000);
  };

  const handleStartFocusMode = () => {
    handleReturnToWork();
    // Navigate to focus mode (handled by parent)
  };

  const handleDismissMeme = () => {
    handleReturnToWork();
  };

  return (
    <>
      {/* Soft Warning - Stage 1 */}
      <SoftWarning
        isVisible={distractionState.stage === 1}
        onDismiss={() => {
          setDistractionState((prev) => ({ ...prev, stage: 0 }));
        }}
      />

      {/* Strong Warning - Stage 2 */}
      <StrongWarning
        isVisible={distractionState.stage === 2}
        distractingApp={distractionState.distractingAppName}
        taskName={taskConfig?.taskName}
        onReturn={handleReturnToWork}
        onStartFocus={handleStartFocusMode}
      />

      {/* Meme Alert - Stage 3 */}
      <MemeAlert
        isVisible={distractionState.stage === 3}
        taskName={taskConfig?.taskName}
        distractingApp={distractionState.distractingAppName}
        onDismiss={handleDismissMeme}
        memeImageUrl={memeImageUrl}
      />

      {/* Task Configuration Modal */}
      <TaskConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          if (taskConfig) setShowConfigModal(false);
        }}
        onSave={handleConfigSave}
        initialConfig={taskConfig || undefined}
      />
    </>
  );
};
