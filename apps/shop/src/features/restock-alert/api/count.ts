import "server-only";
import { listRestockByUser, type Db } from "@mfg/db";
import { getSalesInfo } from "@/entities/product/index.server";

/** 재입고 알림을 신청한 상품 중 다시 들어온(재고가 있고 판매 중인) 것의 수. 머리글에 알린다. */
export async function countRestocked(db: Db, userId: number): Promise<number> {
  const [requested, sales] = await Promise.all([listRestockByUser(db, userId), getSalesInfo()]);
  const inStock = new Set(sales.filter((info) => info.stock > 0).map((info) => info.id));
  return requested.filter((id) => inStock.has(id)).length;
}
