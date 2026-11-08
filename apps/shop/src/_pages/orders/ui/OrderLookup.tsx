"use client";

import { useId, useState, type FormEvent } from "react";
import { formatPrice } from "@mfg/catalog";
import { lookupOrderAction, orderStatusLabel, type OrderSummary } from "@/entities/order";
import { useSubmitLock } from "@/shared/lib";
import { TextField } from "@/shared/ui";

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; order: OrderSummary }
  | { kind: "missing" }
  | { kind: "error"; message: string };

/** 비회원 주문 조회. 주문 번호와 받는 분 이름이 모두 맞아야 보여준다. */
export function OrderLookup() {
  const [state, setState] = useState<LookupState>({ kind: "idle" });
  const resultId = useId();
  const lock = useSubmitLock();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lock.tryLock()) return;
    const data = new FormData(event.currentTarget);
    setState({ kind: "loading" });
    const result = await lookupOrderAction(String(data.get("orderId") ?? ""), String(data.get("buyerName") ?? ""));
    lock.release();
    if (!result.ok) setState({ kind: "error", message: result.message });
    else setState(result.data ? { kind: "found", order: result.data } : { kind: "missing" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" aria-describedby={resultId}>
        <TextField id="orderId" label="주문 번호" placeholder="MFG-261107-000000" autoComplete="off" required />
        <TextField id="buyerName" label="받는 분 이름" autoComplete="name" required />
        <button
          type="submit"
          disabled={state.kind === "loading"}
          className="min-h-12 rounded-md bg-cream px-6 font-medium text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          {state.kind === "loading" ? "조회 중…" : "조회하기"}
        </button>
      </form>

      <div id={resultId} role="status">
        {state.kind === "missing" && <p className="text-brand">일치하는 주문이 없습니다. 주문 번호와 이름을 다시 확인해 주세요.</p>}
        {state.kind === "error" && <p className="text-brand">{state.message}</p>}
        {state.kind === "found" && (
          <section aria-label="조회 결과" className="flex flex-col gap-3">
            <p className="mono-label">[{state.order.id}]</p>
            <p className="font-display text-3xl">{orderStatusLabel[state.order.status]}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {state.order.lines.map((line) => (
                <li key={line.name} className="flex justify-between gap-3">
                  <span className="text-mute-100">
                    {line.name} × {line.quantity}
                  </span>
                  <span className="font-mono tabular-nums">{formatPrice(line.price * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="font-mono tabular-nums">합계 {formatPrice(state.order.total)}</p>
          </section>
        )}
      </div>
    </div>
  );
}
