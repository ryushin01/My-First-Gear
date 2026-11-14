import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "./src/shared/lib/session";

/** 로그인하지 않았으면 로그인 화면으로 보낸다. */
export async function proxy(request: NextRequest) {
  const ok = await verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

/**
 * 로그인 화면, Next 내부 파일, 정적 파일(탭 아이콘, public/brand의 로고)은 검사하지 않는다.
 * 로고는 next/image 최적화가 쿠키 없이 가져가므로, 여기서 막으면 로그인해도 로고가 깨진다.
 */
export const config = {
  matcher: ["/((?!login|_next/|favicon\\.ico|icon\\.png|apple-icon\\.png|brand/).*)"],
};
