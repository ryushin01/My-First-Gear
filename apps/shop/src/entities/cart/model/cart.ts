"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/shared/lib";

/** productId에는 상품 id 또는 조립 서비스 id(svc-*)가 들어간다. */
export type CartLine = { productId: string; quantity: number };

/** 한 줄에 담을 수 있는 최대 수량 (회원 동기화 저장과 같다) */
const MAX_QUANTITY = 99;

/**
 * 저장된 장바구니를 정리한다. 배열이 아니면 null(빈 장바구니로 시작), 모양이 다른 줄은 빼고 같은 상품은 첫 줄만 남긴다.
 * 머리글의 수량 표시가 모든 화면에서 읽으므로, 깨진 값이 남으면 사이트 전체가 열리지 않는다.
 */
export function parseCart(value: unknown): CartLine[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  return value.flatMap((line: unknown) => {
    if (typeof line !== "object" || line === null) return [];
    const { productId, quantity } = line as Record<string, unknown>;
    if (typeof productId !== "string" || !productId || seen.has(productId)) return [];
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return [];
    seen.add(productId);
    return [{ productId, quantity: Math.min(quantity, MAX_QUANTITY) }];
  });
}

const store = createLocalStore<CartLine[]>("mfg:cart", [], parseCart);

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
