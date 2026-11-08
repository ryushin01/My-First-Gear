"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/shared/lib";
import type { ActionState } from "@/shared/ui";
import { attemptKey, getDb, hasDatabase, isLockedOut, LOGIN_WINDOW_MINUTES, recordAttempt } from "@mfg/db";
import { DEMO_PASSWORD_HINT } from "../model/demo";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  // 공개 포트폴리오 데모라 따로 정하지 않으면 데모 비밀번호를 쓴다. (데이터는 매일 초기화)
  const expected = process.env.MFG_ADMIN_PASSWORD || DEMO_PASSWORD_HINT;
  const password = String(formData.get("password") ?? "");
  // 같은 IP에서 10분 안에 5번 틀리면 잠시 막는다 (비밀번호 대입 방지).
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = attemptKey("admin", ip);
  const db = hasDatabase() ? getDb() : null;
  if (db && (await isLockedOut(db, key))) {
    return { ok: false, message: `로그인에 여러 번 실패해 ${LOGIN_WINDOW_MINUTES}분 동안 막았습니다. 잠시 뒤 다시 시도해 주세요.` };
  }
  if (db) await recordAttempt(db, key, password === expected);
  if (password !== expected) {
    return { ok: false, message: "비밀번호가 맞지 않습니다. 다시 입력해 주세요." };
  }
  const jar = await cookies();
  // https로 들어온 요청에서만 Secure를 붙인다. (로컬 http 프로덕션 빌드에서도 로그인되게)
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  jar.set(SESSION_COOKIE, await createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
