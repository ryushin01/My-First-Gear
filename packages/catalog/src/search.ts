import { getCategory } from "./categories";
import { products } from "./products";
import type { Product } from "./types";

const normalize = (text: string) => text.toLowerCase().normalize("NFC").replace(/\s+/g, " ").trim();

/** 상품에서 검색에 쓰는 글자: 이름, 브랜드, 카테고리와 그 별칭, 한 줄 소개, 사양 값 */
function haystack(product: Product) {
  const category = getCategory(product.categoryId);
  return normalize(
    [
      product.name,
      product.brand,
      category.name,
      category.code,
      ...(category.aliases ?? []),
      product.tagline,
      ...product.specs.map((s) => `${s.label} ${s.value}`),
    ].join(" "),
  );
}

/**
 * 공백으로 나눈 낱말이 모두 들어간 상품을 찾는다. 이름에 들어간 낱말이 많을수록 앞에 둔다.
 * 예: "AM5 보드" → AM5 소켓 메인보드, "소니 헤드폰" → 소니 헤드폰
 */
export function searchProducts(query: string, source: Product[] = products): Product[] {
  const terms = normalize(query).split(" ").filter(Boolean).slice(0, 8);
  if (terms.length === 0) return [];
  return source
    .map((product) => {
      const text = haystack(product);
      if (!terms.every((term) => text.includes(term))) return null;
      const name = normalize(`${product.name} ${product.brand}`);
      return { product, score: terms.filter((term) => name.includes(term)).length };
    })
    .filter((hit): hit is { product: Product; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score || a.product.salesRank - b.product.salesRank)
    .map((hit) => hit.product);
}
