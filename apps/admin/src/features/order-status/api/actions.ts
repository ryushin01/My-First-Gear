"use server";

import { revalidatePath } from "next/cache";
import { getDb, orderStatuses, updateOrderStatus, type OrderStatus } from "@mfg/db";
import { ACTION_FAILED_MESSAGE } from "@/shared/lib";
import { guardAction } from "@/shared/lib/server";
import type { ActionState } from "@/shared/ui";

const FAILURE = {
  "not-found": "주문을 찾지 못했습니다.",
  cancelled: "취소한 주문은 상태를 바꿀 수 없습니다. (재고는 이미 돌아갔습니다)",
  same: "이미 그 상태입니다.",
} as const;

export async function updateOrderStatusAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderStatuses.includes(status)) return { ok: false, message: "알 수 없는 상태입니다." };
  return guardAction<ActionState>(
    "order-status",
    async () => {
      const result = await updateOrderStatus(getDb(), id, status);
      if (!result.ok) return { ok: false, message: FAILURE[result.reason] };
      revalidatePath("/orders");
      revalidatePath(`/orders/${id}`);
      revalidatePath("/");
      return { ok: true, message: status === "cancelled" ? `${id}을(를) 취소하고 재고를 돌려놓았습니다.` : `${id} 상태를 바꿨습니다.` };
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE }),
  );
}
