// @ts-nocheck
/**
 * React hooks synchronization for testing (ESM version)
 * This file ensures React hooks work properly across different module resolutions
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { vi } from 'vitest';

// Make sure React is available globally
window.React = React;
window.ReactDOM = ReactDOM;

// Log React version for debugging
console.log('Test preload (ESM) - React version:', React.version);

// Intercept and ensure consistent React module resolution
const reactHooks = {
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useContext: React.useContext,
  useReducer: React.useReducer,
  useLayoutEffect: React.useLayoutEffect,
};

// Force all hooks to use this React instance
Object.keys(reactHooks).forEach(hook => {
  React[hook] = reactHooks[hook].bind(React);
  // Ensure the hook is properly bound even if accessed via import
  Object.defineProperty(React, hook, {
    configurable: false,
    writable: false,
    value: reactHooks[hook].bind(React)
  });
});

// Force module resolution to our React instance
const moduleRegistry = new Map();
moduleRegistry.set('react', React);
moduleRegistry.set('react-dom', ReactDOM);

// Mock require.cache to ensure consistent module resolution
if (typeof require !== 'undefined' && require.cache) {
  const reactPath = require.resolve('react');
  const reactDomPath = require.resolve('react-dom');
  
  require.cache[reactPath] = { exports: React };
  require.cache[reactDomPath] = { exports: ReactDOM };
}
Object.entries(reactHooks).forEach(([hookName, hook]) => {
  vi.spyOn(React, hookName).mockImplementation((...args) => hook.apply(React, args));
});

// Force createElement to use this React instance
const originalCreateElement = React.createElement;
React.createElement = function() {
  return originalCreateElement.apply(React, arguments);
};

export { React, ReactDOM, reactHooks };
