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

/** 공유 주소에 담을 문자열. 예: cpu:p-cpu-001,gpu:p-gpu-001|svc-assembly,svc-os */
export function encodeBuild(state: BuildState): string {
  const parts = Object.entries(state.parts)
    .map(([part, id]) => `${part}:${id}`)
    .join(",");
  return `${parts}|${state.services.join(",")}`;
}

export function decodeBuild(value: string): BuildState | null {
  const [partsRaw = "", servicesRaw = ""] = value.split("|");
  const parts: BuildState["parts"] = {};
  for (const pair of partsRaw.split(",").filter(Boolean)) {
    const [part, id] = pair.split(":");
    const product = id ? getProductById(id) : undefined;
    if (product?.compat?.part === part) parts[part as PartKind] = id;
  }
  if (Object.keys(parts).length === 0) return null;
  return { parts, services: servicesRaw.split(",").filter(Boolean) };
}
