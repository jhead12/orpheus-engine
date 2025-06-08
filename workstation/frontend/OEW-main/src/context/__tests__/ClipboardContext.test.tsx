import { act, renderHook } from "@testing-library/react";
import { ClipboardProvider, useClipboard } from "../ClipboardContext";
import { ClipboardItemType, ClipboardItem } from "../../types/clipboard";
import { PropsWithChildren } from "react";

describe("ClipboardContext", () => {
  const testClipboardItem: ClipboardItem = {
    type: ClipboardItemType.Track,
    data: {
      id: "test-track",
      name: "Test Track",
    },
  };

  const TestWrapper = ({ children }: PropsWithChildren<{}>) => (
    <ClipboardProvider>{children}</ClipboardProvider>
  );

  it("provides clipboard context to children", () => {
    const { result } = renderHook(() => useClipboard(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.clipboardData).toBeNull();
    expect(typeof result.current.setCopiedData).toBe("function");
  });

  it("updates clipboard item", () => {
    const { result } = renderHook(() => useClipboard(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.setCopiedData(testClipboardItem);
    });

    expect(result.current.clipboardData).toBe(testClipboardItem);
  });

  it("clears clipboard item", () => {
    const { result } = renderHook(() => useClipboard(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.setCopiedData(testClipboardItem);
      result.current.setCopiedData(null);
    });

    expect(result.current.clipboardData).toBeNull();
  });

  it("preserves clipboard item type information", () => {
    const testItems: ClipboardItem[] = [
      {
        type: ClipboardItemType.Track,
        data: { id: "track-1", name: "Track 1" },
      },
      {
        type: ClipboardItemType.Clip,
        data: { id: "clip-1", name: "Clip 1" },
      },
      {
        type: ClipboardItemType.AutomationNode,
        data: { id: "node-1", value: 0.5 },
      },
    ];

    const { result } = renderHook(() => useClipboard(), {
      wrapper: TestWrapper,
    });

    testItems.forEach((item) => {
      act(() => {
        result.current.setCopiedData(item);
      });

      expect(result.current.clipboardData).toBe(item);
      expect(result.current.clipboardData?.type).toBe(item.type);
    });
  });
});
