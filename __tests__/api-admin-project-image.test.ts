import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { fromPartial } from "@total-typescript/shoehorn";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";
import { POST, DELETE } from "@/app/api/admin/projects/[slug]/image/route";
import { GET as getMediaAssetRoute } from "@/app/api/media/[key]/route";
import { MAX_PROJECT_IMAGE_SIZE_BYTES } from "@/lib/services/project-image-service";
import { CaseStudyService } from "@/lib/services/case-study-service";

vi.mock("@/lib/auth/admin", () => ({
  isCurrentUserAdmin: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/services/case-study-service", () => ({
  CaseStudyService: {
    getCaseStudyBySlug: vi.fn(),
    updateCaseStudyImage: vi.fn(),
  },
}));

// Valid PNG 1x1 image buffer
const VALID_PNG_BUFFER = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2d0b0000000049454e44ae426082",
  "hex"
);

// Valid JPEG header buffer
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
]);

describe("API Admin Project Image Upload Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(fromPartial({ userId: "user_admin123" }));
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true);
    vi.mocked(CaseStudyService.getCaseStudyBySlug).mockResolvedValue({
      id: "cs_1",
      slug: "laser-loon",
      title: "Laser Loon",
      primary_language: "TypeScript",
      github_url: "https://github.com/test/laser-loon",
      published: true,
      simulated_telemetry: false,
      tags: "game, canvas",
      editorial_content: "Editorial narrative",
      architectural_narrative: "Architectural breakdown",
      hero_image_url: "/api/media/project-laser-loon-old.png",
      created_at: new Date(),
      updated_at: new Date(),
    });
    vi.mocked(CaseStudyService.updateCaseStudyImage).mockImplementation(
      async (slug, hero_image_url) => ({
        id: "cs_1",
        slug,
        title: "Laser Loon",
        primary_language: "TypeScript",
        github_url: "https://github.com/test/laser-loon",
        published: true,
        simulated_telemetry: false,
        tags: "game, canvas",
        editorial_content: "Editorial narrative",
        architectural_narrative: "Architectural breakdown",
        hero_image_url,
        created_at: new Date(),
        updated_at: new Date(),
      })
    );
  });

  it("returns 401 Unauthorized when request is unauthenticated (no userId)", async () => {
    vi.mocked(auth).mockResolvedValue(fromPartial({ userId: null }));

    const formData = new FormData();
    const file = new File([VALID_PNG_BUFFER], "hero.png", {
      type: "image/png",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toMatch(/Authentication required/i);
  });

  it("returns 403 Forbidden when user is authenticated but not an admin", async () => {
    vi.mocked(auth).mockResolvedValue(fromPartial({ userId: "user_regular" }));
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false);

    const formData = new FormData();
    const file = new File([VALID_PNG_BUFFER], "hero.png", {
      type: "image/png",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(403);

    const data = await res.json();
    expect(data.error).toMatch(/Administrator access required/i);
  });

  it("returns 400 Bad Request when file is missing in multipart form data", async () => {
    const formData = new FormData();

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toMatch(/Image file is required/i);
  });

  it("returns 400 Bad Request when file exceeds 5MB size limit", async () => {
    const oversizedBuffer = Buffer.alloc(MAX_PROJECT_IMAGE_SIZE_BYTES + 100);
    // Write valid PNG header
    VALID_PNG_BUFFER.copy(oversizedBuffer, 0, 0, 8);

    const formData = new FormData();
    const file = new File([oversizedBuffer], "large.png", {
      type: "image/png",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toMatch(/exceeds/i);
  });

  it("returns 400 Bad Request for disallowed image MIME type", async () => {
    const formData = new FormData();
    const file = new File([Buffer.from("echo hello")], "malicious.sh", {
      type: "application/x-sh",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toMatch(/Invalid image type/i);
  });

  it("returns 400 Bad Request when image magic bytes do not match MIME type", async () => {
    // Fake PNG claim with plain text contents
    const formData = new FormData();
    const file = new File(
      [Buffer.from("NOT_A_REAL_PNG_FILE_HEADER")],
      "fake.png",
      {
        type: "image/png",
      }
    );
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toMatch(/magic bytes/i);
  });

  it("successfully validates, persists, and links valid PNG image asset", async () => {
    const formData = new FormData();
    const file = new File([VALID_PNG_BUFFER], "hero.png", {
      type: "image/png",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.slug).toBe("laser-loon");
    expect(data.data.hero_image_url).toMatch(
      /^\/api\/media\/project-laser-loon-/
    );

    // Verify GET /api/media/[key] route serves the stored asset correctly
    const key = data.data.key;
    const mediaReq = new NextRequest(`http://localhost:3000/api/media/${key}`);
    const mediaRes = await getMediaAssetRoute(mediaReq, {
      params: Promise.resolve({ key }),
    });

    expect(mediaRes.status).toBe(200);
    expect(mediaRes.headers.get("Content-Type")).toBe("image/png");
    expect(mediaRes.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(mediaRes.headers.get("Cache-Control")).toContain("immutable");
  });

  it("preserves prior asset when database update fails", async () => {
    vi.mocked(CaseStudyService.updateCaseStudyImage).mockRejectedValue(
      new Error("Database connection lost")
    );

    const formData = new FormData();
    const file = new File([VALID_JPEG_BUFFER], "hero.jpg", {
      type: "image/jpeg",
    });
    formData.append("file", file);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "POST",
        body: formData,
      }
    );

    const res = await POST(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(500);

    // Verify updateCaseStudyImage was called to roll back to prior asset
    expect(CaseStudyService.updateCaseStudyImage).toHaveBeenCalledWith(
      "laser-loon",
      "/api/media/project-laser-loon-old.png"
    );
  });

  it("clears project hero image on DELETE request from authorized admin", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/admin/projects/laser-loon/image",
      {
        method: "DELETE",
      }
    );

    const res = await DELETE(req, {
      params: Promise.resolve({ slug: "laser-loon" }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.hero_image_url).toBeNull();
    expect(CaseStudyService.updateCaseStudyImage).toHaveBeenCalledWith(
      "laser-loon",
      null
    );
  });
});
