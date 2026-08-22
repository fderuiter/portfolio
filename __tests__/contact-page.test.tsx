/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import ContactPage from "@/app/contact/page";

describe("ContactPage Component", () => {
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

  it("renders the contact page header and breadcrumbs", async () => {
    await act(async () => {
      root?.render(<ContactPage />);
    });

    expect(container?.textContent).toContain("Let's Start a Conversation");
    expect(container?.textContent).toContain("Direct Relay Active");
    expect(container?.textContent).toContain("Contact & Inquiries");
    expect(container?.textContent).toContain("Send a Direct Inquiry");
  });

  it("renders the integrated contact form", async () => {
    await act(async () => {
      root?.render(<ContactPage />);
    });

    const nameInput = container?.querySelector('input[name="name"]');
    expect(nameInput).not.toBeNull();

    const emailInput = container?.querySelector('input[name="email"]');
    expect(emailInput).not.toBeNull();

    const messageTextarea = container?.querySelector('textarea[name="message"]');
    expect(messageTextarea).not.toBeNull();
  });

  it("renders alternative channels including Google Meet sync, Newsletter, and LinkedIn", async () => {
    await act(async () => {
      root?.render(<ContactPage />);
    });

    expect(container?.textContent).toContain("Prefer a Live Technical Sync?");
    expect(container?.textContent).toContain("Schedule 1:1 Video Sync");
    expect(container?.textContent).toContain("Systems Dispatch");
    expect(container?.textContent).toContain("LinkedIn");
    expect(container?.textContent).toContain("GitHub");

    // Zero raw mailto links
    const mailtoLinks = container?.querySelectorAll('a[href^="mailto:"]');
    expect(mailtoLinks?.length).toBe(0);
    expect(container?.textContent).not.toContain("fpderuiter@gmail.com");
  });
});
