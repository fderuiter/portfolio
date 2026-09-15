import { StrictMode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RichNarrative } from "@/components/RichNarrative";

const mockInitialize = vi.hoisted(() => vi.fn());
const mockRender = vi.hoisted(() => vi.fn());

vi.mock("mermaid", () => ({
  default: {
    initialize: mockInitialize,
    render: mockRender,
  },
}));

const mermaidNarrative = `
  <h3>Architecture</h3>
  <pre><code class="language-mermaid">flowchart TD
    A[Raw clinical data] --> B[Validated SDTM records]
  </code></pre>
  <pre><code class="language-typescript">const result = map(data);</code></pre>
`;

describe("RichNarrative Mermaid diagrams", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockRender.mockReset();
    mockRender.mockImplementation(async (_id: string, source: string) => ({
      svg: `<svg xmlns="http://www.w3.org/2000/svg"><text>${source}</text></svg>`,
    }));
  });

  it("renders Mermaid narrative content as an accessible diagram instead of visible source", async () => {
    render(<RichNarrative html={mermaidNarrative} />);

    await waitFor(() => {
      const diagram = screen.getByRole("img", {
        name: /architecture diagram/i,
      });
      expect(diagram.getAttribute("aria-busy")).toBe("false");
      expect(diagram.querySelector("svg")).not.toBeNull();
    });

    expect(document.querySelector("code.language-mermaid")).toBeNull();
    expect(screen.getByText("const result = map(data);")).not.toBeNull();
  });

  it("renders each Mermaid block independently", async () => {
    render(
      <RichNarrative
        html={`${mermaidNarrative}<pre><code class="language-mermaid">flowchart LR\nA --> B</code></pre>`}
      />
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole("img", { name: /architecture diagram/i })
      ).toHaveLength(2);
    });
  });

  it("uses a fresh Mermaid SVG id for every strict-mode render invocation", async () => {
    render(
      <StrictMode>
        <RichNarrative html={mermaidNarrative} />
      </StrictMode>
    );

    await waitFor(() => {
      expect(mockRender.mock.calls.length).toBeGreaterThan(1);
    });

    const renderIds = mockRender.mock.calls.map(([id]) => id);
    expect(new Set(renderIds).size).toBe(renderIds.length);
  });

  it("contains invalid Mermaid source in an explicit fallback", async () => {
    mockRender.mockRejectedValueOnce(new Error("Invalid Mermaid syntax"));

    render(
      <RichNarrative
        html={
          '<pre><code class="language-mermaid">flowchart NOT_VALID</code></pre>'
        }
      />
    );

    await waitFor(() => {
      expect(document.querySelector("[data-mermaid-error]")).not.toBeNull();
    });

    expect(screen.getByText("Architecture diagram unavailable")).not.toBeNull();
    expect(screen.getByText("View diagram source")).not.toBeNull();
  });
});
