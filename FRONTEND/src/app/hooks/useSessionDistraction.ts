/**
 * useSessionDistraction - Hook for session-aware distraction alerting
 * Only fires when a session is active and activity doesn't match intent.
 * Triggers escalating alerts: 20s soft → 40s strong → 60s meme
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "../context/SessionContext";

export type AlertLevel = "none" | "soft" | "strong" | "meme";

interface DistractionAlertState {
  alertLevel: AlertLevel;
  distractingApp: string;
  taskName: string;
  distractionSeconds: number;
}

export function useSessionDistraction() {
  const { session } = useSession();
  const [alertState, setAlertState] = useState<DistractionAlertState>({
    alertLevel: "none",
    distractingApp: "",
    taskName: "",
    distractionSeconds: 0,
  });

  const lastAlertLevelRef = useRef<AlertLevel>("none");

  // Watch session distraction seconds and escalate alerts
  useEffect(() => {
    if (!session.isActive) {
      // Reset when session is not active
      if (alertState.alertLevel !== "none") {
        setAlertState({
          alertLevel: "none",
          distractingApp: "",
          taskName: "",
          distractionSeconds: 0,
        });
        lastAlertLevelRef.current = "none";
      }
      return;
    }

    const secs = session.distractionSeconds;
    let newLevel: AlertLevel = "none";

    if (secs >= 60) {
      newLevel = "meme";
    } else if (secs >= 40) {
      newLevel = "strong";
    } else if (secs >= 20) {
      newLevel = "soft";
    } else {
      newLevel = "none";
    }

    // Only update if level changed
    if (newLevel !== lastAlertLevelRef.current) {
      lastAlertLevelRef.current = newLevel;
      setAlertState({
        alertLevel: newLevel,
        distractingApp: session.currentWindowTitle,
        taskName: session.taskName,
        distractionSeconds: secs,
      });
    }
  }, [session.isActive, session.distractionSeconds, session.currentWindowTitle, session.taskName]);

  const dismissAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      alertLevel: "none",
    }));
    lastAlertLevelRef.current = "none";
  }, []);

  return {
    alertLevel: alertState.alertLevel,
    distractingApp: alertState.distractingApp,
    taskName: alertState.taskName,
    distractionSeconds: alertState.distractionSeconds,
    dismissAlert,
    isAlertActive: alertState.alertLevel !== "none",
  };
}
