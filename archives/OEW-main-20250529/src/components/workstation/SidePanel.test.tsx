import { render, screen } from '@testing-library/react';
import SidePanel from './SidePanel';

describe('SidePanel', () => {
  it('renders the side panel content', () => {
    render(<SidePanel />);
    
    // Check if the heading is rendered
    const headingElement = screen.getByText(/Side Panel Content/i);
    expect(headingElement).toBeInTheDocument();

    // Check if the paragraph is rendered
    const paragraphElement = screen.getByText(/This is the side panel./i);
    expect(paragraphElement).toBeInTheDocument();
  });
});
