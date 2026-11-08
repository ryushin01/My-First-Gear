import type { StoredBuild, StoredCartLine } from "@mfg/db";

/** 기기의 장바구니와 서버에 저장한 장바구니를 합친다. 같은 상품은 수량이 많은 쪽을 쓴다. */
export function mergeCart(local: StoredCartLine[], remote: StoredCartLine[]): StoredCartLine[] {
  const merged = new Map<string, number>();
  for (const line of [...remote, ...local]) merged.set(line.productId, Math.max(merged.get(line.productId) ?? 0, line.quantity));
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

/** 견적은 이 기기에서 고른 부품이 있으면 그것을, 없으면 서버에 저장한 견적을 쓴다. */
export function mergeBuild(local: StoredBuild, remote: StoredBuild | null): StoredBuild {
  return Object.keys(local.parts).length > 0 || !remote ? local : remote;
}
