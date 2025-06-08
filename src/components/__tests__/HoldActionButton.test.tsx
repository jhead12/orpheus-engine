import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HoldActionButton from '../HoldActionButton';

describe('HoldActionButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    const onHoldAction = vi.fn();
    render(
      <HoldActionButton 
        interval={100}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('role')).toBe('button');
  });

  it('calls onHoldAction immediately on mouse down by default', () => {
    const onHoldAction = vi.fn();
    render(
      <HoldActionButton 
        interval={100}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    expect(onHoldAction).toHaveBeenCalledTimes(1);
  });

  it('respects holdActionOnMouseDown=false', () => {
    const onHoldAction = vi.fn();
    render(
      <HoldActionButton 
        interval={100}
        holdActionOnMouseDown={false}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    expect(onHoldAction).not.toHaveBeenCalled();
  });

  it('triggers onHoldAction repeatedly while button is held down', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    const delay = 500;
    
    render(
      <HoldActionButton 
        interval={interval}
        delay={delay}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    // Initial call on mouseDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Reset mock to track only repeat calls
    onHoldAction.mockReset();
    
    // Advance to the end of the delay and run all pending timers
    vi.advanceTimersByTime(delay);
    // First timeout triggers setTriggerHoldAction(true)
    vi.advanceTimersByTime(0); 
    // Run the effect after state update that calls onHoldAction and sets the next timer
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Advance to the next interval
    vi.advanceTimersByTime(interval);
    // Second timeout triggers setTriggerHoldAction(true) again
    vi.advanceTimersByTime(0);
    // Run the effect after second state update
    expect(onHoldAction).toHaveBeenCalledTimes(2);
    
    // Advance to the third interval
    vi.advanceTimersByTime(interval);
    // Third timeout triggers setTriggerHoldAction(true) again
    vi.advanceTimersByTime(0);
    // Run the effect after third state update
    expect(onHoldAction).toHaveBeenCalledTimes(3);
  });

  it('stops triggering onHoldAction when mouse is released', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    const delay = 500;
    
    render(
      <HoldActionButton 
        interval={interval}
        delay={delay}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    // Initial call on mouseDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Advance to the end of the delay
    vi.advanceTimersByTime(delay);
    
    // Allow the effect to run after state update
    vi.advanceTimersByTime(0);
    expect(onHoldAction).toHaveBeenCalledTimes(2);
    
    // Release the button
    fireEvent.mouseUp(button);
    
    // Reset mock to check if more calls happen
    onHoldAction.mockReset();
    
    // Advance timers but no more calls should happen
    vi.advanceTimersByTime(interval * 5);
    expect(onHoldAction).not.toHaveBeenCalled();
  });

  it('stops triggering onHoldAction when mouse leaves', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    const delay = 500;
    
    render(
      <HoldActionButton 
        interval={interval}
        delay={delay}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    // Initial call on mouseDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Advance to the end of the delay
    vi.advanceTimersByTime(delay);
    
    // Allow the effect to run after state update
    vi.advanceTimersByTime(0);
    expect(onHoldAction).toHaveBeenCalledTimes(2);
    
    // Mouse leaves the button
    fireEvent.mouseLeave(button);
    
    // Reset mock to check if more calls happen
    onHoldAction.mockReset();
    
    // Advance timers but no more calls should happen
    vi.advanceTimersByTime(interval * 5);
    expect(onHoldAction).not.toHaveBeenCalled();
  });

  it('triggers onHoldAction when Enter key is pressed', () => {
    const onHoldAction = vi.fn();
    
    render(
      <HoldActionButton 
        interval={100}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    
    // Focus the button before keyDown (as per the button's code that checks activeElement)
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(onHoldAction).toHaveBeenCalledTimes(1);
  });

  it('triggers repeated onHoldAction when Enter key is held down', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    const delay = 500;
    
    render(
      <HoldActionButton 
        interval={interval}
        delay={delay}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    
    // Focus the button before keyDown
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    // Initial call on keyDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Reset mock to track only repeat calls
    onHoldAction.mockReset();
    
    // Advance to the end of the delay
    vi.advanceTimersByTime(delay);
    // Allow the effect to run after state update
    vi.advanceTimersByTime(0);
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Advance to the next interval
    vi.advanceTimersByTime(interval);
    // Allow the effect to run after second state update
    vi.advanceTimersByTime(0);
    expect(onHoldAction).toHaveBeenCalledTimes(2);
  });

  it('stops triggering onHoldAction when Enter key is released', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    const delay = 500;
    
    render(
      <HoldActionButton 
        interval={interval}
        delay={delay}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    
    // Focus the button before keyDown
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    // Initial call on keyDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    
    // Advance to the end of the delay
    vi.advanceTimersByTime(delay);
    
    // Allow the effect to run after state update
    vi.advanceTimersByTime(0);
    expect(onHoldAction).toHaveBeenCalledTimes(2);
    
    // Release the key
    fireEvent.keyUp(button, { key: 'Enter' });
    
    // Reset mock to check if more calls happen
    onHoldAction.mockReset();
    
    // Advance timers but no more calls should happen
    vi.advanceTimersByTime(interval * 5);
    expect(onHoldAction).not.toHaveBeenCalled();
  });

  it('passes through other props to the div element', () => {
    const onHoldAction = vi.fn();
    const className = 'custom-class';
    const style = { color: 'rgb(255, 0, 0)' };
    
    render(
      <HoldActionButton 
        interval={100}
        onHoldAction={onHoldAction}
        className={className}
        style={style}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    expect(button).toHaveClass(className);
    expect(button).toHaveStyle('color: rgb(255, 0, 0)');
  });

  it('calls custom event handlers passed as props', () => {
    const onHoldAction = vi.fn();
    const onMouseDown = vi.fn();
    const onMouseUp = vi.fn();
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const onMouseLeave = vi.fn();
    
    render(
      <HoldActionButton 
        interval={100}
        onHoldAction={onHoldAction}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onMouseLeave={onMouseLeave}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    
    fireEvent.mouseDown(button);
    expect(onMouseDown).toHaveBeenCalled();
    
    fireEvent.mouseUp(button);
    expect(onMouseUp).toHaveBeenCalled();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalled();
    
    fireEvent.keyUp(button, { key: 'Enter' });
    expect(onKeyUp).toHaveBeenCalled();
    
    fireEvent.mouseLeave(button);
    expect(onMouseLeave).toHaveBeenCalled();
  });

  it('uses default delay of 500ms when not specified', () => {
    const onHoldAction = vi.fn();
    const interval = 100;
    
    render(
      <HoldActionButton 
        interval={interval}
        onHoldAction={onHoldAction}
        data-testid="hold-button"
      >
        Hold Me
      </HoldActionButton>
    );

    const button = screen.getByTestId('hold-button');
    fireEvent.mouseDown(button);
    
    // Initial call on mouseDown
    expect(onHoldAction).toHaveBeenCalledTimes(1);
    onHoldAction.mockReset();
    
    // Advance timers by 499ms (just under default delay)
    vi.advanceTimersByTime(499);
    expect(onHoldAction).not.toHaveBeenCalled();
    
    // Advance one more ms to reach default delay
    vi.advanceTimersByTime(1);
    // Allow the effect to run after state update
    vi.advanceTimersByTime(0); 
    expect(onHoldAction).toHaveBeenCalledTimes(1);
  });
});