"use client";

import { getProductById, getService, shippingFee, type Product } from "@mfg/catalog";
import { useCatalog } from "@/entities/product/@x/cart";
import { useCart, type CartLine } from "./cart";

export type ResolvedLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  kind: "product" | "service";
  slug?: string;
  stock?: number;
  product?: Product;
};

export function resolveLine(line: CartLine, catalog: Product[]): ResolvedLine | null {
  const product = getProductById(line.productId, catalog);
  if (product) {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      kind: "product",
      slug: product.slug,
      stock: product.stock,
      product,
    };
  }
  const service = getService(line.productId);
  if (service) {
    return { id: service.id, name: `조립 서비스 · ${service.name}`, price: service.price, quantity: line.quantity, kind: "service" };
  }
  return null;
}

/** 장바구니를 상품 정보와 금액까지 풀어서 돌려준다. */
export function useCartSummary() {
  const cart = useCart();
  const catalog = useCatalog();
  const lines = cart.map((line) => resolveLine(line, catalog)).filter((line): line is ResolvedLine => line !== null);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = shippingFee(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping, hasAssembly: lines.some((l) => l.id === "svc-assembly") };
}
