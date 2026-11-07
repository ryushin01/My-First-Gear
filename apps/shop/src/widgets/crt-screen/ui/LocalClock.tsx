"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
}

/** 분 단위로 내림한 현재 시각. 같은 분 안에서는 같은 값을 돌려줘 다시 그리지 않는다. */
function getMinute() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

export function LocalClock() {
  const minute = useSyncExternalStore(subscribe, getMinute, () => null);

  if (minute === null) return <span aria-hidden="true">--:-- KST</span>;

  const now = new Date(minute);
  return <time dateTime={now.toISOString()}>{formatter.format(now)} KST</time>;
}
