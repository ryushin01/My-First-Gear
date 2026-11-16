"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cancelOrderByUser, getDb, hasDatabase } from "@mfg/db";
import { getActionUserId } from "@/entities/member/index.server";
import { MERCH_TAG } from "@/entities/product/index.server";
import { ACTION_FAILED_MESSAGE } from "@/shared/lib";
import { guardAction } from "@/shared/lib/server";

type CancelState = { ok: boolean; message: string } | null;

export async function cancelOrderAction(_: CancelState, formData: FormData): Promise<CancelState> {
  return guardAction<CancelState>(
    "cancel-order",
    async () => {
      const userId = await getActionUserId();
      if (userId === null || !hasDatabase()) return { ok: false, message: "로그인한 회원만 주문을 취소할 수 있습니다." };
      const result = await cancelOrderByUser(getDb(), userId, String(formData.get("orderId") ?? ""));
      if (result.ok) {
        updateTag(MERCH_TAG); // 재고가 돌아왔다
        revalidatePath("/my");
      }
      return result;
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE }),
  );
}
