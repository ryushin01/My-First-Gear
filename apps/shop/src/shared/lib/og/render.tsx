import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { GearArt, type GearArtValue } from "@mfg/gear-art";
import { toSvgString } from "./svgString";

export const OG_SIZE = { width: 1200, height: 630 };

// 한글이 들어가므로 Satori가 읽을 수 있는 OTF 글꼴을 쓴다. 요청과 상관없으니 한 번만 읽는다.
const fontData = readFile(join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"));

/** 상품 그림(SVG)을 이미지 주소로 바꾼다. 선 색(currentColor)은 크림색으로 칠한다. */
export function artDataUri(art: GearArtValue) {
  const svg = toSvgString(<GearArt art={art} width={200} height={200} xmlns="http://www.w3.org/2000/svg" />).replaceAll("currentColor", "#fcf8ef");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const BARS = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];

/** 브라운관 화면처럼 꾸민 1200×630 공유 이미지 틀 */
export async function renderOg(children: ReactNode) {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#050505", padding: 28 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          borderRadius: 40,
          background: "radial-gradient(ellipse at 50% 40%, #262626 0%, #111111 65%, #0b0b0b 100%)",
          padding: "40px 56px",
          color: "#fcf8ef",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}>
          <div style={{ display: "flex", height: 26, borderRadius: 4, overflow: "hidden" }}>
            {BARS.map((color) => (
              <div key={color} style={{ width: 9, height: 26, background: color }} />
            ))}
          </div>
          My First Gear
        </div>
        {children}
      </div>
    </div>,
    { ...OG_SIZE, fonts: [{ name: "Pretendard", data: await fontData, weight: 700, style: "normal" }] },
  );
}
