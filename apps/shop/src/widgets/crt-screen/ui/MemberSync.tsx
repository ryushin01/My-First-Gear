"use client";

import { useEffect } from "react";
import { onBuildChange, readBuild, replaceBuild } from "@/entities/build";
import { onCartChange, readCart, replaceCart } from "@/entities/cart";
import { useMemberName } from "@/entities/member";
import { loadMemberStateAction, saveMemberBuildAction, saveMemberCartAction } from "../api/memberSync";
import { mergeBuild, mergeCart } from "../model/merge";

// 화면이 바뀌어도 한 번만 불러오도록 모듈에 기억한다.
let loadedFor: string | null = null;

function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
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
    const saveCart = debounce(() => void saveMemberCartAction(readCart()), 800);
    const saveBuild = debounce(() => void saveMemberBuildAction(readBuild()), 800);

    if (!ready) {
      void loadMemberStateAction().then((remote) => {
        if (!active || !remote) return;
        replaceCart(mergeCart(readCart(), remote.cart));
        replaceBuild(mergeBuild(readBuild(), remote.build));
        loadedFor = member;
        ready = true;
        saveCart();
        saveBuild();
      });
    }
    const offCart = onCartChange(() => ready && saveCart());
    const offBuild = onBuildChange(() => ready && saveBuild());
    return () => {
      active = false;
      offCart();
      offBuild();
    };
  }, [member]);

  return null;
}
