"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { checkSetup, decodeSetup, encodeSetup, formatPrice, setupSlots, setupTotal, toSetup, type SetupSlotId } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { addToCart } from "@/entities/cart";
import { useCatalog } from "@/entities/product";
import { clearSetupItem, pickSetupItem, replaceSetup, resetSetup, useSetupState } from "../model/setupStore";
import { SetupPicker } from "./SetupPicker";

export function SetupPlanner() {
  const state = useSetupState();
  const catalog = useCatalog();
  const params = useSearchParams();
  const uid = useId();
  const [picking, setPicking] = useState<SetupSlotId | null>(null);
  // 닫힌 뒤에도 dialog를 남겨 두어야 브라우저가 열기 전 버튼으로 초점을 돌려준다.
  const [pickerSlot, setPickerSlot] = useState<SetupSlotId | null>(null);
  const [notice, setNotice] = useState("");

  const shared = params.get("s");
  useEffect(() => {
    if (!shared) return;
    const decoded = decodeSetup(shared);
    if (decoded) replaceSetup(decoded);
  }, [shared]);

  const setup = toSetup(state, catalog);
  const issues = checkSetup(setup);
  const errors = issues.filter((issue) => issue.level === "error");
  const filled = setupSlots.filter((slot) => setup[slot.id]).length;
  const total = setupTotal(setup);
  const slotForPicker = setupSlots.find((slot) => slot.id === pickerSlot);
  const soldOut = Object.values(setup).filter((product) => product && product.stock === 0);
  const canOrder = filled > 0 && errors.length === 0 && soldOut.length === 0;

  async function share() {
    const url = `${window.location.origin}/setup?s=${encodeURIComponent(encodeSetup(state))}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("셋업 주소를 복사했습니다.");
    } catch {
      setNotice(`복사하지 못했습니다. 이 주소를 직접 복사하세요: ${url}`);
    }
  }

  function addAllToCart() {
    Object.values(setup).forEach((product) => product && addToCart(product.id));
    setNotice("셋업의 장비를 장바구니에 담았습니다.");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-labelledby={`${uid}slots`} className="flex flex-col gap-4">
        <h2 id={`${uid}slots`} className="mono-label">
          [Desk Setup · {filled} / {setupSlots.length}]
        </h2>
        <ol className="flex flex-col gap-2">
          {setupSlots.map((slot, i) => {
            const product = setup[slot.id];
            const slotIssues = issues.filter((issue) => issue.slots.includes(slot.id));
            return (
              <li
                key={slot.id}
                className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-white/10 p-3 sm:grid-cols-[auto_1fr_auto]"
              >
                <div className="grid size-16 place-items-center rounded-md bg-black/40 text-cream">
                  {product ? (
                    <GearArt art={product.art} className="size-14" />
                  ) : (
                    <span className="font-mono text-xs text-label">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="font-mono text-[11px] uppercase text-label">
                    [{String(i + 1).padStart(2, "0")} · {slot.label}]
                  </p>
                  <p className={product ? "text-cream" : "text-mute-200"}>{product?.name ?? "고르지 않음"}</p>
                  {product && <p className="font-mono text-sm tabular-nums text-mute-100">{formatPrice(product.price)}</p>}
                  {slotIssues.map((issue) => (
                    <p key={issue.message} className={issue.level === "error" ? "text-sm text-brand" : "text-sm text-[#f2c230]"}>
                      {issue.level === "error" ? "맞지 않음: " : "주의: "}
                      {issue.message}
                    </p>
                  ))}
                </div>
                <div className="col-span-2 flex gap-2 sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSlot(slot.id);
                      setPicking(slot.id);
                    }}
                    className="min-h-11 rounded-md border border-white/30 px-4 text-sm hover:border-white"
                  >
                    {product ? "바꾸기" : "고르기"}
                    <span className="sr-only">: {slot.label}</span>
                  </button>
                  {product && (
                    <button type="button" onClick={() => clearSetupItem(slot.id)} className="min-h-11 rounded-md px-3 text-sm text-mute-200 hover:text-cream">
                      빼기<span className="sr-only">: {slot.label}</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <aside aria-labelledby={`${uid}summary`} className="flex flex-col gap-6 lg:sticky lg:top-40 lg:self-start">
        <h2 id={`${uid}summary`} className="mono-label">
          [Summary]
        </h2>
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 font-mono text-sm tabular-nums">
          <dt className="text-mute-200">고른 장비</dt>
          <dd>
            {filled} / {setupSlots.length}
          </dd>
          <dt className="border-t border-white/10 pt-2 text-cream">총액</dt>
          <dd className="border-t border-white/10 pt-2 text-lg text-cream">{formatPrice(total)}</dd>
        </dl>

        <div role="status" className="flex flex-col gap-1 text-sm">
          {errors.length > 0 && <p className="text-brand">맞지 않는 조합 {errors.length}건을 먼저 해결해 주세요.</p>}
          {soldOut.length > 0 && <p className="text-brand">품절 상품: {soldOut.map((p) => p?.name).join(", ")}</p>}
          {canOrder && <p className="text-[#3cb371]">조합 확인을 마쳤습니다. 한 번에 담을 수 있습니다.</p>}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={addAllToCart}
            disabled={!canOrder}
            className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-not-allowed disabled:bg-mute-200/40 disabled:text-ink/70"
          >
            셋업 전체 장바구니 담기
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={share} disabled={filled === 0} className="min-h-11 rounded-md border border-white/30 text-sm hover:border-white disabled:opacity-50">
              셋업 주소 복사
            </button>
            <button type="button" onClick={resetSetup} disabled={filled === 0} className="min-h-11 rounded-md border border-white/30 text-sm hover:border-white disabled:opacity-50">
              처음부터
            </button>
          </div>
          <p role="status" className="min-h-5 break-all text-sm text-mute-100">
            {notice}
            {notice.startsWith("셋업의") && (
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

      {slotForPicker && (
        <SetupPicker
          slot={slotForPicker}
          setup={setup}
          open={picking !== null}
          onClose={() => setPicking(null)}
          onSelect={(id) => {
            pickSetupItem(slotForPicker.id, id);
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}
