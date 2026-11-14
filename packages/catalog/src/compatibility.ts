import type { PartCompat, PartKind, Product } from "./types";

/** PC 견적의 칸 순서 */
export const buildSlots: { part: PartKind; label: string; required: boolean }[] = [
  { part: "cpu", label: "CPU", required: true },
  { part: "mainboard", label: "메인보드", required: true },
  { part: "memory", label: "메모리", required: true },
  { part: "gpu", label: "그래픽카드", required: false },
  { part: "storage", label: "SSD", required: true },
  { part: "psu", label: "파워", required: true },
  { part: "case", label: "케이스", required: true },
  { part: "cooler", label: "쿨러", required: true },
];

export type Build = Partial<Record<PartKind, Product>>;

export type BuildIssue = {
  level: "error" | "warning";
  parts: PartKind[];
  message: string;
};

type CompatOf<K extends PartKind> = Extract<PartCompat, { part: K }>;

function compat<K extends PartKind>(build: Build, part: K): CompatOf<K> | undefined {
  const value = build[part]?.compat;
  return value?.part === part ? (value as CompatOf<K>) : undefined;
}

/** 메인보드, 드라이브, 팬 등 나머지 부품의 대략적인 소비 전력 */
const BASE_WATTS = 100;

export function estimateWatts(build: Build): number {
  return BASE_WATTS + (compat(build, "cpu")?.tdp ?? 0) + (compat(build, "gpu")?.tdp ?? 0);
}

/** 권장 파워 용량. 예상 소비 전력에 40% 여유를 두고 50W 단위로 올린다. */
export function recommendedWatts(build: Build): number {
  return Math.ceil((estimateWatts(build) * 1.4) / 50) * 50;
}

const boardLabel = { "E-ATX": "E-ATX", ATX: "ATX", mATX: "M-ATX", ITX: "ITX" } as const;

export function checkBuild(build: Build): BuildIssue[] {
  const issues: BuildIssue[] = [];
  const cpu = compat(build, "cpu");
  const board = compat(build, "mainboard");
  const memory = compat(build, "memory");
  const gpu = compat(build, "gpu");
  const psu = compat(build, "psu");
  const pcCase = compat(build, "case");
  const cooler = compat(build, "cooler");

  if (cpu && board && cpu.socket !== board.socket) {
    issues.push({
      level: "error",
      parts: ["cpu", "mainboard"],
      message: `CPU 소켓(${cpu.socket})과 메인보드 소켓(${board.socket})이 다릅니다.`,
    });
  }
  if (memory && board) {
    if (memory.memoryType !== board.memoryType) {
      issues.push({
        level: "error",
        parts: ["memory", "mainboard"],
        message: `메모리 규격(${memory.memoryType})을 메인보드가 지원하지 않습니다.`,
      });
    }
    if (memory.modules > board.memorySlots) {
      issues.push({
        level: "error",
        parts: ["memory", "mainboard"],
        message: `메모리 모듈 ${memory.modules}개가 메인보드 슬롯 ${board.memorySlots}개보다 많습니다.`,
      });
    }
  }
  if (board && pcCase && !pcCase.boards.includes(board.formFactor)) {
    issues.push({
      level: "error",
      parts: ["mainboard", "case"],
      message: `케이스가 ${boardLabel[board.formFactor]} 메인보드를 지원하지 않습니다.`,
    });
  }
  if (gpu && pcCase && gpu.lengthMm > pcCase.maxGpuLengthMm) {
    issues.push({
      level: "error",
      parts: ["gpu", "case"],
      message: `그래픽카드 길이 ${gpu.lengthMm}mm가 케이스 허용 길이 ${pcCase.maxGpuLengthMm}mm보다 깁니다.`,
    });
  }
  if (gpu && pcCase && gpu.slots > pcCase.maxGpuSlots) {
    issues.push({
      level: "error",
      parts: ["gpu", "case"],
      message: `그래픽카드 두께 ${gpu.slots}슬롯이 케이스가 받는 ${pcCase.maxGpuSlots}슬롯보다 두껍습니다.`,
    });
  }
  if (gpu && psu && gpu.powerConnector === "12V-2x6" && !psu.has12V2x6) {
    issues.push({
      level: "warning",
      parts: ["gpu", "psu"],
      message: "그래픽카드는 12V-2x6 전원 커넥터를 쓰는데 파워에 이 단자가 없습니다. 변환 케이블이 필요합니다.",
    });
  }
  if (cooler && pcCase && cooler.type === "air" && cooler.heightMm > pcCase.maxCoolerHeightMm) {
    issues.push({
      level: "error",
      parts: ["cooler", "case"],
      message: `쿨러 높이 ${cooler.heightMm}mm가 케이스 허용 높이 ${pcCase.maxCoolerHeightMm}mm보다 높습니다.`,
    });
  }
  if (cooler && cpu && !cooler.sockets.includes(cpu.socket)) {
    issues.push({
      level: "error",
      parts: ["cooler", "cpu"],
      message: `쿨러가 ${cpu.socket} 소켓을 지원하지 않습니다.`,
    });
  }
  if (cooler && cpu && cooler.tdpRating < cpu.tdp) {
    issues.push({
      level: "warning",
      parts: ["cooler", "cpu"],
      message: `쿨러 권장 TDP(${cooler.tdpRating}W)가 CPU TDP(${cpu.tdp}W)보다 낮습니다.`,
    });
  }
  if (psu && pcCase && !pcCase.psuFormFactors.includes(psu.formFactor)) {
    issues.push({
      level: "error",
      parts: ["psu", "case"],
      message: `케이스가 ${psu.formFactor} 파워를 지원하지 않습니다.`,
    });
  }
  if (psu && (cpu || gpu)) {
    const recommended = recommendedWatts(build);
    if (psu.wattage < estimateWatts(build)) {
      issues.push({
        level: "error",
        parts: ["psu"],
        message: `파워 ${psu.wattage}W가 예상 소비 전력 ${estimateWatts(build)}W보다 낮습니다.`,
      });
    } else if (psu.wattage < recommended) {
      issues.push({
        level: "warning",
        parts: ["psu"],
        message: `파워 여유가 부족합니다. ${recommended}W 이상을 권장합니다.`,
      });
    }
  }
  if (cpu && !gpu && !cpu.integratedGraphics) {
    issues.push({
      level: "error",
      parts: ["cpu", "gpu"],
      message: "내장 그래픽이 없는 CPU라 그래픽카드가 필요합니다.",
    });
  }

  return issues;
}

/** 지금 견적에 이 상품을 넣었을 때 새로 생기는 오류가 없는지 */
export function fitsBuild(build: Build, candidate: Product): boolean {
  const part = candidate.compat?.part;
  if (!part) return true;
  const next = { ...build, [part]: candidate };
  return !checkBuild(next).some((issue) => issue.level === "error" && issue.parts.includes(part));
}

export function buildTotal(build: Build): number {
  return Object.values(build).reduce((sum, product) => sum + (product?.price ?? 0), 0);
}
