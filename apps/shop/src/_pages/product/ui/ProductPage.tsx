import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { channelOf, getCategory, getProductBySlug, nextInCategory, products } from "@mfg/catalog";
import { getCatalog } from "@/entities/product/index.server";
import { GearArt } from "@mfg/gear-art";
import { PriceTag } from "@/entities/product";
import { AddToCartButton } from "./AddToCartButton";
import { ProductCommunity } from "./ProductCommunity";
import { WishButton } from "./WishButton";
import { CrtScreen } from "@/widgets/crt-screen";

type ProductPageProps = { params: Promise<{ slug: string }> };

/** 화면 프레임은 Suspense 밖에 두어, 내용이 들어와도 본문 바로가기와 초점이 그대로 남게 한다. */
export function ProductPage({ params }: ProductPageProps) {
  return (
    <CrtScreen source={<Suspense fallback="TUNING…">{params.then(({ slug }) => <ProductSource slug={slug} />)}</Suspense>}>
      <Suspense fallback={<p className="py-24 text-center font-mono text-xs uppercase text-label">Tuning…</p>}>
        {params.then(({ slug }) => (
          <ProductContent slug={slug} />
        ))}
      </Suspense>
    </CrtScreen>
  );
}

async function ProductSource({ slug }: { slug: string }) {
  const product = getProductBySlug(slug, await getCatalog());
  return product ? `CH ${channelOf(product.categoryId)} · ${product.name}` : "";
}

async function ProductContent({ slug }: { slug: string }) {
  const catalog = await getCatalog();
  const product = getProductBySlug(slug, catalog);
  if (!product) notFound();

  const category = getCategory(product.categoryId);
  const channel = channelOf(product.categoryId);
  const next = nextInCategory(product, catalog);
  const soldOut = product.stock === 0;

  return (
    <>
      <article className="grid gap-10 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <nav aria-label="현재 위치" className="font-mono text-xs uppercase text-label">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/gear" className="hover:text-cream">
                  Gear
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/gear/${category.id}`} className="hover:text-cream">
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs uppercase">
            <dt className="text-label">[Brand]</dt>
            <dd>{product.brand}</dd>
            <dt className="text-label">[Channel]</dt>
            <dd>
              CH {channel} · {category.code}
            </dd>
            <dt className="text-label">[Rating]</dt>
            <dd>
              {product.rating.toFixed(1)} / 5 · 후기 {product.reviewCount.toLocaleString("ko-KR")}개
            </dd>
            <dt className="text-label">[Stock]</dt>
            <dd>{soldOut ? "품절" : product.stock < 5 ? `${product.stock}개 남음` : "재고 있음"}</dd>
          </dl>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">{product.name}</h1>
          <p className="text-lg text-mute-100">{product.tagline}</p>
          <p className="text-mute-200">{product.description}</p>

          <PriceTag product={product} size="lg" />

          {product.purchaseMode === "consult" ? (
            <div className="flex flex-col gap-2">
              <Link
                href={`/consult?product=${product.slug}`}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-cream px-6 font-medium text-ink hover:bg-white"
              >
                구매 상담 신청
              </Link>
              <p className="text-sm text-mute-200">고가 상품은 상담 후 전시장에서 계약합니다.</p>
            </div>
          ) : (
            <AddToCartButton productId={product.id} productName={product.name} disabled={soldOut} />
          )}
          <WishButton productId={product.id} productName={product.name} />
        </div>

        <div className="flex flex-col gap-8">
          <figure className="crt-inset relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[28px] border-8 border-[#1d1d1d] bg-black text-cream">
            <GearArt art={product.art} label={`${product.name} 그림`} className="h-4/5 w-4/5" />
            <figcaption className="absolute bottom-3 left-4 font-mono text-[11px] uppercase text-label">
              Play ▶ {product.slug}
            </figcaption>
          </figure>

          <section aria-labelledby={`${product.id}-spec`} className="flex flex-col gap-3">
            <h2 id={`${product.id}-spec`} className="mono-label">
              [Spec]
            </h2>
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">{product.name} 사양</caption>
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-white/10">
                    <th scope="row" className="w-1/3 py-2.5 pr-4 text-left font-normal text-mute-200">
                      {spec.label}
                    </th>
                    <td className="py-2.5">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {next.id !== product.id && (
            <Link
              href={`/product/${next.slug}`}
              className="group flex items-center justify-between border-t border-white/10 pt-4"
            >
              <span className="mono-label">[Next tape]</span>
              <span className="font-display text-2xl group-hover:text-brand">
                {next.name} <span aria-hidden="true">→</span>
              </span>
            </Link>
          )}
        </div>
      </article>
      <div className="pb-16">
        <ProductCommunity productId={product.id} reviewCount={product.reviewCount} />
      </div>
    </>
  );
}

export function generateProductParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateProductMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return product ? { title: product.name, description: product.tagline } : {};
}
