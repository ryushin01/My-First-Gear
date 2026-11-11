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
      display: "var(--ff-display-en), var(--ff-display-ko), 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
      mono: "var(--ff-mono), ui-monospace, Menlo, Consolas, monospace",
      sans: "var(--ff-sans), 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif",
    },
  },
  shortcuts: {
    "mono-label": "font-mono uppercase text-xs tracking-wide text-label",
  },
});
