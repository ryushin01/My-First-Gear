import { channelOf, getCategory, type Product } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";

/** VHS 테이프 표지처럼 꾸민 상품 커버. 장식 요소라 텍스트 정보는 캐러셀 캡션이 따로 전한다. */
export function TapeSleeve({ product }: { product: Product }) {
  const category = getCategory(product.categoryId);
  const accent = product.art.accent;

  return (
    <div className="w-full [container-type:inline-size]">
      <div
        className="tape-sleeve relative flex aspect-[3/4.3] w-full flex-col overflow-hidden rounded-[3px] bg-[#0c0c0c] p-[6%] text-cream shadow-[0_30px_60px_rgb(0_0_0/0.6)]"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        <div
          aria-hidden="true"
          className="flex items-center justify-between border-b border-[var(--accent)]/60 pb-[3%] font-mono text-[clamp(8px,1.6cqi,11px)] uppercase text-[var(--accent)]"
        >
          <span>Home Gear</span>
          <span>CH {channelOf(product.categoryId)}</span>
        </div>
        <div className="relative mt-[5%] grid flex-1 place-items-center border border-[var(--accent)]/70 bg-black/50 text-cream">
          <GearArt art={product.art} className="h-[86%] w-[86%]" />
        </div>
        <p className="mt-[5%] line-clamp-2 font-display text-[clamp(18px,11cqi,46px)] leading-[0.92] tracking-tight text-[var(--accent)]">
          {product.name}
        </p>
        <div aria-hidden="true" className="mt-[4%] flex items-center justify-between font-mono text-[clamp(8px,1.4cqi,10px)] uppercase text-label">
          <span className="rounded-sm border border-current px-1">{category.code}</span>
          <span>{product.releasedAt.slice(0, 4)}</span>
          <span className="rounded-full border border-current px-1.5">MFG</span>
        </div>
      </div>
    </div>
  );
}
