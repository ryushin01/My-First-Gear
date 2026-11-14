import Link from "next/link";
import { getCategory, type Product } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { PriceTag } from "./PriceTag";

/** 목록용 상품 카드. 카드 전체가 하나의 링크다. */
export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 | 4 }) {
  const Heading = `h${headingLevel}` as const;
  const category = getCategory(product.categoryId);
  const soldOut = product.stock === 0;

  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-lg border border-white/10 bg-ink-soft/60 p-4 transition-colors hover:border-white/30">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-md bg-black/40 text-cream">
        <GearArt art={product.art} className="h-4/5 w-4/5 transition-transform duration-300 group-hover:scale-105" />
        <span className="absolute left-2 top-2 font-mono text-[11px] uppercase text-label">[{category.code}]</span>
        {soldOut && <span className="absolute right-2 top-2 rounded-sm bg-cream px-1.5 py-0.5 font-mono text-[11px] text-ink">품절</span>}
        {product.purchaseMode === "consult" && (
          <span className="absolute right-2 top-2 rounded-sm border border-cream/60 px-1.5 py-0.5 font-mono text-[11px] text-cream">상담</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-mono text-xs uppercase text-label">{product.brand}</p>
        <Heading className="text-base font-medium leading-snug">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </Heading>
        <p className="text-sm text-mute-200">{product.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceTag product={product} />
          <p className="shrink-0 font-mono text-xs text-label">
            <span aria-hidden="true">★</span>
            <span className="sr-only">평점</span> {product.rating.toFixed(1)}
            <span className="sr-only">, 후기 {product.reviewCount}개</span>
          </p>
        </div>
      </div>
    </article>
  );
}
