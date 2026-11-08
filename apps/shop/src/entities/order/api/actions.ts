"use server";

import { updateTag } from "next/cache";
import { getProductBySlug } from "@mfg/catalog";
import { createConsult, findOrderForBuyer, getDb, hasDatabase, OrderError, placeOrder } from "@mfg/db";
import { EMAIL_PATTERN, PHONE_PATTERN } from "@/shared/lib";
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

  try {
    const order = await placeOrder(getDb(), {
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
    });
    updateTag(MERCH_TAG); // 재고가 바뀌었다
    return { ok: true, data: { id: order.id, status: order.status, total: order.total, lines: [] } };
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, message: error.message };
    console.error("[order] 주문 실패", error);
    return { ok: false, message: "주문을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

/** 비회원 주문 조회 */
export async function lookupOrderAction(id: string, name: string): Promise<Result<OrderSummary | null>> {
  if (!hasDatabase()) return { ok: false, message: NO_DB };
  const order = await findOrderForBuyer(getDb(), id.slice(0, 40), name.slice(0, 50));
  if (!order) return { ok: true, data: null };
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
  const product = input.productSlug ? getProductBySlug(input.productSlug) : undefined;
  await createConsult(getDb(), {
    productSlug: product?.slug ?? null,
    name: input.name.trim().slice(0, 50),
    phone: input.phone.trim(),
    preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate) ? input.preferredDate : null,
    message: input.message.trim().slice(0, 500),
  });
  return { ok: true, data: null };
}
