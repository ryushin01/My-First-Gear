import Link from "next/link";
import { categories, channelOf, featuredProducts } from "@mfg/catalog";
import { getCatalog } from "@/entities/product/index.server";
import { CrtScreen } from "@/widgets/crt-screen";
import { TapeCarousel } from "@/widgets/tape-carousel";

export async function HomePage() {
  const products = await getCatalog();
  return (
    <CrtScreen source="CH 01 · HOME">
      <h1 className="sr-only">My First Gear, 첫 장비를 고르는 기어 숍</h1>
      <div className="flex flex-col gap-20 py-6">
        <TapeCarousel products={featuredProducts(products)} />

        <section aria-labelledby="channels-title" className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <h2 id="channels-title" className="font-display text-4xl md:text-6xl">
              채널 목록
            </h2>
            <Link href="/gear" className="font-mono text-xs uppercase text-label hover:text-cream">
              전체 기어 보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/gear/${category.id}`}
                  className="flex h-full min-h-20 flex-col justify-between gap-2 bg-ink p-4 hover:bg-ink-soft"
                >
                  <span className="font-mono text-[11px] text-label">CH {channelOf(category.id)}</span>
                  <span className="text-base">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="build-title" className="grid gap-6 border-t border-white/10 pt-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="mono-label">[PC Build · Assembly]</p>
            <h2 id="build-title" className="font-display text-4xl md:text-6xl">
              부품을 고르면
              <br />
              조립까지
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-4 text-mute-100">
            <p>CPU부터 케이스까지 칸을 채우면 소켓, 메모리 규격, 파워 용량, 그래픽카드 길이를 바로 확인합니다.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/build" className="inline-flex min-h-11 items-center rounded-md bg-cream px-5 text-ink hover:bg-white">
                PC 견적 시작
              </Link>
              <Link href="/assembly" className="inline-flex min-h-11 items-center rounded-md border border-white/30 px-5 hover:border-white">
                조립 서비스 안내
              </Link>
            </div>
          </div>
        </section>
      </div>
    </CrtScreen>
  );
}
