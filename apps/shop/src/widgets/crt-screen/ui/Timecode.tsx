"use client";

import { useEffect, useState } from "react";
import { useEffectsOn } from "../model/effects";

function format(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** 페이지에 머문 시간을 VHS 타임코드처럼 보여준다. 장식이므로 보조기기에는 읽히지 않게 한다. */
export function Timecode() {
  const [seconds, setSeconds] = useState(0);
  const running = useEffectsOn(); // 효과를 끄면 멈춘다 (KWCAG 6.2.2)

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <span aria-hidden="true" className="font-mono tabular-nums">
      {format(seconds)}
    </span>
  );
}
