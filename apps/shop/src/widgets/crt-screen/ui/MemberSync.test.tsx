import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemberSync } from "./MemberSync";

const actions = vi.hoisted(() => ({
  loadMemberStateAction: vi.fn(),
  checkMemberSessionAction: vi.fn(),
  saveMemberCartAction: vi.fn(),
  saveMemberBuildAction: vi.fn(),
}));
vi.mock("../api/memberSync", () => actions);

describe("MemberSync", () => {
  beforeEach(() => {
    document.cookie = "mfg_member=member; path=/";
    actions.loadMemberStateAction.mockResolvedValue({ cart: [], build: null });
    actions.checkMemberSessionAction.mockResolvedValue("ok");
    actions.saveMemberCartAction.mockResolvedValue(undefined);
    actions.saveMemberBuildAction.mockResolvedValue(undefined);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("이미 불러온 회원이어도 화면을 옮기면 1분에 한 번 서버 세션을 확인하고, 사라졌으면 로그인 전 모습으로 바꾼다", async () => {
    render(<MemberSync />);
    await waitFor(() => expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(actions.saveMemberCartAction).toHaveBeenCalled());
    cleanup();

    // 1분 안에 다른 화면으로 옮기면 다시 확인하지 않는다
    render(<MemberSync />);
    cleanup();
    expect(actions.checkMemberSessionAction).not.toHaveBeenCalled();

    // 1분이 지나 옮기면 불러오기는 건너뛰되 세션은 확인한다
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 61_000);
    actions.checkMemberSessionAction.mockResolvedValue("signed-out");
    const changed = vi.fn();
    window.addEventListener("mfg:member", changed);
    render(<MemberSync />);
    await waitFor(() => expect(changed).toHaveBeenCalled());
    window.removeEventListener("mfg:member", changed);
    expect(actions.checkMemberSessionAction).toHaveBeenCalledTimes(1);
    expect(actions.loadMemberStateAction).toHaveBeenCalledTimes(1);
  });
});
