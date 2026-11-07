"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fitsBuild, formatPrice, listProducts, type Build, type CategoryId, type PartKind } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { useCatalog } from "@/entities/product";

type PartPickerProps = {
  part: PartKind;
  label: string;
  build: Build;
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
};

/** 부품 고르기 대화상자. 네이티브 dialog를 써서 초점 가두기와 Esc 닫기를 브라우저에 맡긴다. */
export function PartPicker({ part, label, build, open, onClose, onSelect }: PartPickerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [hideIncompatible, setHideIncompatible] = useState(true);
  const catalog = useCatalog();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const candidates = listProducts({ categoryId: part as CategoryId, sort: "sales" }, catalog).map((product) => ({
    product,
    fits: fitsBuild(build, product),
  }));
  const shown = hideIncompatible ? candidates.filter((c) => c.fits) : candidates;
  const hiddenCount = candidates.length - shown.length;

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
            {label} 고르기
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 font-mono text-xs uppercase text-label hover:text-cream">
            닫기
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[#ff3131]"
              checked={hideIncompatible}
              onChange={(event) => setHideIncompatible(event.target.checked)}
            />
            호환 안 되는 상품 숨기기
          </label>
          <p className="font-mono text-xs text-label" role="status">
            {shown.length}개 표시{hiddenCount > 0 ? ` · ${hiddenCount}개 숨김` : ""}
          </p>
        </div>
        <ul className="flex flex-col gap-2 overflow-y-auto px-5 pb-5">
          {shown.map(({ product, fits }) => (
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
                  {!fits && <span className="text-xs text-brand">지금 견적과 호환되지 않습니다</span>}
                  {product.stock === 0 && <span className="text-xs text-mute-200">품절</span>}
                </span>
                <span className="font-mono text-sm tabular-nums">{formatPrice(product.price)}</span>
              </button>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="py-10 text-center text-mute-200">
              호환되는 상품이 없습니다. 위 체크를 풀면 모든 상품을 볼 수 있습니다.
            </li>
          )}
        </ul>
      </div>
    </dialog>
  );
}
