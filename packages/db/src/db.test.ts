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
    expect(await listReviews(db, "p-cpu-001")).toHaveLength(2);
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

import { authenticate, AuthError, createUser, verifyPassword } from "./auth";
import { answerInquiry, CommunityError, createInquiry, createQuestion, createReview, listInquiriesByUser, listQuestions, listReviews, maskName } from "./community";
import { listOrdersByUser, listSavedBuilds, listWishlist, saveBuild, toggleWish } from "./mypage";
import { DEMO_MEMBER } from "./seed";

describe("회원", () => {
  it("데모 회원으로 로그인한다", async () => {
    expect(verifyPassword("demo1234", DEMO_MEMBER.passwordHash)).toBe(true);
    expect((await authenticate(db, "DEMO@myfirstgear.dev", "demo1234"))?.name).toBe("김기어");
    expect(await authenticate(db, DEMO_MEMBER.email, "wrong")).toBeNull();
  });

  it("같은 이메일로 두 번 가입할 수 없다", async () => {
    const user = await createUser(db, { email: "new@example.com", name: "새회원", password: "password1" });
    expect(user.id).toBeGreaterThan(3);
    await expect(createUser(db, { email: "NEW@example.com", name: "또", password: "password1" })).rejects.toThrow(AuthError);
  });
});

describe("후기·Q&A·문의", () => {
  it("후기는 상품마다 한 번만 쓰고 이름은 가린다", async () => {
    await createReview(db, { productId: "p-ssd-001", userId: 1, rating: 5, body: "빠릅니다" });
    await expect(createReview(db, { productId: "p-ssd-001", userId: 1, rating: 4, body: "다시" })).rejects.toThrow(CommunityError);
    const list = await listReviews(db, "p-ssd-001");
    expect(list[0].author).toBe("김**");
    expect(maskName("A")).toBe("*");
  });

  it("질문과 1:1 문의에 답변한다", async () => {
    await createQuestion(db, { productId: "p-ssd-001", userId: 1, body: "방열판 있나요?" });
    expect((await listQuestions(db, "p-case-001"))[0].answer).toContain("330mm");
    const inquiry = await createInquiry(db, { userId: 1, category: "delivery", title: "배송 문의", body: "언제 오나요?" });
    await answerInquiry(db, inquiry.id, "내일 도착합니다.");
    expect((await listInquiriesByUser(db, 1))[0].answer).toBe("내일 도착합니다.");
  });
});

describe("마이페이지", () => {
  it("회원 주문, 찜, 저장한 견적", async () => {
    await placeOrder(db, { userId: 1, lines: [{ itemId: "p-mem-001", quantity: 1 }], buyer, payment: "card" });
    expect(await listOrdersByUser(db, 1)).toHaveLength(1);
    expect(await toggleWish(db, 1, "p-watch-001")).toBe(true);
    expect(await listWishlist(db, 1)).toEqual(["p-watch-001"]);
    expect(await toggleWish(db, 1, "p-watch-001")).toBe(false);
    await saveBuild(db, { userId: 1, name: "게임용", encoded: "cpu:p-cpu-001|svc-assembly", total: 719_000 });
    expect((await listSavedBuilds(db, 1))[0].name).toBe("게임용");
  });
});
