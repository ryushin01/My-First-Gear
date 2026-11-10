import type { MetadataRoute } from "next";
import { categories, products } from "@mfg/catalog";
import { SITE_URL } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).href;
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    ...["/gear", "/build", "/build/quick", "/setup", "/assembly", "/search", "/compare", "/orders", "/consult"].map((path) => ({
      url: url(path),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({ url: url(`/gear/${c.id}`), changeFrequency: "daily" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: url(`/product/${p.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
