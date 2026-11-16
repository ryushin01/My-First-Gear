"use client";

import { useActionState } from "react";
import { useActionFormLock } from "@/shared/lib";
import { ActionMessage, SubmitButton } from "@/shared/ui";
import { updateOrderStatusAction } from "../api/actions";
import { orderStatusOptions } from "../model/labels";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const [state, action] = useActionState(updateOrderStatusAction, null);
  const guardSubmit = useActionFormLock(state);
  const selectId = `status-${orderId}`;
  // 취소한 주문은 재고가 이미 돌아가 다시 바꿀 수 없다(서버도 막는다). 방금 취소한 결과 안내는 남겨 둔다.
  if (status === "cancelled") {
    return (
      <div>
        <p className="is-size-7 has-text-grey-dark">취소한 주문이라 바꿀 수 없습니다.</p>
        <ActionMessage state={state} />
      </div>
    );
  }
  return (
    <form action={action} onSubmit={guardSubmit}>
      <input type="hidden" name="orderId" value={orderId} />
      <div className="field has-addons mb-0">
        <div className="control">
          <label className="is-sr-only" htmlFor={selectId}>
            {orderId} 상태
          </label>
          <div className="select is-small">
            <select id={selectId} name="status" defaultValue={status}>
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="control">
          <SubmitButton className="is-small is-link">
            변경<span className="is-sr-only">: {orderId}</span>
          </SubmitButton>
        </div>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
