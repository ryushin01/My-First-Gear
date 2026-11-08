"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getProductBySlug } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { recordRecent, useRecentList } from "../model/lists";

/** 상품 상세에서 본 상품을 기록한다. 화면에는 아무것도 그리지 않는다. */
export function RecordRecentView({ slug }: { slug: string }) {
  useEffect(() => recordRecent(slug), [slug]);
  return null;
}

/** 최근 본 상품. 기록이 없으면 그리지 않는다. */
export function RecentlyViewed({ exclude, headingLevel = 2 }: { exclude?: string; headingLevel?: 2 | 3 }) {
  const items = useRecentList()
    .filter((slug) => slug !== exclude)
    .flatMap((slug) => getProductBySlug(slug) ?? [])
    .slice(0, 6);
  if (items.length === 0) return null;
  const Heading = `h${headingLevel}` as const;
  return (
    <section aria-label="최근 본 상품" className="flex flex-col gap-4">
      <Heading className="mono-label">[Recently viewed]</Heading>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.slug}`} className="flex flex-col gap-2 rounded-md border border-white/10 p-2 text-xs hover:border-white/40">
              <span className="grid aspect-square place-items-center rounded bg-black/40 text-cream">
                <GearArt art={product.art} className="h-4/5 w-4/5" />
              </span>
              <span className="line-clamp-2">{product.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
