import { formatPrice, setupSlots } from "@mfg/catalog";
import { sharePage } from "@/shared/lib/og";
import { summarizeSetup } from "./shareImage";

/**
 * GET /share/setup?s=… : 데스크 셋업 공유 주소. 메신저 미리보기에 이 셋업의 제목(칸 수·총액)과 이미지를 주고, 사람은 /setup?s=…로 보낸다.
 * 셋업 화면은 정적 캐시 그대로 둔다. 읽을 수 없는 값이면 빈 셋업 화면으로.
 */
export async function GET(request: Request) {
  const encoded = (new URL(request.url).searchParams.get("s") ?? "").slice(0, 500);
  const summary = await summarizeSetup(encoded);
  if (!summary) return new Response(null, { status: 302, headers: { location: "/setup" } });
  const value = encodeURIComponent(encoded);
  return sharePage({
    title: `데스크 셋업 · ${summary.rows.length}/${setupSlots.length}칸 · ${formatPrice(summary.total)}`,
    description: summary.rows.map((row) => row.product.name).join(" · "),
    image: `/api/og/setup?s=${value}`,
    target: `/setup?s=${value}`,
  });
}
