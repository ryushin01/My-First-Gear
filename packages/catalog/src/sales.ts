import type { Product } from "./types";

/**
 * 상품의 판매 정보: DB(어드민)에서 바뀌는 값과 DB 후기를 더한 평점. 원본 카탈로그(설명·사양·그림)는 코드에 있어
 * 화면에는 이것만 보내고 브라우저가 원본과 합친다(가격 반영본 전체를 다시 보내지 않게).
 */
export type SalesInfo = Pick<Product, "id" | "price" | "stock" | "rating" | "reviewCount"> & {
  listPrice: number | null;
  featured: boolean;
};

/** 판매 정보를 반영한 상품 목록에서 판매 정보만 뽑는다. 목록에 없는 상품은 숨긴 상품이다. */
export function toSalesInfo(list: Product[]): SalesInfo[] {
  return list.map(({ id, price, listPrice, stock, featured, rating, reviewCount }) => ({
    id,
    price,
    listPrice: listPrice ?? null,
    stock,
    featured: Boolean(featured),
    rating,
    reviewCount,
  }));
}

/** 원본 카탈로그에 판매 정보를 덧칠한다. 판매 정보가 없는 상품(숨긴 상품)은 빼고, 원본 순서를 지킨다. */
export function withSalesInfo(base: Product[], sales: SalesInfo[]): Product[] {
  const byId = new Map(sales.map((info) => [info.id, info]));
  return base.flatMap((product) => {
    const info = byId.get(product.id);
    if (!info) return [];
    const { listPrice, ...rest } = info;
    return [{ ...product, ...rest, listPrice: listPrice ?? undefined }];
  });
}
