import { render as rtlRender, RenderOptions, renderHook as rtlRenderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ReactProvider } from './ReactProvider';
import { reactHooks } from '../../../../../test-preload.js';

// Ensure we're using the correct React hooks
Object.entries(reactHooks).forEach(([key, value]) => {
  if (typeof value === 'function') {
    // @ts-expect-error - dynamically setting hooks at runtime
    React[key] = value;
  }
});

// Custom render function that wraps component in ReactProvider
function renderWithProvider(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <ReactProvider>
        {children}
      </ReactProvider>
    ),
    ...options,
  });
}

// Custom renderHook function that wraps hook in ReactProvider
function renderHookWithProvider<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
): RenderHookResult<TResult, TProps> {
  return rtlRenderHook(callback, {
    wrapper: ({ children }) => (
      <ReactProvider>
        {children}
      </ReactProvider>
    ),
    ...options,
  });
}

// Re-export everything
export * from '@testing-library/react';
export { renderWithProvider as render, renderHookWithProvider as renderHook };
