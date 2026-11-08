import { buildSlots, buildTotal, checkBuild, type Build } from "./compatibility";
import { products } from "./products";
import type { CategoryId, PartKind, Product } from "./types";

export type Purpose = "game" | "work" | "office";

export const purposes: { value: Purpose; label: string; description: string }[] = [
  { value: "game", label: "게임", description: "그래픽카드에 예산을 먼저 씁니다." },
  { value: "work", label: "작업", description: "CPU와 메모리에 예산을 먼저 씁니다 (영상·3D·개발)." },
  { value: "office", label: "사무·학습", description: "호환되는 가장 저렴한 구성을 고릅니다." },
];

export const budgets = [100, 150, 200, 300, 500].map((man) => ({ value: man * 10_000, label: `${man}만 원` }));

// 용도별로 어느 부품에 돈을 쓸지 (가격을 성능의 대략적인 대리 값으로 쓴다)
const WEIGHTS: Record<Exclude<Purpose, "office">, Partial<Record<PartKind, number>>> = {
  game: { gpu: 3, cpu: 1.5, memory: 0.5, storage: 0.5, mainboard: 0.2, psu: 0.2, case: 0.2, cooler: 0.2 },
  work: { cpu: 3, memory: 2, gpu: 1, storage: 0.8, mainboard: 0.3, psu: 0.2, case: 0.2, cooler: 0.3 },
};

export type Recommendation = { build: Build; total: number };

/**
 * 예산과 용도에 맞는 PC 구성을 고른다. 재고가 있는 부품의 모든 조합 중 호환 오류가 없고 예산 안인 것만 본다.
 * 사무용은 내장 그래픽이 있으면 그래픽카드를 빼고 가장 저렴한 구성을 고른다. 맞는 구성이 없으면 null.
 */
export function recommendBuild(budget: number, purpose: Purpose, source: Product[] = products): Recommendation | null {
  const pool = (part: PartKind) => source.filter((p) => p.categoryId === (part as CategoryId) && p.stock > 0);
  const choices = buildSlots.map((slot) => ({
    part: slot.part,
    options: slot.part === "gpu" ? [undefined, ...pool("gpu")] : pool(slot.part),
  }));

  let best: { build: Build; total: number; score: number } | null = null;
  const walk = (index: number, build: Build, total: number) => {
    if (total > budget) return;
    if (index === choices.length) {
      if (checkBuild(build).some((issue) => issue.level === "error")) return;
      const score =
        purpose === "office"
          ? -total
          : Object.entries(build).reduce((sum, [part, p]) => sum + (WEIGHTS[purpose][part as PartKind] ?? 0) * (p?.price ?? 0), 0);
      if (!best || score > best.score || (score === best.score && total < best.total)) best = { build: { ...build }, total, score };
      return;
    }
    const { part, options } = choices[index];
    for (const option of options) {
      const next = { ...build };
      if (option) next[part] = option;
      else delete next[part];
      walk(index + 1, next, total + (option?.price ?? 0));
    }
  };
  walk(0, {}, 0);
  const found = best as { build: Build; total: number } | null;
  return found ? { build: found.build, total: buildTotal(found.build) } : null;
}
