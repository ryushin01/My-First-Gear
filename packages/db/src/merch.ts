import { getProductById, products as catalogProducts, type Product } from "@mfg/catalog";
import type { Db } from "./client";
import { productMerch } from "./schema";

export type Merch = typeof productMerch.$inferSelect;

const defaultMerch = (p: Product): Omit<Merch, "updatedAt"> => ({
  productId: p.id,
  price: p.price,
  listPrice: p.listPrice ?? null,
  stock: p.stock,
  featured: Boolean(p.featured),
  visible: true,
});

/** 카탈로그 기본값으로 만든 판매 정보 (시드와 초기화에 쓴다) */
export function seedMerch(): Omit<Merch, "updatedAt">[] {
  return catalogProducts.map(defaultMerch);
}

/**
 * 카탈로그에는 있지만 판매 정보 행이 아직 없는 상품(새로 올렸거나 V에서 가져온 상품)에 기본 행을 만든다.
 * 이미 있는 행은 그대로 둔다. 주문처럼 행을 잠그기 전에 부른다.
 */
export async function ensureMerch(db: Pick<Db, "insert">, productIds: readonly string[]): Promise<void> {
  // 동시에 온 주문이 같은 상품들을 서로 다른 순서로 넣다가 교착하지 않게, 겹친 id를 빼고 id 순서로 넣는다.
  const rows = [...new Set(productIds)].sort().flatMap((id) => {
    const product = getProductById(id);
    return product ? [defaultMerch(product)] : [];
  });
  if (rows.length) await db.insert(productMerch).values(rows).onConflictDoNothing();
}

export async function listMerch(db: Db): Promise<Merch[]> {
  return db.select().from(productMerch);
}

export type MerchPatch = Partial<Pick<Merch, "price" | "listPrice" | "stock" | "featured" | "visible">>;

/** 판매 정보를 바꾼다. 행이 없는 카탈로그 상품은 기본값에 바꾼 값을 얹어 새로 만든다. 카탈로그에 없는 id는 undefined. */
export async function updateMerch(db: Db, productId: string, patch: MerchPatch): Promise<Merch | undefined> {
  const product = getProductById(productId);
  if (!product) return undefined;
  const updatedAt = new Date();
  const [row] = await db
    .insert(productMerch)
    .values({ ...defaultMerch(product), ...patch, updatedAt })
    .onConflictDoUpdate({ target: productMerch.productId, set: { ...patch, updatedAt } })
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
