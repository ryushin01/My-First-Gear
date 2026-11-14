"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useSyncExternalStore } from "react";
import { searchProducts } from "@mfg/catalog";
import { ProductCard, useCatalog } from "@/entities/product";
import { createLocalStore } from "@/shared/lib";

const recentTerms = createLocalStore<string[]>("mfg:search", []);

/** 검색 상자와 결과. 검색어는 주소(?q=)에 담아 새로고침·공유해도 유지한다. */
export function SearchResults() {
  const query = (useSearchParams().get("q") ?? "").slice(0, 80);
  const catalog = useCatalog();
  const results = searchProducts(query, catalog);
  const terms = useSyncExternalStore(recentTerms.subscribe, recentTerms.get, recentTerms.getServer);
  const inputId = useId();

  useEffect(() => {
    const term = query.trim();
    if (term) recentTerms.set((list) => [term, ...list.filter((t) => t !== term)].slice(0, 6));
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <form action="/search" method="get" role="search" className="flex max-w-xl gap-2">
        <label htmlFor={inputId} className="sr-only">
          검색어
        </label>
        <input
          id={inputId}
          key={query}
          name="q"
          type="search"
          defaultValue={query}
          placeholder="예: AM5 메인보드, 소니 헤드폰, 16GB"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-white/20 bg-black/30 px-3"
        />
        <button type="submit" className="min-h-11 rounded-md bg-cream px-5 font-medium text-ink hover:bg-white">
          검색
        </button>
      </form>
      {terms.length > 0 && (
        <nav aria-label="최근 검색어" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="mono-label">[Recent]</span>
          {terms.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="inline-flex min-h-8 items-center rounded-full border border-white/20 px-3 hover:border-white"
            >
              {term}
            </Link>
          ))}
        </nav>
      )}
      <p role="status" className="font-mono text-xs text-label">
        {query ? `"${query}" 검색 결과 ${results.length}개` : "이름, 브랜드, 카테고리, 사양으로 찾을 수 있습니다."}
      </p>
      {query && results.length === 0 && <p className="text-mute-200">찾는 상품이 없습니다. 낱말을 줄이거나 다른 말로 찾아보세요.</p>}
      {results.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} headingLevel={2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
