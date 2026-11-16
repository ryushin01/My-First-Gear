// @ts-expect-error 로컬 DB 스크립트는 JS 모듈이다
import { startLocalDb } from "../scripts/local-db.mjs";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "./client";
import { applyMerch, listMerch, updateMerch } from "./merch";
import { dashboardStats, findOrderForBuyer, listOrders, OrderError, placeOrder, updateOrderStatus } from "./orders";
import { createConsult, listConsults } from "./consults";
import { resetDemoData } from "./reset";

let server: { url: string; stop: () => Promise<void> };
let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  server = await startLocalDb();
  ({ db, close } = createDb(server.url));
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
    expect(await listMerch(db)).toHaveLength(91);
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
import {
  answerInquiry,
  CommunityError,
  createInquiry,
  createQuestion,
  createReview,
  listInquiriesByUser,
  listQuestions,
  listReviews,
  maskName,
} from "./community";
import { listOrdersByUser, listSavedBuilds, listWishlist, saveBuild, toggleWish } from "./mypage";
import { DEMO_MEMBER } from "./seed";

describe("회원", () => {
  it("데모 회원으로 로그인한다", async () => {
    expect(await verifyPassword("demo1234", DEMO_MEMBER.passwordHash)).toBe(true);
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
    expect((await listQuestions(db, "p-case-001"))[0].answer).toContain("450mm");
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

import { reviewStats } from "./community";
import { cancelOrderByUser, getOrder } from "./orders";
import {
  attemptKey,
  createSession,
  deleteSession,
  getMemberState,
  getSessionUser,
  isLockedOut,
  listRestockByUser,
  RATE_LIMITS,
  purgeStaleRecords,
  recordAttempt,
  releaseAttempt,
  reserveAttempt,
  requestRestock,
  restockCounts,
  saveMemberBuild,
  saveMemberCart,
} from "./member";

describe("세션과 로그인 시도 제한", () => {
  it("세션을 지우면 바로 무효가 된다", async () => {
    const session = await createSession(db, 1, 3600);
    expect(await getSessionUser(db, session.id)).toBe(1);
    await deleteSession(db, session.id);
    expect(await getSessionUser(db, session.id)).toBeNull();
  });

  it("10분 안에 다섯 번 틀리면 잠기고, 성공하면 풀린다", async () => {
    const key = attemptKey("member", "demo@myfirstgear.dev");
    for (let i = 0; i < 4; i++) await recordAttempt(db, key, false);
    expect(await isLockedOut(db, key)).toBe(false);
    await recordAttempt(db, key, false);
    expect(await isLockedOut(db, key)).toBe(true);
    await recordAttempt(db, key, true);
    expect(await isLockedOut(db, key)).toBe(false);
  });
});

describe("장바구니·견적 동기화, 재입고 알림, 후기 집계", () => {
  it("회원 상태를 저장하고 읽는다", async () => {
    await saveMemberCart(db, 1, [{ productId: "p-ssd-001", quantity: 2 }]);
    await saveMemberBuild(db, 1, { parts: { cpu: "p-cpu-001" }, services: ["svc-assembly"] });
    const state = await getMemberState(db, 1);
    expect(state?.cart).toEqual([{ productId: "p-ssd-001", quantity: 2 }]);
    expect(state?.build?.parts.cpu).toBe("p-cpu-001");
  });

  it("재입고 알림을 신청하고 상품별로 센다", async () => {
    await requestRestock(db, 1, "p-con-001");
    await requestRestock(db, 1, "p-con-001");
    await requestRestock(db, 2, "p-con-001");
    expect(await listRestockByUser(db, 1)).toEqual(["p-con-001"]);
    expect((await restockCounts(db))["p-con-001"]).toBe(2);
  });

  it("DB 후기를 상품별로 집계한다 (시드 후기)", async () => {
    expect((await reviewStats(db))["p-cpu-001"]).toEqual({ count: 2, sum: 9 });
  });
});

describe("주문 취소와 상태 이력", () => {
  it("결제 완료 주문은 회원이 취소하고 재고가 돌아온다", async () => {
    const order = await placeOrder(db, { userId: 1, lines: [{ itemId: "p-ssd-001", quantity: 3 }], buyer, payment: "card" });
    expect((await cancelOrderByUser(db, 2, order.id)).ok).toBe(false); // 다른 회원은 못 함
    expect((await cancelOrderByUser(db, 1, order.id)).ok).toBe(true);
    const saved = await getOrder(db, order.id);
    expect(saved?.status).toBe("cancelled");
    expect(saved?.events.map((e) => e.status)).toEqual(["paid", "cancelled"]);
    expect((await listMerch(db)).find((m) => m.productId === "p-ssd-001")?.stock).toBe(76);
  });

  it("조립이 시작된 주문은 취소할 수 없다", async () => {
    const order = await placeOrder(db, {
      userId: 1,
      lines: [
        { itemId: "p-mem-001", quantity: 1 },
        { itemId: "svc-assembly", quantity: 1 },
      ],
      buyer,
      payment: "card",
    });
    expect(order.status).toBe("assembling");
    expect((await cancelOrderByUser(db, 1, order.id)).ok).toBe(false);
  });
});

describe("주문·재고 정합성", () => {
  const stockOf = async (id: string) => (await listMerch(db)).find((m) => m.productId === id)!.stock;

  it("같은 상품을 여러 줄로 보내도 합친 수량으로 재고를 확인하고 한 줄로 저장한다", async () => {
    await updateMerch(db, "p-case-001", { stock: 4 });
    const twice = [
      { itemId: "p-case-001", quantity: 3 },
      { itemId: "p-case-001", quantity: 3 },
    ];
    await expect(placeOrder(db, { lines: twice, buyer, payment: "card" })).rejects.toThrow(/재고가 부족합니다/);
    expect(await stockOf("p-case-001")).toBe(4);

    const order = await placeOrder(db, {
      lines: [
        { itemId: "p-case-001", quantity: 1 },
        { itemId: "p-case-001", quantity: 2 },
      ],
      buyer,
      payment: "card",
    });
    expect((await getOrder(db, order.id))?.lines).toEqual([expect.objectContaining({ itemId: "p-case-001", quantity: 3 })]);
    expect(await stockOf("p-case-001")).toBe(1);
  });

  it("조립 서비스는 여러 번 보내도 한 번만 청구한다", async () => {
    const order = await placeOrder(db, {
      lines: [
        { itemId: "p-mem-001", quantity: 1 },
        { itemId: "svc-assembly", quantity: 1 },
        { itemId: "svc-assembly", quantity: 3 },
      ],
      buyer,
      payment: "card",
    });
    const memory = (await listMerch(db)).find((m) => m.productId === "p-mem-001")!;
    expect(order.subtotal).toBe(memory.price + 30_000);
  });

  it("주문 번호가 겹치면 새 번호로 다시 넣는다", async () => {
    const first = await placeOrder(db, { lines: [{ itemId: "p-mem-001", quantity: 1 }], buyer, payment: "card" });
    const ids = [first.id, "MFG-000000-000001"];
    const second = await placeOrder(db, { lines: [{ itemId: "p-mem-001", quantity: 1 }], buyer, payment: "card" }, () => ids.shift()!);
    expect(second.id).toBe("MFG-000000-000001");
  });

  it("회원이 두 번 취소해도 재고는 한 번만 돌아온다", async () => {
    const before = await stockOf("p-ssd-001");
    const order = await placeOrder(db, { userId: 1, lines: [{ itemId: "p-ssd-001", quantity: 2 }], buyer, payment: "card" });
    expect((await cancelOrderByUser(db, 1, order.id)).ok).toBe(true);
    expect(await cancelOrderByUser(db, 1, order.id)).toEqual({ ok: false, message: "이미 취소한 주문입니다." });
    expect(await stockOf("p-ssd-001")).toBe(before);
  });

  it("어드민이 취소하면 재고가 돌아오고, 취소한 주문과 같은 상태로는 바꾸지 않는다", async () => {
    const before = await stockOf("p-mem-001");
    const order = await placeOrder(db, { lines: [{ itemId: "p-mem-001", quantity: 2 }], buyer, payment: "card" });
    expect(await updateOrderStatus(db, order.id, "paid")).toEqual({ ok: false, reason: "same" });
    expect((await updateOrderStatus(db, order.id, "cancelled")).ok).toBe(true);
    expect(await stockOf("p-mem-001")).toBe(before);
    expect(await updateOrderStatus(db, order.id, "paid")).toEqual({ ok: false, reason: "cancelled" });
    expect(await stockOf("p-mem-001")).toBe(before);
    expect((await getOrder(db, order.id))?.events.map((e) => e.status)).toEqual(["paid", "cancelled"]);
    expect(await updateOrderStatus(db, "MFG-000000-999999", "shipped")).toEqual({ ok: false, reason: "not-found" });
  });
});

describe("같은 결제를 다시 보내면", () => {
  it("응답이 끊겨 같은 제출 번호로 다시 오면 주문을 다시 만들지 않고 재고도 한 번만 뺀다", async () => {
    const stock = async () => (await listMerch(db)).find((m) => m.productId === "p-ssd-001")!.stock;
    const before = await stock();
    const input = { lines: [{ itemId: "p-ssd-001", quantity: 2 }], buyer, payment: "card", submissionId: "retry-test-0001" };
    const first = await placeOrder(db, input);
    const again = await placeOrder(db, input);
    expect(again.id).toBe(first.id);
    expect(await stock()).toBe(before - 2);
    const other = await placeOrder(db, { ...input, submissionId: "retry-test-0002" });
    expect(other.id).not.toBe(first.id);
    expect(await stock()).toBe(before - 4);
  });
});

describe("시도 제한 규칙", () => {
  it("상담·가입처럼 성공한 횟수를 세는 키는 성공해도 기록을 남겨 한도에 닿는다", async () => {
    const key = attemptKey("consult", "203.0.113.7");
    for (let i = 0; i < 4; i++) await recordAttempt(db, key, true, false);
    expect(await isLockedOut(db, key, RATE_LIMITS.consult)).toBe(false);
    await recordAttempt(db, key, true, false);
    expect(await isLockedOut(db, key, RATE_LIMITS.consult)).toBe(true);
  });

  it("없는 이메일도 해시를 검사하고 로그인은 실패한다", async () => {
    expect(await authenticate(db, "nobody@example.com", "demo1234")).toBeNull();
  });
});

describe("시도 자리 잡기(동시 요청에도 한도 지키기)", () => {
  it("성공 횟수를 세는 규칙은 한도까지 자리를 잡고, 넘치면 자기 기록을 지운다", async () => {
    const key = attemptKey("signup", "198.51.100.7");
    const limit = { windowMinutes: 60, max: 3, failuresOnly: false };
    const ids = [];
    for (let i = 0; i < 3; i++) ids.push(await reserveAttempt(db, key, limit));
    expect(ids.every((id) => typeof id === "number")).toBe(true);
    expect(await reserveAttempt(db, key, limit)).toBeNull();
    expect(await isLockedOut(db, key, limit)).toBe(true); // 넘친 요청의 기록은 남지 않는다(3개)
  });

  it("동시에 몰려도 한도보다 많이 통과하지 못한다", async () => {
    const key = attemptKey("consult", "198.51.100.8");
    const limit = { windowMinutes: 60, max: 5, failuresOnly: false };
    const results = await Promise.all(Array.from({ length: 12 }, () => reserveAttempt(db, key, limit)));
    expect(results.filter((id) => id !== null).length).toBeLessThanOrEqual(5);
  });

  it("실패만 세는 규칙은 성공하면 잡아 둔 자리를 돌려준다", async () => {
    const key = attemptKey("lookup", "198.51.100.9");
    const limit = { windowMinutes: 10, max: 2, failuresOnly: true };
    const first = await reserveAttempt(db, key, limit);
    await releaseAttempt(db, first!); // 찾았다(실패 아님)
    expect(await reserveAttempt(db, key, limit)).not.toBeNull(); // 실패 1
    expect(await reserveAttempt(db, key, limit)).not.toBeNull(); // 실패 2
    expect(await reserveAttempt(db, key, limit)).toBeNull(); // 막힘
  });
});

describe("기록 정리", () => {
  it("만료된 세션과 하루 지난 시도 기록만 지운다", async () => {
    const live = await createSession(db, 1, 3600);
    const expired = await createSession(db, 1, -60);
    const key = attemptKey("lookup", "198.51.100.1");
    await recordAttempt(db, key, false);
    await db.execute(sql`insert into login_attempts (key, ok, created_at) values (${key}, false, now() - interval '2 days')`);
    expect(await purgeStaleRecords(db)).toEqual({ sessions: 1, attempts: 1 });
    expect(await getSessionUser(db, live.id)).toBe(1);
    expect(await getSessionUser(db, expired.id)).toBeNull();
    // 지운 것은 이틀 전 기록이고, 방금 남긴 기록은 남는다
    const left = await db.execute(sql`select created_at > now() - interval '1 hour' as recent from login_attempts where key = ${key}`);
    expect(left.rows).toEqual([{ recent: true }]);
  });
});
