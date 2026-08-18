import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ScheduledImage } from "../components/ui/ScheduledImage";
import { ScheduledMediaContainer } from "../components/ui/ScheduledMediaContainer";
import { mediaScheduler } from "../lib/media-scheduler";

describe("Scheduled Media Components Suite", () => {
  beforeEach(() => {
    mediaScheduler.clearQueue();

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      private callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element): void {
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              target,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            },
          ],
          this
        );
      }

      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders ScheduledImage container with reserved aspect-ratio styling to enforce zero CLS", () => {
    const { container } = render(
      <ScheduledImage
        src="/duck/duck-prince.jpg"
        alt="Duck Prince"
        aspectRatio="16/9"
        isAboveTheFold={true}
      />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.aspectRatio).toBe("16/9");
  });

  it("renders ScheduledMediaContainer and loads child component once scheduled", async () => {
    render(
      <ScheduledMediaContainer
        isAboveTheFold={true}
        minHeight="300px"
        placeholderTitle="3D Brain Model"
      >
        <div data-testid="heavy-3d-canvas">Canvas 3D Mesh Active</div>
      </ScheduledMediaContainer>
    );

    await waitFor(() => {
      expect(screen.getByTestId("heavy-3d-canvas")).not.toBeNull();
    });
  });
});
