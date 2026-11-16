"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { notifyMemberChanged, useMemberName } from "@/entities/member";
import { callAction, useSubmitLock } from "@/shared/lib";
import { getWishAction, toggleWishAction } from "../api/wishActions";

/** 찜 버튼. 상태는 aria-pressed로 알린다. */
export function WishButton({ productId, productName }: { productId: string; productName: string }) {
  const name = useMemberName();
  const pathname = usePathname();
  const [wished, setWished] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const lock = useSubmitLock();

  useEffect(() => {
    if (!name) return;
    let alive = true;
    // 불러오지 못하면 버튼을 켜 둔 채(눌러서 다시 시도) 둔다.
    void callAction(
      () => getWishAction(productId),
      () => false,
    ).then((value) => {
      if (!alive) return;
      // 서버 세션이 없으면 서버가 쿠키를 지웠다. 로그인 안내로 바꾼다.
      if (value === null) notifyMemberChanged();
      setWished(value);
    });
    return () => {
      alive = false;
    };
  }, [name, productId]);

  if (!name) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="inline-flex min-h-11 items-center text-sm text-mute-100 underline">
        로그인하고 찜하기
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={wished === true}
        disabled={pending || wished === null}
        onClick={() => {
          if (!lock.tryLock()) return;
          startTransition(async () => {
            const result = await callAction(() => toggleWishAction(productId));
            lock.release();
            if (result.ok) {
              setWished(Boolean(result.wished));
              setMessage(result.wished ? `${productName}을(를) 찜했습니다.` : "찜을 해제했습니다.");
            } else setMessage(result.message ?? "");
          });
        }}
        className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white aria-pressed:border-brand aria-pressed:text-brand disabled:opacity-60"
      >
        <span aria-hidden="true">{wished ? "♥ " : "♡ "}</span>찜하기
      </button>
      <p role="status" className="text-sm text-mute-100">
        {message}
      </p>
    </div>
  );
}
