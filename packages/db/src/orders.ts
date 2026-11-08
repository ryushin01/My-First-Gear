import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { getProductById, getService, shippingFee } from "@mfg/catalog";
import type { Db } from "./client";
import { consultRequests, orderLines, orders, productMerch, type OrderStatus } from "./schema";

export type Order = typeof orders.$inferSelect;
export type OrderLine = typeof orderLines.$inferSelect;
export type OrderWithLines = Order & { lines: OrderLine[] };

export type PlaceOrderInput = {
  userId?: number | null;
  lines: { itemId: string; quantity: number }[];
  buyer: { name: string; phone: string; email: string; address: string; memo: string };
  payment: string;
};

export class OrderError extends Error {}

function newOrderId() {
  // 주문 번호의 날짜는 한국 시간 기준 (YYMMDD)
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()).slice(2).replaceAll("-", "");
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `MFG-${date}-${random}`;
}

/**
 * 주문을 만든다. 가격은 클라이언트 값을 믿지 않고 DB 판매 정보로 다시 계산하며,
 * 재고를 한 트랜잭션 안에서 줄인다. 결제는 모의 결제다.
 */
export async function placeOrder(db: Db, input: PlaceOrderInput): Promise<Order> {
  const lines = input.lines.filter((line) => Number.isInteger(line.quantity) && line.quantity > 0);
  if (lines.length === 0) throw new OrderError("주문할 상품이 없습니다.");

  return db.transaction(async (tx) => {
    const productIds = lines.map((l) => l.itemId).filter((id) => getProductById(id));
    const merchRows = productIds.length
      ? await tx.select().from(productMerch).where(inArray(productMerch.productId, productIds)).for("update")
      : [];
    const merch = new Map(merchRows.map((m) => [m.productId, m]));

    const resolved = lines.map((line) => {
      const product = getProductById(line.itemId);
      if (product) {
        const m = merch.get(product.id);
        if (!m || !m.visible) throw new OrderError(`${product.name}은(는) 지금 판매하지 않습니다.`);
        if (product.purchaseMode === "consult") throw new OrderError(`${product.name}은(는) 상담 후 구매하는 상품입니다.`);
        if (m.stock < line.quantity) throw new OrderError(`${product.name}의 재고가 부족합니다. (남은 수량 ${m.stock}개)`);
        return { itemId: product.id, name: product.name, price: m.price, quantity: line.quantity };
      }
      const service = getService(line.itemId);
      if (service) return { itemId: service.id, name: `조립 서비스 · ${service.name}`, price: service.price, quantity: 1 };
      throw new OrderError("알 수 없는 상품이 있습니다.");
    });

    const subtotal = resolved.reduce((acc, l) => acc + l.price * l.quantity, 0);
    const shipping = shippingFee(subtotal);
    const assembly = resolved.some((l) => l.itemId === "svc-assembly");

    const [order] = await tx
      .insert(orders)
      .values({
        id: newOrderId(),
        userId: input.userId ?? null,
        status: assembly ? "assembling" : "paid",
        buyerName: input.buyer.name,
        buyerPhone: input.buyer.phone,
        buyerEmail: input.buyer.email,
        address: input.buyer.address,
        memo: input.buyer.memo,
        payment: input.payment,
        subtotal,
        shipping,
        total: subtotal + shipping,
        assembly,
      })
      .returning();

    await tx.insert(orderLines).values(resolved.map((l) => ({ ...l, orderId: order.id })));
    for (const l of resolved) {
      if (merch.has(l.itemId)) {
        await tx
          .update(productMerch)
          .set({ stock: sql`${productMerch.stock} - ${l.quantity}`, updatedAt: new Date() })
          .where(eq(productMerch.productId, l.itemId));
      }
    }
    return order;
  });
}

export async function getOrder(db: Db, id: string): Promise<OrderWithLines | undefined> {
  return db.query.orders.findFirst({ where: eq(orders.id, id), with: { lines: true } });
}

/** 비회원 조회: 주문 번호와 받는 분 이름이 모두 맞아야 한다. */
export async function findOrderForBuyer(db: Db, id: string, name: string): Promise<OrderWithLines | undefined> {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, id.trim().toUpperCase()), eq(orders.buyerName, name.trim())),
    with: { lines: true },
  });
}

export async function listOrders(db: Db, options: { status?: OrderStatus; limit?: number } = {}): Promise<OrderWithLines[]> {
  return db.query.orders.findMany({
    where: options.status ? eq(orders.status, options.status) : undefined,
    orderBy: [desc(orders.createdAt)],
    limit: options.limit ?? 100,
    with: { lines: true },
  });
}

export async function updateOrderStatus(db: Db, id: string, status: OrderStatus) {
  const [row] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  return row;
}

export async function dashboardStats(db: Db) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [[recent], [revenue], [assembling], [newConsults], lowStock] = await Promise.all([
    db.select({ value: count() }).from(orders).where(gte(orders.createdAt, since)),
    db.select({ value: sum(orders.total) }).from(orders).where(sql`${orders.status} <> 'cancelled'`),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "assembling")),
    db.select({ value: count() }).from(consultRequests).where(eq(consultRequests.status, "new")),
    db.select().from(productMerch).where(sql`${productMerch.stock} < 5 and ${productMerch.visible}`),
  ]);
  return {
    ordersLast24h: recent.value,
    revenue: Number(revenue.value ?? 0),
    assembling: assembling.value,
    newConsults: newConsults.value,
    lowStock,
  };
}
