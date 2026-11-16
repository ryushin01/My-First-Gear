"use client";

import { useRestockedCount } from "../model/restockNotice";

/** 머리글 My 옆 재입고 알림 수. 장바구니 수량과 같은 모양이다. 없으면 그리지 않는다. */
export function RestockedBadge() {
  const count = useRestockedCount();
  if (count === 0) return null;
  return (
    <span className="ml-1 tabular-nums text-brand">
      [입고 {count}]<span className="sr-only">건, 재입고 알림</span>
    </span>
  );
}
