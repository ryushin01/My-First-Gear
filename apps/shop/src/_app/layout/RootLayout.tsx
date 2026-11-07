import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CatalogProvider } from "@/entities/product";
import { getCatalog } from "@/entities/product/index.server";
import { fontVariables } from "../fonts";
import "../styles/globals.css";

export const rootMetadata: Metadata = {
  title: { default: "My First Gear", template: "%s · My First Gear" },
  description: "컴퓨터 부품부터 오디오, 탈것, 시계까지 첫 장비를 고르는 기어 숍 (포트폴리오 데모)",
};

export async function RootLayout({ children }: { children: ReactNode }) {
  const products = await getCatalog();
  return (
    <html lang="ko" className={fontVariables} data-bw="off">
      <body>
        <div aria-hidden="true" className="crt-overlay" />
        <CatalogProvider products={products}>{children}</CatalogProvider>
      </body>
    </html>
  );
}
