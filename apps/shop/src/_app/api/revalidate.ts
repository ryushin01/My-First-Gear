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
  // 본문에 tags가 있으면 그 태그만, 없으면 판매 정보 캐시를 비운다. 허용한 태그 형식만 받는다.
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const requested = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [MERCH_TAG];
  const tags = requested.filter((tag) => tag === MERCH_TAG || /^community:p-[a-z]+-\d{3}$/.test(tag)).slice(0, 20);
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, tags });
}
