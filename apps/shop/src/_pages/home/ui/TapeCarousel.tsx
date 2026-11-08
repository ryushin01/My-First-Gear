"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { formatPrice, getCategory, type Product } from "@mfg/catalog";
import { TapeSleeve } from "@/entities/product";

const VISIBLE = 2; // 가운데 양옆으로 보이는 테이프 수

/**
 * VHS 테이프 캐러셀 (WAI-ARIA APG Carousel 패턴).
 * 자동으로 넘어가지 않는다. ← → 로 넘기고, 가운데 테이프에서 Enter로 상세를 연다.
 */
export function TapeCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const count = products.length;
  const current = products[index];

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="추천 기어"
      onKeyDown={onKeyDown}
      className="flex w-full min-w-0 flex-col items-center gap-4"
    >
      <div className="relative h-[calc(clamp(180px,22vw,300px)*1.48)] w-full overflow-x-clip [perspective:1400px]">
        {products.map((product, i) => {
          let offset = i - index;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const hidden = Math.abs(offset) > VISIBLE;
          const active = offset === 0;

          return (
            <div
              key={product.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              inert={!active}
              onClick={active ? undefined : () => setIndex(i)}
              className="absolute left-1/2 top-0 h-full w-[clamp(180px,22vw,300px)] transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none"
              style={{
                transform: `translateX(calc(-50% + ${offset * 105}%)) translateZ(${active ? 0 : -160}px) rotateY(${offset * -24}deg) rotateZ(${offset * 3}deg)`,
                opacity: hidden ? 0 : active ? 1 : 0.45,
                filter: active ? "none" : "brightness(0.55)",
                zIndex: 10 - Math.abs(offset),
                cursor: active ? undefined : "pointer",
                visibility: hidden ? "hidden" : "visible",
              }}
            >
              <Link
                href={`/product/${product.slug}`}
                className="block rounded-[3px] focus-visible:outline-offset-6"
              >
                <TapeSleeve product={product} />
              </Link>
            </div>
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true" className="flex min-h-24 flex-col items-center gap-1 text-center">
        <p className="font-mono text-xs uppercase text-label">
          {getCategory(current.categoryId).name} · {current.brand}
        </p>
        <p className="font-mono text-sm uppercase text-cream">{current.tagline}</p>
        <p className="font-mono text-xs text-mute-200 tabular-nums">
          {current.purchaseMode === "consult" ? "상담 후 구매 · " : ""}
          {formatPrice(current.price)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs uppercase md:gap-6">
        <button type="button" onClick={() => go(-1)} className="min-h-11 min-w-11 px-3 text-label hover:text-cream">
          <span aria-hidden="true">◀◀ </span>이전<span className="sr-only md:not-sr-only"> 테이프</span>
        </button>
        <span className="whitespace-nowrap tabular-nums text-label" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => go(1)} className="min-h-11 min-w-11 px-3 text-label hover:text-cream">
          다음<span className="sr-only md:not-sr-only"> 테이프</span><span aria-hidden="true"> ▶▶</span>
        </button>
        <Link href={`/product/${current.slug}`} className="inline-flex min-h-11 items-center px-3 text-cream hover:text-brand">
          재생<span aria-hidden="true"> ▶</span>
          <span className="sr-only">: {current.name} 상세 보기</span>
        </Link>
      </div>
      <p className="hidden text-center font-mono text-[11px] text-label md:block">← → 키로 넘기고, 가운데 테이프에서 Enter로 엽니다.</p>
    </section>
  );
}
