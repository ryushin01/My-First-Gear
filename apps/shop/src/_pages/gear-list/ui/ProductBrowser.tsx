"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { brandsOf, isSortKey, listProducts, sortOptions, type CategoryGroupId, type CategoryId } from "@mfg/catalog";
import { ProductCard, useCatalog } from "@/entities/product";
import { Select } from "@/shared/ui";

type ProductBrowserProps = { categoryId?: CategoryId; group?: CategoryGroupId };

/** 한 번에 보여 주는 상품 수. 나머지는 "더 보기"로 이어 본다(전체 기어처럼 상품이 수백 개인 목록을 가볍게). */
export const PAGE_SIZE = 48;
/** 브랜드가 이보다 많으면 브랜드 필터를 접어 둔다. */
const BRAND_FOLD = 24;

/** 정렬, 브랜드, 재고 필터. 상태는 주소(쿼리)에 담아 새로고침과 공유에도 유지한다. */
export function ProductBrowser({ categoryId, group }: ProductBrowserProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const sortId = useId();
  const catalog = useCatalog();

  const sortParam = params.get("sort") ?? undefined;
  const sort = isSortKey(sortParam) ? sortParam : "recommended";
  const brands = params.getAll("brand");
  const inStockOnly = params.get("stock") === "1";

  const all = listProducts({ categoryId, group }, catalog);
  const shown = listProducts({ categoryId, group, sort, brands, inStockOnly }, catalog);

  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** "더 보기"로 늘린 개수. 필터나 정렬(주소)이 바뀌면 처음 개수로 돌아간다. */
  const query = params.toString();
  const [paging, setPaging] = useState({ query, limit: PAGE_SIZE });
  // 주소가 바뀌면 렌더링 중에 바로 처음 개수로 되돌린다(이전 주소로 돌아와도 늘린 개수가 되살아나지 않게).
  if (paging.query !== query) setPaging({ query, limit: PAGE_SIZE });
  const limit = paging.query === query ? paging.limit : PAGE_SIZE;
  /** "더 보기"로 새로 보인 첫 상품. 키보드 사용자가 이어서 읽도록 그 상품으로 초점을 옮긴다. */
  const focusFrom = useRef<number | null>(null);

  useEffect(() => {
    const index = focusFrom.current;
    if (index === null) return;
    focusFrom.current = null;
    listRef.current?.children[index]?.querySelector<HTMLElement>("a")?.focus();
  }, [limit]);

  const visible = shown.slice(0, limit);
  const rest = shown.length - visible.length;
  const brandList = brandsOf(all);
  const brandBoxes: ReactNode = brandList.map((brand) => (
    <label key={brand} className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-[#ff3131]" name="brand" value={brand} defaultChecked={brands.includes(brand)} />
      {brand}
    </label>
  ));

  /**
   * 폼의 현재 상태를 주소에 담는다. 입력은 비제어라 하이드레이션 전에 누른 체크도 버려지지 않고,
   * 마운트할 때 한 번 맞춰 준다. 네이티브 history API를 쓰면 Next가 useSearchParams와 동기화한다.
   */
  function sync() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const next = new URLSearchParams();
    data.getAll("brand").forEach((b) => next.append("brand", String(b)));
    if (data.get("stock")) next.set("stock", "1");
    const sortValue = String(data.get("sort") ?? "recommended");
    if (sortValue !== "recommended") next.set("sort", sortValue);
    const query = next.toString();
    if (query === params.toString()) return;
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }

  useEffect(() => {
    sync();
    // 마운트할 때 한 번만 맞춘다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <form
        ref={formRef}
        action={pathname}
        method="get"
        onChange={sync}
        onSubmit={(event: FormEvent) => event.preventDefault()}
        aria-label="상품 필터"
        className="flex flex-col gap-4 border-y border-white/10 py-4 md:flex-row md:items-start md:justify-between"
      >
        {brandList.length > BRAND_FOLD ? (
          <details className="min-w-0" open={brands.length > 0}>
            <summary className="mono-label inline-flex min-h-8 cursor-pointer items-center">[Brand] {brandList.length}개 브랜드</summary>
            <fieldset className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <legend className="sr-only">브랜드</legend>
              {brandBoxes}
            </fieldset>
          </details>
        ) : (
          <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <legend className="mono-label mb-2">[Brand]</legend>
            {brandBoxes}
          </fieldset>
        )}
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[#ff3131]" name="stock" value="1" defaultChecked={inStockOnly} />
            품절 상품 빼기
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="mono-label shrink-0 whitespace-nowrap">
              [Sort]
            </label>
            <Select id={sortId} name="sort" defaultValue={sort} className="min-h-9 rounded-md border border-white/20 bg-ink text-sm text-cream">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </form>

      <p role="status" className="font-mono text-xs text-label">
        {shown.length}개 상품
      </p>

      <h2 className="sr-only">상품 목록</h2>
      {shown.length > 0 ? (
        <>
          <ul ref={listRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          {rest > 0 && (
            <button
              type="button"
              onClick={() => {
                focusFrom.current = visible.length;
                setPaging({ query, limit: limit + PAGE_SIZE });
              }}
              className="mx-auto inline-flex min-h-11 items-center rounded-md border border-white/30 px-6 font-mono text-sm hover:border-white"
            >
              더 보기 ({rest}개 남음)
            </button>
          )}
        </>
      ) : (
        <p className="py-16 text-center text-mute-200">조건에 맞는 상품이 없습니다. 필터를 줄여 보세요.</p>
      )}
    </div>
  );
}

/** 주소를 읽기 전(정적 렌더링)에 보여줄 기본 목록 */
export function ProductBrowserFallback({ categoryId, group }: ProductBrowserProps) {
  const shown = listProducts({ categoryId, group }, useCatalog()).slice(0, PAGE_SIZE);
  return (
    <>
      <h2 className="sr-only">상품 목록</h2>
      <ul className="mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
