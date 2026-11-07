import type { Config } from "@netlify/functions";
import { getDb, resetDemoData } from "@mfg/db";

/** 매일 새벽 데모 데이터(주문, 상담 신청, 가격·재고)를 처음 상태로 되돌린다. */
const resetDemo = async () => {
  await resetDemoData(getDb());
  const site = process.env.URL;
  const secret = process.env.MFG_REVALIDATE_SECRET;
  if (site && secret) {
    await fetch(`${site}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret } });
  }
  console.log("[reset-demo] 데모 데이터를 초기화했습니다.");
};

export default resetDemo;

// 매일 04:00 KST (19:00 UTC)
export const config: Config = { schedule: "0 19 * * *" };
