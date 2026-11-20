import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import type { GearArtValue } from "@mfg/gear-art";
import { artSvg } from "@/shared/lib/art";

export const OG_SIZE = { width: 1200, height: 630 };

// 한글이 들어가므로 Satori가 읽을 수 있는 OTF 글꼴을 쓴다. 요청과 상관없으니 한 번만 읽는다.
const fontData = readFile(join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"));

// 머리글 로고는 사이트 머리글·파비콘과 같은 트로피 그림(public/brand/logo.png)을 그대로 읽는다. 로고 파일을 바꾸면 공유 이미지도 함께 바뀐다.
// 빌드가 이 경로를 추적해 이 파일을 쓰는 서버 함수마다 넣는다(.next/server/app/**/*.nft.json).
const logoSrc = readFile(join(process.cwd(), "public/brand/logo.png")).then((png) => `data:image/png;base64,${png.toString("base64")}`);

/** 상품 그림(SVG)을 이미지 주소로 바꾼다. 선 색은 화면 글자색으로 칠한다(artSvg). */
export function artDataUri(art: GearArtValue) {
  return `data:image/svg+xml;base64,${Buffer.from(artSvg(art)).toString("base64")}`;
}

/** 화면 네 모서리의 조준선 하나 (사이트 HUD 틀과 같은 모양) */
function Corner({ top, left }: { top: boolean; left: boolean }) {
  const line = "3px solid #f5f5f2";
  return (
    <div
      style={{
        position: "absolute",
        width: 34,
        height: 34,
        ...(top ? { top: 22, borderTop: line } : { bottom: 22, borderBottom: line }),
        ...(left ? { left: 22, borderLeft: line } : { right: 22, borderRight: line }),
      }}
    />
  );
}

/** 사이트처럼 검은 바탕에 네 모서리 조준선을 단 1200×630 공유 이미지 틀 */
export async function renderOg(children: ReactNode) {
  return new ImageResponse(
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#050505", padding: 28 }}>
      <Corner top left />
      <Corner top left={false} />
      <Corner top={false} left />
      <Corner top={false} left={false} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          background: "#0a0a0a",
          padding: "40px 56px",
          color: "#f5f5f2",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}>
          <div style={{ display: "flex", background: "#f5f5f2", color: "#050505", fontSize: 20, padding: "2px 10px" }}>SYS</div>
          <img src={await logoSrc} width={40} height={40} alt="" />
          My First Gear
        </div>
        {children}
      </div>
    </div>,
    { ...OG_SIZE, fonts: [{ name: "Pretendard", data: await fontData, weight: 700, style: "normal" }] },
  );
}
