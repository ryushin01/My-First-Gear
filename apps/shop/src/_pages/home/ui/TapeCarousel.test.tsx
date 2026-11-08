import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { featuredProducts } from "@mfg/catalog";
import { TapeCarousel } from "./TapeCarousel";

describe("TapeCarousel", () => {
  const products = featuredProducts().slice(0, 4);

  it("화살표 키로 넘기고, 가운데 테이프만 초점을 받을 수 있다", async () => {
    render(<TapeCarousel products={products} />);
    const region = screen.getByRole("region", { name: "추천 기어" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByRole("link", { name: products[0].name })).toBeInTheDocument();
    // 숨긴 슬라이드의 링크는 접근성 트리에서 빠진다
    expect(screen.queryByRole("link", { name: products[1].name })).not.toBeInTheDocument();

    screen.getByRole("button", { name: /다음/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("link", { name: products[1].name })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("link", { name: products[3].name })).toBeInTheDocument();
  });

  it("캡션은 live region으로 바뀐 상품을 알린다", async () => {
    render(<TapeCarousel products={products} />);
    await userEvent.click(screen.getByRole("button", { name: /다음/ }));
    const live = document.querySelector("[aria-live=polite]");
    expect(live).toHaveTextContent(products[1].tagline);
  });
});
