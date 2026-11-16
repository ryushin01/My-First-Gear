import "server-only";
import type { ReactNode } from "react";
import { CatalogProvider } from "../model/CatalogProvider";
import { getSalesInfo } from "./getCatalog";

/**
 * 가격·재고를 반영한 카탈로그가 필요한 화면(목록, PC 견적, 장바구니, 결제)만 감싼다.
 * 원본 카탈로그는 이미 브라우저 코드에 있으므로 판매 정보만 보내고(상품마다 약 100바이트), 브라우저에서 합친다.
 */
export async function WithCatalog({ children }: { children: ReactNode }) {
  return <CatalogProvider sales={await getSalesInfo()}>{children}</CatalogProvider>;
}
