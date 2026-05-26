/**
 * Session Context - Core state management for task + intent system
 * Polls /current-app from Flask backend for REAL window titles.
 * NO mock simulation — only real data from tracker.py.
 */

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import {
  Intent,
  classifyActivity,
  calculateProductivityScore,
} from "../utils/productivityEngine";
import API_BASE from "../../config/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionState {
  taskName: string;
  intent: Intent | "";
  isActive: boolean;
  startTime: number | null;
  productiveTime: number;
  distractionTime: number;
  distractionSeconds: number;
  currentWindowTitle: string;
  currentClassification: "productive" | "distraction" | "neutral";
  elapsedSeconds: number;
}

export interface SessionHistory {
  id: string;
  taskName: string;
  intent: Intent;
  startTime: number;
  endTime: number;
  productiveTime: number;
  distractionTime: number;
  score: number;
}

interface SessionContextType {
  session: SessionState;
  sessionHistory: SessionHistory[];
  startSession: (taskName: string, intent: Intent) => void;
  endSession: () => SessionHistory | null;
  resetSession: () => void;
}

const defaultSession: SessionState = {
  taskName: "",
  intent: "",
  isActive: false,
  startTime: null,
  productiveTime: 0,
  distractionTime: 0,
  distractionSeconds: 0,
  currentWindowTitle: "",
  currentClassification: "neutral",
  elapsedSeconds: 0,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionState>(defaultSession);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>(() => {
    try {
      const stored = localStorage.getItem("worksense-session-history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store latest real window title in a ref — updated by polling, read by tick
  const realTitleRef = useRef<string>("");
  const sessionActiveRef = useRef(false);
  const sessionStartRef = useRef<number>(Date.now());
  const intentRef = useRef<Intent | "">("");

  // Persist history
  useEffect(() => {
    localStorage.setItem("worksense-session-history", JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  /**
   * Poll the backend for real window title (runs every 2 seconds, independent of tick)
   */
  const startPolling = useCallback(() => {
    // Poll immediately once
    const doFetch = () => {
      fetch(`${API_BASE}/current-app`)
        .then((res) => {
          if (!res.ok) throw new Error("not ok");
          return res.json();
        })
        .then((data) => {
          const title = data?.window_title;
          if (title && title.trim() !== "" && title !== "Unknown") {
            realTitleRef.current = title;
          }
        })
        .catch(() => {
          // Silently ignore — keep last known title
        });
    };

    doFetch();
    pollIntervalRef.current = setInterval(doFetch, 2000);
  }, []);

  /**
   * Start a new session
   */
  const startSession = useCallback((taskName: string, intent: Intent) => {
    // Clear any existing intervals
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    const now = Date.now();
    realTitleRef.current = "";
    sessionActiveRef.current = true;
    sessionStartRef.current = now;
    intentRef.current = intent;

    setSession({
      taskName,
      intent,
      isActive: true,
      startTime: now,
      productiveTime: 0,
      distractionTime: 0,
      distractionSeconds: 0,
      currentWindowTitle: "",
      currentClassification: "neutral",
      elapsedSeconds: 0,
    });

    if (import.meta.env.DEV) {
      console.log(
        `%c[WorkSense] Session started: "${taskName}" | Intent: ${intent}`,
        "color: #10B981; font-weight: bold;"
      );
    }

    // Start polling backend for real window titles
    startPolling();

    // Start 1-second tick — reads realTitleRef synchronously (no async, no race conditions)
    tickIntervalRef.current = setInterval(() => {
      if (!sessionActiveRef.current) return;

      const currentTitle = realTitleRef.current;
      const currentIntent = intentRef.current as Intent;
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);

      if (!currentIntent) return;

      // Classify using the productivity engine
      const classification = currentTitle
        ? classifyActivity(currentIntent, currentTitle)
        : "neutral";

      // Debug log every 5 seconds or on classification change
      setSession((prev) => {
        if (!prev.isActive) return prev;

        const changed = classification !== prev.currentClassification;
        const shouldLog = elapsed % 5 === 0 || changed;

        if (shouldLog && currentTitle && import.meta.env.DEV) {
          const icon =
            classification === "productive" ? "✅" :
            classification === "distraction" ? "🚨" : "⏸️";
          console.log(
            `%c[WorkSense] ${icon} [${currentIntent}] → "${currentTitle}" → ${classification.toUpperCase()}`,
            classification === "productive" ? "color: #10B981" :
            classification === "distraction" ? "color: #EF4444; font-weight: bold" :
            "color: #94A3B8"
          );
        }

        const newProductiveTime = prev.productiveTime + (classification === "productive" ? 1 : 0);
        const newDistractionTime = prev.distractionTime + (classification === "distraction" ? 1 : 0);
        const newDistractionSeconds =
          classification === "distraction" ? prev.distractionSeconds + 1 : 0;

        return {
          ...prev,
          elapsedSeconds: elapsed,
          currentWindowTitle: currentTitle || prev.currentWindowTitle,
          currentClassification: classification,
          productiveTime: newProductiveTime,
          distractionTime: newDistractionTime,
          distractionSeconds: newDistractionSeconds,
        };
      });
    }, 1000);
  }, [startPolling]);

  /**
   * End the current session and save to history
   */
  const endSession = useCallback((): SessionHistory | null => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    sessionActiveRef.current = false;

    let result: SessionHistory | null = null;

    setSession((prev) => {
      if (!prev.isActive || !prev.intent) return defaultSession;

      const totalTime = prev.productiveTime + prev.distractionTime;
      const score = calculateProductivityScore(
        prev.productiveTime,
        totalTime > 0 ? totalTime : prev.elapsedSeconds
      );

      const historyEntry: SessionHistory = {
        id: `session-${Date.now()}`,
        taskName: prev.taskName,
        intent: prev.intent as Intent,
        startTime: prev.startTime ?? Date.now(),
        endTime: Date.now(),
        productiveTime: prev.productiveTime,
        distractionTime: prev.distractionTime,
        score,
      };

      result = historyEntry;

      if (import.meta.env.DEV) {
        console.log(
          `%c[WorkSense] Session ended: "${prev.taskName}" | Score: ${score}%`,
          "color: #5B8CFF; font-weight: bold;"
        );
      }

      setSessionHistory((h) => [...h, historyEntry]);

      return defaultSession;
    });

    return result;
  }, []);

  /**
   * Reset session without saving
   */
  const resetSession = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    sessionActiveRef.current = false;
    setSession(defaultSession);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionHistory,
        startSession,
        endSession,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
