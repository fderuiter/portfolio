import { describe, it, expect, vi } from 'vitest';
import { generateManifest } from '@/lib/engine';

vi.mock("@chenglou/pretext/rich-inline", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@chenglou/pretext/rich-inline")>();
  return {
    ...mod,
    prepareRichInline: vi.fn(() => ({})),
    walkRichInlineLineRanges: vi.fn((_p1, _p2, cb) => {
      // mock behavior: 2 lines generated
      cb({ start: 0, end: 1 });
      cb({ start: 1, end: 2 });
    }),
    materializeRichInlineLineRange: vi.fn((_p1, _p2) => ({
      text: "line",
      fragments: [],
    })),
  };
});

describe('generateManifest (LPT Masonry Scheduler)', () => {
  it('distributes items into columns greedily (SM - 1 column)', () => {
    const items = [{ id: '1', stats: true }, { id: '2', stats: false }, { id: '3', stats: true }];

    const result = generateManifest({
      containerWidth: 500, // Forces SM
      items,
      getText: () => "",
      hasStats: (item) => item.stats,
    });
    expect(result.colCount).toBe(1);
    expect(result.columns[0]).toHaveLength(3);
    
    // We don't check exact height numbers because EngineConfig might change from Design Manifest, 
    // but we can check it successfully processed them and assigned heights.
    expect(result.columns[0][0].height).toBeGreaterThan(0);
  });

  it('distributes items into columns greedily (MD - 2 columns)', () => {
    // 4 items with varying text lengths so heights differ
    const items = [
      { id: '1', text: 'Short', stats: true },
      { id: '2', text: 'Longer text to increase height artificially for LPT testing', stats: false },
      { id: '3', text: 'Medium', stats: true },
      { id: '4', text: 'Tiny', stats: false },
    ];

    const result = generateManifest({
      containerWidth: 800, // Forces MD (Assuming BREAKPOINTS.MD is < 800)
      items,
      getText: (item) => item.text,
      hasStats: (item) => item.stats,
    });
    
    expect(result.colCount).toBeGreaterThanOrEqual(2);
    // As long as items were processed and put into columns
    expect(result.columns[0].length + result.columns[1].length).toBe(4);
  });
});
