"use server";

import { getDb, getMemberState, hasDatabase, saveMemberBuild, saveMemberCart, type StoredBuild, type StoredCartLine } from "@mfg/db";
import { getActionUserId } from "@/entities/member/index.server";

const clean = (lines: StoredCartLine[]) =>
  lines
    .filter((l) => typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
    .slice(0, 50)
    .map((l) => ({ productId: l.productId.slice(0, 40), quantity: Math.min(l.quantity, 99) }));

/**
 * 회원의 장바구니·견적을 읽는다. DB가 없으면 null(이번에는 동기화하지 않음),
 * 서버 세션이 없으면 "signed-out"(쿠키를 지웠으니 화면을 로그인 전 모습으로 바꾼다).
 */
export async function loadMemberStateAction(): Promise<{ cart: StoredCartLine[]; build: StoredBuild | null } | "signed-out" | null> {
  if (!hasDatabase()) return null;
  const userId = await getActionUserId();
  if (userId === null) return "signed-out";
  const state = await getMemberState(getDb(), userId);
  return { cart: state?.cart ?? [], build: state?.build ?? null };
}

/** 저장 결과. "signed-out": 서버 세션이 없어 쿠키를 지웠다. "off": DB가 없어 동기화하지 않는다. */
export type SaveResult = "saved" | "signed-out" | "off";

/** 서버 세션이 아직 있는지 본다. 없으면 쿠키를 지우고 "signed-out", DB가 없으면 null */
export async function checkMemberSessionAction(): Promise<"ok" | "signed-out" | null> {
  if (!hasDatabase()) return null;
  return (await getActionUserId()) === null ? "signed-out" : "ok";
}

export async function saveMemberCartAction(lines: StoredCartLine[]): Promise<SaveResult> {
  if (!hasDatabase()) return "off";
  if (!Array.isArray(lines)) throw new Error("장바구니 형식이 아닙니다.");
  const userId = await getActionUserId();
  if (userId === null) return "signed-out";
  await saveMemberCart(getDb(), userId, clean(lines));
  return "saved";
}

export async function saveMemberBuildAction(build: StoredBuild | null): Promise<SaveResult> {
  if (!hasDatabase()) return "off";
  const userId = await getActionUserId();
  if (userId === null) return "signed-out";
  const parts = Object.fromEntries(
    Object.entries(build?.parts ?? {})
      .filter(([, v]) => typeof v === "string")
      .slice(0, 8),
  );
  await saveMemberBuild(getDb(), userId, build ? { parts, services: (build.services ?? []).slice(0, 8) } : null);
  return "saved";
}
