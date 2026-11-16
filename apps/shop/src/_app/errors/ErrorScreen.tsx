"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { reportError } from "../monitoring";

/**
 * 화면을 그리다 난 오류의 경계(error.tsx). 오류를 모니터링(Sentry, DSN이 있을 때)으로 보내고 다시 시도할 수 있게 한다.
 * 저장값·회원 상태를 읽는 머리글 부분은 빼고 그린다(그 부분이 원인이어도 다시 죽지 않게).
 */
export function ErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <CrtScreen source="SIGNAL LOST" bare>
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Error · Signal lost" title="화면을 그리지 못했습니다">
          잠시 연결이 끊겼거나 문제가 생겼습니다. 다시 시도하거나 홈으로 돌아가 주세요.
        </PageHeading>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => retry()} className="min-h-11 rounded-md bg-cream px-5 font-medium text-ink hover:bg-white">
            다시 시도
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md border border-white/30 px-5 hover:border-white">
            홈으로
          </Link>
        </div>
      </div>
    </CrtScreen>
  );
}
