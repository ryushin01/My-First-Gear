import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "./client";
import { inquiries, questions, reviews, users, type InquiryCategory } from "./schema";

export class CommunityError extends Error {}

/** 화면에 보일 이름: 첫 글자만 남기고 가린다. (예: 김**) */
export function maskName(name: string): string {
  const chars = [...name.trim()];
  return chars.length <= 1 ? "*" : chars[0] + "*".repeat(Math.min(chars.length - 1, 3));
}

// 후기

export async function listReviews(db: Db, productId: string) {
  const rows = await db
    .select({ id: reviews.id, rating: reviews.rating, body: reviews.body, createdAt: reviews.createdAt, userName: users.name, userId: reviews.userId })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(50);
  return rows.map(({ userName, ...row }) => ({ ...row, author: maskName(userName) }));
}

/** 상품별 DB 후기 수와 별점 합 (카탈로그의 누적 후기와 합쳐 보여 준다) */
export async function reviewStats(db: Db): Promise<Record<string, { count: number; sum: number }>> {
  const rows = await db
    .select({ productId: reviews.productId, count: sql<number>`count(*)::int`, sum: sql<number>`sum(${reviews.rating})::int` })
    .from(reviews)
    .groupBy(reviews.productId);
  return Object.fromEntries(rows.map((r) => [r.productId, { count: r.count, sum: r.sum }]));
}

export async function createReview(db: Db, input: { productId: string; userId: number; rating: number; body: string }) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new CommunityError("별점은 1에서 5 사이로 골라 주세요.");
  const exists = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, input.productId), eq(reviews.userId, input.userId)),
  });
  if (exists) throw new CommunityError("이 상품에는 이미 후기를 남겼습니다.");
  const [row] = await db.insert(reviews).values(input).returning();
  return row;
}

// 상품 Q&A

export async function listQuestions(db: Db, productId: string) {
  const rows = await db
    .select({
      id: questions.id,
      body: questions.body,
      answer: questions.answer,
      answeredAt: questions.answeredAt,
      createdAt: questions.createdAt,
      userName: users.name,
    })
    .from(questions)
    .innerJoin(users, eq(users.id, questions.userId))
    .where(eq(questions.productId, productId))
    .orderBy(desc(questions.createdAt))
    .limit(50);
  return rows.map(({ userName, ...row }) => ({ ...row, author: maskName(userName) }));
}

export async function createQuestion(db: Db, input: { productId: string; userId: number; body: string }) {
  const [row] = await db.insert(questions).values(input).returning();
  return row;
}

/** 어드민용: 답변을 기다리는 질문을 먼저 */
export async function listQuestionsForAdmin(db: Db) {
  return db
    .select({
      id: questions.id,
      productId: questions.productId,
      body: questions.body,
      answer: questions.answer,
      createdAt: questions.createdAt,
      userName: users.name,
    })
    .from(questions)
    .innerJoin(users, eq(users.id, questions.userId))
    .orderBy(sql`${questions.answer} is not null`, desc(questions.createdAt))
    .limit(200);
}

export async function answerQuestion(db: Db, id: number, answer: string) {
  const [row] = await db.update(questions).set({ answer, answeredAt: new Date() }).where(eq(questions.id, id)).returning();
  return row;
}

// 1:1 문의

export async function createInquiry(db: Db, input: { userId: number; category: InquiryCategory; title: string; body: string }) {
  const [row] = await db.insert(inquiries).values(input).returning();
  return row;
}

export async function listInquiriesByUser(db: Db, userId: number) {
  return db.select().from(inquiries).where(eq(inquiries.userId, userId)).orderBy(desc(inquiries.createdAt));
}

export async function listInquiriesForAdmin(db: Db) {
  return db
    .select({
      id: inquiries.id,
      category: inquiries.category,
      title: inquiries.title,
      body: inquiries.body,
      answer: inquiries.answer,
      createdAt: inquiries.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(inquiries)
    .innerJoin(users, eq(users.id, inquiries.userId))
    .orderBy(sql`${inquiries.answer} is not null`, asc(inquiries.createdAt))
    .limit(200);
}

export async function answerInquiry(db: Db, id: number, answer: string) {
  const [row] = await db.update(inquiries).set({ answer, answeredAt: new Date() }).where(eq(inquiries.id, id)).returning();
  return row;
}

export async function countUnanswered(db: Db) {
  const [[q], [i]] = await Promise.all([
    db.select({ value: sql<number>`count(*)::int` }).from(questions).where(isNull(questions.answer)),
    db.select({ value: sql<number>`count(*)::int` }).from(inquiries).where(isNull(inquiries.answer)),
  ]);
  return { questions: q.value, inquiries: i.value };
}
