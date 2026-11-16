"use client";

import { useSyncExternalStore } from "react";
import { buildSlots, getProductById, type Build, type PartKind, type Product } from "@mfg/catalog";
import { createLocalStore } from "@/shared/lib";

export type BuildState = {
  parts: Partial<Record<PartKind, string>>;
  services: string[];
};

const EMPTY: BuildState = { parts: {}, services: ["svc-assembly"] };

/**
 * 저장된 견적을 정리한다. 객체가 아니면 null(빈 견적으로 시작), 모르는 칸·문자열이 아닌 값은 뺀다.
 * services가 배열이 아니면 기본(조립 맡기기)으로 둔다.
 */
export function parseBuildState(value: unknown): BuildState | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { parts, services } = value as Record<string, unknown>;
  const cleanParts: BuildState["parts"] = {};
  if (typeof parts === "object" && parts !== null && !Array.isArray(parts)) {
    for (const slot of buildSlots) {
      const id = (parts as Record<string, unknown>)[slot.part];
      if (typeof id === "string" && id) cleanParts[slot.part] = id;
    }
  }
  const cleanServices = Array.isArray(services) ? services.filter((s): s is string => typeof s === "string") : EMPTY.services;
  return { parts: cleanParts, services: cleanServices };
}

const store = createLocalStore<BuildState>("mfg:build", EMPTY, parseBuildState);

export function useBuildState(): BuildState {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

export function selectPart(part: PartKind, productId: string) {
  store.set((state) => ({ ...state, parts: { ...state.parts, [part]: productId } }));
}

export function clearPart(part: PartKind) {
  store.set((state) => {
    const parts = { ...state.parts };
    delete parts[part];
    return { ...state, parts };
  });
}

export function toggleService(id: string, on: boolean) {
  store.set((state) => ({
    ...state,
    services: on ? [...new Set([...state.services, id])] : state.services.filter((s) => s !== id),
  }));
}

export function resetBuild() {
  store.set(EMPTY);
}

/** 회원 동기화용: 바뀔 때마다 알림을 받고, 현재 값을 읽는다. */
export const onBuildChange = (listener: () => void) => store.subscribe(listener);
export const readBuild = () => store.get();

export function replaceBuild(next: BuildState) {
  store.set(next);
}

export function toBuild(state: BuildState, catalog: Product[]): Build {
  const build: Build = {};
  for (const [part, id] of Object.entries(state.parts) as [PartKind, string][]) {
    const product = getProductById(id, catalog);
    if (product) build[part] = product;
  }
  return build;
}
