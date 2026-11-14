import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssemblySequence } from "./AssemblySequence";

describe("AssemblySequence", () => {
  it("제목과 조립 단계 네 개를 순서 목록으로 보여 준다", () => {
    render(<AssemblySequence />);
    const section = screen.getByRole("region", { name: /한 대의 PC가 되기까지/ });
    const steps = within(section).getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent("메인보드와 CPU");
  });

  it("움직이는 부품 그림은 보조기기에서 숨기고, 부품마다 시작 지점을 둔다", () => {
    const { container } = render(<AssemblySequence />);
    const figure = container.querySelector(".assembly-figure");
    expect(figure).toHaveAttribute("aria-hidden", "true");
    const parts = figure?.querySelectorAll<SVGGElement>(".assembly-part") ?? [];
    // 메인보드, CPU, 메모리 4, SSD 3, M.2 방열판, 라디에이터, 펌프, 라이저, 거치대, 그래픽카드, 파워
    expect(parts).toHaveLength(16);
    parts.forEach((part) => expect(part.style.getPropertyValue("--s")).toMatch(/%$/));
  });
});
