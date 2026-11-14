"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { assemblyServices, buildSlots, buildTotal, checkBuild, estimateWatts, formatPrice, recommendedWatts, type PartKind } from "@mfg/catalog";
import { addToCart } from "@/entities/cart";
import { useCatalog } from "@/entities/product";
import { clearPart, decodeBuild, encodeBuild, replaceBuild, resetBuild, selectPart, toBuild, toggleService, useBuildState } from "@/entities/build";
import { useMemberName } from "@/entities/member";
import { useSubmitLock } from "@/shared/lib";
import { PlannerSlot } from "@/widgets/gear-planner";
import { saveBuildAction } from "../api/actions";
import { PartPicker } from "./PartPicker";

export function BuildPlanner() {
  const state = useBuildState();
  const catalog = useCatalog();
  const params = useSearchParams();
  const [picking, setPicking] = useState<PartKind | null>(null);
  // 닫힌 뒤에도 dialog를 남겨 두어야 브라우저가 열기 전 버튼으로 초점을 돌려준다.
  const [pickerPart, setPickerPart] = useState<PartKind | null>(null);
  const [notice, setNotice] = useState("");
  const memberName = useMemberName();
  const uid = useId();
  const saveLock = useSubmitLock();
  const [saving, setSaving] = useState(false);

  // 공유 주소로 들어오면 그 견적을 불러온다.
  const shared = params.get("b");
  useEffect(() => {
    if (!shared) return;
    const decoded = decodeBuild(shared);
    if (decoded) replaceBuild(decoded);
  }, [shared]);

  const build = toBuild(state, catalog);
  const issues = checkBuild(build);
  const errors = issues.filter((issue) => issue.level === "error");
  const filled = buildSlots.filter((slot) => build[slot.part]).length;
  const missingRequired = buildSlots.filter((slot) => slot.required && !build[slot.part]);
  const partsTotal = buildTotal(build);
  const assembling = state.services.includes("svc-assembly");
  const servicesTotal = assembling ? assemblyServices.filter((s) => state.services.includes(s.id)).reduce((sum, s) => sum + s.price, 0) : 0;
  const pickingSlot = buildSlots.find((slot) => slot.part === pickerPart);
  const canOrder = missingRequired.length === 0 && errors.length === 0;

  async function share() {
    const url = `${window.location.origin}/build?b=${encodeURIComponent(encodeBuild(state))}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("견적 주소를 복사했습니다.");
    } catch {
      setNotice(`복사하지 못했습니다. 이 주소를 직접 복사하세요: ${url}`);
    }
  }

  async function save(name: string) {
    if (!saveLock.tryLock()) return;
    setSaving(true);
    const result = await saveBuildAction(name, encodeBuild(state), partsTotal + servicesTotal);
    setSaving(false);
    saveLock.release();
    setNotice(result.message);
  }

  function addAllToCart() {
    Object.values(build).forEach((product) => product && addToCart(product.id));
    if (assembling) state.services.forEach((id) => addToCart(id));
    setNotice("견적의 부품과 조립 서비스를 장바구니에 담았습니다.");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-labelledby={`${uid}slots`} className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id={`${uid}slots`} className="mono-label">
            [Parts · {filled} / {buildSlots.length}]
          </h2>
          <div aria-hidden="true" className="flex gap-0.5 font-mono text-sm text-label">
            {buildSlots.map((slot) => (
              <span key={slot.part} className={build[slot.part] ? "text-cream" : undefined}>
                {build[slot.part] ? "|" : "-"}
              </span>
            ))}
          </div>
        </div>
        <ol className="flex flex-col gap-2">
          {buildSlots.map((slot, i) => {
            const product = build[slot.part];
            const slotIssues = issues.filter((issue) => issue.parts.includes(slot.part));
            return (
              <PlannerSlot
                key={slot.part}
                index={i}
                label={slot.label}
                optional={!slot.required}
                product={product}
                emptyText="부품을 골라 주세요"
                issues={slotIssues}
                errorPrefix="호환 안 됨: "
                onPick={() => {
                  setPickerPart(slot.part);
                  setPicking(slot.part);
                }}
                onClear={() => clearPart(slot.part)}
              />
            );
          })}
        </ol>
      </section>

      <aside aria-labelledby={`${uid}summary`} className="flex flex-col gap-6 lg:sticky lg:top-40 lg:self-start">
        <h2 id={`${uid}summary`} className="mono-label">
          [Summary]
        </h2>

        <dl className="grid grid-cols-[1fr_auto] gap-y-2 font-mono text-sm tabular-nums">
          <dt className="text-mute-200">예상 소비 전력</dt>
          <dd>{estimateWatts(build)}W</dd>
          <dt className="text-mute-200">권장 파워</dt>
          <dd>{recommendedWatts(build)}W 이상</dd>
          <dt className="text-mute-200">부품 합계</dt>
          <dd>{formatPrice(partsTotal)}</dd>
          <dt className="text-mute-200">조립 서비스</dt>
          <dd>{formatPrice(servicesTotal)}</dd>
          <dt className="border-t border-white/10 pt-2 text-cream">총액</dt>
          <dd className="border-t border-white/10 pt-2 text-lg text-cream">{formatPrice(partsTotal + servicesTotal)}</dd>
        </dl>

        <fieldset className="flex flex-col gap-2">
          <legend className="mono-label mb-2">[Assembly]</legend>
          {assemblyServices.map((service) => {
            const disabled = !service.required && !assembling;
            return (
              <label
                key={service.id}
                className="flex cursor-pointer items-start gap-3 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                aria-disabled={disabled || undefined}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#ff3131]"
                  checked={state.services.includes(service.id) && (service.required || assembling)}
                  disabled={disabled}
                  onChange={(event) => toggleService(service.id, event.target.checked)}
                />
                <span className="flex flex-col">
                  <span>
                    {service.required ? "조립 맡기기" : service.name} · <span className="font-mono tabular-nums">{formatPrice(service.price)}</span>
                  </span>
                  <span className="text-xs text-mute-200">{service.description}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div role="status" className="flex flex-col gap-1 text-sm">
          {errors.length > 0 && <p className="text-brand">호환 문제 {errors.length}건을 먼저 해결해 주세요.</p>}
          {missingRequired.length > 0 && (
            <p className="text-mute-200">아직 고르지 않은 필수 부품: {missingRequired.map((s) => s.label).join(", ")}</p>
          )}
          {canOrder && <p className="text-[#3cb371]">호환성 확인을 마쳤습니다. 주문할 수 있습니다.</p>}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={addAllToCart}
            disabled={!canOrder}
            className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-not-allowed disabled:bg-mute-200/40 disabled:text-ink/70"
          >
            견적 전체 장바구니 담기
          </button>
          <div className="grid grid-cols-2 gap-2">
            {memberName && (
              <form
                className="col-span-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  save(String(new FormData(event.currentTarget).get("buildName") ?? ""));
                }}
              >
                <label htmlFor={`${uid}buildName`} className="sr-only">
                  견적 이름
                </label>
                <input
                  id={`${uid}buildName`}
                  name="buildName"
                  defaultValue="내 견적"
                  maxLength={40}
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-white/20 bg-black/30 px-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={filled === 0 || saving}
                  className="min-h-11 shrink-0 rounded-md border border-white/30 px-3 text-sm hover:border-white disabled:opacity-50"
                >
                  {saving ? "저장 중…" : "견적 저장"}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={share}
              disabled={filled === 0}
              className="min-h-11 rounded-md border border-white/30 text-sm hover:border-white disabled:opacity-50"
            >
              견적 주소 복사
            </button>
            <button
              type="button"
              onClick={resetBuild}
              disabled={filled === 0}
              className="min-h-11 rounded-md border border-white/30 text-sm hover:border-white disabled:opacity-50"
            >
              처음부터
            </button>
          </div>
          {filled > 0 && (
            <a
              href={`/api/og/build?b=${encodeURIComponent(encodeBuild(state))}`}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 text-sm hover:border-white"
            >
              견적 이미지 보기<span className="sr-only"> (새 창)</span>
            </a>
          )}
          <p role="status" className="min-h-5 break-all text-sm text-mute-100">
            {notice}
            {notice.startsWith("견적의") && (
              <>
                {" "}
                <Link href="/cart" className="underline">
                  장바구니로 가기
                </Link>
              </>
            )}
          </p>
        </div>
      </aside>

      {pickingSlot && (
        <PartPicker
          part={pickingSlot.part}
          label={pickingSlot.label}
          build={build}
          open={picking !== null}
          onClose={() => setPicking(null)}
          onSelect={(id) => {
            selectPart(pickingSlot.part, id);
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}
