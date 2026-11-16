"use client";

import { useEffect } from "react";
import { fontVariables } from "../fonts";
import { reportError } from "../monitoring";
import "../styles/globals.css";

/**
 * 루트 레이아웃까지 실패했을 때의 화면(global-error.tsx). 레이아웃을 대신하므로 html·body·전역 스타일을 직접 둔다.
 * 앱의 다른 부분에 기대지 않도록 브라운관 틀만 그리고, 홈으로는 전체 페이지를 다시 불러온다.
 */
export function GlobalErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang="ko" className={fontVariables} data-bw="off">
      <body>
        <title>화면을 그리지 못했습니다 · My First Gear</title>
        <div aria-hidden="true" className="crt-overlay" />
        <div className="crt-screen">
          <main className="crt-content flex flex-1 flex-col justify-center gap-6 px-5 py-24 md:px-16">
            <p className="mono-label">[Error · Signal lost]</p>
            <h1 className="font-display text-5xl leading-none md:text-7xl">화면을 그리지 못했습니다</h1>
            <p className="max-w-2xl text-mute-100">잠시 연결이 끊겼거나 문제가 생겼습니다. 다시 시도하거나 홈으로 돌아가 주세요.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => retry()} className="min-h-11 rounded-md bg-cream px-5 font-medium text-ink hover:bg-white">
                다시 시도
              </button>
              {/* 앱 틀이 망가진 상태라 클라이언트 이동 대신 전체 페이지를 다시 불러온다. */}
              <a href="/" className="inline-flex min-h-11 items-center rounded-md border border-white/30 px-5 hover:border-white">
                홈으로
              </a>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
