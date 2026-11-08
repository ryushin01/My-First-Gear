import "server-only";
import type { ReactNode } from "react";
import { CatalogProvider } from "../model/CatalogProvider";
import { getCatalog } from "./getCatalog";

/**
 * 가격·재고를 반영한 카탈로그가 필요한 화면(목록, PC 견적, 장바구니, 결제)만 감싼다.
 * 모든 화면에 상품 전체를 싣지 않으려고 루트 레이아웃 대신 화면별로 쓴다.
 */
export async function WithCatalog({ children }: { children: ReactNode }) {
  return <CatalogProvider products={await getCatalog()}>{children}</CatalogProvider>;
}
