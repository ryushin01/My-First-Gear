"use client";

import Link from "next/link";
import { useMemberName } from "@/entities/member";
import { RestockedBadge, useRestockedCount } from "@/features/restock-alert";

export function AccountLink() {
  const name = useMemberName();
  const restocked = useRestockedCount();
  // 다시 들어온 재입고 알림 상품이 있으면 마이페이지의 재입고 목록으로 바로 보낸다.
  const href = name ? (restocked > 0 ? "/my#my-restock" : "/my") : "/login";
  return (
    <Link href={href} className="inline-flex min-h-8 items-center hover:text-cream">
      {name ? (
        <>
          My<span className="sr-only">페이지 ({name}님)</span>
          <RestockedBadge />
        </>
      ) : (
        "로그인"
      )}
    </Link>
  );
}
