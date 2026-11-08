"use server";

import { getDb, getMemberState, hasDatabase, saveMemberBuild, saveMemberCart, type StoredBuild, type StoredCartLine } from "@mfg/db";
import { getSessionUserId } from "@/entities/member/index.server";

const clean = (lines: StoredCartLine[]) =>
  lines
    .filter((l) => typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
    .slice(0, 50)
    .map((l) => ({ productId: l.productId.slice(0, 40), quantity: Math.min(l.quantity, 99) }));

export async function loadMemberStateAction(): Promise<{ cart: StoredCartLine[]; build: StoredBuild | null } | null> {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase()) return null;
  const state = await getMemberState(getDb(), userId);
  return { cart: state?.cart ?? [], build: state?.build ?? null };
}

export async function saveMemberCartAction(lines: StoredCartLine[]) {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase() || !Array.isArray(lines)) return;
  await saveMemberCart(getDb(), userId, clean(lines));
}

export async function saveMemberBuildAction(build: StoredBuild | null) {
  const userId = await getSessionUserId();
  if (userId === null || !hasDatabase()) return;
  const parts = Object.fromEntries(Object.entries(build?.parts ?? {}).filter(([, v]) => typeof v === "string").slice(0, 8));
  await saveMemberBuild(getDb(), userId, build ? { parts, services: (build.services ?? []).slice(0, 8) } : null);
}
