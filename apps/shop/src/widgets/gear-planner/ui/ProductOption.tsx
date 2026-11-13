import { formatPrice, type Product } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";

type ProductOptionProps = {
  product: Pick<Product, "id" | "brand" | "name" | "price" | "stock" | "art" | "specs">;
  /** 지금 견적·셋업과 맞지 않을 때 보여 줄 말 */
  warning?: string;
  onSelect: (productId: string) => void;
};

/** 고르기 대화상자의 후보 상품 버튼. 품절이면 누를 수 없다. */
export function ProductOption({ product, warning, onSelect }: ProductOptionProps) {
  return (
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
        {warning && <span className="text-xs text-brand">{warning}</span>}
        {product.stock === 0 && <span className="text-xs text-mute-200">품절</span>}
      </span>
      <span className="font-mono text-sm tabular-nums">{formatPrice(product.price)}</span>
    </button>
  );
}
