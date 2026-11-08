import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { AuthFormWithNext } from "./LoginPage";

export const loginMetadata: Metadata = { title: "로그인", robots: { index: false } };
export const signupMetadata: Metadata = { title: "회원 가입", robots: { index: false } };

export function LoginPage() {
  return (
    <CrtScreen source="LOGIN">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Login" title="로그인">
          로그인하면 후기와 질문을 남기고, 주문 내역·저장한 견적·찜을 마이페이지에서 볼 수 있습니다. 비회원 주문도 그대로 됩니다.
        </PageHeading>
        <Suspense fallback={null}>
          <AuthFormWithNext mode="login" />
        </Suspense>
      </div>
    </CrtScreen>
  );
}

export function SignupPage() {
  return (
    <CrtScreen source="SIGN UP">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Sign up" title="회원 가입">
          <span className="text-brand">*</span> 표시는 꼭 입력해야 하는 항목입니다.
        </PageHeading>
        <Suspense fallback={null}>
          <AuthFormWithNext mode="signup" />
        </Suspense>
      </div>
    </CrtScreen>
  );
}
