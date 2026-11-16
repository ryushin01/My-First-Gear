"use client";

import { useEffect } from "react";
import { onBuildChange, readBuild, replaceBuild } from "@/entities/build";
import { onCartChange, readCart, replaceCart } from "@/entities/cart";
import { notifyMemberChanged, useMemberName } from "@/entities/member";
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
    // 저장하지 못해도(네트워크 끊김 등) 화면에는 영향이 없다. 다음에 바뀔 때 다시 저장한다.
    const saveCart = debounce(() => void saveMemberCartAction(readCart()).catch(() => undefined), 800);
    const saveBuild = debounce(() => void saveMemberBuildAction(readBuild()).catch(() => undefined), 800);

    if (!ready) {
      void loadMemberStateAction()
        .then((remote) => {
          if (!active || !remote) return;
          // 서버 세션이 사라져 서버가 쿠키를 지웠다. 머리글·찜·후기 폼을 로그인 전 모습으로 바꾼다.
          if (remote === "signed-out") {
            notifyMemberChanged();
            return;
          }
          replaceCart(mergeCart(readCart(), remote.cart));
          replaceBuild(mergeBuild(readBuild(), remote.build));
          loadedFor = member;
          ready = true;
          saveCart();
          saveBuild();
        })
        // 불러오지 못하면 이번 화면에서는 동기화하지 않는다. 다음 화면에서 다시 불러온다.
        .catch(() => undefined);
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
