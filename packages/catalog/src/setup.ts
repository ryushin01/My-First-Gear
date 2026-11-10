import { getProductById } from "./queries";
import { products } from "./products";
import type { CategoryId, Product } from "./types";

/*
 * 데스크 셋업 조합: 책상, 의자, 모니터, 모니터암, 조명, 입력·음향 장비를 칸마다 하나씩 고른다.
 * 치수와 무게는 제조사 공개 값을 반올림한 대략값이며, 조합 안내에만 쓴다.
 */

export type SetupSlotId = "desk" | "chair" | "monitor" | "monitor-arm" | "lighting" | "keyboard" | "mouse" | "speaker" | "microphone";

export type SetupSlot = { id: SetupSlotId; label: string; categoryId: CategoryId };

export const setupSlots: SetupSlot[] = [
  { id: "desk", label: "책상", categoryId: "desk" },
  { id: "chair", label: "의자", categoryId: "chair" },
  { id: "monitor", label: "모니터", categoryId: "monitor" },
  { id: "monitor-arm", label: "모니터암", categoryId: "monitor-arm" },
  { id: "lighting", label: "조명", categoryId: "lighting" },
  { id: "keyboard", label: "키보드", categoryId: "keyboard" },
  { id: "mouse", label: "마우스", categoryId: "mouse" },
  { id: "speaker", label: "스피커", categoryId: "speaker" },
  { id: "microphone", label: "마이크", categoryId: "microphone" },
];

type MonitorSize = { inch: number; widthMm: number; weightKg: number; curved: boolean };
type ArmSpec = { maxInch: number; minKg: number; maxKg: number; monitors: 1 | 2 };
type DeskSpec = { widthMm: number };

/** 모니터 크기: 화면 대각선, 스탠드 뺀 폭과 무게 */
export const monitorSizes: Record<string, MonitorSize> = {
  "samsung-odyssey-oled-g9": { inch: 49, widthMm: 1195, weightKg: 9.6, curved: true },
  "lg-ultragear-oled-32gs95ue": { inch: 31.5, widthMm: 715, weightKg: 5.6, curved: false },
  "asus-rog-swift-oled-pg27ucdm": { inch: 26.5, widthMm: 605, weightKg: 4.6, curved: false },
  "alienware-aw3423dwf": { inch: 34, widthMm: 815, weightKg: 6.2, curved: true },
  "samsung-odyssey-oled-g8-g80sd": { inch: 32, widthMm: 712, weightKg: 5.2, curved: false },
  "samsung-odyssey-neo-g7-43": { inch: 43, widthMm: 963, weightKg: 11.6, curved: false },
  "alienware-aw2725df": { inch: 27, widthMm: 608, weightKg: 4.3, curved: false },
};

/** 모니터암이 받치는 화면 크기와 무게 (모니터 한 대 기준) */
export const armSpecs: Record<string, ArmSpec> = {
  "camelmount-cma-2p": { maxInch: 32, minKg: 2, maxKg: 9, monitors: 2 },
  "ergotron-lx": { maxInch: 34, minKg: 3.2, maxKg: 11.3, monitors: 1 },
  "fellowes-flex-1fm": { maxInch: 32, minKg: 2, maxKg: 8, monitors: 1 },
};

export const deskSpecs: Record<string, DeskSpec> = {
  "secretlab-magnus-pro": { widthMm: 1500 },
  "desker-motion-desk-1600": { widthMm: 1600 },
  "linak-dl6-dual-motor": { widthMm: 1800 },
  "maywood-homage-motion-desk": { widthMm: 1600 },
};

/** 모니터 옆에 남길 여유: 북셸프 스피커 두 대(대당 약 150~200mm)를 놓을 자리 */
export const SPEAKER_ROOM_MM = 400;

export type Setup = Partial<Record<SetupSlotId, Product>>;

export type SetupIssue = { level: "error" | "warning"; slots: SetupSlotId[]; message: string };

export function checkSetup(setup: Setup): SetupIssue[] {
  const issues: SetupIssue[] = [];
  const monitor = setup.monitor ? monitorSizes[setup.monitor.slug] : undefined;
  const arm = setup["monitor-arm"] ? armSpecs[setup["monitor-arm"].slug] : undefined;
  const desk = setup.desk ? deskSpecs[setup.desk.slug] : undefined;

  if (monitor && arm) {
    if (monitor.inch > arm.maxInch) {
      issues.push({
        level: "error",
        slots: ["monitor", "monitor-arm"],
        message: `모니터암은 ${arm.maxInch}인치까지 받칩니다. 모니터는 ${monitor.inch}인치입니다.`,
      });
    } else if (monitor.weightKg > arm.maxKg || monitor.weightKg < arm.minKg) {
      issues.push({
        level: "error",
        slots: ["monitor", "monitor-arm"],
        message: `모니터암은 ${arm.minKg}~${arm.maxKg}kg을 받칩니다. 모니터는 약 ${monitor.weightKg}kg입니다.`,
      });
    }
    if (arm.monitors === 2) {
      issues.push({
        level: "warning",
        slots: ["monitor-arm"],
        message: "듀얼 모니터암입니다. 같은 모니터를 한 대 더 담거나 쓰던 모니터를 함께 다세요.",
      });
    }
  }

  if (monitor && desk) {
    if (monitor.widthMm > desk.widthMm) {
      issues.push({
        level: "error",
        slots: ["monitor", "desk"],
        message: `모니터 폭(약 ${monitor.widthMm}mm)이 책상 폭(${desk.widthMm}mm)보다 넓습니다.`,
      });
    } else if (setup.speaker && monitor.widthMm + SPEAKER_ROOM_MM > desk.widthMm) {
      issues.push({
        level: "warning",
        slots: ["monitor", "desk", "speaker"],
        message: `모니터 옆 자리가 ${desk.widthMm - monitor.widthMm}mm뿐이라 스피커를 놓기 빠듯합니다. 스피커 스탠드나 더 넓은 책상을 고려하세요.`,
      });
    }
  }

  if (setup.lighting?.slug === "benq-screenbar-halo-2" && !setup.monitor) {
    issues.push({ level: "warning", slots: ["lighting", "monitor"], message: "스크린바는 모니터 위에 거는 조명입니다. 모니터도 골라 주세요." });
  }

  return issues;
}

export function setupTotal(setup: Setup): number {
  return Object.values(setup).reduce((sum, product) => sum + (product?.price ?? 0), 0);
}

export type SetupState = Partial<Record<SetupSlotId, string>>;

export function toSetup(state: SetupState, catalog: Product[] = products): Setup {
  const setup: Setup = {};
  for (const slot of setupSlots) {
    const id = state[slot.id];
    const product = id ? getProductById(id, catalog) : undefined;
    if (product && product.categoryId === slot.categoryId) setup[slot.id] = product;
  }
  return setup;
}

/** 공유 주소에 담을 문자열. 예: desk:p-desk-001,chair:p-chair-001 */
export function encodeSetup(state: SetupState): string {
  return setupSlots
    .filter((slot) => state[slot.id])
    .map((slot) => `${slot.id}:${state[slot.id]}`)
    .join(",");
}

export function decodeSetup(value: string): SetupState | null {
  const state: SetupState = {};
  for (const pair of value.split(",")) {
    const [slotId, id] = pair.split(":");
    const slot = setupSlots.find((s) => s.id === slotId);
    const product = id ? getProductById(id) : undefined;
    if (slot && product?.categoryId === slot.categoryId) state[slot.id] = id;
  }
  return Object.keys(state).length > 0 ? state : null;
}
