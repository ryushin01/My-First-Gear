import "server-only";
import { headers } from "next/headers";

const LOOPBACK = /^(::1|127(\.\d{1,3}){3}|::ffff:127(\.\d{1,3}){3})$/;

/**
 * 요청한 곳의 IP. Vercel은 x-forwarded-for를 실제 접속 IP로 채운다(사용자가 바꿀 수 없음).
 * 같은 컴퓨터에서 온 요청(로컬 개발·E2E, next start가 ::1로 채움)은 null로 보아 IP 기준 제한을 건너뛴다.
 */
export async function clientIp(): Promise<string | null> {
  const value = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  return value && !LOOPBACK.test(value) ? value : null;
}
