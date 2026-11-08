import type { Metadata } from "next";
import { Suspense } from "react";
import { WithCatalog } from "@/entities/product/index.server";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { SearchResults } from "./SearchResults";

export const searchMetadata: Metadata = { title: "검색" };

export function SearchPage() {
  return (
    <CrtScreen source="SEARCH">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Search" title="검색" />
        <WithCatalog>
          <Suspense fallback={<p className="text-mute-200">불러오는 중…</p>}>
            <SearchResults />
          </Suspense>
        </WithCatalog>
      </div>
    </CrtScreen>
  );
}
