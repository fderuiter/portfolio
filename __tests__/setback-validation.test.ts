import { describe, it, expect } from "vitest";
import { validateSetback } from "../lib/setback-validation";

describe("Setback Validation Rules", () => {
  it("passes for a valid setback", () => {
    const validSetback = {
      title: "Kubernetes Out Of Memory Failures",
      editorial_content: "We experienced frequent OOM kills in our parsing pod because of large clinical XML file chunks. Resolving it required streaming XML with SAX and limiting the buffer size."
    };
    const errors = validateSetback(validSetback);
    expect(errors).toHaveLength(0);
  });

  it("rejects missing fields", () => {
    const invalidSetback = {
      title: "",
      editorial_content: ""
    };
    const errors = validateSetback(invalidSetback);
    expect(errors).toContain("Missing required field: title");
    expect(errors).toContain("Missing required field: editorial_content");
  });

  it("rejects title length outside 10-100 characters", () => {
    const shortTitle = {
      title: "Too short",
      editorial_content: "We experienced frequent OOM kills in our parsing pod because of large clinical XML file chunks."
    };
    const longTitle = {
      title: "A".repeat(101),
      editorial_content: "We experienced frequent OOM kills in our parsing pod because of large clinical XML file chunks."
    };
    expect(validateSetback(shortTitle)).toContain("Title must be between 10 and 100 characters.");
    expect(validateSetback(longTitle)).toContain("Title must be between 10 and 100 characters.");
  });

  it("rejects content length outside 20-500 characters", () => {
    const shortContent = {
      title: "Kubernetes Out Of Memory",
      editorial_content: "Too short"
    };
    const longContent = {
      title: "Kubernetes Out Of Memory",
      editorial_content: "A".repeat(501)
    };
    expect(validateSetback(shortContent)).toContain("Content must be between 20 and 500 characters.");
    expect(validateSetback(longContent)).toContain("Content must be between 20 and 500 characters.");
  });

  it("rejects HTML tags to prevent layout problems or injection", () => {
    const htmlInTitle = {
      title: "Kubernetes <b>OOM</b> Failures",
      editorial_content: "We experienced frequent OOM kills in our parsing pod because of large clinical XML file chunks."
    };
    const htmlInContent = {
      title: "Kubernetes OOM Failures",
      editorial_content: "We experienced frequent <script>alert(1)</script> OOM kills in our parsing pod."
    };
    expect(validateSetback(htmlInTitle)).toContain("HTML tags are not allowed in setback title.");
    expect(validateSetback(htmlInContent)).toContain("HTML tags are not allowed in setback content.");
  });

  it("rejects unprofessional or sensitive words in tone checks", () => {
    const unprofessionalContent = {
      title: "Kubernetes OOM Failures",
      editorial_content: "Our developers were so lazy and did a stupid job parsing files, causing a piece of crap pipeline."
    };
    const errors = validateSetback(unprofessionalContent);
    expect(errors).toContain("Content contains unprofessional tone or negative/sensitive language.");
  });

  it("rejects sensitive credential formats", () => {
    const credentialContent = {
      title: "Kubernetes OOM Failures",
      editorial_content: "The API was failing because we used postgresql://admin:secret123@db.example.com/mydb instead of safe env vars."
    };
    const errors = validateSetback(credentialContent);
    expect(errors).toContain("Sensitive or credential information detected in setback content: [Database Connection String (with credentials)]");
  });
});
