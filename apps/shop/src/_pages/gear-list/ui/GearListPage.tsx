import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categories, channelOf, getCategory, isCategoryId, type CategoryId } from "@mfg/catalog";
import { ProductBrowser, ProductBrowserFallback } from "@/features/product-filter";
import { CategoryNav } from "@/widgets/category-nav";
import { CrtScreen } from "@/widgets/crt-screen";

function sourceOf(categoryId?: CategoryId) {
  return categoryId ? `CH ${channelOf(categoryId)} · ${getCategory(categoryId).code}` : "CH 00 · ALL GEAR";
}

function GearList({ categoryId }: { categoryId?: CategoryId }) {
  const category = categoryId ? getCategory(categoryId) : undefined;
  const channel = categoryId ? channelOf(categoryId) : "00";

  return (
      <div className="grid gap-10 py-10 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <CategoryNav current={categoryId} />
        </aside>
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-2">
            <p className="mono-label">[CH {channel} · {category?.code ?? "ALL GEAR"}]</p>
            <h1 className="font-display text-5xl leading-none md:text-7xl">{category?.name ?? "전체 기어"}</h1>
          </header>
          <Suspense fallback={<ProductBrowserFallback categoryId={categoryId} />}>
            <ProductBrowser categoryId={categoryId} />
          </Suspense>
        </div>
      </div>
  );
}

export function AllGearPage() {
  return (
    <CrtScreen source={sourceOf()}>
      <GearList />
    </CrtScreen>
  );
}

export const allGearMetadata: Metadata = { title: "전체 기어" };

type CategoryPageProps = { params: Promise<{ category: string }> };

/** 화면 프레임은 Suspense 밖에 두어, 내용이 들어와도 본문 바로가기와 초점이 그대로 남게 한다. */
export function CategoryGearPage({ params }: CategoryPageProps) {
  return (
    <CrtScreen source={<Suspense fallback="TUNING…">{params.then(({ category }) => (isCategoryId(category) ? sourceOf(category) : ""))}</Suspense>}>
      <Suspense fallback={<p className="py-24 text-center font-mono text-xs uppercase text-label">Tuning…</p>}>
        {params.then(({ category }) => {
          if (!isCategoryId(category)) notFound();
          return <GearList categoryId={category} />;
        })}
      </Suspense>
    </CrtScreen>
  );
}

export function generateCategoryParams() {
  return categories.map((category) => ({ category: category.id }));
}

export async function generateCategoryMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return isCategoryId(category) ? { title: getCategory(category).name } : {};
}
