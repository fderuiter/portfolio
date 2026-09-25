/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PhotoGalleryModal } from "@/components/PhotoGalleryModal";
import { BioSpotlight } from "@/components/BioSpotlight";
import { GlobalPhotoGallery } from "@/components/GlobalPhotoGallery";

// Mock next/image to render standard img tag
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// Mock framer-motion to prevent transition freezes in jsdom tests
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  const Component = ({
    children,
    className,
    style,
    onClick,
    ...props
  }: any) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    } = props;
    return (
      <div className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </div>
    );
  };
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: () => Component,
      }
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("PhotoGalleryModal Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it("renders null when isOpen is false", async () => {
    await act(async () => {
      root?.render(<PhotoGalleryModal isOpen={false} onClose={() => {}} />);
    });

    expect(container?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders dialog with accessible title and category tabs when open", async () => {
    await act(async () => {
      root?.render(<PhotoGalleryModal isOpen={true} onClose={() => {}} />);
    });

    const dialog = container?.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");

    const title = container?.querySelector("#photo-gallery-title");
    expect(title?.textContent).toContain("Behind the Code · Visual Archive");

    expect(container?.textContent).toContain("All Photos");
    expect(container?.textContent).toContain("Duck's Growth");
    expect(container?.textContent).toContain("Mud Run & Skiing");
  });

  it("allows selecting a photo to view in lightbox mode and navigating with keys", async () => {
    const handleClose = vi.fn();
    await act(async () => {
      root?.render(<PhotoGalleryModal isOpen={true} onClose={handleClose} />);
    });

    // Click on the first thumbnail
    const firstThumb = container?.querySelector(
      'button[aria-label^="View photo:"]'
    );
    expect(firstThumb).not.toBeNull();

    await act(async () => {
      firstThumb?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Lightbox modal should now have an active photo with back button
    const backBtn = container?.querySelector(
      'button[aria-label="Back to all photos"]'
    );
    expect(backBtn).not.toBeNull();

    // ArrowRight should advance photo
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });

    // Escape should close photo view first
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(
      container?.querySelector('button[aria-label="Back to all photos"]')
    ).toBeNull();

    // Second Escape should close the modal
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("BioSpotlight Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it("renders the growth progression tracker and responds to milestone clicks", async () => {
    await act(async () => {
      root?.render(<BioSpotlight />);
    });

    expect(container?.textContent).toContain(
      "From 8-Week Fluff to 80-lb Marshmallow"
    );

    // Check step buttons exist
    const milestoneButtons = container?.querySelectorAll("button[role='tab']");
    expect(milestoneButtons?.length).toBeGreaterThanOrEqual(4);

    // Click on step 2 (Mirror Check)
    if (milestoneButtons && milestoneButtons[1]) {
      await act(async () => {
        milestoneButtons[1].dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
      });
      expect(container?.textContent).toContain("First Week Home");
    }
  });
});

describe("GlobalPhotoGallery Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it("renders initially closed and opens upon receiving open-photo-gallery event", async () => {
    await act(async () => {
      root?.render(<GlobalPhotoGallery />);
    });

    expect(container?.querySelector('[role="dialog"]')).toBeNull();

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("open-photo-gallery", {
          detail: { photoId: "theodore-wirth-mud-run" },
        })
      );
    });

    const dialog = container?.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });
});
