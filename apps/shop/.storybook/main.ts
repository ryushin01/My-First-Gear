import type { StorybookConfig } from "@storybook/nextjs-vite";
import UnoPostcss from "@unocss/postcss";

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  async viteFinal(viteConfig) {
    // Next와 같은 방식(PostCSS)으로 UnoCSS를 만든다.
    viteConfig.css = { ...viteConfig.css, postcss: { plugins: [UnoPostcss()] } };
    return viteConfig;
  },
};

export default config;
