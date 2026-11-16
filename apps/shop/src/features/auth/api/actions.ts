"use server";

import {
  attemptKey,
  authenticate,
  AuthError,
  createUser,
  getDb,
  hasDatabase,
  LOGIN_WINDOW_MINUTES,
  RATE_LIMITS,
  recordAttempt,
  releaseAttempt,
  reserveAttempt,
} from "@mfg/db";
import { endSession, startSession } from "@/entities/member/index.server";
import { ACTION_FAILED_MESSAGE, EMAIL_PATTERN } from "@/shared/lib";
import { clientIp, guardAction } from "@/shared/lib/server";

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

  return guardAction<AuthState>(
    "login",
    async () => {
      const db = getDb();
      // 비밀번호 대입 방지: 같은 이메일+IP로 10분에 5번, 한 IP에서 여러 계정으로 10분에 30번 틀리면 잠시 막는다.
      // 이메일만 보면 남의 이메일로 일부러 틀려 그 사람을 잠글 수 있어 IP를 함께 본다.
      // 비밀번호를 확인하기 전에 실패 자리를 먼저 잡는다(동시에 대입해도 한도를 넘지 못하게). 맞으면 그 자리를 지운다.
      const ip = await clientIp();
      const key = attemptKey("member", `${email}|${ip ?? "local"}`);
      const ipKey = ip ? attemptKey("member-ip", ip) : null;
      const reserved = await reserveAttempt(db, key, RATE_LIMITS.memberLogin);
      const ipReserved = reserved !== null && ipKey ? await reserveAttempt(db, ipKey, RATE_LIMITS.memberLoginIp) : null;
      if (reserved === null || (ipKey && ipReserved === null)) {
        if (reserved !== null) await releaseAttempt(db, reserved);
        return { ok: false, message: `로그인에 여러 번 실패해 ${LOGIN_WINDOW_MINUTES}분 동안 막았습니다. 잠시 뒤 다시 시도해 주세요.`, values };
      }
      const user = await authenticate(db, email, password);
      // 틀리면 잡아 둔 자리가 그대로 실패 기록이 된다.
      if (!user) return { ok: false, message: "이메일 또는 비밀번호가 맞지 않습니다.", values };
      await recordAttempt(db, key, true); // 이 이메일+IP의 실패 기록(잡아 둔 자리 포함)을 지운다
      if (ipReserved !== null) await releaseAttempt(db, ipReserved);
      await startSession(user);
      return { ok: true, message: `${user.name}님, 반갑습니다.`, next: safeNext(formData.get("next")) };
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE, values }),
  );
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

  return guardAction<AuthState>(
    "signup",
    async () => {
      const db = getDb();
      // 가입으로 DB를 채우지 못하게 한 IP에서 1시간에 5번까지 받는다.
      const ip = await clientIp();
      const key = ip ? attemptKey("signup", ip) : null;
      // 자리를 먼저 잡고 센다(동시에 몰려도 한도를 넘지 못하게).
      if (key && (await reserveAttempt(db, key, RATE_LIMITS.signup)) === null) {
        return { ok: false, message: "가입 요청이 많아 잠시 막았습니다. 1시간 뒤 다시 시도해 주세요.", values };
      }
      try {
        const user = await createUser(db, { name, email, password });
        await startSession(user);
        return { ok: true, message: `${user.name}님, 가입을 환영합니다.`, next: safeNext(formData.get("next")) };
      } catch (error) {
        if (error instanceof AuthError) return { ok: false, message: error.message, errors: { email: error.message }, values };
        throw error;
      }
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE, values }),
  );
}

export async function logoutAction() {
  await endSession();
}
