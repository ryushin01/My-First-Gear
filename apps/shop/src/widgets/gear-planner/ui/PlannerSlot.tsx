import { formatPrice, type Product } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";

type PlannerSlotProps = {
  /** 0부터. 01, 02처럼 두 자리로 보여 준다. */
  index: number;
  label: string;
  /** 꼭 고르지 않아도 되는 칸이면 라벨 뒤에 '선택'을 붙인다. */
  optional?: boolean;
  product: Pick<Product, "name" | "price" | "art"> | undefined;
  /** 고르지 않았을 때 보여 줄 글 */
  emptyText: string;
  /** 이 칸에 걸린 호환성 문제 */
  issues: readonly { level: "error" | "warning"; message: string }[];
  /** 오류 앞에 붙일 말. 경고 앞에는 '주의: '를 붙인다. */
  errorPrefix: string;
  onPick: () => void;
  onClear: () => void;
};

/** 견적·셋업 플래너의 칸 하나: 고른 상품, 호환성 문제, 고르기·빼기 버튼 */
export function PlannerSlot({ index, label, optional, product, emptyText, issues, errorPrefix, onPick, onClear }: PlannerSlotProps) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <li className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-white/10 p-3 sm:grid-cols-[auto_1fr_auto]">
      <div className="grid size-16 place-items-center rounded-md bg-black/40 text-cream">
        {product ? <GearArt art={product.art} className="size-14" /> : <span className="font-mono text-xs text-label">{number}</span>}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-mono text-[11px] uppercase text-label">
          [{number} · {label}]{optional ? " 선택" : ""}
        </p>
        <p className={product ? "text-cream" : "text-mute-200"}>{product?.name ?? emptyText}</p>
        {product && <p className="font-mono text-sm tabular-nums text-mute-100">{formatPrice(product.price)}</p>}
        {issues.map((issue) => (
          <p key={issue.message} className={issue.level === "error" ? "text-sm text-brand" : "text-sm text-[#f2c230]"}>
            {issue.level === "error" ? errorPrefix : "주의: "}
            {issue.message}
          </p>
        ))}
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <button type="button" onClick={onPick} className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white">
          {product ? "바꾸기" : "고르기"}
          <span className="sr-only">: {label}</span>
        </button>
        {product && (
          <button type="button" onClick={onClear} className="min-h-11 rounded-md px-3 text-sm text-mute-200 hover:text-cream">
            빼기<span className="sr-only">: {label}</span>
          </button>
        )}
      </div>
    </li>
  );
}
