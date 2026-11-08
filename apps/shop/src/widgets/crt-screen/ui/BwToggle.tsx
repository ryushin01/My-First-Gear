"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mfg:bw";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return document.documentElement.dataset.bw === "on";
  }
}

function write(on: boolean) {
  document.documentElement.dataset.bw = on ? "on" : "off";
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // 저장이 막혀 있어도 이번 화면에서는 토글이 동작한다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  document.documentElement.dataset.bw = read() ? "on" : "off";
  return () => listeners.delete(listener);
}

/** 화면 전체를 흑백으로 바꾸는 토글. 상태는 aria-pressed로 알린다. */
export function BwToggle() {
  const on = useSyncExternalStore(subscribe, read, () => false);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => write(!on)}
      className="min-h-8 justify-self-start font-mono uppercase text-label hover:text-cream"
    >
      B&amp;W <span aria-hidden="true">[{on ? "ON" : "OFF"}]</span>
    </button>
  );
}
