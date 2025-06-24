/**
 * Authentication and session types
 */

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  defaultSampleRate: number;
  defaultBufferSize: number;
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  recentProjectsLimit: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Session {
  id: string;
  name: string;
  description?: string;
  projectPath: string;
  lastModified: Date;
  createdAt: Date;
  thumbnail?: string;
  isTemplate: boolean;
  tags: string[];
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  sampleRate: number;
  bufferSize: number;
  trackCount: number;
  duration: number; // in seconds
  fileSize: number; // in bytes
  version: string;
}

export interface CreateSessionRequest {
  name: string;
  description?: string;
  templateId?: string;
  sampleRate?: number;
  bufferSize?: number;
}

export type AppScreen =
  | 'splash'
  | 'login'
  | 'sessions'
  | 'workstation'
  | 'settings';

export interface AppState {
  currentScreen: AppScreen;
  user: User | null;
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
}
