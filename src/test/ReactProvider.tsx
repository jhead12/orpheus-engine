/**
 * This is a helper component to ensure React hooks use the correct React instance
 * It's used to wrap test components to prevent the "Cannot read properties of null (reading 'useState')" error
 */
import React, { ReactNode } from 'react';

// Create a context that stores the correct React instance
export const ReactInstanceContext = React.createContext<{
  React: typeof React;
  useState: typeof React.useState;
  useEffect: typeof React.useEffect;
  useRef: typeof React.useRef;
  useCallback: typeof React.useCallback;
  useMemo: typeof React.useMemo;
  useContext: typeof React.useContext;
  useReducer: typeof React.useReducer;
} | null>(null);

interface ReactProviderProps {
  children: ReactNode;
}

export const ReactProvider: React.FC<ReactProviderProps> = ({ children }) => {
  // Provide all the React hooks that might be used
  const value = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useContext: React.useContext,
    useReducer: React.useReducer,
  };

  return (
    <ReactInstanceContext.Provider value={value}>
      {children}
    </ReactInstanceContext.Provider>
  );
};

// Custom hook to get the correct React instance
export const useReactInstance = () => {
  const context = React.useContext(ReactInstanceContext);
  if (!context) {
    throw new Error('useReactInstance must be used within a ReactProvider');
  }
  return context;
};

// Test helper to wrap components
export const withReactProvider = <P extends object>(Component: React.ComponentType<P>) => {
  return function WrappedComponent(props: P) {
    return (
      <ReactProvider>
        <Component {...props} />
      </ReactProvider>
    );
  };
};
