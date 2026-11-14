import Link from "next/link";
import type { Metadata } from "next";
import { WithCatalog } from "@/entities/product/index.server";
import { Suspense } from "react";
import { BuildPlanner } from "./BuildPlanner";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";

export const buildMetadata: Metadata = { title: "PC 견적", description: "부품을 고르면 호환성을 바로 확인하는 PC 견적" };

export function BuildPage() {
  return (
    <CrtScreen source="PC BUILD">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="PC Build" title="PC 견적">
          칸마다 부품을 고르면 소켓, 메모리 규격, 메인보드 크기, 그래픽카드 길이, 쿨러 높이, 파워 용량을 확인합니다. 견적은 이 브라우저에
          저장되고(회원은 계정에도), 주소로 공유할 수 있습니다. 처음이라면{" "}
          <Link href="/build/quick" className="underline">
            예산별 빠른 견적
          </Link>
          으로 시작해 보세요.
        </PageHeading>
        <Suspense fallback={<p className="text-mute-200">견적을 불러오는 중…</p>}>
          <WithCatalog>
            <BuildPlanner />
          </WithCatalog>
        </Suspense>
      </div>
    </CrtScreen>
  );
}
