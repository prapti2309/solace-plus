"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type MoodType = "calm" | "happy" | "sad" | "anxious" | "angry" | "burnout" | "hopeful";

interface ThemeContextType {
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  activePersona: "listener" | "coach" | "motivator" | "guide";
  setActivePersona: (persona: "listener" | "coach" | "motivator" | "guide") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<MoodType>("calm");
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(false);
  const [activePersona, setActivePersonaState] = useState<"listener" | "coach" | "motivator" | "guide">("listener");

  // Synchronize CSS class with HTML root
  const setMood = (newMood: MoodType) => {
    setMoodState(newMood);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      // Remove all mood classes
      root.classList.remove(
        "mood-calm",
        "mood-happy",
        "mood-sad",
        "mood-anxious",
        "mood-angry",
        "mood-burnout",
        "mood-hopeful"
      );
      // Add current mood class
      root.classList.add(`mood-${newMood}`);
      localStorage.setItem("solace_mood", newMood);
    }
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("solace_reduced_motion", JSON.stringify(val));
    }
  };

  const setVoiceEnabled = (val: boolean) => {
    setVoiceEnabledState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("solace_voice_enabled", JSON.stringify(val));
    }
  };

  const setActivePersona = (persona: "listener" | "coach" | "motivator" | "guide") => {
    setActivePersonaState(persona);
    if (typeof window !== "undefined") {
      localStorage.setItem("solace_persona", persona);
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMood = localStorage.getItem("solace_mood") as MoodType;
      if (storedMood) {
        setMood(storedMood);
      } else {
        setMood("calm");
      }

      const storedReducedMotion = localStorage.getItem("solace_reduced_motion");
      if (storedReducedMotion !== null) {
        setReducedMotionState(JSON.parse(storedReducedMotion));
      }

      const storedVoiceEnabled = localStorage.getItem("solace_voice_enabled");
      if (storedVoiceEnabled !== null) {
        setVoiceEnabledState(JSON.parse(storedVoiceEnabled));
      }

      const storedPersona = localStorage.getItem("solace_persona") as any;
      if (storedPersona) {
        setActivePersonaState(storedPersona);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mood,
        setMood,
        reducedMotion,
        setReducedMotion,
        voiceEnabled,
        setVoiceEnabled,
        activePersona,
        setActivePersona,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useEmotionTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useEmotionTheme must be used within a ThemeProvider");
  }
  return context;
};
