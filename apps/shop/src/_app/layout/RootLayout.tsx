import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/config";
import { fontVariables } from "../fonts";
import "../styles/globals.css";

export const rootMetadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={fontVariables} data-bw="off">
      <body>
        <div aria-hidden="true" className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
