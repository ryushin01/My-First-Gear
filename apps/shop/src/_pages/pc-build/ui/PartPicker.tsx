"use client";

import { useState } from "react";
import { fitsBuild, listProducts, type Build, type CategoryId, type PartKind } from "@mfg/catalog";
import { useCatalog } from "@/entities/product";
import { PickerDialog, ProductOption } from "@/widgets/gear-planner";

type PartPickerProps = {
  part: PartKind;
  label: string;
  build: Build;
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
};

/** 부품 고르기 대화상자. 대화상자 틀은 위젯(PickerDialog)이 맡는다. */
export function PartPicker({ part, label, build, open, onClose, onSelect }: PartPickerProps) {
  const [hideIncompatible, setHideIncompatible] = useState(true);
  const catalog = useCatalog();

  const candidates = listProducts({ categoryId: part as CategoryId, sort: "sales" }, catalog).map((product) => ({
    product,
    fits: fitsBuild(build, product),
  }));
  const shown = hideIncompatible ? candidates.filter((c) => c.fits) : candidates;
  const hiddenCount = candidates.length - shown.length;

  return (
    <PickerDialog open={open} title={`${label} 고르기`} onClose={onClose}>
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
            <ProductOption product={product} warning={fits ? undefined : "지금 견적과 호환되지 않습니다"} onSelect={onSelect} />
          </li>
        ))}
        {shown.length === 0 && (
          <li className="py-10 text-center text-mute-200">
            호환되는 상품이 없습니다. 위 체크를 풀면 모든 상품을 볼 수 있습니다.
          </li>
        )}
      </ul>
    </PickerDialog>
  );
}
