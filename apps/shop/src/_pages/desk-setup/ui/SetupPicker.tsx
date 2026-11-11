"use client";

import { useEffect, useId, useRef } from "react";
import { checkSetup, formatPrice, listProducts, type Setup, type SetupSlot } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { useCatalog } from "@/entities/product";

type SetupPickerProps = {
  slot: SetupSlot;
  setup: Setup;
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
};

/** 칸 하나의 상품 고르기. 네이티브 dialog로 초점 가두기와 Esc 닫기를 브라우저에 맡긴다. */
export function SetupPicker({ slot, setup, open, onClose, onSelect }: SetupPickerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const catalog = useCatalog();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const candidates = listProducts({ categoryId: slot.categoryId, sort: "sales" }, catalog).map((product) => {
    // 이 상품으로 바꿨을 때 이 칸에 생기는 오류만 미리 알려 준다.
    const errors = checkSetup({ ...setup, [slot.id]: product }).filter((issue) => issue.level === "error" && issue.slots.includes(slot.id));
    return { product, error: errors[0]?.message };
  });

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
            {slot.label} 고르기
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 font-mono text-xs uppercase text-label hover:text-cream">
            닫기
          </button>
        </div>
        <ul className="flex flex-col gap-2 overflow-y-auto p-5">
          {candidates.map(({ product, error }) => (
            <li key={product.id}>
              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() => onSelect(product.id)}
                className="grid w-full grid-cols-[64px_1fr_auto] items-center gap-4 rounded-lg border border-white/10 p-3 text-left hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GearArt art={product.art} className="size-16 rounded-md bg-black/40 p-1" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] uppercase text-label">{product.brand}</span>
                  <span>{product.name}</span>
                  <span className="text-xs text-mute-200">
                    {product.specs
                      .slice(0, 3)
                      .map((spec) => spec.value)
                      .join(" · ")}
                  </span>
                  {error && <span className="text-xs text-brand">맞지 않음: {error}</span>}
                  {product.stock === 0 && <span className="text-xs text-mute-200">품절</span>}
                </span>
                <span className="font-mono text-sm tabular-nums">{formatPrice(product.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
