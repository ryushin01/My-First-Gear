"use client";

import { useSyncExternalStore } from "react";
import { buildSlots, getProductById, type Build, type PartKind, type Product } from "@mfg/catalog";
import { createLocalStore } from "@/shared/lib";
import { createShareUndo } from "@/shared/lib/share-undo";

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

/**
 * 견적 내용이 같은지. 칸을 고른 순서·서비스 순서와 상관없이 비교한다.
 * (공유 주소는 고른 순서대로 담기므로, 같은 견적도 주소 문자열은 다를 수 있다)
 */
export function sameBuild(a: BuildState, b: BuildState): boolean {
  if (!buildSlots.every((slot) => a.parts[slot.part] === b.parts[slot.part])) return false;
  const services = new Set(a.services);
  const other = new Set(b.services);
  return services.size === other.size && [...services].every((id) => other.has(id));
}

const store = createLocalStore<BuildState>("mfg:build", EMPTY, parseBuildState);
/** 공유 주소(/build?b=, 마이페이지 "불러오기")로 덮어쓰기 전의 견적. 되돌리기에 쓴다. */
const share = createShareUndo(store, "mfg:build:previous", {
  parse: parseBuildState,
  isEmpty: (state) => Object.keys(state.parts).length === 0,
  same: sameBuild,
});

/** 공유 주소의 견적으로 바꾼다. 고르던 견적이 다르면 되돌릴 수 있게 남겨 둔다. */
export const applySharedBuild = share.apply;
export const usePreviousBuild = share.usePrevious;
export const restorePreviousBuild = share.restore;
export const dismissPreviousBuild = share.dismiss;

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

/** 로그아웃용: 고르던 견적과 공유 주소로 덮어쓰기 전 견적까지 지운다(공용 컴퓨터에 회원 견적이 남지 않게). */
export function forgetBuild() {
  resetBuild();
  share.dismiss();
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
