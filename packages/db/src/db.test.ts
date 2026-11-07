import { NetlifyDB } from "@netlify/database-dev";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "./client";
import { applyMerch, listMerch, updateMerch } from "./merch";
import { dashboardStats, findOrderForBuyer, listOrders, OrderError, placeOrder, updateOrderStatus } from "./orders";
import { createConsult, listConsults } from "./consults";
import { resetDemoData } from "./reset";

const MIGRATIONS = new URL("../../../apps/shop/netlify/database/migrations", import.meta.url).pathname;

let server: NetlifyDB;
let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  server = new NetlifyDB();
  const url = await server.start();
  await server.applyMigrations(MIGRATIONS);
  ({ db, close } = createDb(url));
}, 60_000);

afterAll(async () => {
  await close?.();
  await server?.stop();
});

beforeEach(async () => {
  await resetDemoData(db);
});

const buyer = { name: "김기어", phone: "010-1234-5678", email: "", address: "서울시 가상구 데모로 1", memo: "" };

describe("판매 정보", () => {
  it("시드 마이그레이션으로 모든 상품이 들어 있다", async () => {
    expect(await listMerch(db)).toHaveLength(40);
  });

  it("가격을 바꾸고 숨기면 카탈로그에 반영된다", async () => {
    await updateMerch(db, "p-ssd-001", { price: 199_000 });
    await updateMerch(db, "p-kb-001", { visible: false });
    const products = applyMerch(await listMerch(db));
    expect(products.find((p) => p.id === "p-ssd-001")?.price).toBe(199_000);
    expect(products.some((p) => p.id === "p-kb-001")).toBe(false);
  });
});

describe("주문", () => {
  it("DB 가격으로 다시 계산하고 재고를 줄인다", async () => {
    await updateMerch(db, "p-ssd-001", { price: 100_000 });
    const order = await placeOrder(db, {
      lines: [
        { itemId: "p-ssd-001", quantity: 2 },
        { itemId: "svc-assembly", quantity: 5 },
      ],
      buyer,
      payment: "card",
    });
    expect(order.subtotal).toBe(200_000 + 30_000);
    expect(order.shipping).toBe(0);
    expect(order.status).toBe("assembling");
    const merch = await listMerch(db);
    expect(merch.find((m) => m.productId === "p-ssd-001")?.stock).toBe(76 - 2);

    const found = await findOrderForBuyer(db, order.id.toLowerCase(), " 김기어 ");
    expect(found?.lines).toHaveLength(2);
    expect(await findOrderForBuyer(db, order.id, "다른사람")).toBeUndefined();
  });

  it("재고보다 많이 주문하거나 품절·상담 상품은 거절한다", async () => {
    await expect(placeOrder(db, { lines: [{ itemId: "p-case-001", quantity: 99 }], buyer, payment: "card" })).rejects.toThrow(OrderError);
    await expect(placeOrder(db, { lines: [{ itemId: "p-con-001", quantity: 1 }], buyer, payment: "card" })).rejects.toThrow(/재고/);
    await expect(placeOrder(db, { lines: [{ itemId: "p-car-002", quantity: 1 }], buyer, payment: "card" })).rejects.toThrow(/상담/);
    expect(await listOrders(db)).toHaveLength(0);
  });

  it("상태를 바꾸고 대시보드에 집계된다", async () => {
    const order = await placeOrder(db, { lines: [{ itemId: "p-mem-001", quantity: 1 }], buyer, payment: "card" });
    await updateOrderStatus(db, order.id, "shipped");
    await createConsult(db, { productSlug: "genesis-g80", name: "김기어", phone: "010-1111-2222", preferredDate: null, message: "" });
    const stats = await dashboardStats(db);
    expect(stats.ordersLast24h).toBe(1);
    expect(stats.revenue).toBe(order.total);
    expect(stats.newConsults).toBe(1);
    expect((await listConsults(db))[0].productSlug).toBe("genesis-g80");
  });
});
