"use client";

import { useSyncExternalStore } from "react";

/**
 * 다시 들어온 재입고 알림 상품 수. 회원 동기화가 로그인 뒤 처음 불러올 때 채우고, 알림을 마치거나 바꾸면 서버에서 다시 받는다.
 * 화면을 옮겨도 머리글에 남도록 모듈에 둔다(새로 고치면 다시 불러온다).
 *
 * 클라이언트에서 더하거나 빼지 않는다. 서버가 이미 반영한 변경을 두 번 셀 수 있고, 이름이 같은 다른 회원을 가리지 못하기 때문이다.
 * 대신 요청마다 번호를 매겨, 가장 최근에 보낸 요청의 결과만 적는다(늦게 온 이전 요청의 결과는 버린다).
 */
let count = 0;
let issued = 0;
let applied = 0;
const listeners = new Set<() => void>();

function emit(next: number) {
  count = Math.max(0, next);
  listeners.forEach((listener) => listener());
}

/** 수를 묻는 요청을 보내기 전에 번호를 받는다. */
export function nextRestockRequest(): number {
  issued += 1;
  return issued;
}

/** 요청의 결과를 적는다. 그 뒤에 보낸 요청의 결과가 이미 적혔으면 버린다. */
export function applyRestockedCount(request: number, next: number) {
  if (request < applied) return;
  applied = request;
  emit(next);
}

/** 로그아웃하면 비운다. 그전에 보낸 요청의 결과는 버린다. */
export function resetRestockedCount() {
  applied = nextRestockRequest();
  emit(0);
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
