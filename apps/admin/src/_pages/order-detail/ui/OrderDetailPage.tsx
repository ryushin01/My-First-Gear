import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb, getOrder } from "@mfg/db";
import { orderStatusLabel, OrderStatusForm } from "@/features/order-status";
import { formatDateTime, formatWon } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

type OrderDetailProps = { params: Promise<{ id: string }> };

const paymentLabel: Record<string, string> = { card: "신용카드 (모의)", transfer: "계좌이체 (모의)", easy: "간편결제 (모의)" };

export async function generateOrderMetadata({ params }: OrderDetailProps): Promise<Metadata> {
  return { title: `주문 ${(await params).id}` };
}

export async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = await params;
  const order = await getOrder(getDb(), id);
  if (!order) notFound();

  return (
    <AdminShell title={`주문 ${order.id}`}>
      <nav className="breadcrumb" aria-label="현재 위치">
        <ul>
          <li>
            <Link href="/orders">주문</Link>
          </li>
          <li className="is-active">
            <Link href={`/orders/${order.id}`} aria-current="page">
              {order.id}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="columns">
        <section className="column" aria-labelledby="lines-title">
          <h2 id="lines-title" className="title is-5">
            주문 상품
          </h2>
          <table className="table is-fullwidth">
            <caption className="is-sr-only">주문 상품과 금액</caption>
            <thead>
              <tr>
                <th scope="col">상품</th>
                <th scope="col" className="has-text-right">
                  단가
                </th>
                <th scope="col" className="has-text-right">
                  수량
                </th>
                <th scope="col" className="has-text-right">
                  금액
                </th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <th scope="row">{line.name}</th>
                  <td className="has-text-right">{formatWon(line.price)}</td>
                  <td className="has-text-right">{line.quantity}</td>
                  <td className="has-text-right">{formatWon(line.price * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="has-text-right">
                  배송비
                </th>
                <td className="has-text-right">{formatWon(order.shipping)}</td>
              </tr>
              <tr>
                <th scope="row" colSpan={3} className="has-text-right">
                  합계
                </th>
                <td className="has-text-right has-text-weight-bold">{formatWon(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </section>
        <section className="column is-4" aria-labelledby="buyer-title">
          <h2 id="buyer-title" className="title is-5">
            주문 정보
          </h2>
          <dl className="content">
            <dt className="has-text-weight-semibold">주문일</dt>
            <dd>{formatDateTime(order.createdAt)}</dd>
            <dt className="has-text-weight-semibold">받는 분</dt>
            <dd>
              {order.buyerName} · {order.buyerPhone}
            </dd>
            <dt className="has-text-weight-semibold">주소</dt>
            <dd>{order.address}</dd>
            {order.memo && (
              <>
                <dt className="has-text-weight-semibold">메모</dt>
                <dd>{order.memo}</dd>
              </>
            )}
            <dt className="has-text-weight-semibold">결제</dt>
            <dd>{paymentLabel[order.payment] ?? order.payment}</dd>
            <dt className="has-text-weight-semibold">조립 서비스</dt>
            <dd>{order.assembly ? "포함" : "없음"}</dd>
          </dl>
          <h3 className="title is-6">상태 이력</h3>
          <ol className="mb-4">
            {order.events.map((event) => (
              <li key={event.id}>
                {orderStatusLabel[event.status]} · <span className="has-text-grey-dark">{formatDateTime(event.createdAt)}</span>
              </li>
            ))}
          </ol>
          <h3 className="title is-6">상태 변경</h3>
          <OrderStatusForm orderId={order.id} status={order.status} />
        </section>
      </div>
    </AdminShell>
  );
}
