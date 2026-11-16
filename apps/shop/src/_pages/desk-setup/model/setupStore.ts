"use client";

import { useSyncExternalStore } from "react";
import { encodeSetup, setupSlots, type SetupSlotId, type SetupState } from "@mfg/catalog";
import { createLocalStore } from "@/shared/lib";
import { createShareUndo } from "@/shared/lib/share-undo";

/** 칸 이름을 키로, 상품 id 문자열을 값으로 가진 객체만 받는다. */
function isSetupState(value: unknown): value is SetupState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.entries(value).every(([slot, id]) => setupSlots.some((s) => s.id === slot) && typeof id === "string");
}

const parseSetup = (value: unknown) => (isSetupState(value) ? value : null);
const store = createLocalStore<SetupState>("mfg:setup", {}, parseSetup);
/** 공유 주소로 덮어쓰기 전의 셋업. 되돌리기에 쓴다. */
const share = createShareUndo(store, "mfg:setup:previous", {
  parse: parseSetup,
  isEmpty: (state) => Object.keys(state).length === 0,
  same: (a, b) => encodeSetup(a) === encodeSetup(b),
});

export function useSetupState(): SetupState {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

export const usePreviousSetup = share.usePrevious;

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

/** 공유 주소의 셋업으로 바꾼다. 고르던 셋업이 다르면 되돌릴 수 있게 남겨 둔다. */
export const applySharedSetup = share.apply;
export const restorePreviousSetup = share.restore;
export const dismissPreviousSetup = share.dismiss;

export function resetSetup() {
  store.set({});
}
