import { count, desc, eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { Db } from "./client";
import { orders, users } from "./schema";

type User = typeof users.$inferSelect;
export type PublicUser = Pick<User, "id" | "email" | "name">;

export class AuthError extends Error {}

const KEY_LENGTH = 32;

/**
 * scrypt를 비동기로 돌린다. 동기 버전(scryptSync)은 해시하는 동안 이벤트 루프를 막아,
 * 한 인스턴스가 여러 요청을 함께 처리할 때 다른 요청까지 멈춘다.
 */
function scryptAsync(password: string, salt: string, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, length, (error, key) => (error ? reject(error) : resolve(key))));
}

export async function hashPassword(password: string, salt = randomBytes(16).toString("base64url")): Promise<string> {
  return `scrypt$${salt}$${(await scryptAsync(password, salt, KEY_LENGTH)).toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scryptAsync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** 없는 이메일에도 같은 비용을 들이려고 검사하는 가짜 해시. 어떤 비밀번호와도 맞지 않는다. */
const ABSENT_USER_HASH = `scrypt$absent-user-salt$${"A".repeat(43)}`;

const toPublic = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name });

export async function createUser(db: Db, input: { email: string; name: string; password: string }): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const exists = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (exists) throw new AuthError("이미 가입한 이메일입니다.");
  const [user] = await db
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash: await hashPassword(input.password) })
    .returning();
  return toPublic(user);
}

export async function authenticate(db: Db, email: string, password: string): Promise<PublicUser | null> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.trim().toLowerCase()) });
  // 없는 이메일도 해시를 한 번 검사해, 응답 시간으로 가입 여부가 드러나지 않게 한다.
  const ok = await verifyPassword(password, user?.passwordHash ?? ABSENT_USER_HASH);
  return user && ok ? toPublic(user) : null;
}

export async function getUser(db: Db, id: number): Promise<PublicUser | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  return user ? toPublic(user) : null;
}

export async function listMembers(db: Db) {
  return db
    .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt, orderCount: count(orders.id) })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}
