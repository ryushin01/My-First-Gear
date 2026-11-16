import { describe, expect, it } from "vitest";
import { products } from "./products";
import { toSalesInfo, withSalesInfo } from "./sales";

describe("판매 정보 덧칠", () => {
  it("판매 정보만 주고받아도 원본 카탈로그와 합치면 같은 상품 목록이 된다", () => {
    const changed = products
      .slice(0, 5)
      .map((p, i) => ({ ...p, price: p.price + i, stock: i, featured: i % 2 === 0, listPrice: i ? p.price + 1000 : undefined }));
    const visible = [...changed, ...products.slice(6)]; // 여섯 번째 상품은 숨김
    // 덧칠한 뒤 추천 여부는 언제나 true/false로 채워진다(원본은 추천이 아니면 값이 없음).
    expect(withSalesInfo(products, toSalesInfo(visible))).toEqual(visible.map((p) => ({ ...p, featured: Boolean(p.featured) })));
  });

  it("판매 정보는 원본보다 훨씬 작다", () => {
    const full = JSON.stringify(products).length;
    const sales = JSON.stringify(toSalesInfo(products)).length;
    expect(sales).toBeLessThan(full / 5);
  });
});
