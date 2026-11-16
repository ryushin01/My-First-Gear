"use client";

import { useSyncExternalStore } from "react";

/**
 * 다시 들어온 재입고 알림 상품 수. 회원 동기화가 로그인 뒤 처음 불러올 때 채우고, 마이페이지에서 담아 알림을 마치면 줄인다.
 * 화면을 옮겨도 머리글에 남도록 모듈에 둔다(새로 고치면 다시 불러온다).
 * 회원별로 센다. 다른 회원으로 바뀐 뒤 도착한 이전 회원의 결과는 버리고, 불러오는 사이 마친 알림은 불러온 수에서 뺀다.
 */
type Notice = { member: string | null; count: number; doneSinceLoad: number };

let notice: Notice = { member: null, count: 0, doneSinceLoad: 0 };
const listeners = new Set<() => void>();

function emit(next: Notice) {
  notice = next;
  listeners.forEach((listener) => listener());
}

/** 회원 동기화가 불러오기를 시작할 때 부른다. 다른 회원이면 수를 비운다. */
export function startRestockLoad(member: string) {
  emit(notice.member === member ? { ...notice, doneSinceLoad: 0 } : { member, count: 0, doneSinceLoad: 0 });
}

/** 불러온 수를 적는다. 그사이 다른 회원으로 바뀌었으면 버리고, 불러오는 사이 마친 알림은 뺀다. member가 null이면(로그아웃) 비운다. */
export function setRestockedCount(member: string | null, count: number) {
  if (member === null) {
    emit({ member: null, count: 0, doneSinceLoad: 0 });
    return;
  }
  if (notice.member !== member) return;
  emit({ ...notice, count: Math.max(0, count - notice.doneSinceLoad) });
}

/** 알림 하나를 마쳤다. 알림을 마친 회원과 지금 수의 회원이 다르면(그사이 다른 회원으로 로그인) 무시한다. */
export function decreaseRestockedCount(member: string | null) {
  if (!member || notice.member !== member) return;
  emit({ ...notice, count: Math.max(0, notice.count - 1), doneSinceLoad: notice.doneSinceLoad + 1 });
}

export function useRestockedCount(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => notice.count,
    () => 0,
  );
}
