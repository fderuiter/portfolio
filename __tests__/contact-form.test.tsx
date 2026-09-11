import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ContactForm } from "@/components/ContactForm";

describe("ContactForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render all form controls and honeypot trap correctly", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/Your Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Subject/i)).toBeDefined();
    expect(screen.getByLabelText(/Message/i)).toBeDefined();
    expect(screen.getByLabelText(/Leave this blank/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Send Message/i })).toBeDefined();
  });

  it("should prevent submission and display inline errors if required fields are missing", async () => {
    render(<ContactForm />);

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter your name/i)).toBeDefined();
    expect(
      screen.getByText(/Please provide a valid email address/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Subject must be at least 3 characters/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Message must be at least 10 characters/i)
    ).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("moves focus to the first invalid field when submission fails validation (#583)", async () => {
    render(<ContactForm />);

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    // Regression: previously focus silently stayed on the submit button
    // (or wherever it was) after a failed validation, so a keyboard/screen
    // reader user got no indication where to fix the error.
    const nameInput = await screen.findByLabelText(/Your Name/i);
    expect(document.activeElement).toBe(nameInput);
  });

  it("moves focus to the first invalid field in DOM order, not just the first field", async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Ada Lovelace" },
    });

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    const emailInput = await screen.findByLabelText(/Email Address/i);
    expect(document.activeElement).toBe(emailInput);
  });

  it("should submit payload and display success confirmation upon 200 response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: "Received",
        messageId: "msg_123",
      }),
    });

    const handleSuccess = vi.fn();
    render(<ContactForm onSuccess={handleSuccess} />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "Formal Verification Inquiry" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "I would like to discuss building proof engines." },
    });

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Message sent!/i)).toBeDefined();
    });

    expect(handleSuccess).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
      })
    );

    // Test Reset
    const resetBtn = screen.getByRole("button", {
      name: /Send Another Message/i,
    });
    fireEvent.click(resetBtn);

    expect(screen.getByLabelText(/Your Name/i)).toBeDefined();
  });

  it("should display transmission error banner when backend returns error", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: "Too many contact submission attempts." }),
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "Formal Verification Inquiry" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "I would like to discuss building proof engines." },
    });

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Too many contact submission attempts/i)
    ).toBeDefined();
  });
});
