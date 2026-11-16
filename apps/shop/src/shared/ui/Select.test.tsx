import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("기본 화살표를 끄고 꾸밈 화살표를 보조기기에서 숨긴 채 레이블과 연결된다", () => {
    const { container } = render(
      <>
        <label htmlFor="sort">정렬</label>
        <Select id="sort" defaultValue="b" className="border">
          <option value="a">가</option>
          <option value="b">나</option>
        </Select>
      </>,
    );
    const select = screen.getByRole("combobox", { name: "정렬" });
    expect(select).toHaveValue("b");
    expect(select.className).toContain("appearance-none");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("안쪽 여백에 맞춰 화살표를 같은 간격에 둔다", () => {
    const { container } = render(
      <Select inset="md" aria-label="유형">
        <option>가</option>
      </Select>,
    );
    expect(screen.getByRole("combobox").className).toContain("pl-3");
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("right-[13px]");
  });
});
