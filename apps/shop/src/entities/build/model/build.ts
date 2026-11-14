"use client";

import { useSyncExternalStore } from "react";
import { getProductById, type Build, type PartKind, type Product } from "@mfg/catalog";
import { createLocalStore } from "@/shared/lib";

export type BuildState = {
  parts: Partial<Record<PartKind, string>>;
  services: string[];
};

const EMPTY: BuildState = { parts: {}, services: ["svc-assembly"] };
const store = createLocalStore<BuildState>("mfg:build", EMPTY);

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
