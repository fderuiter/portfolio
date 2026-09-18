import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MountainMap } from "@/components/patrol/MountainMap";
import { AmbientEventToast } from "@/components/patrol/AmbientEventToast";
import { AMBIENT_EVENTS_CATALOG, type AmbientEvent } from "@/lib/patrol";

describe("Patrol Shift — M8 Ambient Operational Events UI Integration (Issue #754)", () => {
  afterEach(cleanup);

  const mockGuestEvent: AmbientEvent = AMBIENT_EVENTS_CATALOG.find(
    (e) => e.id === "guest-directions"
  )!;
  const mockDebrisEvent: AmbientEvent = AMBIENT_EVENTS_CATALOG.find(
    (e) => e.id === "trail-debris"
  )!;
  const mockRopeEvent: AmbientEvent = AMBIENT_EVENTS_CATALOG.find(
    (e) => e.id === "rope-ducking"
  )!;
  const mockLiftEvent: AmbientEvent = AMBIENT_EVENTS_CATALOG.find(
    (e) => e.id === "lift-stoppage"
  )!;

  describe("<AmbientEventToast />", () => {
    it("renders ambient encounter title, prompt, location, and option choices", () => {
      const onResolve = vi.fn();
      const onDismiss = vi.fn();

      render(
        <AmbientEventToast
          event={mockGuestEvent}
          onResolveOption={onResolve}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByTestId("ambient-event-toast")).toBeDefined();
      expect(screen.getByText(mockGuestEvent.title)).toBeDefined();
      expect(screen.getByText(mockGuestEvent.prompt)).toBeDefined();
      expect(screen.getByText(mockGuestEvent.location)).toBeDefined();

      for (const option of mockGuestEvent.options) {
        expect(screen.getByTestId(`ambient-option-${option.id}`)).toBeDefined();
        expect(screen.getByText(option.label)).toBeDefined();
      }
    });

    it("ensures all buttons meet WCAG 2.1 AA 44px touch targets", () => {
      render(
        <AmbientEventToast
          event={mockGuestEvent}
          onResolveOption={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        expect(button.className).toMatch(/min-h-\[44px\]/);
        expect(button.className).toMatch(/min-w-\[44px\]/);
      }
    });

    it("invokes onResolveOption and reveals consequence when an option is clicked", () => {
      const onResolve = vi.fn();
      render(
        <AmbientEventToast
          event={mockGuestEvent}
          onResolveOption={onResolve}
          onDismiss={vi.fn()}
        />
      );

      const optionBtn = screen.getByTestId(
        `ambient-option-${mockGuestEvent.options[0].id}`
      );
      fireEvent.click(optionBtn);

      expect(onResolve).toHaveBeenCalledWith(mockGuestEvent.options[0].id);

      // Consequence feedback block appears
      const consequence = screen.getByTestId("ambient-consequence");
      expect(consequence.textContent).toContain(
        mockGuestEvent.options[0].consequenceText
      );
    });

    it("invokes onDismiss when Dismiss button is clicked", () => {
      const onDismiss = vi.fn();
      render(
        <AmbientEventToast
          event={mockGuestEvent}
          onResolveOption={vi.fn()}
          onDismiss={onDismiss}
        />
      );

      const dismissBtn = screen.getByTestId("ambient-dismiss-btn");
      fireEvent.click(dismissBtn);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("invokes onDismiss when Escape key is pressed", () => {
      const onDismiss = vi.fn();
      render(
        <AmbientEventToast
          event={mockGuestEvent}
          onResolveOption={vi.fn()}
          onDismiss={onDismiss}
        />
      );

      const toast = screen.getByTestId("ambient-event-toast");
      fireEvent.keyDown(toast, { key: "Escape" });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("<MountainMap /> Map Hub Integration", () => {
    it("renders animated map pin at event coordinates when activeAmbientEvent is present", () => {
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockDebrisEvent}
        />
      );

      const pin = screen.getByTestId("ambient-event-pin");
      expect(pin).toBeDefined();
      expect(pin.getAttribute("transform")).toBe(
        `translate(${mockDebrisEvent.coordinates.x}, ${mockDebrisEvent.coordinates.y})`
      );

      // Toast is mounted
      expect(screen.getByTestId("ambient-event-toast")).toBeDefined();
    });

    it("omits map pin and toast when activeAmbientEvent is null", () => {
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={null}
        />
      );

      expect(screen.queryByTestId("ambient-event-pin")).toBeNull();
      expect(screen.queryByTestId("ambient-event-toast")).toBeNull();
    });

    it("displays staged equipment location badge", () => {
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          operationalState={{
            closedTrails: [],
            equipmentLocation: "Mid-Mountain Cache",
          }}
        />
      );

      const badge = screen.getByTestId("equipment-location-badge");
      expect(badge.textContent).toContain("Mid-Mountain Cache");
    });

    it("renders closed trail badges and styling when trails are marked closed", () => {
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          operationalState={{
            closedTrails: ["Long Way Home", "Harley's Hollow"],
            equipmentLocation: "Summit Shack",
          }}
        />
      );

      expect(
        screen.getByTestId("closed-trail-badge-long-way-home")
      ).toBeDefined();
      expect(
        screen.getByTestId("closed-trail-badge-harleys-hollow")
      ).toBeDefined();
    });

    it("provides Routine Hill Check button and invokes onTriggerAmbientEvent", () => {
      const onTrigger = vi.fn();
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          onTriggerAmbientEvent={onTrigger}
        />
      );

      const hillCheckBtn = screen.getByTestId("routine-hill-check-btn");
      expect(hillCheckBtn).toBeDefined();
      expect(hillCheckBtn.className).toMatch(/min-h-\[44px\]/);

      fireEvent.click(hillCheckBtn);
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it("maintains non-blocking dispatch accessibility while ambient event is displayed", () => {
      const onAwaitDispatch = vi.fn();
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={onAwaitDispatch}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockGuestEvent}
        />
      );

      const dispatchBtn = screen.getByRole("button", {
        name: /Standby on Hill \/ Await Dispatch/i,
      });
      expect(dispatchBtn).toBeDefined();

      fireEvent.click(dispatchBtn);
      expect(onAwaitDispatch).toHaveBeenCalledTimes(1);
    });

    it("handles option resolution and preserves consequence feedback card on map", () => {
      const onResolve = vi.fn();
      const { rerender } = render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockDebrisEvent}
          onResolveAmbientOption={onResolve}
        />
      );

      // Select temporary trail closure
      const optionBtn = screen.getByTestId(
        "ambient-option-temporary-trail-closure"
      );
      fireEvent.click(optionBtn);
      expect(onResolve).toHaveBeenCalledWith("temporary-trail-closure");

      // Rerender as if reducer cleared activeAmbientEvent
      rerender(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={null}
          operationalState={{
            closedTrails: ["Long Way Home"],
            equipmentLocation: "Summit Shack",
          }}
          onResolveAmbientOption={onResolve}
        />
      );

      // Consequence feedback card persists until dismissed
      const consequenceCard = screen.getByTestId("ambient-consequence-card");
      expect(consequenceCard).toBeDefined();
      expect(consequenceCard.textContent).toContain("Long Way Home");

      // Closed trail badge is visible
      expect(
        screen.getByTestId("closed-trail-badge-long-way-home")
      ).toBeDefined();
    });

    it("actively highlights affected trail and sector badge when an ambient event occurs", () => {
      const { rerender } = render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockDebrisEvent}
        />
      );

      // Sector badge reflects West Slopes
      const sectorBadge = screen.getByTestId("mountain-sector-badge");
      expect(sectorBadge.textContent).toContain("West Slopes");

      // Trail highlight on Long Way Home is rendered
      expect(screen.getByTestId("trail-highlight-long-way-home")).toBeDefined();

      // Switch to rope ducking on East Slopes
      rerender(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockRopeEvent}
        />
      );

      expect(screen.getByTestId("mountain-sector-badge").textContent).toContain(
        "East Slopes"
      );
      expect(
        screen.getByTestId("trail-highlight-harleys-hollow")
      ).toBeDefined();

      // Switch to lift stoppage on Belle Creek Quad
      rerender(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockLiftEvent}
        />
      );

      expect(
        screen.getByTestId("lift-highlight-belle-creek-quad")
      ).toBeDefined();
    });

    it("disables Routine Hill Check button when activeAmbientEvent is present", () => {
      const onTrigger = vi.fn();
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          activeAmbientEvent={mockGuestEvent}
          onTriggerAmbientEvent={onTrigger}
        />
      );

      const hillCheckBtn = screen.getByTestId(
        "routine-hill-check-btn"
      ) as HTMLButtonElement;
      expect(hillCheckBtn.disabled).toBe(true);
      expect(hillCheckBtn.getAttribute("aria-disabled")).toBe("true");

      fireEvent.click(hillCheckBtn);
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("renders closed trails status pill in header when closedTrails has items", () => {
      render(
        <MountainMap
          incidentsCompleted={0}
          onAwaitDispatch={vi.fn()}
          onCompleteShift={vi.fn()}
          operationalState={{
            closedTrails: ["Long Way Home"],
            equipmentLocation: "Summit Shack",
          }}
        />
      );

      const closedPill = screen.getByTestId("mountain-closed-trails-pill");
      expect(closedPill).toBeDefined();
      expect(closedPill.textContent).toContain("Long Way Home");
    });
  });
});
