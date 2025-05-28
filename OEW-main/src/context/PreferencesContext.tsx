import React, { createContext, useContext, useState } from "react";

interface Preferences {
  theme: string;
  language: string;
  // ...add more as needed
}

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
}

// Create default values to avoid the "undefined" error
const defaultPreferences: Preferences = {
  theme: "light",
  language: "en",
};

// Provide default values in the context creation
const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  setPreferences: () => {}, // No-op function as default
});

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  // We can remove the error check since we now have default values
  return context;
};
