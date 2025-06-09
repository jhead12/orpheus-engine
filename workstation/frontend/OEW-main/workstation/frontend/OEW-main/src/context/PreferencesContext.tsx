import React, { createContext, useContext, useState, useEffect } from "react";
import { Preferences } from "../services/types/types";

interface PreferencesContextType {
  darkMode: boolean;
  preferences: Preferences;
  savePreferences: () => void;
  savedPreferences: Preferences;
  setShowPreferences: (show: boolean) => void;
  showPreferences: boolean;
  updatePreferences: (preferences: Preferences) => void;
}

const defaultPreferences: Preferences = {
  theme: "system",
  color: "rose",
  // Add other preferences as needed
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem("preferences");
    return saved ? JSON.parse(saved) : defaultPreferences;
  });
  const [savedPreferences, setSavedPreferences] =
    useState<Preferences>(preferences);
  const [showPreferences, setShowPreferences] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Update dark mode based on system preference or user setting
    const isDark =
      preferences.theme === "dark" ||
      (preferences.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
  }, [preferences.theme]);

  const savePreferences = () => {
    setSavedPreferences(preferences);
    localStorage.setItem("preferences", JSON.stringify(preferences));
  };

  const updatePreferences = (newPreferences: Preferences) => {
    setPreferences(newPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        darkMode,
        preferences,
        savePreferences,
        savedPreferences,
        setShowPreferences,
        showPreferences,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
