import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import Meter from '../Meter';

describe('Meter Component', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Meter percent={50} />);
      expect(document.querySelector('div')).toBeInTheDocument();
    });

    it('renders horizontal meter by default', () => {
      render(<Meter percent={50} data-testid="meter" />);
      const meterContainer = screen.getByTestId('meter');
      expect(meterContainer).toHaveStyle({
        width: '100%',
        height: '11px'
      });
    });

    it('renders vertical meter when vertical prop is true', () => {
      render(<Meter percent={50} vertical data-testid="meter" />);
      const meterContainer = screen.getByTestId('meter');
      expect(meterContainer).toHaveStyle({
        width: '11px',
        height: '100%'
      });
    });
  });

  // Percentage display tests
  describe('Percentage Display', () => {
    it('displays correct percentage container for horizontal meter', () => {
      const { container } = render(<Meter percent={75} />);
      // Get all div > div > div elements and take the second one (index 1)
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '75%',
        height: '100%'
      });
    });

    it('displays correct percentage container for vertical meter', () => {
      const { container } = render(<Meter percent={60} vertical />);
      // Get all div > div > div elements and take the second one (index 1)
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '100%',
        height: '60%'
      });
    });

    it('handles 0% correctly', () => {
      const { container } = render(<Meter percent={0} />);
      // Get all div > div > div elements and take the second one (index 1)
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '0%'
      });
    });

    it('handles 100% correctly', () => {
      const { container } = render(<Meter percent={100} />);
      // Get all div > div > div elements and take the second one (index 1)
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '100%'
      });
    });
  });

  // Color tests
  describe('Color Customization', () => {
    it('uses default color when none specified', () => {
      const { container } = render(<Meter percent={50} />);
      // Get all div > div > div elements and take the third one (index 2) - this is the fill element
      const divElements = container.querySelectorAll('div > div > div');
      const fillElement = divElements[2]; // This is the fill element
      expect(fillElement).toHaveStyle({
        background: 'rgb(0, 0, 0)'
      });
    });

    it('applies custom color', () => {
      const { container } = render(<Meter percent={50} color="#ff0000" />);
      // Get all div > div > div elements and take the third one (index 2) - this is the fill element
      const divElements = container.querySelectorAll('div > div > div');
      const fillElement = divElements[2]; // This is the fill element
      expect(fillElement).toHaveStyle({
        background: 'rgb(255, 0, 0)'
      });
    });
  });

  // Marks tests
  describe('Marks', () => {
    it('renders marks correctly on horizontal meter', () => {
      const marks = [
        { value: 25 },
        { value: 50 },
        { value: 75 }
      ];
      const { container } = render(<Meter percent={50} marks={marks} />);
      
      const markElements = container.querySelectorAll('div > div > div[style*="position: absolute"]');
      expect(markElements).toHaveLength(3);
      
      // Check first mark positioning
      expect(markElements[0]).toHaveStyle({
        left: '25%',
        width: '1px',
        height: '100%'
      });
    });

    it('renders marks correctly on vertical meter', () => {
      const marks = [
        { value: 30 },
        { value: 70 }
      ];
      const { container } = render(<Meter percent={50} marks={marks} vertical />);
      
      const markElements = container.querySelectorAll('div > div > div[style*="position: absolute"]');
      expect(markElements).toHaveLength(2);
      
      // Check first mark positioning (vertical meters use bottom positioning)
      expect(markElements[0]).toHaveStyle({
        bottom: '30%',
        width: '100%',
        height: '1px'
      });
    });

    it('applies custom styles to marks', () => {
      const marks = [
        { 
          value: 50, 
          style: { 
            backgroundColor: '#ff0000',
            width: '2px'
          }
        }
      ];
      const { container } = render(<Meter percent={50} marks={marks} />);
      
      const markElement = container.querySelector('div > div > div[style*="position: absolute"]');
      expect(markElement).toHaveStyle({
        backgroundColor: '#ff0000',
        width: '2px'
      });
    });
  });

  // Style customization tests
  describe('Style Customization', () => {
    it('applies custom styles to container', () => {
      const customStyle = {
        border: '1px solid red',
        borderRadius: '5px'
      };
      render(<Meter percent={50} style={customStyle} data-testid="meter" />);
      
      const meterContainer = screen.getByTestId('meter');
      expect(meterContainer).toHaveStyle({
        border: '1px solid red',
        borderRadius: '5px'
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles negative percentage', () => {
      const { container } = render(<Meter percent={-10} />);
      // Get all div > div > div elements and take the second one (index 1) - this is the percentage container
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '-10%'
      });
    });

    it('handles percentage over 100', () => {
      const { container } = render(<Meter percent={150} />);
      // Get all div > div > div elements and take the second one (index 1) - this is the percentage container
      const divElements = container.querySelectorAll('div > div > div');
      const fillContainer = divElements[1]; // This is the percentage container
      expect(fillContainer).toHaveStyle({
        width: '150%'
      });
    });

    it('handles empty marks array', () => {
      const { container } = render(<Meter percent={50} marks={[]} />);
      const markElements = container.querySelectorAll('div > div > div[style*="position: absolute"]');
      expect(markElements).toHaveLength(0);
    });

    it('handles undefined marks', () => {
      expect(() => {
        render(<Meter percent={50} marks={undefined} />);
      }).not.toThrow();
    });
  });

  // Visual regression tests
  describe('Visual Tests', () => {
    it('visual test: renders horizontal meter @visual', () => {
      const { container } = render(
        <div style={{
          width: '200px',
          height: '50px',
          background: '#2a2a2a',
          padding: '20px'
        }}>
          <Meter 
            percent={65} 
            color="#00ff00"
            marks={[
              { value: 25 },
              { value: 50 },
              { value: 75 }
            ]}
          />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('visual test: renders vertical meter @visual', () => {
      const { container } = render(
        <div style={{
          width: '50px',
          height: '200px',
          background: '#2a2a2a',
          padding: '20px'
        }}>
          <Meter 
            percent={80} 
            vertical
            color="#ff6600"
            marks={[
              { value: 20 },
              { value: 40 },
              { value: 60 },
              { value: 80 }
            ]}
          />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('visual test: renders meter with custom marks @visual', () => {
      const { container } = render(
        <div style={{
          width: '250px',
          height: '60px',
          background: '#1a1a1a',
          padding: '15px'
        }}>
          <Meter 
            percent={45} 
            color="#0099ff"
            marks={[
              { value: 10, style: { backgroundColor: '#ff0000', width: '2px' } },
              { value: 30, style: { backgroundColor: '#ffff00' } },
              { value: 50, style: { backgroundColor: '#00ff00' } },
              { value: 80, style: { backgroundColor: '#ff00ff', width: '3px' } }
            ]}
          />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('visual test: renders empty meter @visual', () => {
      const { container } = render(
        <div style={{
          width: '200px',
          height: '50px',
          background: '#2a2a2a',
          padding: '20px'
        }}>
          <Meter 
            percent={0} 
            color="#666666"
            marks={[
              { value: 25 },
              { value: 50 },
              { value: 75 }
            ]}
          />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('visual test: renders full meter @visual', () => {
      const { container } = render(
        <div style={{
          width: '200px',
          height: '50px',
          background: '#2a2a2a',
          padding: '20px'
        }}>
          <Meter 
            percent={100} 
            color="#00ff00"
            marks={[
              { value: 25 },
              { value: 50 },
              { value: 75 },
              { value: 100 }
            ]}
          />
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});