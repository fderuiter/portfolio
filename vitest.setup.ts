/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, beforeEach } from 'vitest';

// Enable React 19 test environment mode for act()
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ResizeObserver Mock
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
} as any;

// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
} as any;

// Canvas & Text Wrapping Measurements
if (typeof window !== 'undefined') {
  const mockMeasureText = (text: string) => ({
    width: text.length * 8, // simulated character width
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: text.length * 8,
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 2,
    emHeightAscent: 10,
    emHeightDescent: 2,
    fontBoundingBoxAscent: 10,
    fontBoundingBoxDescent: 2,
    hangingBaseline: 10,
    alphabeticBaseline: 0,
    ideographicBaseline: 0,
  });

  HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
    if (contextId === '2d') {
      return {
        measureText: vi.fn(mockMeasureText),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as any;
}

// Local Storage Simulation & State Reset
beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
  vi.clearAllMocks();
});
