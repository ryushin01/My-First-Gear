import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { getDb, getUser, hasDatabase, type PublicUser } from "@mfg/db";
import { MEMBER_COOKIE } from "../model/cookie";

export const SESSION_COOKIE = "mfg_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string {
  const value = process.env.MFG_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production" && process.env.NETLIFY) throw new Error("MFG_SESSION_SECRET이 필요합니다.");
  return "dev-only-session-secret";
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function verify(value: string | undefined): number | null {
  if (!value) return null;
  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature || Number(expires) < Date.now()) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  const userId = Number(id);
  return Number.isInteger(userId) ? userId : null;
}

/** 서명된 세션 쿠키에서 회원 id를 읽는다. 쿠키를 읽으므로 이 함수를 부르는 곳은 동적으로 렌더링된다. */
export async function getSessionUserId(): Promise<number | null> {
  await connection(); // 요청 시점에만 실행한다 (정적 셸 생성 때 실행하지 않음)
  return verify((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const id = await getSessionUserId();
  if (id === null || !hasDatabase()) return null;
  return getUser(getDb(), id);
}

export async function startSession(user: PublicUser) {
  const jar = await cookies();
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `${user.id}.${expires}`;
  const secure = (await headers()).get("x-forwarded-proto") === "https" || Boolean(process.env.URL?.startsWith("https"));
  jar.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: MAX_AGE });
  // 화면 표시용 이름. 인증에는 쓰지 않는다.
  jar.set(MEMBER_COOKIE, encodeURIComponent(user.name), { httpOnly: false, sameSite: "lax", secure, path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(MEMBER_COOKIE);
}
