"use server";

import { getDb, hasDatabase, isWished, toggleWish } from "@mfg/db";
import { getProductById } from "@mfg/catalog";
import { getSessionUserId } from "@/entities/member/index.server";

export async function getWishAction(productId: string): Promise<boolean | null> {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase()) return null;
  return isWished(getDb(), userId, productId);
}

export async function toggleWishAction(productId: string): Promise<{ ok: boolean; wished?: boolean; message?: string }> {
  if (!getProductById(productId)) return { ok: false, message: "상품을 찾지 못했습니다." };
  const userId = await getSessionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 찜할 수 있습니다." };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다." };
  return { ok: true, wished: await toggleWish(getDb(), userId, productId) };
}
