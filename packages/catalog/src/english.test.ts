import { describe, expect, it } from "vitest";
import { brandNamesEn, productNamesEn } from "./english";
import { nativeProducts, products } from "./products";
import { searchProducts } from "./search";

const HANGUL = /[가-힣]/;

describe("영어 병기", () => {
  it("직접 올린 상품은 이름에 한글이 있으면 영문 이름이 있다", () => {
    expect(nativeProducts.filter((p) => HANGUL.test(p.name) && !p.nameEn).map((p) => p.slug)).toEqual([]);
  });

  it("직접 올린 상품의 한글 브랜드는 영문 표기가 있다", () => {
    expect([...new Set(nativeProducts.filter((p) => HANGUL.test(p.brand) && !p.brandEn).map((p) => p.brand))]).toEqual([]);
  });

  it("영문 이름과 브랜드 표기에는 한글이 없고, 영문 이름은 한글 이름이 있는 상품에만 붙는다", () => {
    for (const value of [...Object.values(productNamesEn), ...Object.values(brandNamesEn)]) expect(value).not.toMatch(HANGUL);
    expect(products.filter((p) => p.nameEn && !HANGUL.test(p.name)).map((p) => p.slug)).toEqual([]);
  });

  it("영문 이름과 브랜드 영문 표기로도 찾는다", () => {
    expect(searchProducts("panigale")[0]?.slug).toBe("ducati-panigale-v4-s");
    expect(searchProducts("aeron")[0]?.slug).toBe("herman-miller-aeron");
    expect(searchProducts("sk hynix p41")[0]?.slug).toBe("sk-hynix-platinum-p41-2tb");
  });
});
