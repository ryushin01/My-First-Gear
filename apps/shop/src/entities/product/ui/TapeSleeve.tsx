import { channelOf, getCategory, type Product } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { EnglishName } from "./ProductNames";

/** HUD 신호 카드처럼 꾸민 상품 커버. 장식 요소라 텍스트 정보는 캐러셀 캡션이 따로 전한다. */
export function TapeSleeve({ product }: { product: Product }) {
  const category = getCategory(product.categoryId);
  const accent = product.art.accent;

  return (
    <div className="w-full [container-type:inline-size]">
      <div
        className="tape-sleeve hud-frame relative flex aspect-[3/4.3] w-full flex-col overflow-hidden border border-white/20 bg-[#070707] p-[6%] text-cream"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        <div
          aria-hidden="true"
          className="flex items-center justify-between border-b border-[var(--accent)]/60 pb-[3%] font-mono text-[clamp(8px,1.6cqi,11px)] uppercase text-[var(--accent)]"
        >
          <span>MFG Signal</span>
          <span>CH {channelOf(product.categoryId)}</span>
        </div>
        <div className="relative mt-[5%] grid flex-1 place-items-center border border-[var(--accent)]/70 bg-black/50 text-cream">
          <GearArt slug={product.slug} className="h-[86%] w-[86%]" priority />
        </div>
        <p className="mt-[5%] line-clamp-2 font-display text-[clamp(18px,11cqi,46px)] leading-[0.95] text-cream">{product.name}</p>
        <EnglishName product={product} aria-hidden="true" className="mt-[2%] truncate font-mono text-[clamp(8px,1.6cqi,11px)] text-label" />
        <div aria-hidden="true" className="mt-[4%] flex items-center justify-between font-mono text-[clamp(8px,1.4cqi,10px)] uppercase text-label">
          <span className="bg-cream px-1 text-ink">{category.code}</span>
          <span>{product.releasedAt?.slice(0, 4) ?? "V"}</span>
          <span className="border border-current px-1.5">MFG</span>
        </div>
      </div>
    </div>
  );
}
