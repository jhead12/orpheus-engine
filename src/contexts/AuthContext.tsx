/**
 * Authentication Context Provider
 * Manages user authentication state and session management
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { User, AuthCredentials, AuthState, Session } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

// Auth reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(
    async (credentials: AuthCredentials): Promise<void> => {
      try {
        dispatch({ type: 'AUTH_START' });

        // Simulate API call - replace with actual authentication service
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock successful authentication
        if (
          credentials.username === 'demo' &&
          credentials.password === 'demo'
        ) {
          const user: User = {
            id: '1',
            username: credentials.username,
            email: 'demo@orpheus-engine.com',
            displayName: 'Demo User',
            avatar: '/api/avatars/demo.jpg',
            createdAt: new Date('2024-01-01'),
            lastLoginAt: new Date(),
            preferences: {
              theme: 'dark',
              defaultSampleRate: 44100,
              defaultBufferSize: 512,
              autoSave: true,
              autoSaveInterval: 5,
              recentProjectsLimit: 10,
            },
          };

          // Store auth token in localStorage if remember me is checked
          if (credentials.rememberMe) {
            localStorage.setItem('orpheus_auth_token', 'demo_token_12345');
          }

          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          throw new Error('Invalid username or password');
        }
      } catch (error) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload:
            error instanceof Error ? error.message : 'Authentication failed',
        });
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear auth token
      localStorage.removeItem('orpheus_auth_token');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('orpheus_auth_token');
      if (!token) return;

      dispatch({ type: 'AUTH_START' });

      // Simulate token validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user retrieval from token
      if (token === 'demo_token_12345') {
        const user: User = {
          id: '1',
          username: 'demo',
          email: 'demo@orpheus-engine.com',
          displayName: 'Demo User',
          avatar: '/api/avatars/demo.jpg',
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'dark',
            defaultSampleRate: 44100,
            defaultBufferSize: 512,
            autoSave: true,
            autoSaveInterval: 5,
            recentProjectsLimit: 10,
          },
        };

        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        localStorage.removeItem('orpheus_auth_token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('orpheus_auth_token');
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuthStatus,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
