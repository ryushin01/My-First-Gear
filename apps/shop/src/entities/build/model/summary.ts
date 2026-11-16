import { buildSlots, getProductById, getService, type AssemblyService, type Product } from "@mfg/catalog";
import { decodeBuild } from "./codec";

export type BuildSummary = {
  rows: { slot: string; product: Product }[];
  services: AssemblyService[];
  assembling: boolean;
  total: number;
};

/**
 * 공유 주소의 견적(`/build?b=`)을 칸 순서대로 풀고 총액을 낸다. 공유 이미지와 미리보기 제목이 같은 값을 쓴다.
 * 조립 서비스는 기본 조립을 골랐을 때만 더한다(견적 화면과 같다). 읽을 수 없는 값이면 null
 */
export function summarizeBuild(encoded: string, catalog: Product[]): BuildSummary | null {
  const state = decodeBuild(encoded.slice(0, 500));
  if (!state) return null;
  const rows = buildSlots.flatMap((slot) => {
    const id = state.parts[slot.part];
    const product = id ? getProductById(id, catalog) : undefined;
    return product ? [{ slot: slot.label, product }] : [];
  });
  const assembling = state.services.includes("svc-assembly");
  const services = assembling ? state.services.flatMap((id) => getService(id) ?? []) : [];
  const total = rows.reduce((sum, r) => sum + r.product.price, 0) + services.reduce((sum, s) => sum + s.price, 0);
  return { rows, services, assembling, total };
}
