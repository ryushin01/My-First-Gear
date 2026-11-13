import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { createSession, deleteSession, getDb, getSessionUser as findSessionUser, getUser, hasDatabase, type PublicUser } from "@mfg/db";
import { MEMBER_COOKIE } from "../model/cookie";

const SESSION_COOKIE = "mfg_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string {
  const value = process.env.MFG_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) throw new Error("MFG_SESSION_SECRET이 필요합니다.");
  return "dev-only-session-secret";
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** 쿠키 값 "세션id.서명"에서 서명이 맞는 세션 id만 꺼낸다. */
function verify(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = Buffer.from(sign(id));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return id;
}

/**
 * 세션 쿠키로 회원 id를 찾는다. 세션은 DB에 있어 로그아웃하면 바로 무효가 된다.
 * 쿠키를 읽으므로 이 함수를 부르는 곳은 동적으로 렌더링된다.
 */
export async function getSessionUserId(): Promise<number | null> {
  await connection(); // 요청 시점에만 실행한다 (정적 셸 생성 때 실행하지 않음)
  const id = verify((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id || !hasDatabase()) return null;
  return findSessionUser(getDb(), id);
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const id = await getSessionUserId();
  if (id === null || !hasDatabase()) return null;
  return getUser(getDb(), id);
}

export async function startSession(user: PublicUser) {
  const jar = await cookies();
  const session = await createSession(getDb(), user.id, MAX_AGE);
  const secure = (await headers()).get("x-forwarded-proto") === "https";
  jar.set(SESSION_COOKIE, `${session.id}.${sign(session.id)}`, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: MAX_AGE });
  // 화면 표시용 이름. 인증에는 쓰지 않는다.
  jar.set(MEMBER_COOKIE, encodeURIComponent(user.name), { httpOnly: false, sameSite: "lax", secure, path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  const jar = await cookies();
  const id = verify(jar.get(SESSION_COOKIE)?.value);
  if (id && hasDatabase()) await deleteSession(getDb(), id);
  jar.delete(SESSION_COOKIE);
  jar.delete(MEMBER_COOKIE);
}
