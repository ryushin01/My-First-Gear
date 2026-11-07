import { desc, eq } from "drizzle-orm";
import type { Db } from "./client";
import { consultRequests, type ConsultStatus } from "./schema";

export type ConsultRequest = typeof consultRequests.$inferSelect;

export async function createConsult(
  db: Db,
  input: { productSlug: string | null; name: string; phone: string; preferredDate: string | null; message: string },
): Promise<ConsultRequest> {
  const [row] = await db.insert(consultRequests).values(input).returning();
  return row;
}

export async function listConsults(db: Db): Promise<ConsultRequest[]> {
  return db.select().from(consultRequests).orderBy(desc(consultRequests.createdAt)).limit(200);
}

export async function updateConsultStatus(db: Db, id: number, status: ConsultStatus) {
  const [row] = await db.update(consultRequests).set({ status }).where(eq(consultRequests.id, id)).returning();
  return row;
}
