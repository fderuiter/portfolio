import { describe, it, expect, expectTypeOf } from "vitest";
import {
  COMMAND_REGISTRY,
  Study,
  Subject,
  RecordsSearchResult,
} from "../lib/cliContracts";

describe("CLI Contracts Verification Suite", () => {
  it("should have all expected command keys registered", () => {
    const keys = Object.keys(COMMAND_REGISTRY);
    expect(keys).toContain("imednet studies list");
    expect(keys).toContain("imednet subjects get --id 123");
    expect(keys).toContain("imednet records search --study BRIGHT-01");
    expect(keys.length).toBe(3);
  });

  it("should verify each registered command has a non-empty description", () => {
    for (const key of Object.keys(COMMAND_REGISTRY) as Array<keyof typeof COMMAND_REGISTRY>) {
      const command = COMMAND_REGISTRY[key];
      expect(command.description).toBeDefined();
      expect(typeof command.description).toBe("string");
      expect(command.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("should enforce strict type-level contracts via TypeScript types using expectTypeOf", () => {
    // Verify that the payload type matches Study[]
    expectTypeOf(COMMAND_REGISTRY["imednet studies list"].payload).toEqualTypeOf<Study[]>();

    // Verify that the payload type matches Subject
    expectTypeOf(COMMAND_REGISTRY["imednet subjects get --id 123"].payload).toEqualTypeOf<Subject>();

    // Verify that the payload type matches RecordsSearchResult
    expectTypeOf(COMMAND_REGISTRY["imednet records search --study BRIGHT-01"].payload).toEqualTypeOf<RecordsSearchResult>();
  });

  describe("Payload structures validation", () => {
    it("should validate 'imednet studies list' payload contents and schema", () => {
      const payload = COMMAND_REGISTRY["imednet studies list"].payload;
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBeGreaterThan(0);

      for (const study of payload) {
        expect(study).toHaveProperty("studyID");
        expect(study).toHaveProperty("name");
        expect(study).toHaveProperty("status");
        expect(study).toHaveProperty("subjectsCount");
        expect(study).toHaveProperty("version");

        expect(typeof study.studyID).toBe("string");
        expect(typeof study.name).toBe("string");
        expect(["ACTIVE", "ENROLLING", "COMPLETED"]).toContain(study.status);
        expect(typeof study.subjectsCount).toBe("number");
        expect(typeof study.version).toBe("string");
      }
    });

    it("should validate 'imednet subjects get --id 123' payload contents and schema", () => {
      const payload = COMMAND_REGISTRY["imednet subjects get --id 123"].payload;
      expect(payload).toBeDefined();
      expect(typeof payload).toBe("object");

      expect(payload).toHaveProperty("subjectID");
      expect(payload).toHaveProperty("studyID");
      expect(payload).toHaveProperty("siteID");
      expect(payload).toHaveProperty("enrollmentDate");
      expect(payload).toHaveProperty("status");
      expect(payload).toHaveProperty("recordsCount");
      expect(payload).toHaveProperty("complianceScore");
      expect(payload).toHaveProperty("demographics");
      expect(payload).toHaveProperty("lastVisit");

      expect(typeof payload.subjectID).toBe("string");
      expect(typeof payload.studyID).toBe("string");
      expect(typeof payload.siteID).toBe("number");
      expect(typeof payload.enrollmentDate).toBe("string");
      expect(typeof payload.status).toBe("string");
      expect(typeof payload.recordsCount).toBe("number");
      expect(typeof payload.complianceScore).toBe("string");
      expect(typeof payload.lastVisit).toBe("string");

      const demo = payload.demographics;
      expect(demo).toBeDefined();
      expect(typeof demo).toBe("object");
      expect(demo).toHaveProperty("age");
      expect(demo).toHaveProperty("gender");
      expect(demo).toHaveProperty("ethnicity");
      expect(typeof demo.age).toBe("number");
      expect(typeof demo.gender).toBe("string");
      expect(typeof demo.ethnicity).toBe("string");
    });

    it("should validate 'imednet records search --study BRIGHT-01' payload contents and schema", () => {
      const payload = COMMAND_REGISTRY["imednet records search --study BRIGHT-01"].payload;
      expect(payload).toBeDefined();
      expect(typeof payload).toBe("object");

      expect(payload).toHaveProperty("studyID");
      expect(payload).toHaveProperty("totalRecordsMatched");
      expect(payload).toHaveProperty("domain");
      expect(payload).toHaveProperty("results");

      expect(typeof payload.studyID).toBe("string");
      expect(typeof payload.totalRecordsMatched).toBe("number");
      expect(typeof payload.domain).toBe("string");
      expect(Array.isArray(payload.results)).toBe(true);

      for (const result of payload.results) {
        expect(result).toHaveProperty("subjectID");
        expect(result).toHaveProperty("visitName");
        expect(result).toHaveProperty("heartRate");
        expect(result).toHaveProperty("tempCelsius");
        expect(result).toHaveProperty("systolicBP");
        expect(result).toHaveProperty("diastolicBP");
        expect(result).toHaveProperty("timestamp");

        expect(typeof result.subjectID).toBe("string");
        expect(typeof result.visitName).toBe("string");
        expect(typeof result.heartRate).toBe("number");
        expect(typeof result.tempCelsius).toBe("number");
        expect(typeof result.systolicBP).toBe("number");
        expect(typeof result.diastolicBP).toBe("number");
        expect(typeof result.timestamp).toBe("string");
      }
    });
  });
});
