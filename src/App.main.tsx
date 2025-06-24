import React, { useState, useEffect } from 'react';
import SplashScreen from './components/auth/SplashScreen';
import LoginScreen from './components/auth/LoginScreen';
import SessionScreen from './components/auth/SessionScreen';
import Workstation from './screens/workstation/Workstation';
import './styles/App.css';

export type AppState = 'splash' | 'login' | 'session' | 'workstation';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'dark' | 'light';
    autoSave: boolean;
    defaultSampleRate: number;
  };
}

export interface Session {
  id: string;
  name: string;
  lastModified: Date;
  projectCount: number;
  thumbnail?: string;
}

function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    // Simulate splash screen duration
    const timer = setTimeout(() => {
      // Check if user is already logged in (from localStorage/sessionStorage)
      const savedUser = localStorage.getItem('orpheus_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setAppState('session');
      } else {
        setAppState('login');
      }
    }, 3000); // 3 second splash

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('orpheus_user', JSON.stringify(user));
    setAppState('session');
  };

  const handleSessionSelect = (session: Session) => {
    setCurrentSession(session);
    setAppState('workstation');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSession(null);
    localStorage.removeItem('orpheus_user');
    setAppState('login');
  };

  const handleBackToSessions = () => {
    setCurrentSession(null);
    setAppState('session');
  };

  switch (appState) {
    case 'splash':
      return <SplashScreen />;

    case 'login':
      return <LoginScreen onLogin={handleLogin} />;

    case 'session':
      return (
        <SessionScreen
          user={currentUser!}
          onSessionSelect={handleSessionSelect}
          onLogout={handleLogout}
        />
      );

    case 'workstation':
      return (
        <Workstation
          user={currentUser!}
          session={currentSession!}
          onBackToSessions={handleBackToSessions}
          onLogout={handleLogout}
        />
      );

    default:
      return <SplashScreen />;
  }
}

export default App;
