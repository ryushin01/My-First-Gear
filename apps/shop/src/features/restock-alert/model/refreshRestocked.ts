"use client";

import { callAction } from "@/shared/lib";
import { getRestockedCountAction } from "../api/actions";
import { applyRestockedCount, nextRestockRequest } from "./restockNotice";

/** 알림을 마치거나 바꾼 뒤 서버에서 수를 다시 받는다. 받지 못하면(연결 끊김) 그대로 두고 다음 불러오기 때 맞춘다. */
export async function refreshRestockedCount() {
  const request = nextRestockRequest();
  const next = await callAction(getRestockedCountAction, () => null);
  if (typeof next === "number") applyRestockedCount(request, next);
}
