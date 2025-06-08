import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
} from "react";
import { ScrollSyncContext } from "./SyncScroll";

interface SyncScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  onWheel?: (e: React.WheelEvent) => void;
}

const SyncScrollPane = forwardRef<HTMLDivElement, SyncScrollPaneProps>(
  (props, ref) => {
    const { id, style, onWheel, className, ...rest } = props;
    const context = useContext(ScrollSyncContext);
    const internalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const currentRef = internalRef.current;
      if (currentRef && context) {
        context.registerPane(currentRef);
        return () => {
          context.unregisterPane(currentRef);
        };
      }
    }, [context]);

    const handleWheel = (e: React.WheelEvent) => {
      // Let parent handlers run first
      onWheel?.(e);

      // Only handle horizontal scrolling
      if (e.deltaX !== 0) {
        e.preventDefault();
        if (internalRef.current) {
          internalRef.current.scrollLeft += e.deltaX;
        }
      }
    };

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    return (
      <div
        {...rest}
        ref={setRefs}
        data-testid={`sync-scroll-pane-${id}`}
        className={className}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          ...style,
        }}
        onWheel={handleWheel}
      />
    );
  }
);

SyncScrollPane.displayName = "SyncScrollPane";

export default SyncScrollPane;
