import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionValue } from "../session";

export const NOT_ADMIN_MESSAGE = "로그인 시간이 끝났습니다. 새로 고친 뒤 다시 로그인해 주세요.";

/**
 * 변경 액션의 첫 줄에서 어드민 세션을 확인한다. 로그인 검사를 프록시에만 맡기지 않는다(심층 방어).
 * 서버 액션은 어느 주소로든 직접 보낼 수 있는 공개 요청이기 때문이다.
 */
export async function isAdmin(): Promise<boolean> {
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value);
}

/** 비밀번호를 일정한 시간에 비교한다(길이가 달라도 해시로 맞춰 비교). */
export function samePassword(given: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}
