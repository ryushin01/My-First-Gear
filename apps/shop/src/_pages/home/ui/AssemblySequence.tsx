import type { CSSProperties } from "react";
import { AssemblyRig } from "./AssemblyRig";

const STEPS = [
  { label: "01", title: "메인보드와 CPU", body: "ROG MAXIMUS Z690 EXTREME의 LGA1700 소켓에 i9-12900K를 꽂습니다." },
  { label: "02", title: "메모리와 SSD", body: "DDR5 16GB 네 개로 64GB를 채우고, 980 PRO NVMe 세 개를 M.2 슬롯에 넣습니다." },
  { label: "03", title: "수랭 쿨러", body: "NZXT KRAKEN Z73 360mm 라디에이터를 위에 달고, LCD 펌프를 CPU 위에 얹습니다." },
  { label: "04", title: "그래픽카드와 파워", body: "RTX 3090을 세로 거치대와 라이저 케이블로 세우고, 1200W 파워로 안텍 토크 화이트를 완성합니다." },
];

/**
 * 애플 제품 페이지처럼 화면을 고정해 두고, 스크롤에 따라 부품이 케이스 안으로 모이는 조립 장면.
 * 움직임은 CSS 스크롤 타임라인으로만 만든다. 지원하지 않는 브라우저, 동작 줄이기, 효과 끄기에서는
 * 다 조립된 그림과 단계 목록을 그대로 보여 준다.
 */
export function AssemblySequence() {
  return (
    <section aria-labelledby="home-assembly" className="assembly-seq">
      <div className="assembly-stage">
        <div className="assembly-copy flex flex-col gap-4">
          <p className="mono-label">[Assembly Sequence]</p>
          <h2 id="home-assembly" className="assembly-title font-display text-4xl md:text-6xl">
            흩어진 부품이
            <br />
            한 대의 PC가 되기까지
          </h2>
          <ol className="assembly-steps">
            {STEPS.map((step, i) => (
              <li key={step.label} className="assembly-step" style={{ "--i": i } as CSSProperties}>
                <span className="font-mono text-xs text-brand">{step.label}</span>
                <span className="text-lg text-cream">{step.title}</span>
                <span className="text-sm text-mute-100">{step.body}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="assembly-figure" aria-hidden="true">
          <AssemblyRig className="assembly-rig" />
          <span className="assembly-progress" />
        </div>
      </div>
    </section>
  );
}
