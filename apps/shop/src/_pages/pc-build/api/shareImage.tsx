import { buildSlots } from "@mfg/catalog";
import { summarizeBuild } from "@/entities/build";
import { getCatalog } from "@/entities/product/index.server";
import { renderSet } from "@/shared/lib/og";

/** GET /api/og/build?b=… : 견적 공유 이미지 (부품 그림·이름과 총액, 가격은 지금 판매가) */
export async function GET(request: Request) {
  const summary = summarizeBuild(new URL(request.url).searchParams.get("b") ?? "", await getCatalog());
  if (!summary) return new Response("견적이 비어 있습니다.", { status: 400 });
  const image = await renderSet({
    label: `PC BUILD · ${summary.rows.length} / ${buildSlots.length}`,
    rows: summary.rows,
    note: summary.assembling ? "조립 서비스 포함" : "부품만",
    total: summary.total,
  });
  // 가격이 바뀔 수 있어 하루만 캐시한다(같은 주소면 같은 구성).
  image.headers.set("Cache-Control", "public, max-age=86400");
  return image;
}
