import type { Db } from "./client";
import { seedMerch } from "./merch";
import { consultRequests, orders, productMerch } from "./schema";

/** 데모 데이터를 처음 상태로 되돌린다. 주문과 상담 신청을 지우고 판매 정보를 시드 값으로 바꾼다. */
export async function resetDemoData(db: Db) {
  await db.transaction(async (tx) => {
    await tx.delete(orders);
    await tx.delete(consultRequests);
    await tx.delete(productMerch);
    await tx.insert(productMerch).values(seedMerch());
  });
}
