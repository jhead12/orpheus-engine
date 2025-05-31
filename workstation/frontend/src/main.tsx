import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  BrowserRouter, 
  RouterProvider, 
  createBrowserRouter,
  Future
} from 'react-router-dom'
import App from './App'
import './index.css'

// Configure future flags for React Router v7
const router = createBrowserRouter([
  {
    path: '/',
    element: <App onReady={() => {
      // Only notify in electron environment
      if (window.electron) {
        window.electron.send('app-ready');
      }
    }} />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  } as Future
});

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Check the console for details.</div>;
    }
    return this.props.children;
  }
}

// Render the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
)
