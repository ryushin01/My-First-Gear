import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@mfg/catalog";
import { PriceTag } from "./PriceTag";

describe("PriceTag", () => {
  it("할인율, 판매가, 정가를 화면 읽기 프로그램에도 구분해 알린다", () => {
    render(<PriceTag product={getProductBySlug("geforce-rtx-5070-ti-16gb")!} />);
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText(/판매가/).parentElement).toHaveTextContent("판매가 1,249,000원");
    expect(screen.getByRole("deletion")).toHaveTextContent("정가 1,390,000원");
  });

  it("할인이 없으면 정가를 보이지 않는다", () => {
    render(<PriceTag product={getProductBySlug("amd-ryzen-5-9600x")!} />);
    expect(screen.queryByRole("deletion")).not.toBeInTheDocument();
  });
});
