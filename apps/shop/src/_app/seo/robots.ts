import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/my", "/checkout", "/cart", "/api/"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
