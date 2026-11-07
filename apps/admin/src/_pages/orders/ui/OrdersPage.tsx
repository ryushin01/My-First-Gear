import type { Metadata } from "next";
import Link from "next/link";
import { getDb, listOrders, orderStatuses, type OrderStatus } from "@mfg/db";
import { orderStatusLabel, OrderStatusForm } from "@/features/order-status";
import { formatDateTime, formatWon } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

export const ordersMetadata: Metadata = { title: "주문" };

type OrdersPageProps = { searchParams: Promise<{ status?: string }> };

export async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status } = await searchParams;
  const current = orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await listOrders(getDb(), { status: current });

  return (
    <AdminShell title="주문">
      <nav className="tabs is-small" aria-label="주문 상태">
        <ul>
          <li className={current ? undefined : "is-active"}>
            <Link href="/orders" aria-current={current ? undefined : "page"}>
              전체
            </Link>
          </li>
          {orderStatuses.map((s) => (
            <li key={s} className={current === s ? "is-active" : undefined}>
              <Link href={`/orders?status=${s}`} aria-current={current === s ? "page" : undefined}>
                {orderStatusLabel[s]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {orders.length === 0 ? (
        <p>해당하는 주문이 없습니다.</p>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-striped">
            <caption className="is-sr-only">주문 목록</caption>
            <thead>
              <tr>
                <th scope="col">주문 번호</th>
                <th scope="col">주문일</th>
                <th scope="col">받는 분</th>
                <th scope="col">상품</th>
                <th scope="col" className="has-text-right">
                  금액
                </th>
                <th scope="col">상태</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <th scope="row">
                    <Link href={`/orders/${order.id}`}>{order.id}</Link>
                    {order.assembly && <span className="tag is-warning is-light ml-2">조립</span>}
                  </th>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>{order.buyerName}</td>
                  <td>
                    {order.lines[0]?.name}
                    {order.lines.length > 1 && ` 외 ${order.lines.length - 1}건`}
                  </td>
                  <td className="has-text-right">{formatWon(order.total)}</td>
                  <td>
                    <OrderStatusForm orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
