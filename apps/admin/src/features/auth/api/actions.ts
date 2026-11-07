"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/shared/lib";
import type { ActionState } from "@/shared/ui";
import { DEMO_PASSWORD_HINT } from "../model/demo";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  // 공개 포트폴리오 데모라 따로 정하지 않으면 데모 비밀번호를 쓴다. (데이터는 매일 초기화)
  const expected = process.env.MFG_ADMIN_PASSWORD || DEMO_PASSWORD_HINT;
  const password = String(formData.get("password") ?? "");
  if (password !== expected) {
    return { ok: false, message: "비밀번호가 맞지 않습니다. 다시 입력해 주세요." };
  }
  const jar = await cookies();
  // https로 들어온 요청에서만 Secure를 붙인다. (로컬 http 프로덕션 빌드에서도 로그인되게)
  const secure = (await headers()).get("x-forwarded-proto") === "https" || Boolean(process.env.URL?.startsWith("https"));
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
