import React, { createContext, useContext, useEffect, useState } from "react";

type Mode = "student" | "corporate";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("student");

  useEffect(() => {
    const savedMode = localStorage.getItem("worksense-mode") as Mode;
    if (savedMode && (savedMode === "student" || savedMode === "corporate")) {
      setMode(savedMode);
    }
  }, []);

  const handleSetMode = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem("worksense-mode", newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
