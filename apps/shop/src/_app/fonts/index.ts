import { Gowun_Batang, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

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

export const sans = localFont({
  src: "../../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--ff-sans",
});

export const fontVariables = [displayEn, displayKo, mono, sans]
  .map((font) => font.variable)
  .join(" ");
