import React, { HTMLProps } from "react";
import useHoldAction from "../hooks/useHoldAction";

interface Props extends HTMLProps<HTMLDivElement> {
  delay?: number;
  holdActionOnMouseDown?: boolean;
  interval: number;
  onHoldAction: () => void;
}

export default function HoldActionButton(props: Props) {
  const { delay = 500, holdActionOnMouseDown = true, interval, onHoldAction, ...rest } = props;

  const [eventType, setEventType] = React.useState<"mousedown" | "keydown" | "none">("none");
  
  const { startHold, endHold } = useHoldAction({
    onHoldAction,
    delay,
    interval,
    holdActionOnMouseDown
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    rest.onKeyDown?.(e);

    if (document.activeElement === e.target && e.key === "Enter") {
      setEventType("keydown");
      startHold();
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    rest.onKeyUp?.(e);

    if (document.activeElement === e.target && e.key === "Enter" && eventType === "keydown") {
      setEventType("none");
      endHold();
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button === 0) {
      rest.onMouseDown?.(e);
      setEventType("mousedown");
      startHold();
    }
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button === 0 && eventType === "mousedown") {
      rest.onMouseUp?.(e);
      setEventType("none");
      endHold();
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    rest.onMouseLeave?.(e);
    if (eventType === "mousedown") {
      setEventType("none");
      endHold();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      {...rest}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      style={{ display: "inline-flex", ...rest.style }}
    />
  );
}