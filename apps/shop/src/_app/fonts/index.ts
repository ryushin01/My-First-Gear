import { Azeret_Mono, Black_And_White_Picture, Gothic_A1, Nanum_Gothic_Coding } from "next/font/google";

/** 영문·숫자(큰 제목과 본문): 브라운관 화면 글씨 같은 고정폭 Azeret Mono(가변 굵기) */
const latin = Azeret_Mono({
  subsets: ["latin"],
  variable: "--ff-latin",
});

/** 큰 제목의 한글: 흑백 영화 자막 같은 블랙 앤 화이트 픽처 */
const displayKo = Black_And_White_Picture({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-display-ko",
  preload: false,
});

/** 본문 한글 */
const sans = Gothic_A1({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--ff-sans",
  preload: false,
});

/** 라벨과 견적 금액: 모니터 글씨 같은 고정폭 */
const mono = Nanum_Gothic_Coding({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--ff-mono",
  preload: false,
});

/**
 * 한글 글꼴은 글자 묶음별로 나눈 조각 파일이라 화면에 쓰인 글자의 조각만 받는다.
 * 그래서 미리 받지 않는다(preload: false).
 */
export const fontVariables = [latin, displayKo, sans, mono].map((font) => font.variable).join(" ");
