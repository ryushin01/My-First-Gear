import type { Metadata } from "next";
import { OrderLookup } from "./OrderLookup";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";

export const ordersMetadata: Metadata = { title: "주문 조회" };

export function OrdersPage() {
  return (
    <CrtScreen source="ORDER LOOKUP">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Order lookup" title="주문 조회">
          회원 가입 없이 주문 번호와 받는 분 이름으로 조회합니다.
        </PageHeading>
        <OrderLookup />
      </div>
    </CrtScreen>
  );
}
