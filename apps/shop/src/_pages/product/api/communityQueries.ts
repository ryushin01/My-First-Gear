import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, hasDatabase, listQuestions, listReviews } from "@mfg/db";

export const communityTag = (productId: string) => `community:${productId}`;

export async function getReviews(productId: string) {
  "use cache";
  cacheTag(communityTag(productId));
  cacheLife("minutes");
  if (!hasDatabase()) return [];
  return listReviews(getDb(), productId);
}

export async function getQuestions(productId: string) {
  "use cache";
  cacheTag(communityTag(productId));
  cacheLife("minutes");
  if (!hasDatabase()) return [];
  return listQuestions(getDb(), productId);
}
