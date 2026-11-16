"use server";

import { revalidatePath } from "next/cache";
import { deleteSavedBuild, getDb } from "@mfg/db";
import { getActionUserId } from "@/entities/member/index.server";
import { guardAction } from "@/shared/lib/server";

/** 저장한 견적 삭제. 실패하면 서버 로그만 남기고 목록은 그대로 둔다(다시 누르면 된다). */
export async function deleteBuildAction(formData: FormData) {
  await guardAction(
    "delete-build",
    async () => {
      const userId = await getActionUserId();
      const id = Number(formData.get("id"));
      if (userId === null || !Number.isInteger(id)) return;
      await deleteSavedBuild(getDb(), userId, id);
      revalidatePath("/my");
    },
    () => undefined,
  );
}
