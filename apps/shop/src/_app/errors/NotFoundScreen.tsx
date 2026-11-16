import type { Metadata } from "next";
import Link from "next/link";
import { NOT_FOUND_TITLE, SITE_NAME } from "@/shared/config";
import { PageHeading } from "@/shared/ui";
import { CrtScreen } from "@/widgets/crt-screen";

export const notFoundMetadata: Metadata = { title: { absolute: `${NOT_FOUND_TITLE} · ${SITE_NAME}` } };

const linkClass = "inline-flex min-h-11 items-center rounded-md border border-white/30 px-5 hover:border-white";

/**
 * 없는 주소·상품·카테고리 화면. Next가 noindex를 붙인다.
 * 없는 상품·카테고리는 부분 프리렌더가 껍데기를 먼저 보내 상태 코드는 200이지만, 화면과 noindex는 같다.
 */
export function NotFoundScreen() {
  return (
    <CrtScreen source="NO SIGNAL">
      <div className="flex flex-col gap-10 py-10">
        <PageHeading label="404 · No signal" title={NOT_FOUND_TITLE}>
          주소가 바뀌었거나 더 이상 판매하지 않는 상품입니다. 아래에서 다시 찾아보세요.
        </PageHeading>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md bg-cream px-5 text-ink hover:bg-white">
            홈으로
          </Link>
          <Link href="/gear" className={linkClass}>
            전체 기어 보기
          </Link>
          <Link href="/search" className={linkClass}>
            상품 검색
          </Link>
        </div>
      </div>
    </CrtScreen>
  );
}
