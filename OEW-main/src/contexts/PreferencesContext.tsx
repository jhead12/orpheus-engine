import React, { createContext, useState, useContext } from 'react';

interface PreferencesContextType {
  showPreferences: boolean;
  setShowPreferences: (show: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <PreferencesContext.Provider value={{ showPreferences, setShowPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
