import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PickerDialog } from "./PickerDialog";
import { PlannerSlot } from "./PlannerSlot";
import { ProductOption } from "./ProductOption";

const product = {
  id: "p1",
  brand: "MFG",
  name: "테스트 키보드",
  price: 129000,
  stock: 3,
  art: { kind: "keyboard" },
  specs: [
    { label: "배열", value: "텐키리스" },
    { label: "스위치", value: "적축" },
    { label: "연결", value: "유선" },
    { label: "무게", value: "800g" },
  ],
} as unknown as Parameters<typeof ProductOption>[0]["product"];

describe("PlannerSlot", () => {
  it("비어 있으면 안내 글과 고르기 버튼만 보이고, 선택 칸 표시를 붙인다", async () => {
    const onPick = vi.fn();
    render(
      <ol>
        <PlannerSlot
          index={0}
          label="키보드"
          optional
          product={undefined}
          emptyText="고르지 않음"
          issues={[]}
          errorPrefix="맞지 않음: "
          onPick={onPick}
          onClear={vi.fn()}
        />
      </ol>,
    );
    expect(screen.getByText("[01 · 키보드] 선택")).toBeInTheDocument();
    expect(screen.getByText("고르지 않음")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "빼기: 키보드" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "고르기: 키보드" }));
    expect(onPick).toHaveBeenCalledOnce();
  });

  it("고른 상품과 호환성 문제를 보여 주고, 빼기를 누를 수 있다", async () => {
    const onClear = vi.fn();
    render(
      <ol>
        <PlannerSlot
          index={1}
          label="CPU"
          product={product}
          emptyText="부품을 골라 주세요"
          issues={[
            { level: "error", message: "소켓이 다릅니다" },
            { level: "warning", message: "쿨러가 필요합니다" },
          ]}
          errorPrefix="호환 안 됨: "
          onPick={vi.fn()}
          onClear={onClear}
        />
      </ol>,
    );
    expect(screen.getByText("테스트 키보드")).toBeInTheDocument();
    expect(screen.getByText("호환 안 됨: 소켓이 다릅니다")).toBeInTheDocument();
    expect(screen.getByText("주의: 쿨러가 필요합니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "바꾸기: CPU" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "빼기: CPU" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe("ProductOption", () => {
  it("상품 정보와 경고를 보여 주고, 누르면 상품 id를 넘긴다", async () => {
    const onSelect = vi.fn();
    render(<ProductOption product={product} warning="지금 견적과 호환되지 않습니다" onSelect={onSelect} />);
    expect(screen.getByText("텐키리스 · 적축 · 유선")).toBeInTheDocument();
    expect(screen.getByText("지금 견적과 호환되지 않습니다")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("p1");
  });

  it("품절이면 누를 수 없다", () => {
    render(<ProductOption product={{ ...product, stock: 0 }} onSelect={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("품절")).toBeInTheDocument();
  });
});

describe("PickerDialog", () => {
  // jsdom에는 showModal·close가 없어 열림 속성만 바꾸는 흉내를 둔다.
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });
  afterEach(() => {
    // @ts-expect-error 흉내만 지운다.
    delete HTMLDialogElement.prototype.showModal;
    // @ts-expect-error 흉내만 지운다.
    delete HTMLDialogElement.prototype.close;
  });

  it("open을 따라 모달로 열고 닫으며, 제목으로 이름이 붙는다", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <PickerDialog open={false} title="CPU 고르기" onClose={onClose}>
        <p>후보</p>
      </PickerDialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <PickerDialog open title="CPU 고르기" onClose={onClose}>
        <p>후보</p>
      </PickerDialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "CPU 고르기" });
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce();
    expect(dialog).toContainElement(screen.getByText("후보"));
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <PickerDialog open={false} title="CPU 고르기" onClose={onClose}>
        <p>후보</p>
      </PickerDialog>,
    );
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
