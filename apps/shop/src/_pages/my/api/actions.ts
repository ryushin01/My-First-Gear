"use server";

import { revalidatePath } from "next/cache";
import { deleteSavedBuild, getDb } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";

export async function deleteBuildAction(formData: FormData) {
  const userId = await getSessionUserId();
  const id = Number(formData.get("id"));
  if (userId === null || !Number.isInteger(id)) return;
  await deleteSavedBuild(getDb(), userId, id);
  revalidatePath("/my");
}
