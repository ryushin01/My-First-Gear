"use server";

import { getDb, hasDatabase, saveBuild } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";
import { decodeBuild } from "@/entities/build";

export async function saveBuildAction(name: string, encoded: string, total: number): Promise<{ ok: boolean; message: string }> {
  const userId = await getSessionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 견적을 저장할 수 있습니다." };
  if (!decodeBuild(encoded)) return { ok: false, message: "저장할 부품이 없습니다." };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다." };
  const title = name.trim().slice(0, 40) || "내 견적";
  await saveBuild(getDb(), { userId, name: title, encoded: encoded.slice(0, 500), total: Math.max(0, Math.round(total)) });
  return { ok: true, message: `"${title}" 견적을 마이페이지에 저장했습니다.` };
}
