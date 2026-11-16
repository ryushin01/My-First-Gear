"use server";

import { updateTag } from "next/cache";
import { getProductBySlug } from "@mfg/catalog";
import {
  attemptKey,
  createConsult,
  findOrderForBuyer,
  getDb,
  hasDatabase,
  OrderError,
  placeOrder,
  RATE_LIMITS,
  releaseAttempt,
  reserveAttempt,
} from "@mfg/db";
import { EMAIL_PATTERN, PHONE_PATTERN } from "@/shared/lib";
import { clientIp } from "@/shared/lib/server";
import { MERCH_TAG } from "@/entities/product/@x/order";
import { getSessionUserId } from "@/entities/member/@x/order";
import type { OrderSummary, PlaceOrderRequest, Result } from "../model/types";

const NO_DB = "지금은 주문 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";

/** 모의 결제로 주문을 만든다. 금액과 재고는 서버가 다시 확인한다. */
export async function placeOrderAction(request: PlaceOrderRequest): Promise<Result<OrderSummary>> {
  const { buyer } = request;
  if (!buyer.name.trim() || !buyer.address.trim() || !PHONE_PATTERN.test(buyer.phone.trim())) {
    return { ok: false, message: "받는 분, 휴대폰 번호, 배송 주소를 확인해 주세요." };
  }
  if (buyer.email.trim() && !EMAIL_PATTERN.test(buyer.email.trim())) {
    return { ok: false, message: "이메일 주소 형식을 확인해 주세요." };
  }
  if (!hasDatabase()) return { ok: false, message: NO_DB };

  let order: Awaited<ReturnType<typeof placeOrder>>;
  try {
    order = await placeOrder(getDb(), {
      userId: await getSessionUserId(),
      lines: request.lines.slice(0, 50),
      buyer: {
        name: buyer.name.trim().slice(0, 50),
        phone: buyer.phone.trim(),
        email: buyer.email.trim().slice(0, 120),
        address: buyer.address.trim().slice(0, 200),
        memo: buyer.memo.trim().slice(0, 200),
      },
      payment: ["card", "transfer", "easy"].includes(request.payment) ? request.payment : "card",
      submissionId: /^[A-Za-z0-9-]{8,64}$/.test(request.submissionId ?? "") ? request.submissionId : null,
    });
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, message: error.message };
    console.error("[order] 주문 실패", error);
    // 커밋 응답만 끊겼을 수도 있어(주문은 저장됨) 결과를 모른다고 알린다. 화면은 같은 제출 번호로 다시 보낸다.
    return { ok: false, message: "주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.", uncertain: true };
  }
  updateTag(MERCH_TAG); // 재고가 바뀌었다
  return { ok: true, data: { id: order.id, status: order.status, total: order.total, lines: [] } };
}

/**
 * 비회원 주문 조회. 주문 번호(하루 100만 개)를 차례로 넣어 남의 주문을 찾지 못하게,
 * 같은 IP에서 맞지 않는 조회가 10분에 10번이면 잠시 막는다.
 */
export async function lookupOrderAction(id: string, name: string): Promise<Result<OrderSummary | null>> {
  if (!hasDatabase()) return { ok: false, message: NO_DB };
  const db = getDb();
  const ip = await clientIp();
  const key = ip ? attemptKey("lookup", ip) : null;
  // 실패 자리를 먼저 잡고 센다(동시에 몰려도 한도를 넘지 못하게). 찾으면 그 자리를 지운다.
  const reserved = key ? await reserveAttempt(db, key, RATE_LIMITS.orderLookup) : null;
  if (key && reserved === null) {
    return { ok: false, message: "맞지 않는 조회가 많아 10분 동안 막았습니다. 주문 번호와 받는 분 이름을 확인한 뒤 잠시 뒤 다시 시도해 주세요." };
  }
  const order = await findOrderForBuyer(db, String(id).slice(0, 40), String(name).slice(0, 50));
  if (!order) return { ok: true, data: null }; // 잡아 둔 자리가 그대로 실패 기록이 된다
  if (reserved !== null) await releaseAttempt(db, reserved);
  return {
    ok: true,
    data: {
      id: order.id,
      status: order.status,
      total: order.total,
      lines: order.lines.map((l) => ({ name: l.name, price: l.price, quantity: l.quantity })),
      assembly: order.assembly,
      events: order.events.map((e) => ({ status: e.status, createdAt: e.createdAt.toISOString() })),
    },
  };
}

export async function createConsultAction(input: {
  productSlug: string | null;
  name: string;
  phone: string;
  preferredDate: string;
  message: string;
}): Promise<Result<null>> {
  if (!input.name.trim() || !PHONE_PATTERN.test(input.phone.trim())) {
    return { ok: false, message: "이름과 휴대폰 번호를 확인해 주세요." };
  }
  if (!hasDatabase()) return { ok: false, message: NO_DB };
  const db = getDb();
  // 신청으로 DB를 채우지 못하게 한 IP에서 1시간에 5번까지 받는다.
  const ip = await clientIp();
  const key = ip ? attemptKey("consult", ip) : null;
  // 자리를 먼저 잡고 센다(동시에 몰려도 한도를 넘지 못하게).
  if (key && (await reserveAttempt(db, key, RATE_LIMITS.consult)) === null) {
    return { ok: false, message: "상담 신청이 많아 잠시 막았습니다. 1시간 뒤 다시 신청해 주세요." };
  }
  const product = input.productSlug ? getProductBySlug(input.productSlug) : undefined;
  await createConsult(db, {
    productSlug: product?.slug ?? null,
    name: input.name.trim().slice(0, 50),
    phone: input.phone.trim(),
    preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate) ? input.preferredDate : null,
    message: input.message.trim().slice(0, 500),
  });
  return { ok: true, data: null };
}
