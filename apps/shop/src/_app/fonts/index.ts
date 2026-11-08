import { Gowun_Batang, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const displayEn = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--ff-display-en",
});

export const displayKo = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--ff-display-ko",
  preload: false,
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ff-mono",
});

/**
 * 본문 글꼴 Pretendard는 글자 묶음별로 나눈 파일(dynamic subset)을 globals.css에서 불러온다.
 * 전체 파일(약 2MB) 대신 화면에 쓰인 글자의 조각만 받는다. --ff-sans는 globals.css에서 정한다.
 */
export const fontVariables = [displayEn, displayKo, mono]
  .map((font) => font.variable)
  .join(" ");
