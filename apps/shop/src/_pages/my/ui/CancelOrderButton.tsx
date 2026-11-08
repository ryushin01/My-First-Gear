"use client";

import { useActionState } from "react";
import { useActionFormLock } from "@/shared/lib";
import { cancelOrderAction } from "../api/orderActions";

/**
 * 회원 주문 취소. 취소에 성공하면 버튼은 사라지지만 결과 안내는 남도록 항상 그려 둔다.
 * (cancellable이 false여도 컴포넌트를 유지해 상태가 지워지지 않게 한다)
 */
export function CancelOrderButton({ orderId, cancellable }: { orderId: string; cancellable: boolean }) {
  const [state, action, pending] = useActionState(cancelOrderAction, null);
  const guardSubmit = useActionFormLock(state);
  if (!cancellable) {
    return state ? (
      <p role="status" className={`text-xs ${state.ok ? "text-[#3cb371]" : "text-brand"}`}>
        {state.message}
      </p>
    ) : null;
  }
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`${orderId} 주문을 취소할까요?`)) {
          event.preventDefault();
          return;
        }
        guardSubmit(event);
      }}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" disabled={pending} className="min-h-11 w-fit rounded-md border border-white/30 px-3 text-sm hover:border-white disabled:opacity-60">
        {pending ? "취소 중…" : "주문 취소"}
        <span className="sr-only">: {orderId}</span>
      </button>
      <p role="status" className={`text-xs ${state?.ok ? "text-[#3cb371]" : "text-brand"}`}>
        {state?.message ?? ""}
      </p>
    </form>
  );
}
