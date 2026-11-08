"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cancelOrderByUser, getDb, hasDatabase } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";
import { MERCH_TAG } from "@/entities/product/index.server";

export async function cancelOrderAction(_: { ok: boolean; message: string } | null, formData: FormData) {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase()) return { ok: false, message: "로그인한 회원만 주문을 취소할 수 있습니다." };
  const result = await cancelOrderByUser(getDb(), userId, String(formData.get("orderId") ?? ""));
  if (result.ok) {
    updateTag(MERCH_TAG); // 재고가 돌아왔다
    revalidatePath("/my");
  }
  return result;
}
