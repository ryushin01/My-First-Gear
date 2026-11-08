"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mfg:fx";
const listeners = new Set<() => void>();

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** 움직이는 효과(노이즈, 깜빡임, 타임코드)를 켤지. 저장한 값이 없으면 OS의 동작 줄이기 설정을 따른다. */
function read(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === "on";
  } catch {
    // 저장소를 못 쓰면 OS 설정을 따른다.
  }
  return !prefersReducedMotion();
}

function apply(on: boolean) {
  document.documentElement.dataset.fx = on ? "on" : "off";
}

export function setEffects(on: boolean) {
  apply(on);
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // 저장하지 못해도 이번 화면에서는 적용한다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  apply(read());
  return () => listeners.delete(listener);
}

export function useEffectsOn(): boolean {
  return useSyncExternalStore(subscribe, read, () => true);
}
