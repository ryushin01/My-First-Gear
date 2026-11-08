"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useMemberName } from "@/entities/member";
import { useSubmitLock } from "@/shared/lib";
import { getRestockAction, toggleRestockAction } from "../api/restockActions";

/** 품절 상품의 재입고 알림 신청 (상태는 aria-pressed로 알린다) */
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
    getRestockAction(productId).then((value) => alive && setOn(value));
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
            const result = await toggleRestockAction(productId, !on);
            lock.release();
            if (result.ok) setOn(Boolean(result.on));
            setMessage(result.message);
          });
        }}
        className="min-h-12 rounded-md border border-cream px-6 font-medium hover:bg-cream hover:text-ink aria-pressed:bg-cream aria-pressed:text-ink disabled:opacity-60"
      >
        {on ? "재입고 알림 신청됨" : "재입고 알림 신청"}
      </button>
      <p role="status" className="min-h-5 text-sm text-mute-100">
        {message}
      </p>
    </div>
  );
}
