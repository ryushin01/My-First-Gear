"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { products as baseProducts, withSalesInfo, type Product, type SalesInfo } from "@mfg/catalog";

const CatalogContext = createContext<Product[]>(baseProducts);

/** 서버가 보낸 판매 정보(가격·재고·노출·평점)를 원본 카탈로그와 합쳐 클라이언트 컴포넌트에 나눠 준다. */
export function CatalogProvider({ sales, children }: { sales: SalesInfo[]; children: ReactNode }) {
  const products = useMemo(() => withSalesInfo(baseProducts, sales), [sales]);
  return <CatalogContext value={products}>{children}</CatalogContext>;
}

export function useCatalog(): Product[] {
  return useContext(CatalogContext);
}
