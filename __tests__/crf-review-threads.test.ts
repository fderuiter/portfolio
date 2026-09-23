import { describe, expect, it } from "vitest";
import {
  StudyProtocolEngine,
  exportUniversalCrfJson,
  loadStudyDraft,
  parseUniversalCrf,
  saveStudyDraft,
  type StudyReviewActor,
} from "@/lib/crf";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
}

describe("StudyProtocol review threads", () => {
  it("attributes ordinary field deletion to the declared reviewer", () => {
    const { study, form } = StudyProtocolEngine.addForm(
      StudyProtocolEngine.createInitialStudy(),
      "VS"
    );
    const field = form?.sections[0]?.fields[0];
    expect(field).toBeDefined();
    if (!form || !field) throw new Error("The starter study needs a field");

    const author: StudyReviewActor = {
      name: "Morgan Patel",
      role: "Clinical Reviewer",
    };
    const commented = StudyProtocolEngine.addReviewComment(
      study,
      field.id,
      "Retain this item for review.",
      author,
      "2026-09-20T14:00:00.000Z"
    );
    const deleted = StudyProtocolEngine.removeField(
      commented.study,
      form.id,
      field.id,
      undefined,
      author,
      "2026-09-20T14:05:00.000Z"
    );
    const deletion = deleted.study.reviewThreads?.[0]?.events[1];

    expect(deletion).toMatchObject({
      type: "target-deleted",
      at: "2026-09-20T14:05:00.000Z",
      author,
    });
  });

  it("retains comment, rename, resolve, reopen, deletion, and save history", () => {
    const { study: initial, form } = StudyProtocolEngine.addForm(
      StudyProtocolEngine.createInitialStudy(),
      "VS"
    );
    const field = form?.sections[0]?.fields[0];
    expect(form).toBeDefined();
    expect(field).toBeDefined();
    if (!form || !field) throw new Error("The starter study needs a field");

    const reviewer: StudyReviewActor = {
      name: "Riley Chen",
      role: "Data Manager",
    };
    const author: StudyReviewActor = {
      name: "Jordan Lee",
      role: "Medical Monitor",
    };
    const created = StudyProtocolEngine.addReviewComment(
      initial,
      field.id,
      "Please confirm this question is still needed.",
      reviewer,
      "2026-09-20T14:00:00.000Z"
    );
    const renamed = StudyProtocolEngine.renameFieldEverywhere(
      created.study,
      form.id,
      field.id,
      "REVVAR",
      undefined,
      author,
      "2026-09-20T14:05:00.000Z"
    );
    expect(renamed.error).toBeUndefined();

    const resolved = StudyProtocolEngine.setReviewThreadStatus(
      renamed.study,
      created.thread.id,
      "resolved",
      reviewer,
      "2026-09-20T14:10:00.000Z"
    );
    const reopened = StudyProtocolEngine.setReviewThreadStatus(
      resolved,
      created.thread.id,
      "open",
      author,
      "2026-09-20T14:15:00.000Z"
    );
    const deleted = StudyProtocolEngine.removeFieldWithCascade(
      reopened,
      form.id,
      field.id,
      { purgeReferencingRules: true },
      author,
      "2026-09-20T14:20:00.000Z"
    );
    const storage = new MemoryStorage();

    expect(deleted.removedField?.id).toBe(field.id);
    expect(saveStudyDraft(deleted.study, storage).status).toBe("saved");

    const restored = loadStudyDraft(storage);
    expect(restored.status).toBe("recovered");
    if (restored.status !== "recovered") return;

    const thread = restored.study.reviewThreads?.find(
      (candidate) => candidate.id === created.thread.id
    );
    expect(thread?.target.fieldId).toBe(field.id);
    expect(thread?.events.map((event) => event.type)).toEqual([
      "comment",
      "target-renamed",
      "resolved",
      "reopened",
      "target-deleted",
    ]);
    expect(thread?.events[1]).toMatchObject({
      type: "target-renamed",
      previousVariableName: field.variableName,
      nextVariableName: "REVVAR",
    });
    expect(thread?.events[4]).toMatchObject({
      type: "target-deleted",
      target: { fieldId: field.id, variableName: "REVVAR" },
    });
    expect(thread?.events.map((event) => event.author.name)).toEqual([
      "Riley Chen",
      "Jordan Lee",
      "Riley Chen",
      "Jordan Lee",
      "Jordan Lee",
    ]);
    expect(thread?.events.map((event) => event.at)).toEqual([
      "2026-09-20T14:00:00.000Z",
      "2026-09-20T14:05:00.000Z",
      "2026-09-20T14:10:00.000Z",
      "2026-09-20T14:15:00.000Z",
      "2026-09-20T14:20:00.000Z",
    ]);
    expect(StudyProtocolEngine.getReviewThreadStatus(thread!)).toBe("open");
    expect(StudyProtocolEngine.countOpenReviewThreads(restored.study)).toBe(1);

    const nativeReopen = parseUniversalCrf(
      exportUniversalCrfJson(restored.study)
    );
    expect(nativeReopen.reviewThreads).toEqual(restored.study.reviewThreads);
  });
});
