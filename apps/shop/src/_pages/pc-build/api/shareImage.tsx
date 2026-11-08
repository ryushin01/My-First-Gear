import { buildSlots, formatPrice, getProductById, getService } from "@mfg/catalog";
import { artDataUri, renderOg } from "@/shared/lib/og";
import { decodeBuild } from "@/entities/build";

/** GET /api/og/build?b=… : 견적 공유 이미지 (부품 그림·이름과 총액) */
export async function GET(request: Request) {
  const encoded = new URL(request.url).searchParams.get("b") ?? "";
  const state = decodeBuild(encoded.slice(0, 500));
  if (!state) return new Response("견적이 비어 있습니다.", { status: 400 });
  const rows = buildSlots.flatMap((slot) => {
    const id = state.parts[slot.part];
    const product = id ? getProductById(id) : undefined;
    return product ? [{ slot: slot.label, product }] : [];
  });
  const services = state.services.flatMap((id) => getService(id) ?? []);
  const assembling = services.some((s) => s.id === "svc-assembly");
  const total =
    rows.reduce((sum, r) => sum + r.product.price, 0) + (assembling ? services.reduce((sum, s) => sum + s.price, 0) : 0);

  const image = await renderOg(
    <div style={{ display: "flex", flex: 1, flexDirection: "column", marginTop: 18 }}>
      <div style={{ display: "flex", fontSize: 22, color: "#b2aeab", marginTop: 6 }}>[PC BUILD · {rows.length} / 8]</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
        {rows.map(({ slot, product }) => (
          <div key={slot} style={{ display: "flex", alignItems: "center", gap: 12, width: 504, border: "1px solid #333", borderRadius: 8, padding: "6px 10px" }}>
            <img src={artDataUri(product.art)} width={52} height={52} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 16, color: "#b2aeab" }}>{slot}</div>
              <div style={{ display: "flex", fontSize: 21 }}>{product.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: 34 }}>
        <div style={{ display: "flex", color: "#b2aeab" }}>{assembling ? "조립 서비스 포함" : "부품만"}</div>
        <div style={{ display: "flex" }}>총액 {formatPrice(total)}</div>
      </div>
    </div>,
  );
  image.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return image;
}
