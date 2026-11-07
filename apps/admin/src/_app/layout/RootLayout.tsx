import type { Metadata } from "next";
import type { ReactNode } from "react";
import "bulma/css/bulma.min.css";
import "../styles/admin.css";

export const rootMetadata: Metadata = {
  title: { default: "My First Gear 어드민", template: "%s · My First Gear 어드민" },
  robots: { index: false, follow: false },
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
