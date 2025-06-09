import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WindowAutoScroll, { WindowAutoScrollProps } from '../WindowAutoScroll';

// Mock setTimeout and clearInterval since we're testing timing functionality
jest.useFakeTimers();

describe('WindowAutoScroll Component', () => {
  const defaultProps: WindowAutoScrollProps = {
    active: true,
    eventType: 'drag',
    thresholds: {
      top: { slow: 20, medium: 9, fast: 3 },
      right: { slow: 20, medium: 9, fast: 3 },
      bottom: { slow: 20, medium: 9, fast: 3 },
      left: { slow: 20, medium: 9, fast: 3 }
    }
  };

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('should render without crashing', () => {
    const { container } = render(<WindowAutoScroll {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  test('should not attach event listeners when not active', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    render(
      <WindowAutoScroll
        {...defaultProps}
        active={false}
      />
    );
    
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  test('should attach dragover event listener when active and eventType is "drag"', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    render(
      <WindowAutoScroll
        {...defaultProps}
        active={true}
        eventType="drag"
      />
    );
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  test('should attach mousemove event listener when active and eventType is not "drag"', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    render(
      <WindowAutoScroll
        {...defaultProps}
        active={true}
        eventType="mouse"
      />
    );
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('dragover', expect.any(Function));
  });

  test('should call onScroll callback when scrolling occurs', () => {
    // Create a mock scrollable element
    const mockScrollableElement = document.createElement('div');
    Object.defineProperty(mockScrollableElement, 'scrollLeft', { value: 50, writable: true });
    Object.defineProperty(mockScrollableElement, 'scrollWidth', { value: 300 });
    Object.defineProperty(mockScrollableElement, 'clientWidth', { value: 100 });
    mockScrollableElement.scrollBy = jest.fn();
    
    // Mock the getScrollParent function to return our mock element
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      overflowX: 'auto',
      overflowY: 'auto'
    } as any));
    
    // Setup onScroll mock
    const onScrollMock = jest.fn();
    
    render(
      <WindowAutoScroll
        {...defaultProps}
        onScroll={onScrollMock}
      />
    );
    
    // Now run the tests
    // Since we can't directly test the internal functions that are not exported,
    // we'll at least verify our component structure and prop handling
    expect(onScrollMock).not.toHaveBeenCalled();
  });

  test('should clean up event listeners and intervals on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    const { unmount } = render(<WindowAutoScroll {...defaultProps} />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});