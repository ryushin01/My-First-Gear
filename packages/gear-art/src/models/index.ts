import type { ReactNode } from "react";
import { deskModels } from "./desk";
import { deviceModels } from "./devices";
import { outdoorModels } from "./outdoor";
import { pcModels } from "./pc";
import { premiumModels } from "./premium";
import { vehicleModels } from "./vehicles";
import { watchModels } from "./watches";

/** 상품별 실사풍 그림 (키: 상품 slug). 없으면 종류별 선 그림을 쓴다. */
export const models: Record<string, () => ReactNode> = {
  ...pcModels,
  ...premiumModels,
  ...deviceModels,
  ...vehicleModels,
  ...watchModels,
  ...outdoorModels,
  ...deskModels,
};
