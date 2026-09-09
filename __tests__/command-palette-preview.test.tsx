/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CommandPalette } from "@/components/CommandPalette";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock audio provider functions
const mockPlayHover = vi.fn();
const mockPlaySubmit = vi.fn();
vi.mock("@/components/providers/AudioProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/components/providers/AudioProvider")
    >();
  return {
    ...actual,
    useAudio: () => ({
      playHover: mockPlayHover,
      playSubmit: mockPlaySubmit,
      playSuccess: vi.fn(),
      playNote: vi.fn(),
      volume: 0.3,
      muted: false,
    }),
  };
});

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock search provider state
let mockIsOpen = false;
const mockCloseSearch = vi.fn();
const mockSetIsOpen = vi.fn((val: boolean) => {
  mockIsOpen = val;
});

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    isOpen: mockIsOpen,
    setIsOpen: mockSetIsOpen,
    closeSearch: mockCloseSearch,
  }),
}));

describe("Command Palette Preview Tooltips & Master-Detail Navigation Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = false;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    // Mock fetch for case studies
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "study-1",
          slug: "distributed-consensus",
          title: "Distributed Consensus Engine",
          primary_language: "Rust",
          tags: "Raft, Paxos, WebSockets",
        },
      ],
    } as Response);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = "";
  });

  it("renders closed by default", async () => {
    await act(async () => {
      root.render(<CommandPalette />);
    });

    expect(document.querySelector("#palette-results-list")).toBeNull();
    expect(document.querySelector("#palette-preview-pane")).toBeNull();
  });

  it("opens modal and displays master-detail 2-column layout with preview pane on desktop", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    // Check combobox and listbox
    const combobox = document.querySelector('input[role="combobox"]');
    expect(combobox).not.toBeNull();

    const listbox = document.querySelector(
      '#palette-results-list[role="listbox"]'
    );
    expect(listbox).not.toBeNull();

    // Check master-detail preview pane
    const previewPane = document.querySelector("#palette-preview-pane");
    expect(previewPane).not.toBeNull();
    expect(previewPane?.classList.contains("md:flex")).toBe(true);
    expect(previewPane?.classList.contains("hidden")).toBe(true); // Hidden on mobile, md:flex on desktop

    // First item is active by default (Work Showcase Feed)
    const options = document.querySelectorAll('div[role="option"]');
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].getAttribute("aria-selected")).toBe("true");

    // Preview pane shows active item's details
    expect(previewPane?.textContent).toContain("Work Showcase Feed");
    expect(previewPane?.textContent).toContain("Next.js 16");
    expect(previewPane?.textContent).toContain("React 19");
    expect(previewPane?.textContent).toContain("Project Collection");
  });

  it("updates preview pane and triggers audio hover when navigating with arrow keys", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;
    expect(combobox).not.toBeNull();

    const previewPane = document.querySelector("#palette-preview-pane");
    expect(previewPane?.textContent).toContain("Work Showcase Feed");

    // Press ArrowDown to navigate to second item (About System Architect)
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
    });

    expect(mockPlayHover).toHaveBeenCalledTimes(1);
    expect(previewPane?.textContent).toContain(
      "About Frederick (Bio & Timeline)"
    );
    expect(previewPane?.textContent).toContain("Origin Story");
    expect(previewPane?.textContent).toContain("Mayo Clinic Operations");

    // Press ArrowDown again to navigate to third item (Say Hi & Connect)
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
    });

    expect(mockPlayHover).toHaveBeenCalledTimes(2);
    expect(previewPane?.textContent).toContain("Contact & Direct Inquiries");
    expect(previewPane?.textContent).toContain("Contact Form");

    // Press ArrowUp to move back
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
      );
    });

    expect(mockPlayHover).toHaveBeenCalledTimes(3);
    expect(previewPane?.textContent).toContain(
      "About Frederick (Bio & Timeline)"
    );
  });

  it("updates active preview when navigating or hovering over a list item", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    const options = document.querySelectorAll('div[role="option"]');
    expect(options.length).toBeGreaterThan(3);

    // Hover or focus 4th option (Arcade Games Hub)
    await act(async () => {
      options[3].dispatchEvent(
        new MouseEvent("mouseover", {
          bubbles: true,
          relatedTarget: document.body,
        })
      );
    });

    const previewPane = document.querySelector("#palette-preview-pane");
    expect(previewPane?.textContent).toContain("Arcade Games Hub");
    expect(previewPane?.textContent).toContain("Interactive 60 FPS");
    expect(previewPane?.textContent).toContain("Canvas 2D");
  });

  it("triggers playClick and navigates on Enter key or item click", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;

    // Navigate to Arcade Hub
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      ); // index 1
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      ); // index 2
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      ); // index 3
    });

    // Press Enter
    await act(async () => {
      combobox.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
    });

    expect(mockPlaySubmit).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/arcade");
  });

  it("enforces WAI-ARIA Combobox 1.2 accessibility standards", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector('input[role="combobox"]');
    expect(combobox?.getAttribute("aria-expanded")).toBe("true");
    expect(combobox?.getAttribute("aria-autocomplete")).toBe("list");
    expect(combobox?.getAttribute("aria-controls")).toBe(
      "palette-results-list"
    );
    expect(combobox?.getAttribute("aria-activedescendant")).toBe(
      "palette-option-nav-work"
    );

    const activeOption = document.querySelector(
      '#palette-option-nav-work[role="option"]'
    );
    expect(activeOption?.getAttribute("aria-selected")).toBe("true");
    expect(activeOption?.getAttribute("aria-describedby")).toBe(
      "palette-preview-pane"
    );
  });

  it("filters search results dynamically and renders empty state message when no items match", async () => {
    mockIsOpen = true;

    await act(async () => {
      root.render(<CommandPalette />);
    });

    const combobox = document.querySelector(
      'input[role="combobox"]'
    ) as HTMLInputElement;

    // Type query with no matches
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeSetter?.call(combobox, "xyznonexistentquery12345");
      combobox.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const emptyMsg = document.body.textContent;
    expect(emptyMsg).toContain("No outcomes match search query.");
  });
});
