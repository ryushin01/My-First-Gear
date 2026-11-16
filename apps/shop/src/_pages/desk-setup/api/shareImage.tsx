import { decodeSetup, setupSlots, setupTotal, toSetup } from "@mfg/catalog";
import { getCatalog } from "@/entities/product/index.server";
import { renderSet } from "@/shared/lib/og";

/** 공유 주소의 셋업(`/setup?s=`)을 칸 순서대로 풀고 총액을 낸다. 공유 이미지와 미리보기 제목이 같은 값을 쓴다. */
export async function summarizeSetup(encoded: string) {
  const state = decodeSetup(encoded.slice(0, 500));
  if (!state) return null;
  const setup = toSetup(state, await getCatalog());
  const rows = setupSlots.flatMap((slot) => {
    const product = setup[slot.id];
    return product ? [{ slot: slot.label, product }] : [];
  });
  return rows.length > 0 ? { rows, total: setupTotal(setup) } : null;
}

/** GET /api/og/setup?s=… : 데스크 셋업 공유 이미지 (장비 그림·이름과 총액) */
export async function GET(request: Request) {
  const summary = await summarizeSetup(new URL(request.url).searchParams.get("s") ?? "");
  if (!summary) return new Response("셋업이 비어 있습니다.", { status: 400 });
  const image = await renderSet({
    label: `DESK SETUP · ${summary.rows.length} / ${setupSlots.length}`,
    rows: summary.rows,
    note: "데스크 셋업",
    total: summary.total,
  });
  image.headers.set("Cache-Control", "public, max-age=86400");
  return image;
}
