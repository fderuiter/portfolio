import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import {
  generateOpenApi,
  getExpectedApiRoutes,
} from "@/scripts/generate-openapi";

describe("OpenAPI Specification & Route Parity Test Suite", () => {
  const workspaceRoot = path.resolve(__dirname, "..");

  it("discovers all app/api routes dynamically", () => {
    const routes = getExpectedApiRoutes(workspaceRoot);
    expect(routes).toContain("/api/telemetry");
    expect(routes).toContain("/api/telemetry/sync");
    expect(routes).toContain("/api/cron/maintenance");
    expect(routes).toContain("/api/case-studies");
  });

  it("guarantees 100% route coverage in OpenAPI specification (zero missing routes)", () => {
    const { missingRoutes } = generateOpenApi(workspaceRoot);
    expect(missingRoutes).toEqual([]);
  });

  it("verifies openapi.json is in lockstep with generator script (zero drift)", () => {
    const { hasDrift } = generateOpenApi(workspaceRoot);
    expect(hasDrift).toBe(false);
  });

  it("conforms to valid OpenAPI 3.0.0 structural requirements", () => {
    const openApiFilePath = path.join(workspaceRoot, "openapi.json");
    expect(fs.existsSync(openApiFilePath)).toBe(true);

    const specContent = fs.readFileSync(openApiFilePath, "utf-8");
    const spec = JSON.parse(specContent);

    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBe("Portfolio Service API");
    expect(spec.paths).toBeDefined();

    for (const [routePath, methods] of Object.entries(spec.paths)) {
      expect(routePath.startsWith("/api/")).toBe(true);
      const methodKeys = Object.keys(methods as Record<string, unknown>);
      expect(methodKeys.length).toBeGreaterThan(0);

      for (const method of methodKeys) {
        const operation = (
          methods as Record<string, { summary?: string; responses?: unknown }>
        )[method];
        expect(operation.summary).toBeDefined();
        expect(operation.responses).toBeDefined();
      }
    }

    expect(spec.components?.schemas).toBeDefined();
    expect(spec.components.schemas.CaseStudySummary).toBeDefined();
    expect(spec.components.schemas.TelemetryEvent).toBeDefined();
  });
});
