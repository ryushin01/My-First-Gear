import type { ComponentProps } from "react";
import type { Product } from "@mfg/catalog";

/** 브랜드 이름. 한글 브랜드는 영문 표기를 함께 적는다(영어 병기). */
export function BrandName({ product }: { product: Pick<Product, "brand" | "brandEn"> }) {
  return (
    <>
      {product.brand}
      {product.brandEn && <span lang="en"> {product.brandEn}</span>}
    </>
  );
}

/**
 * 상품 영문 이름 한 줄(영어 병기). 이름에 한글이 있는 상품에만 나온다. 버튼 안에서도 쓰도록 span으로 둔다.
 * 카드 전체가 링크인 곳에서는 aria-hidden으로 링크 이름을 한글 이름 하나로 둔다.
 */
export function EnglishName({ product, ...props }: { product: Pick<Product, "nameEn"> } & Omit<ComponentProps<"span">, "children" | "lang">) {
  if (!product.nameEn) return null;
  return (
    <span lang="en" {...props}>
      {product.nameEn}
    </span>
  );
}
