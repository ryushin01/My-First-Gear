import { count, desc, eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Db } from "./client";
import { orders, users } from "./schema";

type User = typeof users.$inferSelect;
export type PublicUser = Pick<User, "id" | "email" | "name">;

export class AuthError extends Error {}

const KEY_LENGTH = 32;

export function hashPassword(password: string, salt = randomBytes(16).toString("base64url")): string {
  return `scrypt$${salt}$${scryptSync(password, salt, KEY_LENGTH).toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const toPublic = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name });

export async function createUser(db: Db, input: { email: string; name: string; password: string }): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const exists = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (exists) throw new AuthError("이미 가입한 이메일입니다.");
  const [user] = await db
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash: hashPassword(input.password) })
    .returning();
  return toPublic(user);
}

export async function authenticate(db: Db, email: string, password: string): Promise<PublicUser | null> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.trim().toLowerCase()) });
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return toPublic(user);
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
