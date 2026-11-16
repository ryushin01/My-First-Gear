"use client";

import { useEffect } from "react";
import { forgetBuild, onBuildChange, readBuild, replaceBuild } from "@/entities/build";
import { clearCart, onCartChange, readCart, replaceCart } from "@/entities/cart";
import { createMemberSaver, notifyMemberChanged, readMemberName, setMemberSyncHandler, useMemberName } from "@/entities/member";
import { checkMemberSessionAction, loadMemberStateAction, saveMemberBuildAction, saveMemberCartAction, type SaveResult } from "../api/memberSync";
import { mergeBuild, mergeCart } from "../model/merge";

type LoadOutcome = "merged" | "signed-out" | "off" | "stale";

// 화면이 바뀌어도 한 번만 불러오도록 모듈에 기억한다. 서버 값과 합친 회원의 이름.
let loadedFor: string | null = null;
// 불러오는 중인 요청. 화면을 옮겨 다시 붙거나 로그아웃이 기다릴 때 같은 요청을 함께 쓴다.
let loading: { member: string; done: Promise<LoadOutcome> } | null = null;
// 이미 불러온 회원이라도 서버 세션이 사라졌을 수 있다(데모 초기화, 만료). 화면을 옮길 때 1분에 한 번 확인한다.
const SESSION_CHECK_MS = 60_000;
let checkedAt = 0;

// 0.8초 모아서 저장한다. 화면을 옮겨도 남은 저장은 그대로 보낸다.
const cartSaver = createMemberSaver(async () => settle(await saveMemberCartAction(readCart())));
const buildSaver = createMemberSaver(async () => settle(await saveMemberBuildAction(readBuild())));

/**
 * 서버 세션이 끝났다(서버가 쿠키를 지웠다). 로그아웃과 같이 이 기기의 회원 장바구니·견적을 지우고
 * (공용 컴퓨터에서 다음 사람의 계정에 합쳐지지 않게) 머리글·찜·후기 폼을 로그인 전 모습으로 바꾼다.
 * 서버에 저장한 값은 다시 로그인하면 돌아온다.
 */
function signedOut() {
  loadedFor = null;
  // 남은 저장은 버린다(보낼 곳이 없다).
  cartSaver.cancel();
  buildSaver.cancel();
  clearCart();
  forgetBuild();
  notifyMemberChanged();
}

/** 세션이 끝났으면 로그인 전 모습으로 바꾼다. 세션이 끝났거나 DB가 없으면 더 저장할 곳이 없으므로 끝난 것으로 본다. */
function settle(result: SaveResult) {
  if (result === "signed-out") signedOut();
}

/** 서버에 저장한 값과 이 기기의 값을 합친다(같은 상품은 많은 수량). 불러오는 사이 이 기기에서 바꾼 것도 함께 합쳐 저장한다. */
function loadAndMerge(member: string): Promise<LoadOutcome> {
  if (loading?.member === member) return loading.done;
  const done = loadMemberStateAction()
    .then((remote): LoadOutcome => {
      // 응답을 기다리는 사이 로그아웃했으면 합치지 않는다(지운 회원 장바구니가 이 기기에 다시 남지 않게).
      if (readMemberName() !== member) return "stale";
      if (!remote) return "off";
      if (remote === "signed-out") {
        signedOut();
        return "signed-out";
      }
      replaceCart(mergeCart(readCart(), remote.cart));
      replaceBuild(mergeBuild(readBuild(), remote.build));
      loadedFor = member;
      checkedAt = Date.now();
      cartSaver.schedule();
      buildSaver.schedule();
      return "merged";
    })
    .finally(() => {
      // 그사이 다른 회원의 요청이 시작됐으면(다른 탭에서 로그인) 그 기록은 남긴다.
      if (loading?.done === done) loading = null;
    });
  loading = { member, done };
  return done;
}

/**
 * 로그아웃 전에 부른다(flushMemberSaves). 아직 합치지 못했으면(불러오는 중이거나 실패) 지금 합치고,
 * 모아 둔 저장을 바로 보낸다. 서버가 받았거나 더 저장할 곳이 없으면(세션 끝남, DB 없음) true.
 */
async function syncNow(): Promise<boolean> {
  const member = readMemberName();
  if (!member) return true;
  if (loadedFor !== member) {
    const outcome = await loadAndMerge(member).catch(() => null);
    if (outcome === null) return false;
    if (outcome !== "merged") return true;
  }
  const saved = await Promise.all([cartSaver.flush(), buildSaver.flush()]);
  return saved.every(Boolean);
}
setMemberSyncHandler(syncNow);

/**
 * 로그인한 회원의 장바구니·PC 견적을 서버와 맞춘다. 화면에는 아무것도 그리지 않는다.
 * 로그인하면 서버에 저장한 값과 이 기기의 값을 합치고, 그 뒤로는 바뀔 때마다 저장한다.
 */
export function MemberSync() {
  const member = useMemberName();

  useEffect(() => {
    if (!member) {
      loadedFor = null;
      return;
    }
    if (loadedFor !== member) {
      // 불러오지 못하면 이번 화면에서는 동기화하지 않는다. 다음 화면이나 로그아웃 때 다시 불러온다.
      void loadAndMerge(member).catch(() => undefined);
    } else if (Date.now() - checkedAt >= SESSION_CHECK_MS) {
      checkedAt = Date.now();
      void checkMemberSessionAction()
        .then((session) => {
          if (session === "signed-out") signedOut();
        })
        // 확인하지 못하면(네트워크 끊김 등) 다음 화면에서 다시 확인한다.
        .catch(() => {
          checkedAt = 0;
        });
    }
    // 합친 뒤에 바뀐 것만 따로 저장한다(합치기 전에 바뀐 것은 합칠 때 함께 저장한다).
    // 저장하지 못해도(네트워크 끊김 등) 화면에는 영향이 없다. 다음에 바뀔 때나 로그아웃 때 다시 보낸다.
    const offCart = onCartChange(() => loadedFor === member && cartSaver.schedule());
    const offBuild = onBuildChange(() => loadedFor === member && buildSaver.schedule());
    return () => {
      offCart();
      offBuild();
    };
  }, [member]);

  return null;
}
