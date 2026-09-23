"use client";

import { useState } from "react";
import type {
  CRFField,
  StudyReviewActor,
  StudyReviewRole,
  StudyReviewThread,
} from "@/lib/crf";

interface ReviewThreadsTabProps {
  threads: StudyReviewThread[];
  selectedField: CRFField | null;
  author: StudyReviewActor;
  onAuthorChange: (author: StudyReviewActor) => void;
  onAddComment: (
    fieldId: string,
    body: string,
    author: StudyReviewActor
  ) => void;
  onSetStatus: (
    threadId: string,
    status: "resolved" | "open",
    author: StudyReviewActor
  ) => void;
  getStatus: (thread: StudyReviewThread) => "open" | "resolved";
}

const REVIEW_ROLES: StudyReviewRole[] = [
  "Data Manager",
  "Medical Monitor",
  "Biostatistician",
  "Clinical Reviewer",
];

export function ReviewThreadsTab({
  threads,
  selectedField,
  author,
  onAuthorChange,
  onAddComment,
  onSetStatus,
  getStatus,
}: ReviewThreadsTabProps) {
  const [comment, setComment] = useState("");
  const actor = { ...author, name: author.name.trim() };
  const fieldThread = selectedField
    ? threads.find((thread) => thread.target.fieldId === selectedField.id)
    : undefined;

  const submitComment = () => {
    if (!selectedField || !actor.name || !comment.trim()) return;
    onAddComment(selectedField.id, comment.trim(), actor);
    setComment("");
  };

  return (
    <section className="space-y-4 p-4" aria-label="Local field review threads">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-100">
          Local authoring review
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
          Saved with this study. These notes are separate from simulated EDC
          audit history and do not represent a shared account.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <label
            className="text-[10px] text-zinc-400"
            htmlFor="review-author-name"
          >
            Reviewer name
            <input
              id="review-author-name"
              value={author.name}
              onChange={(event) =>
                onAuthorChange({ ...author, name: event.target.value })
              }
              autoComplete="name"
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100"
              placeholder="Enter your name"
            />
          </label>
          <label
            className="text-[10px] text-zinc-400"
            htmlFor="review-author-role"
          >
            Reviewer role
            <select
              id="review-author-role"
              value={author.role}
              onChange={(event) =>
                onAuthorChange({
                  ...author,
                  role: event.target.value as StudyReviewRole,
                })
              }
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100"
            >
              {REVIEW_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {selectedField && (
        <div className="rounded-lg border border-zinc-800 p-3">
          <h4 className="text-xs font-semibold text-zinc-100">
            {fieldThread ? "Continue field thread" : "Start a field thread"}
          </h4>
          <p className="mt-1 text-[11px] text-zinc-400">
            {selectedField.variableName} · {selectedField.label}
          </p>
          <label className="sr-only" htmlFor="review-comment">
            Review comment
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs text-zinc-100"
            placeholder="Add context or a question about this field"
          />
          <button
            type="button"
            onClick={submitComment}
            disabled={!actor.name || !comment.trim()}
            className="mt-2 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 enabled:hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add comment
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-zinc-100">Field threads</h4>
          <span className="font-mono text-[10px] text-amber-300">
            {threads.filter((thread) => getStatus(thread) === "open").length}{" "}
            open
          </span>
        </div>
        {threads.length === 0 ? (
          <p className="rounded border border-dashed border-zinc-800 p-3 text-xs text-zinc-500">
            No review threads in this form yet. Select a field to start one.
          </p>
        ) : (
          threads.map((thread) => {
            const status = getStatus(thread);
            const latestTarget = [...thread.events]
              .reverse()
              .find((event) => event.type === "target-renamed");
            const deleted = thread.events.some(
              (event) => event.type === "target-deleted"
            );
            const variableName =
              latestTarget?.type === "target-renamed"
                ? latestTarget.nextVariableName
                : thread.target.variableName;
            const label =
              latestTarget?.type === "target-renamed"
                ? latestTarget.nextLabel
                : thread.target.label;

            return (
              <article
                key={thread.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-xs font-semibold text-zinc-100">
                      {variableName} · {label}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {deleted
                        ? "Deleted field · history retained"
                        : thread.target.formName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase ${
                      status === "open"
                        ? "border-amber-500/30 text-amber-300"
                        : "border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <ol className="mt-3 space-y-2 border-l border-zinc-800 pl-3">
                  {thread.events.map((event) => (
                    <li key={event.id} className="text-[11px]">
                      <p className="leading-relaxed text-zinc-300">
                        {event.type === "comment" && event.body}
                        {event.type === "resolved" && "Resolved this thread."}
                        {event.type === "reopened" && "Reopened this thread."}
                        {event.type === "target-renamed" &&
                          `Field renamed from ${event.previousVariableName} to ${event.nextVariableName}.`}
                        {event.type === "target-deleted" &&
                          `Field ${event.target.variableName} was deleted; this discussion remains attached to its stable identity.`}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-[9px] text-zinc-500">
                        <span>
                          {event.author.name} · {event.author.role}
                        </span>
                        <time dateTime={event.at}>{event.at}</time>
                      </p>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() =>
                    onSetStatus(
                      thread.id,
                      status === "open" ? "resolved" : "open",
                      actor
                    )
                  }
                  disabled={!actor.name}
                  className="mt-3 rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 enabled:hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "open" ? "Resolve thread" : "Reopen thread"}
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
