import { and, count, desc, eq, gte, inArray, ne, sql, sum } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { getProductById, getService, shippingFee } from "@mfg/catalog";
import type { Db } from "./client";
import { consultRequests, orderEvents, orderLines, orders, productMerch, type OrderStatus } from "./schema";

export type Order = typeof orders.$inferSelect;
export type OrderLine = typeof orderLines.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type OrderWithLines = Order & { lines: OrderLine[]; events: OrderEvent[] };

export type PlaceOrderInput = {
  userId?: number | null;
  lines: { itemId: string; quantity: number }[];
  buyer: { name: string; phone: string; email: string; address: string; memo: string };
  payment: string;
  /**
   * 결제 화면이 만든 제출 번호. 주문은 저장됐는데 응답이 끊겨 다시 결제하면 같은 번호로 오므로,
   * 이미 있으면 새로 만들지 않고(재고도 다시 빼지 않고) 그 주문을 돌려준다.
   */
  submissionId?: string | null;
};

export class OrderError extends Error {}

/** 주문 번호: MFG-YYMMDD-NNNNNN. 날짜는 한국 시간, 뒤 6자리는 암호학적 난수 */
export function newOrderId() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()).slice(2).replaceAll("-", "");
  return `MFG-${date}-${randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
}

/** 주문 번호가 이미 있으면 새 번호로 다시 넣는 횟수. 하루 100만 개 중 하나라 여러 번 겹칠 일은 없다. */
const ORDER_ID_ATTEMPTS = 5;

/**
 * 주문 줄을 상품별로 합친다. 같은 상품이 여러 줄이면 수량을 더하고(재고는 합친 수량으로 확인), 조립 서비스는 한 번만 받는다.
 * 화면은 같은 상품을 한 줄로 담지만 서버 액션은 누구나 직접 부를 수 있어, 줄마다 따로 확인하면 재고보다 많이 팔린다.
 */
function mergeLines(lines: PlaceOrderInput["lines"]) {
  const merged = new Map<string, number>();
  for (const line of lines) {
    if (typeof line?.itemId !== "string" || !Number.isInteger(line.quantity) || line.quantity <= 0) continue;
    const isService = Boolean(getService(line.itemId));
    merged.set(line.itemId, isService ? 1 : (merged.get(line.itemId) ?? 0) + line.quantity);
  }
  return [...merged].map(([itemId, quantity]) => ({ itemId, quantity }));
}

/**
 * 주문을 만든다. 가격은 클라이언트 값을 믿지 않고 DB 판매 정보로 다시 계산하며,
 * 재고를 한 트랜잭션 안에서 줄인다(판매 정보 행을 잠근다). 결제는 모의 결제다.
 * generateId는 테스트에서 주문 번호 충돌을 재현할 때만 넘긴다.
 */
export async function placeOrder(db: Db, input: PlaceOrderInput, generateId: () => string = newOrderId): Promise<Order> {
  const lines = mergeLines(input.lines);
  if (lines.length === 0) throw new OrderError("주문할 상품이 없습니다.");

  const submissionId = input.submissionId || null;
  const findSubmitted = async (tx: Tx) => (submissionId ? tx.query.orders.findFirst({ where: eq(orders.submissionId, submissionId) }) : undefined);

  return db.transaction(async (tx) => {
    const productIds = lines.map((l) => l.itemId).filter((id) => getProductById(id));
    const merchRows = productIds.length ? await tx.select().from(productMerch).where(inArray(productMerch.productId, productIds)).for("update") : [];
    const merch = new Map(merchRows.map((m) => [m.productId, m]));

    // 같은 제출을 이미 받았으면 그 주문을 그대로 돌려준다(판매 정보 행을 잠근 뒤라 동시에 와도 한 번만 만든다).
    const submitted = await findSubmitted(tx);
    if (submitted) return submitted;

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
    const status: OrderStatus = assembly ? "assembling" : "paid";

    // 번호가 겹치면 트랜잭션을 깨지 않고(ON CONFLICT DO NOTHING) 새 번호로 다시 넣는다.
    // 같은 제출 번호가 그사이 들어왔다면(잠글 상품이 없는 주문끼리 동시에 온 경우) 그 주문을 돌려준다.
    let order: Order | undefined;
    for (let attempt = 0; attempt < ORDER_ID_ATTEMPTS && !order; attempt++) {
      [order] = await tx
        .insert(orders)
        .values({
          id: generateId(),
          userId: input.userId ?? null,
          status,
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
          submissionId,
        })
        .onConflictDoNothing()
        .returning();
      if (!order) {
        const raced = await findSubmitted(tx);
        if (raced) return raced;
      }
    }
    if (!order) throw new Error("주문 번호를 만들지 못했습니다.");
    const placed = order;

    await tx.insert(orderLines).values(resolved.map((l) => ({ ...l, orderId: placed.id })));
    await tx.insert(orderEvents).values({ orderId: placed.id, status: placed.status });
    for (const l of resolved) {
      if (merch.has(l.itemId)) {
        await tx
          .update(productMerch)
          .set({ stock: sql`${productMerch.stock} - ${l.quantity}`, updatedAt: new Date() })
          .where(eq(productMerch.productId, l.itemId));
      }
    }
    return placed;
  });
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** 취소한 주문의 상품 재고를 돌려준다(조립 서비스 줄은 판매 정보가 없어 건너뛴다). */
async function restoreStock(tx: Tx, orderId: string) {
  const lines = await tx.select().from(orderLines).where(eq(orderLines.orderId, orderId));
  for (const line of lines) {
    await tx
      .update(productMerch)
      .set({ stock: sql`${productMerch.stock} + ${line.quantity}`, updatedAt: new Date() })
      .where(eq(productMerch.productId, line.itemId));
  }
}

export async function getOrder(db: Db, id: string): Promise<OrderWithLines | undefined> {
  return db.query.orders.findFirst({ where: eq(orders.id, id), with: { lines: true, events: { orderBy: (e, { asc }) => [asc(e.id)] } } });
}

/** 비회원 조회: 주문 번호와 받는 분 이름이 모두 맞아야 한다. */
export async function findOrderForBuyer(db: Db, id: string, name: string): Promise<OrderWithLines | undefined> {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, id.trim().toUpperCase()), eq(orders.buyerName, name.trim())),
    with: { lines: true, events: { orderBy: (e, { asc }) => [asc(e.id)] } },
  });
}

export async function listOrders(db: Db, options: { status?: OrderStatus; limit?: number } = {}): Promise<OrderWithLines[]> {
  return db.query.orders.findMany({
    where: options.status ? eq(orders.status, options.status) : undefined,
    orderBy: [desc(orders.createdAt)],
    limit: options.limit ?? 100,
    with: { lines: true, events: { orderBy: (e, { asc }) => [asc(e.id)] } },
  });
}

export type StatusChange = { ok: true; order: Order } | { ok: false; reason: "not-found" | "cancelled" | "same" };

/**
 * 어드민 상태 변경. 취소된 주문은 다시 바꿀 수 없고(재고가 이미 돌아갔다), 같은 상태로는 이력을 남기지 않는다.
 * 취소로 바꾸면 재고를 돌려준다. 조건을 건 UPDATE로 바꿔, 동시에 두 번 와도 한 번만 바뀌고 재고도 한 번만 돌아간다.
 */
export async function updateOrderStatus(db: Db, id: string, status: OrderStatus): Promise<StatusChange> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(orders)
      .set({ status })
      .where(and(eq(orders.id, id), ne(orders.status, "cancelled"), ne(orders.status, status)))
      .returning();
    if (!row) {
      const current = await tx.query.orders.findFirst({ where: eq(orders.id, id), columns: { status: true } });
      if (!current) return { ok: false, reason: "not-found" };
      return { ok: false, reason: current.status === "cancelled" ? "cancelled" : "same" };
    }
    await tx.insert(orderEvents).values({ orderId: id, status });
    if (status === "cancelled") await restoreStock(tx, id);
    return { ok: true, order: row };
  });
}

/** 회원이 취소할 수 있는 상태: 결제 완료, 상품 준비 중 (조립·배송이 시작되면 취소할 수 없다) */
export const CANCELLABLE: OrderStatus[] = ["paid", "preparing"];

/**
 * 회원이 자기 주문을 취소한다. 재고를 되돌린다.
 * 상태를 읽고 바꾸는 대신 "취소할 수 있는 상태일 때만" 바꾸는 UPDATE 한 번으로, 동시에 두 번 눌러도 재고는 한 번만 돌아간다.
 */
export async function cancelOrderByUser(db: Db, userId: number, id: string): Promise<{ ok: boolean; message: string }> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(orders)
      .set({ status: "cancelled" })
      .where(and(eq(orders.id, id), eq(orders.userId, userId), inArray(orders.status, CANCELLABLE)))
      .returning({ id: orders.id });
    if (!row) {
      const order = await tx.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.userId, userId)), columns: { status: true } });
      if (!order) return { ok: false, message: "주문을 찾지 못했습니다." };
      if (order.status === "cancelled") return { ok: false, message: "이미 취소한 주문입니다." };
      return { ok: false, message: "조립이나 배송이 시작된 주문은 취소할 수 없습니다. 1:1 문의로 남겨 주세요." };
    }
    await tx.insert(orderEvents).values({ orderId: id, status: "cancelled" });
    await restoreStock(tx, id);
    return { ok: true, message: `${id} 주문을 취소했습니다.` };
  });
}

export async function dashboardStats(db: Db) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [[recent], [revenue], [assembling], [newConsults], lowStock] = await Promise.all([
    db.select({ value: count() }).from(orders).where(gte(orders.createdAt, since)),
    db
      .select({ value: sum(orders.total) })
      .from(orders)
      .where(sql`${orders.status} <> 'cancelled'`),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "assembling")),
    db.select({ value: count() }).from(consultRequests).where(eq(consultRequests.status, "new")),
    db
      .select()
      .from(productMerch)
      .where(sql`${productMerch.stock} < 5 and ${productMerch.visible}`),
  ]);
  return {
    ordersLast24h: recent.value,
    revenue: Number(revenue.value ?? 0),
    assembling: assembling.value,
    newConsults: newConsults.value,
    lowStock,
  };
}
