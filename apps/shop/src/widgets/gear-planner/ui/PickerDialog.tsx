"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type PickerDialogProps = {
  open: boolean;
  /** 대화상자 제목. 예) "CPU 고르기" */
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * 상품 고르기 대화상자의 틀. 네이티브 dialog를 써서 초점 가두기와 Esc 닫기를 브라우저에 맡긴다.
 * 닫힌 뒤에도 그려 두어야 브라우저가 열기 전 버튼으로 초점을 돌려준다.
 */
export function PickerDialog({ open, title, onClose, children }: PickerDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(720px,calc(100vw-32px))] max-h-[min(80dvh,760px)] rounded-xl border border-white/15 bg-ink p-0 text-cream backdrop:bg-black/70"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
          <h2 id={titleId} className="font-display text-3xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 font-mono text-xs uppercase text-label hover:text-cream">
            닫기
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
