"use client";

import { useId, type MouseEvent, type ReactNode } from "react";

/**
 * 본문 바로가기와 본문 영역.
 * Cache Components는 이전 화면을 숨긴 채 DOM에 남기므로 main id를 화면마다 다르게 만들고,
 * 바로가기는 자기 화면의 main으로만 초점을 옮긴다.
 */
export function ScreenShell({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const mainId = `main${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  function skip(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById(mainId);
    if (!main) return;
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <a
        href={`#${mainId}`}
        onClick={skip}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:bg-cream focus:px-3 focus:py-2 focus:text-ink"
      >
        본문 바로가기
      </a>
      {header}
      <main id={mainId} tabIndex={-1} className="crt-content min-w-0 flex-1 px-5 md:px-16">
        {children}
      </main>
      {footer}
    </>
  );
}
