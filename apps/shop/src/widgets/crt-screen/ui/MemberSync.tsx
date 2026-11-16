"use client";

import { useEffect } from "react";
import { onBuildChange, readBuild, replaceBuild } from "@/entities/build";
import { onCartChange, readCart, replaceCart } from "@/entities/cart";
import { createMemberSaver, notifyMemberChanged, readMemberName, useMemberName } from "@/entities/member";
import { checkMemberSessionAction, loadMemberStateAction, saveMemberBuildAction, saveMemberCartAction } from "../api/memberSync";
import { mergeBuild, mergeCart } from "../model/merge";

// 화면이 바뀌어도 한 번만 불러오도록 모듈에 기억한다.
let loadedFor: string | null = null;
// 이미 불러온 회원이라도 서버 세션이 사라졌을 수 있다(데모 초기화, 만료). 화면을 옮길 때 1분에 한 번 확인한다.
const SESSION_CHECK_MS = 60_000;
let checkedAt = 0;

// 0.8초 모아서 저장한다. 화면을 옮겨도 남은 저장은 그대로 보내고, 로그아웃은 남은 저장을 먼저 보낸다(flushMemberSaves).
const cartSaver = createMemberSaver(() => saveMemberCartAction(readCart()));
const buildSaver = createMemberSaver(() => saveMemberBuildAction(readBuild()));

/** 서버 세션이 사라져 서버가 쿠키를 지웠다. 머리글·찜·후기 폼을 로그인 전 모습으로 바꾼다. */
function signedOut() {
  loadedFor = null;
  notifyMemberChanged();
}

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
    let active = true;
    let ready = loadedFor === member;

    if (!ready) {
      void loadMemberStateAction()
        .then((remote) => {
          // 응답을 기다리는 사이 로그아웃했으면 합치지 않는다(지운 회원 장바구니가 이 기기에 다시 남지 않게).
          if (!active || !remote || readMemberName() !== member) return;
          if (remote === "signed-out") return signedOut();
          replaceCart(mergeCart(readCart(), remote.cart));
          replaceBuild(mergeBuild(readBuild(), remote.build));
          loadedFor = member;
          checkedAt = Date.now();
          ready = true;
          cartSaver.schedule();
          buildSaver.schedule();
        })
        // 불러오지 못하면 이번 화면에서는 동기화하지 않는다. 다음 화면에서 다시 불러온다.
        .catch(() => undefined);
    } else if (Date.now() - checkedAt >= SESSION_CHECK_MS) {
      checkedAt = Date.now();
      void checkMemberSessionAction()
        .then((session) => {
          if (active && session === "signed-out") signedOut();
        })
        // 확인하지 못하면(네트워크 끊김 등) 다음 화면에서 다시 확인한다.
        .catch(() => {
          checkedAt = 0;
        });
    }
    // 저장하지 못해도(네트워크 끊김 등) 화면에는 영향이 없다. 다음에 바뀔 때 다시 저장한다.
    const offCart = onCartChange(() => ready && cartSaver.schedule());
    const offBuild = onBuildChange(() => ready && buildSaver.schedule());
    return () => {
      active = false;
      offCart();
      offBuild();
    };
  }, [member]);

  return null;
}
