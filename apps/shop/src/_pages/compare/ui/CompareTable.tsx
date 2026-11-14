"use client";

import Link from "next/link";
import { formatPrice, getCategory } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { clearCompare, toggleCompare, useCatalog, useCompareList } from "@/entities/product";

/** 비교 목록의 상품을 표로 나란히 놓는다. 행은 사양 이름을 합친 것이다. */
export function CompareTable() {
  const catalog = useCatalog();
  const items = useCompareList().flatMap((slug) => catalog.find((p) => p.slug === slug) ?? []);

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-mute-100">
        비교할 상품이 없습니다. 상품 상세에서 <strong>비교 담기</strong>를 눌러 최대 4개까지 담을 수 있습니다.{" "}
        <Link href="/gear" className="underline">
          기어 둘러보기
        </Link>
      </p>
    );
  }

  const labels = [...new Set(items.flatMap((p) => p.specs.map((s) => s.label)))];
  const value = (slug: string, label: string) => items.find((p) => p.slug === slug)?.specs.find((s) => s.label === label)?.value ?? "-";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto" role="region" aria-label="상품 비교 표" tabIndex={0}>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">비교 중인 상품 {items.length}개의 가격과 사양</caption>
          <thead>
            <tr className="border-b border-white/20 align-top">
              <th scope="col" className="w-32 py-3 pr-4 text-left font-mono text-xs font-normal uppercase text-label">
                상품
              </th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="py-3 pr-4 text-left font-normal">
                  <span className="mb-2 grid size-20 place-items-center rounded bg-black/40 text-cream">
                    <GearArt art={p.art} className="size-16" />
                  </span>
                  <Link href={`/product/${p.slug}`} className="block font-medium hover:underline">
                    {p.name}
                  </Link>
                  <span className="block text-xs text-mute-200">
                    {p.brand} · {getCategory(p.categoryId).name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.slug)}
                    className="mt-2 min-h-8 text-xs text-mute-200 underline hover:text-cream"
                  >
                    빼기<span className="sr-only">: {p.name}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/10">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-mute-200">
                가격
              </th>
              {items.map((p) => (
                <td key={p.id} className="py-2.5 pr-4 font-mono tabular-nums">
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>
            <tr className="border-b border-white/10">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-mute-200">
                평점
              </th>
              {items.map((p) => (
                <td key={p.id} className="py-2.5 pr-4">
                  {p.rating.toFixed(1)} · 후기 {p.reviewCount.toLocaleString("ko-KR")}개
                </td>
              ))}
            </tr>
            {labels.map((label) => (
              <tr key={label} className="border-b border-white/10">
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-mute-200">
                  {label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="py-2.5 pr-4">
                    {value(p.slug, label)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={clearCompare} className="min-h-11 w-fit rounded-md border border-white/30 px-4 text-sm hover:border-white">
        비교 목록 비우기
      </button>
    </div>
  );
}
