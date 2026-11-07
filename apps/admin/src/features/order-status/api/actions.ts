"use server";

import { revalidatePath } from "next/cache";
import { getDb, orderStatuses, updateOrderStatus, type OrderStatus } from "@mfg/db";
import type { ActionState } from "@/shared/ui";

export async function updateOrderStatusAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderStatuses.includes(status)) return { ok: false, message: "알 수 없는 상태입니다." };
  const row = await updateOrderStatus(getDb(), id, status);
  if (!row) return { ok: false, message: "주문을 찾지 못했습니다." };
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/");
  return { ok: true, message: `${id} 상태를 바꿨습니다.` };
}
