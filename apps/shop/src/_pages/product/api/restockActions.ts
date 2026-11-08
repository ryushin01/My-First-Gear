"use server";

import { getProductById } from "@mfg/catalog";
import { cancelRestock, getDb, hasDatabase, hasRestockRequest, requestRestock } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";

export async function getRestockAction(productId: string): Promise<boolean | null> {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase()) return null;
  return hasRestockRequest(getDb(), userId, productId);
}

export async function toggleRestockAction(productId: string, on: boolean): Promise<{ ok: boolean; on?: boolean; message: string }> {
  const product = getProductById(productId);
  if (!product) return { ok: false, message: "상품을 찾지 못했습니다." };
  const userId = await getSessionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 신청할 수 있습니다." };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다." };
  if (on) await requestRestock(getDb(), userId, productId);
  else await cancelRestock(getDb(), userId, productId);
  return {
    ok: true,
    on,
    message: on ? `${product.name} 재입고 알림을 신청했습니다. 입고되면 마이페이지에 표시됩니다.` : "재입고 알림을 취소했습니다.",
  };
}
