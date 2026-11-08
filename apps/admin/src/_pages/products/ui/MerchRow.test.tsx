import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MerchRow } from "./MerchRow";

const updateMerchAction = vi.fn();
vi.mock("../api/actions", () => ({ updateMerchAction: (...args: unknown[]) => updateMerchAction(...args) }));

const props = {
  productId: "p-ssd-002",
  name: "WD BLACK SN850X 1TB",
  brand: "Western Digital",
  category: "SSD",
  price: 139000,
  listPrice: null,
  stock: 64,
  featured: false,
  visible: true,
};

function renderRow() {
  return render(
    <table>
      <tbody>
        <MerchRow {...props} />
      </tbody>
    </table>,
  );
}

describe("MerchRow", () => {
  it("칸마다 상품 이름이 들어간 레이블을 단다", () => {
    renderRow();
    expect(screen.getByLabelText("WD BLACK SN850X 1TB 판매가")).toHaveValue("139000");
    expect(screen.getByRole("checkbox", { name: "WD BLACK SN850X 1TB 노출" })).toBeChecked();
    expect(screen.getByRole("button", { name: /저장\s*:\s*WD BLACK SN850X 1TB/ })).toBeInTheDocument();
  });

  it("저장에 실패하면 입력한 값을 그대로 두고 안내한다", async () => {
    updateMerchAction.mockImplementation(async (_: unknown, data: FormData) => ({
      ok: false,
      message: "정가는 판매가보다 커야 합니다.",
      values: Object.fromEntries(["price", "listPrice", "stock", "featured", "visible"].map((k) => [k, String(data.get(k) ?? "")])),
    }));
    renderRow();
    await userEvent.type(screen.getByLabelText("WD BLACK SN850X 1TB 정가"), "1000");
    await userEvent.click(screen.getByRole("button", { name: /저장/ }));
    expect(await screen.findByRole("status")).toHaveTextContent("정가는 판매가보다 커야 합니다.");
    expect(screen.getByLabelText("WD BLACK SN850X 1TB 정가")).toHaveValue("1000");
  });

  it("저장 중에 빠르게 두 번 눌러도 한 번만 보낸다", async () => {
    let finish!: (v: unknown) => void;
    updateMerchAction.mockReset();
    updateMerchAction.mockImplementation(() => new Promise((resolve) => (finish = resolve)));
    renderRow();
    const button = screen.getByRole("button", { name: /저장/ });
    await userEvent.dblClick(button);
    expect(updateMerchAction).toHaveBeenCalledTimes(1);
    finish({ ok: true, message: "저장했습니다." });
  });
});
