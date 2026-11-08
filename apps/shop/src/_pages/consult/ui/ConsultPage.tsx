import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultForm } from "./ConsultForm";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { ConsultTarget } from "./ConsultTarget";

export const consultMetadata: Metadata = { title: "구매 상담 신청" };

export function ConsultPage() {
  return (
    <CrtScreen source="CONSULT">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Consult" title="구매 상담 신청">
          자동차와 모터사이클은 상담 후 전시장에서 계약합니다. <span className="text-brand">*</span> 표시는 필수 항목입니다.
        </PageHeading>
        <Suspense fallback={<ConsultForm />}>
          <ConsultTarget />
        </Suspense>
      </div>
    </CrtScreen>
  );
}
