import type { Metadata } from "next";
import { connection } from "next/server";
import { getDb, listMembers } from "@mfg/db";
import { formatDateTime } from "@/shared/lib";
import { AdminShell } from "@/widgets/admin-shell";

export const membersMetadata: Metadata = { title: "회원" };

export async function MembersPage() {
  await connection();
  const members = await listMembers(getDb());
  return (
    <AdminShell title="회원">
      <p className="mb-4">가상 데이터입니다. 데모 회원과 방문자가 가입한 회원은 매일 새벽 초기화됩니다.</p>
      <div className="table-container">
        <table className="table is-fullwidth is-striped">
          <caption className="is-sr-only">회원 목록</caption>
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">이메일</th>
              <th scope="col">가입일</th>
              <th scope="col" className="has-text-right">
                주문 수
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <th scope="row">{member.name}</th>
                <td>{member.email}</td>
                <td>{formatDateTime(member.createdAt)}</td>
                <td className="has-text-right">{member.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
