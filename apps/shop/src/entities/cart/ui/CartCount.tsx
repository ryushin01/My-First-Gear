"use client";

import { useCartCount } from "../model/cart";

/** 헤더 장바구니 링크 옆 수량. */
export function CartCount() {
  const count = useCartCount();
  if (count === 0) return null;
  return (
    <span className="ml-1 tabular-nums text-brand">
      [{count}]<span className="sr-only">개 담김</span>
    </span>
  );
}
