/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import SchedulePage from "@/app/schedule/page";

describe("SchedulePage Component", () => {
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

  it("renders the consultation header and description", async () => {
    await act(async () => {
      root?.render(<SchedulePage />);
    });

    expect(container?.textContent).toContain("Say Hi & Book a Chat");
    expect(container?.textContent).toContain("Google Calendar & Meet Integration");
    expect(container?.textContent).toContain("30-60 Min Sessions");
    expect(container?.textContent).toContain("Code, Systems & Web Craft");
    expect(container?.textContent).toContain("Healthcare & Clinical Data");
  });

  it("renders Google Calendar appointment booking button and spec badges", async () => {
    await act(async () => {
      root?.render(<SchedulePage />);
    });

    const bookingBtn = container?.querySelector('a[href="https://calendar.app.google/YnR5oxos7ZTLyvUp8"]');
    expect(bookingBtn).not.toBeNull();
    expect(bookingBtn?.textContent).toContain("Open Google Calendar Appointments");
    expect(container?.textContent).toContain("Ready to Connect?");
    expect(container?.textContent).toContain("Google Meet Video Bridge");
  });

  it("renders correct contact links including email and linkedin", async () => {
    await act(async () => {
      root?.render(<SchedulePage />);
    });

    const emailLink = container?.querySelector('a[href="mailto:fpderuiter@gmail.com"]');
    expect(emailLink).not.toBeNull();
    expect(emailLink?.textContent).toContain("fpderuiter@gmail.com");

    const linkedinLink = container?.querySelector('a[href="https://www.linkedin.com/in/frederick-de-ruiter-88012467/"]');
    expect(linkedinLink).not.toBeNull();
    expect(linkedinLink?.textContent).toContain("LinkedIn Profile");
  });
});
