import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '@/App';

describe('App component', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText(/Workstation/i)).toBeInTheDocument();
  });
});
