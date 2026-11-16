"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "../createLocalStore";

type LocalStore<T> = ReturnType<typeof createLocalStore<T>>;

type ShareUndoOptions<T> = {
  /** 저장된 "이전 값"을 정리하는 함수 (createLocalStore의 parse와 같다) */
  parse: (value: unknown) => T | null;
  /** 비어 있는 값이면 남길 필요가 없다 */
  isEmpty: (value: T) => boolean;
  /** 공유 값과 지금 값이 같으면 바꾸지 않는다 */
  same: (a: T, b: T) => boolean;
};

/**
 * 공유 주소로 받은 값으로 바꾸면서, 고르던 값을 따로 남겨 "이전 ○○으로 되돌리기"를 할 수 있게 한다. (PC 견적, 데스크 셋업)
 * 화면은 적용한 뒤 주소에서 공유 값을 지워, 새로 고쳐도 고친 내용을 다시 덮어쓰지 않게 한다.
 */
export function createShareUndo<T>(store: LocalStore<T>, previousKey: string, { parse, isEmpty, same }: ShareUndoOptions<T>) {
  const previous = createLocalStore<T | null>(previousKey, null, parse);
  return {
    usePrevious(): T | null {
      return useSyncExternalStore(previous.subscribe, previous.get, previous.getServer);
    },
    apply(next: T) {
      const current = store.get();
      if (same(current, next)) return;
      previous.set(isEmpty(current) ? null : current);
      store.set(next);
    },
    restore() {
      const saved = previous.get();
      if (!saved) return;
      store.set(saved);
      previous.set(null);
    },
    dismiss() {
      previous.set(null);
    },
  };
}
