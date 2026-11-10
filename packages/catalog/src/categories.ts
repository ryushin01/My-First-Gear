import type { Category, CategoryGroup, CategoryId } from "./types";

export const categoryGroups: CategoryGroup[] = [
  { id: "pc-parts", name: "PC 부품", code: "PC PARTS" },
  { id: "peripherals", name: "주변기기", code: "PERIPHERALS" },
  { id: "desk-setup", name: "데스크 셋업", code: "DESK SETUP" },
  { id: "computers", name: "컴퓨터", code: "COMPUTERS" },
  { id: "audio", name: "오디오", code: "AUDIO" },
  { id: "play", name: "게임", code: "PLAY" },
  { id: "ride", name: "탈것", code: "RIDE" },
  { id: "watch", name: "시계", code: "WATCH" },
  { id: "outdoor", name: "아웃도어", code: "OUTDOOR" },
];

export const categories: Category[] = [
  { id: "cpu", group: "pc-parts", name: "CPU", code: "CPU" },
  { id: "mainboard", group: "pc-parts", name: "메인보드", code: "MAINBOARD" },
  { id: "memory", group: "pc-parts", name: "메모리", code: "MEMORY" },
  { id: "gpu", group: "pc-parts", name: "그래픽카드", code: "GPU" },
  { id: "storage", group: "pc-parts", name: "SSD", code: "STORAGE" },
  { id: "psu", group: "pc-parts", name: "파워", code: "PSU" },
  { id: "case", group: "pc-parts", name: "케이스", code: "CASE" },
  { id: "cooler", group: "pc-parts", name: "쿨러", code: "COOLER" },
  { id: "keyboard", group: "peripherals", name: "키보드", code: "KEYBOARD" },
  { id: "monitor", group: "peripherals", name: "게이밍 모니터", code: "MONITOR" },
  { id: "mouse", group: "peripherals", name: "마우스", code: "MOUSE" },
  { id: "chair", group: "desk-setup", name: "의자", code: "CHAIR" },
  { id: "desk", group: "desk-setup", name: "책상", code: "DESK" },
  { id: "monitor-arm", group: "desk-setup", name: "모니터암", code: "MONITOR ARM" },
  { id: "lighting", group: "desk-setup", name: "조명", code: "LIGHTING" },
  { id: "laptop", group: "computers", name: "노트북", code: "LAPTOP" },
  { id: "dap", group: "audio", name: "DAP", code: "DAP" },
  { id: "earphone", group: "audio", name: "이어폰", code: "EARPHONE" },
  { id: "headphone", group: "audio", name: "헤드폰", code: "HEADPHONE" },
  { id: "speaker", group: "audio", name: "스피커", code: "SPEAKER" },
  { id: "microphone", group: "audio", name: "마이크", code: "MIC" },
  { id: "console", group: "play", name: "게임기", code: "CONSOLE" },
  { id: "bicycle", group: "ride", name: "자전거", code: "BICYCLE" },
  { id: "motorcycle", group: "ride", name: "모터사이클", code: "MOTORCYCLE" },
  { id: "car", group: "ride", name: "자동차", code: "CAR" },
  { id: "watch", group: "watch", name: "시계", code: "WATCH" },
  { id: "camping", group: "outdoor", name: "캠핑", code: "CAMPING" },
];

const byId = new Map(categories.map((category) => [category.id, category]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

export function isCategoryId(value: string): value is CategoryId {
  return byId.has(value as CategoryId);
}

/** 채널 번호. 카테고리 순서대로 01부터 붙인다. */
export function channelOf(id: CategoryId): string {
  return String(categories.findIndex((category) => category.id === id) + 1).padStart(2, "0");
}
