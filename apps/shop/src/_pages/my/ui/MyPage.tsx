import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, getProductById } from "@mfg/catalog";
import { getDb, listInquiriesByUser, listOrdersByUser, listSavedBuilds, listWishlist } from "@mfg/db";
import { getSessionUser } from "@/entities/member/index.server";
import { orderStatusLabel } from "@/entities/order";
import { ProductCard } from "@/entities/product";
import { LogoutButton } from "@/features/auth";
import { inquiryCategoryLabel } from "../model/inquiryLabels";
import { InquiryForm } from "./InquiryForm";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";
import { deleteBuildAction } from "../api/actions";

export const myMetadata: Metadata = { title: "마이페이지", robots: { index: false } };

const date = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" });
const sectionTitle = "font-display text-3xl md:text-4xl";

async function MyContent() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/my");
  const db = getDb();
  const [orders, builds, wished, inquiries] = await Promise.all([
    listOrdersByUser(db, user.id),
    listSavedBuilds(db, user.id),
    listWishlist(db, user.id),
    listInquiriesByUser(db, user.id),
  ]);
  const wishedProducts = wished.flatMap((id) => getProductById(id) ?? []);

  return (
    <div className="flex flex-col gap-14 py-10">
      <PageHeading label="My channel" title={`${user.name}님의 채널`}>
        <span className="font-mono text-sm">{user.email}</span>
      </PageHeading>
      <div className="flex flex-wrap items-center gap-4">
        <nav aria-label="마이페이지 바로가기">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs uppercase text-label">
            <li><a href="#my-orders" className="hover:text-cream">주문 내역</a></li>
            <li><a href="#my-builds" className="hover:text-cream">저장한 견적</a></li>
            <li><a href="#my-wish" className="hover:text-cream">찜</a></li>
            <li><a href="#my-inquiries" className="hover:text-cream">1:1 문의</a></li>
          </ul>
        </nav>
        <LogoutButton />
      </div>

      <section id="my-orders" aria-labelledby="my-orders-heading" className="flex flex-col gap-4">
        <h2 id="my-orders-heading" className={sectionTitle}>주문 내역</h2>
        {orders.length === 0 ? (
          <p className="text-mute-200">아직 회원으로 주문한 내역이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">회원 주문 내역</caption>
              <thead>
                <tr className="border-b border-white/20 text-left font-mono text-xs uppercase text-label">
                  <th scope="col" className="py-2 pr-4 font-normal">주문 번호</th>
                  <th scope="col" className="py-2 pr-4 font-normal">주문일</th>
                  <th scope="col" className="py-2 pr-4 font-normal">상품</th>
                  <th scope="col" className="py-2 pr-4 font-normal">상태</th>
                  <th scope="col" className="py-2 text-right font-normal">금액</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/10">
                    <th scope="row" className="py-3 pr-4 text-left font-mono font-normal">{order.id}</th>
                    <td className="py-3 pr-4">{date.format(order.createdAt)}</td>
                    <td className="py-3 pr-4">
                      {order.lines[0]?.name}
                      {order.lines.length > 1 && ` 외 ${order.lines.length - 1}건`}
                    </td>
                    <td className="py-3 pr-4">{orderStatusLabel[order.status]}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="my-builds" aria-labelledby="my-builds-heading" className="flex flex-col gap-4">
        <h2 id="my-builds-heading" className={sectionTitle}>저장한 견적</h2>
        {builds.length === 0 ? (
          <p className="text-mute-200">
            저장한 견적이 없습니다. <Link href="/build" className="underline">PC 견적</Link>에서 저장할 수 있습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {builds.map((build) => (
              <li key={build.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4">
                <div>
                  <p>{build.name}</p>
                  <p className="font-mono text-xs text-label">
                    {date.format(build.createdAt)} · {formatPrice(build.total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/build?b=${encodeURIComponent(build.encoded)}`} className="inline-flex min-h-11 items-center rounded-md border border-white/30 px-4 text-sm hover:border-white">
                    불러오기<span className="sr-only">: {build.name}</span>
                  </Link>
                  <form action={deleteBuildAction}>
                    <input type="hidden" name="id" value={build.id} />
                    <button type="submit" className="min-h-11 px-3 text-sm text-mute-200 hover:text-cream">
                      삭제<span className="sr-only">: {build.name}</span>
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="my-wish" aria-labelledby="my-wish-heading" className="flex flex-col gap-4">
        <h2 id="my-wish-heading" className={sectionTitle}>찜</h2>
        {wishedProducts.length === 0 ? (
          <p className="text-mute-200">찜한 상품이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wishedProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} headingLevel={3} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="my-inquiries" aria-labelledby="my-inquiries-heading" className="flex flex-col gap-6">
        <h2 id="my-inquiries-heading" className={sectionTitle}>1:1 문의</h2>
        {inquiries.length > 0 && (
          <ul className="flex flex-col gap-3">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="rounded-lg border border-white/10 p-4">
                <p className="font-mono text-xs text-label">
                  [{inquiryCategoryLabel[inquiry.category]}] · {date.format(inquiry.createdAt)} · {inquiry.answer ? "답변 완료" : "답변 대기"}
                </p>
                <h3 className="mt-1 text-lg">{inquiry.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-mute-100">{inquiry.body}</p>
                {inquiry.answer && (
                  <p className="mt-3 whitespace-pre-line border-l-2 border-brand pl-3 text-sm">
                    <span className="font-mono text-xs text-label">답변 · My First Gear</span>
                    <br />
                    {inquiry.answer}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-xl">새 문의</h3>
        <InquiryForm />
      </section>
    </div>
  );
}

export function MyPage() {
  return (
    <CrtScreen source="MY CHANNEL">
      <Suspense fallback={<p className="py-24 text-center font-mono text-xs uppercase text-label">Tuning…</p>}>
        <MyContent />
      </Suspense>
    </CrtScreen>
  );
}
