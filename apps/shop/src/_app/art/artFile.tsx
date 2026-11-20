import { getProductBySlug, products } from "@mfg/catalog";
import { artSvg } from "@/shared/lib/art";

/**
 * 상품 그림 파일(/art/<slug>.svg). 그림 코드는 크므로 브라우저 번들에 넣지 않고,
 * 빌드할 때 상품마다 SVG 파일을 미리 만들어 브라우저는 이미지로 받는다(GearArt).
 */
export function generateStaticParams() {
  return products.map((product) => ({ file: `${product.slug}.svg` }));
}

/** 상품 그림 파일 내용. 없는 상품이면 null */
export function productArtSvg(slug: string): string | null {
  const product = getProductBySlug(slug);
  return product ? artSvg(product.art) : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const svg = file.endsWith(".svg") ? productArtSvg(file.slice(0, -".svg".length)) : null;
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // 그림을 고치면 같은 주소의 내용이 바뀌므로 하루만 그대로 쓰고 뒤에서 새로 받는다.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
