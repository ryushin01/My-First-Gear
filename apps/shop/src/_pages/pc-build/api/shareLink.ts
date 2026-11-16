import { buildSlots, formatPrice } from "@mfg/catalog";
import { summarizeBuild } from "@/entities/build";
import { getCatalog } from "@/entities/product/index.server";
import { sharePage } from "@/shared/lib/og";

/**
 * GET /share/build?b=… : 견적 공유 주소. 메신저 미리보기에 이 견적의 제목(칸 수·총액)과 이미지를 주고, 사람은 /build?b=…로 보낸다.
 * 견적 화면은 정적 캐시 그대로 둔다(공유할 때만 이 함수가 돈다). 읽을 수 없는 값이면 빈 견적 화면으로.
 */
export async function GET(request: Request) {
  const encoded = (new URL(request.url).searchParams.get("b") ?? "").slice(0, 500);
  const summary = summarizeBuild(encoded, await getCatalog());
  if (!summary) return new Response(null, { status: 302, headers: { location: "/build" } });
  const value = encodeURIComponent(encoded);
  return sharePage({
    title: `PC 견적 · ${summary.rows.length}/${buildSlots.length}칸 · ${formatPrice(summary.total)}`,
    description: summary.rows.map((row) => row.product.name).join(" · "),
    image: `/api/og/build?b=${value}`,
    target: `/build?b=${value}`,
  });
}
