import type { Metadata } from "next";
import { WithCatalog } from "@/entities/product/index.server";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { CompareTable } from "./CompareTable";

export const compareMetadata: Metadata = { title: "상품 비교" };

export function ComparePage() {
  return (
    <CrtScreen source="COMPARE">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Compare" title="상품 비교" />
        <WithCatalog>
          <CompareTable />
        </WithCatalog>
      </div>
    </CrtScreen>
  );
}
