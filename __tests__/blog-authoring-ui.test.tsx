import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BlogAuthoringForm } from "@/components/admin/BlogAuthoringForm";
import { BlogPostService } from "@/lib/services/blog-service";
import { prisma } from "@/lib/db";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminAuthSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: { del: vi.fn(), get: vi.fn(), set: vi.fn() },
  getScopedRedisKey: vi.fn((key: string) => `test:${key}`),
  isRedisConfigured: vi.fn(() => false),
}));

global.fetch = vi.fn();

describe("BlogAuthoringForm UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("auto-derives kebab-case slug from title for new posts when slug hasn't been manually edited", () => {
    render(<BlogAuthoringForm isNew={true} />);

    const titleInput = screen.getByLabelText(
      /Article Title/i
    ) as HTMLInputElement;
    const slugInput = screen.getByLabelText(/URL Slug/i) as HTMLInputElement;

    fireEvent.change(titleInput, {
      target: { value: "Formal Verification in WebAssembly Runtimes!" },
    });

    expect(slugInput.value).toBe("formal-verification-in-webassembly-runtimes");
  });

  it("preserves manually entered slug when author edits slug field directly", () => {
    render(<BlogAuthoringForm isNew={true} />);

    const titleInput = screen.getByLabelText(
      /Article Title/i
    ) as HTMLInputElement;
    const slugInput = screen.getByLabelText(/URL Slug/i) as HTMLInputElement;

    fireEvent.change(slugInput, {
      target: { value: "custom-manual-slug" },
    });

    fireEvent.change(titleInput, {
      target: { value: "New Title Here" },
    });

    expect(slugInput.value).toBe("custom-manual-slug");
  });

  it("switches to Live Preview tab and renders RichNarrative HTML content", async () => {
    render(
      <BlogAuthoringForm
        isNew={true}
        initialData={{
          title: "Preview Test Post",
          slug: "preview-test-post",
          dek: "A preview test standfirst.",
          body: "<h2>Preview Heading</h2><p>Preview paragraph copy.</p>",
          pillar: "formal-verification",
          tags: "preview, testing",
          published: false,
        }}
      />
    );

    const previewTabButton = screen.getAllByRole("button", {
      name: /Live Preview/i,
    })[0];
    fireEvent.click(previewTabButton);

    expect(screen.getByText("Live Article Preview Mode")).toBeDefined();
    expect(screen.getByText("Preview Test Post")).toBeDefined();
    expect(screen.getByText("A preview test standfirst.")).toBeDefined();
    expect(screen.getByText("Preview Heading")).toBeDefined();
    expect(screen.getByText("Preview paragraph copy.")).toBeDefined();
  });
});

describe("Draft vs Published Isolation State Machine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("never returns unpublished draft records for public getBlogPostBySlug queries", async () => {
    const unpublishedDraft = {
      id: "draft-101",
      slug: "secret-draft",
      title: "Secret Unpublished Draft",
      dek: "Unpublished standfirst.",
      body: "<p>Unpublished body.</p>",
      pillar: "field-notes",
      tags: "secret",
      published: false,
      reading_time_minutes: 1,
      hero_image_url: null,
      created_at: new Date("2026-09-15T10:00:00.000Z"),
      updated_at: new Date("2026-09-15T10:00:00.000Z"),
    };

    vi.mocked(prisma.blogPost.findUnique).mockResolvedValue(
      unpublishedDraft as never
    );

    const result = await BlogPostService.getBlogPostBySlug("secret-draft");
    expect(result).toBeNull();
  });

  it("excludes unpublished drafts from public getAllPublishedBlogPosts list", async () => {
    const mixedPosts = [
      {
        id: "pub-1",
        slug: "published-post",
        title: "Published Post",
        dek: "Published standfirst.",
        body: "<p>Published body.</p>",
        pillar: "agent-first-dx",
        tags: "public",
        published: true,
        reading_time_minutes: 1,
        hero_image_url: null,
        created_at: new Date("2026-09-15T10:00:00.000Z"),
        updated_at: new Date("2026-09-15T10:00:00.000Z"),
      },
      {
        id: "draft-1",
        slug: "secret-draft",
        title: "Secret Draft",
        dek: "Draft standfirst.",
        body: "<p>Draft body.</p>",
        pillar: "field-notes",
        tags: "private",
        published: false,
        reading_time_minutes: 1,
        hero_image_url: null,
        created_at: new Date("2026-09-15T11:00:00.000Z"),
        updated_at: new Date("2026-09-15T11:00:00.000Z"),
      },
    ];

    vi.mocked(prisma.blogPost.findMany).mockResolvedValue(mixedPosts as never);

    const results = await BlogPostService.getAllPublishedBlogPosts();
    expect(results.some((p) => p.slug === "secret-draft")).toBe(false);
  });
});
