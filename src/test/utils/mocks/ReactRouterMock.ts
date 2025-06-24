/**
 * React Router Mock Implementation
 * Used to prevent router context errors in tests
 */

import React from 'react';
import { vi } from 'vitest';

// Create mock functions for router hooks
export const useLocation = vi.fn(() => ({ pathname: '/' }));
export const useNavigate = vi.fn(() => vi.fn());
export const useParams = vi.fn(() => ({}));
export const useRoutes = vi.fn(() => null);
export const Outlet: React.FC = () => null;

// Create a mock router context provider
const mockRouterContext = {
  location: { pathname: '/', search: '', hash: '', state: null },
  navigator: {
    go: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    createHref: vi.fn().mockReturnValue('#'),
  },
};

// Types for router components
interface RouterProps {
  children: React.ReactNode;
}

interface RouteProps {
  element: React.ReactNode;
  path?: string;
}

interface LinkProps {
  to: string;
  children: React.ReactNode;
}

// Mock the Router and other components as regular functions
export const RouterContext = {
  Provider: ({ children }: RouterProps) =>
    React.createElement(React.Fragment, null, children),
  Consumer: ({ children }: any) =>
    React.createElement(React.Fragment, null, children(mockRouterContext)),
};

export const Router: React.FC<RouterProps> = ({ children }) =>
  React.createElement('div', { 'data-testid': 'mock-router' }, children);

export const Routes: React.FC<RouterProps> = ({ children }) =>
  React.createElement('div', { 'data-testid': 'mock-routes' }, children);

export const Route: React.FC<RouteProps> = ({ element }) =>
  React.createElement('div', { 'data-testid': 'mock-route' }, element);

export const MemoryRouter: React.FC<RouterProps> = ({ children }) =>
  React.createElement('div', { 'data-testid': 'mock-memory-router' }, children);

export const BrowserRouter: React.FC<RouterProps> = ({ children }) =>
  React.createElement(
    'div',
    { 'data-testid': 'mock-browser-router' },
    children
  );

export const HashRouter: React.FC<RouterProps> = ({ children }) =>
  React.createElement('div', { 'data-testid': 'mock-hash-router' }, children);

export const Link: React.FC<LinkProps> = ({ to, children }) =>
  React.createElement('a', { href: to, 'data-testid': 'mock-link' }, children);
