"use server";

import { revalidatePath } from "next/cache";
import { createInquiry, getDb, hasDatabase, inquiryCategories, type InquiryCategory } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";

export type InquiryState = { ok: boolean; message: string; errors?: Record<string, string>; values?: Record<string, string> } | null;

export async function createInquiryAction(_: InquiryState, formData: FormData): Promise<InquiryState> {
  const category = String(formData.get("category") ?? "") as InquiryCategory;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const errors: Record<string, string> = {};
  if (!inquiryCategories.includes(category)) errors.category = "문의 유형을 골라 주세요.";
  if (!title) errors.title = "제목을 입력해 주세요.";
  if (body.length < 5) errors.body = "문의 내용은 5자 이상 써 주세요.";
  const values = { category, title, body };
  if (Object.keys(errors).length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors, values };
  const userId = await getSessionUserId();
  if (userId === null) return { ok: false, message: "로그인한 회원만 문의할 수 있습니다.", values };
  if (!hasDatabase()) return { ok: false, message: "지금은 저장할 수 없습니다.", values };
  await createInquiry(getDb(), { userId, category, title: title.slice(0, 80), body: body.slice(0, 2000) });
  revalidatePath("/my");
  return { ok: true, message: "문의를 접수했습니다. 답변이 달리면 아래 목록에 보입니다." };
}
