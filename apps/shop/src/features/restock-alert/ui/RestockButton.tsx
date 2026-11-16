"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { notifyMemberChanged, useMemberName } from "@/entities/member";
import { callAction, useSubmitLock } from "@/shared/lib";
import { getRestockAction, toggleRestockAction } from "../api/actions";

/** 품절 상품의 재입고 알림 신청. 토글 버튼이라 상태는 aria-pressed로 알리고, 버튼 이름은 그대로 둔다. */
export function RestockButton({ productId }: { productId: string }) {
  const name = useMemberName();
  const pathname = usePathname();
  const [on, setOn] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const lock = useSubmitLock();

  useEffect(() => {
    if (!name) return;
    let alive = true;
    void callAction(
      () => getRestockAction(productId),
      () => false,
    ).then((value) => {
      if (!alive) return;
      // 서버 세션이 없으면 서버가 쿠키를 지웠다. 로그인 안내로 바꾼다.
      if (value === null) notifyMemberChanged();
      setOn(value);
    });
    return () => {
      alive = false;
    };
  }, [name, productId]);

  if (!name) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="inline-flex min-h-11 items-center text-sm text-mute-100 underline">
        로그인하고 재입고 알림 신청
      </Link>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-pressed={on === true}
        disabled={pending || on === null}
        onClick={() => {
          if (!lock.tryLock()) return;
          startTransition(async () => {
            const result = await callAction(() => toggleRestockAction(productId, !on));
            lock.release();
            if (result.ok) setOn(Boolean(result.on));
            setMessage(result.message);
          });
        }}
        className="min-h-12 rounded-md border border-cream px-6 font-medium hover:bg-cream hover:text-ink aria-pressed:bg-cream aria-pressed:text-ink disabled:opacity-60"
      >
        {/* 상태는 aria-pressed로 알리므로 이름은 바꾸지 않는다. 눈으로는 채운 배경과 ✓로 구분한다. */}
        <span aria-hidden="true">{on ? "✓ " : ""}</span>재입고 알림 신청
      </button>
      <p role="status" className="min-h-5 text-sm text-mute-100">
        {message}
      </p>
    </div>
  );
}
