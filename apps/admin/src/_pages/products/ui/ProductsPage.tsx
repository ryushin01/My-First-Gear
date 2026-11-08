import type { Metadata } from "next";
import Link from "next/link";
import { categories, getCategory, isCategoryId, products } from "@mfg/catalog";
import { getDb, listMerch } from "@mfg/db";
import { MerchRow } from "./MerchRow";
import { AdminShell } from "@/widgets/admin-shell";

export const productsMetadata: Metadata = { title: "상품 판매 정보" };

type ProductsPageProps = { searchParams: Promise<{ category?: string }> };

export async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const current = category && isCategoryId(category) ? category : undefined;
  const merch = new Map((await listMerch(getDb())).map((m) => [m.productId, m]));
  const rows = products.filter((p) => !current || p.categoryId === current);

  return (
    <AdminShell title="상품 판매 정보">
      <p className="mb-4">
        상품 설명과 사양은 코드(카탈로그)에서 관리하고, 여기서는 가격, 재고, 추천, 노출만 바꿉니다. 저장하면 쇼핑몰에 바로 반영됩니다.
      </p>
      <nav className="tabs is-small" aria-label="카테고리">
        <ul>
          <li className={current ? undefined : "is-active"}>
            <Link href="/products" aria-current={current ? undefined : "page"}>
              전체
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id} className={current === c.id ? "is-active" : undefined}>
              <Link href={`/products?category=${c.id}`} aria-current={current === c.id ? "page" : undefined}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="table-container">
        <table className="table is-fullwidth is-hoverable is-narrow">
          <caption className="is-sr-only">{current ? getCategory(current).name : "전체"} 상품 판매 정보</caption>
          <thead>
            <tr>
              <th scope="col">상품</th>
              <th scope="col">판매가 (원)</th>
              <th scope="col">정가 (원)</th>
              <th scope="col">재고</th>
              <th scope="col">추천</th>
              <th scope="col">노출</th>
              <th scope="col">
                <span className="is-sr-only">저장</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const m = merch.get(p.id);
              return (
                <MerchRow
                  key={p.id}
                  productId={p.id}
                  name={p.name}
                  brand={p.brand}
                  category={getCategory(p.categoryId).name}
                  price={m?.price ?? p.price}
                  listPrice={m ? m.listPrice : (p.listPrice ?? null)}
                  stock={m?.stock ?? p.stock}
                  featured={m?.featured ?? Boolean(p.featured)}
                  visible={m?.visible ?? true}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
