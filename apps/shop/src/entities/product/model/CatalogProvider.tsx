"use client";

import { createContext, useContext, type ReactNode } from "react";
import { products as baseProducts, type Product } from "@mfg/catalog";

const CatalogContext = createContext<Product[]>(baseProducts);

/** 서버에서 읽은 상품 목록(가격·재고 반영)을 클라이언트 컴포넌트에 나눠 준다. */
export function CatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <CatalogContext value={products}>{children}</CatalogContext>;
}

export function useCatalog(): Product[] {
  return useContext(CatalogContext);
}
