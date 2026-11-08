import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { products } from "@mfg/catalog";
import { getDb, hasDatabase, resetDemoData } from "@mfg/db";
import { MERCH_TAG } from "@/entities/product/index.server";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Vercel Cron이 매일 04:00(KST)에 부른다 (apps/shop/vercel.json).
 * 주문·상담·회원을 지우고 판매 정보와 데모 회원·후기·질문을 시드 값으로 되돌린 뒤 캐시를 비운다.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false }, { status: 401 });
  if (!hasDatabase()) return Response.json({ ok: false, message: "DB 연결 없음" }, { status: 503 });
  await resetDemoData(getDb());
  revalidateTag(MERCH_TAG, { expire: 0 });
  for (const product of products) revalidateTag(`community:${product.id}`, { expire: 0 });
  return Response.json({ ok: true });
}
