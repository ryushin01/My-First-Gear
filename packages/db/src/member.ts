import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import type { Db } from "./client";
import type { PublicUser } from "./auth";
import { loginAttempts, memberStates, restockRequests, sessions, users, type StoredBuild, type StoredCartLine } from "./schema";

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

/** 살아 있는 세션의 회원(id, 이메일, 이름)을 한 번의 질의로 읽는다. 없으면 null */
export async function getSessionMember(db: Db, id: string): Promise<PublicUser | null> {
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

export async function deleteSession(db: Db, id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
}

/**
 * 쌓이기만 하는 기록을 지운다: 만료된 세션, 하루 지난 시도 기록(제한 창은 길어야 1시간).
 * 매일 크론이 부른다. 데모 초기화를 끈 실제 운영에서도 DB가 계속 커지지 않게 한다.
 */
export async function purgeStaleRecords(db: Db): Promise<{ sessions: number; attempts: number }> {
  const expired = await db.delete(sessions).where(lt(sessions.expiresAt, new Date())).returning({ id: sessions.id });
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const old = await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, dayAgo)).returning({ id: loginAttempts.id });
  return { sessions: expired.length, attempts: old.length };
}

// 시도 제한 (로그인, 비회원 주문 조회, 상담 신청, 가입)

export const LOGIN_WINDOW_MINUTES = 10;
export const LOGIN_MAX_FAILURES = 5;

/** windowMinutes 안에 max번에 닿으면 막는다. failuresOnly면 실패한 시도만 센다. */
export type RateLimit = { windowMinutes: number; max: number; failuresOnly: boolean };

export const RATE_LIMITS = {
  /** 회원 로그인: 같은 이메일+IP로 10분에 5번 틀리면. IP를 함께 봐서 남의 계정을 다른 곳에서 잠그지 못한다 */
  memberLogin: { windowMinutes: LOGIN_WINDOW_MINUTES, max: LOGIN_MAX_FAILURES, failuresOnly: true },
  /** 회원 로그인: 한 IP에서 여러 계정을 대입하면 10분에 30번 */
  memberLoginIp: { windowMinutes: LOGIN_WINDOW_MINUTES, max: 30, failuresOnly: true },
  /** 어드민 로그인: IP별 10분에 5번 */
  adminLogin: { windowMinutes: LOGIN_WINDOW_MINUTES, max: LOGIN_MAX_FAILURES, failuresOnly: true },
  /** 비회원 주문 조회: IP별로 맞지 않는 조회 10분에 10번 (주문 번호를 돌려 남의 주문을 찾지 못하게) */
  orderLookup: { windowMinutes: 10, max: 10, failuresOnly: true },
  /** 구매 상담 신청: IP별 1시간에 5번 */
  consult: { windowMinutes: 60, max: 5, failuresOnly: false },
  /** 회원 가입: IP별 1시간에 5번 */
  signup: { windowMinutes: 60, max: 5, failuresOnly: false },
} satisfies Record<string, RateLimit>;

export type AttemptKind = "member" | "member-ip" | "admin" | "lookup" | "consult" | "signup";

/** 개인정보(이메일·IP)를 그대로 남기지 않도록 해시한 키 */
export function attemptKey(kind: AttemptKind, value: string) {
  return createHash("sha256").update(`${kind}:${value.trim().toLowerCase()}`).digest("base64url");
}

/** 최근 기록이 한도에 닿았으면 true (기본: 회원 로그인 규칙) */
export async function isLockedOut(db: Db, key: string, limit: RateLimit = RATE_LIMITS.memberLogin): Promise<boolean> {
  const since = new Date(Date.now() - limit.windowMinutes * 60 * 1000);
  const where = [eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)];
  if (limit.failuresOnly) where.push(eq(loginAttempts.ok, false));
  const [row] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(and(...where));
  return row.value >= limit.max;
}

/**
 * 시도를 기록한다. 로그인처럼 성공하면 실패 기록을 지우는 키는 clearOnSuccess(기본)로,
 * 상담 신청·가입처럼 성공한 횟수를 세는 키는 clearOnSuccess=false로 남긴다.
 */
export async function recordAttempt(db: Db, key: string, ok: boolean, clearOnSuccess = true) {
  if (ok && clearOnSuccess) await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
  else await db.insert(loginAttempts).values({ key, ok });
}

/**
 * 한도 안이면 이번 시도를 먼저 기록해 자리를 잡고 그 기록 id를, 한도를 넘으면 null을 돌려준다.
 * "세고 나서 기록"하면 동시에 온 요청이 모두 같은 수를 읽고 통과한다. 먼저 기록하고 자기 기록까지 세면
 * 기록이 r번째로 들어간 요청은 r개 이상을 보므로, 동시에 몰려도 한도보다 많이 통과하지 못한다(넘친 요청은 자기 기록을 지움).
 * failuresOnly 규칙(로그인·주문 조회)은 실패로 기록해 두었다가 성공하면 releaseAttempt로 지운다.
 */
export async function reserveAttempt(db: Db, key: string, limit: RateLimit): Promise<number | null> {
  const [reserved] = await db.insert(loginAttempts).values({ key, ok: !limit.failuresOnly }).returning({ id: loginAttempts.id });
  const since = new Date(Date.now() - limit.windowMinutes * 60 * 1000);
  const where = [eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)];
  if (limit.failuresOnly) where.push(eq(loginAttempts.ok, false));
  const [row] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(and(...where));
  if (row.value <= limit.max) return reserved.id;
  await releaseAttempt(db, reserved.id);
  return null;
}

/** 잡아 둔 시도 기록을 지운다(실패로 세지 않을 결과일 때, 한도를 넘어 되돌릴 때). */
export async function releaseAttempt(db: Db, id: number) {
  await db.delete(loginAttempts).where(eq(loginAttempts.id, id));
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
