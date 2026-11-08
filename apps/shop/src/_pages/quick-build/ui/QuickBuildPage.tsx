import type { Metadata } from "next";
import { WithCatalog } from "@/entities/product/index.server";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { QuickBuild } from "./QuickBuild";

export const quickBuildMetadata: Metadata = { title: "예산별 빠른 견적" };

export function QuickBuildPage() {
  return (
    <CrtScreen source="QUICK BUILD">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Quick build" title="예산별 빠른 견적">
          예산과 용도만 고르면 호환되는 PC 구성을 골라 드립니다. 마음에 들면 그대로 PC 견적으로 가져가 부품을 바꿀 수 있습니다.
        </PageHeading>
        <WithCatalog>
          <QuickBuild />
        </WithCatalog>
      </div>
    </CrtScreen>
  );
}
