import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudyProtocolEngine } from "@/lib/crf";
import type { StudyReviewActor } from "@/lib/crf";
import { ReviewThreadsTab } from "@/components/crf/RightInspector/ReviewThreadsTab";

describe("field review thread controls", () => {
  it("requires a declared author and emits field comments and status changes", () => {
    const { form } = StudyProtocolEngine.addForm(
      StudyProtocolEngine.createInitialStudy(),
      "VS"
    );
    const field = form.sections[0]?.fields[0];
    expect(field).toBeDefined();
    if (!field) throw new Error("The starter study needs a field");

    const author: StudyReviewActor = {
      name: "Study author",
      role: "Data Manager",
    };
    const { thread } = StudyProtocolEngine.addReviewComment(
      { ...StudyProtocolEngine.createInitialStudy(), forms: [form] },
      field.id,
      "Existing review note.",
      author,
      "2026-09-20T14:00:00.000Z"
    );
    const onAddComment = vi.fn();
    const onSetStatus = vi.fn();
    let status: "open" | "resolved" = "open";
    const getStatus = () => status;
    const { rerender } = render(
      <ReviewThreadsTab
        threads={[thread]}
        selectedField={field}
        author={author}
        onAuthorChange={vi.fn()}
        onAddComment={onAddComment}
        onSetStatus={onSetStatus}
        getStatus={getStatus}
      />
    );

    fireEvent.change(screen.getByLabelText("Review comment"), {
      target: { value: "Please review the wording." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith(
      field.id,
      "Please review the wording.",
      author
    );
    expect(screen.getByText("Existing review note.")).toBeTruthy();
    expect(screen.getByText("1 open")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Resolve thread" }));
    expect(onSetStatus).toHaveBeenLastCalledWith(thread.id, "resolved", author);

    status = "resolved";
    rerender(
      <ReviewThreadsTab
        threads={[thread]}
        selectedField={field}
        author={author}
        onAuthorChange={vi.fn()}
        onAddComment={onAddComment}
        onSetStatus={onSetStatus}
        getStatus={getStatus}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Reopen thread" }));
    expect(onSetStatus).toHaveBeenLastCalledWith(thread.id, "open", author);
  });
});
