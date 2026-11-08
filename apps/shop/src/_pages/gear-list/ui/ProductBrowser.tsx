"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, type FormEvent } from "react";
import { brandsOf, isSortKey, listProducts, sortOptions, type CategoryGroupId, type CategoryId } from "@mfg/catalog";
import { ProductCard, useCatalog } from "@/entities/product";

type ProductBrowserProps = { categoryId?: CategoryId; group?: CategoryGroupId };

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
        <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <legend className="mono-label mb-2">[Brand]</legend>
          {brandsOf(all).map((brand) => (
            <label key={brand} className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[#ff3131]"
                name="brand"
                value={brand}
                defaultChecked={brands.includes(brand)}
              />
              {brand}
            </label>
          ))}
        </fieldset>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[#ff3131]"
              name="stock"
              value="1"
              defaultChecked={inStockOnly}
            />
            품절 상품 빼기
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="mono-label shrink-0 whitespace-nowrap">
              [Sort]
            </label>
            <select
              id={sortId}
              name="sort"
              defaultValue={sort}
              className="min-h-9 rounded-md border border-white/20 bg-ink px-2 text-sm text-cream"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <p role="status" className="font-mono text-xs text-label">
        {shown.length}개 상품
      </p>

      <h2 className="sr-only">상품 목록</h2>
      {shown.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-mute-200">조건에 맞는 상품이 없습니다. 필터를 줄여 보세요.</p>
      )}
    </div>
  );
}

/** 주소를 읽기 전(정적 렌더링)에 보여줄 기본 목록 */
export function ProductBrowserFallback({ categoryId, group }: ProductBrowserProps) {
  const shown = listProducts({ categoryId, group }, useCatalog());
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
