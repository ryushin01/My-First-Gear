"use server";

import {
  getDb,
  getMemberState,
  hasDatabase,
  listRestockByUser,
  saveMemberBuild,
  saveMemberCart,
  type StoredBuild,
  type StoredCartLine,
} from "@mfg/db";
import { getSalesInfo } from "@/entities/product/index.server";
import { getActionUserId, memberTag } from "@/entities/member/index.server";

const clean = (lines: StoredCartLine[]) =>
  lines
    .filter((l) => typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
    .slice(0, 50)
    .map((l) => ({ productId: l.productId.slice(0, 40), quantity: Math.min(l.quantity, 99) }));

/**
 * 회원의 장바구니·견적을 읽는다. DB가 없으면 null(이번에는 동기화하지 않음),
 * 서버 세션이 없으면 "signed-out"(쿠키를 지웠으니 화면을 로그인 전 모습으로 바꾼다).
 * owner는 이 회원의 표식이다. 이 기기의 값이 누구 것인지 기억했다가 저장할 때 함께 보낸다.
 */
export async function loadMemberStateAction(): Promise<
  { owner: string; cart: StoredCartLine[]; build: StoredBuild | null; restocked: number } | "signed-out" | null
> {
  if (!hasDatabase()) return null;
  const userId = await getActionUserId();
  if (userId === null) return "signed-out";
  const db = getDb();
  const [state, requested, sales] = await Promise.all([getMemberState(db, userId), listRestockByUser(db, userId), getSalesInfo()]);
  // 재입고 알림을 신청한 상품 중 다시 들어온(재고가 있고 판매 중인) 것의 수. 머리글에 알린다.
  const inStock = new Set(sales.filter((info) => info.stock > 0).map((info) => info.id));
  return {
    owner: memberTag(userId),
    cart: state?.cart ?? [],
    build: state?.build ?? null,
    restocked: requested.filter((id) => inStock.has(id)).length,
  };
}

/**
 * 저장 결과. "signed-out": 서버 세션이 없어 쿠키를 지웠다. "other-member": 그사이 다른 회원으로 로그인해
 * (다른 탭 등) 저장하지 않았다. "off": DB가 없어 동기화하지 않는다.
 */
export type SaveResult = "saved" | "signed-out" | "other-member" | "off";

/** 저장할 회원을 확인한다. 불러올 때 받은 표식(owner)과 지금 세션의 회원이 다르면 저장하지 않는다. */
async function saveTarget(owner: string): Promise<number | Exclude<SaveResult, "saved">> {
  if (!hasDatabase()) return "off";
  const userId = await getActionUserId();
  if (userId === null) return "signed-out";
  return memberTag(userId) === owner ? userId : "other-member";
}

/** 서버 세션이 아직 있는지 본다. 없으면 쿠키를 지우고 "signed-out", DB가 없으면 null */
export async function checkMemberSessionAction(): Promise<"ok" | "signed-out" | null> {
  if (!hasDatabase()) return null;
  return (await getActionUserId()) === null ? "signed-out" : "ok";
}

export async function saveMemberCartAction(owner: string, lines: StoredCartLine[]): Promise<SaveResult> {
  if (!Array.isArray(lines)) throw new Error("장바구니 형식이 아닙니다.");
  const userId = await saveTarget(owner);
  if (typeof userId !== "number") return userId;
  await saveMemberCart(getDb(), userId, clean(lines));
  return "saved";
}

export async function saveMemberBuildAction(owner: string, build: StoredBuild | null): Promise<SaveResult> {
  const userId = await saveTarget(owner);
  if (typeof userId !== "number") return userId;
  const parts = Object.fromEntries(
    Object.entries(build?.parts ?? {})
      .filter(([, v]) => typeof v === "string")
      .slice(0, 8),
  );
  await saveMemberBuild(getDb(), userId, build ? { parts, services: (build.services ?? []).slice(0, 8) } : null);
  return "saved";
}
