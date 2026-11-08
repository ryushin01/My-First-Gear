"use server";

import { updateTag } from "next/cache";
import { getProductById } from "@mfg/catalog";
import { CommunityError, createQuestion, createReview, getDb, hasDatabase } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";
import { communityTag } from "./communityQueries";

export type CommunityState = { ok: boolean; message: string; field?: string; values?: { body: string; rating?: string } } | null;

async function guard(productId: string): Promise<{ userId: number } | CommunityState> {
  if (!getProductById(productId)) return { ok: false, message: "상품을 찾지 못했습니다." };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다. 잠시 후 다시 시도해 주세요." };
  const userId = await getSessionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 쓸 수 있습니다." };
  return { userId };
}

export async function createReviewAction(_: CommunityState, formData: FormData): Promise<CommunityState> {
  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  const values = { body, rating: rating ? String(rating) : undefined };
  if (!rating) return { ok: false, message: "별점을 골라 주세요.", field: "rating", values };
  if (body.length < 5) return { ok: false, message: "후기는 5자 이상 써 주세요.", field: "body", values };
  const checked = await guard(productId);
  if (!checked || !("userId" in checked)) return checked && { ...checked, values };
  try {
    await createReview(getDb(), { productId, userId: checked.userId, rating, body: body.slice(0, 1000) });
  } catch (error) {
    if (error instanceof CommunityError) return { ok: false, message: error.message, values };
    throw error;
  }
  updateTag(communityTag(productId));
  return { ok: true, message: "후기를 등록했습니다." };
}

export async function createQuestionAction(_: CommunityState, formData: FormData): Promise<CommunityState> {
  const productId = String(formData.get("productId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 5) return { ok: false, message: "질문은 5자 이상 써 주세요.", field: "body", values: { body } };
  const checked = await guard(productId);
  if (!checked || !("userId" in checked)) return checked && { ...checked, values: { body } };
  await createQuestion(getDb(), { productId, userId: checked.userId, body: body.slice(0, 1000) });
  updateTag(communityTag(productId));
  return { ok: true, message: "질문을 등록했습니다. 답변이 달리면 이곳에 보입니다." };
}
