import { connection } from "next/server";
import Link from "next/link";
import { getProductById } from "@mfg/catalog";
import { countUnanswered, dashboardStats, getDb, listOrders } from "@mfg/db";
import { orderStatusLabel, orderStatusTag } from "@/features/order-status";
import { formatDateTime, formatWon } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

export async function DashboardPage() {
  await connection(); // 요청마다 DB를 읽는다
  const db = getDb();
  const [stats, recent, unanswered] = await Promise.all([dashboardStats(db), listOrders(db, { limit: 5 }), countUnanswered(db)]);
  const cards = [
    { label: "최근 24시간 주문", value: `${stats.ordersLast24h}건` },
    { label: "누적 매출 (취소 제외)", value: formatWon(stats.revenue) },
    { label: "조립 중", value: `${stats.assembling}건`, href: "/orders?status=assembling" },
    { label: "새 상담 신청", value: `${stats.newConsults}건`, href: "/consults" },
    { label: "답변 대기 문의", value: `${unanswered.inquiries + unanswered.questions}건`, href: "/inquiries" },
  ];

  return (
    <AdminShell title="대시보드">
      <div className="columns is-multiline">
        {cards.map((card) => (
          <div key={card.label} className="column is-6-tablet is-one-fifth-desktop">
            <div className="box">
              <p className="heading">{card.label}</p>
              <p className="title is-4">{card.href ? <Link href={card.href}>{card.value}</Link> : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="columns">
        <section className="column" aria-labelledby="recent-title">
          <h2 id="recent-title" className="title is-5">
            최근 주문
          </h2>
          {recent.length === 0 ? (
            <p>아직 주문이 없습니다.</p>
          ) : (
            <div className="table-container">
              <table className="table is-fullwidth is-striped">
                <caption className="is-sr-only">최근 주문 5건</caption>
                <thead>
                  <tr>
                    <th scope="col">주문 번호</th>
                    <th scope="col">주문일</th>
                    <th scope="col">상태</th>
                    <th scope="col" className="has-text-right">
                      금액
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id}>
                      <th scope="row">
                        <Link href={`/orders/${order.id}`}>{order.id}</Link>
                      </th>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <span className={`tag ${orderStatusTag[order.status]}`}>{orderStatusLabel[order.status]}</span>
                      </td>
                      <td className="has-text-right">{formatWon(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="column is-4" aria-labelledby="stock-title">
          <h2 id="stock-title" className="title is-5">
            재고 5개 미만
          </h2>
          {stats.lowStock.length === 0 ? (
            <p>부족한 재고가 없습니다.</p>
          ) : (
            <ul>
              {stats.lowStock.map((m) => (
                <li key={m.productId} className="is-flex is-justify-content-space-between py-1">
                  <span>{getProductById(m.productId)?.name ?? m.productId}</span>
                  <span className={`tag ${m.stock === 0 ? "is-danger" : "is-warning"}`}>{m.stock === 0 ? "품절" : `${m.stock}개`}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/products" className="button is-small mt-3">
            판매 정보 관리
          </Link>
        </section>
      </div>
    </AdminShell>
  );
}
