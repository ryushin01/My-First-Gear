/** 상품 그림 종류. @mfg/gear-art가 종류별로 SVG를 그린다. */
export type ArtKind =
  | "cpu"
  | "mainboard"
  | "memory"
  | "gpu"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "keyboard"
  | "monitor"
  | "laptop"
  | "dap"
  | "earphone"
  | "headphone"
  | "console"
  | "bicycle"
  | "motorcycle"
  | "car"
  | "watch";

export type GearArt = {
  kind: ArtKind;
  /** 강조 색. 그림의 포인트와 테이프 표지 색으로 쓴다. */
  accent: string;
  /** 같은 종류 안에서 모양을 바꾸는 값 (예: 자동차의 sedan, supercar) */
  variant?: string;
  /** 실사풍 그림 키 (상품 slug). @mfg/gear-art에 그림이 있으면 그것을 쓴다. */
  model?: string;
};

export type CategoryGroupId = "pc-parts" | "peripherals" | "computers" | "audio" | "play" | "ride" | "watch";

export type CategoryId =
  | "cpu"
  | "mainboard"
  | "memory"
  | "gpu"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "keyboard"
  | "monitor"
  | "laptop"
  | "dap"
  | "earphone"
  | "headphone"
  | "console"
  | "bicycle"
  | "motorcycle"
  | "car"
  | "watch";

export type Category = {
  id: CategoryId;
  group: CategoryGroupId;
  name: string;
  /** 테이프 라벨과 채널 번호에 쓰는 짧은 영문 이름 */
  code: string;
};

export type CategoryGroup = {
  id: CategoryGroupId;
  name: string;
  code: string;
};

export type Socket = "AM5" | "LGA1851";
export type MemoryType = "DDR5";
export type BoardFormFactor = "ATX" | "mATX" | "ITX";
export type PsuFormFactor = "ATX" | "SFX";

/** PC 견적에서 호환성을 따질 때 쓰는 부품 값 */
export type PartCompat =
  | { part: "cpu"; socket: Socket; memoryType: MemoryType; tdp: number; integratedGraphics: boolean }
  | { part: "mainboard"; socket: Socket; memoryType: MemoryType; formFactor: BoardFormFactor; memorySlots: number }
  | { part: "memory"; memoryType: MemoryType; modules: number; capacityGb: number }
  | { part: "gpu"; lengthMm: number; tdp: number; powerConnector: "8pin" | "12V-2x6"; slots: number }
  | { part: "storage"; interface: "NVMe" | "SATA" }
  | { part: "psu"; wattage: number; formFactor: PsuFormFactor; has12V2x6: boolean }
  | {
      part: "case";
      boards: BoardFormFactor[];
      maxGpuLengthMm: number;
      maxCoolerHeightMm: number;
      maxGpuSlots: number;
      psuFormFactors: PsuFormFactor[];
    }
  | { part: "cooler"; sockets: Socket[]; type: "air" | "liquid"; heightMm: number; tdpRating: number };

export type PartKind = PartCompat["part"];

export type Spec = { label: string; value: string };

/** cart: 장바구니로 구매, consult: 상담 신청 (자동차, 모터사이클처럼 고가 상품) */
export type PurchaseMode = "cart" | "consult";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: CategoryId;
  /** 판매가 (원). 가상 가격이다. */
  price: number;
  /** 정가 (원). 할인이 있을 때만 */
  listPrice?: number;
  stock: number;
  purchaseMode: PurchaseMode;
  art: GearArt;
  /** 테이프 표지와 목록에 쓰는 한 줄 소개 */
  tagline: string;
  description: string;
  specs: Spec[];
  compat?: PartCompat;
  rating: number;
  reviewCount: number;
  /** 판매량 순위 (작을수록 많이 팔림) */
  salesRank: number;
  releasedAt: string;
  featured?: boolean;
};
