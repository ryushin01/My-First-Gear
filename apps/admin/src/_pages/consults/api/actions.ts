"use server";

import { revalidatePath } from "next/cache";
import { consultStatuses, getDb, updateConsultStatus, type ConsultStatus } from "@mfg/db";
import type { ActionState } from "@/shared/ui";

export async function updateConsultStatusAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "") as ConsultStatus;
  if (!Number.isInteger(id) || !consultStatuses.includes(status)) return { ok: false, message: "잘못된 요청입니다." };
  const row = await updateConsultStatus(getDb(), id, status);
  if (!row) return { ok: false, message: "상담 신청을 찾지 못했습니다." };
  revalidatePath("/consults");
  revalidatePath("/");
  return { ok: true, message: "상태를 바꿨습니다." };
}
