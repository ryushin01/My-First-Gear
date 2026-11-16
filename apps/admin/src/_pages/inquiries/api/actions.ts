"use server";

import { revalidatePath } from "next/cache";
import { answerInquiry, answerQuestion, getDb } from "@mfg/db";
import { revalidateShop } from "@/shared/api";
import { ACTION_FAILED_MESSAGE } from "@/shared/lib";
import { guardAction, isAdmin, NOT_ADMIN_MESSAGE } from "@/shared/lib/server";
import type { ActionState } from "@/shared/ui";

function readAnswer(formData: FormData) {
  return { id: Number(formData.get("id")), answer: String(formData.get("answer") ?? "").trim() };
}

export async function answerInquiryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN_MESSAGE };
  const { id, answer } = readAnswer(formData);
  if (!Number.isInteger(id)) return { ok: false, message: "잘못된 요청입니다." };
  if (answer.length < 2) return { ok: false, message: "답변을 입력해 주세요.", values: { answer } };
  return guardAction<ActionState>(
    "answer-inquiry",
    async () => {
      const row = await answerInquiry(getDb(), id, answer.slice(0, 2000));
      if (!row) return { ok: false, message: "문의를 찾지 못했습니다." };
      revalidatePath("/inquiries");
      revalidatePath("/");
      return { ok: true, message: "답변을 등록했습니다." };
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE, values: { answer } }),
  );
}

export async function answerQuestionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: NOT_ADMIN_MESSAGE };
  const { id, answer } = readAnswer(formData);
  if (!Number.isInteger(id)) return { ok: false, message: "잘못된 요청입니다." };
  if (answer.length < 2) return { ok: false, message: "답변을 입력해 주세요.", values: { answer } };
  return guardAction<ActionState>(
    "answer-question",
    async () => {
      const row = await answerQuestion(getDb(), id, answer.slice(0, 2000));
      if (!row) return { ok: false, message: "질문을 찾지 못했습니다." };
      revalidatePath("/inquiries");
      revalidatePath("/");
      await revalidateShop([`community:${row.productId}`]);
      return { ok: true, message: "답변을 등록했습니다. 쇼핑몰 상품 페이지에 반영됩니다." };
    },
    () => ({ ok: false, message: ACTION_FAILED_MESSAGE, values: { answer } }),
  );
}
