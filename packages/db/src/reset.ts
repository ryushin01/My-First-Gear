import { sql } from "drizzle-orm";
import type { Db } from "./client";
import { seedMerch } from "./merch";
import { consultRequests, loginAttempts, orders, productMerch, questions, reviews, users } from "./schema";
import { SEED_MEMBERS, SEED_QUESTIONS, SEED_REVIEWS } from "./seed";

/**
 * 데모 데이터를 처음 상태로 되돌린다.
 * 주문, 상담, 회원(과 그 후기·문의·찜·견적)을 지우고 판매 정보와 시드 회원·후기·질문을 다시 넣는다.
 */
export async function resetDemoData(db: Db) {
  await db.transaction(async (tx) => {
    await tx.delete(orders);
    await tx.delete(consultRequests);
    await tx.delete(loginAttempts);
    await tx.delete(users); // 후기·질문·문의·찜·견적·세션·장바구니 동기화·재입고 알림은 cascade로 함께 지워진다.
    await tx.delete(productMerch);
    await tx.insert(productMerch).values(seedMerch());
    await tx.insert(users).values(SEED_MEMBERS);
    await tx.execute(sql`select setval(pg_get_serial_sequence('users', 'id'), (select max(id) from users))`);
    await tx.insert(reviews).values(SEED_REVIEWS);
    await tx.insert(questions).values(
      SEED_QUESTIONS.map((q) => ({ ...q, answeredAt: q.answer ? new Date() : null })),
    );
  });
}
