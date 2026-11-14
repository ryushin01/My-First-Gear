import { and, desc, eq } from "drizzle-orm";
import type { Db } from "./client";
import { orders, savedBuilds, wishlists } from "./schema";

export async function listOrdersByUser(db: Db, userId: number) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: { lines: true, events: { orderBy: (e, { asc }) => [asc(e.id)] } },
    limit: 50,
  });
}

// 찜

export async function listWishlist(db: Db, userId: number): Promise<string[]> {
  const rows = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .orderBy(desc(wishlists.createdAt));
  return rows.map((r) => r.productId);
}

export async function isWished(db: Db, userId: number, productId: string): Promise<boolean> {
  const row = await db.query.wishlists.findFirst({ where: and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)) });
  return Boolean(row);
}

/** 찜을 켜거나 끈다. 바뀐 뒤 상태를 돌려준다. */
export async function toggleWish(db: Db, userId: number, productId: string): Promise<boolean> {
  const deleted = await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
    .returning();
  if (deleted.length > 0) return false;
  await db.insert(wishlists).values({ userId, productId });
  return true;
}

// 저장한 견적

export async function saveBuild(db: Db, input: { userId: number; name: string; encoded: string; total: number }) {
  const [row] = await db.insert(savedBuilds).values(input).returning();
  return row;
}

export async function listSavedBuilds(db: Db, userId: number) {
  return db.select().from(savedBuilds).where(eq(savedBuilds.userId, userId)).orderBy(desc(savedBuilds.createdAt)).limit(50);
}

export async function deleteSavedBuild(db: Db, userId: number, id: number) {
  const rows = await db
    .delete(savedBuilds)
    .where(and(eq(savedBuilds.id, id), eq(savedBuilds.userId, userId)))
    .returning();
  return rows.length > 0;
}
