import { categories } from "./categories";
import { products } from "./products";
import type { CategoryGroupId, CategoryId, Product } from "./types";

export type SortKey = "recommended" | "sales" | "price-asc" | "price-desc" | "newest" | "reviews";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "추천순" },
  { value: "sales", label: "판매량순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
  { value: "newest", label: "최신순" },
  { value: "reviews", label: "후기 많은 순" },
];

export function isSortKey(value: string | undefined): value is SortKey {
  return sortOptions.some((option) => option.value === value);
}

const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  recommended: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating,
  sales: (a, b) => a.salesRank - b.salesRank,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  newest: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  reviews: (a, b) => b.reviewCount - a.reviewCount,
};

export type ProductQuery = {
  categoryId?: CategoryId;
  group?: CategoryGroupId;
  brands?: string[];
  inStockOnly?: boolean;
  sort?: SortKey;
};

/** source: DB 판매 정보를 반영한 상품 목록. 없으면 코드의 기본 카탈로그 */
export function listProducts(query: ProductQuery = {}, source: Product[] = products): Product[] {
  const groupCategories = query.group ? new Set(categories.filter((c) => c.group === query.group).map((c) => c.id)) : null;

  return source
    .filter((p) => !query.categoryId || p.categoryId === query.categoryId)
    .filter((p) => !groupCategories || groupCategories.has(p.categoryId))
    .filter((p) => !query.brands?.length || query.brands.includes(p.brand))
    .filter((p) => !query.inStockOnly || p.stock > 0)
    .toSorted(comparators[query.sort ?? "recommended"]);
}

export function getProductBySlug(slug: string, source: Product[] = products): Product | undefined {
  return source.find((p) => p.slug === slug);
}

export function getProductById(id: string, source: Product[] = products): Product | undefined {
  return source.find((p) => p.id === id);
}

export function featuredProducts(source: Product[] = products): Product[] {
  return source.filter((p) => p.featured);
}

export function brandsOf(list: Product[]): string[] {
  return [...new Set(list.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, "ko"));
}

/** 같은 카테고리에서 다음 상품. 마지막이면 처음으로 돌아간다. ("Next tape") */
export function nextInCategory(product: Product, source: Product[] = products): Product {
  const list = listProducts({ categoryId: product.categoryId }, source);
  const index = list.findIndex((p) => p.id === product.id);
  return list[(index + 1) % list.length];
}

const won = new Intl.NumberFormat("ko-KR");

export function formatPrice(value: number): string {
  return `${won.format(value)}원`;
}

export function discountRate(product: Product): number | null {
  if (!product.listPrice || product.listPrice <= product.price) return null;
  return Math.round((1 - product.price / product.listPrice) * 100);
}
