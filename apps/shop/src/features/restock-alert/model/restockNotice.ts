"use client";

import { useSyncExternalStore } from "react";

/**
 * 다시 들어온 재입고 알림 상품 수. 회원 동기화가 로그인 뒤 처음 불러올 때 채우고, 마이페이지에서 담거나 알림을 지우면 줄인다.
 * 화면을 옮겨도 머리글에 남도록 모듈에 둔다(새로 고치면 다시 불러온다).
 */
let count = 0;
const listeners = new Set<() => void>();

function emit(next: number) {
  count = Math.max(0, next);
  listeners.forEach((listener) => listener());
}

export function setRestockedCount(next: number) {
  emit(next);
}

export function decreaseRestockedCount() {
  emit(count - 1);
}

export function useRestockedCount(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => count,
    () => 0,
  );
}
