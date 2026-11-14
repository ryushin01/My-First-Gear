"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/shared/lib";

/** productId에는 상품 id 또는 조립 서비스 id(svc-*)가 들어간다. */
export type CartLine = { productId: string; quantity: number };

const store = createLocalStore<CartLine[]>("mfg:cart", []);

export function useCart(): CartLine[] {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

export function useCartCount(): number {
  return useCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function addToCart(productId: string, quantity = 1) {
  store.set((lines) => {
    const found = lines.find((line) => line.productId === productId);
    if (found) {
      // 조립 서비스는 한 번만 담는다.
      if (productId.startsWith("svc-")) return lines;
      return lines.map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line));
    }
    return [...lines, { productId, quantity }];
  });
}

export function setQuantity(productId: string, quantity: number) {
  store.set((lines) =>
    quantity <= 0
      ? lines.filter((line) => line.productId !== productId)
      : lines.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
  );
}

export function removeFromCart(productId: string) {
  store.set((lines) => lines.filter((line) => line.productId !== productId));
}

/** 회원 동기화용: 바뀔 때마다 알림을 받고, 현재 값을 읽고, 통째로 바꾼다. */
export const onCartChange = (listener: () => void) => store.subscribe(listener);
export const readCart = () => store.get();
export function replaceCart(lines: CartLine[]) {
  store.set(lines);
}

export function clearCart() {
  store.set([]);
}
