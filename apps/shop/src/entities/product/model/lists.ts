"use client";

import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/shared/lib";

export const COMPARE_MAX = 4;
const RECENT_MAX = 8;

const compareStore = createLocalStore<string[]>("mfg:compare", []);
const recentStore = createLocalStore<string[]>("mfg:recent", []);

/** 비교 목록 (상품 slug, 최대 4개) */
export function useCompareList(): string[] {
  return useSyncExternalStore(compareStore.subscribe, compareStore.get, compareStore.getServer);
}

/** 비교 목록에 넣거나 뺀다. 가득 차서 넣지 못하면 false */
export function toggleCompare(slug: string): boolean {
  const list = compareStore.get();
  if (list.includes(slug)) {
    compareStore.set(list.filter((s) => s !== slug));
    return true;
  }
  if (list.length >= COMPARE_MAX) return false;
  compareStore.set([...list, slug]);
  return true;
}

export function clearCompare() {
  compareStore.set([]);
}

/** 최근 본 상품 (최근 것이 앞, 최대 8개) */
export function useRecentList(): string[] {
  return useSyncExternalStore(recentStore.subscribe, recentStore.get, recentStore.getServer);
}

export function recordRecent(slug: string) {
  recentStore.set((list) => [slug, ...list.filter((s) => s !== slug)].slice(0, RECENT_MAX));
}
