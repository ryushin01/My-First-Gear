import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";

export const checkoutMetadata: Metadata = { title: "주문하기", robots: { index: false } };

export function CheckoutPage() {
  return (
    <CrtScreen source="CHECKOUT">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Checkout" title="주문하기">
          <span className="text-brand">*</span> 표시는 꼭 입력해야 하는 항목입니다.
        </PageHeading>
        <CheckoutForm />
      </div>
    </CrtScreen>
  );
}
