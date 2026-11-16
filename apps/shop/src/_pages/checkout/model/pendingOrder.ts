"use client";

import { useSyncExternalStore } from "react";
import { paymentMethods, type PlaceOrderRequest } from "@/entities/order";

/**
 * 결과를 모르는 결제 요청(응답이 끊김, 커밋 뒤 오류)을 이 탭에 남겨 둔다.
 * 새로 고쳐도 같은 요청(같은 제출 번호·같은 내용)으로 결과를 확인해, 주문이 두 번 생기지 않게 한다.
 */
const KEY = "mfg:checkout:pending";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: PlaceOrderRequest | null } = { raw: null, value: null };

/** 남겨 둔 요청의 모양을 검사한다. 다르면 버린다. */
function parse(raw: string | null): PlaceOrderRequest | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const request = value as PlaceOrderRequest;
    const linesOk =
      Array.isArray(request.lines) &&
      request.lines.length > 0 &&
      request.lines.every((l) => typeof l?.itemId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0);
    const buyerOk = (["name", "phone", "email", "address", "memo"] as const).every((key) => typeof request.buyer?.[key] === "string");
    const ok = linesOk && buyerOk && paymentMethods.some((m) => m.value === request.payment) && typeof request.submissionId === "string";
    return ok ? request : null;
  } catch {
    return null;
  }
}

function read(): PlaceOrderRequest | null {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
  } catch {
    // 저장소를 못 쓰면 이번 화면의 값만 쓴다.
    return cache.value;
  }
  if (raw !== cache.raw) cache = { raw, value: parse(raw) };
  return cache.value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePendingOrder(): PlaceOrderRequest | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

/** 결과를 모르는 요청을 남기거나(request) 지운다(null). */
export function rememberPendingOrder(request: PlaceOrderRequest | null) {
  const raw = request ? JSON.stringify(request) : null;
  cache = { raw, value: request };
  try {
    if (raw) window.sessionStorage.setItem(KEY, raw);
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // 저장하지 못해도 이번 화면에서는 잠금이 유지된다.
  }
  listeners.forEach((listener) => listener());
}
