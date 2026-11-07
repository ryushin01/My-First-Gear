import type { Preview } from "@storybook/nextjs-vite";
import "../src/_app/styles/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    a11y: { test: "error" },
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div lang="ko" style={{ background: "#111", color: "#fcf8ef", padding: 24, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
