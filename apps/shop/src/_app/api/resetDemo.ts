import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { products } from "@mfg/catalog";
import { getDb, hasDatabase, purgeStaleRecords, resetDemoData } from "@mfg/db";
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
 * 1. 만료된 세션과 하루 지난 시도 기록을 지운다(항상).
 * 2. 데모 초기화: 주문·상담·회원을 지우고 판매 정보와 데모 회원·후기·질문을 시드 값으로 되돌린 뒤 캐시를 비운다.
 *    실제 서비스로 운영할 때는 MFG_DEMO_RESET=off로 끄고 정리만 한다.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false }, { status: 401 });
  if (!hasDatabase()) return Response.json({ ok: false, message: "DB 연결 없음" }, { status: 503 });
  const db = getDb();
  const purged = await purgeStaleRecords(db);
  const reset = process.env.MFG_DEMO_RESET !== "off";
  if (reset) {
    await resetDemoData(db);
    revalidateTag(MERCH_TAG, { expire: 0 });
    for (const product of products) revalidateTag(`community:${product.id}`, { expire: 0 });
  }
  console.log(
    `[cron] 만료 세션 ${purged.sessions}개·오래된 시도 기록 ${purged.attempts}개를 지웠습니다.${reset ? " 데모 데이터를 처음 상태로 돌렸습니다." : ""}`,
  );
  return Response.json({ ok: true, purged, reset });
}
