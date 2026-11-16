import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as baseProducts, toSalesInfo, withSalesInfo, type Product, type SalesInfo } from "@mfg/catalog";
import { applyMerch, getDb, hasDatabase, listMerch, reviewStats } from "@mfg/db";

export const MERCH_TAG = "merch";

/**
 * 상품별 판매 정보: DB 판매 정보(가격, 재고, 추천, 노출)와 DB 후기를 더한 평점·후기 수. 숨긴 상품은 빠진다.
 * DB에 연결할 수 없으면(로컬 빌드 등) 코드의 기본값을 쓴다.
 */
export async function getSalesInfo(): Promise<SalesInfo[]> {
  "use cache";
  cacheTag(MERCH_TAG);
  cacheLife("minutes");
  if (!hasDatabase()) return toSalesInfo(baseProducts);
  try {
    const db = getDb();
    const [merch, stats] = await Promise.all([listMerch(db), reviewStats(db)]);
    return toSalesInfo(applyMerch(merch, undefined, stats)); // 평점·후기 수에 DB 후기를 더한다
  } catch (error) {
    console.error("[catalog] DB를 읽지 못해 기본 카탈로그를 씁니다.", error);
    return toSalesInfo(baseProducts);
  }
}

/** 판매 정보를 반영한 상품 목록 (서버 컴포넌트용) */
export async function getCatalog(): Promise<Product[]> {
  return withSalesInfo(baseProducts, await getSalesInfo());
}
