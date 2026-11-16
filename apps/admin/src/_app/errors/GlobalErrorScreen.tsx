"use client";

import { useEffect } from "react";
import "bulma/css/bulma.min.css";

/** 루트 레이아웃까지 실패했을 때의 화면(global-error.tsx). 레이아웃을 대신하므로 html·body를 직접 둔다. */
export function GlobalErrorScreen({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko" data-theme="light">
      <body>
        <title>화면을 그리지 못했습니다 · My First Gear 어드민</title>
        <main className="section">
          <div className="container" style={{ maxWidth: 560 }}>
            <h1 className="title">화면을 그리지 못했습니다</h1>
            <p className="mb-4">잠시 연결이 끊겼거나 문제가 생겼습니다. 다시 시도하거나 대시보드로 돌아가 주세요.</p>
            <div className="buttons">
              <button type="button" className="button is-link" onClick={() => retry()}>
                다시 시도
              </button>
              {/* 앱 틀이 망가진 상태라 전체 페이지를 다시 불러온다. */}
              <a href="/" className="button">
                대시보드로
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
