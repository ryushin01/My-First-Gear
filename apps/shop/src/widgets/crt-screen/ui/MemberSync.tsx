"use client";

import { useEffect } from "react";
import { forgetBuild, onBuildChange, readBuild, replaceBuild } from "@/entities/build";
import { clearCart, onCartChange, readCart, replaceCart } from "@/entities/cart";
import { createMemberSaver, notifyMemberChanged, readMemberName, setMemberSyncHandler, useMemberName } from "@/entities/member";
import { applyRestockedCount, nextRestockRequest, resetRestockedCount } from "@/features/restock-alert";
import { checkMemberSessionAction, loadMemberStateAction, saveMemberBuildAction, saveMemberCartAction, type SaveResult } from "../api/memberSync";
import { readDeviceOwner, writeDeviceOwner } from "../model/deviceOwner";
import { mergeBuild, mergeCart } from "../model/merge";

type LoadOutcome = "merged" | "signed-out" | "off" | "stale";

// 화면이 바뀌어도 한 번만 불러오도록 모듈에 기억한다. 서버 값과 합친 회원의 이름과 표식.
let loadedFor: string | null = null;
let owner: string | null = null;
// 불러오는 중인 요청. 화면을 옮겨 다시 붙거나 로그아웃이 기다릴 때 같은 요청을 함께 쓴다.
let loading: { member: string; done: Promise<LoadOutcome> } | null = null;
// 이미 불러온 회원이라도 서버 세션이 사라졌을 수 있다(데모 초기화, 만료). 화면을 옮길 때 1분에 한 번 확인한다.
const SESSION_CHECK_MS = 60_000;
let checkedAt = 0;

// 0.8초 모아서 저장한다. 화면을 옮겨도 남은 저장은 그대로 보낸다. 합친 회원의 표식을 함께 보내,
// 그사이 다른 회원으로 바뀌었으면 서버가 저장하지 않는다.
const cartSaver = createMemberSaver(async () => {
  const saving = owner;
  if (saving) settle(await saveMemberCartAction(saving, readCart()), saving);
});
const buildSaver = createMemberSaver(async () => {
  const saving = owner;
  if (saving) settle(await saveMemberBuildAction(saving, readBuild()), saving);
});

/** 이 기기의 회원 장바구니·견적과 남은 저장을 버린다(공용 컴퓨터에서 다음 사람에게 보이거나 그 사람 계정에 합쳐지지 않게). */
function forgetMemberData() {
  cartSaver.cancel();
  buildSaver.cancel();
  clearCart();
  forgetBuild();
  writeDeviceOwner(null);
}

/** 이 탭이 기억한 회원을 잊는다. 다음에 붙을 때 지금 회원으로 다시 불러온다. */
function resetSync() {
  loadedFor = null;
  owner = null;
}

/**
 * 서버 세션이 끝났다(서버가 쿠키를 지웠다). 로그아웃과 같이 이 기기의 회원 값을 지우고
 * 머리글·찜·후기 폼을 로그인 전 모습으로 바꾼다. 서버에 저장한 값은 다시 로그인하면 돌아온다.
 */
function signedOut() {
  resetSync();
  forgetMemberData();
  notifyMemberChanged();
}

/**
 * 저장 결과를 확인한다. 세션이 끝났거나 DB가 없으면 더 저장할 곳이 없으므로 끝난 것으로 본다.
 * 다른 회원으로 바뀌었으면(다른 탭에서 로그인) 이 탭의 저장만 멈추고, 이 기기의 값은 그 회원으로 불러올 때 가린다.
 */
function settle(result: SaveResult, saving: string) {
  // 응답을 기다리는 사이 다른 회원으로 바뀌었으면(다른 탭에서 로그인) 이전 회원의 저장 결과는 무시한다.
  if (saving !== owner) return;
  if (result === "signed-out") signedOut();
  if (result === "other-member") {
    resetSync();
    cartSaver.cancel();
    buildSaver.cancel();
    notifyMemberChanged();
  }
}

/** 서버에 저장한 값과 이 기기의 값을 합친다(같은 상품은 많은 수량). 불러오는 사이 이 기기에서 바꾼 것도 함께 합쳐 저장한다. */
function loadAndMerge(member: string): Promise<LoadOutcome> {
  if (loading?.member === member) return loading.done;
  const restockRequest = nextRestockRequest();
  const done = loadMemberStateAction()
    .then((remote): LoadOutcome => {
      // 서버 세션이 끝났다. 서버가 같은 응답에서 회원 쿠키를 지우므로(이름이 null) 그때도 정리한다.
      // 그사이 다른 회원으로 로그인했으면(다른 탭) 그 회원의 값을 지우지 않는다.
      if (remote === "signed-out") {
        const now = readMemberName();
        if (now !== null && now !== member) return "stale";
        signedOut();
        return "signed-out";
      }
      // 응답을 기다리는 사이 로그아웃했으면 합치지 않는다(지운 회원 장바구니가 이 기기에 다시 남지 않게).
      if (readMemberName() !== member) return "stale";
      if (!remote) return "off";
      // 이 기기의 값이 다른 회원 것이면(로그아웃하지 않고 다른 회원으로 로그인) 합치지 않고 버린다. 손님 값은 합친다.
      const deviceOwner = readDeviceOwner();
      if (deviceOwner !== null && deviceOwner !== remote.owner) forgetMemberData();
      applyRestockedCount(restockRequest, remote.restocked);
      replaceCart(mergeCart(readCart(), remote.cart));
      replaceBuild(mergeBuild(readBuild(), remote.build));
      writeDeviceOwner(remote.owner);
      owner = remote.owner;
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
      // 처음 그릴 때(하이드레이션)는 서버 값(null)으로 한 번 그려진다. 쿠키를 직접 읽어 정말 로그인하지 않았을 때만 정리한다.
      if (readMemberName() !== null) return;
      resetSync();
      resetRestockedCount();
      // 회원 쿠키가 없는데 회원 값이 남아 있으면(세션이 끝난 뒤 다시 온 경우) 지운다. 손님 값은 그대로 둔다.
      if (readDeviceOwner() !== null) forgetMemberData();
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
