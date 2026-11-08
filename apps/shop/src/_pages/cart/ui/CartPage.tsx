import type { Metadata } from "next";
import { WithCatalog } from "@/entities/product/index.server";
import { PageHeading } from "@/shared/ui";
import { CartPanel } from "./CartPanel";
import { CrtScreen } from "@/widgets/crt-screen";

export const cartMetadata: Metadata = { title: "장바구니" };

export function CartPage() {
  return (
    <CrtScreen source="CART">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="Cart" title="장바구니" />
        <WithCatalog>
          <CartPanel />
        </WithCatalog>
      </div>
    </CrtScreen>
  );
}
