"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { budgets, buildSlots, formatPrice, purposes, recommendBuild, type Purpose, type Recommendation } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { replaceBuild } from "@/entities/build";
import { useCatalog } from "@/entities/product";

/** 예산과 용도를 고르면 호환되는 구성을 추천하고, 그대로 PC 견적으로 가져간다. */
export function QuickBuild() {
  const catalog = useCatalog();
  const router = useRouter();
  const [result, setResult] = useState<{ rec: Recommendation | null; budget: number; purpose: Purpose } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const budget = Number(data.get("budget"));
    const purpose = String(data.get("purpose")) as Purpose;
    setResult({ rec: recommendBuild(budget, purpose, catalog), budget, purpose });
  }

  function startBuild(rec: Recommendation) {
    const parts = Object.fromEntries(Object.entries(rec.build).map(([part, p]) => [part, p!.id]));
    replaceBuild({ parts, services: ["svc-assembly"] });
    router.push("/build");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mono-label mb-2">[Budget] 부품 예산</legend>
          {budgets.map((b, i) => (
            <label key={b.value} className="inline-flex min-h-8 cursor-pointer items-center gap-3">
              <input type="radio" name="budget" value={b.value} defaultChecked={i === 2} className="size-4 accent-[#ff3131]" />
              {b.label} 이하
            </label>
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mono-label mb-2">[Purpose] 용도</legend>
          {purposes.map((p, i) => (
            <label key={p.value} className="flex cursor-pointer items-start gap-3">
              <input type="radio" name="purpose" value={p.value} defaultChecked={i === 0} className="mt-1 size-4 accent-[#ff3131]" />
              <span className="flex flex-col">
                <span>{p.label}</span>
                <span className="text-xs text-mute-200">{p.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white">
          추천 받기
        </button>
      </form>

      <section aria-label="추천 결과" aria-live="polite" className="flex flex-col gap-4">
        {!result && <p className="text-mute-200">예산과 용도를 고르면 재고가 있는 부품 중 호환되는 구성을 골라 드립니다.</p>}
        {result && !result.rec && (
          <p className="text-brand">
            {formatPrice(result.budget)} 안에서 호환되는 구성을 찾지 못했습니다. 예산을 늘려 보세요.
          </p>
        )}
        {result?.rec && (
          <>
            <p className="font-display text-3xl">
              {purposes.find((p) => p.value === result.purpose)?.label}용 · {formatPrice(result.rec.total)}
            </p>
            <ul className="flex flex-col gap-2">
              {buildSlots.map((slot) => {
                const product = result.rec!.build[slot.part];
                return (
                  <li key={slot.part} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-lg border border-white/10 p-2">
                    <span className="grid size-12 place-items-center rounded bg-black/40 text-cream">
                      {product ? <GearArt art={product.art} className="size-10" /> : <span className="font-mono text-[11px] text-label">—</span>}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-mono text-[11px] uppercase text-label">[{slot.label}]</span>
                      {product ? (
                        <Link href={`/product/${product.slug}`} className="hover:underline">
                          {product.name}
                        </Link>
                      ) : (
                        <span className="text-mute-200">내장 그래픽 사용</span>
                      )}
                    </span>
                    <span className="font-mono text-sm tabular-nums">{product ? formatPrice(product.price) : ""}</span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => startBuild(result.rec!)}
              className="min-h-12 w-fit rounded-md border border-cream px-6 hover:bg-cream hover:text-ink"
            >
              이 구성으로 PC 견적 시작
            </button>
          </>
        )}
      </section>
    </div>
  );
}
