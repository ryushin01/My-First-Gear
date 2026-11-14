import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    filesystem: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
  },
  presets: [presetWind4({ preflights: { reset: true } })],
  theme: {
    colors: {
      ink: { DEFAULT: "#111111", deep: "#050505", soft: "#1a1a1a" },
      brand: "#ff3131",
      cream: "#fcf8ef",
      mute: { 100: "#e4dfd9", 200: "#b2aeab" },
      label: "#ffffffbf",
      rgb: { red: "#ff2846", blue: "#2896ff" },
    },
    font: {
      // 대체 글꼴: 브라운관 화면 글씨처럼 영문은 고정폭 타자기 글꼴(Courier New), 한글은 운영체제 고딕
      display: "var(--ff-display-en), var(--ff-display-ko), 'Courier New', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', monospace",
      mono: "var(--ff-mono), ui-monospace, 'SF Mono', Menlo, Consolas, D2Coding, monospace",
      sans: "var(--ff-sans), 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', system-ui, sans-serif",
    },
  },
  shortcuts: {
    "mono-label": "font-mono uppercase text-xs tracking-wide text-label",
  },
});
