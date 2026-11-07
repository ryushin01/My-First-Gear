import type { Metadata } from "next";
import { DEMO_PASSWORD_HINT, LoginForm } from "@/features/auth";

export const loginMetadata: Metadata = { title: "로그인" };

type LoginPageProps = { searchParams: Promise<{ next?: string }> };

export async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  // 데모 비밀번호를 쓰는 동안에만 화면에 알려 준다.
  const hint = !process.env.MFG_ADMIN_PASSWORD || process.env.MFG_ADMIN_PASSWORD === DEMO_PASSWORD_HINT ? DEMO_PASSWORD_HINT : null;
  return (
    <main id="main" className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1 className="title">My First Gear 어드민</h1>
        <p className="subtitle is-6">포트폴리오 데모입니다. 데이터는 매일 새벽 처음 상태로 돌아갑니다.</p>
        <LoginForm next={next ?? "/"} hint={hint} />
      </div>
    </main>
  );
}
