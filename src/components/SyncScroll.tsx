import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface ScrollSyncContextType {
  registerPane: (pane: HTMLElement) => void;
  unregisterPane: (pane: HTMLElement) => void;
}

export const ScrollSyncContext = createContext<
  ScrollSyncContextType | undefined
>(undefined);

export function SyncScroll({ children }: React.PropsWithChildren) {
  const panes = useRef<HTMLElement[]>([]);
  const panesRef = useRef<Set<HTMLElement>>(new Set());
  const scrollingRef = useRef(false);

  const onScrollPane = useCallback((e: Event) => {
    if (e.target instanceof HTMLElement && !scrollingRef.current) {
      const element = e.target;
      const otherPanes = Array.from(panesRef.current).filter(
        (p) => p !== element
      );

      scrollingRef.current = true;

      // Temporarily remove scroll listeners to prevent infinite loops
      for (const p of otherPanes) {
        p.onscroll = null;
      }

      // Sync horizontal scroll
      const normalizedScrollLeft =
        element.scrollLeft / (element.scrollWidth - element.clientWidth);
      for (const p of otherPanes) {
        const maxScroll = p.scrollWidth - p.clientWidth;
        if (maxScroll > 0) {
          p.scrollLeft = normalizedScrollLeft * maxScroll;
        }
      }

      // Restore scroll listeners after a short delay
      requestAnimationFrame(() => {
        scrollingRef.current = false;
        for (const p of otherPanes) {
          if (panesRef.current.has(p)) {
            p.onscroll = onScrollPane;
          }
        }
      });
    }
  }, []);

  const observer = useMemo(() => {
    return new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const pane = Array.from(panesRef.current).find((p) =>
          p.contains(entry.target)
        );
        if (pane && !scrollingRef.current) {
          const event = new Event("scroll");
          pane.dispatchEvent(event);
        }
      }
    });
  }, []);

  const registerPane = useCallback(
    (pane: HTMLElement) => {
      if (!panesRef.current.has(pane)) {
        panesRef.current.add(pane);
        panes.current = Array.from(panesRef.current);
        pane.onscroll = onScrollPane;
        observer.observe(pane);

        // Observe all children for size changes
        Array.from(pane.children).forEach((child) => {
          observer.observe(child);
        });
      }
    },
    [observer, onScrollPane]
  );

  const unregisterPane = useCallback(
    (pane: HTMLElement) => {
      if (panesRef.current.has(pane)) {
        panesRef.current.delete(pane);
        panes.current = Array.from(panesRef.current);
        pane.onscroll = null;
        observer.unobserve(pane);

        // Stop observing all children
        Array.from(pane.children).forEach((child) => {
          observer.unobserve(child);
        });
      }
    },
    [observer]
  );

  useEffect(() => {
    return () => {
      // Copy refs to local variables for cleanup
      const currentPanes = Array.from(panesRef.current);
      const currentObserver = observer;

      // Clean up all panes on unmount
      currentPanes.forEach((pane) => {
        pane.onscroll = null;
        currentObserver.unobserve(pane);
        Array.from(pane.children).forEach((child) => {
          currentObserver.unobserve(child);
        });
      });

      // Clear the sets
      panesRef.current = new Set();
      panes.current = [];
    };
  }, [observer]);

  const contextValue = useMemo(
    () => ({
      registerPane,
      unregisterPane,
    }),
    [registerPane, unregisterPane]
  );

  return (
    <ScrollSyncContext.Provider value={contextValue}>
      {children}
    </ScrollSyncContext.Provider>
  );
}
