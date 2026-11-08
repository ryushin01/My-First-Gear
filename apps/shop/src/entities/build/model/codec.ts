import { getProductById, type PartKind } from "@mfg/catalog";

export type EncodableBuild = { parts: Partial<Record<PartKind, string>>; services: string[] };

/** 공유 주소에 담을 문자열. 예: cpu:p-cpu-001,gpu:p-gpu-001|svc-assembly,svc-os */
export function encodeBuild(state: EncodableBuild): string {
  const parts = Object.entries(state.parts)
    .map(([part, id]) => `${part}:${id}`)
    .join(",");
  return `${parts}|${state.services.join(",")}`;
}

export function decodeBuild(value: string): EncodableBuild | null {
  const [partsRaw = "", servicesRaw = ""] = value.split("|");
  const parts: EncodableBuild["parts"] = {};
  for (const pair of partsRaw.split(",").filter(Boolean)) {
    const [part, id] = pair.split(":");
    const product = id ? getProductById(id) : undefined;
    if (product?.compat?.part === part) parts[part as PartKind] = id;
  }
  if (Object.keys(parts).length === 0) return null;
  return { parts, services: servicesRaw.split(",").filter(Boolean) };
}
