"use client";

import { checkSetup, listProducts, type Setup, type SetupSlot } from "@mfg/catalog";
import { useCatalog } from "@/entities/product";
import { PickerDialog, ProductOption } from "@/widgets/gear-planner";

type SetupPickerProps = {
  slot: SetupSlot;
  setup: Setup;
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
};

/** 칸 하나의 상품 고르기. 대화상자 틀은 위젯(PickerDialog)이 맡는다. */
export function SetupPicker({ slot, setup, open, onClose, onSelect }: SetupPickerProps) {
  const catalog = useCatalog();

  const candidates = listProducts({ categoryId: slot.categoryId, sort: "sales" }, catalog).map((product) => {
    // 이 상품으로 바꿨을 때 이 칸에 생기는 오류만 미리 알려 준다.
    const errors = checkSetup({ ...setup, [slot.id]: product }).filter((issue) => issue.level === "error" && issue.slots.includes(slot.id));
    return { product, error: errors[0]?.message };
  });

  return (
    <PickerDialog open={open} title={`${slot.label} 고르기`} onClose={onClose}>
      <ul className="flex flex-col gap-2 overflow-y-auto p-5">
        {candidates.map(({ product, error }) => (
          <li key={product.id}>
            <ProductOption product={product} warning={error && `맞지 않음: ${error}`} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </PickerDialog>
  );
}
