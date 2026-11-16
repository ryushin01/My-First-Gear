"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AdminShell } from "@/widgets/admin-shell";

/** 화면을 그리다 난 오류의 경계(error.tsx). 서버 로그와 맞춰 볼 수 있게 오류 식별자(digest)를 보여 준다. */
export function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";

  return (
    <AdminShell title="화면을 그리지 못했습니다">
      <p className="mb-4">잠시 연결이 끊겼거나 문제가 생겼습니다. 다시 시도하거나 대시보드로 돌아가 주세요.</p>
      {digest && <p className="mb-4 is-size-7 has-text-grey-dark">오류 식별자: {digest}</p>}
      <div className="buttons">
        <button type="button" className="button is-link" onClick={() => retry()}>
          다시 시도
        </button>
        <Link href="/" className="button">
          대시보드로
        </Link>
      </div>
    </AdminShell>
  );
}
