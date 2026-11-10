"use client";

import { useSyncExternalStore } from "react";
import type { SetupSlotId, SetupState } from "@mfg/catalog";
import { createLocalStore } from "@/shared/lib";

const store = createLocalStore<SetupState>("mfg:setup", {});

export function useSetupState(): SetupState {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

export function pickSetupItem(slot: SetupSlotId, productId: string) {
  store.set((state) => ({ ...state, [slot]: productId }));
}

export function clearSetupItem(slot: SetupSlotId) {
  store.set((state) => {
    const next = { ...state };
    delete next[slot];
    return next;
  });
}

export function replaceSetup(next: SetupState) {
  store.set(next);
}

export function resetSetup() {
  store.set({});
}
