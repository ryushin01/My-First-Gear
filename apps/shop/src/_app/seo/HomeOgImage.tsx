import { featuredProducts } from "@mfg/catalog";
import { artDataUri, OG_SIZE, renderOg } from "@/shared/lib/og";

export const alt = "My First Gear: 첫 장비를 고르는 기어 숍";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function HomeOgImage() {
  const picks = featuredProducts().slice(0, 4);
  return renderOg(
    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", marginTop: 24 }}>
      <div style={{ display: "flex", fontSize: 72, lineHeight: 1.15, letterSpacing: -2 }}>첫 번째 장비를 고르는 시간</div>
      <div style={{ display: "flex", gap: 28 }}>
        {picks.map((p) => (
          <div key={p.id} style={{ display: "flex", border: `3px solid ${p.art.accent}`, borderRadius: 6, padding: 10, background: "#0b0b0b" }}>
            <img src={artDataUri(p.art)} width={180} height={180} alt="" />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#b2aeab" }}>PC 부품 · 오디오 · 게임기 · 탈것 · 시계 — 포트폴리오 데모</div>
    </div>,
  );
}
