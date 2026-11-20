import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    filesystem: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
  },
  presets: [presetWind4({ preflights: { reset: true } })],
  theme: {
    colors: {
      ink: { DEFAULT: "#0a0a0a", deep: "#050505", soft: "#161616" },
      brand: "#ff3131",
      // 화면 글자: 레퍼런스처럼 색이 치우치지 않은 흰색
      cream: "#f5f5f2",
      mute: { 100: "#dcdcd7", 200: "#bbbbbb" },
      label: "#ffffffbf",
      rgb: { red: "#ff2846", blue: "#2896ff" },
    },
    font: {
      // 큰 제목: 영문 Bodoni Moda, 한글 본명조. 대체 글꼴도 명조 계열
      display: "var(--ff-display-latin), var(--ff-display-ko), 'Bodoni 72', Didot, 'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', serif",
      // 라벨·숫자: 영문 IBM Plex Mono, 한글 나눔고딕코딩
      mono: "var(--ff-mono-latin), var(--ff-mono), ui-monospace, 'SF Mono', Menlo, Consolas, D2Coding, monospace",
      sans: "var(--ff-sans), 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans CJK KR', system-ui, sans-serif",
    },
    // HUD 상자처럼 각지게: 둥근 모서리 단계를 모두 0으로 둔다(rounded-full은 그대로 원)
    radius: {
      DEFAULT: "0px",
      xs: "0px",
      sm: "0px",
      md: "0px",
      lg: "0px",
      xl: "0px",
      "2xl": "0px",
      "3xl": "0px",
      "4xl": "0px",
    },
  },
  shortcuts: {
    "mono-label": "font-mono uppercase text-xs tracking-wide text-label",
    // 흰 바탕에 검은 글자로 뒤집은 HUD 표시
    "hud-tag": "inline-block bg-cream px-1.5 font-mono text-xs uppercase leading-5 tracking-wide text-ink",
  },
});
