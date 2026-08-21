"use client";

export {
  useAnnouncer,
  A11yProvider as LiveAnnouncerProvider,
  sanitizePII,
  announcerReducer,
  initialAnnouncerState,
} from "@/components/providers/A11yProvider";
export type {
  Priority,
  Priority as AnnouncementMode,
  AnnouncerContextType,
  AnnounceItem,
  AnnouncerState,
  AnnouncerAction,
} from "@/components/providers/A11yProvider";

