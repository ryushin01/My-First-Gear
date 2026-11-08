import { eq } from "drizzle-orm";
import { products as catalogProducts, type Product } from "@mfg/catalog";
import type { Db } from "./client";
import { productMerch } from "./schema";

export type Merch = typeof productMerch.$inferSelect;

/** 카탈로그 기본값으로 만든 판매 정보 (시드와 초기화에 쓴다) */
export function seedMerch(): Omit<Merch, "updatedAt">[] {
  return catalogProducts.map((p) => ({
    productId: p.id,
    price: p.price,
    listPrice: p.listPrice ?? null,
    stock: p.stock,
    featured: Boolean(p.featured),
    visible: true,
  }));
}

export async function listMerch(db: Db): Promise<Merch[]> {
  return db.select().from(productMerch);
}

export type MerchPatch = Partial<Pick<Merch, "price" | "listPrice" | "stock" | "featured" | "visible">>;

export async function updateMerch(db: Db, productId: string, patch: MerchPatch): Promise<Merch | undefined> {
  const [row] = await db
    .update(productMerch)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(productMerch.productId, productId))
    .returning();
  return row;
}

/**
 * 카탈로그 상품에 DB 판매 정보를 덮어쓴다. 숨긴 상품은 뺀다.
 * stats를 주면 카탈로그의 누적 후기(가상 값)에 DB 후기를 더해 평점과 후기 수를 다시 계산한다.
 */
export function applyMerch(
  merch: Merch[],
  source: Product[] = catalogProducts,
  stats: Record<string, { count: number; sum: number }> = {},
): Product[] {
  const byId = new Map(merch.map((m) => [m.productId, m]));
  return source.flatMap((product) => {
    const m = byId.get(product.id);
    const extra = stats[product.id];
    const reviewCount = product.reviewCount + (extra?.count ?? 0);
    const rating = extra ? Math.round(((product.rating * product.reviewCount + extra.sum) / reviewCount) * 10) / 10 : product.rating;
    if (!m) return [{ ...product, reviewCount, rating }];
    if (!m.visible) return [];
    return [
      {
        ...product,
        price: m.price,
        listPrice: m.listPrice ?? undefined,
        stock: m.stock,
        featured: m.featured,
        reviewCount,
        rating,
      },
    ];
  });
}
