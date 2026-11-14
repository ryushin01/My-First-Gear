import type { Metadata } from "next";
import { Suspense } from "react";
import { WithCatalog } from "@/entities/product/index.server";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { SetupPlanner } from "./SetupPlanner";

export const setupMetadata: Metadata = {
  title: "데스크 셋업",
  description: "책상, 의자, 모니터, 모니터암, 조명을 골라 크기와 무게가 맞는지 확인하는 데스크 셋업 조합",
};

export function SetupPage() {
  return (
    <CrtScreen source="DESK SETUP">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Desk Setup" title="데스크 셋업">
          책상부터 마이크까지 칸마다 장비를 고르면 모니터암이 모니터 크기와 무게를 버티는지, 책상에 모니터와 스피커가 들어가는지 확인합니다. 조합은 이
          브라우저에 저장되고 주소로 공유할 수 있습니다.
        </PageHeading>
        <Suspense fallback={<p className="text-mute-200">셋업을 불러오는 중…</p>}>
          <WithCatalog>
            <SetupPlanner />
          </WithCatalog>
        </Suspense>
      </div>
    </CrtScreen>
  );
}
