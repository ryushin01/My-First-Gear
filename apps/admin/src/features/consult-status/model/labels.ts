import type { ConsultStatus } from "@mfg/db";

export const consultStatusLabel: Record<ConsultStatus, string> = { new: "새 신청", contacted: "연락함", closed: "종료" };
