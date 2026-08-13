/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { act, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPortal } from "react-dom";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useResizeObserver } from "@/hooks/useResizeObserver";

// Test Component for usePersistentState Hook
function TestPersistentComponent() {
  const [value, setValue] = usePersistentState("test-key", "default-value");
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button data-testid="btn" onClick={() => setValue("updated-value")}>
        Change
      </button>
    </div>
  );
}

// Test Component for useResizeObserver Hook
function TestResizeComponent({ onResize }: { onResize: () => void }) {
  const ref = useResizeObserver<HTMLDivElement>(() => {
    onResize();
  });
  return (
    <div ref={ref} data-testid="resize-element">
      Resize Me
    </div>
  );
}

// Test Component for Focus Trapping, Portal Mounting, and Keyboard Navigation (Scenario 2)
function InteractivePortalOverlay({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items] = useState(["Item 1", "Item 2", "Item 3"]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    // Focus the input on mount
    inputRef.current?.focus();
    // Lock body overflow
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div data-testid="backdrop" className="overlay-backdrop">
      <div className="overlay-content">
        <input
          ref={inputRef}
          data-testid="search-input"
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Search..."
        />
        <ul data-testid="list">
          {items.map((item, idx) => (
            <li
              key={idx}
              data-testid={`item-${idx}`}
              className={idx === focusedIndex ? "active" : ""}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}

describe("Standardized Browser Testing Environment Integration", () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  describe("Requirement 1: JSDOM Global Document & Window Support", () => {
    it("provides standard window and document globals", () => {
      expect(window).toBeDefined();
      expect(document).toBeDefined();
      expect(document.body).toBeDefined();
    });
  });

  describe("Requirement 2 & 4: Layout Change Observers & Canvas Mocking", () => {
    it("supports global ResizeObserver mock structure", () => {
      expect(global.ResizeObserver).toBeDefined();
      const mockCallback = vi.fn();

      act(() => {
        root = createRoot(container!);
        root.render(<TestResizeComponent onResize={mockCallback} />);
      });

      const element = container!.querySelector('[data-testid="resize-element"]');
      expect(element).not.toBeNull();
    });

    it("supports global IntersectionObserver mock structure", () => {
      expect(global.IntersectionObserver).toBeDefined();
      const observer = new global.IntersectionObserver(vi.fn());
      expect(typeof observer.observe).toBe("function");
      expect(typeof observer.unobserve).toBe("function");
      expect(typeof observer.disconnect).toBe("function");
    });

    it("supports Canvas text metrics measurements", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      expect(ctx).not.toBeNull();

      const text = "Performance Metrics";
      const metrics = ctx!.measureText(text);
      expect(metrics).toBeDefined();
      expect(metrics.width).toBe(text.length * 8);
    });
  });

  describe("Requirement 3: Local Storage Simulation & Test File Isolation", () => {
    it("simulates client-side state persistence read and writes", () => {
      act(() => {
        root = createRoot(container!);
        root.render(<TestPersistentComponent />);
      });

      // Verify default state
      const valueSpan = container!.querySelector('[data-testid="value"]');
      expect(valueSpan?.textContent).toBe("default-value");

      // Verify trigger update sets localStorage
      const btn = container!.querySelector('[data-testid="btn"]');
      act(() => {
        btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      expect(valueSpan?.textContent).toBe("updated-value");
      expect(window.localStorage.getItem("test-key")).toBe(JSON.stringify("updated-value"));
    });

    it("verifies state isolation: localStorage must be automatically reset between tests", () => {
      // Since beforeEach clears localStorage, 'test-key' should no longer exist
      expect(window.localStorage.getItem("test-key")).toBeNull();
    });
  });

  describe("Scenario 2: Focus Management, Portal Support, and Keyboard Navigation", () => {
    it("successfully mounts to body portal, manages body scroll lock, sets initial focus, and handles keyboard inputs", () => {
      const handleClose = vi.fn();

      act(() => {
        root = createRoot(container!);
        root.render(<InteractivePortalOverlay onClose={handleClose} />);
      });

      // 1. Verify Portal support: mounted to document.body, not the container
      const portalBackdrop = document.body.querySelector('[data-testid="backdrop"]');
      expect(portalBackdrop).not.toBeNull();
      expect(container!.contains(portalBackdrop)).toBe(false);

      // 2. Verify layout level side effects (Body scroll lock)
      expect(document.body.style.overflow).toBe("hidden");

      // 3. Verify Focus Management: Search input automatically gains focus on mount
      const searchInput = document.body.querySelector('[data-testid="search-input"]') as HTMLInputElement;
      expect(searchInput).not.toBeNull();
      expect(document.activeElement).toBe(searchInput);

      // 4. Verify Keyboard Driven navigation flow
      const firstItem = document.body.querySelector('[data-testid="item-0"]');
      const secondItem = document.body.querySelector('[data-testid="item-1"]');
      expect(firstItem?.className).toContain("active");
      expect(secondItem?.className).not.toContain("active");

      // Simulate Down Arrow key event
      act(() => {
        searchInput.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
        );
      });

      expect(firstItem?.className).not.toContain("active");
      expect(secondItem?.className).toContain("active");

      // Simulate Escape key event to trigger close
      act(() => {
        searchInput.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
      });

      expect(handleClose).toHaveBeenCalledTimes(1);

      // 5. Clean up & unmount to verify body scroll lock restoration
      act(() => {
        root.unmount();
        root = null;
      });

      expect(document.body.style.overflow).toBe("");
      expect(document.body.querySelector('[data-testid="backdrop"]')).toBeNull();
    });
  });
});
