import type { ReactNode } from "react";

/** 채널 라벨과 큰 세리프 제목 */
export function PageHeading({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-3">
      <p className="mono-label">[{label}]</p>
      <h1 className="font-display text-5xl leading-none md:text-7xl">{title}</h1>
      {children && <p className="max-w-2xl text-mute-100">{children}</p>}
    </header>
  );
}
