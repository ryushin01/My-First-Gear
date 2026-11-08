"use client";

import { setEffects, useEffectsOn } from "../model/effects";

/** 움직이는 효과를 멈추는 토글 (KWCAG 6.2.2 정지). 상태는 aria-pressed로 알린다. */
export function FxToggle() {
  const on = useEffectsOn();
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setEffects(!on)}
      className="min-h-8 justify-self-start font-mono uppercase text-label hover:text-cream"
    >
      효과 <span aria-hidden="true">[{on ? "ON" : "OFF"}]</span>
    </button>
  );
}
