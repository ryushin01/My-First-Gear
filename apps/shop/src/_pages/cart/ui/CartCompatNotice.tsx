import Link from "next/link";
import { buildSlots } from "@mfg/catalog";
import type { CartCompat } from "../model/cartCompat";

const label = (part: string) => buildSlots.find((slot) => slot.part === part)?.label ?? part;

/** 장바구니 PC 부품의 호환성 안내. 문제가 있을 때만 보인다. */
export function CartCompatNotice({ compat }: { compat: CartCompat }) {
  const errors = compat.issues.filter((i) => i.level === "error");
  const warnings = compat.issues.filter((i) => i.level === "warning");
  if (errors.length === 0 && warnings.length === 0 && compat.duplicates.length === 0) {
    if (compat.partCount < 2) return null;
    return <p className="text-sm text-[#3cb371]">담긴 PC 부품끼리 호환성 문제가 없습니다.</p>;
  }
  return (
    <section aria-label="PC 부품 호환성" className="flex flex-col gap-2 rounded-md border border-brand/60 p-4 text-sm">
      <p className="font-medium text-brand">담긴 PC 부품을 확인해 주세요.</p>
      <ul className="list-disc pl-5">
        {errors.map((issue) => (
          <li key={issue.message}>호환 안 됨: {issue.message}</li>
        ))}
        {warnings.map((issue) => (
          <li key={issue.message} className="text-[#f2c230]">
            주의: {issue.message}
          </li>
        ))}
        {compat.duplicates.map((part) => (
          <li key={part}>{label(part)}가 두 개 이상 담겨 있습니다. 한 PC에는 하나만 들어갑니다.</li>
        ))}
      </ul>
      <Link href="/build" className="w-fit underline">
        PC 견적에서 다시 맞춰 보기
      </Link>
    </section>
  );
}
