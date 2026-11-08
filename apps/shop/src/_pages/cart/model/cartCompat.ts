import { checkBuild, type Build, type BuildIssue, type PartKind, type Product } from "@mfg/catalog";

// 한 PC에 하나만 들어가는 부품 (SSD, 메모리는 여러 개를 함께 쓸 수 있다)
const SINGLE: PartKind[] = ["cpu", "mainboard", "gpu", "psu", "case", "cooler"];

export type CartCompat = { issues: BuildIssue[]; duplicates: PartKind[]; partCount: number };

/**
 * 장바구니에 담긴 PC 부품끼리 호환성을 다시 검사한다.
 * 견적에서 담은 뒤 부품을 빼거나 바꿔도 맞는지 알려 주려는 것이다. 부품이 두 종류 이상일 때만 본다.
 */
export function cartCompat(products: Product[]): CartCompat {
  const build: Build = {};
  const seen = new Map<PartKind, number>();
  for (const product of products) {
    const part = product.compat?.part;
    if (!part) continue;
    seen.set(part, (seen.get(part) ?? 0) + 1);
    if (!build[part]) build[part] = product;
  }
  const partCount = Object.keys(build).length;
  const duplicates = SINGLE.filter((part) => (seen.get(part) ?? 0) > 1);
  return { issues: partCount >= 2 ? checkBuild(build) : [], duplicates, partCount };
}
