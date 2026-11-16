import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/widgets/admin-shell";

export const notFoundMetadata: Metadata = { title: { absolute: "페이지를 찾지 못했습니다 · My First Gear 어드민" } };

/** 없는 주소·주문 화면. 로그인하지 않은 사람은 프록시가 먼저 로그인 화면으로 보내므로 어드민 틀 안에 그린다. */
export function NotFoundScreen() {
  return (
    <AdminShell title="페이지를 찾지 못했습니다">
      <p className="mb-4">주소가 바뀌었거나 지워진 주문입니다. 메뉴에서 다시 찾아 주세요.</p>
      <Link href="/" className="button is-link">
        대시보드로
      </Link>
    </AdminShell>
  );
}
