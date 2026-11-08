import { connection } from "next/server";
import type { Metadata } from "next";
import { getProductBySlug } from "@mfg/catalog";
import { getDb, listConsults } from "@mfg/db";
import { ConsultStatusForm } from "./ConsultStatusForm";
import { formatDateTime } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

export const consultsMetadata: Metadata = { title: "구매 상담" };

export async function ConsultsPage() {
  await connection(); // 요청마다 DB를 읽는다
  const consults = await listConsults(getDb());
  return (
    <AdminShell title="구매 상담">
      {consults.length === 0 ? (
        <p>상담 신청이 없습니다.</p>
      ) : (
        <div className="table-container">
          <table className="table is-fullwidth is-striped">
            <caption className="is-sr-only">구매 상담 신청 목록</caption>
            <thead>
              <tr>
                <th scope="col">신청일</th>
                <th scope="col">이름</th>
                <th scope="col">연락처</th>
                <th scope="col">상품</th>
                <th scope="col">방문 희망일</th>
                <th scope="col">내용</th>
                <th scope="col">상태</th>
              </tr>
            </thead>
            <tbody>
              {consults.map((c) => (
                <tr key={c.id}>
                  <td>{formatDateTime(c.createdAt)}</td>
                  <th scope="row">{c.name}</th>
                  <td>{c.phone}</td>
                  <td>{c.productSlug ? (getProductBySlug(c.productSlug)?.name ?? c.productSlug) : "-"}</td>
                  <td>{c.preferredDate ?? "-"}</td>
                  <td>{c.message || "-"}</td>
                  <td>
                    <ConsultStatusForm id={c.id} status={c.status} name={c.name} />
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
