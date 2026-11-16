"use server";

import { getProductById } from "@mfg/catalog";
import { cancelRestock, getDb, hasDatabase, hasRestockRequest, requestRestock } from "@mfg/db";
import { getActionUserId } from "@/entities/member/index.server";
import { countRestocked } from "./count";

export async function getRestockAction(productId: string): Promise<boolean | null> {
  const userId = await getActionUserId();
  if (userId === null || !hasDatabase()) return null;
  return hasRestockRequest(getDb(), userId, productId);
}

/** 지금 회원의 다시 들어온 재입고 알림 수. 로그인하지 않았거나 DB가 없으면 null */
export async function getRestockedCountAction(): Promise<number | null> {
  if (!hasDatabase()) return null;
  const userId = await getActionUserId();
  if (userId === null) return null;
  return countRestocked(getDb(), userId);
}

export async function toggleRestockAction(productId: string, on: boolean): Promise<{ ok: boolean; on?: boolean; message: string }> {
  const product = getProductById(productId);
  if (!product) return { ok: false, message: "상품을 찾지 못했습니다." };
  const userId = await getActionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 신청할 수 있습니다." };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다." };
  if (on) await requestRestock(getDb(), userId, productId);
  else await cancelRestock(getDb(), userId, productId);
  return {
    ok: true,
    on,
    message: on ? `${product.name} 재입고 알림을 신청했습니다. 입고되면 머리글과 마이페이지에 알려 드립니다.` : "재입고 알림을 취소했습니다.",
  };
}
