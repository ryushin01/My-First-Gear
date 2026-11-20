import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans_KR, Nanum_Gothic_Coding, Noto_Serif_KR } from "next/font/google";

/** 영문 큰 제목: 획 대비가 큰 디도네. 크게 쓸 때 가는 획이 살도록 광학 크기 축을 함께 받는다. */
const displayLatin = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--ff-display-latin",
});

/** 한글 큰 제목: 본명조 */
const displayKo = Noto_Serif_KR({
  weight: "500",
  subsets: ["latin"],
  variable: "--ff-display-ko",
  preload: false,
});

/** 본문(한글·영문): 기술 문서 같은 단정한 산세리프 */
const sans = IBM_Plex_Sans_KR({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--ff-sans",
  preload: false,
});

/** 라벨·숫자(영문): HUD 표시처럼 담백한 고정폭 */
const monoLatin = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--ff-mono-latin",
});

/** 라벨의 한글: 고정폭 */
const mono = Nanum_Gothic_Coding({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-mono",
  preload: false,
});

/**
 * 한글 글꼴은 글자 묶음별로 나눈 조각 파일이라 화면에 쓰인 글자의 조각만 받는다.
 * 그래서 미리 받지 않는다(preload: false).
 * 굵기마다 조각별 @font-face 규칙이 100개 남짓 붙어 CSS가 커지므로, 한글은 쓰는 굵기만 둔다
 * (본문 400·500, 제목 500, 라벨 400. <strong>은 500을 굵게 합성).
 */
export const fontVariables = [displayLatin, displayKo, sans, monoLatin, mono].map((font) => font.variable).join(" ");
