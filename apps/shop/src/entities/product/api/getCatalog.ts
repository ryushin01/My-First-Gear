import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as baseProducts, type Product } from "@mfg/catalog";
import { applyMerch, getDb, hasDatabase, listMerch } from "@mfg/db";

export const MERCH_TAG = "merch";

/**
 * DB 판매 정보(가격, 재고, 노출)를 반영한 상품 목록.
 * DB에 연결할 수 없으면(로컬 빌드 등) 코드의 기본 카탈로그를 쓴다.
 */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheTag(MERCH_TAG);
  cacheLife("minutes");
  if (!hasDatabase()) return baseProducts;
  try {
    return applyMerch(await listMerch(getDb()));
  } catch (error) {
    console.error("[catalog] DB를 읽지 못해 기본 카탈로그를 씁니다.", error);
    return baseProducts;
  }
}
