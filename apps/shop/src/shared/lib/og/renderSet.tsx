import "server-only";
import { formatPrice, type Product } from "@mfg/catalog";
import { artDataUri, renderOg } from "./render";

type SetImage = {
  /** 왼쪽 위 라벨. 예) "PC BUILD · 8 / 8" */
  label: string;
  /** 칸 이름과 고른 상품 (견적 8칸, 셋업 9칸까지) */
  rows: { slot: string; product: Pick<Product, "name" | "art"> }[];
  /** 아래 왼쪽 한 줄. 예) "조립 서비스 포함" */
  note: string;
  total: number;
};

/** PC 견적·데스크 셋업 공유 이미지: 칸마다 상품 그림과 이름, 아래에 총액 (1200×630) */
export function renderSet({ label, rows, note, total }: SetImage) {
  return renderOg(
    <div style={{ display: "flex", flex: 1, flexDirection: "column", marginTop: 18 }}>
      <div style={{ display: "flex", fontSize: 22, color: "#bbbbbb", marginTop: 6 }}>[{label}]</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
        {rows.map(({ slot, product }) => (
          <div key={slot} style={{ display: "flex", alignItems: "center", gap: 12, width: 504, border: "1px solid #333", padding: "6px 10px" }}>
            <img src={artDataUri(product.art)} width={rows.length > 8 ? 44 : 52} height={rows.length > 8 ? 44 : 52} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 16, color: "#bbbbbb" }}>{slot}</div>
              <div style={{ display: "flex", fontSize: 21 }}>{product.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: 34 }}>
        <div style={{ display: "flex", color: "#bbbbbb" }}>{note}</div>
        <div style={{ display: "flex" }}>총액 {formatPrice(total)}</div>
      </div>
    </div>,
  );
}
