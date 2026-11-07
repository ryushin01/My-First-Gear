import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { MERCH_TAG } from "@/entities/product/index.server";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * 어드민과 데모 초기화 함수가 판매 정보를 바꾼 뒤 호출한다.
 * 헤더 x-revalidate-secret이 MFG_REVALIDATE_SECRET과 같아야 한다.
 */
export async function POST(request: Request) {
  const secret = process.env.MFG_REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !safeEqual(given, secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(MERCH_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
