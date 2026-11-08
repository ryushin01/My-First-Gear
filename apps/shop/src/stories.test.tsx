/**
 * 모든 스토리를 렌더링하고 axe로 접근성을 검사한다.
 * 명도 대비는 스타일이 없는 jsdom에서 판단할 수 없어 E2E(실제 빌드)에서 검사한다.
 */
// 스토리는 Next 전용 기능을 쓰지 않으므로 React 렌더러의 composeStories로 충분하다.
import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

type StoryModule = Parameters<typeof composeStories>[0];
const modules = import.meta.glob<StoryModule>("./**/*.stories.tsx", { eager: true });

describe.each(Object.entries(modules))("%s", (_, mod) => {
  const stories = Object.entries(composeStories(mod)) as [string, ComponentType][];
  it.each(stories)("%s: 렌더링되고 axe 위반이 없다", async (_name, Story) => {
    const { container } = render(<Story />);
    expect(container.firstChild).not.toBeNull();
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});
