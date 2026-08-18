"use client";

import { createStore, Store } from "../pubsub-store";

export interface CRFStudioStoreState {
  selectedFieldId: string | null;
  activeFormId: string;
}

export const crfStudioStore: Store<CRFStudioStoreState> = createStore<CRFStudioStoreState>({
  selectedFieldId: null,
  activeFormId: "",
});
