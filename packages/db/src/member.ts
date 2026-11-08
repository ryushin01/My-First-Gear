import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import type { Db } from "./client";
import { loginAttempts, memberStates, restockRequests, sessions, type StoredBuild, type StoredCartLine } from "./schema";

// 세션

export async function createSession(db: Db, userId: number, ttlSeconds: number): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

/** 살아 있는 세션이면 회원 id, 아니면 null */
export async function getSessionUser(db: Db, id: string): Promise<number | null> {
  const row = await db.query.sessions.findFirst({ where: and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())) });
  return row?.userId ?? null;
}

export async function deleteSession(db: Db, id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function purgeExpiredSessions(db: Db) {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// 로그인 시도 제한

export const LOGIN_WINDOW_MINUTES = 10;
export const LOGIN_MAX_FAILURES = 5;

/** 개인정보(이메일·IP)를 그대로 남기지 않도록 해시한 키 */
export function attemptKey(kind: "member" | "admin", value: string) {
  return createHash("sha256").update(`${kind}:${value.trim().toLowerCase()}`).digest("base64url");
}

/** 최근 10분 안에 실패가 5번 이상이면 true */
export async function isLockedOut(db: Db, key: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.key, key), eq(loginAttempts.ok, false), gt(loginAttempts.createdAt, since)));
  return row.value >= LOGIN_MAX_FAILURES;
}

/** 시도를 기록한다. 성공하면 그 키의 실패 기록을 지운다. */
export async function recordAttempt(db: Db, key: string, ok: boolean) {
  if (ok) await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
  else await db.insert(loginAttempts).values({ key, ok });
}

// 장바구니·견적 동기화

export async function getMemberState(db: Db, userId: number) {
  return (await db.query.memberStates.findFirst({ where: eq(memberStates.userId, userId) })) ?? null;
}

export async function saveMemberCart(db: Db, userId: number, cart: StoredCartLine[]) {
  await db
    .insert(memberStates)
    .values({ userId, cart })
    .onConflictDoUpdate({ target: memberStates.userId, set: { cart, updatedAt: new Date() } });
}

export async function saveMemberBuild(db: Db, userId: number, build: StoredBuild | null) {
  await db
    .insert(memberStates)
    .values({ userId, build })
    .onConflictDoUpdate({ target: memberStates.userId, set: { build, updatedAt: new Date() } });
}

// 재입고 알림

export async function requestRestock(db: Db, userId: number, productId: string) {
  await db.insert(restockRequests).values({ userId, productId }).onConflictDoNothing();
}

export async function cancelRestock(db: Db, userId: number, productId: string) {
  await db.delete(restockRequests).where(and(eq(restockRequests.userId, userId), eq(restockRequests.productId, productId)));
}

export async function hasRestockRequest(db: Db, userId: number, productId: string) {
  return Boolean(
    await db.query.restockRequests.findFirst({
      where: and(eq(restockRequests.userId, userId), eq(restockRequests.productId, productId)),
    }),
  );
}

export async function listRestockByUser(db: Db, userId: number): Promise<string[]> {
  const rows = await db.select({ productId: restockRequests.productId }).from(restockRequests).where(eq(restockRequests.userId, userId));
  return rows.map((r) => r.productId);
}

/** 어드민용: 상품별 재입고 알림 신청 수 */
export async function restockCounts(db: Db): Promise<Record<string, number>> {
  const rows = await db
    .select({ productId: restockRequests.productId, value: sql<number>`count(*)::int` })
    .from(restockRequests)
    .groupBy(restockRequests.productId);
  return Object.fromEntries(rows.map((r) => [r.productId, r.value]));
}
