/**
 * 공용 컴포넌트를 여러 상태로 렌더링하고 axe로 접근성을 검사한다.
 * 명도 대비는 스타일이 없는 jsdom에서 판단할 수 없어 E2E(실제 빌드)에서 검사한다.
 */
import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { featuredProducts, getProductBySlug, products } from "@mfg/catalog";
import { GearArt } from "@mfg/gear-art";
import { PriceTag, ProductCard, TapeSleeve } from "@/entities/product";
import { ErrorSummary, TextAreaField, TextField } from "@/shared/ui";
import { Wordmark } from "@/widgets/crt-screen/ui/Wordmark";

const product = (slug: string) => getProductBySlug(slug)!;

const cases: [string, ReactElement][] = [
  ["상품 카드: 할인", <ProductCard key="a" product={product("geforce-rtx-5070-ti-16gb")} />],
  ["상품 카드: 품절", <ProductCard key="b" product={product("nintendo-switch-2")} />],
  ["상품 카드: 상담 상품", <ProductCard key="c" product={product("lamborghini-aventador")} />],
  ["가격: 할인 큰 글자", <PriceTag key="d" product={product("lg-gram-16")} size="lg" />],
  [
    "테이프 표지: 추천 상품 전체",
    <div key="e">
      {featuredProducts().map((p) => (
        <TapeSleeve key={p.id} product={p} />
      ))}
    </div>,
  ],
  [
    "상품 그림: 40종 (설명 있음)",
    <ul key="f">
      {products.map((p) => (
        <li key={p.id}>
          <GearArt art={p.art} label={`${p.name} 그림`} />
        </li>
      ))}
    </ul>,
  ],
  [
    "입력 칸: 필수·도움말·오류, 여러 줄, 오류 요약",
    <form key="g">
      <ErrorSummary titleId="summary" errors={{ phone: "휴대폰 번호를 입력해 주세요." }} />
      <TextField id="name" label="받는 분" required />
      <TextField id="email" label="이메일" type="email" hint="주문 안내를 받을 주소입니다." />
      <TextField id="phone" label="휴대폰 번호" required error="휴대폰 번호를 입력해 주세요." />
      <TextAreaField id="memo" label="배송 메모" />
    </form>,
  ],
  ["워드마크", <Wordmark key="h" />],
];

describe("컴포넌트 접근성", () => {
  it.each(cases)("%s: axe 위반이 없다", async (_name, element) => {
    const { container } = render(element);
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});
