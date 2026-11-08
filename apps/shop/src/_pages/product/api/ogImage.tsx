import { formatPrice, getCategory, getProductBySlug, products } from "@mfg/catalog";
import { artDataUri, OG_SIZE, renderOg } from "@/shared/lib/og";

export const ogAlt = "My First Gear 상품";
export const ogSize = OG_SIZE;
export const ogContentType = "image/png";

export function generateOgParams() {
  return products.map((p) => ({ slug: p.slug }));
}

/** 상품 공유 이미지: 직접 그린 상품 그림과 이름, 가격 (가격은 코드 기본값) */
export async function ProductOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProductBySlug((await params).slug);
  if (!product) return renderOg(<div style={{ display: "flex", fontSize: 64, marginTop: 40 }}>상품을 찾지 못했습니다</div>);
  const category = getCategory(product.categoryId);
  return renderOg(
    <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 56, marginTop: 16 }}>
      <div style={{ display: "flex", border: `4px solid ${product.art.accent}`, borderRadius: 8, padding: 18, background: "#050505" }}>
        <img src={artDataUri(product.art)} width={360} height={360} alt="" />
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 26, color: "#b2aeab" }}>
          [{category.code}] {product.brand}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.1, color: product.art.accent }}>{product.name}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#e4dfd9" }}>{product.tagline}</div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 12 }}>
          {product.purchaseMode === "consult" ? `상담 후 구매 · ${formatPrice(product.price)}` : formatPrice(product.price)}
        </div>
      </div>
    </div>,
  );
}
