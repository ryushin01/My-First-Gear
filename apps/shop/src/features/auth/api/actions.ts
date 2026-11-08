"use server";

import { attemptKey, authenticate, AuthError, createUser, getDb, hasDatabase, isLockedOut, LOGIN_WINDOW_MINUTES, recordAttempt } from "@mfg/db";
import { endSession, startSession } from "@/entities/member/index.server";
import { EMAIL_PATTERN } from "@/shared/lib";

/** values: 실패했을 때 입력값을 되돌려 준다. (React 폼 액션은 제출 뒤 폼을 비우므로 다시 채운다) */
export type AuthState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  next?: string;
  values?: Record<string, string>;
} | null;

const NO_DB = "지금은 회원 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "/my");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/my";
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (!email.trim()) errors.email = "이메일을 입력해 주세요.";
  if (!password) errors.password = "비밀번호를 입력해 주세요.";
  const values = { email };
  if (Object.keys(errors).length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors, values };
  if (!hasDatabase()) return { ok: false, message: NO_DB, values };

  // 같은 이메일로 10분 안에 5번 틀리면 잠시 막는다 (비밀번호 대입 방지).
  const db = getDb();
  const key = attemptKey("member", email);
  if (await isLockedOut(db, key)) {
    return { ok: false, message: `로그인에 여러 번 실패해 ${LOGIN_WINDOW_MINUTES}분 동안 막았습니다. 잠시 뒤 다시 시도해 주세요.`, values };
  }
  const user = await authenticate(db, email, password);
  await recordAttempt(db, key, Boolean(user));
  if (!user) return { ok: false, message: "이메일 또는 비밀번호가 맞지 않습니다.", values };
  await startSession(user);
  return { ok: true, message: `${user.name}님, 반갑습니다.`, next: safeNext(formData.get("next")) };
}

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (!name) errors.name = "이름을 입력해 주세요.";
  else if ([...name].length > 20) errors.name = "이름은 20자 이하로 입력해 주세요.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "이메일 주소 형식이 아닙니다. 예: gear@example.com";
  if (password.length < 8) errors.password = "비밀번호는 8자 이상으로 입력해 주세요.";
  if (formData.get("agree") !== "on") errors.agree = "개인정보 수집에 동의해야 가입할 수 있습니다.";
  const values = { name, email, agree: formData.get("agree") === "on" ? "on" : "" };
  if (Object.keys(errors).length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors, values };
  if (!hasDatabase()) return { ok: false, message: NO_DB, values };

  try {
    const user = await createUser(getDb(), { name, email, password });
    await startSession(user);
    return { ok: true, message: `${user.name}님, 가입을 환영합니다.`, next: safeNext(formData.get("next")) };
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, message: error.message, errors: { email: error.message }, values };
    throw error;
  }
}

export async function logoutAction() {
  await endSession();
}
